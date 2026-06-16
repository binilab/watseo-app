import { useCallback, useEffect, useState } from "react";

import { useAuthSession } from "@/src/features/auth/useAuthSession";
import {
  createDestination,
  fetchDestinations,
  updateDestinationName,
  type Destination,
} from "@/src/features/destinations/api";

type DestinationResult = {
  data: Destination | null;
  error: Error | null;
};

type DestinationsState = {
  destinations: Destination[];
  errorMessage: string | null;
  loading: boolean;
  refreshing: boolean;
  creating: boolean;
  updatingId: string | null;
  addDestination: (name: string) => Promise<DestinationResult>;
  refreshDestinations: () => Promise<void>;
  renameDestination: (destinationId: string, name: string) => Promise<DestinationResult>;
};

const LOAD_ERROR_MESSAGE = "정보를 불러오지 못했어요. 잠시 뒤 다시 시도해 주세요.";
const SAVE_ERROR_MESSAGE = "장소를 저장하지 못했어요. 잠시 뒤 다시 시도해 주세요.";

function toError(error: unknown, fallback: string) {
  if (error instanceof Error) {
    return error;
  }

  return new Error(fallback);
}

export function useDestinations(): DestinationsState {
  const { user } = useAuthSession();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadDestinations = useCallback(
    async (mode: "initial" | "refresh" = "refresh") => {
      if (!user) {
        setDestinations([]);
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
        const { data, error } = await fetchDestinations(user.id);

        if (error) {
          setErrorMessage(LOAD_ERROR_MESSAGE);
        } else {
          setDestinations(data ?? []);
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
    void loadDestinations("initial");
  }, [loadDestinations]);

  const addDestination = useCallback(
    async (name: string): Promise<DestinationResult> => {
      if (!user) {
        return { data: null, error: new Error("로그인이 필요해요.") };
      }

      setCreating(true);

      try {
        const { data, error } = await createDestination(user.id, name);

        if (error) {
          setErrorMessage(SAVE_ERROR_MESSAGE);
          return { data: null, error };
        }

        if (data) {
          setDestinations((current) => [data, ...current]);
        }
        setErrorMessage(null);
        return { data: data ?? null, error: null };
      } catch (error) {
        const nextError = toError(error, SAVE_ERROR_MESSAGE);
        setErrorMessage(SAVE_ERROR_MESSAGE);
        return { data: null, error: nextError };
      } finally {
        setCreating(false);
      }
    },
    [user],
  );

  const renameDestination = useCallback(
    async (destinationId: string, name: string): Promise<DestinationResult> => {
      setUpdatingId(destinationId);

      try {
        const { data, error } = await updateDestinationName(destinationId, name);

        if (error) {
          setErrorMessage(SAVE_ERROR_MESSAGE);
          return { data: null, error };
        }

        if (data) {
          setDestinations((current) =>
            current.map((destination) =>
              destination.id === destinationId ? data : destination,
            ),
          );
        }
        setErrorMessage(null);
        return { data: data ?? null, error: null };
      } catch (error) {
        const nextError = toError(error, SAVE_ERROR_MESSAGE);
        setErrorMessage(SAVE_ERROR_MESSAGE);
        return { data: null, error: nextError };
      } finally {
        setUpdatingId(null);
      }
    },
    [],
  );

  return {
    destinations,
    errorMessage,
    loading,
    refreshing,
    creating,
    updatingId,
    addDestination,
    refreshDestinations: loadDestinations,
    renameDestination,
  };
}
