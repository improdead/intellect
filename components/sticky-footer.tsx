import Link from "next/link"
import { Sparkles } from "lucide-react" // Re-add Sparkles import

export function StickyFooter() {
  return (
    <div className="sticky z-0 bottom-0 left-0 w-full h-80 bg-white flex justify-center items-center">
      <div className="relative overflow-hidden w-full h-full flex justify-end px-12 text-right items-start py-12 text-primary">
        <div className="flex flex-row space-x-12 sm:space-x-16 md:space-x-24 text-sm sm:text-lg md:text-xl">
          <ul>
            <li className="hover:underline cursor-pointer">
              <Link href="/">Home</Link>
            </li>
            <li className="hover:underline cursor-pointer">
              <Link href="/about">About</Link>
            </li>
            <li className="hover:underline cursor-pointer">
              <Link href="/pricing">Pricing</Link>
            </li>
          </ul>
          <ul>
            <li className="hover:underline cursor-pointer">
              <Link href="/terms">Terms</Link>
            </li>
            <li className="hover:underline cursor-pointer">
              <Link href="/privacy">Privacy</Link>
            </li>
            <li className="hover:underline cursor-pointer">
              <Link href="/login">Login</Link>
            </li>
          </ul>
        </div>
        <div className="flex items-center gap-2 absolute bottom-6 left-12">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="font-semibold text-sm">Intellect</span>
          <span className="text-xs text-muted-foreground">Your AI-powered learning companion</span>
        </div>
        <h2 className="absolute bottom-0 left-0 translate-y-1/3 sm:text-[192px] text-[80px] text-primary/10 font-bold">
          Intellect
        </h2>
      </div>
    </div>
  )
}
