# Opus 5.5 대응 개선 분석

> 작성 2026-10-01 · 기준 커밋 `224de2a` · 대상: Claude Code에서 Claude Opus 5.5로 이 저장소를 작업할 때

## 요약

이 저장소는 LLM API를 호출하지 않는다(Anthropic·OpenAI 등 SDK 사용 없음). 그래서 "Opus 5.5에 맞춘다"는 말은 두 가지 일이다.

1. **에이전트가 읽는 지시 파일을 Opus 5.5에 맞게 고친다.** 대상은 `AGENTS.md`, `.claude/skills/**`, `.claude/commands/**`다. Opus 5.5는 이전 모델보다 지시를 문자 그대로 따르고 예시 코드를 가장 강한 신호로 삼는다. 그래서 없는 경로, 서로 모순되는 규칙, 결함이 섞인 템플릿이 예전보다 더 직접 결과물에 옮겨진다. 감사 결과 저장소가 직접 반박하는 사실 오류·모순 10건(High)과 개선 항목 14건(Medium)을 찾았다. 고친 내용은 [`opus-5.5-agent-config.patch`](./opus-5.5-agent-config.patch)에 있다(20개 파일, +142/−178, `git apply --check` 통과, **아직 적용하지 않음**).
2. **에이전트가 스스로 검증할 수 있게 만든다.** Opus 5.5가 가장 크게 좋아진 영역은 실제 저장소에서 테스트가 통과할 때까지 변경을 끝까지 밀고 가는 작업이다. 그런데 지금 이 저장소에는 테스트와 CI가 없고, `tsc`는 단독으로 실행하면 실패하며, Biome 검사는 기존 오류 88개 때문에 새 오류를 구분할 수 없고, 웹(원격) 세션에서는 `bun install`부터 실패한다.

분석하면서 코드 결함도 다수 찾았다. 가장 급한 것은 보안이다. 로그인한 사용자라면 누구나 스토리지의 아무 파일이나 지울 수 있고, 남의 게시글·상품 이미지를 지울 수 있으며, 아무 상품의 채팅방 목록과 마지막 메시지를 볼 수 있다. 또 인증 실패 시 API가 401이 아니라 500을 반환하고, 삭제 확인 모달이 항상 "취소"로 처리돼 게시글 삭제·댓글 삭제·채팅방 나가기가 동작하지 않는다. 전체 목록은 [4장](#4-코드베이스-개선-백로그)에 있다.

권장 순서는 검증 루프 구축, 지시 파일 patch 적용, P0 보안 수정(회귀 테스트 포함), P1 기능 버그, CI, P2 순이다([5장](#5-권장-진행-순서)).

## 1. 분석 전제

**대상 모델 — Claude Opus 5.5.** 아래 판단에 쓴 특성은 Opus 5.5 마이그레이션 가이드에 문서화된 것만이다.

- 지시를 더 정확하게, 문자 그대로 따른다. 이유 없는 강조("반드시", "CRITICAL")는 과잉 적용되고, 낡은 지시는 그대로 실행된다.
- 예시 코드가 가장 강한 신호다. 템플릿에 든 결함은 그대로 복제된다.
- 시키지 않아도 자기 작업을 검증한다. 검증할 명령이 있으면 쓰고, 없으면 못 한다.
- 큰 저장소에서 여러 단계를 거쳐 테스트를 통과시키는 작업과 코드 리뷰(더 많은 버그, 더 적은 오탐)에서 향상이 가장 크다.
- API 기본 effort가 `medium`이다(Opus 5는 `high`). 같은 effort에서 Opus 5보다 더 많이 생각하는 경향이 있다.
- 디자인 지시 없이 프런트엔드 작업을 맡기면 몇 가지 기본 스타일로 돌아간다. 피할 패턴을 구체적으로 적으면 잘 따른다.

**감사 범위.** `AGENTS.md`, `.claude/skills/{server,stylex,utils}/**`, `.claude/commands/*.md`. `CLAUDE.md`, `.claude/settings.json`, 훅, 서브에이전트 정의는 없다. 이 세션(Claude Code 2.1.286)은 `AGENTS.md`를 프로젝트 지시로 읽었다. 프롬프트를 조립하는 코드나 도구 정의, API 요청 코드가 없으므로 그쪽 감사 항목은 해당 없음이다.

**검증 방법.** 경로와 명령은 저장소에서 직접 확인했고, 런타임 동작(H4)은 Node 22와 Bun 1.3에서 재현했다. 4장의 코드 결함은 직접 확인한 것에 ✅, 리뷰 에이전트가 보고했지만 아직 재확인하지 않은 것에 🔎를 붙였다.

## 2. 에이전트 지시 파일 감사

### High — 저장소가 직접 반박하는 사실 오류와 모순

**H1. 명령 파일이 없는 파일을 읽으라고 한다** — `.claude/commands/server.md:4-5`, `server-domain.md:15-18`, `server-prisma.md:6`, `server-route.md:6-7`, `server-service.md:6`
`index.md`와 `context.md`는 어디에도 없다. `prisma.md`·`service.md`·`route.md`는 실제 파일명(`PRISMA.md` 등)과 대소문자가 달라서 macOS(대소문자 무시)에서만 열리고, 리눅스인 웹 세션과 CI에서는 실패한다. 에이전트는 매번 파일을 못 찾고 헤매는 데 턴을 쓴다. 조치: 실제 파일명으로 수정.

**H2. 스킬 경로 오타** — `AGENTS.md:28`
`claude/skills/stylex`에서 앞의 점이 빠졌다. 조치: `.claude/skills/stylex`.

**H3. 인증 오류 처리 요령이 코드와 반대** — `.claude/commands/server-auth.md:19,34`
"derive 안에서 직접 throw"를 권한다. `AUTH.md:25-45`와 실제 구현(`src/lib/elysia/auth.ts:123-126`)은 `onBeforeHandle`에서 처리한다. 두 문서가 같은 커밋(df718d7)에서 들어와 이력으로는 어느 쪽이 최신인지 가릴 수 없으므로 코드를 기준으로 삼았다. 조치: 코드에 맞게 수정.

**H4. 인증 실패 동작 설명이 사실과 다르다** — `server/AUTH.md:25-45,134-145`, `server/EDEN.md:112-122`
문서는 "인증 실패 시 `/login`으로 302 리다이렉트되고 브라우저가 따라간다", "401 `{ error, message }`를 반환한다"고 적고 있다. 실제로 Next 서버(Node)에서는 `redirect("/login")`이 상대 URL을 파싱하지 못해 예외가 나고, Elysia가 이를 잡아 **500**을 반환한다. Node 22에서 `Response.redirect("/login")`이 `TypeError: Failed to parse URL from /login`을 던지는 것을 재현했고, elysia 1.4.16의 `redirect`가 `Response.redirect`를 그대로 쓰는 것(`dist/utils.mjs:477`)도 확인했다. Bun에서는 302가 나가지만 fetch가 리다이렉트를 따라가 로그인 페이지 HTML을 200으로 받으므로 Eden의 `error`가 비어 있다. 어느 런타임에서도 문서대로 동작하지 않는다. 조치: 코드를 `status(401, …)`로 고치고(4장 P0-5) 문서를 새 계약으로 바꾼다. 문서만 먼저 바꾸면 다시 코드와 어긋나므로 같은 커밋으로 넣는다.

**H5. 문서에 복사한 구현이 실제와 다르다** — `server/EDEN.md:16-39, 98-110`
실제 `api`는 첫 접근 때 만들어지는 지연 Proxy이고(`src/utils/eden.ts:12-41`), 브라우저의 base URL은 `""`가 아니라 `window.location.origin`이다(`src/utils/url.ts:11-13`). 조치: 복사본을 지우고 파일 참조와 동작 설명으로 대체.

**H6. "shorthand 금지" 규칙이 코드베이스와 스킬 자신과 모순** — `stylex/SKILL.md:3,67`, `stylex/CONSTRAINTS.md:7,14,16`
"StyleX는 shorthand를 지원하지 않는다. 항상 longhand를 쓴다"고 하지만, 같은 파일 `CONSTRAINTS.md:56-58`은 단일 값 `margin`·`padding`을 허용하고, 코드는 `flex: 1` 152곳, `margin: 0` 192곳, `transition` 46곳을 쓴다(stories 제외). 실제로 지켜지는 규칙은 "다중 값 shorthand 금지"다. Opus 5.5가 문구대로 따르면 멀쩡한 코드를 대량으로 바꾸게 된다. 조치: 규칙을 실제 범위로 다시 쓴다(항상 로드되는 스킬 `description`의 문구 포함).

**H7. 예시가 규칙을 어긴다** — `stylex/PATTERNS.md:65`
`outline: '2px solid #6366f1'`은 `CONSTRAINTS.md:78-79`가 WRONG으로 지목한 바로 그 형태다. 조치: longhand로 분리.

**H8. 없는 토큰 파일과 토큰 이름** — `stylex/MIGRATION.md:18,42,65,81`, `stylex/CONSTRAINTS.md:195`
`src/styles/tokens.stylex.ts`, `@/styles/tokens.stylex`, `colors.muted`는 없다. 실제는 `src/app/global-tokens.stylex.ts`와 `colors.textMuted`(`global-tokens.stylex.ts:213`). 조치: 실제 경로와 이름으로.

**H9. 없는 문서 디렉터리** — `utils/SKILL.md:75`
유틸을 추가하면 `docs/utils/*.md`를 갱신하라고 하지만 그 디렉터리가 없다. 조치: 단계를 지우고 스킬 표 갱신으로.

**H10. 마이그레이션 실행 여부가 서로 다르다** — `server/SKILL.md:36` vs `AGENTS.md:30`
스킬(2025-11-30)은 도메인 추가 2단계에서 `prisma migrate dev`를 "실행"하라고 하고, 나중에 쓴 `AGENTS.md`(2025-12-01)는 요청 없이 실행하지 말라고 한다. 조치: 오래된 쪽을 더 엄격한 새 규칙에 맞춘다.

### Medium — 현재 코드와 어긋나거나 Opus 5.5에서 역효과가 나는 지시

**M1. 데이터 패칭 규칙이 현재 구조를 설명하지 못한다** — `AGENTS.md:25-27` (방향 확인 필요)
규칙은 "서버 컴포넌트 우선, 변경은 `useActionState`/`useTransition`"뿐이다. 2025-12-27 이후 채팅 목록과 마이페이지 요약은 React Query + `@suspensive`(`src/lib/queries/*`)로 바뀌었고, 변경은 대부분 `useTransition` 안에서 Eden을 직접 호출한다(약 28곳). `useActionState`는 2곳뿐이다. 에이전트는 어느 쪽이 현재 방향인지 알 수 없다. patch는 현재 구조를 그대로 규칙으로 옮겼고, 뮤테이션 뒤 `invalidateQueries`를 하라는 문장을 넣었다(지금 코드에는 없음, 4장 P1-11). React Query를 클라이언트 전용 화면의 표준으로 굳힐지, 서버 컴포넌트로 되돌릴지는 결정이 필요하다.

**M2. "Default to ASCII"** — `AGENTS.md:34`
Codex용 기본 문구로 보인다(커밋 fac9cf9 "docs: prompt for codex"). UI 문구·주석·문서가 한국어인 이 프로젝트에서 문자 그대로 따르면 영어 UI 문구를 쓰게 된다. 조치: "UI·주석·문서는 주변 파일처럼 한국어, 식별자·파일명은 ASCII".

**M3. 검증을 막는 문장, 검증 명령의 부재** — `AGENTS.md:7`
"요청하면 테스트/포매터를 돌릴 수 있다"는 문장은 자발적 검증을 막는 쪽으로 읽히고, 정작 무엇으로 검증하는지는 어디에도 없다. Opus 5.5는 명령만 알면 스스로 검증한다. 조치: Commands 섹션 추가, 문장 수정.

**M4. 사람용 가이드와 정의되지 않은 슬래시 명령** — `AGENTS.md:3,10-22`
요청 작성 요령과 `/plan`, `/review` 같은 명령 목록은 사람에게 하는 말이다. 이런 명령은 정의돼 있지 않아 에이전트는 쓸 수 없고, `/review` 같은 이름은 Claude Code 내장 명령과 겹칠 수 있다. 조치: README로 옮기고 자연어 요청 형태로 바꾼다.

**M5. 본문의 트리거 키워드 목록은 효과가 없다** — `server/SKILL.md:10-12`, `stylex/SKILL.md:10-12`, `utils/SKILL.md:10-12`
스킬 자동 호출은 frontmatter의 `description`(과 `when_to_use`)만 본다. 조치: 삭제.

**M6. 참조 파일의 frontmatter** — `stylex/SKELETON.md:1-8`
스킬 디렉터리 안의 참조 파일은 별도 스킬로 발견되지 않으므로 이 frontmatter는 아무 일도 하지 않는다. 조치: frontmatter 제거. 스켈레톤 작업에서 따로 자동 호출되게 하려면 `.claude/skills/skeleton/SKILL.md`로 승격하는 방법도 있다.

**M7. 빌드 설정 복사본이 이미 어긋났다** — `stylex/SKILL.md:22-44`
`next.config.ts`의 `dev`, `unstable_moduleResolution`, `experimental.authInterrupts`가 빠져 있다. 조치: 파일 참조로 대체.

**M8. 버전 표** — `server/SKILL.md:24-29`
Prisma 7.0.1로 적혀 있지만 실제는 7.2.0. 조치: 버전 열을 지우고 `package.json`을 기준으로.

**M9. 인자를 줘도 다시 묻는다** — `server-domain.md:20`, `server-prisma.md:9`, `server-route.md:10`, `server-service.md:10`
"Ask the user for…"가 무조건이라, `/server-domain Review - rating, content` 처럼 명세를 다 줘도 다시 묻게 된다. 조치: 인자에 빠진 것만 묻는다.

**M10. 템플릿이 결함을 복제한다** — `server/ROUTE.md:45,60`
`limit: t.Optional(t.String())`과 상한 없는 `parseInt`를 가르친다. 실제 라우트 18곳이 이 패턴 그대로여서 page size에 상한이 없고 `?limit=abc`면 NaN으로 500이 난다. 조치: `t.Numeric({ minimum: 1, maximum: 50 })`.

**M11. 소유권 규칙에 하위 리소스가 빠졌다** — `server/AUTH.md:114-132`
부모 리소스의 `isOwner`만 다룬다. 실제로 게시글·상품 이미지 삭제에 IDOR가 있다(P0-2). 조치: 하위 리소스는 부모 ID까지 조건에 넣는다는 규칙과 예시 추가.

**M12. 예시가 프로젝트에 없는 팔레트를 쓴다** — `stylex/PATTERNS.md:40-41,56-65,150,374,413-418`, `stylex/CONSTRAINTS.md:27,47,84`
`#1a1a2e`, `#2a2a4e`, `#6366f1`은 토큰에도 코드에도 없는 색이다. 토큰을 쓰라는 규칙과 모순이고, 코드에는 하드코딩 hex가 31곳 있다. 또 Opus 5.5는 디자인 지시가 없으면 기본 스타일로 돌아간다. 조치: 예시를 토큰으로 바꾸고, "색·글자 크기는 토큰, 새 화면은 기존 컴포넌트와 페이지 구성을 따른다"는 문장을 추가.

**M13. 강제되지 않는 규칙** — `utils/SKILL.md:22`
"인라인 구현 금지"인데, 날짜를 직접 포맷하는 곳이 7개 파일에 있고 그중 6개 파일은 `dayjs`를 직접 import한다. 코드로 강제할 수 있는 규칙은 코드로 강제하는 편이 모델과 무관하게 확실하다. 조치: Biome `noRestrictedImports`로 `src/utils/date.ts` 밖의 `dayjs` import를 막는다. 이 설정을 실제로 돌려 정확히 그 6개 파일만 잡히고 `date.ts`는 예외 처리되는 것을 확인했다.

**M14. 본문의 강조 표현** — `server/AUTH.md:13,15`, `server/EDEN.md:10`, `stylex/SKILL.md:65`, `utils/SKILL.md:22`
"⚠️ 중요", "필수", "Critical Rules", "반드시" 같은 표현은 이유 없이 쓰이면 과잉 적용을 낳는다. 조치: 평이한 문장과 이유로 바꾼다. 스킬 `description`은 자동 호출을 위한 라우팅 문구라 강한 표현을 유지했다.

### Low / 판단 필요 (patch에 넣지 않음)

- **L1.** `stylex/MIGRATION.md`는 CSS Module → StyleX 이전 가이드인데 `*.module.css`가 하나도 남지 않았다. 인라인 스타일 정리 부분만 PATTERNS로 옮기고 나머지는 정리할지 검토.
- **L2.** `stylex/CONSTRAINTS.md:251-262`의 "`flex: 1`과 `maxHeight`를 같이 쓰면 `flex: 1`이 무시된다"는 설명이 부정확하다. 무시되는 게 아니라 max-height가 늘어나는 크기를 제한한다. 해결책 자체는 맞다.
- **L3.** StyleX 스킬 파일 4개가 CRLF이고 `PATTERNS.md`는 CRLF와 LF가 섞여 있다. `.gitattributes`(`* text=auto eol=lf`)로 통일 권장.
- **L4.** Claude Code는 커스텀 명령을 스킬로 통합하는 방향이다. `server-*` 명령 5개는 server 스킬과 내용이 겹치므로, 새로 만들 때는 `.claude/skills/<name>/SKILL.md`를 쓰고 기존 것은 점진적으로 합치는 것을 검토.
- **L5.** 루트 `MIGRATION.md`(레거시 Express → Next 이전 계획)에는 완료된 이력이 섞여 있어 에이전트가 현재 사실로 읽을 수 있다. `docs/archive/` 같은 곳으로 옮기는 것을 검토.

### 제안 diff

[`docs/opus-5.5-agent-config.patch`](./opus-5.5-agent-config.patch)에 High·Medium 항목을 모두 담았다(L 항목 제외). 저장소 루트에서 `git apply docs/opus-5.5-agent-config.patch`로 적용하고, 원치 않는 부분은 적용 후 `git checkout -p <파일>`로 되돌리면 된다.

| 파일 | 담긴 항목 |
|---|---|
| `AGENTS.md` | Project·Commands 섹션(A7), M3, M4, M1, H2+H6, Prisma 명령 구분(H10), M2 |
| `README.md` | M4 — 요청 가이드 이동 |
| `package.json` | `typecheck` 스크립트(A1) |
| `biome.json` | M13 — `dayjs` 직접 import 금지 |
| `.claude/commands/*` | H1, H3, M9 |
| `.claude/skills/server/*` | H4, H5, H10, M5, M8, M10, M11, M14 |
| `.claude/skills/stylex/*` | H6, H7, H8, M5, M6, M7, M12, M14 |
| `.claude/skills/utils/SKILL.md` | H9, M5, M13, M14 |

서로 묶여 있는 부분: `AGENTS.md`의 `bun run typecheck`는 `package.json` 변경이, `utils/SKILL.md`의 `noRestrictedImports` 언급은 `biome.json` 변경이 있어야 맞다. `AUTH.md`·`EDEN.md`의 인증 실패 부분(H4)은 P0-5 코드 수정과 같은 커밋으로 넣는다.

## 3. 검증 루프와 하네스

이 세션에서 직접 실행해 본 현재 상태:

| 항목 | 상태 |
|---|---|
| 테스트 | 없음(러너·테스트 파일 0개) |
| CI | 없음(`.github/` 없음) |
| 타입체크 | `tsc --noEmit` 단독 실행 시 15개 오류(`PageProps`/`LayoutProps` 미정의). `next typegen` 후에는 0개 |
| Biome | `biome check` 88 errors, 15 warnings, 37 infos. 대부분 포맷(55개 파일)과 import 정렬(41건)이고, 실제 lint 오류는 3개(`useExhaustiveDependencies` 1, `noShadowRestrictedNames` 2) |
| 웹 세션 설치 | `bun install --frozen-lockfile`이 `postinstall`의 `prisma generate`에서 실패. `prisma.config.ts`의 `env("DIRECT_URL")`이 `.env` 없는 환경에서 예외를 던진다. 자리표시 값을 주면 성공 |

**A1. 타입체크 스크립트.** `"typecheck": "next typegen && tsc --noEmit"`(patch에 포함). 이 명령으로 오류 0을 확인했다.

**A2. Biome 기준선 정리.** 기존 오류가 88개면 에이전트가 자기 변경으로 생긴 오류를 구분할 수 없다. `bunx biome check --write`로 포맷과 import 정렬만 정리하는 커밋(동작 변화 없음)을 따로 만들고 남은 lint 오류 3개를 고치면, `bun run check`가 통과/실패 기준으로 쓸 수 있게 된다.

**A3. 테스트 도입.** `bun test`는 설정 없이 바로 쓸 수 있고 tsconfig의 `@/*` 경로도 해석한다. 권장 순서:

1. 순수 함수부터: `src/utils/date.ts`(시간대 포함), `src/lib/elysia/client/error.ts`의 `normalizeEdenError`.
2. 라우트 테스트: Elysia 앱은 `app.handle(new Request("http://localhost/api/..."))`로 서버 없이 호출할 수 있다. P0 권한 버그(스토리지, 하위 이미지, 채팅방 조회)를 고칠 때마다 "남의 리소스에 접근하면 403/404"를 확인하는 테스트를 같이 넣는다. `authGuard`가 Supabase를 직접 부르므로, 테스트에서 사용자를 주입할 수 있게 인증 해석 부분을 분리해야 한다. DB가 필요한 테스트는 로컬 Postgres 같은 별도 테스트 DB로 돌린다.
3. 주의할 점: `bun test`는 Bun 런타임에서 돈다. 이 앱은 Node에서 돌기 때문에 `Response.redirect`처럼 런타임마다 다른 동작은 `bun test`가 잡지 못한다(H4 버그는 Bun에서 재현되지 않는다). 런타임에 의존하지 않게 코드를 고치는 것이 먼저이고, 라우트 테스트를 Node에서 돌리고 싶다면 Vitest가 대안이다.

**A4. 웹 세션용 SessionStart 훅.** Claude Code on the web 세션이 시작될 때 의존성 설치와 타입 생성을 자동으로 하게 한다. 원격 세션(`CLAUDE_CODE_REMOTE=true`)에서만 실행되게 한다.

```bash
#!/bin/bash
# .claude/hooks/session-start.sh
set -euo pipefail
[ "${CLAUDE_CODE_REMOTE:-}" = "true" ] || exit 0
cd "$CLAUDE_PROJECT_DIR"
# postinstall의 prisma generate가 prisma.config.ts의 env("DIRECT_URL")을 요구한다. 코드 생성에는 DB 접속이 필요 없다.
export DIRECT_URL="${DIRECT_URL:-postgresql://placeholder:placeholder@localhost:5432/placeholder}"
export DATABASE_URL="${DATABASE_URL:-$DIRECT_URL}"
bun install --frozen-lockfile
bunx next typegen
```

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup",
        "hooks": [{ "type": "command", "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/session-start.sh" }]
      }
    ]
  }
}
```

함께 정리할 것: `prisma.config.ts:1`이 `dotenv/config`를 import하지만 `dotenv`가 `package.json`에 없다(c12를 통한 간접 의존에 기대고 있음). 직접 의존성으로 추가한다. `bun.lock`의 루트 패키지 이름이 템플릿 이름(`@stylexswc/next-turbopack-example`)으로 남아 있는데, 다음에 lockfile을 재생성할 때 정리된다.

**A5. CI.** 위 검사를 PR마다 돌린다.

```yaml
# .github/workflows/ci.yml
name: CI
on:
  pull_request:
  push:
    branches: [main]
jobs:
  check:
    runs-on: ubuntu-latest
    env:
      DIRECT_URL: postgresql://placeholder:placeholder@localhost:5432/placeholder
      DATABASE_URL: postgresql://placeholder:placeholder@localhost:5432/placeholder
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - run: bun run typecheck
      - run: bun run check
      # - run: bun test   # A3 이후
```

**A6. 문장으로만 있는 규칙을 권한 설정으로.** "요청 없이 DB 명령을 실행하지 않는다"는 지금 `AGENTS.md`의 문장으로만 존재한다. 권한 설정으로 옮기면 모델과 무관하게 지켜지고, 안전한 검사 명령은 매번 승인받지 않아도 된다(`.claude/settings.json`, A4의 hooks와 같은 파일).

```json
{
  "permissions": {
    "allow": ["Bash(bun run typecheck)", "Bash(bun run check)", "Bash(bun run lint)", "Bash(bun run format)", "Bash(bun run db:generate)", "Bash(bun test)", "Bash(bun test *)"],
    "ask": ["Bash(bun run db:migrate)", "Bash(bun run db:migrate *)", "Bash(bunx prisma migrate dev *)", "Bash(bun run db:push)", "Bash(bunx prisma db push *)"],
    "deny": ["Bash(bun run db:reset)", "Bash(bunx prisma migrate reset *)"]
  }
}
```

**A7. `AGENTS.md`는 에이전트가 스스로 알 수 없는 맥락 위주로.** patch에 Project·Commands 섹션을 넣었다. Opus 5.5에게 가장 값진 텍스트는 이 앱이 무엇인지, 코드가 어디 있는지, 무엇으로 검증하는지, 어떤 명령이 왜 위험한지다. 나중에 `CLAUDE.md`를 추가하면 기본 설정에서는 `AGENTS.md`를 더 이상 읽지 않는다. 그때는 `CLAUDE.md`에 `@AGENTS.md`를 넣어 한 곳을 기준으로 유지한다.

**A8. 프로젝트 전용 리뷰 스킬.** Opus 5.5는 코드 리뷰가 특히 좋아졌다. 이번에 반복해서 나온 결함 유형을 체크리스트로 만든 리뷰 스킬(예: `.claude/skills/review/SKILL.md`)을 두면 PR마다 같은 기준으로 볼 수 있다. 넣을 항목: 보호 라우트의 소유권 확인(하위 리소스 포함), 스토리지 경로의 소유자 prefix, `limit`·배열·문자열 상한, 401 처리, React Query 무효화, StyleX 규칙, 날짜 유틸 사용. "심각한 것만 보고하라" 같은 필터는 넣지 않는다. 이 계열 모델은 그런 필터를 문자 그대로 따라 놓치는 버그가 늘어난다. 모든 발견을 심각도·확신도와 함께 보고하게 하고, 거르는 일은 사람이 한다.

**A9. effort 조절.** Claude Code에서는 `/effort`, 설정의 `effortLevel`, 스킬 frontmatter의 `effort`로 조절한다. 보안 수정·대규모 리팩터링·리뷰는 높게, 단순 수정은 기본값으로 두고, `xhigh`/`max`는 효과를 확인한 작업에만 쓴다. 큰 작업은 완료 조건("`bun run typecheck`와 `bun test` 통과")까지 포함한 명세를 처음에 한 번에 주는 것이 가장 효과적이다.

## 4. 코드베이스 개선 백로그

✅ 직접 확인 · 🔎 리뷰 에이전트 보고(재확인 전)

### P0 — 보안·데이터

1. ✅ **스토리지에 권한 확인이 없다.** `DELETE /api/storage/delete`(`src/lib/elysia/routes/storage.ts:398-435`)는 버킷 이름만 검사하고 호출자를 보지 않는다. service-role 클라이언트(`src/lib/services/storage.ts`)를 쓰므로 Storage RLS도 우회한다. 공개된 상품 이미지 URL에서 경로만 알면 로그인한 누구나 남의 이미지를 지울 수 있다. `GET /storage/list/:bucket`, `POST /storage/signed-url`도 같다. 🔎 업로드 키에 소유자 prefix가 없다. 수정: 업로드 경로를 `${userId}/...`로 만들고 그 prefix 안에서만 삭제·서명을 허용, 클라이언트가 쓰지 않는 list·url·signed-url 라우트는 제거.
2. ✅ **하위 이미지 IDOR.** `DELETE /api/posts/:id/images/:imageId`는 `:id`의 소유권만 확인하고 `postImage.delete({ where: { id: imageId } })`로 지운다(`posts.ts:662-668`, `services/post.ts:493-497`). 자기 게시글 ID와 남의 이미지 ID를 조합하면 남의 이미지가 지워진다. 🔎 마켓도 같다(`markets.ts:497-503`, `services/market.ts:471-475`). 수정: `deleteMany({ where: { id: imageId, postId } })`, 0건이면 404.
3. ✅ **상품별 채팅방 목록이 새어 나간다.** `GET /api/chat/rooms/market/:marketId`(`chat.ts:733-772`)는 호출자가 판매자인지, 방 멤버인지 확인하지 않고 그 상품의 모든 방의 멤버와 마지막 메시지를 반환한다. 수정: 판매자 본인이거나 멤버인 방만 반환.
4. ✅ **카탈로그 쓰기에 역할 확인이 없다.** 소속사·그룹·아티스트 생성·수정·삭제가 `authGuard`만 거친다(`artists.ts:335` 이후). 로그인한 누구나 삭제할 수 있다. 🔎 `GalmangPoca`에는 `userId`가 없어 소유권을 확인할 방법이 없다. 수정: 관리자 역할 확인, GalmangPoca에 소유자 컬럼.
5. ✅ **미인증 API 호출이 500을 반환한다.** H4 참고. 🔎 그 결과 비로그인 방문자에게 찜 수가 0으로 보이고, 세션이 만료된 상태에서 회원 탈퇴를 누르면 실패했는데도 "완료"가 뜬다. 수정: `onBeforeHandle`에서 `status(401, { error: "Unauthorized" })`를 반환하고, 서버 컴포넌트는 401이면 `unauthorized()`, 클라이언트는 로그인 유도 UI.
6. ⚠️ **RLS 확인 필요.** 마이그레이션에 RLS 구문이 하나도 없고(✅), 브라우저가 Realtime으로 `ChatMessage` 테이블 변경을 구독한다. Supabase 기본 권한 설정 그대로라면 공개된 anon 키로 테이블을 직접 읽을 수 있다. Supabase 대시보드에서 테이블별 RLS 상태부터 확인한다.
7. 🔎 채팅방에 아무나 멤버를 추가할 수 있고, 남의 상품으로 거래 채팅방을 만들 수 있다(`chat.ts:164-215, 417-475, 669-707`).
8. 🔎 업로드 검증을 클라이언트에 의존한다. SVG를 허용하고, MIME은 클라이언트가 보낸 값을 쓰고, 파일 개수 제한이 없다(`storage.ts:13-24, 221`).

### P1 — 기능 버그

9. ✅ **삭제 확인 모달이 항상 "취소"로 처리된다.** 입력 필드가 없는 확인 모달은 확인 버튼도 `onConfirm(null)`을 호출하고(`components/ui/modal/confirm-modal.tsx:255`), `confirmAction`은 `result !== null`을 반환한다(`open-confirm.tsx:91-92`). 그래서 게시글 삭제, 댓글 삭제, 채팅방 나가기가 동작하지 않는다. 수정: 필드가 없을 때 확인은 `{}`로 넘긴다.
10. ✅ **회원 탈퇴 실패를 성공으로 표시한다.** 404일 때만 오류로 처리한다(`mypage/security/page.client.tsx:306-324`). 500이나 429에도 "회원 탈퇴가 완료되었습니다"를 띄우고 로그아웃시킨다.
11. 🔎 React Query 캐시를 무효화하거나 로그아웃 때 비우는 코드가 없다. 프로필을 수정해도 최대 5분간 옛 닉네임이 보이고, 공용 기기에서 로그아웃한 뒤 이전 사용자의 채팅 목록이 캐시에서 보일 수 있다.
12. 🔎 마이페이지 하위 8개 라우트에 세션 확인이 없다. 비로그인으로 들어가면 TypeError가 나거나 가짜 빈 화면이 나온다.
13. ✅ **page size 상한이 없다.** 라우트 18곳이 `Number.parseInt(query.limit)`을 상한 없이 쓴다. `?limit=1000000`이면 전체를 조회하고, `?limit=abc`면 NaN으로 500이 난다. 템플릿(M10)과 함께 고친다.
14. 🔎 탈퇴한 사용자가 다음 `findOrCreate` 호출에서 복구된다. `findOrCreate`는 동시 호출 시 경쟁 조건이 있고, 닉네임 유일성은 강제되지 않는다.
15. ✅ **날짜 유틸에 시간대 처리가 없다.** `src/utils/date.ts`는 실행 환경의 시간대로 포맷한다. 🔎 Vercel(UTC)에서 서버가 렌더한 시각이 한국 시간과 9시간 어긋나고, 클라이언트 렌더와 텍스트가 달라 hydration 불일치가 날 수 있다. 수정: dayjs `utc`·`timezone` 플러그인으로 `Asia/Seoul` 고정.
16. ✅ **스피너가 돌지 않는다.** `className="animate-spin"`이 4곳(글쓰기, 글 수정, 상품 등록)에 있지만 Tailwind가 없어 아무 효과가 없다. 수정: `stylex.keyframes`로.
17. ✅ 활동 피드 커서가 한 항목씩 건너뛴다(`services/activity.ts:88-89`: `nextCursor`를 다음 페이지의 첫 항목으로 잡은 뒤 `skip: 1`). 🔎 다만 Activity·Transaction을 만드는 코드가 없어 해당 화면은 지금 항상 비어 있다.
18. 🔎 그 밖에: 필터를 빠르게 바꾸면 늦게 온 응답이 화면을 덮어쓴다, 검색하면 상태·카테고리 필터가 무시된다, 게시글 수정이 4단계로 나뉘어 중간 실패 시 이미지가 사라진다, 댓글 "더보기"가 두 번 눌린다, 채팅 이전 메시지를 불러올 때 스크롤이 튄다, 한글 입력 조합 중 Enter로 두 번 전송된다.

### P2 — 성능·품질

19. 🔎 전역 `optionalAuth` derive 때문에 공개 라우트를 포함한 거의 모든 API 요청이 `getClaims`와 `getSession`을 부르고, 보호 라우트는 한 번 더 인증한다.
20. 🔎 자주 조회하는 컬럼에 인덱스가 없다. 예: `ChatMessage(roomId, createdAt)`, `ChatRoomMember(userId)`, 이미지 테이블의 부모 FK.
21. 🔎 rate limit이 likes 라우트에만, 프로세스 메모리 저장소로 걸려 있다.
22. 🔎 `onError`가 없어 Prisma 오류 메시지가 500 본문으로 그대로 노출되고, 오류 응답 형식이 라우트마다 다르다.
23. 🔎 쓰이지 않는 코드와 중복: `components/confirm-modal`(ui/modal과 중복), `components/support/*`의 옛 복사본, `auth-status.tsx`, `use-debounce`·`use-disclosure`, 거의 같은 `main-poca-item`과 `main-recent-poca-item`, 최신 섹션과 같은 쿼리를 쓰는 BEST 섹션.
24. 🔎 아이콘만 있는 버튼·링크 약 45개에 접근 가능한 이름이 없다.
25. 🔎 `src/app/page.tsx:25`의 `revalidate = 120`은 Eden이 `cookies()`를 읽어 라우트가 동적이 되므로 효과가 없다.
26. ✅ 코드와 다른 주석: `auth.ts:96-97`은 "401 스키마가 자동 추가된다", "derive에서 오류를 반환한다"고 하지만 둘 다 사실이 아니다. 🔎 `storage.ts:230`, `chat.ts:732`, `users.ts:212`도 같다.

## 5. 권장 진행 순서

1. **검증 루프**(A1, A2, A4, A6): patch의 `package.json`과 `AGENTS.md` Commands 부분, Biome 정리 커밋, SessionStart 훅, 권한 설정.
2. **지시 파일 patch 적용**: M1 방향을 먼저 정한다. H4 부분은 3단계의 P0-5와 같은 커밋으로 넣는다.
3. **P0 보안**: 항목마다 회귀 테스트(A3)를 같이 넣는다. RLS는 대시보드 확인부터.
4. **P1 기능 버그**: 9, 10, 16은 작고 효과가 커서 먼저 한다.
5. **CI**(A5).
6. **P2**.

P0·P1 목록을 `IMPLEMENTATION_GAPS.md`로 옮겨 두면 다음 세션의 에이전트가 그대로 이어받을 수 있다.
