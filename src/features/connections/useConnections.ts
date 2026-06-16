import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";

import { useAuthSession } from "@/src/features/auth/useAuthSession";
import {
  fetchAcceptedRelationships,
  fetchRecipientActiveTrips,
  type ConnectedPerson,
  type RecipientActiveTrip,
} from "@/src/features/connections/api";

type ConnectionsState = {
  activeTrips: RecipientActiveTrip[];
  connections: ConnectedPerson[];
  errorMessage: string | null;
  loading: boolean;
  refreshing: boolean;
  refreshConnections: () => Promise<void>;
};

const LOAD_ERROR_MESSAGE = "정보를 불러오지 못했어요. 잠시 뒤 다시 시도해 주세요.";

export function useConnections(): ConnectionsState {
  const { user } = useAuthSession();
  const [activeTrips, setActiveTrips] = useState<RecipientActiveTrip[]>([]);
  const [connections, setConnections] = useState<ConnectedPerson[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadConnections = useCallback(
    async (mode: "initial" | "refresh" = "refresh") => {
      if (!user) {
        setActiveTrips([]);
        setConnections([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (mode === "initial") {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      try {
        const [relationshipsResult, activeTripsResult] = await Promise.all([
          fetchAcceptedRelationships(user.id),
          fetchRecipientActiveTrips(user.id),
        ]);

        if (relationshipsResult.error || activeTripsResult.error) {
          setErrorMessage(LOAD_ERROR_MESSAGE);
        } else {
          setConnections(relationshipsResult.data ?? []);
          setActiveTrips(activeTripsResult.data ?? []);
          setErrorMessage(null);
        }
      } catch {
        setErrorMessage(LOAD_ERROR_MESSAGE);
      }

      setLoading(false);
      setRefreshing(false);
    },
    [user],
  );

  useFocusEffect(
    useCallback(() => {
      void loadConnections("initial");
    }, [loadConnections]),
  );

  return {
    activeTrips,
    connections,
    errorMessage,
    loading,
    refreshing,
    refreshConnections: loadConnections,
  };
}
