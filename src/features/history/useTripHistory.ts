import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";

import { useAuthSession } from "@/src/features/auth/useAuthSession";
import { getTripHistory, type TripHistoryItem } from "@/src/features/history/api";
import { logFriendlyError } from "@/src/lib/friendlyAlert";

type TripHistoryState = {
  errorMessage: string | null;
  history: TripHistoryItem[];
  loading: boolean;
  refreshHistory: () => Promise<void>;
  refreshing: boolean;
};

const LOAD_ERROR_MESSAGE = "정보를 불러오지 못했어요. 잠시 뒤 다시 시도해 주세요.";

export function useTripHistory(): TripHistoryState {
  const { user } = useAuthSession();
  const [history, setHistory] = useState<TripHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadHistory = useCallback(
    async (mode: "initial" | "refresh" = "refresh") => {
      if (!user) {
        setHistory([]);
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
        const { data, error } = await getTripHistory(user.id);

        if (error) {
          setErrorMessage(LOAD_ERROR_MESSAGE);
          setHistory([]);
        } else {
          setHistory(data ?? []);
          setErrorMessage(null);
        }
      } catch (error) {
        logFriendlyError("귀가 기록 확인", error);
        setErrorMessage(LOAD_ERROR_MESSAGE);
        setHistory([]);
      }

      setLoading(false);
      setRefreshing(false);
    },
    [user],
  );

  useFocusEffect(
    useCallback(() => {
      void loadHistory("initial");
    }, [loadHistory]),
  );

  return {
    errorMessage,
    history,
    loading,
    refreshHistory: loadHistory,
    refreshing,
  };
}
