import type { ReactNode } from "react"

import { SurveyProvider } from "@/components/survey/SurveyProvider"

export default function SurveyLayout({
  children,
}: {
  children: ReactNode
}) {
  return <SurveyProvider>{children}</SurveyProvider>
}
