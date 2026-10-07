import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "2026년 의료해외진출 현황조사",
  description: "의료 해외진출 현황 및 정책 수요 조사",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
