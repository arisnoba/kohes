# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a medical overseas expansion survey system (의료해외진출 현황조사) built as a mobile-first responsive web application. The system collects structured survey data with complex conditional branching logic, validates responses, and provides admin dashboards for data export.

**Key Technologies**: Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, Supabase, Vercel

**Design Philosophy**: Typeform-style mobile-first survey experience with Korean language support (UTF-8).

## Architecture & Data Flow

### Source of Truth
- **`survey_schema.json`**: Single source of truth for all survey logic, branching rules, validation, and question structure. Always reference this file when implementing survey features.
- **`PRD.md`**: Product requirements including security guidelines, export formats, and business rules.
- **`AGENTS.md`**: Development guidelines including project structure, coding conventions, and commit standards.

### Survey Logic Structure
The survey follows a hierarchical flow: **Intro (Basic Info) → A (Organization Type) → B (Project Details) → C (Policy Needs)**

**Conditional Branching Rules**:
- `A1` determines whether `A2_group` (medical institution) or `A3_group` (company) questions appear
- `A2_found_type="법인"` triggers `A2_legal_subtype` question
- `B1` value determines which follow-up questions appear (`B5_1_1`, `B5_1_1_1` vs `B5_2`)
- All branching logic uses `show_if` or `show_if_any` conditions in schema

**Validation Layer**:
- Global validation rules in `validation_global` array (e.g., conditional required fields based on A1 or B1 selections)
- Question-level validation via `required` and `validation` properties
- All contact fields (tel/mobile/email) are required
- Rank choice questions allow duplicate selections (same item can be selected for multiple ranks)

### Suggested Directory Structure
```
app/
├─ (survey)/          # Public survey pages
│  ├─ layout.tsx      # Survey-specific layout (no admin UI)
│  └─ page.tsx        # Main survey flow
├─ (admin)/           # Protected admin area
│  ├─ login/
│  │  └─ page.tsx     # Auth gate
│  ├─ dashboard/
│  │  ├─ layout.tsx   # Admin layout
│  │  └─ page.tsx     # Response viewing
│  └─ exports/        # CSV/JSON download functionality
└─ api/               # API routes

src/
├─ components/        # React components
├─ hooks/             # Custom React hooks
└─ lib/
   ├─ supabase/       # Supabase client & helpers
   ├─ validation/     # Schema validation logic
   └─ ui/             # shadcn components

supabase/
├─ migrations/        # Database schema versions
├─ functions/         # Edge functions
└─ policies/          # Row-level security

tests/
├─ unit/              # Logic & validation tests
└─ e2e/               # Playwright tests for branching flows
```

## Development Commands

### Initial Setup
```bash
pnpm install          # Install dependencies (use pnpm for consistency)
supabase start        # Start local Supabase instance
```

### Development Workflow
```bash
pnpm dev              # Start Next.js dev server (verify /(survey) and /admin routes)
pnpm lint             # Run ESLint (next/core-web-vitals)
pnpm format           # Run Prettier (if configured)
pnpm test             # Run test suite (Vitest/Jest)
```

### Database Operations
```bash
pnpm supabase db push           # Push migrations to database
pnpm supabase db reset          # Reset local database
pnpm supabase gen types typescript --local  # Generate TypeScript types
```

### Testing
Focus tests on conditional branching logic from `survey_schema.json`:
- Use Vitest/Jest for validation logic and schema parsing
- Use Playwright for E2E flows testing conditional question appearance
- Test admin login barriers and export functionality
- Name test files: `<feature>.spec.tsx`

## Coding Standards

### TypeScript & Naming
- **Components**: PascalCase (e.g., `SurveyQuestion.tsx`)
- **Hooks/Utils**: camelCase (e.g., `useConditionalLogic.ts`)
- **Survey IDs**: Follow schema pattern (`A1`, `B5_1_1`, `A2_group`)
- Enforce strict TypeScript throughout

### Code Style
- **Indentation**: 2 spaces (enforced by Prettier)
- **Linter**: ESLint with `next/core-web-vitals` preset
- **Tailwind Classes**: Order as layout → spacing → typography
- **Korean Text**: UTF-8 encoding, labels in Korean, code comments in English
- **Layout Separation**: Survey and admin layouts must be distinct (no shared headers/footers)

### Schema Integration
When implementing survey features:
1. Parse `survey_schema.json` for question definitions
2. Implement `show_if` and `show_if_any` conditional rendering
3. Apply validation rules from both question-level and `validation_global`
4. For rank_choice questions, allow duplicate selections - store selected items in order as `string[]`
5. Handle data types: multi_choice as `string[]`, single_choice as `string`, rank_choice as `string[]`

## Data Security & Privacy

**Critical Requirements** (from PRD.md):
- **PII Isolation**: Separate storage for personally identifiable information
- **File Encryption**: AES-256 for uploaded evidence files
- **Access Control**: Least-privilege roles in Supabase (admin/analyst separation)
- **Legal Compliance**: 통계법 제33조·제34조 (Statistical Act Articles 33-34)
- **Export Security**: Raw survey data is confidential, distribute only through secured channels

**Supabase Security**:
- Implement row-level security (RLS) policies
- Use service role only in secure server contexts
- Never expose service keys in client code

## Export Formats

### CSV Export
- Delimiter: comma (`,`)
- Array fields: semicolon-separated (`; `) within single cell
- Example: `"option1; option2; option3"`

### JSON Export
- Encoding: UTF-8
- Indentation: 2 spaces
- Preserve Korean characters without escaping

## Git & Collaboration

### Commit Messages
Use Conventional Commits format:
- `feat:` New features
- `fix:` Bug fixes
- `chore:` Maintenance tasks
- Example: `feat: implement B1 conditional branching logic`

### Pull Requests
- Link tracking ticket/issue number
- Document behavior changes (especially branching logic)
- Include screenshots for UI changes or `/admin` exports
- Show validation check outputs
- Rebase before review
- Confirm `pnpm lint` and `pnpm test` pass locally

## Key Implementation Notes

### Conditional Question Rendering
The schema uses two patterns:
```typescript
// Single value match
"show_if": { "A1": "의료기관" }

// Multiple value match (any)
"show_if_any": {
  "B1": ["2016.6 이전 진출", "2016.6 이후 진출", "진출 진행 중(...)"]
}
```

### Validation Rules
Global validation includes:
- All contact fields (tel/mobile/email) are individually required
- `when`: Conditional required fields based on A1 or B1 selections
- Question groups (`type: "group"`) contain nested questions with their own requirements

### Rank Choice Scoring
- `C1`: 9 ranks to assign, 1st=9 points → 9th=1 point
- `C2`: 8 ranks to assign, 1st=8 points → 8th=1 point
- **Allow duplicate selections**: Same item can be selected for multiple ranks
- Store as `string[]`: Array of selected option values in rank order (1st choice, 2nd choice, ...)
- Example: User selects "자금 조달의 어려움" as 1st, 3rd, and 5th → stored as `["자금 조달의 어려움", "수익 예측의 불확실성", "자금 조달의 어려움", ...]`
- Calculate weighted scores for analysis: position in array determines point value

## Special Considerations

- **Mobile-First**: Test all UI on mobile viewports first
- **Korean UX**: Labels and help text in Korean, maintain proper line breaks for readability
- **Reward System**: "스타벅스 2만원권" incentive mentioned in intro (budget-limited, first-come basis)
- **Evidence Uploads**: Question B7 references supporting documents (permits, certificates, contracts)
- **KOHES Portal**: Question C4 references existing government portal awareness
