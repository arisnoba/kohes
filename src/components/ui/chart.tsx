"use client"

import * as React from "react"
import { Legend as RechartsLegend, Tooltip as RechartsTooltip } from "recharts"
import type { LegendProps, TooltipProps } from "recharts"

import { cn } from "@/lib/utils"

export type ChartConfig = Record<
  string,
  {
    label: string
    color?: string
  }
>

interface ChartContextValue {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextValue | null>(null)

function useChartContext() {
  const context = React.useContext(ChartContext)
  if (!context) {
    throw new Error("Chart components must be used within a ChartContainer")
  }
  return context
}

export interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig
}

export function ChartContainer({ config, className, children, ...props }: ChartContainerProps) {
  return (
    <ChartContext.Provider value={{ config }}>
      <div className={cn("relative flex h-[300px] w-full flex-col", className)} {...props}>
        {children}
      </div>
    </ChartContext.Provider>
  )
}

export interface ChartTooltipProps extends TooltipProps<number, string> {
  content?: TooltipProps<number, string>["content"]
}

export function ChartTooltip({ content, ...props }: ChartTooltipProps) {
  return (
    <RechartsTooltip
      {...props}
      content={
        content ?? ((tooltipProps) => <ChartTooltipContent {...(tooltipProps as ChartTooltipContentProps)} />)
      }
    />
  )
}

export interface ChartTooltipContentProps extends TooltipProps<number, string> {
  className?: string
  hideLabel?: boolean
  indicator?: "dot" | "line"
  valueFormatter?: (item: NonNullable<TooltipProps<number, string>["payload"]>[number]) => React.ReactNode
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  className,
  hideLabel,
  indicator = "dot",
  valueFormatter,
}: ChartTooltipContentProps) {
  const { config } = useChartContext()
  const items = payload ?? []

  if (!active || !items.length) {
    return null
  }

  return (
    <div className={cn("grid gap-2 rounded-lg border bg-background p-2 text-xs shadow-sm", className)}>
      {!hideLabel && label ? <p className="font-medium text-foreground">{label}</p> : null}
      <div className="grid gap-1">
        {items.map((entry) => {
          const key = entry.name?.toString() ?? ""
          const configEntry = config[key]
          const color = entry.color ?? configEntry?.color
          const displayLabel = configEntry?.label ?? key
          const formattedValue = valueFormatter ? valueFormatter(entry) : entry.value

          return (
            <div key={key} className="flex items-center gap-2">
              {indicator === "dot" ? (
                <span
                  className="h-2 w-2 rounded-full"
                  style={color ? { backgroundColor: color } : undefined}
                />
              ) : null}
              <span className="flex-1 text-muted-foreground">{displayLabel}</span>
              <span className="font-medium text-foreground">{formattedValue}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export interface ChartLegendProps extends LegendProps {
  content?: LegendProps["content"]
}

export function ChartLegend({ content, ...props }: ChartLegendProps) {
  return (
    <RechartsLegend
      {...props}
      content={(legendProps) => {
        if (typeof content === "function") {
          return content(legendProps)
        }
        if (React.isValidElement(content)) {
          return content
        }
        return <ChartLegendContent {...legendProps} />
      }}
    />
  )
}

export interface ChartLegendContentProps extends LegendProps {
  className?: string
}

export function ChartLegendContent({ payload, className }: ChartLegendContentProps) {
  const { config } = useChartContext()
  if (!payload?.length) {
    return null
  }

  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground", className)}>
      {payload.map((entry) => {
        const key = entry.value?.toString() ?? ""
        const configEntry = config[key]
        const color = entry.color ?? configEntry?.color
        const label = configEntry?.label ?? key

        return (
          <div key={key} className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={color ? { backgroundColor: color } : undefined} />
            <span>{label}</span>
          </div>
        )
      })}
    </div>
  )
}

