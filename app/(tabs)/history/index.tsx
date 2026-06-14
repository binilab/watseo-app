import { StyleSheet, Text, View } from "react-native";
import { CalendarCheck2 } from "lucide-react-native";
import { Card, ListItem, Screen, SectionHeader, StatusChip } from "@/src/components";
import { returnHistory } from "@/src/data/mock";
import { colors, radius, spacing, typography } from "@/src/theme/tokens";
import { getStatusDisplay } from "@/src/types";

export default function HistoryScreen() {
  const completedStatus = getStatusDisplay("arrived_verified");

  return (
    <Screen>
      <SectionHeader
        title="귀가 기록"
        description="실제 저장소 없이 더미 데이터로 최근 완료 내역을 보여줍니다."
      />

      <Card tone="mint">
        <View style={styles.summary}>
          <View style={styles.iconWrap}>
            <CalendarCheck2 color={colors.primaryDark} size={30} strokeWidth={2.4} />
          </View>
          <View style={styles.summaryCopy}>
            <StatusChip label={`이번 주 ${returnHistory.length}회 완료`} tone={completedStatus.tone} />
            <Text style={styles.big}>도착 확인이 꾸준히 기록되고 있어요</Text>
          </View>
        </View>
      </Card>

      <Card>
        {returnHistory.map((item) => (
          <ListItem
            detail={item.detail}
            key={item.time}
            meta={item.time}
            title={item.title}
          />
        ))}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  summary: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "center",
  },
  iconWrap: {
    width: 60,
    height: 60,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },
  summaryCopy: {
    flex: 1,
    gap: spacing.sm,
  },
  big: {
    ...typography.subheading,
    color: colors.text,
  },
});
