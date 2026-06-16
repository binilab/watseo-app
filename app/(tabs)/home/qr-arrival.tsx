import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from "react-native";
import { CheckCircle2, ScanLine } from "lucide-react-native";

import { AppButton, Card, Screen, StatusChip } from "@/src/components";
import { useAuthSession } from "@/src/features/auth/useAuthSession";
import { verifyTripArrivalByQr } from "@/src/features/arrival/api";
import {
  fetchLatestActiveTrip,
  fetchTripById,
  type Trip,
} from "@/src/features/trips/api";
import { colors, radius, spacing, typography } from "@/src/theme/tokens";

function getUserMessageForReason(reason: string) {
  if (reason === "token_mismatch") {
    return "QR 코드 값이 도착 장소와 맞지 않아요.";
  }

  if (reason === "trip_not_found") {
    return "진행 중인 귀가 정보를 찾을 수 없어요.";
  }

  if (reason === "destination_not_found") {
    return "도착 장소 정보를 확인하지 못했어요.";
  }

  return "QR 도착 인증을 완료하지 못했어요. 잠시 후 다시 시도해주세요.";
}

export default function QrArrivalScreen() {
  const { tripId } = useLocalSearchParams<{ tripId?: string }>();
  const { user } = useAuthSession();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [qrToken, setQrToken] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadTrip() {
      if (!user) {
        setTrip(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const result = tripId
          ? await fetchTripById(tripId)
          : await fetchLatestActiveTrip(user.id);

        if (!mounted) return;

        if (result.error || !result.data) {
          setTrip(null);
          setMessage(
            tripId
              ? "귀가 세션 정보를 불러오지 못했어요."
              : "진행 중인 귀가 정보를 찾을 수 없어요.",
          );
        } else {
          setTrip(result.data);
          setMessage(null);
        }
      } catch {
        if (!mounted) return;
        setTrip(null);
        setMessage("귀가 세션 정보를 불러오지 못했어요.");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadTrip();

    return () => {
      mounted = false;
    };
  }, [tripId, user]);

  const handleVerify = async () => {
    if (!user || !trip) {
      setMessage("진행 중인 귀가 정보를 찾을 수 없어요.");
      return;
    }

    if (!qrToken.trim()) {
      setMessage("QR 코드 값을 입력해주세요.");
      return;
    }

    setVerifying(true);
    setMessage(null);

    try {
      const result = await verifyTripArrivalByQr({
        tripId: trip.id,
        userId: user.id,
        qrToken,
      });

      if (!result.ok) {
        setMessage(getUserMessageForReason(result.reason));
        return;
      }

      router.replace({
        pathname: "/home/partial-verification",
        params: { tripId: result.tripId },
      });
    } catch (error) {
      console.error("qr arrival failed", {
        reason: "unknown",
        tripId: trip.id,
        error,
      });
      setMessage("QR 도착 인증을 완료하지 못했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Screen
      footer={
        <AppButton
          disabled={!trip || !qrToken.trim()}
          icon={CheckCircle2}
          loading={verifying}
          onPress={handleVerify}
          title="QR 도착 인증"
        />
      }
    >
      <StatusChip label="코드 입력 인증" tone="pending" />
      <View style={styles.header}>
        <Text style={styles.title}>QR 도착 인증</Text>
        <Text style={styles.description}>
          카메라 스캔 전 단계로, 도착 장소의 QR 코드 값을 입력해 인증합니다.
        </Text>
      </View>

      <Card tone="blue" style={styles.scannerCard}>
        <View style={styles.scanBox}>
          {loading ? (
            <ActivityIndicator color={colors.primaryDark} />
          ) : (
            <ScanLine color={colors.primaryDark} size={72} strokeWidth={1.8} />
          )}
        </View>
        <Text style={styles.scanText}>
          {trip ? "도착 장소에 표시된 QR 코드 값을 입력해주세요." : "진행 중인 귀가 정보를 확인하고 있어요."}
        </Text>
      </Card>

      <Card>
        <Text style={styles.cardTitle}>QR 코드 값</Text>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          editable={!verifying}
          onChangeText={(value) => {
            setQrToken(value.trim());
            setMessage(null);
          }}
          placeholder="도착 장소 QR token 입력"
          placeholderTextColor={colors.textSubtle}
          style={styles.input}
          value={qrToken}
        />
      </Card>

      {message ? <Text style={styles.message}>{message}</Text> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.sm,
  },
  title: {
    ...typography.title,
    color: colors.text,
  },
  description: {
    ...typography.body,
    color: colors.textMuted,
  },
  cardTitle: {
    ...typography.subheading,
    color: colors.text,
  },
  scannerCard: {
    alignItems: "center",
    gap: spacing.xl,
  },
  scanBox: {
    width: 230,
    height: 230,
    borderRadius: radius.xl,
    borderWidth: 3,
    borderColor: colors.primarySoft,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },
  scanText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
  },
  input: {
    ...typography.body,
    minHeight: 54,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    color: colors.text,
    paddingHorizontal: spacing.lg,
  },
  message: {
    ...typography.caption,
    color: colors.danger,
    textAlign: "center",
  },
});
