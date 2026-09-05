import type { SupabaseClient } from "@supabase/supabase-js";

import { supabase } from "@/src/lib/supabase";
import { logFriendlyError } from "@/src/lib/friendlyAlert";
import type { Database, Json } from "@/src/types/supabase";

type NotificationEventInsert =
  Database["public"]["Tables"]["notification_events"]["Insert"];
type NotificationType = Database["public"]["Enums"]["notification_type"];
type DevicePushTokenInsert =
  Database["public"]["Tables"]["device_push_tokens"]["Insert"];
type WatseoSupabaseClient = SupabaseClient<Database>;

type CreateTripNotificationEventsInput = {
  actorId: string;
  destinationName?: string;
  message?: string;
  notificationType: Extract<
    NotificationType,
    | "trip_started"
    | "arrived_partial"
    | "arrived_verified"
    | "time_extension_requested"
    | "help_requested"
  >;
  previousState?: string;
  recipientIds: string[];
  state:
    | "on_the_way"
    | "arrived_partial"
    | "arrived_verified"
    | "extension_requested"
    | "emergency_requested";
  tripId: string;
};

function getSupabaseClient(): WatseoSupabaseClient {
  if (!supabase) {
    throw new Error("Supabase 환경변수가 설정되지 않았어요.");
  }

  return supabase;
}

export async function createTripNotificationEvents(
  input: CreateTripNotificationEventsInput,
) {
  if (input.recipientIds.length === 0) {
    return { error: null };
  }

  const client = getSupabaseClient();
  const payload: Json = {
    state: input.state,
    notification_type: input.notificationType,
    trip_id: input.tripId,
  };

  if (input.destinationName) {
    payload.destination_name = input.destinationName;
  }

  if (input.previousState) {
    payload.previous_state = input.previousState;
  }

  if (input.message) {
    payload.message = input.message;
  }
  const events: NotificationEventInsert[] = input.recipientIds.map((recipientId) => ({
    actor_id: input.actorId,
    delivery_status: "recorded",
    payload,
    recipient_id: recipientId,
    trip_id: input.tripId,
    type: input.notificationType,
  }));

  const { error } = await client.from("notification_events").insert(events);

  if (error) {
    logFriendlyError("알림 기록 확인", error, {
      eventType: input.notificationType,
      targetCount: input.recipientIds.length,
      tripId: input.tripId,
    });
  }

  return { error };
}

type SavePushTokenInput = {
  ownerId: string;
  pushToken: string;
  platform: string;
  deviceId?: string | null;
};

/**
 * 로그인한 사용자 기준으로 push token을 저장한다.
 * 같은 push_token이 있으면 갱신(upsert)한다.
 * 실제 발송은 별도(서버 TODO)이며 여기서는 저장까지만 담당한다.
 *
 * NOTE: device_push_tokens 테이블은 아직 적용 전이다.
 * supabase/migrations 의 device_push_tokens 초안을 적용해야 동작한다.
 */
export async function savePushToken(input: SavePushTokenInput) {
  const client = getSupabaseClient();
  const record: DevicePushTokenInsert = {
    owner_id: input.ownerId,
    push_token: input.pushToken,
    platform: input.platform,
    device_id: input.deviceId ?? null,
  };

  const { error } = await client
    .from("device_push_tokens")
    .upsert(record, { onConflict: "push_token" });

  if (error) {
    logFriendlyError("알림 토큰 저장 확인", error, {
      ownerId: input.ownerId,
      platform: input.platform,
    });
  }

  return { error };
}
