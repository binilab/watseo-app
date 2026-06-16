import { router, useLocalSearchParams } from "expo-router";
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from "expo-camera";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from "react-native";
import { CheckCircle2, RefreshCw, ScanLine } from "lucide-react-native";

import { AppButton, Card, Screen, StatusChip } from "@/src/components";
import { useAuthSession } from "@/src/features/auth/useAuthSession";
import { verifyTripArrivalByQr } from "@/src/features/arrival/api";
import {
  fetchLatestActiveTrip,
  fetchTripById,
  type Trip,
} from "@/src/features/trips/api";
import { logFriendlyError, showFriendlyAlert } from "@/src/lib/friendlyAlert";
import { colors, radius, spacing, typography } from "@/src/theme/tokens";

const QR_CODE_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isQrCodeValue(value: string) {
  return QR_CODE_PATTERN.test(value);
}

function getQrFailureCopy(reason: string) {
  if (reason === "missing_input") {
    return {
      message: "QR 코드를 입력해 주세요.",
      title: "확인해 주세요",
    };
  }

  if (reason === "invalid_format") {
    return {
      message: "QR 코드를 다시 확인해 주세요.",
      title: "확인해 주세요",
    };
  }

  if (reason === "token_mismatch") {
    return {
      message: "선택한 도착 장소의 QR 코드가 아니에요. 장소를 다시 확인해 주세요.",
      title: "장소가 달라요",
    };
  }

  if (reason === "already_arrived") {
    return {
      message: "이미 도착 확인이 끝났어요.",
      title: "확인해 주세요",
    };
  }

  if (reason === "trip_cancelled") {
    return {
      message: "이미 종료된 귀가예요.",
      title: "확인해 주세요",
    };
  }

  if (reason === "trip_not_found") {
    return {
      message: "진행 중인 귀가가 없어요.",
      title: "확인해 주세요",
    };
  }

  if (reason === "destination_not_found") {
    return {
      message: "도착 장소를 확인하지 못했어요.",
      title: "확인해 주세요",
    };
  }

  return {
    message: "도착 확인을 완료하지 못했어요. 잠시 뒤 다시 시도해 주세요.",
    title: "확인해 주세요",
  };
}

export default function QrArrivalScreen() {
  const { tripId } = useLocalSearchParams<{ tripId?: string }>();
  const { user } = useAuthSession();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [scanPaused, setScanPaused] = useState(false);
  const [qrToken, setQrToken] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const alertVisibleRef = useRef(false);
  const processingRef = useRef(false);
  const scanPausedRef = useRef(false);

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
              ? "귀가 정보를 불러오지 못했어요."
              : "진행 중인 귀가가 없어요.",
          );
        } else {
          setTrip(result.data);
          setMessage(null);
        }
      } catch {
        if (!mounted) return;
        setTrip(null);
        setMessage("귀가 정보를 불러오지 못했어요.");
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

  const showQrFailure = (reason: string) => {
    const copy = getQrFailureCopy(reason);

    setMessage(copy.message);

    if (alertVisibleRef.current) {
      return;
    }

    alertVisibleRef.current = true;
    showFriendlyAlert({
      actions: [
        {
          onPress: () => {
            alertVisibleRef.current = false;
          },
          text: reason === "token_mismatch" ? "다시 스캔" : "확인",
        },
      ],
      message: copy.message,
      title: copy.title,
    });
  };

  const verifyQrCodeValue = async (value: string) => {
    if (processingRef.current) {
      return;
    }

    if (!user || !trip) {
      setMessage("진행 중인 귀가가 없어요.");
      return;
    }

    const normalizedQrCode = value.trim();

    if (!normalizedQrCode) {
      showQrFailure("missing_input");
      return;
    }

    if (!isQrCodeValue(normalizedQrCode)) {
      showQrFailure("invalid_format");
      return;
    }

    processingRef.current = true;
    setVerifying(true);
    setMessage(null);

    try {
      const result = await verifyTripArrivalByQr({
        tripId: trip.id,
        userId: user.id,
        qrToken: normalizedQrCode,
      });

      if (!result.ok) {
        showQrFailure(result.reason);
        return;
      }

      router.replace({
        pathname: "/home/partial-verification",
        params: { tripId: result.tripId },
      });
    } catch (error) {
      logFriendlyError("QR 도착 확인", error, {
        reason: "unknown",
        tripId: trip.id,
      });
      showQrFailure("unknown");
    } finally {
      processingRef.current = false;
      setVerifying(false);
    }
  };

  const handleVerify = async () => {
    await verifyQrCodeValue(qrToken);
  };

  const handleBarcodeScanned = (result: BarcodeScanningResult) => {
    if (scanPausedRef.current || scanPaused || verifying || processingRef.current) return;

    const nextValue = result.data.trim();
    scanPausedRef.current = true;
    setScanPaused(true);
    setQrToken(nextValue);
    void verifyQrCodeValue(nextValue);
  };

  const handleRequestCameraPermission = async () => {
    const nextPermission = await requestCameraPermission();

    if (!nextPermission.granted) {
      showFriendlyAlert({
        message: "설정에서 권한을 허용하거나, 아래에 코드를 직접 입력할 수 있어요.",
        title: "카메라 권한이 필요해요",
      });
    }
  };

  const canUseCamera = cameraPermission?.granted;

  return (
    <Screen
      footer={
        <AppButton
          disabled={!trip || !qrToken.trim()}
          icon={CheckCircle2}
          loading={verifying}
          onPress={handleVerify}
          title="도착 확인하기"
        />
      }
    >
      <StatusChip label="도착 확인" tone="pending" />
      <View style={styles.header}>
        <Text style={styles.title}>QR로 도착 확인</Text>
        <Text style={styles.description}>
          도착 장소에 붙여둔 QR 코드를 스캔해 주세요.
        </Text>
      </View>

      <Card tone="blue" style={styles.scannerCard}>
        <Text style={styles.cardTitle}>카메라로 QR 스캔</Text>
        {loading ? (
          <View style={styles.scanBox}>
            <ActivityIndicator color={colors.primaryDark} />
          </View>
        ) : canUseCamera ? (
          <View style={styles.cameraWrap}>
            <CameraView
              barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
              onBarcodeScanned={scanPaused || verifying ? undefined : handleBarcodeScanned}
              style={styles.camera}
            />
            <View style={styles.scanGuide} />
          </View>
        ) : (
          <View style={styles.scanBox}>
            <ScanLine color={colors.primaryDark} size={72} strokeWidth={1.8} />
          </View>
        )}
        <Text style={styles.scanText}>
          {canUseCamera
            ? "카메라를 QR 코드에 맞춰 주세요."
            : "카메라 권한을 허용하거나 아래에 코드를 직접 입력할 수 있어요."}
        </Text>
        {!canUseCamera ? (
          <AppButton
            onPress={() => void handleRequestCameraPermission()}
            size="md"
            title="카메라 권한 허용"
            variant="secondary"
          />
        ) : null}
        {scanPaused && !verifying ? (
          <AppButton
            icon={RefreshCw}
            onPress={() => {
              alertVisibleRef.current = false;
              processingRef.current = false;
              scanPausedRef.current = false;
              setScanPaused(false);
              setMessage(null);
            }}
            size="md"
            title="다시 스캔하기"
            variant="secondary"
          />
        ) : null}
      </Card>

      <Card>
        <Text style={styles.cardTitle}>코드를 직접 입력할 수도 있어요</Text>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          editable={!verifying}
          onChangeText={(value) => {
            setQrToken(value.trim());
            setMessage(null);
          }}
          placeholder="장소 QR 코드 붙여넣기"
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
    gap: spacing.md,
  },
  scanBox: {
    width: 220,
    height: 220,
    borderRadius: radius.xl,
    borderWidth: 2,
    borderColor: colors.primarySoft,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },
  cameraWrap: {
    width: 220,
    height: 220,
    borderRadius: radius.xl,
    overflow: "hidden",
    backgroundColor: colors.text,
  },
  camera: {
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  scanGuide: {
    position: "absolute",
    left: 42,
    right: 42,
    top: 42,
    bottom: 42,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.white,
    opacity: 0.9,
  },
  scanText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
  },
  input: {
    ...typography.body,
    minHeight: 52,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
    color: colors.text,
    paddingHorizontal: spacing.lg,
  },
  message: {
    ...typography.caption,
    color: colors.danger,
    textAlign: "center",
  },
});
