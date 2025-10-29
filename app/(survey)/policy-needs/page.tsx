'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SurveyLayout } from '@/components/survey/SurveyLayout'
import { QuestionSingleChoice } from '@/components/survey/QuestionSingleChoice'
import { NavigationButton } from '@/components/survey/NavigationButton'

export default function PolicyNeedsPage() {
  const router = useRouter()
  const [awareness, setAwareness] = useState('')

  const handleNext = () => {
    if (!awareness) {
      alert('인지도를 선택해주세요.')
      return
    }
    router.push('/complete')
  }

  const handleBack = () => {
    router.push('/project-details')
  }

  return (
    <SurveyLayout
      currentStep={4}
      totalSteps={5}
      onBack={handleBack}
      showBackButton={true}
    >
      <div className="space-y-12">
        {/* Section Title */}
        <div>
          <div className="mb-2 text-sm font-medium text-blue-600">
            Section 4
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            의료 해외진출 정책 요구도
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            KOHES 포털에 대한 인지도를 알려주세요
          </p>
        </div>

        {/* Test Question: KOHES Awareness (C4) */}
        <QuestionSingleChoice
          id="kohes-awareness"
          label="KOHES(한국의료해외진출지원센터) 포털을 알고 계십니까?"
          required={true}
          options={[
            { value: '방문', label: '방문한 적이 있다' },
            { value: '들어봄', label: '들어본 적이 있다' },
            { value: '모름', label: '잘 모른다' },
          ]}
          value={awareness}
          onChange={setAwareness}
        />

        {/* Navigation */}
        <div className="mt-8">
          <NavigationButton
            onClick={handleNext}
            disabled={!awareness}
          >
            다음
          </NavigationButton>
        </div>
      </div>
    </SurveyLayout>
  )
}
