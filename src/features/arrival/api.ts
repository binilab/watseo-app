import type { SupabaseClient } from "@supabase/supabase-js";

import { supabase } from "@/src/lib/supabase";
import { createTripNotificationEvents } from "@/src/features/notifications/api";
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
    console.error("qr arrival failed", {
      reason: "trip_not_found",
      tripId: input.tripId,
      error: tripResult.error,
    });

    return {
      ok: false,
      reason: "trip_not_found",
      error: tripResult.error,
    };
  }

  const destinationResult = await client
    .from("destinations")
    .select("id, owner_id, name, qr_token")
    .eq("id", tripResult.data.destination_id)
    .eq("owner_id", input.userId)
    .maybeSingle();

  if (destinationResult.error || !destinationResult.data) {
    console.error("qr arrival failed", {
      reason: "destination_not_found",
      tripId: input.tripId,
      destinationId: tripResult.data.destination_id,
      error: destinationResult.error,
    });

    return {
      ok: false,
      reason: "destination_not_found",
      error: destinationResult.error,
    };
  }

  if (destinationResult.data.qr_token !== qrToken) {
    console.error("qr arrival failed", {
      reason: "token_mismatch",
      tripId: input.tripId,
      inputTokenLength: qrToken.length,
    });

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
    console.error("qr arrival failed", {
      reason: "verification_insert_failed",
      tripId: input.tripId,
      error: verificationResult.error,
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
    console.error("qr arrival failed", {
      reason: "trip_update_failed",
      tripId: input.tripId,
      error: updateResult.error,
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
    console.error("load trip recipients for notification failed", {
      tripId: input.tripId,
      error: recipientsResult.error,
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
