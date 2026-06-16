import { ReactNode, useCallback, useRef } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  colors,
  layout,
  spacing,
  TAB_CONTENT_BOTTOM_INSET,
} from "@/src/theme/tokens";

type ScreenProps = {
  children: ReactNode;
  footer?: ReactNode;
  scroll?: boolean;
  bottomInset?: number;
  hasBottomTabs?: boolean;
  resetScrollOnFocus?: boolean;
};

export function Screen({
  children,
  footer,
  scroll = true,
  bottomInset,
  hasBottomTabs = true,
  resetScrollOnFocus,
}: ScreenProps) {
  const scrollRef = useRef<ScrollView>(null);
  const shouldResetScrollOnFocus = resetScrollOnFocus ?? hasBottomTabs;
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

  useFocusEffect(
    useCallback(() => {
      if (!shouldResetScrollOnFocus) {
        return undefined;
      }

      const frame = requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ y: 0, animated: false });
      });

      return () => cancelAnimationFrame(frame);
    }, [shouldResetScrollOnFocus]),
  );

  const content = scroll ? (
    <ScrollView
      ref={scrollRef}
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
    backgroundColor: colors.backgroundSoft,
  },
  keyboard: {
    flex: 1,
  },
  content: {
    paddingHorizontal: layout.screenPaddingX,
    paddingTop: layout.screenPaddingTop,
    gap: layout.sectionGap,
  },
  staticContent: {
    flex: 1,
  },
  footer: {
    padding: spacing.xl,
    paddingTop: spacing.md,
    backgroundColor: colors.backgroundSoft,
  },
});
