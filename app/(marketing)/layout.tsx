import type React from "react"
import { MainNavbar } from "@/components/main-navbar"
import { SimpleFooter } from "@/components/simple-footer"

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <MainNavbar />
      <main className="flex-1">{children}</main>
      <SimpleFooter />
    </div>
  )
}
