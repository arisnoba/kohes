export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-xl font-semibold">관리자 대시보드</h1>
            <div className="flex gap-4">
              <a href="/admin" className="text-sm text-gray-600 hover:text-gray-900">
                홈
              </a>
              <a href="/admin/exports" className="text-sm text-gray-600 hover:text-gray-900">
                데이터 내보내기
              </a>
              <button className="text-sm text-gray-600 hover:text-gray-900">로그아웃</button>
            </div>
          </div>
        </div>
      </nav>
      {children}
    </div>
  )
}
