# smart-journey-web

스마트 저니(Smart Journey)의 매장 점주용 웹 POS입니다. 태블릿 가로 화면 기준이며, 차량 앱이 보낸 웨이팅을 실시간으로 확인하고 호출·착석·노쇼를 처리합니다.
프로젝트 소개와 전체 구조는 [smart-journey-main](https://github.com/smartjourney-pleos/smart-journey-main)을 참고하세요.

## 기술 스택

React 19, TypeScript, Vite, Tailwind CSS 4, motion, STOMP(@stomp/stompjs), Vitest

## 실행 방법

```bash
npm install
npm run dev      # http://localhost:5173
```

`/api`, `/ws` 요청은 `http://localhost:8080`(백엔드)으로 프록시됩니다. 서버가 없으면 목 데이터로 동작합니다. 시연용 테스트 PIN은 `1234`입니다.

| 명령 | 설명 |
| --- | --- |
| `npm run build` | 타입 체크 후 프로덕션 빌드 |
| `npm run lint` | oxlint |
| `npm test` | Vitest 단위/E2E 테스트 |

## 브랜치 규칙

| 브랜치 | 용도 |
| --- | --- |
| `main` | 제출·심사용 안정 버전 |
| `test` | 통합 테스트·시연 검증 |
| `dev` | 개발 통합 |
| `feature/기능명` | 기능 작업, `dev`로 PR |

`main`, `test`는 보호 브랜치로 직접 푸시가 막혀 있고 PR로만 병합합니다. 공개 저장소이므로 API 키와 `.env`는 커밋하지 않습니다.
