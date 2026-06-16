import type { SupabaseClient } from "@supabase/supabase-js";

import { supabase } from "@/src/lib/supabase";
import { createTripNotificationEvents } from "@/src/features/notifications/api";
import { logFriendlyError } from "@/src/lib/friendlyAlert";
import type { Database } from "@/src/types/supabase";

type ArrivalVerificationInsert =
  Database["public"]["Tables"]["arrival_verifications"]["Insert"];
type TripUpdate = Database["public"]["Tables"]["trips"]["Update"];
type WatseoSupabaseClient = SupabaseClient<Database>;

export type VerifyTripArrivalByQrInput = {
  tripId: string;
  userId: string;
  qrToken: string;
};

export type VerifyTripArrivalByQrResult =
  | {
      ok: true;
      tripId: string;
    }
  | {
      ok: false;
      reason:
        | "missing_input"
        | "trip_not_found"
        | "destination_not_found"
        | "token_mismatch"
        | "already_arrived"
        | "trip_cancelled"
        | "verification_insert_failed"
        | "trip_update_failed"
        | "unknown";
      error?: unknown;
    };

function getSupabaseClient(): WatseoSupabaseClient {
  if (!supabase) {
    throw new Error("Supabase 환경변수가 설정되지 않았어요.");
  }

  return supabase;
}

function normalizeQrToken(qrToken: string) {
  return qrToken.trim();
}

export async function verifyTripArrivalByQr(
  input: VerifyTripArrivalByQrInput,
): Promise<VerifyTripArrivalByQrResult> {
  const client = getSupabaseClient();
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

    return {
      ok: false,
      reason: "trip_not_found",
      error: tripResult.error,
    };
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

  const verifiedAt = new Date().toISOString();
  const verificationInsert: ArrivalVerificationInsert = {
    trip_id: tripResult.data.id,
    destination_id: tripResult.data.destination_id,
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
      tripId: input.tripId,
    });

    return {
      ok: false,
      reason: "verification_insert_failed",
      error: verificationResult.error,
    };
  }

  const tripUpdate: TripUpdate = {
    state: "arrived_partial",
    arrived_at: verifiedAt,
  };
  const updateResult = await client
    .from("trips")
    .update(tripUpdate)
    .eq("id", tripResult.data.id)
    .eq("owner_id", input.userId)
    .select("id")
    .single();

  if (updateResult.error) {
    logFriendlyError("QR 도착 상태 확인", updateResult.error, {
      reason: "trip_update_failed",
      tripId: input.tripId,
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
    .eq("trip_id", tripResult.data.id);

  if (recipientsResult.error) {
    logFriendlyError("QR 도착 알림 대상 확인", recipientsResult.error, {
      tripId: input.tripId,
    });
  } else {
    await createTripNotificationEvents({
      actorId: input.userId,
      destinationName: destinationResult.data.name,
      notificationType: "arrived_partial",
      recipientIds: (recipientsResult.data ?? []).map((recipient) => recipient.recipient_id),
      state: "arrived_partial",
      tripId: tripResult.data.id,
    });
  }

  return {
    ok: true,
    tripId: tripResult.data.id,
  };
}
