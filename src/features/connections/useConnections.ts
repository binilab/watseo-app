import { useCallback, useEffect, useState } from "react";

import { useAuthSession } from "@/src/features/auth/useAuthSession";
import {
  fetchAcceptedRelationships,
  type ConnectedPerson,
} from "@/src/features/connections/api";

type ConnectionsState = {
  connections: ConnectedPerson[];
  errorMessage: string | null;
  loading: boolean;
  refreshing: boolean;
  refreshConnections: () => Promise<void>;
};

const LOAD_ERROR_MESSAGE = "연결 목록을 불러오지 못했어요. 잠시 후 다시 시도해주세요.";

export function useConnections(): ConnectionsState {
  const { user } = useAuthSession();
  const [connections, setConnections] = useState<ConnectedPerson[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadConnections = useCallback(
    async (mode: "initial" | "refresh" = "refresh") => {
      if (!user) {
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
        const { data, error } = await fetchAcceptedRelationships(user.id);

        if (error) {
          setErrorMessage(LOAD_ERROR_MESSAGE);
        } else {
          setConnections(data ?? []);
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
    void loadConnections("initial");
  }, [loadConnections]);

  return {
    connections,
    errorMessage,
    loading,
    refreshing,
    refreshConnections: loadConnections,
  };
}
