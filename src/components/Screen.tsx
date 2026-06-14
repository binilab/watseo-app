import { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  colors,
  spacing,
  TAB_CONTENT_BOTTOM_INSET,
} from "@/src/theme/tokens";

type ScreenProps = {
  children: ReactNode;
  footer?: ReactNode;
  scroll?: boolean;
  bottomInset?: number;
  hasBottomTabs?: boolean;
};

export function Screen({
  children,
  footer,
  scroll = true,
  bottomInset,
  hasBottomTabs = true,
}: ScreenProps) {
  const resolvedBottomInset =
    bottomInset ?? (hasBottomTabs ? TAB_CONTENT_BOTTOM_INSET : spacing.xxxl);
  const contentStyle = [
    styles.content,
    { paddingBottom: resolvedBottomInset },
  ];
  const footerStyle = [
    styles.footer,
    {
      paddingBottom: hasBottomTabs
        ? TAB_CONTENT_BOTTOM_INSET
        : spacing.xl,
    },
  ];

  const content = scroll ? (
    <ScrollView
      contentContainerStyle={contentStyle}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[contentStyle, styles.staticContent]}>{children}</View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: undefined })}
        style={styles.keyboard}
      >
        {content}
        {footer ? <View style={footerStyle}>{footer}</View> : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboard: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    gap: spacing.xl,
  },
  staticContent: {
    flex: 1,
  },
  footer: {
    padding: spacing.xl,
    paddingTop: spacing.md,
    backgroundColor: colors.background,
  },
});
