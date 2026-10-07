export function MedicalExpansionScope() {
  return (
    <div className="border border-blue-200 rounded-md p-4 mt-4 bg-blue-50">
      <h3 className="text-lg font-semibold text-blue-900">의료해외진출 범위</h3>
      <ol className="list-decimal pl-6 space-y-1 text-gray-700 mt-2">
        <li>
          국외 의료기관의 <b className="text-blue-800">개설․운영</b>
        </li>
        <li>
          국외 의료기관의 <b className="text-blue-800">수탁운영</b> 또는{" "}
          <b className="text-blue-800">운영에 대한 컨설팅</b>
        </li>
        <li>
          국외 의료기관에 대한 보건의료인 등 관련 <b className="text-blue-800">종사자의 파견</b>
        </li>
        <li>
          국외 의료기관 또는 의료인에 대한{" "}
          <b className="text-blue-800">의료기술, 정보시스템 등의 이전</b>
        </li>
        <li>
          국외에서 보건의료서비스 제공에 필요한{" "}
          <b className="text-blue-800">의약품, 의료기기 등의 제공</b>
        </li>
        <li>
          국외 의료기관이나 의료인에게 <b className="text-blue-800">의료지식이나 의료기술을 지원</b>
          하거나 <b className="text-blue-800">교육</b>
          하는 것
        </li>
      </ol>
    </div>
  )
}
