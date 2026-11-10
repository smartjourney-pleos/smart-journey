# 스마트 저니 (Smart Journey)

> 차량 좌석 센서와 내비 정보로 맛집 원격 웨이팅을 대신 걸어 주는 Pleos Connect 차량용 앱

탑승 인원은 좌석 점유로 제안하고, 내비 ETA와 매장 대기시간을 비교해 도착 직후 호출이 오는 시점에 웨이팅을 걸어 줍니다. 도착하면 도착 이벤트, 정차, 도어, 좌석 변화를 보고 "N명 중 M명 하차"를 매장 POS에 알려 줍니다.

## 저장소 구조

| 폴더 | 내용 | 기술 |
| --- | --- | --- |
| `vehicle-app/` | 차량용 앱 (Pleos Connect) | Kotlin, Jetpack Compose, Vehicle SDK, NaviHelper SDK |
| `server/` | 중계 서버 | Java 21, Spring Boot, WebSocket(STOMP), PostgreSQL |
| `pos-web/` | 매장 점주용 웹 POS (태블릿) | React, TypeScript, Vite |
| `docs/` | 기획·개발 명세 | |
| `apk/` | 심사용 release APK | |

## 실행 방법

> 개발 진행에 맞춰 채웁니다.

1. 서버: `docker compose up -d` 후 `cd server && ./gradlew bootRun` (기본 포트 8080)
2. POS: `cd pos-web && npm install && npm run dev`
3. 차량 앱: Android Studio에서 `vehicle-app/` 열기 → Pleos Connect 에뮬레이터(AVD)에서 실행. 에뮬레이터에서 로컬 서버 주소는 `http://10.0.2.2:8080`

## 테스트 환경 및 필요한 설정

- Android Studio + Pleos Connect Emulator (Virtual Console로 좌석·도어·주행 상태 조작)
- JDK 21, Node.js 20 이상, Docker
- 권한: `NAVI_ROUTE`, `NAVI_ROUTE_SEARCH`, `CAR_SEATS`, `CAR_DOORS`, `INTERNET`
- 카카오모빌리티 / TMAP API 키는 서버 환경변수로 설정 (앱에 넣지 않음)

## APK 위치

`apk/` 폴더 (파일명: `팀명_앱이름_release.apk`, 실행 가능한 release 버전)
