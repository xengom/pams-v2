# PAMS v2 (Personal Asset Management System)

> 개인 자산 관리를 위한 현대적인 웹 애플리케이션

## 📖 프로젝트 소개

PAMS v2는 개인의 재정 관리를 돕는 종합적인 자산 관리 시스템입니다. 일상의 수입과 지출을 체계적으로 기록하고 분석할 수 있으며, 투자 포트폴리오 관리 기능을 제공합니다.

## ✨ 주요 기능

### 🏦 가계부 (Ledger System)
- **거래내역 관리**: 수입과 지출 거래를 상세히 기록하고 관리
- **계정 관리**: 은행 계좌, 카드, 현금 등 다양한 자산 계정 관리
- **지출 계획**: 월별/카테고리별 예산 설정 및 추적
- **통계 분석**: 지출 패턴 분석 및 시각적 리포트 제공

### 📈 투자관리 (Portfolio Management)
- **포트폴리오 추적**: 투자 자산의 현재 가치 및 수익률 모니터링
- **성과 분석**: 투자 성과 분석 및 리밸런싱 제안 **(개발 중)**

## 🛠 기술 스택

### Frontend
- **Next.js 14**: App Router 기반의 React 프레임워크
- **TypeScript**: 타입 안정성을 위한 정적 타입 시스템
- **Tailwind CSS**: 유틸리티 기반 CSS 프레임워크
- **shadcn/ui**: 모던 UI 컴포넌트 라이브러리
- **Zustand**: 경량화된 상태 관리 라이브러리
- **React Hook Form**: 폼 상태 관리 및 유효성 검사
- **Recharts**: 데이터 시각화 차트 라이브러리

### Backend
- **Cloudflare Workers**: 서버리스 백엔드 런타임
- **Hono**: 빠르고 경량화된 웹 프레임워크
- **GraphQL Yoga**: GraphQL 서버 구현
- **Cloudflare D1**: SQLite 기반 서버리스 데이터베이스
- **Drizzle ORM**: 타입 안전한 ORM

### DevOps & Tools
- **PNPM**: 고성능 패키지 매니저
- **Turbo**: 모노레포 빌드 시스템
- **Wrangler**: Cloudflare 배포 CLI

## 🏗 아키텍처

```
pams-v2/
├── apps/
│   ├── web/          # Next.js 웹 애플리케이션
│   └── api/          # Cloudflare Workers API
├── packages/
│   ├── database/     # Drizzle ORM 스키마 및 설정
│   ├── types/        # 공유 TypeScript 타입 정의
│   └── ui/           # 재사용 가능한 UI 컴포넌트
└── tools/            # 개발 도구 및 유틸리티
```

### 데이터베이스 스키마
- `accounts`: 자산 계정 정보 (은행, 카드, 현금 등)
- `transactions`: 수입/지출 거래 내역
- `fixedExpenses`: 고정 지출 항목
- `spendingPlans`: 지출 계획 및 예산
- `cardPayments`: 카드 결제 정보
- `salaryDetails`: 급여 상세 정보

## 🚀 시작하기

### 사전 요구사항
- Node.js 18+ 
- PNPM 8+
- Cloudflare 계정 (배포용)

### 설치

1. **저장소 클론**
```bash
git clone <repository-url>
cd pams-v2
```

2. **의존성 설치**
```bash
pnpm install
```

3. **환경 변수 설정**
```bash
# 루트 디렉토리에 .env 파일 생성
cp .env.example .env
```

4. **개발 서버 실행**
```bash
# 모든 서비스 동시 실행
pnpm dev

# 개별 서비스 실행
pnpm --filter @pams/web dev    # 웹 애플리케이션
pnpm --filter @pams/api dev    # API 서버
```

### 데이터베이스 설정

```bash
# 데이터베이스 스키마 푸시 (개발환경)
pnpm db:push

# 데이터베이스 스튜디오 실행
pnpm db:studio
```

## 📱 애플리케이션 구조

### 웹 애플리케이션 (`apps/web`)
```
app/
├── page.tsx              # 메인 대시보드
├── ledger/               # 가계부 관련 페이지
│   ├── transactions/     # 거래내역
│   ├── accounts/         # 계정관리
│   ├── plans/           # 지출계획
│   └── stats/           # 통계분석
└── portfolio/           # 투자관리 (개발 중)
    └── dashboard/       # 포트폴리오 대시보드
```

### API 서버 (`apps/api`)
```
src/
├── index.ts            # 메인 서버 진입점
├── graphql/           # GraphQL 스키마 및 리졸버
├── db/               # 데이터베이스 설정
└── utils/            # 유틸리티 함수
```

## 🔧 개발 스크립트

```bash
# 개발
pnpm dev                # 모든 애플리케이션 개발 모드 실행
pnpm build             # 전체 프로젝트 빌드
pnpm lint              # 코드 린팅
pnpm type-check        # TypeScript 타입 체크

# 데이터베이스
pnpm db:push           # 스키마를 데이터베이스에 푸시
pnpm db:migrate        # 마이그레이션 실행
pnpm db:studio         # 데이터베이스 브라우저 실행
```

## 🚢 배포

본 프로젝트는 Cloudflare 생태계를 활용한 서버리스 배포를 지원합니다:

- **Frontend**: Cloudflare Pages
- **Backend**: Cloudflare Workers  
- **Database**: Cloudflare D1

상세한 배포 가이드는 [DEPLOYMENT.md](./DEPLOYMENT.md)를 참고하세요.

### 배포 환경
- **개발환경**: `pams-dev` 데이터베이스
- **프로덕션**: `pams-prod` 데이터베이스

## 🎯 주요 라우트

### 웹 애플리케이션
- `/` - 메인 대시보드
- `/ledger/transactions` - 거래내역 관리
- `/ledger/accounts` - 계정 관리  
- `/ledger/plans` - 지출 계획
- `/ledger/stats` - 지출 통계
- `/portfolio/dashboard` - 투자 포트폴리오 (개발 중)

### API 엔드포인트
- `/health` - 서버 상태 확인
- `/graphql` - GraphQL API

## 🤝 기여하기

1. 이 저장소를 포크합니다
2. 기능 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add amazing feature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다

## 📄 라이선스

이 프로젝트는 개인용 프로젝트입니다.

## 🔍 문제 해결

### 일반적인 문제들

**데이터베이스 연결 오류**
```bash
# 데이터베이스 상태 확인
pnpm db:studio

# 스키마 재푸시
pnpm db:push
```

**빌드 오류**
```bash
# 의존성 재설치
rm -rf node_modules
pnpm install

# 타입 체크
pnpm type-check
```

**개발 서버 실행 오류**
```bash
# 포트 충돌 확인 (기본: 3000, 8787)
lsof -ti:3000
lsof -ti:8787
```

---

**PAMS v2**로 더 스마트한 자산 관리를 시작하세요! 💪