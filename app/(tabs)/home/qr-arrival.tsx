import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from "react-native";
import {
  CameraView,
  useCameraPermissions,
  type BarcodeScanningResult,
} from "expo-camera";
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
    return "QR 코드가 이 장소와 맞지 않아요";
  }

  if (reason === "trip_not_found") {
    return "진행 중인 귀가가 없어요";
  }

  if (reason === "destination_not_found") {
    return "도착 장소를 확인하지 못했어요";
  }

  return "도착 확인이 안 됐어요. 잠시 뒤 다시 해주세요";
}

export default function QrArrivalScreen() {
  const { tripId } = useLocalSearchParams<{ tripId?: string }>();
  const { user } = useAuthSession();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [scanned, setScanned] = useState(false);
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

  const verifyQrCodeValue = async (qrCodeValue: string) => {
    if (!user || !trip) {
      setMessage("진행 중인 귀가가 없어요.");
      return;
    }

    const normalizedQrCodeValue = qrCodeValue.trim();

    if (!normalizedQrCodeValue) {
      setMessage("QR 코드를 입력해 주세요");
      return;
    }

    setVerifying(true);
    setMessage(null);

    try {
      const result = await verifyTripArrivalByQr({
        tripId: trip.id,
        userId: user.id,
        qrToken: normalizedQrCodeValue,
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
      setMessage("도착 확인이 안 됐어요. 잠시 뒤 다시 해주세요");
    } finally {
      setVerifying(false);
    }
  };

  const handleVerify = async () => {
    await verifyQrCodeValue(qrToken);
  };

  const handleBarcodeScanned = (result: BarcodeScanningResult) => {
    if (scanned || verifying) return;

    setScanned(true);
    setQrToken(result.data.trim());
    void verifyQrCodeValue(result.data);
  };

  const handleScanAgain = () => {
    setScanned(false);
    setMessage(null);
  };

  const cameraReady = Boolean(cameraPermission?.granted);
  const canScan = Boolean(trip && cameraReady && !scanned && !verifying);

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
          카메라로 QR을 비추면 바로 확인돼요.
        </Text>
      </View>

      <Card tone="blue" style={styles.scannerCard}>
        <Text style={styles.cardTitle}>카메라로 QR 스캔</Text>

        {loading || !cameraPermission ? (
          <View style={styles.scanBox}>
            <ActivityIndicator color={colors.primaryDark} />
          </View>
        ) : null}

        {!loading && cameraPermission && !cameraPermission.granted ? (
          <View style={styles.permissionBox}>
            <ScanLine color={colors.primaryDark} size={48} strokeWidth={1.8} />
            <Text style={styles.scanText}>카메라 권한이 필요해요</Text>
            <Text style={styles.permissionText}>
              설정에서 권한을 허용하거나, 아래에 코드를 직접 입력할 수 있어요.
            </Text>
            {cameraPermission.canAskAgain ? (
              <AppButton
                onPress={() => void requestCameraPermission()}
                size="md"
                title="카메라 권한 허용"
                variant="secondary"
              />
            ) : null}
          </View>
        ) : null}

        {!loading && cameraReady ? (
          <View style={styles.cameraFrame}>
            <CameraView
              active={Boolean(trip && !verifying)}
              barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
              facing="back"
              onBarcodeScanned={canScan ? handleBarcodeScanned : undefined}
              onMountError={(event) => {
                console.error("camera mount failed", { message: event.message });
                setMessage("카메라를 열지 못했어요. 아래에 코드를 직접 입력해 주세요.");
              }}
              style={styles.camera}
            />
            <View style={styles.scanGuide} pointerEvents="none">
              <View style={styles.scanGuideBox} />
            </View>
          </View>
        ) : null}

        <Text style={styles.scanText}>
          {trip
            ? "QR을 네모 안에 맞춰주세요."
            : "잠깐만요, 확인하고 있어요."}
        </Text>

        {scanned && !verifying ? (
          <AppButton
            onPress={handleScanAgain}
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
          placeholder="장소에 붙여둔 QR 코드 입력"
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
  permissionBox: {
    width: "100%",
    alignItems: "center",
    gap: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: spacing.lg,
  },
  permissionText: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: "center",
  },
  cameraFrame: {
    width: "100%",
    height: 230,
    borderRadius: radius.xl,
    overflow: "hidden",
    backgroundColor: colors.text,
  },
  camera: {
    flex: 1,
  },
  scanGuide: {
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  scanGuideBox: {
    width: 158,
    height: 158,
    borderRadius: radius.lg,
    borderWidth: 3,
    borderColor: colors.white,
    backgroundColor: "transparent",
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
