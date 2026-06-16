import { useCallback, useEffect, useState } from "react";

import { useAuthSession } from "@/src/features/auth/useAuthSession";
import {
  fetchAcceptedRelationships,
  type ConnectedPerson,
} from "@/src/features/connections/api";
import {
  fetchDestinations,
  type Destination,
} from "@/src/features/destinations/api";

type ReturnSetupDataState = {
  connections: ConnectedPerson[];
  destinations: Destination[];
  errorMessage: string | null;
  loading: boolean;
  refreshing: boolean;
  refreshSetupData: () => Promise<void>;
  userId: string | null;
};

const LOAD_ERROR_MESSAGE = "귀가 설정 정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.";

export function useReturnSetupData(): ReturnSetupDataState {
  const { user } = useAuthSession();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [connections, setConnections] = useState<ConnectedPerson[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadSetupData = useCallback(
    async (mode: "initial" | "refresh" = "refresh") => {
      if (!user) {
        setDestinations([]);
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
        const [destinationsResult, connectionsResult] = await Promise.all([
          fetchDestinations(user.id),
          fetchAcceptedRelationships(user.id),
        ]);

        if (destinationsResult.error || connectionsResult.error) {
          setErrorMessage(LOAD_ERROR_MESSAGE);
        } else {
          setDestinations(destinationsResult.data ?? []);
          setConnections(connectionsResult.data ?? []);
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

  useEffect(() => {
    void loadSetupData("initial");
  }, [loadSetupData]);

  return {
    connections,
    destinations,
    errorMessage,
    loading,
    refreshing,
    refreshSetupData: loadSetupData,
    userId: user?.id ?? null,
  };
}
