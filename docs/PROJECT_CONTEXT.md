# Project Context

## Overview

- App name: 왔어
- Project folder: `watseo-app`
- Platform: Expo React Native + TypeScript + Expo Router
- Purpose: 친구, 연인, 가족이 서로 귀가 상태를 확인하는 안전 귀가 확인 앱
- Core value: 감시가 아니라 안심

## Current Stage

Stitch 기반 UI 스켈레톤 구현 완료.

Supabase v1 schema migration과 기본 Auth 연결이 완료되었다.

`/places` 도착 장소 관리는 실제 Supabase `destinations` 테이블에 연결되었다.

`/connections` 연결 관계와 초대 생성/수락은 실제 Supabase `relationships`, `connection_invites`, `accept_connection_invite` RPC에 연결되었다.

`/home/return-setup` 귀가 세션 생성은 실제 Supabase `trips`, `trip_recipients` 테이블에 연결되었다.

현재는 실제 QR 스캔, 위치 권한, 푸시 알림을 붙이기 전 단계이며, 화면 구조와 타입 모델을 안정화하면서 Auth 이후 흐름을 준비하는 상태다.

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
- Supabase v1 schema migration
- Supabase TypeScript 타입
- Supabase client 기본 설정
- 이메일/비밀번호 로그인 및 회원가입
- AsyncStorage 기반 Auth session 저장
- 기본 로그아웃 동작
- persisted onboarding state
- 최소 Auth route guard
- `/places` destinations 조회, 추가, 이름 수정
- `/places/qr-code` selected destination `qr_token` 참조 준비
- `/connections` accepted relationships 조회
- `/connections/connect` connection invite 생성
- `/connections/invite` accept_connection_invite RPC 수락
- `/home/return-setup` trips 생성
- `/home/return-setup` trip_recipients 생성
- `/home/active` created trip id 표시 준비

## Not Implemented Yet

- 세부 route guard 정책
- notification_events 생성
- 실제 QR 이미지 생성
- 실제 QR 스캔
- 실제 위치 권한
- 실제 푸시 알림

## TODO

- 전체 route guard 정책은 별도 단계에서 설계한다.
- 로그인된 사용자의 온보딩 화면 재진입 처리 기준을 정한다.

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
