"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg font-sans",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:opacity-100 text-sm",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground font-medium",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground font-medium",
          error: "group-[.toaster]:text-red-900 dark:group-[.toaster]:text-red-200 group-[.toast]:border-red-200 dark:group-[.toast]:border-red-900/50 group-[.toast]:bg-red-50 dark:group-[.toast]:bg-red-950/20 [&_[data-description]]:!text-red-700 dark:[&_[data-description]]:!text-red-300",
          success: "group-[.toaster]:text-emerald-900 dark:group-[.toaster]:text-emerald-200 group-[.toast]:border-emerald-200 dark:group-[.toast]:border-emerald-900/50 group-[.toast]:bg-emerald-50 dark:group-[.toast]:bg-emerald-950/20 [&_[data-description]]:!text-emerald-700 dark:[&_[data-description]]:!text-emerald-300",
          warning: "group-[.toaster]:text-amber-900 dark:group-[.toaster]:text-amber-200 group-[.toast]:border-amber-200 dark:group-[.toast]:border-amber-900/50 group-[.toast]:bg-amber-50 dark:group-[.toast]:bg-amber-950/20 [&_[data-description]]:!text-amber-700 dark:[&_[data-description]]:!text-amber-300",
          info: "group-[.toaster]:text-blue-900 dark:group-[.toaster]:text-blue-200 group-[.toast]:border-blue-200 dark:group-[.toast]:border-blue-900/50 group-[.toast]:bg-blue-50 dark:group-[.toast]:bg-blue-950/20 [&_[data-description]]:!text-blue-700 dark:[&_[data-description]]:!text-blue-300",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
