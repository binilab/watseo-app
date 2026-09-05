import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";

import { supabase } from "@/src/lib/supabase";

export type SocialProvider = "google" | "kakao";

export type SocialSignInResult =
  | { ok: true }
  | { ok: false; reason: "not_configured" | "cancelled" | "error"; error?: unknown };

// app.json 의 scheme 와 일치해야 한다 (watseo://). 외부 콘솔에도 동일 값으로 redirect 등록 필요.
export const SOCIAL_REDIRECT_URL = Linking.createURL("auth/callback");

/**
 * URL 의 query(?code=) 또는 fragment(#code=) 에서 PKCE code 를 추출한다.
 */
function extractAuthCode(url: string): string | null {
  const parsed = Linking.parse(url);
  const fromQuery = parsed.queryParams?.code;

  if (typeof fromQuery === "string") {
    return fromQuery;
  }

  const hashIndex = url.indexOf("#");
  if (hashIndex >= 0) {
    const fragment = new URLSearchParams(url.slice(hashIndex + 1));
    return fragment.get("code");
  }

  return null;
}

/**
 * Google / Kakao 소셜 로그인 흐름(준비 단계).
 *
 * 동작 조건:
 * - Supabase Dashboard 에서 해당 provider 가 활성화되어 있어야 한다.
 * - 외부 콘솔(Google Cloud / Kakao Developers)에 redirect URL 이 등록되어 있어야 한다.
 *   자세한 설정은 docs/SOCIAL_LOGIN_SETUP.md 참고.
 *
 * 콘솔 설정 전에는 호출해도 provider 오류가 날 수 있으므로, UI 에서 친절한 안내로 감싼다.
 */
export async function signInWithProvider(
  provider: SocialProvider,
): Promise<SocialSignInResult> {
  if (!supabase) {
    return { ok: false, reason: "not_configured" };
  }

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: SOCIAL_REDIRECT_URL,
        skipBrowserRedirect: true,
      },
    });

    if (error || !data?.url) {
      return { ok: false, reason: "error", error };
    }

    const result = await WebBrowser.openAuthSessionAsync(
      data.url,
      SOCIAL_REDIRECT_URL,
    );

    if (result.type !== "success") {
      return { ok: false, reason: "cancelled" };
    }

    const code = extractAuthCode(result.url);

    if (!code) {
      return { ok: false, reason: "error" };
    }

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
      code,
    );

    if (exchangeError) {
      return { ok: false, reason: "error", error: exchangeError };
    }

    return { ok: true };
  } catch (error) {
    return { ok: false, reason: "error", error };
  }
}
