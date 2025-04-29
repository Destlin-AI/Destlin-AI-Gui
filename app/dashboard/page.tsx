"use client"

import { ThemeProvider } from "@/components/theme-provider"
import Dashboard from "@/dashboard"
import { NotificationProvider } from "@/contexts/notification-context"
import { NotificationToast } from "@/components/notification-toast"
import { ProtectedRoute } from "@/components/protected-route"
import { ToastProvider } from "@/components/ui/use-toast"

export default function DashboardPage() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <ProtectedRoute>
        <ToastProvider>
          <NotificationProvider>
            <Dashboard />
            <NotificationToast />
          </NotificationProvider>
        </ToastProvider>
      </ProtectedRoute>
    </ThemeProvider>
  )
}
