"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { FileSpreadsheet, LayoutDashboard, ListChecks, LogOut, Menu, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { getCurrentUser, signOut, onAuthStateChange, type AuthUser } from "@/lib/supabase/auth"

interface AdminShellProps {
  children: React.ReactNode
}

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

const NAV_ITEMS: NavItem[] = [
  {
    href: "/admin/dashboard",
    label: "대시보드",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/responses",
    label: "응답 데이터",
    icon: ListChecks,
  },
  {
    href: "/admin/exports",
    label: "데이터 내보내기",
    icon: FileSpreadsheet,
  },
]

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isSidebarOpen, setSidebarOpen] = React.useState(false)
  const [user, setUser] = React.useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    // 초기 사용자 확인
    getCurrentUser()
      .then((currentUser) => {
        if (!currentUser) {
          router.push("/admin/login")
        } else {
          setUser(currentUser)
        }
      })
      .finally(() => {
        setIsLoading(false)
      })

    // 인증 상태 변화 구독
    const subscription = onAuthStateChange((authUser) => {
      if (!authUser) {
        router.push("/admin/login")
      } else {
        setUser(authUser)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  const handleLogout = async () => {
    try {
      await signOut()
      router.push("/admin/login")
      router.refresh()
    } catch (error) {
      console.error("로그아웃 실패:", error)
    }
  }

  const openSidebar = React.useCallback(() => {
    setSidebarOpen(true)
  }, [])

  const closeSidebar = React.useCallback(() => {
    setSidebarOpen(false)
  }, [])

  // 로딩 중이거나 사용자가 없으면 로딩 표시
  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40">
        <div className="text-center">
          <div className="text-lg font-medium">인증 확인 중...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-muted/40 md:flex">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-72 border-r bg-background px-4 py-4 shadow-sm transition-transform duration-200 md:sticky md:top-0 md:flex md:h-screen md:w-64 md:translate-x-0 md:flex-col md:overflow-y-auto md:shadow-none",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Kohes Survey Admin
            </span>
            {/* <h1 className="text-lg font-bold">관리자 콘솔</h1> */}
          </div>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={closeSidebar}>
            <X className="h-4 w-4" />
            <span className="sr-only">사이드바 닫기</span>
          </Button>
        </div>

        <Separator className="my-6" />

        <nav className="flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

            return (
              <Button
                key={item.href}
                asChild
                variant={isActive ? "secondary" : "ghost"}
                className="justify-start gap-3 text-sm font-medium"
                onClick={closeSidebar}
              >
                <Link href={item.href} className="flex w-full items-center">
                  <Icon className="mr-3 h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              </Button>
            )
          })}
        </nav>

        <div className="mt-10">
          <Separator className="mb-4" />
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-sm font-medium"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            로그아웃
          </Button>
        </div>
      </aside>

      {isSidebarOpen ? (
        <button
          type="button"
          aria-label="사이드바 닫기"
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={closeSidebar}
        />
      ) : null}

      <div className="flex-1">
        <header className="flex h-16 items-center justify-between border-b bg-background px-4 md:px-8">
          <div className="flex items-center gap-3 md:hidden">
            <Button variant="ghost" size="icon" onClick={openSidebar}>
              <Menu className="h-4 w-4" />
              <span className="sr-only">사이드바 열기</span>
            </Button>
            <div className="flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Kohes Admin
              </span>
              <span className="text-base font-semibold">관리자 콘솔</span>
            </div>
          </div>

          <div className="hidden md:flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Kohes Admin
            </span>
            <span className="text-xl font-bold leading-tight">관리자 콘솔</span>
          </div>

          <div className="ml-auto flex items-center gap-3 text-sm text-muted-foreground">
            <div className="hidden flex-col items-end md:flex">
              <span className="font-semibold text-foreground">운영자</span>
              <span className="text-xs text-muted-foreground">{user.email}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="hidden gap-2 md:inline-flex"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              로그아웃
            </Button>
            <Button variant="ghost" size="icon" className="md:hidden" onClick={openSidebar}>
              <Menu className="h-4 w-4" />
              <span className="sr-only">사이드바 열기</span>
            </Button>
          </div>
        </header>

        <main className="min-h-[calc(100vh-4rem)] bg-muted/40 px-4 py-8 md:px-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
