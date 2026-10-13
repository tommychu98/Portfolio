# Tommy Chu Portfolio

주경덕(Tommy Chu)의 웹디자인·웹퍼블리싱 포트폴리오입니다. 프로젝트 소개, 작업 태도, 프로필, 영상 작업 및 기술을 React 기반의 반응형 화면으로 구성했습니다.

## 시작하기

Node.js 22.12 이상이 필요합니다. 현재 Node.js 24에서 설치와 빌드를 확인했습니다.

```bash
npm ci
npm run dev
```

터미널에 표시된 로컬 주소로 접속합니다. 기본 주소는 http://localhost:5173/ 입니다.

## 빌드

```bash
npm run build
npm run preview
```

빌드 결과는 `dist/`에 생성됩니다. 의존성 버전은 `package-lock.json`으로 관리합니다.

## 사용 기술

- React, JavaScript, Vite
- CSS와 반응형 레이아웃
- GSAP, ScrollTrigger, MorphSVG, Lenis

## 프로젝트 구조

```text
src/        컴포넌트, 섹션, 콘텐츠 데이터, 스크롤 모션
public/     이미지, 영상, 폰트 라이선스 등 정적 파일
scripts/    콘텐츠 및 상호작용 검증 스크립트
reference/  기존 참고 자료와 구현 기록
```

DIPTYQUE 프로젝트 소개는 `src/components/sections/ZaraOverview/`에서 관리합니다. 폴더명과 내부 앵커는 기존 연결을 유지하기 위해 남겨 두었습니다.

## 주요 명령

```bash
npm run lint
npm run test:interactions
```

`npm run import:content`는 저장된 원본 자료로 콘텐츠를 다시 생성하므로 수동으로 수정한 데이터를 덮어쓸 수 있습니다. 재수집이 필요한 경우에만 실행하세요.

## 저장소 관리

`node_modules/`, `dist/`, 환경변수 파일(`.env`, `.env.*`) 및 테스트 결과는 커밋하지 않습니다. 실행에 필요한 소스, 공개 에셋, 설정 파일과 잠금 파일을 함께 관리합니다.
