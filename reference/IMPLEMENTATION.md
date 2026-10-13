# 구현 및 검증 기록

기준일: 2026-10-12. 요구사항은 상위 폴더의 `project.md`, `design-guideline.md`.

## 현행 타이포그래피 — TYPE POSTER / BLUE 추가 참고

기존 팔레트는 보존했다. 영문 주제목은 Anton 400(서체 자체가 굵은 condensed), 영문 부제는 Barlow Condensed 600 또는 500 italic, 한글 제목은 Noto Sans KR 700이다. 색상·배치·크기·행간·모션 선언과 JSX·데이터·미디어 불변 검사는 typography-verification.json에 기록한다. 아래 Noto Sans 제목과 size-adjust 설명은 이전 스타일 이력이다. 실제 브라우저 비교는 연결 부재로 미완료다.

## 이전 시각 스타일 — 첨부 포스터 적용

전체 시각 스타일은 첨부한 PORTFOLIO PEER REVIEW 이미지 기준이다. 크림 #E8D8BA, 청록 #508F8D, 잉크 #11130F, 노랑 #E5CC72를 기존 면에 적용했다. 색상은 시각적 근사값이며 이미지 파일의 픽셀 측정값이 아니다. 작은 보조 글자를 위한 #285B59와 밝은 표면 #F4EAD7은 구현 보정값이다.

영문 제목은 자체 호스팅 Noto Sans KR 800, 한글 강조는 650–800, 본문은 기존 400이다. 혼합형 제목과 좁은 이탤릭을 대체한 upright 강조는 같은 폰트를 각각 80%/70% size-adjust한 별칭으로 보정했다. font-size·행간·자간·컨테이너 치수는 바꾸지 않았다. 기존 종이 노이즈 opacity만 .12에서 .18로 조정했으며 새 이미지·장식·패턴은 추가하지 않았다.

COC는 기존 구조·모션의 근거로 남는다. PERSONAL WORKS는 이전에 적용한 회전 탐색과 상세 전환을 유지한다. 아래 COC 색상·서체 표는 최초 구현의 역사적 기록이며 현행 색·폰트 지침으로 사용하지 않는다.

검증: `node scripts/verify-style.mjs`로 변경 전 스냅샷과 비교한다. 기존 19개 CSS의 레이아웃·반응형·transform·transition·animation 선언, JSX·데이터·모션을 포함한 40개 파일, 미디어 27개 해시를 확인했다. 새 본문 색 조합의 최소 단색 대비는 5.03:1이다. `reference/font-metrics.json`은 설치된 실제 폰트 파일을 파싱한 글리프 폭 비교이며 브라우저 레이아웃 측정은 아니다.

미완료: 브라우저 연결이 없어 적용 전후 스크린샷·최종 줄바꿈·실제 높이와 버튼 폭·모바일 넘침·스크롤 재생은 확인하지 못했다. 소스 차이 검사와 DOM 테스트를 시각 검증 완료로 해석하지 않는다.

## 구현 범위

- React 19 + Vite 기존 프로젝트를 유지했다. App.jsx는 레이아웃과 15개 섹션을 import하고 순서대로 배치한다.
- 각 섹션 JSX/CSS/필요한 motion 파일은 `src/components/sections/<Section>/`에 함께 있다.
- Header/Footer는 layout, Link/Button/Photo/SectionLabel은 ui, 콘텐츠는 src/data, 전체 스크롤 설정은 src/motion으로 분리했다.
- 본문은 personal3 HTML에서 추출했다. 줄바꿈 태그는 공백으로 정규화했으며 개인 연락처는 빈 값 그대로 보존했다.
- ZARA 상세 4패널, UX 도입+6단계와 20자료 선택, 원본 확대 대화상자, 3영상과 18개 설명 항목, 개인 작업 2개, 학습 데모 3개, 기술 6분류, Q&A 4개를 유지했다.
- 모든 영상과 오디오 트랙은 원본 WebM 파일 그대로다. media-manifest.json에 출처·파일 크기·SHA-256을 기록했고 로컬 파일과 대조했다. 영상 변환/재인코딩은 하지 않았다.
- 이미지 시트는 기존 원본을 SVG viewBox로 표시 영역만 선택한다. BYREDO Hero 포스터도 첫 화면에서 해당 포스터의 제품 부분을 표시한다. 영상 플레이어에서는 원본 전체 비율을 사용한다.
- 개인 작업과 학습 데모는 기존 personal3의 결과 페이지를 새 창으로 연다. ZARA와 Notefolio도 원본 URL을 유지한다.

## COC 소스 확인값과 적용값

현재 배포 HTML/CSS/JS를 reference/coc.*에 저장했다. 실제 브라우저 화면을 관찰했다는 뜻은 아니다.

| 요소 | COC 확인값 | 구현 |
|---|---|---|
| 기본 색 | #F6F5F0 / #444444 / #98948C / #363434 | 공통 표면에 유지. 회색 표면 글자는 #2B2927로 보정 |
| 영문 글꼴 | EB Garamond, 주로 500 | EB Garamond Variable 자체 호스팅 |
| 한글 | 원본은 일본어 서체 | 권장안에 따라 Noto Serif KR / Noto Sans KR, 본문 16px 중심 |
| 헤더 축소 | 1초 위치/크기, .4초 배경, 62px 높이, 6px 모서리 | 유지. 메뉴 길이에 맞춰 축소 폭 680px |
| 링크 호버 | .5초, cubic-bezier(.33,1,.68,1), 두 레이어 ±125% | 공통 Link에서 유지. 장식 레이어 aria-hidden |
| Hero | 200svh, .2 임계점, 1000ms 커튼 | 충분한 데스크톱에서 유지. 실제 이야기 콘텐츠는 다음 독립 섹션 |
| 슬라이드 | 800ms 전환, 최초 3200 / 이후 2800ms 대기 | 이미지 clip-path/opacity 전환. 정지·이전·다음과 focus/hover 정지 추가 |
| 커튼 밴드 | #835F34 / #AA9160 / #C9AE77 / #DCC496 | Hero→다음 장 전환에 사용 |
| 프로젝트 패널 | 30px 외곽, 50px 안쪽, 75px 간격, 10/6px 모서리, 최대 .96축소 | 데스크톱 기본 수치에 반영. 개인 작업의 두 패널은 sticky+scale |
| 소개 오브젝트 | 작은 translateY 패럴랙스 | 업무 공간·작업 이미지·Lean Canvas에 ±25px |
| 푸터 | 회색 외부+차콜 내부, 20/10px 모서리 | 개인 이름·탐색·미등록 연락처로 교체 |
| Lenis | lerp .09 | GSAP ticker 하나와 연결, autoRaf false |

프로젝트별 색은 COC의 과자 브랜드 색을 복사하지 않고 기존 작업 이미지의 베이지·갈색·짙은 녹색에서 정했다. ZARA 상세와 UX의 ScrollTrigger pin/scrub은 문서의 신규 권장 구현이다. COC 원본이 모든 효과를 ScrollTrigger로 구성했다는 뜻은 아니다.

## 반응형·접근성 구현

- 820px 이하 모바일, 821–1199px 태블릿 조정. 가로 pin은 1024px 이상이면서 높이 740px 이상에서만 활성화한다. 낮거나 좁은 화면은 동일 콘텐츠를 세로 배치한다.
- 개인 작업 sticky는 1024px/800px 이상에서만 적용한다.
- reduced-motion 변경 시 GSAP matchMedia와 Lenis 인스턴스를 정리/재생성한다. 커튼·pin·패럴랙스·자동 슬라이드를 해제한다.
- 네이티브 dialog로 메뉴/기획 자료 확대를 구성했다. React cleanup에서 스크롤 잠금 해제와 트리거 포커스 복귀를 처리한다.
- 가로 패널의 포커스 이동은 해당 패널 위치로 문서 스크롤을 옮긴다. 이전/다음 버튼 및 방향키도 제공한다.
- 영상은 preload=none, controls, playsInline이며 자동 재생하지 않는다. 다른 영상 재생/화면 이탈/탭 숨김 시 정지한다.
- h1 하나, 순서별 h2, skip link, focus-visible, 이미지 설명, Q&A details/summary를 사용했다.
- 웹폰트를 자체 호스팅하며 OFL 라이선스를 public/licenses에 보관했다.

## 실제 실행한 검증

1. `yarn build`: 프로덕션 번들 생성 성공.
2. `yarn verify`: SSR로 실제 App을 렌더링하여 15개 섹션 순서, h1/중복 ID/내부 앵커/이미지 alt, 상세 패널/자료/영상 설명/기술/Q&A 개수 검증. 원본 미디어 27개 SHA-256 대조. 외부 링크 7개 HTTP 200 확인. 상세 결과는 verification.json.
3. `yarn test:interactions`: jsdom에서 메뉴 열기·닫기·cancel·언마운트 정리, UX 20자료 선택, 6개 자료 대화상자 내용 및 포커스 복귀 검증. dialog/미디어 쿼리/IntersectionObserver는 테스트 어댑터이므로 실제 브라우저 검증을 대체하지 않는다.
4. 로컬 Vite HTTP 응답과 미디어 파일 HTTP 응답 확인은 local-preview.json에 기록한다.

## 미완료 검증 및 입력

브라우저 스킬의 연결 및 복구 절차를 실행했으나 `No browser is available`, 사용 가능 목록 `[]`가 반환되었다. 따라서 다음 항목은 실제 화면에서 확인하지 못했다.

- COC 실제 화면·전환·호버·모바일을 열어 관찰하고 구현 스크린샷과 비교하는 작업.
- 1440 / 1280 / 1024 / 820 / 768 / 390 / 375 / 320px와 200% 확대의 넘침/간격/글꼴 렌더링.
- 긴 가로 pin 진입/이탈, 실제 휠·터치 감각, keyboard focus 가림 및 네이티브 dialog focus trap.
- 브라우저의 WebM 디코딩과 오디오 재생. 파일 무결성과 HTTP 로딩은 별도 검증했다.

현재 결과는 실행 가능한 구현이며, 위 시각·브라우저 완료 조건은 미충족이다. 화면 비교 없이 COC를 픽셀 단위로 재현했다고 주장하지 않는다.

이메일·이력서·GitHub는 원본에 미등록이므로 추가 입력이 필요하다. 프로젝트 기간·인원·기여도·성과를 새로 만들지 않았다. 키워드 챗봇은 문서에서 유지 여부 미확정이므로 이번 구현에 포함하지 않았다.

## 참고

- https://companycoc.com/
- https://personal3-gilt.vercel.app/
- https://gsap.com/docs/v3/Plugins/ScrollTrigger/
- https://github.com/darkroomengineering/lenis
