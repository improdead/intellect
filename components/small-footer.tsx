import Link from "next/link"
import { Sparkles } from "lucide-react" // Re-add Sparkles import

export function SmallFooter() {
  return (
    <footer className="w-full py-4 border-t border-gray-200 bg-white">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center">
        <div className="flex items-center gap-2 mb-2 sm:mb-0">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">Intellect</span>
        </div>

        <div className="flex gap-6 text-sm text-gray-600">
          <Link href="/about" className="hover:text-primary transition-colors">
            About
          </Link>
          <Link href="/terms" className="hover:text-primary transition-colors">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-primary transition-colors">
            Privacy
          </Link>
          <span className="text-gray-400">© 2023</span>
        </div>
      </div>
    </footer>
  )
}
