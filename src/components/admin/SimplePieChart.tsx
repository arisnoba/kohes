"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Label } from "recharts"
import type { TooltipPayloadEntry } from "recharts/types/state/tooltipSlice"

import {
  type ChartConfig,
  ChartContainer,
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

  const tooltipValueFormatter = (entry: TooltipPayloadEntry) => {
    const value = typeof entry.value === "number" ? entry.value : Number(entry.value ?? 0)
    const percentage = typeof entry.payload?.percentage === "number" ? entry.payload.percentage : 0
    return `${NUMBER_FORMATTER.format(value)}건 (${percentage.toFixed(1)}%)`
  }

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
              content={(tooltipProps) => (
                <ChartTooltipContent
                  {...tooltipProps}
                  className="min-w-[180px]"
                  valueFormatter={tooltipValueFormatter}
                />
              )}
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
                    // 숫자를 중앙에 정확히 배치
                    // text-3xl의 높이를 고려하여 숫자 중심이 cy에 오도록 첫 번째 tspan의 y 조정
                    return (
                      <text x={cx} y={cy} textAnchor="middle" className="fill-foreground">
                        <tspan x={cx} y={cy - 10} className="fill-foreground text-3xl font-bold">
                          {NUMBER_FORMATTER.format(totalCount)}
                        </tspan>
                        <tspan x={cx} y={cy + 10} className="fill-muted-foreground text-xs">
                          총 응답
                        </tspan>
                      </text>
                    )
                  }
                  return null
                }}
              />
            </Pie>
            <ChartLegend verticalAlign="bottom" align="center" />
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}
