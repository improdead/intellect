export function SimpleFooter() {
  return (
    <footer className="w-full border-t border-border/40 py-4 bg-background">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        <div className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Intellect. All rights reserved.
        </div>
        <div className="flex gap-6 mt-4 md:mt-0">
          <a href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Terms
          </a>
          <a href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Privacy
          </a>
          <a href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            About
          </a>
        </div>
      </div>
    </footer>
  )
}
