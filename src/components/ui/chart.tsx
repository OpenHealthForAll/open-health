"use client"

import * as React from "react"
import { TooltipProps } from "recharts"
import { cn } from "@/lib/utils"

export interface ChartConfig {
  [key: string]: {
    label: string
    color: string
  }
}

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig
}

export function ChartContainer({
  config,
  children,
  className,
  ...props
}: ChartContainerProps) {
  return (
    <div className={cn("space-y-3", className)} {...props}>
      <div className="h-full w-full">{children}</div>
      <ChartLegend config={config} />
    </div>
  )
}

interface ChartLegendProps {
  config: ChartConfig
}

export function ChartLegend({ config }: ChartLegendProps) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {Object.entries(config).map(([key, { label, color }]) => (
        <ChartLegendContent key={key} label={label} color={color} />
      ))}
    </div>
  )
}

interface ChartLegendContentProps {
  label: string
  color: string
}

export function ChartLegendContent({ label, color }: ChartLegendContentProps) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="h-3 w-3 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  )
}

interface ChartTooltipContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  active?: boolean
  payload?: TooltipProps<any, any>["payload"]
  label?: string
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  className,
  ...props
}: ChartTooltipContentProps) {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <div
      className={cn(
        "rounded-lg border bg-background p-2 shadow-sm",
        className
      )}
      {...props}
    >
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col">
          <span className="text-[0.70rem] uppercase text-muted-foreground">
            Date
          </span>
          <span className="font-bold">{label}</span>
        </div>
        {payload.map((item) => (
          <div key={item.name} className="flex flex-col">
            <span
              className="text-[0.70rem] uppercase text-muted-foreground"
              style={{ color: item.color }}
            >
              {item.name}
            </span>
            <span className="font-bold">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export { Tooltip as ChartTooltip } from "recharts" 