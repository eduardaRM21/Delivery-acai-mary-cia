import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner"
import { CartProvider } from "@/contexts/CartContext"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AÇAÍ DA MARY & CIA | Açaí Fresquinho e Saboroso",
  description:
    "O melhor açaí de Nova Carapina! AÇAÍ DA MARY & CIA oferece açaí fresquinho com ingredientes selecionados. Peça pelo WhatsApp (27) 98864-6488",
  keywords: "açaí Nova Carapina, açaí Serra ES, açaí delivery, AÇAÍ DA MARY & CIA",
  authors: [{ name: "AÇAI DA MARY & CIA" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  openGraph: {
    title: "AÇAI DA MARY & CIA - Nova Carapina",
    description: "O melhor açaí de Nova Carapina com ingredientes selecionados",
    type: "website",
    locale: "pt_BR",
  },
    generator: 'v0.dev'
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link
          rel="icon"
          href="/assets/favicon.ico"
        />
      </head>
      <body className={inter.className}>
        <CartProvider>
          {children}
          <Toaster position="top-right" />
        </CartProvider>
      </body>
    </html>
  )
}
