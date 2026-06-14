# Project Context

## Overview

- App name: 왔어
- Project folder: `watseo-app`
- Platform: Expo React Native + TypeScript + Expo Router
- Purpose: 친구, 연인, 가족이 서로 귀가 상태를 확인하는 안전 귀가 확인 앱
- Core value: 감시가 아니라 안심

## Current Stage

Stitch 기반 UI 스켈레톤 구현 완료.

현재는 Supabase, 실제 QR 스캔, 위치 권한, 푸시 알림을 붙이기 전 단계이며, 화면 구조와 타입 모델을 먼저 안정화한 상태다.

## Implemented

- Expo SDK 56
- Expo Router
- TypeScript
- Stitch 기반 18개 화면 UI 뼈대
- `AppState` 타입
- `StatusDisplay` 매핑
- mock data
- 하단 탭바 겹침 수정
- 탭 재진입 시 스크롤 초기화

## Not Implemented Yet

- Supabase Auth
- 실제 DB 연결
- 실제 QR 스캔
- 실제 위치 권한
- 실제 푸시 알림

## Language Rules

### Avoid

- 보호자
- 감시
- 추적
- 위험

### Prefer

- 연결된 사람
- 알림 받을 사람
- 확인 상대
- 도착 인증
- 확인 필요

## Privacy Principle

상세 위치는 계속 공유되지 않고, 도착 인증 상태와 필요한 알림만 전달돼요.

