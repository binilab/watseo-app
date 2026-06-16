import type { SupabaseClient } from "@supabase/supabase-js";

import { supabase } from "@/src/lib/supabase";
import { createTripNotificationEvents } from "@/src/features/notifications/api";
import { logFriendlyError } from "@/src/lib/friendlyAlert";
import type { Database } from "@/src/types/supabase";

export type Trip = Database["public"]["Tables"]["trips"]["Row"];
export type TripRecipient = Database["public"]["Tables"]["trip_recipients"]["Row"];

type TripInsert = Database["public"]["Tables"]["trips"]["Insert"];
type TripRecipientInsert =
  Database["public"]["Tables"]["trip_recipients"]["Insert"];
type HelpRequestInsert =
  Database["public"]["Tables"]["help_requests"]["Insert"];
type TimeExtensionRequestInsert =
  Database["public"]["Tables"]["time_extension_requests"]["Insert"];
type TripUpdate = Database["public"]["Tables"]["trips"]["Update"];
type WatseoSupabaseClient = SupabaseClient<Database>;

export type TripRecipientSelection = {
  recipientId: string;
  relationshipId: string;
};

export type CreateTripSessionInput = {
  destinationName: string;
  ownerId: string;
  destinationId: string;
  expectedArrivalAt: string;
  startedAt: string;
  recipients: TripRecipientSelection[];
};

export type RequestHelpInput = {
  requestedBy: string;
  trip: Trip;
};

export type RequestTimeExtensionInput = {
  requestedBy: string;
  requestedExpectedArrivalAt: string;
  trip: Trip;
};

const OWNER_ACTIVE_TRIP_STATES = [
  "on_the_way",
  "late",
  "extension_requested",
  "emergency_requested",
] as const;

function getSupabaseClient(): WatseoSupabaseClient {
  if (!supabase) {
    throw new Error("Supabase 환경변수가 설정되지 않았어요.");
  }

  return supabase;
}

export async function createTripSession(input: CreateTripSessionInput) {
  const client = getSupabaseClient();
  if (input.recipients.length === 0) {
    return {
      data: null,
      error: new Error("at least one trip recipient is required"),
      recipientError: null,
      existingActiveTrip: null,
    };
  }

  const activeTripResult = await fetchLatestActiveTrip(input.ownerId);

  if (activeTripResult.error) {
    logFriendlyError("귀가 시작 전 확인", activeTripResult.error);

    return {
      data: null,
      error: activeTripResult.error,
      recipientError: null,
      existingActiveTrip: null,
    };
  }

  if (activeTripResult.data) {
    return {
      data: {
        trip: activeTripResult.data,
        recipients: [] as TripRecipient[],
      },
      error: null,
      recipientError: null,
      existingActiveTrip: activeTripResult.data,
    };
  }

  const tripInsert: TripInsert = {
    owner_id: input.ownerId,
    destination_id: input.destinationId,
    state: "on_the_way",
    expected_arrival_at: input.expectedArrivalAt,
    started_at: input.startedAt,
  };

  const tripResult = await client
    .from("trips")
    .insert(tripInsert)
    .select("id, owner_id, destination_id, state, expected_arrival_at, started_at, arrived_at, cancelled_at, created_at, updated_at")
    .single();

  if (tripResult.error || !tripResult.data) {
    logFriendlyError("귀가 시작 확인", tripResult.error, {
      reason: tripResult.data ? "saved" : "empty_result",
    });

    return {
      data: null,
      error: tripResult.error ?? new Error("trip insert failed"),
      recipientError: null,
      existingActiveTrip: null,
    };
  }

  const recipientInserts: TripRecipientInsert[] = input.recipients.map((recipient) => ({
    trip_id: tripResult.data.id,
    recipient_id: recipient.recipientId,
    relationship_id: recipient.relationshipId,
    added_by: input.ownerId,
    notification_enabled: true,
  }));

  const recipientsResult = await client
    .from("trip_recipients")
    .insert(recipientInserts)
    .select("id, trip_id, recipient_id, relationship_id, added_by, notification_enabled, created_at");

  if (recipientsResult.error) {
    logFriendlyError("귀가 알림 대상 저장 확인", recipientsResult.error, {
      tripId: tripResult.data.id,
      selectedCount: recipientInserts.length,
    });

    // TODO: DB transaction/RPC가 생기면 trip 생성과 recipients 생성을 원자적으로 묶는다.
    return {
      data: null,
      error: recipientsResult.error,
      recipientError: recipientsResult.error,
      existingActiveTrip: null,
    };
  }

  await createTripNotificationEvents({
    actorId: input.ownerId,
    destinationName: input.destinationName,
    notificationType: "trip_started",
    recipientIds: recipientInserts.map((recipient) => recipient.recipient_id),
    state: "on_the_way",
    tripId: tripResult.data.id,
  });

  return {
    data: {
      trip: tripResult.data,
      recipients: recipientsResult.data ?? [],
    },
    error: null,
    recipientError: null,
    existingActiveTrip: null,
  };
}

export async function fetchTripById(tripId: string) {
  const client = getSupabaseClient();

  return client
    .from("trips")
    .select("id, owner_id, destination_id, state, expected_arrival_at, started_at, arrived_at, cancelled_at, created_at, updated_at")
    .eq("id", tripId)
    .maybeSingle();
}

export async function fetchLatestActiveTrip(userId: string) {
  const client = getSupabaseClient();

  return client
    .from("trips")
    .select("id, owner_id, destination_id, state, expected_arrival_at, started_at, arrived_at, cancelled_at, created_at, updated_at")
    .eq("owner_id", userId)
    .in("state", OWNER_ACTIVE_TRIP_STATES)
    .order("started_at", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();
}

export async function cancelTrip(tripId: string, ownerId: string) {
  const client = getSupabaseClient();
  const cancelledAt = new Date().toISOString();
  const tripUpdate: TripUpdate = {
    state: "cancelled",
    cancelled_at: cancelledAt,
  };

  const result = await client
    .from("trips")
    .update(tripUpdate)
    .eq("id", tripId)
    .eq("owner_id", ownerId)
    .select("id, owner_id, destination_id, state, expected_arrival_at, started_at, arrived_at, cancelled_at, created_at, updated_at")
    .single();

  if (result.error) {
    logFriendlyError("귀가 취소 확인", result.error, {
      tripId,
    });
  }

  return result;
}

export async function fetchTripRecipients(tripId: string) {
  const client = getSupabaseClient();

  return client
    .from("trip_recipients")
    .select("recipient_id")
    .eq("trip_id", tripId);
}

export async function requestHelp(input: RequestHelpInput) {
  const client = getSupabaseClient();
  const previousState = input.trip.state;
  const helpRequestInsert: HelpRequestInsert = {
    trip_id: input.trip.id,
    requested_by: input.requestedBy,
    status: "requested",
  };

  const helpRequestResult = await client
    .from("help_requests")
    .insert(helpRequestInsert)
    .select("id, trip_id, requested_by, status, acknowledged_by, acknowledged_at, resolved_at, created_at, updated_at")
    .single();

  if (helpRequestResult.error || !helpRequestResult.data) {
    logFriendlyError("도움 요청 저장 확인", helpRequestResult.error);

    return {
      data: null,
      error: helpRequestResult.error ?? new Error("help request insert failed"),
      notificationError: null,
    };
  }

  const tripUpdate: TripUpdate = {
    state: "emergency_requested",
  };
  const tripResult = await client
    .from("trips")
    .update(tripUpdate)
    .eq("id", input.trip.id)
    .eq("owner_id", input.requestedBy)
    .select("id, owner_id, destination_id, state, expected_arrival_at, started_at, arrived_at, cancelled_at, created_at, updated_at")
    .single();

  if (tripResult.error || !tripResult.data) {
    logFriendlyError("도움 요청 상태 확인", tripResult.error, {
      tripId: input.trip.id,
    });

    return {
      data: null,
      error: tripResult.error ?? new Error("trip update failed"),
      notificationError: null,
    };
  }

  const recipientsResult = await fetchTripRecipients(input.trip.id);

  if (recipientsResult.error) {
    logFriendlyError("도움 요청 알림 대상 확인", recipientsResult.error, {
      tripId: input.trip.id,
    });

    return {
      data: {
        helpRequest: helpRequestResult.data,
        trip: tripResult.data,
      },
      error: null,
      notificationError: recipientsResult.error,
    };
  }

  const notificationResult = await createTripNotificationEvents({
    actorId: input.requestedBy,
    message: "도움 요청이 도착했어요.",
    notificationType: "help_requested",
    previousState,
    recipientIds: (recipientsResult.data ?? []).map((recipient) => recipient.recipient_id),
    state: "emergency_requested",
    tripId: input.trip.id,
  });

  return {
    data: {
      helpRequest: helpRequestResult.data,
      trip: tripResult.data,
    },
    error: null,
    notificationError: notificationResult.error,
  };
}

export async function requestTimeExtension(input: RequestTimeExtensionInput) {
  const client = getSupabaseClient();
  const previousState = input.trip.state;
  const requestInsert: TimeExtensionRequestInsert = {
    trip_id: input.trip.id,
    requested_by: input.requestedBy,
    previous_expected_arrival_at: input.trip.expected_arrival_at,
    requested_expected_arrival_at: input.requestedExpectedArrivalAt,
    status: "pending",
  };

  const requestResult = await client
    .from("time_extension_requests")
    .insert(requestInsert)
    .select("id, trip_id, requested_by, previous_expected_arrival_at, requested_expected_arrival_at, status, responded_at, created_at, updated_at")
    .single();

  if (requestResult.error || !requestResult.data) {
    logFriendlyError("시간 연장 요청 저장 확인", requestResult.error);

    return {
      data: null,
      error: requestResult.error ?? new Error("time extension request insert failed"),
      notificationError: null,
    };
  }

  const tripUpdate: TripUpdate = {
    state: "extension_requested",
  };
  const tripResult = await client
    .from("trips")
    .update(tripUpdate)
    .eq("id", input.trip.id)
    .eq("owner_id", input.requestedBy)
    .select("id, owner_id, destination_id, state, expected_arrival_at, started_at, arrived_at, cancelled_at, created_at, updated_at")
    .single();

  if (tripResult.error || !tripResult.data) {
    logFriendlyError("시간 연장 상태 확인", tripResult.error, {
      tripId: input.trip.id,
    });

    return {
      data: null,
      error: tripResult.error ?? new Error("trip update failed"),
      notificationError: null,
    };
  }

  const recipientsResult = await fetchTripRecipients(input.trip.id);

  if (recipientsResult.error) {
    logFriendlyError("시간 연장 알림 대상 확인", recipientsResult.error, {
      tripId: input.trip.id,
    });

    return {
      data: {
        request: requestResult.data,
        trip: tripResult.data,
      },
      error: null,
      notificationError: recipientsResult.error,
    };
  }

  const recipientIds = (recipientsResult.data ?? []).map(
    (recipient) => recipient.recipient_id,
  );

  if (recipientIds.length === 0) {
    return {
      data: {
        request: requestResult.data,
        trip: tripResult.data,
      },
      error: null,
      notificationError: null,
    };
  }

  const notificationResult = await createTripNotificationEvents({
    actorId: input.requestedBy,
    notificationType: "time_extension_requested",
    previousState,
    recipientIds,
    state: "extension_requested",
    tripId: input.trip.id,
  });

  return {
    data: {
      request: requestResult.data,
      trip: tripResult.data,
    },
    error: null,
    notificationError: notificationResult.error,
  };
}
