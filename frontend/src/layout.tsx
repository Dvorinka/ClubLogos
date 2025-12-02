import React from 'react'

type TopNavProps = {
  active?: 'home' | 'logos' | 'docs' | 'admin'
}

export const TopNav: React.FC<TopNavProps> = ({ active }) => {
  return (
    <nav className="border-b border-dark-border bg-white/80 dark:bg-dark-card/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          <a href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-accent-blue to-accent-green flex items-center justify-center text-xs font-bold text-white">
              CL
            </div>
            <span className="text-lg sm:text-xl font-semibold tracking-tight">
              České Kluby Loga
            </span>
          </a>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex gap-1 rounded-full bg-dark-bg/40 dark:bg-dark-bg/60 px-1 py-1 border border-dark-border/80">
              <a
                href="/"
                className={`nav-link ${active === 'home' ? 'nav-link--active' : ''}`}
              >
                Domů
              </a>
              <a
                href="/logos.html"
                className={`nav-link ${active === 'logos' ? 'nav-link--active' : ''}`}
              >
                Všechna loga
              </a>
              <a
                href="/api-docs.html"
                className={`nav-link ${active === 'docs' ? 'nav-link--active' : ''}`}
              >
                API Docs
              </a>
              <a
                href="/admin.html"
                className={`nav-link ${active === 'admin' ? 'nav-link--active' : ''}`}
              >
                Admin
              </a>
            </div>
            <button
              type="button"
              data-theme-toggle
              className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-dark-border bg-dark-bg/60 hover:bg-dark-border transition-smooth text-xs"
            >
              <span className="sr-only">Přepnout téma</span>
              <span data-theme-icon>☀</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

type SiteFooterProps = {
  caption?: string
  secondary?: string
}

export const SiteFooter: React.FC<SiteFooterProps> = ({
  caption = 'České Kluby Loga API',
  secondary,
}) => {
  return (
    <footer className="border-t border-dark-border mt-20">
      <div className="container mx-auto px-6 py-8 text-center text-gray-400 text-sm">
        <p>{caption}</p>
        {secondary && <p className="text-xs sm:text-sm mt-2">{secondary}</p>}
      </div>
    </footer>
  )
}
