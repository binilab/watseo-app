import type { SupabaseClient } from "@supabase/supabase-js";

import { supabase } from "@/src/lib/supabase";
import { logFriendlyError } from "@/src/lib/friendlyAlert";
import type { Database } from "@/src/types/supabase";

export type HistoryTrip = Database["public"]["Tables"]["trips"]["Row"];
type Destination = Pick<
  Database["public"]["Tables"]["destinations"]["Row"],
  "id" | "name"
>;
type ArrivalVerification = Pick<
  Database["public"]["Tables"]["arrival_verifications"]["Row"],
  "id" | "trip_id" | "method" | "status" | "verified_at"
>;
type HelpRequest = Pick<
  Database["public"]["Tables"]["help_requests"]["Row"],
  "id" | "trip_id" | "status" | "created_at"
>;
type TimeExtensionRequest = Pick<
  Database["public"]["Tables"]["time_extension_requests"]["Row"],
  "id" | "trip_id" | "status" | "created_at"
>;
type WatseoSupabaseClient = SupabaseClient<Database>;

export type TripHistoryItem = {
  trip: HistoryTrip;
  destinationName: string;
  hasQrVerification: boolean;
  hasHelpRequest: boolean;
  hasTimeExtensionRequest: boolean;
  latestVerificationAt: string | null;
};

function getSupabaseClient(): WatseoSupabaseClient {
  if (!supabase) {
    throw new Error("Supabase 환경변수가 설정되지 않았어요.");
  }

  return supabase;
}

function groupByTripId<T extends { trip_id: string }>(rows: T[]) {
  const grouped = new Map<string, T[]>();

  for (const row of rows) {
    grouped.set(row.trip_id, [...(grouped.get(row.trip_id) ?? []), row]);
  }

  return grouped;
}

export async function getTripHistory(userId: string) {
  const client = getSupabaseClient();
  const tripsResult = await client
    .from("trips")
    .select("id, owner_id, destination_id, state, expected_arrival_at, started_at, arrived_at, cancelled_at, created_at, updated_at")
    .eq("owner_id", userId)
    .order("started_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (tripsResult.error) {
    logFriendlyError("귀가 기록 확인", tripsResult.error, {
      step: "trips",
    });

    return {
      data: null,
      error: tripsResult.error,
    };
  }

  const trips = tripsResult.data ?? [];

  console.log(
    "history trips",
    trips.map((trip) => ({
      id: trip.id.slice(0, 8),
      state: trip.state,
      cancelled_at: trip.cancelled_at,
    })),
  );

  if (trips.length === 0) {
    return {
      data: [] as TripHistoryItem[],
      error: null,
    };
  }

  const tripIds = trips.map((trip) => trip.id);
  const destinationIds = [...new Set(trips.map((trip) => trip.destination_id))];
  const [
    destinationsResult,
    verificationsResult,
    helpRequestsResult,
    timeExtensionRequestsResult,
  ] = await Promise.all([
    client
      .from("destinations")
      .select("id, name")
      .in("id", destinationIds),
    client
      .from("arrival_verifications")
      .select("id, trip_id, method, status, verified_at")
      .in("trip_id", tripIds),
    client
      .from("help_requests")
      .select("id, trip_id, status, created_at")
      .in("trip_id", tripIds),
    client
      .from("time_extension_requests")
      .select("id, trip_id, status, created_at")
      .in("trip_id", tripIds),
  ]);

  const firstError = destinationsResult.error
    ?? verificationsResult.error
    ?? helpRequestsResult.error
    ?? timeExtensionRequestsResult.error;

  if (firstError) {
    logFriendlyError("귀가 기록 상세 확인", firstError, {
      step: "related_records",
    });

    return {
      data: null,
      error: firstError,
    };
  }

  const destinationsById = new Map(
    ((destinationsResult.data ?? []) as Destination[]).map((destination) => [
      destination.id,
      destination.name,
    ]),
  );
  const verificationsByTripId = groupByTripId(
    (verificationsResult.data ?? []) as ArrivalVerification[],
  );
  const helpRequestsByTripId = groupByTripId(
    (helpRequestsResult.data ?? []) as HelpRequest[],
  );
  const timeRequestsByTripId = groupByTripId(
    (timeExtensionRequestsResult.data ?? []) as TimeExtensionRequest[],
  );

  return {
    data: trips.map((trip) => {
      const verifications = verificationsByTripId.get(trip.id) ?? [];
      const latestVerificationAt = verifications
        .map((verification) => verification.verified_at)
        .filter((value): value is string => Boolean(value))
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] ?? null;

      return {
        trip,
        destinationName: destinationsById.get(trip.destination_id) ?? "도착 예정 장소",
        hasQrVerification: verifications.some(
          (verification) =>
            verification.method === "qr_code" && verification.status === "succeeded",
        ),
        hasHelpRequest: (helpRequestsByTripId.get(trip.id) ?? []).length > 0,
        hasTimeExtensionRequest: (timeRequestsByTripId.get(trip.id) ?? []).length > 0,
        latestVerificationAt,
      };
    }),
    error: null,
  };
}
