"use client"

import * as React from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from "recharts"

import {
  type ChartConfig,
  ChartContainer,
  ChartLegendContent,
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface ChartData {
  name: string
  value: number
  percentage: number
  [key: string]: string | number
}

interface SimplePieChartProps {
  data: ChartData[]
  title: string
  colors?: string[]
}

const DEFAULT_COLORS = [
  "#3b82f6", // blue-500
  "#8b5cf6", // violet-500
  "#ec4899", // pink-500
  "#f59e0b", // amber-500
  "#10b981", // emerald-500
  "#6366f1", // indigo-500
  "#f97316", // orange-500
  "#14b8a6", // teal-500
]

const NUMBER_FORMATTER = new Intl.NumberFormat("ko-KR")

export function SimplePieChart({ data, title, colors = DEFAULT_COLORS }: SimplePieChartProps) {
  const totalCount = data.reduce((sum, item) => sum + item.value, 0)

  if (data.length === 0) {
    return (
      <div className="rounded-lg border bg-background p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-foreground">{title}</h3>
        <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
          응답 데이터가 없습니다.
        </div>
      </div>
    )
  }

  if (totalCount === 0) {
    return (
      <div className="rounded-lg border bg-background p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-foreground">{title}</h3>
        <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
          응답 데이터가 없습니다.
        </div>
      </div>
    )
  }

  const chartConfig = data.reduce<ChartConfig>((acc, item, index) => {
    const color = colors[index % colors.length]
    acc[item.name] = {
      label: item.name,
      color,
    }
    return acc
  }, {})

  return (
    <div className="rounded-lg border bg-background p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-foreground flex items-start gap-2 justify-between">
        {title}{" "}
        <span className="text-xs text-muted-foreground font-normal">
          총 {NUMBER_FORMATTER.format(totalCount)}건의 응답
        </span>
      </h3>
      <ChartContainer config={chartConfig} className="mx-auto h-[280px] w-full max-w-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={(tooltipProps) => {
                if (!tooltipProps || !tooltipProps.active || !tooltipProps.payload?.length) {
                  return null
                }
                const item = tooltipProps.payload[0]
                const numValue =
                  typeof item.value === "number" ? item.value : Number(item.value ?? 0)
                const payload = item.payload as { percentage?: number } | undefined
                const percentage = payload?.percentage ?? 0
                const categoryName = item.name ?? ""
                // 색상은 item.color 또는 item.payload.fill에서 가져옴
                const indicatorColor =
                  item.color || (item.payload as { fill?: string })?.fill || colors[0]

                return (
                  <div className="inline-flex flex-col gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
                    <div className="flex items-center gap-2">
                      {/* 색상 인디케이터 */}
                      <div
                        className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                        style={{
                          backgroundColor: indicatorColor,
                        }}
                      />
                      {/* 텍스트 내용 */}
                      <div className="flex items-center gap-2 leading-none">
                        <span className="text-muted-foreground whitespace-nowrap">
                          {categoryName}
                        </span>
                        <span className="font-medium tabular-nums text-foreground whitespace-nowrap">
                          {NUMBER_FORMATTER.format(numValue)}건 ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  </div>
                )
              }}
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              strokeWidth={5}
              paddingAngle={2}
              activeShape={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    const cx = typeof viewBox.cx === "number" ? viewBox.cx : 0
                    const cy = typeof viewBox.cy === "number" ? viewBox.cy : 0
                    // 숫자와 라벨을 정확히 중앙에 배치
                    // dominantBaseline을 사용하여 수직 중앙 정렬
                    return (
                      <text
                        x={cx}
                        y={cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="fill-foreground"
                      >
                        <tspan
                          x={cx}
                          y={cy}
                          dy="-8"
                          textAnchor="middle"
                          className="fill-foreground text-3xl font-bold"
                        >
                          {NUMBER_FORMATTER.format(totalCount)}
                        </tspan>
                        <tspan
                          x={cx}
                          y={cy}
                          dy="16"
                          textAnchor="middle"
                          className="fill-muted-foreground text-xs"
                        >
                          총 응답
                        </tspan>
                      </text>
                    )
                  }
                  return null
                }}
              />
            </Pie>
            <ChartLegend
              content={
                <ChartLegendContent
                  className="flex-wrap gap-2 *:justify-center items-center"
                  payload={data}
                />
              }
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}
