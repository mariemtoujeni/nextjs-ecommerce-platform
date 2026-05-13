import "./globals.css";
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { LangParams } from "./utils"

const inter = Inter({ subsets: ["latin"] })

export async function generateMetadata({ params }: { params: Promise<LangParams> }): Promise<Metadata> {
  return {
    title: "Nataquashop, vente d'équipement de natation : combinaison, maillot de bain, lunette de natation.",
    description: "Vente en ligne d’equipement de natation : maillot de bain, combinaison, lunette, serviette, etc… de marques reconnues: SPEEDO, TYR, ARENA, FUNKITA FUNKY TRUNKS, ZEROD, MALMSTEN, TURBO.",
  }
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<LangParams>
}) {
  const { lang } = await params
  return (
    <html lang={lang}>
      <body className={inter.className}>{children}</body>
    </html>
  )
} 