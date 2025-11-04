"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Label } from "recharts"

import {
  type ChartConfig,
  type ChartTooltipContentProps,
  ChartContainer,
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface ChartData {
  name: string
  value: number
  percentage: number
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

  const tooltipValueFormatter = (
    entry: NonNullable<ChartTooltipContentProps["payload"]>[number]
  ) => {
    const value = typeof entry.value === "number" ? entry.value : Number(entry.value ?? 0)
    const percentage = typeof entry.payload?.percentage === "number" ? entry.payload.percentage : 0
    return `${NUMBER_FORMATTER.format(value)}건 (${percentage.toFixed(1)}%)`
  }

  return (
    <div className="rounded-lg border bg-background p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-foreground">{title}</h3>
      <ChartContainer config={chartConfig} className="mx-auto h-[280px] w-full max-w-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={
                (tooltipProps) => (
                  <ChartTooltipContent
                    {...tooltipProps}
                    className="min-w-[180px]"
                    valueFormatter={tooltipValueFormatter}
                  />
                )
              }
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              strokeWidth={5}
              paddingAngle={2}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
              <Label
                position="center"
                content={({ viewBox }) => {
                  if (!viewBox || typeof viewBox.cx !== "number" || typeof viewBox.cy !== "number") {
                    return null
                  }
                  const { cx, cy } = viewBox
                  return (
                    <text x={cx} y={cy} textAnchor="middle" className="fill-foreground">
                      <tspan className="text-lg font-semibold">
                        {NUMBER_FORMATTER.format(totalCount)}건
                      </tspan>
                      <tspan x={cx} y={cy + 16} className="fill-muted-foreground text-xs">
                        응답
                      </tspan>
                    </text>
                  )
                }}
              />
            </Pie>
            <ChartLegend verticalAlign="bottom" align="center" />
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
      <div className="mt-2 text-center text-xs text-muted-foreground">
        총 {NUMBER_FORMATTER.format(totalCount)}건의 응답
      </div>
    </div>
  )
}
