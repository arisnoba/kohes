"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

interface AccordionContextValue {
  openItems: Set<string>
  toggleItem: (value: string) => void
}

const AccordionContext = React.createContext<AccordionContextValue | null>(null)

interface AccordionProps {
  children: React.ReactNode
  className?: string
}

export function Accordion({ children, className }: AccordionProps) {
  const [openItems, setOpenItems] = React.useState<Set<string>>(new Set())

  const toggleItem = React.useCallback((value: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev)
      if (next.has(value)) {
        next.delete(value)
      } else {
        next.add(value)
      }
      return next
    })
  }, [])

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem }}>
      <div className={cn("space-y-2", className)}>{children}</div>
    </AccordionContext.Provider>
  )
}

interface AccordionItemProps {
  value: string
  children: React.ReactNode
  className?: string
}

export function AccordionItem({ value, children, className }: AccordionItemProps) {
  const context = React.useContext(AccordionContext)
  if (!context) {
    throw new Error("AccordionItem must be used within Accordion")
  }

  const { openItems } = context
  const isOpen = openItems.has(value)

  return (
    <div className={cn("border rounded-md", className)} data-state={isOpen ? "open" : "closed"}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { ...child.props, isOpen, value } as any)
        }
        return child
      })}
    </div>
  )
}

interface AccordionTriggerProps {
  children: React.ReactNode
  className?: string
  isOpen?: boolean
  value?: string
}

export function AccordionTrigger({ children, className, isOpen, value }: AccordionTriggerProps) {
  const context = React.useContext(AccordionContext)
  if (!context) {
    throw new Error("AccordionTrigger must be used within Accordion")
  }

  const { toggleItem } = context

  const handleClick = () => {
    if (value) {
      toggleItem(value)
    }
  }

  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center justify-between px-4 py-3 text-left font-medium transition-all hover:bg-muted/50",
        isOpen && "[&>svg]:rotate-180",
        className
      )}
      onClick={handleClick}
      aria-expanded={isOpen}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
    </button>
  )
}

interface AccordionContentProps {
  children: React.ReactNode
  className?: string
  isOpen?: boolean
}

export function AccordionContent({ children, className, isOpen }: AccordionContentProps) {
  return (
    <div
      className={cn(
        "overflow-hidden text-sm transition-all",
        isOpen ? "max-h-[1000px] animate-in slide-in-from-top-1" : "max-h-0",
        className
      )}
    >
      <div className="px-4 pb-3 pt-0">{children}</div>
    </div>
  )
}

