import type { ComponentProps } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export function Pagination({ className, ...props }: ComponentProps<"nav">) {
  return <nav aria-label="pagination" className={cn("mx-auto flex w-full justify-center", className)} {...props} />
}

export function PaginationContent({ className, ...props }: ComponentProps<"ul">) {
  return <ul className={cn("flex flex-wrap items-center gap-1", className)} {...props} />
}

export function PaginationItem({ className, ...props }: ComponentProps<"li">) {
  return <li className={cn("list-none", className)} {...props} />
}

export interface PaginationLinkProps extends ComponentProps<typeof Link> {
  isActive?: boolean
}

export function PaginationLink({ className, isActive, ...props }: PaginationLinkProps) {
  return (
    <Link
      className={cn(
        "inline-flex h-9 min-w-[2.25rem] items-center justify-center rounded-md border border-transparent px-3 text-sm font-medium transition-colors",
        "hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        isActive ? "border-primary bg-primary text-primary-foreground" : "border-input bg-background",
        className
      )}
      {...props}
    />
  )
}

export function PaginationPrevious({ className, ...props }: PaginationLinkProps) {
  return (
    <PaginationLink
      aria-label="이전 페이지"
      className={cn("gap-1", className)}
      {...props}
    >
      <span className="sr-only">이전 페이지</span>
      <span aria-hidden>{"<"}</span>
    </PaginationLink>
  )
}

export function PaginationNext({ className, ...props }: PaginationLinkProps) {
  return (
    <PaginationLink
      aria-label="다음 페이지"
      className={cn("gap-1", className)}
      {...props}
    >
      <span className="sr-only">다음 페이지</span>
      <span aria-hidden>{">"}</span>
    </PaginationLink>
  )
}

export function PaginationEllipsis({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      className={cn("inline-flex h-9 min-w-[2.25rem] items-center justify-center px-2 text-sm text-muted-foreground", className)}
      {...props}
    >
      &hellip;
    </span>
  )
}
