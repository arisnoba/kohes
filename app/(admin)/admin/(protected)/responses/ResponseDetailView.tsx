import type { ReactNode } from "react"

import type { AdminResponseSummary } from "@/lib/supabase/responses"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { Lock } from "lucide-react"

const DATETIME_FORMATTER = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
})

interface ResponseDetailViewProps {
  response: AdminResponseSummary
}

export function ResponseDetailView({ response }: ResponseDetailViewProps) {
  const { responseData, piiData } = response

  if (!responseData) {
    return <div className="text-sm text-muted-foreground">응답 데이터가 없습니다.</div>
  }

  const basicInfo = {
    name: maskPII(piiData, "name"),
    position: extractValue(responseData, ["basicInfo", "position"]),
    tel: maskPII(piiData, "tel"),
    mobile: maskPII(piiData, "mobile"),
    email: maskPII(piiData, "email"),
    address: maskPII(piiData, "address"),
  }

  const expansionInfo = {
    orgType: extractValue(responseData, ["expansionInfo", "orgType"]),
    medicalOrgName: extractValue(responseData, ["expansionInfo", "medicalOrgName"]),
    medicalOrgCategory: extractValue(responseData, ["expansionInfo", "medicalOrgCategory"]),
    foundationType: extractValue(responseData, ["expansionInfo", "foundationType"]),
    legalType: extractValue(responseData, ["expansionInfo", "legalType"]),
    companyName: extractValue(responseData, ["expansionInfo", "companyName"]),
    companyCategory: extractValue(responseData, ["expansionInfo", "companyCategory"]),
  }

  const projectDetails = {
    expansionTiming: extractValue(responseData, ["projectDetails", "expansionTiming"]),
    targetCountries: extractArray(responseData, ["projectDetails", "targetCountries"]),
    expansionReason: extractValue(responseData, ["projectDetails", "expansionReason"]),
    services: extractArray(responseData, ["projectDetails", "services"]),
    projectName: extractValue(responseData, ["projectDetails", "projectName"]),
    reportingAwareness1: extractValue(responseData, ["projectDetails", "reportingAwareness1"]),
    reportingAwareness2: extractValue(responseData, ["projectDetails", "reportingAwareness2"]),
    departments: extractArray(responseData, ["projectDetails", "departments"]),
    hasEvidence: extractValue(responseData, ["projectDetails", "hasEvidence"]),
  }

  const policyNeeds = {
    difficultiesRank: extractArray(responseData, ["policyNeeds", "difficultiesRank"]),
    difficultiesOther: extractValue(responseData, ["policyNeeds", "difficultiesOther"]),
    supportNeedsRank: extractArray(responseData, ["policyNeeds", "supportNeedsRank"]),
    supportNeedsOther: extractValue(responseData, ["policyNeeds", "supportNeedsOther"]),
    desiredSupport: extractValue(responseData, ["policyNeeds", "desiredSupport"]),
    awareness: extractValue(responseData, ["policyNeeds", "awareness"]),
    additionalComments: extractValue(responseData, ["policyNeeds", "additionalComments"]),
  }

  const hasExpansionInfo = Object.values(expansionInfo).some((value) => Boolean(value))
  const hasProjectDetails =
    projectDetails.targetCountries.length > 0 ||
    projectDetails.services.length > 0 ||
    projectDetails.departments.length > 0 ||
    Boolean(
      projectDetails.expansionTiming ||
        projectDetails.expansionReason ||
        projectDetails.projectName ||
        projectDetails.reportingAwareness1 ||
        projectDetails.reportingAwareness2 ||
        projectDetails.hasEvidence
    )
  const hasPolicyNeeds =
    policyNeeds.difficultiesRank.length > 0 ||
    policyNeeds.supportNeedsRank.length > 0 ||
    Boolean(
      policyNeeds.difficultiesOther ||
        policyNeeds.supportNeedsOther ||
        policyNeeds.desiredSupport ||
        policyNeeds.awareness ||
        policyNeeds.additionalComments
    )

  return (
    <div className="space-y-8">
      {/* <DetailSection title="응답 요약">
        <DetailItem label="응답 ID" value={response.id} />
        <DetailItem label="소속" value={response.organizationName} />
        <DetailItem label="기관 유형" value={response.orgType} />
        <DetailItem label="진출 시기" value={response.expansionTiming} />
        <DetailItem label="제출 일시" value={formatDateValue(response.submittedAt)} />
      </DetailSection> */}

      <DetailSection title="기본 정보" description="민감 정보는 잠금 아이콘으로 표시됩니다.">
        <DetailItem label="성명" value={basicInfo.name} sensitive />
        <DetailItem label="직책" value={basicInfo.position} />
        <DetailItem label="전화번호" value={basicInfo.tel} sensitive />
        <DetailItem label="휴대전화" value={basicInfo.mobile} sensitive />
        <DetailItem label="이메일" value={basicInfo.email} sensitive />
        <DetailItem label="주소" value={basicInfo.address} sensitive span />
      </DetailSection>

      {hasExpansionInfo ? (
        <DetailSection title="A. 기관 유형">
          <DetailItem label="기관 유형" value={expansionInfo.orgType} />
          <DetailItem label="회사명" value={expansionInfo.companyName} />
          <DetailItem label="회사 구분" value={expansionInfo.companyCategory} />
          <DetailItem label="의료기관명" value={expansionInfo.medicalOrgName} />
          <DetailItem label="의료기관 구분" value={expansionInfo.medicalOrgCategory} />
          <DetailItem label="설립 구분" value={expansionInfo.foundationType} />
          <DetailItem label="법인 유형" value={expansionInfo.legalType} />
        </DetailSection>
      ) : null}

      {hasProjectDetails ? (
        <DetailSection title="B. 프로젝트 세부사항">
          <DetailItem label="진출 시기" value={projectDetails.expansionTiming} />
          <DetailItem label="진출 이유" value={projectDetails.expansionReason} />
          <DetailItem
            label="진출 국가"
            values={projectDetails.targetCountries}
            span={projectDetails.targetCountries.length > 2}
          />
          <DetailItem
            label="제공 서비스"
            values={projectDetails.services}
            span={projectDetails.services.length > 2}
          />
          <DetailItem label="프로젝트명" value={projectDetails.projectName} span />
          <DetailItem
            label="신고 의무 인지 (진출 완료)"
            value={projectDetails.reportingAwareness1}
          />
          <DetailItem
            label="신고 의무 인지 (기획 단계)"
            value={projectDetails.reportingAwareness2}
          />
          <DetailItem
            label="관련 부처"
            values={projectDetails.departments}
            span={projectDetails.departments.length > 2}
          />
          <DetailItem label="증빙 자료 보유" value={projectDetails.hasEvidence} />
        </DetailSection>
      ) : null}

      {hasPolicyNeeds ? (
        <DetailSection title="C. 정책 수요">
          <DetailItem label="어려움 순위" values={policyNeeds.difficultiesRank} span />
          <DetailItem label="기타 어려움" value={policyNeeds.difficultiesOther} span />
          <DetailItem label="지원 필요 순위" values={policyNeeds.supportNeedsRank} span />
          <DetailItem label="기타 지원 필요" value={policyNeeds.supportNeedsOther} span />
          <DetailItem label="희망 지원 사업" value={policyNeeds.desiredSupport} />
          <DetailItem label="KOHES 인지" value={policyNeeds.awareness} />
          <DetailItem label="추가 의견" value={policyNeeds.additionalComments} span />
        </DetailSection>
      ) : null}
    </div>
  )
}

interface DetailSectionProps {
  title: string
  description?: string
  children: ReactNode
}

function DetailSection({ title, description, children }: DetailSectionProps) {
  return (
    <div className="bg-muted/10">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
        {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      </div>
      <Separator className="my-4" />
      <dl className="grid gap-4 sm:grid-cols-2">{children}</dl>
    </div>
  )
}

interface DetailItemProps {
  label: string
  value?: string | null
  values?: string[]
  sensitive?: boolean
  span?: boolean
}

function DetailItem({ label, value, values, sensitive = false, span = false }: DetailItemProps) {
  const hasValues = Array.isArray(values) && values.length > 0
  const displayValue = value ?? "-"
  const isEmpty = !value && !hasValues

  return (
    <div className={cn("min-w-0 space-y-1", span ? "sm:col-span-2" : undefined)}>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd>
        {sensitive ? (
          <span className="inline-flex items-center gap-1 text-sm text-foreground">
            <Lock className="h-3.5 w-3.5 text-amber-600" strokeWidth={1.75} />
            <span className={isEmpty ? "text-muted-foreground" : undefined}>{displayValue}</span>
          </span>
        ) : hasValues ? (
          <div className="flex flex-wrap gap-2">
            {values!.map((item, index) => (
              <Badge key={`${item}-${index}`} variant="secondary" className="whitespace-nowrap">
                {item}
              </Badge>
            ))}
          </div>
        ) : (
          <span
            className={cn(
              "text-base font-medium",
              isEmpty ? "text-muted-foreground" : "text-foreground"
            )}
          >
            {displayValue}
          </span>
        )}
      </dd>
    </div>
  )
}

function extractValue(data: Record<string, unknown>, path: string[]): string | null {
  let current: unknown = data

  for (const segment of path) {
    if (!current || typeof current !== "object") {
      return null
    }

    current = (current as Record<string, unknown>)[segment]
  }

  if (typeof current === "string") {
    const trimmed = current.trim()
    return trimmed.length ? trimmed : null
  }

  return null
}

function extractArray(data: Record<string, unknown>, path: string[]): string[] {
  let current: unknown = data

  for (const segment of path) {
    if (!current || typeof current !== "object") {
      return []
    }

    current = (current as Record<string, unknown>)[segment]
  }

  if (Array.isArray(current)) {
    return current
      .map((item) => {
        if (typeof item === "string") return item.trim()
        if (typeof item === "number" || typeof item === "boolean") return String(item)
        return ""
      })
      .filter((item) => item.length > 0)
  }

  if (typeof current === "string") {
    return current
      .split(/[;,\n]/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
  }

  return []
}

function maskPII(piiData: Record<string, unknown> | null, field: string): string | null {
  if (!piiData || typeof piiData !== "object") {
    return null
  }

  const value = piiData[field]

  if (typeof value !== "string" || !value.trim()) {
    return null
  }

  if (field === "email") {
    const [local, domain] = value.split("@")
    if (!local || !domain) return value
    const maskedLocal = local.slice(0, 2) + "***"
    return `${maskedLocal}@${domain}`
  }

  if (field === "tel" || field === "mobile") {
    const digits = value.replace(/[^0-9]/g, "")
    if (digits.length < 8) return "****"
    return `${digits.slice(0, 3)}-****-${digits.slice(-4)}`
  }

  if (field === "address") {
    const parts = value.split(" ")
    if (parts.length <= 2) return `${parts[0] ?? ""} ***`.trim()
    return `${parts[0]} ${parts[1]} ***`
  }

  if (value.length === 2) {
    return `${value[0]}*`
  }
  if (value.length === 3) {
    return `${value[0]}*${value[2]}`
  }
  if (value.length > 3) {
    return `${value[0]}**${value.slice(-1)}`
  }

  return value
}

function formatDateValue(value: string | null) {
  if (!value) return null
  try {
    return DATETIME_FORMATTER.format(new Date(value))
  } catch (error) {
    return value
  }
}
