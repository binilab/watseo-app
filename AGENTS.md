# AGENTS.md

## Project Overview

This project is a mobile MVP for **“왔어”**, a safety arrival confirmation app.

The app is not a surveillance or tracking app.
Its purpose is to help friends, partners, and family members feel reassured when someone is returning home.

Core concept:

* A user starts a return-home session.
* Connected people receive status updates.
* Arrival can be confirmed through QR verification and, later, location verification.
* If arrival is not confirmed after the expected time, the app shows a gentle “확인 필요” state.

Use neutral relationship language.
Do not make the app feel like a parent-child-only or guardian-control app.

Preferred Korean terms:

* Use: “연결된 사람”
* Use: “알림 받을 사람”
* Use: “확인 상대”
* Use: “도착 인증”
* Use: “확인 필요”
* Avoid: “보호자”
* Avoid: “감시”
* Avoid: “추적”
* Avoid: “위험” unless the user explicitly requests emergency-specific copy

## Tech Stack

* Expo SDK 56
* React Native
* TypeScript
* Expo Router
* Supabase later
* Stitch MCP for UI reference
* Context7 MCP for current library documentation
* GitHub MCP for repository work when needed

Current stage:

* UI skeleton only
* Static screens with mock data
* Router-based screen transitions
* No real Supabase Auth yet
* No real database writes yet
* No real QR scanner yet
* No real location permission or push notification logic yet

## Important Development Rule

Do not implement real backend, QR scanning, location tracking, notification, or Supabase features unless the user explicitly asks for that step.

First keep the MVP understandable and stable.

Recommended implementation order:

1. Clean and review UI skeleton
2. Align Stitch design spacing, card density, and button positions
3. Define data model and app states
4. Add Supabase schema
5. Add Supabase Auth
6. Add trip creation and status updates
7. Add QR verification
8. Add location verification
9. Add notifications

## App State Model

Use these state names consistently when possible:

* `not_started` — 귀가 전
* `on_the_way` — 귀가 중
* `arrived_verified` — 도착 인증 완료
* `arrived_partial` — QR 인증 완료 / 위치 확인 필요
* `late` — 확인 필요
* `extension_requested` — 시간 연장 요청
* `emergency_requested` — 도움 요청
* `cancelled` — 취소됨

Do not treat all arrivals as the same.

Important distinction:

* QR only: partial verification
* QR + location: verified arrival
* Manual only: unverified/manual arrival, if added later

## UX Principles

The app should feel warm, neutral, and reassuring.

Design direction:

* Soft Mint Minimal
* Warm Pastel Friendly accents
* Rounded cards
* Large clear buttons
* Light background
* Friendly but trustworthy tone

The app should feel natural for:

* friends
* romantic partners
* parents and children
* siblings
* family members

Always preserve this message:

“상세 위치는 계속 공유되지 않고, 도착 인증 상태와 필요한 알림만 전달돼요.”

## Routing and Structure

Use Expo Router file-based routing.

Main routes:

* `/` — onboarding
* `/login`
* `/role`
* `/permissions`
* `/home`
* `/home/return-setup`
* `/home/active`
* `/home/qr-arrival`
* `/home/partial-verification`
* `/home/arrived`
* `/home/time-extension`
* `/home/help-request`
* `/places`
* `/places/qr-code`
* `/connections`
* `/connections/connect`
* `/connections/invite`
* `/history`

Keep screens simple and readable.

Avoid large files.
If a screen becomes too large, extract reusable UI parts into `src/components`.

## Project Conventions

Use TypeScript.

Prefer:

* small components
* clear prop names
* mock data in `src/data/mock.ts`
* design tokens in `src/theme/tokens.ts`
* reusable UI components in `src/components`

Do not hardcode unrelated colors or spacing inside many screens.
Use the theme tokens where possible.

Before adding a new package, explain why it is needed.

Before making a large refactor, summarize the plan first.

## Commands

Use these commands for verification:

```bash
npm run web
```

```bash
./node_modules/.bin/tsc --noEmit
```

If lint is configured later, also run:

```bash
npm run lint
```

## Codex Workflow

When asked to implement something:

1. Inspect the current file structure first.
2. Summarize the plan briefly.
3. Make the smallest safe change.
4. Run TypeScript check if possible.
5. Report changed files.
6. Explain what was implemented and what remains.

Do not silently rewrite unrelated files.

## Review Expectations

When reviewing code, check:

* Does the app still run?
* Does TypeScript pass?
* Are routes consistent?
* Are Korean terms consistent?
* Is “보호자” avoided?
* Is privacy language clear?
* Is the UI still aligned with Soft Mint Minimal?
* Are mock data and real data clearly separated?
* Did the change avoid premature Supabase/QR/location implementation?

## Definition of Done

A task is done only when:

* The requested screen or feature works at the UI level
* Navigation does not break
* TypeScript check passes
* The changed files are listed
* Remaining limitations are clearly explained
