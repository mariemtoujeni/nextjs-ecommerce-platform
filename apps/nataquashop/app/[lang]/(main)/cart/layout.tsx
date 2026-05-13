import { ReactNode } from "react"

interface CartLayoutProps {
  children: ReactNode
}

export default function CartLayout({ children }: CartLayoutProps) {
  return (
    <div className="md:mx-auto md:container md:py-8 md:px-6 py-6 px-5">
        {children}
      </div>
  )
} 