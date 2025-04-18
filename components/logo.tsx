import { Refrigerator } from "lucide-react"

interface LogoProps {
  className?: string
}

export function Logo({ className }: LogoProps) {
  return <Refrigerator className={className} />
}

