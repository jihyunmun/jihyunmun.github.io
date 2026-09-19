# 홈페이지 전면 개편 — 설계 문서

- **작성일**: 2026-09-16
- **대상**: `https://jihyunmun.github.io` (repo `jihyunmun/jihyunmun.github.io`)
- **작업 브랜치**: `redesign` (기준 `origin/master`)
- **상태**: 설계 확정 대기 (사용자 검토 후 implementation plan으로 이행)

---

## 1. 배경과 목표

현행 사이트는 Jekyll + Hamilton 테마 위에 5개의 텍스트 목록 페이지(`about` / `research` /
`publications` / `projects` / `patents`)로 구성되어 있다. 각 페이지는 제목·불릿·PDF 링크의
나열이며, 연구 내용을 **시각적으로** 전달하는 요소가 거의 없다. 논문 썸네일 PNG 6개가
`publications.md`에 삽입되어 있으나 모델 구조도를 축소한 것이어서 내용 전달력이 낮다.

**목표**: 목록형 사이트를 **쇼케이스형 사이트**로 전환한다. 대표 연구를 이미지·영상으로 먼저
보여주고, 전체 목록은 뒤로 물린다. 레퍼런스로 지목된 세 사이트
(cathy-fang.com, yueyang.design, jingyaowu66.github.io)의 공통 문법 — 최소 내비게이션,
단일 컬럼, 큰 미디어 썸네일 그리드, 모노크롬 팔레트 — 를 따르되, 디자인 포트폴리오가 아니라
임상 지향 연구자의 사이트라는 점을 반영한다.

### 사이트 비노출 항목

다음은 로컬 연구 워크스페이스에만 존재하며 **사이트에 싣지 않는다**:

- **ANR–NRF 2026 `CHIRO-NEURO` 제안서** — 심사 중인 연구비 제안이며 공개 대상이 아니다.
  (사용자 지시, 2026-09-16) News·Research·CV 어디에도 등장시키지 않는다.
- `lifeformer` / LifeCast — 개인 프로젝트.
- 미공개 데이터셋 경로, 협력 기관 내부 정보, 심사 중 논문의 수치.

### 비목표 (Non-goals)

- 블로그 / 포스트 기능 (현행 `_posts/`의 테마 샘플 글은 전부 제거)
- 다국어(한국어) 버전 — 영문 단일
- 검색, 댓글, 애널리틱스 대시보드
- 논문 BibTeX 자동 생성 / Scholar 자동 동기화
- CV PDF 문서 자체의 작성·개편 — 2026-09판을 `assets/pdfs/cv.pdf`로 복사해 링크만 건다(§10-4).

---

## 2. 독자와 포지셔닝

**1차 독자: 학계(교수 임용·박사후 지원·공동연구), 2차: 산업계 리서치 조직.** (사용자 확인,
2026-09-16)

이 결정이 만드는 구체적 결과:

- 랜딩의 한 줄 문구는 응용 나열이 아니라 **연구 프로그램의 명제**여야 한다.
- 대표 연구 배열은 질환별(ASD / CKD / dysgraphia)이 아니라 **기여의 성격별**로 — 신호 분석,
  측정 방법론, 표현학습, 평가 방법론 — 배열해 coherent한 research statement로 읽히게 한다.
- 산업계 커버를 위해 코퍼스·툴킷·특허를 `Resources` 항목으로 노출하되 학술 항목보다 뒤에 둔다.
- `under review` / `in progress` 상태를 명시적으로 표기해 확정 결과와 구분한다. (overclaiming 방지)

---

## 3. 정보 구조

| 경로 | 내용 |
|---|---|
| `/` | hero(이름·명제·bio·링크) · News 4건 · Selected Research 7건 · Resources · footer |
| `/research/` | 대표 연구 7건 인덱스 (랜딩과 동일 그리드, 상태·연도 필터 없이 전체) |
| `/research/<slug>/` | hero 미디어 → TL;DR 3줄 → figure 중심 서술 → 논문·코드·데이터 링크 |
| `/publications/` | 연도 역순 전체 목록 · venue 태그 · PDF 링크 · 미니 썸네일 |
| `/cv/` | CV PDF + 학력 + funded projects 7건 + 특허 1건 + 소프트웨어 등록 2건 + grants 5건 |

**내비게이션은 `Research` / `Publications` / `CV` 3개.**

현행 페이지의 처리:

- `about.md` → 랜딩 hero bio + `/cv/` 학력 섹션으로 분할 흡수
- `research.md` (Research Areas 3분류) → 삭제. `/research/`는 대표 연구 7건의 인덱스로 재정의되므로
  기존 URL은 리다이렉트가 아니라 **의미가 대체**된다.
- `projects.md`, `patents.md`, `education.md` → `/cv/`로 흡수 (funded projects 7건). `patents.md`는 **Patents & Software
  Registrations**로 확장한다(§5-⑦, §10-9).
- `autism.md`, `ckd.md` → `/research/asd-severity/`, `/research/ckd-speech/`로 재작성
- `categories.md`, `tags.md`, `years.md`, `faq.md`, `docs.md`, `_posts/*` → 삭제 (테마 잔여물)

> **가정**: 기존 URL로 유입되는 외부 링크가 존재할 수 있다. `/about/`, `/projects/`, `/patents/`,
> `/education/`, `/autism/`, `/ckd/` 6개에 리다이렉트 stub을 둔다 (§9). `/publications/`는 경로가
> 유지되고, `/research/`는 인덱스로 의미가 대체되므로 리다이렉트 대상이 아니다.

---

## 4. 비주얼 디자인 시스템

목업(2026-09-16, Artifact)에서 확정한 값.

### 색

| 토큰 | Light | Dark | 용도 |
|---|---|---|---|
| `paper` | `#F1F2EE` | `#101215` | 배경 |
| `well` | `#FAFAF8` | `#181A1F` | 미디어 프레임 바탕 |
| `ink` | `#15171B` | `#E9E9E3` | 본문 |
| `soft` | `#5B6066` | `#9BA1A8` | 보조 텍스트 |
| `faint` | `#8A9098` | `#6E747C` | 캡션·축 라벨 |
| `rule` | `#DBDDD6` | `#2A2E35` | 구분선·테두리 |
| `accent` | `#2A3C8F` | `#92A6F2` | 링크·강조 (UI 유일 액센트) |

**그림 전용 4색 램프** — UI에는 쓰지 않는다. 궤적 속도, forecast error, 스펙트로그램 세기,
z-score 이탈도가 사이트 전체에서 동일한 색 문법을 갖도록 강제한다.

`slow #1B2A6B` → `mid #2E8F9E` → `fast #E8A33D` → `peak #C0442F`
(dark: `#5B73D8` / `#49C0CE` / `#F0B75C` / `#E46A52`)

중립색은 순색 회색이 아니라 종이 쪽으로 미세하게 치우친 값을 쓴다.

### 타이포그래피

| 역할 | 서체 | 용도 |
|---|---|---|
| Display | **Spectral** 400 | 제목 전용 (h1 `clamp(38px, 6.4vw, 60px)`, h2/h3) |
| Body | **IBM Plex Sans** 400/500/600 | 본문 16–17px / line-height 1.6 / 최대 65–70ch |
| Utility | **IBM Plex Mono** 400/500 | venue 태그, 캡션, 축 라벨, 수치, 내비, 날짜 |

Google Fonts에서 `display=swap`으로 로드하고 실제 fallback 스택을 명시한다. Plex가
계측기 계열 서체이므로 논문 figure의 축 라벨과 웹 캡션이 동일 서체로 이어진다.

### 레이아웃

- 단일 컬럼, `max-width: 1080px`, 좌우 여백 최소 24px (모바일 16px 이상 보장)
- 대표 연구 ①은 full-width feature (`aspect-ratio 16/7`), ②–⑦은 2열 그리드 (`5/3`)
- 760px 이하에서 1열로 스택
- 섹션 간격 76–84px, 카드 간격 56px×40px
- 다크모드: `prefers-color-scheme` + `data-theme` 스탬프 양방향 대응

### 인터랙션

hover 시 비디오 재생 외의 애니메이션은 두지 않는다. feature 미디어의 draw-on은 정지
상태(poster/ghost)에서 시작해 첫 프레임이 비어 보이지 않게 한다. `prefers-reduced-motion`
에서는 모든 재생·전환을 정지 프레임으로 대체한다.

---

## 5. 대표 연구 7건과 미디어 계획

배열 순서는 §2의 "기여의 성격별" 원칙을 따른다. 자산 경로는
`/Users/jihyunmun/Desktop/postdoc/projects/` 기준.

### ① Forecasting 기반 surprise signal — **feature (full-width)**

- **slug**: `handwriting-surprise`
- **상태**: In preparation, 2026
- **미디어**: 6초 무음 루프 MP4. 대조군/dysgraphia 궤적이 병렬로 그려지며 per-timestep
  forecast error가 색으로 표시되고, 하단에 시간 정렬된 surprise trace가 함께 움직인다.
- **자산 (확정, 2026-09-19 사용자 지정)**:
  `dysgraphia/trajectory-viz/output/comparisons/diagramo_dictation_speed__speed.mp4`
  — 손글씨/dysgraphia 관련 영상은 이 계열(DiaGraMo dictation, 속도 컬러코딩)을 쓴다.
  보조: 같은 폴더의 `diagramo_dictation_speed__plain.mp4`(단색 대조군용),
  `drotar_pressure.mp4`(압력 채널). poster 후보 `output/talk_deck/media/vid_poster.png`.
- **인코딩 확정 (D21)**: 원본 1086×748 / 30fps / 75.97초 / 4.43MB →
  **전체를 9× 가속**하여 8.44초로 압축. 구간 트림이 아니라 전체 가속을 택한 이유는,
  두 패널이 백지에서 채워지는 과정을 보여줄 때 색 대비가 첫 프레임에 주어지는 대신
  **눈앞에서 생겨나기** 때문이다. 중간 구간(44–50s, 30–36s)은 문장 중간에서 시작·종료되어
  루프가 어색했다.
  ```
  ffmpeg -i diagramo_dictation_speed__speed.mp4 \
    -filter:v "setpts=PTS/9,fps=25" -an \
    -c:v libx264 -crf 26 -preset slow -pix_fmt yuv420p -movflags +faststart out.mp4
  ```
  결과 **181KB** — 2MB 예산의 9%. WebM(VP9) 병행 인코딩과 poster JPG 추출을 추가한다.
- **후속 과제 (런칭 차단 아님)**: matplotlib 프레임에 빈 공간이 많다 — x축이 350mm까지
  가는데 글씨는 ~250mm에서 끝나고 축 라벨이 논문용 크기다. `trajectory-viz`에서 축 범위를
  좁히고 라벨을 키워 재렌더하면 화면 면적을 회수할 수 있다. 구간 선택과는 별개 작업.
- **추가 작업**: surprise 채널을 컬러 채널로 추가 렌더 + 2패널 병렬 합성 (trajectory-viz 재실행)

### ② Profiling handwriting-process deviations in developmental dysgraphia

- **slug**: `handwriting-profiling`
- **정식 제목** (arXiv 확정판): *Profiling Handwriting-Process Deviations in Developmental
  Dysgraphia: An Open, Normatively-Referenced Instrument*
  — 로컬 `paper/main.tex`의 제목에는 "Pre-Registered"가 들어 있으나 **arXiv 공개판에서 빠졌다.
  공개된 쪽을 정본으로 쓴다.**
- **저자**: Jihyun Mun, Mounîm A. El-Yacoubi
- **상태**: **Preprint 공개 + Behavior Research Methods under review**
  - arXiv: `2609.15435` (2026-09-14 투고, cs.HC) — <https://arxiv.org/abs/2609.15435>
  - 코드: <https://github.com/jihyunmun/handwriting-process-profiling> — **public, v1.0.0**
    (MIT / 파생 데이터 CC-BY-4.0). 실제로 연결 가능한 링크다.
- **코호트**: 체코 아동 257명 (전형발달 110 · dysgraphia 147), DiaGraMo
- **미디어**: 12축 deviation profile이 0에서 채워지는 4초 루프 + 프로파일 갤러리 정지 이미지
- **자산**: **보유.** `dysgraphia/motor-domain-profiling/paper/figures/figure_group_profile.png`,
  `e4b_profile_gallery.png`, `figure_2_vocabulary_structure.png`,
  `dysgraphia/output/talk_deck/media/fig_group_radar.png`, `fig_individual_trio.png`
- **추가 작업**: 웹용 재렌더 (라벨 확대, 범례 정리, 다크모드 대응 — SVG 우선)
- **주의**: DiaGraMo 데이터셋은 **타인의 것**이다 (Zvončáková et al. 2026, Zenodo
  10.5281/zenodo.18299327, CC-BY-4.0). 본인 코퍼스로 표기하지 않는다.
- **확인 필요**: 로컬 `paper/sections/07_back_matter.tex`의 code availability가 아직
  `[repository URL]` 플레이스홀더다. arXiv 공개판에 실제 URL이 들어갔는지 확인 필요.

### ③ Language models for clinical speech assessment

- **slug**: `language-models-assessment`
- **경위**: 원래의 disentangled-latent 카드는 제거되었다(사용자 지시, 2026-09-19). 그 자리를
  **NLP / computational linguistics / LLM 활용**으로 채우되, **출판된 기여만으로 구성한다**
  (사용자 선택). pre-pilot 단계인 `dysgraphia/NLP/` surprisal 제안서는 **싣지 않는다** —
  제거된 ③과 같은 "미래형" 위험을 반복하지 않기 위해서다.
- **상태**: Interspeech 2024 · LREC-COLING 2024 — **둘 다 출판됨**
- **내용**: ASR 전사 위에서 **fine-tuning · prompt tuning · parameter-efficient learning을
  비교**해 임상의 중증도 점수를 예측한 연구(Interspeech 2024)와, 한국어 ASD 아동 코퍼스 구축 및
  발음·의사소통 특성의 언어학적 분석(LREC-COLING 2024).
- **⑤와의 역할 분담**: ③은 **언어모델 방법론** 기여, ⑤는 **배포된 임상 평가 시스템**.
  두 카드가 Interspeech 2024를 공유하지만 프레이밍이 다르므로 중복으로 읽히지 않게 한다
  (§2의 "기여의 성격별 배열" 원칙).
- **미디어**: 전사 → 언어모델 → 중증도 점수 경로에 세 가지 적응 방식(full FT / prompt / PEFT)을
  분기로 그린 도식 + 방식별 성능 비교. 논문 그림을 웹용으로 재렌더.
- **자산**: `assets/images/2024_interspeech.png` (현 repo) — 재렌더 필요.

### ④ Speech-based detection and staging of chronic kidney disease

- **slug**: `ckd-speech`
- **상태**: Interspeech 2023 · 2025, PSS 2022, O-COCOSDA 2022
  - **주의**: 이전에 있던 CKD 저널 in-preparation 논문은 사용자가 CV에서 제거했다(D26). 싣지 않는다.
- **미디어**: 대조군/CKD 동일 발화의 스펙트로그램 + glottal flow 파형 병렬, 재생 헤드 이동
- **자산**: 논문 figure `assets/images/2025_interspeech_ckd.png`(현 repo) — 웹 재렌더 필요.
  원 음성은 SNUBH 코호트 데이터.
- **결정 (2026-09-19, 사용자 확인)**: **오디오 재생 불가. 스펙트로그램·파형 이미지는 게재 가능.**
  따라서 ④는 실제 신호로 만든 무음 시각화로 간다. 각 미디어에 출처를 캡션으로 명시한다.

### ⑤ Automatic social-communication severity assessment for children with ASD

- **slug**: `asd-severity`
- **상태**: Interspeech 2024·2025, ICCHP 2024, LREC-COLING 2024, 특허 10-2024-0117393
- **미디어**: cascaded multimodal 파이프라인 도식(직접 작성 SVG) + 코퍼스 규모 인포그래픽
- **자산**: `assets/images/asd_model_final.png`, `2025_interspeech_asd.png`, `2024_interspeech.png`,
  `2024_icchp.png` (현 repo)
- **결정 (2026-09-19, 사용자 확인)**: **오디오 재생 불가. 스펙트로그램·파형 이미지는 게재 가능.**
  미디어는 시스템 도식 + 집계 통계 + 필요 시 무음 스펙트로그램으로 구성한다.

### ⑥ Evaluation and reliability of clinical ML

- **slug**: `evaluation-reliability`
- **재프레이밍 (2026-09-19)**: 이 카드를 "NeurIPS 2026 목표"라는 미래형에서, **이미 투고된
  IEEE TCDS 논문을 본체로 하고 pipeline lottery를 그 확장으로 붙이는** 형태로 바꾼다.
  사용자가 지적한 대로 이 카드가 "clinical evaluation · reliability · robustness도 연구한다"는
  신호를 담당하는데, 실체가 있는 논문을 앞에 두면 "관심 있다"가 아니라 "이미 한다"가 된다.
- **본체**: *An Explainable Machine Learning Pipeline for Online-Handwriting-Based Dysgraphia
  Detection: Unbiased Evaluation, Feature Attribution, and Exploratory Subgroup Characterization*
  — Mun & El-Yacoubi, **IEEE TCDS, submitted**. 부제가 곧 이 카드의 주제다.
- **확장**: *Decomposing reported performance in small-sample clinical ML* —
  Mun & El-Yacoubi, **in preparation** (CV 2026-09-19판에 등재, D27). 데이터를 고정하고
  평가·전처리 선택만 바꿀 때 보고 성능이 흩어지는 정도를 정량화. NeurIPS Datasets & Benchmarks 목표.
  제목이 확정되었으므로 "in progress 아이디어"가 아니라 **제목 있는 준비 중 논문**으로 표기한다.
- **미디어**: 1차는 TCDS 논문의 평가 프로토콜 비교 그림을 웹용으로 재렌더. pipeline lottery
  산포 애니메이션은 실험 완료 후 추가.
- **자산**: `dysgraphia/ML/results_protocol_bias_v2/`, `ML/TCDS_submission/figures/` 확인 필요.
- **제약**: pipeline lottery 실험이 완료되기 전에는 **실제 수치를 싣지 않는다.**

### ⑦ Corpora and systems built

- **slug**: `resources`
- **재프레이밍 (2026-09-19)**: **공개 배포 가능한 코퍼스가 없다**(사용자 확인). 따라서 카드를
  "공개 자료(open corpora)"가 아니라 **"구축한 코퍼스와 시스템"**으로 바꾼다. 최초의 CKD 음성
  코퍼스와 최초의 한국어 ASD 아동 음성 코퍼스는 배포하지 않더라도 구축 사실 자체가 실적이며,
  "released"라고 쓰지 않으므로 부정확해지지 않는다.
- **공개된 것**: `handwriting-process-profiling` (GitHub public, v1.0.0, MIT) — ②의 companion
  release. **의도된 공개이므로 링크를 건다** (D17). 호스팅 API는 BRM accept 후 공개 예정이므로
  "hosted API 준비 중"으로만 기술한다 (D18, §10-M1).
- **미디어**: 툴킷 입출력 도식 또는 코드 GIF
- **내용**: CKD speech corpus(최초), Korean ASD children's speech corpus, L1/L2 한국어 자동
  음소 전사 툴킷, HwProfile 레퍼런스 구현, 그리고 **등록된 소프트웨어 2건**:

  | 등록번호 | 제호 | 창작 / 등록 | 종별 |
  |---|---|---|---|
  | `C-2024-033498` | 자폐증 아동 사회적 의사소통 중증도 평가 모델 | 2023.12.29 / 2024.09.25 | 컴퓨터프로그램저작물 > 응용프로그램 |
  | `C-2026-046494` | 자폐스펙트럼 장애 아동용 준자유발화 자동 음성인식 시스템 | 2026.04.01 / 2026.09.17 | 컴퓨터프로그램저작물 > 응용프로그램 > 교육 |

  영문 표기(사이트 게재용, 확정 필요):
  *Social Communication Severity Assessment Model for Children with Autism* /
  *Automatic Speech Recognition System for Semi-spontaneous Speech of Children with Autism Spectrum Disorder*.
  등록기관은 한국저작권위원회(Korea Copyright Commission).

- **자산**: 신규 제작(경량). 공개 링크는 각 코퍼스의 배포 상태 확인 후 연결.
- **정확성 제약**: 두 등록의 **저작자 명의는 서울대학교 산학협력단(법인)**이며 개인이 아니다.
  따라서 "저작권 보유"가 아니라 **권리자를 명시하고 본인 역할을 개발자로 표기**한다.
  예: *Registered software (Korea Copyright Commission, C-2026-046494); rights held by SNU R&DB
  Foundation; developed by J. Mun.* 등록증 이미지는 **게재하지 않는다** — 법인등록번호와 주소가
  포함되어 있다.

> **런칭 최소 요건**: ①②④⑤는 자산이 있거나 재렌더만 필요하므로 1차 런칭에 포함한다.
> ③⑥은 연구 진척에 의존하므로 플레이스홀더(개념 SVG + 상태 배지)로 싣고 준비되는 대로 교체한다.
> ⑦은 공개 가능 여부 확인 후 포함한다.

---

## 6. 콘텐츠 모델

Astro content collections. 논문 한 편 추가에 컴포넌트를 건드리지 않아야 한다.

```
src/content/
├── research/            # 대표 연구, 항목당 .md 1개 + 본문
│   ├── handwriting-surprise.md
│   ├── handwriting-profiling.md
│   ├── pen-representation.md
│   ├── ckd-speech.md
│   ├── asd-severity.md
│   ├── pipeline-lottery.md
│   └── resources.md
├── publications.yaml    # 전체 목록 단일 파일
└── news/                # 항목당 .md 1개
```

### `research` 스키마 (Zod)

| 필드 | 타입 | 비고 |
|---|---|---|
| `title` | string | |
| `order` | number | 랜딩 배열 순서, ①이 1 |
| `featured` | boolean | true면 full-width feature. 1건만 허용(빌드 시 검증) |
| `venues` | string[] | 표시용 venue 문자열 |
| `status` | `published` \| `under-review` \| `in-progress` | 배지 |
| `dek` | string | 카드 요약 1–2문장 |
| `media` | object | `{ type: 'video' \| 'image' \| 'inline-svg', src, poster, alt, caption }` |
| `links` | object[] | `{ label, href }` — paper / code / data |
| `draft` | boolean | true면 빌드에서 제외 |

`alt`와 `caption`은 **필수**로 강제한다. (§8)

### `publications.yaml` 스키마

`year`, `title`, `authors`, `venue`, `type`(`conference`\|`journal`\|`preprint`\|`in-prep`),
`pdf`, `thumb`, `doi`, `code`, `research`(대표 연구 slug 역참조).

> **해소됨 (2026-09-19)**: 저자 목록 9편 전부를 `cv_jihyunmun-250519.pdf`에서 확보했다.
> 공동저자는 Kim, S. / Chung, M. / Lee, S. / Kim, M. J. / Ryu, J. / Park, H. / Yang, S. /
> Kim, H. / Noh, S. / Kim, W. 이며, ICCHP 2024와 LREC-COLING 2024 두 편은 **Lee, S.가 제1저자**,
> 나머지 7편은 Mun, J.가 제1저자다. 저널 2편의 권·호·페이지(PSS 14(4) 45-56, 13(2) 45-55)도
> 확보했다. 이름 표기 형식(이니셜 vs 전체 이름)만 확정하면 된다.

---

## 7. 미디어 파이프라인

### 이미지

`astro:assets`로 처리 — webp/avif 변환, `srcset`, 명시적 `width`/`height`(CLS 방지).
논문 figure를 그대로 올리지 않는다. 웹용 재렌더 규칙:

- 축 라벨·범례를 화면 기준으로 확대, 불필요한 범례 제거
- 배경은 투명 또는 `well` 단색
- 가능하면 SVG로 출력하고 색을 CSS 변수로 참조해 다크모드 대응
- 래스터가 불가피하면 light/dark 2벌을 `<picture>`로 전환

### 비디오

`scripts/encode-media.sh` (ffmpeg 9.0.1 설치 완료):

- 입력: 원본 MP4 → 출력: h264 MP4 + WebM(VP9) + poster JPG
- 폭 1200px, **무음 트랙 제거**, 4–8초 루프, **파일당 2MB 이하**
- `faststart` 플래그, CRF는 2MB 예산에 맞춰 조정

`<ResearchMedia>` 컴포넌트 동작:

1. poster 이미지를 먼저 그린다 (정지 상태에서 내용이 읽혀야 한다)
2. 데스크탑: hover 시 재생, 벗어나면 poster로 복귀
3. 모바일: `IntersectionObserver`로 뷰포트 진입 시 1회 재생
4. `prefers-reduced-motion: reduce`: 재생하지 않고 poster 고정, 재생 버튼 노출
5. `<video>`에 `muted playsinline preload="none"` 지정

---

## 8. 접근성 · 성능 예산

연구 주제가 inclusive speech technology이므로 사이트 자체의 접근성을 요구사항으로 둔다.
이는 레퍼런스 세 사이트와의 차별점이자 연구 정체성과의 일치 지점이다.

- WCAG 2.1 **AA** 대비비 (light/dark 양쪽에서 검증)
- 모든 미디어에 `alt` 또는 `<figcaption>` — 스키마에서 필수 필드로 강제
- 키보드 포커스 가시 상태 명시, 스킵 링크
- `prefers-reduced-motion` 준수
- 의미 있는 heading 계층, 랜드마크 요소
- 페이지 본문이 가로 스크롤되지 않을 것 (테이블·도식만 자체 `overflow-x`)

**성능 예산** (랜딩, 3G Fast 기준):

- 초기 HTML+CSS+JS ≤ 150KB (gzip)
- LCP 이미지 ≤ 200KB
- 비디오는 `preload="none"` — 초기 로드에 포함하지 않는다
- 클라이언트 JS는 미디어 재생 제어와 테마 토글에 한정 (프레임워크 아일랜드 없음)

---

## 9. 기술 스택과 배포

- **Astro** (정적 출력). UI 프레임워크 아일랜드 없음 — 필요한 상호작용이 적다.
- **Node** v26.8.2 / **npm** 11.19.1 / **ffmpeg** 9.0.1 (2026-09-16 Homebrew 설치 완료)
- 스타일: 전역 CSS 변수 토큰 + 컴포넌트 scoped style. CSS 프레임워크 없음.
- `astro.config.mjs`: `site: 'https://jihyunmun.github.io'`, `base` 미설정(user site)

### 배포

`.github/workflows/deploy.yml` — `withastro/action` + `actions/deploy-pages`, `master` push 시 실행.

> **사용자 수동 작업 1회**: GitHub 저장소 Settings → Pages → Source를
> "Deploy from a branch" → **"GitHub Actions"** 로 변경. 이 클릭 없이는 배포가 반영되지 않는다.

### 리다이렉트

`/about/` → `/`, `/projects/` · `/patents/` · `/education/` → `/cv/`,
`/autism/` → `/research/asd-severity/`, `/ckd/` → `/research/ckd-speech/` stub을 둔다. GitHub Pages는 서버 리다이렉트를 지원하지 않으므로
`<meta http-equiv="refresh">` + `<link rel="canonical">` + 본문 링크 방식으로 구현한다.

### 전환 절차

1. `redesign` 브랜치에서 전부 구현·검토 (`master`는 그대로 라이브 유지)
2. 사용자 로컬 프리뷰(`npm run dev`) 승인
3. 기존 Jekyll 파일 제거 커밋을 `redesign`에 포함
4. `master`로 병합 → GitHub Actions 배포
5. 롤백 경로: 병합 직전 `master` 커밋으로 revert

**보존된 브랜치**: `backup-local-master-20260916` — 기존 로컬 클론이 minima 테마 포크
히스토리(원격과 486 behind / 204 ahead로 분기)에 머물러 있었으므로 그대로 보존. 사이트
콘텐츠는 포함하지 않는다.

---

## 10. 확정 사항과 미해결 항목

### 확정 (2026-09-19, 사용자 확인)

| | 항목 | 결정 |
|---|---|---|
| D1 | CKD·ASD 음성 | **오디오 재생 불가. 스펙트로그램·파형 이미지는 게재 가능.** |
| D2 | Télécom SudParis 부임 | **2026년 1월** |
| D3 | 박사학위 수여 | **2025년 8월** (CV의 "/ Feb 2026" 표기는 §10-M4에서 확인) |
| D4 | 공개 가능 코퍼스 | **없음.** ⑦을 "구축한 코퍼스와 시스템"으로 재프레이밍 (§5-⑦) |
| D5 | ② BRM 논문 | arXiv `2609.15435` 공개 + BRM under review. 저자 Mun & El-Yacoubi |
| D6 | ② companion code | `github.com/jihyunmun/handwriting-process-profiling` **public, v1.0.0** |
| D7 | ⑥ 카드 | IEEE TCDS 투고 논문을 본체로, pipeline lottery를 확장으로 재프레이밍 |
| D8 | ANR–NRF 제안서 | 사이트 전면 비노출 (§1) |
| D9 | 소프트웨어 등록 2건 | 권리자(SNU 산학협력단) 명시 + developed by 표기. 등록증 이미지 비게재 |
| D10 | 논문 저자 목록 | CV PDF에서 9편 전부 확보 |
| D11 | CV PDF | `cv_jihyunmun-250519.pdf` → `assets/pdfs/cv.pdf` (복사 완료) |
| D12 | 소속 표기 | **TCDS 논문 표기로 통일**: Samovar, Télécom SudParis, Institut Polytechnique de Paris |
| D13 | 연락 이메일 | **`jihyun.mun@telecom-sudparis.eu`로 교체** (기존 SNU 주소 대체) |
| D14 | BRM 공저자 | **Mun & El-Yacoubi** (2인) |
| D15 | 학위 기간 표기 | **`Mar 2021 – Aug 2025`**. CV의 "/ Feb 2026"은 작성 당시 졸업이 미정이어서 넣은 것 |
| D16 | ③ 카드 | **제거.** 대신 NLP / computational linguistics / LLM 활용을 드러낼 것 (§5-③) |
| D17 | 코드 저장소 공개 | **의도된 공개.** `handwriting-process-profiling` public은 정상 — ②·⑦에서 링크한다 |
| D18 | accept 후 공개 대상 | **API** (코드 저장소가 아님). §10-M1 참조 |
| D19 | ③ 카드 | **출판된 것만으로 구성** — Interspeech 2024 LLM 적응 비교 + LREC-COLING 2024 코퍼스·언어학 분석 |
| D20 | 손글씨 영상 자산 | `trajectory-viz/output/comparisons/diagramo_dictation_speed__speed.mp4` 계열 사용 |
| D21 | ① hero 클립 | **후보 A — 원본 전체를 9× 가속.** 8.44s · 181KB · 1086×748 · 25fps · 무음 · h264 |
| D22 | 포트레이트 | **사용하지 않는다.** `assets/images/portrait.jpg`는 저장소에 그대로 두되 참조하지 않는다 |
| D23 | hosted API | "in preparation"으로 기술. 코드 저장소 링크는 유지 |
| D24 | Google Scholar | **링크에서 제외.** 최종 링크: GitHub · LinkedIn · CV (PDF) · Email |
| D25 | CV PDF | 갱신 완료 (4p). `assets/pdfs/cv.pdf` = **2026-09-19 v2판**. v2는 PROJECTS에 산업통상자원부 wearable TMS + 디지털치료제 과제(2025.04–2025.12) 1건을 추가 — funded projects 총 7건 |
| D26 | CKD 저널 in-prep | **제거.** 사용자가 CV에서 뺐으므로 ④ 카드에서도 뺀다 |
| D27 | pipeline lottery 논문 | 제목 확정 — *Decomposing reported performance in small-sample clinical ML* (Mun & El-Yacoubi), **in preparation** |

### 미해결 — 남은 확인 사항

**설계 차단 항목 없음 (2026-09-19).** 구현에 필요한 결정은 모두 확정되었다.

런칭 전 또는 런칭 후 처리할 항목:

1. **arXiv 논문의 code availability** — 로컬 `paper/sections/07_back_matter.tex`가 아직
   `[repository URL]` 플레이스홀더다. 코드 저장소 공개가 확정되었으므로 실제 URL
   (`https://github.com/jihyunmun/handwriting-process-profiling`)로 채우는 것이 맞다.
   **논문 쪽 이슈이며 사이트 구현을 막지 않는다.**
2. **⑦의 전사 툴킷** — 공개 저장소가 없으므로 "구축함"으로만 기술한다. 추후 공개되면 링크 추가.
3. **① 영상 재렌더** — 축 범위·라벨 최적화 (§5-①의 후속 과제). 현재 인코딩으로 런칭 가능.
4. ~~CV PDF 갱신~~ — **완료 (2026-09-19)**. `assets/pdfs/cv.pdf` = 4페이지 2026-09판.
   사용자가 Word에서 직접 내보낸 뒤 POSITIONS 소속 축약, CKD 저널 in-prep 제거,
   pipeline lottery 논문 추가, LANGUAGES에 French (A2) 추가를 직접 반영했다.
   사이트의 `/cv/` 페이지 내용은 이 PDF를 기준으로 맞춘다.

**유지되는 원칙**: 확정되지 않은 수치·결과는 사이트에 싣지 않는다. 심사 중인 논문은
`under review` / `submitted` 배지로 확정 결과와 구분한다.

---

## 11. 완료 기준

- [ ] `npm run build`가 경고 없이 통과
- [ ] 랜딩·연구 상세·publications·CV 4종 페이지가 400px / 1440px 양쪽에서 가로 스크롤 없이 렌더
- [ ] light / dark 양쪽에서 모든 텍스트가 AA 대비 충족
- [ ] `prefers-reduced-motion`에서 자동 재생이 발생하지 않음
- [ ] 기존 6개 URL이 모두 새 목적지로 연결됨
- [ ] 대표 연구 카드 전부에 `alt`와 캡션이 있음
- [ ] 확정되지 않은 결과가 확정된 것처럼 표기된 곳이 없음
- [ ] 성능 예산(§8) 충족
