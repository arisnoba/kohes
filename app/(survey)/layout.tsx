import type { ReactNode } from "react"
import { Toaster } from "sonner"

import { SurveyProvider } from "@/components/survey/SurveyProvider"

export default function SurveyLayout({ children }: { children: ReactNode }) {
  return (
    <SurveyProvider>
      {children}
      <Toaster position="bottom-center" richColors theme="light" />
    </SurveyProvider>
  )
}
