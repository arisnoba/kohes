export default function ExportsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold">데이터 내보내기</h2>
        <p className="mt-2 text-gray-600">
          CSV 또는 JSON 형식으로 데이터를 다운로드할 수 있습니다.
        </p>
      </div>
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="flex gap-4">
          <button className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
            CSV 다운로드
          </button>
          <button className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700">
            JSON 다운로드
          </button>
        </div>
      </div>
    </div>
  )
}

