import type { SupabaseClient } from "@supabase/supabase-js";

import { supabase } from "@/src/lib/supabase";
import { createTripNotificationEvents } from "@/src/features/notifications/api";
import { logFriendlyError } from "@/src/lib/friendlyAlert";
import type { Database } from "@/src/types/supabase";

type ArrivalVerificationInsert =
  Database["public"]["Tables"]["arrival_verifications"]["Insert"];
type TripUpdate = Database["public"]["Tables"]["trips"]["Update"];
type WatseoSupabaseClient = SupabaseClient<Database>;

type ResolvedTripDestination = {
  tripId: string;
  destinationId: string;
  destinationName: string;
};

type ArrivalFailureReason =
  | "missing_input"
  | "trip_not_found"
  | "destination_not_found"
  | "token_mismatch"
  | "already_arrived"
  | "trip_cancelled"
  | "verification_insert_failed"
  | "trip_update_failed"
  | "unknown";

export type TripArrivalInput = {
  tripId: string;
  userId: string;
  qrToken: string;
};

export type CheckTripArrivalQrResult =
  | { ok: true; tripId: string; destinationName: string }
  | { ok: false; reason: ArrivalFailureReason; error?: unknown };

export type ConfirmTripArrivalResult =
  | { ok: true; tripId: string }
  | { ok: false; reason: ArrivalFailureReason; error?: unknown };

function getSupabaseClient(): WatseoSupabaseClient {
  if (!supabase) {
    throw new Error("Supabase 환경변수가 설정되지 않았어요.");
  }

  return supabase;
}

function normalizeQrToken(qrToken: string) {
  return qrToken.trim();
}

/**
 * trip + destination 을 조회하고 QR 토큰 일치 여부를 검증한다(쓰기 없음).
 * 1단계(검증)와 2단계(최종 저장)에서 공통으로 사용한다.
 */
async function resolveTripDestinationByQr(
  client: WatseoSupabaseClient,
  input: TripArrivalInput,
): Promise<
  | { ok: true; data: ResolvedTripDestination }
  | { ok: false; reason: ArrivalFailureReason; error?: unknown }
> {
  const qrToken = normalizeQrToken(input.qrToken);

  if (!input.tripId || !input.userId || !qrToken) {
    return { ok: false, reason: "missing_input" };
  }

  const tripResult = await client
    .from("trips")
    .select("id, owner_id, destination_id, state")
    .eq("id", input.tripId)
    .eq("owner_id", input.userId)
    .maybeSingle();

  if (tripResult.error || !tripResult.data) {
    logFriendlyError("QR 도착 확인", tripResult.error, {
      reason: "trip_not_found",
      tripId: input.tripId,
    });

    return { ok: false, reason: "trip_not_found", error: tripResult.error };
  }

  if (
    tripResult.data.state === "arrived_partial"
    || tripResult.data.state === "arrived_verified"
  ) {
    return { ok: false, reason: "already_arrived" };
  }

  if (tripResult.data.state === "cancelled") {
    return { ok: false, reason: "trip_cancelled" };
  }

  const destinationResult = await client
    .from("destinations")
    .select("id, owner_id, name, qr_token")
    .eq("id", tripResult.data.destination_id)
    .eq("owner_id", input.userId)
    .maybeSingle();

  if (destinationResult.error || !destinationResult.data) {
    logFriendlyError("QR 도착 장소 확인", destinationResult.error, {
      destinationId: tripResult.data.destination_id,
      reason: "destination_not_found",
      tripId: input.tripId,
    });

    return {
      ok: false,
      reason: "destination_not_found",
      error: destinationResult.error,
    };
  }

  if (destinationResult.data.qr_token !== qrToken) {
    return { ok: false, reason: "token_mismatch" };
  }

  return {
    ok: true,
    data: {
      tripId: tripResult.data.id,
      destinationId: tripResult.data.destination_id,
      destinationName: destinationResult.data.name,
    },
  };
}

/**
 * 1단계: 장소 QR 코드만 검증한다. 도착 기록은 저장하지 않는다.
 * 성공 시 사용자가 최종 "도착 확인 완료"를 누르도록 안내한다.
 */
export async function checkTripArrivalQr(
  input: TripArrivalInput,
): Promise<CheckTripArrivalQrResult> {
  const client = getSupabaseClient();
  const resolved = await resolveTripDestinationByQr(client, input);

  if (!resolved.ok) {
    return { ok: false, reason: resolved.reason, error: resolved.error };
  }

  return {
    ok: true,
    tripId: resolved.data.tripId,
    destinationName: resolved.data.destinationName,
  };
}

/**
 * 2단계: 사용자의 최종 확인. 이때 arrival_verifications 기록을 만들고
 * trip 상태를 도착 확인 완료(arrived_verified)로 업데이트한다.
 * QR 토큰을 다시 검증해 1단계와 동일한 장소인지 확인한다.
 */
export async function confirmTripArrival(
  input: TripArrivalInput,
): Promise<ConfirmTripArrivalResult> {
  const client = getSupabaseClient();
  const resolved = await resolveTripDestinationByQr(client, input);

  if (!resolved.ok) {
    return { ok: false, reason: resolved.reason, error: resolved.error };
  }

  const { tripId, destinationId, destinationName } = resolved.data;
  const verifiedAt = new Date().toISOString();

  const verificationInsert: ArrivalVerificationInsert = {
    trip_id: tripId,
    destination_id: destinationId,
    verified_by: input.userId,
    method: "qr_code",
    status: "succeeded",
    verified_at: verifiedAt,
  };

  const verificationResult = await client
    .from("arrival_verifications")
    .insert(verificationInsert)
    .select("id")
    .single();

  if (verificationResult.error) {
    logFriendlyError("QR 도착 기록 확인", verificationResult.error, {
      reason: "verification_insert_failed",
      tripId,
    });

    return {
      ok: false,
      reason: "verification_insert_failed",
      error: verificationResult.error,
    };
  }

  const tripUpdate: TripUpdate = {
    state: "arrived_verified",
    arrived_at: verifiedAt,
  };
  const updateResult = await client
    .from("trips")
    .update(tripUpdate)
    .eq("id", tripId)
    .eq("owner_id", input.userId)
    .select("id")
    .single();

  if (updateResult.error) {
    logFriendlyError("QR 도착 상태 확인", updateResult.error, {
      reason: "trip_update_failed",
      tripId,
    });

    return {
      ok: false,
      reason: "trip_update_failed",
      error: updateResult.error,
    };
  }

  const recipientsResult = await client
    .from("trip_recipients")
    .select("recipient_id")
    .eq("trip_id", tripId);

  if (recipientsResult.error) {
    logFriendlyError("QR 도착 알림 대상 확인", recipientsResult.error, {
      tripId,
    });
  } else {
    await createTripNotificationEvents({
      actorId: input.userId,
      destinationName,
      notificationType: "arrived_verified",
      recipientIds: (recipientsResult.data ?? []).map(
        (recipient) => recipient.recipient_id,
      ),
      state: "arrived_verified",
      tripId,
    });
  }

  return { ok: true, tripId };
}
