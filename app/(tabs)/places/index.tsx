import { router } from "expo-router";
import { StyleSheet, Text } from "react-native";
import { MapPin, QrCode } from "lucide-react-native";
import { AppButton, Card, ListItem, Screen, SectionHeader } from "@/src/components";
import { arrivalPlaces } from "@/src/data/mock";
import { colors, spacing, typography } from "@/src/theme/tokens";

export default function PlacesScreen() {
  return (
    <Screen>
      <SectionHeader
        title="도착 장소 관리"
        description="도착 확인에 사용할 장소 목록을 더미 데이터로 보여줍니다."
      />

      <Card tone="mint">
        <Text style={styles.big}>3개 장소</Text>
        <Text style={styles.copy}>기본 도착지는 집으로 설정되어 있어요.</Text>
        <AppButton
          icon={QrCode}
          onPress={() => router.push("/places/qr-code")}
          title="QR 코드 생성 및 안내"
          variant="secondary"
        />
      </Card>

      <Card>
        {arrivalPlaces.map((place) => (
          <ListItem
            detail={place.address}
            icon={MapPin}
            key={place.title}
            meta={place.tag}
            title={place.title}
          />
        ))}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  big: {
    ...typography.heading,
    color: colors.primaryDark,
  },
  copy: {
    ...typography.body,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
});
