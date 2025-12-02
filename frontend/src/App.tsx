import React, { useEffect, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { TopNav, SiteFooter } from './layout'

const API_BASE_URL = '/api'

type Logo = {
  id: string
  club_name: string
  club_city?: string
  club_type?: string
  has_svg?: boolean
  has_png?: boolean
}

gsap.registerPlugin(ScrollTrigger)

function useHomeAnimations() {
  useEffect(() => {
    gsap.from('.hero-content', {
      duration: 1,
      opacity: 0,
      y: 50,
      ease: 'power3.out',
      delay: 0.2,
    })

    gsap.utils.toArray<HTMLElement>('.feature-card').forEach((card, index) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
        duration: 0.6,
        opacity: 0,
        y: 30,
        delay: index * 0.1,
        ease: 'power2.out',
      })
    })
  }, [])
}

function useRecentLogos() {
  const [logos, setLogos] = useState<Logo[]>([])
  const [filtered, setFiltered] = useState<Logo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await fetch(`${API_BASE_URL}/logos?sort=recent&limit=8`)
        if (!resp.ok) throw new Error('Failed to fetch recent logos')
        const data: Logo[] = await resp.json()
        setLogos(data)
        setFiltered(data)
      } catch (e) {
        console.error(e)
        setError('Načtení log selhalo')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    const q = search.trim().toLowerCase()
    if (!q) {
      setFiltered(logos)
      return
    }
    setFiltered(
      logos.filter((logo) => logo.club_name.toLowerCase().includes(q))
    )
  }, [search, logos])

  return {
    logos,
    filtered,
    loading,
    error,
    search,
    setSearch,
  }
}

const App: React.FC = () => {
  useHomeAnimations()
  const { filtered, loading, error, search, setSearch } = useRecentLogos()

  return (
    <>
      <TopNav active="home" />

      <header className="relative overflow-hidden border-b border-dark-border">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-green-600/10" />
        <div className="container mx-auto px-6 py-20 relative z-10">
          <div className="text-center hero-content max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="gradient-text">České Kluby Loga CDN</span>
            </h1>
            <p className="text-xl text-gray-400 mb-8">
              Vysoce kvalitní loga českých fotbalových a futsalových klubů s
              průhledným pozadím. Založeno na UUID, API-first, připraveno pro
              produkci.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => (window.location.href = '/logos.html')}
                className="px-8 py-4 bg-accent-blue rounded-lg font-semibold hover:bg-blue-600 transition-smooth text-lg"
              >
                Procházet loga
              </button>
              <a
                href="/admin.html"
                className="px-8 py-4 bg-accent-green rounded-lg font-semibold hover:bg-green-600 transition-smooth text-lg"
              >
                Nahrát logo
              </a>
            </div>
          </div>
        </div>
      </header>

      <section className="container mx-auto px-6 py-16" id="logoGallery">
        <div className="bg-dark-card border border-dark-border rounded-3xl px-6 py-6 md:px-8 md:py-8 shadow-sm">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-1">Dostupná loga klubů</h2>
              <p className="text-sm text-gray-500">
                Nejnovější nahraná loga z registru, připravená pro vaše aplikace.
              </p>
            </div>
            <div className="w-full md:w-auto flex flex-col items-stretch gap-3 md:flex-row md:items-center md:gap-4">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filtrovat podle názvu klubu..."
                className="w-full md:w-64 bg-dark-bg border border-dark-border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-blue transition-smooth"
              />
              <button
                type="button"
                onClick={() => (window.location.href = '/logos.html')}
                className="inline-flex items-center justify-center px-4 py-2.5 text-sm rounded-lg border border-dark-border bg-dark-bg hover:border-accent-blue transition-smooth"
              >
                Zobrazit všechna loga
              </button>
            </div>
          </div>

          {loading && (
            <div className="text-center py-12">
              <div className="spinner mx-auto" />
              <p className="mt-4 text-gray-400">Načítání log klubů...</p>
            </div>
          )}

          {!loading && error && (
            <div className="text-center py-12 text-red-400">{error}</div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="text-center py-12">
              <p className="text-lg text-gray-400 mb-4">
                Zatím nebyla nahrána žádná loga
              </p>
              <a
                href="/admin.html"
                className="px-6 py-3 bg-accent-green rounded-lg font-semibold hover:bg-green-600 transition-smooth inline-block text-sm"
              >
                Nahrát první logo
              </a>
            </div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
              {filtered.map((logo) => {
                const logoUrl = `${API_BASE_URL}/logos/${logo.id}`
                return (
                  <button
                    key={logo.id}
                    type="button"
                    onClick={() =>
                      (window.location.href = `/logo.html?id=${logo.id}`)
                    }
                    className="logo-card bg-dark-card rounded-xl p-4 border border-dark-border hover:border-accent-blue transition-smooth cursor-pointer group text-left"
                  >
                    <div className="aspect-square bg-dark-bg rounded-lg flex items-center justify-center mb-3 overflow-hidden">
                      <img
                        src={logoUrl}
                        alt={logo.club_name}
                        className="max-w-full max-h-full object-contain p-2 group-hover:scale-110 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                          const el = e.currentTarget.parentElement
                          if (!el) return
                          el.innerHTML =
                            "<svg class='w-8 h-8 text-gray-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'></path></svg>"
                        }}
                      />
                    </div>
                    <h3 className="font-semibold text-sm truncate mb-1">
                      {logo.club_name}
                    </h3>
                    <p className="text-xs text-gray-400 truncate">
                      {logo.club_city
                        ? `${logo.club_city}  b7 ${logo.club_type || 'fotbal'}`
                        : logo.club_type || 'fotbal'}
                    </p>
                    <div className="flex gap-1 mt-2">
                      {logo.has_svg && (
                        <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded text-[11px] font-medium">
                          SVG
                        </span>
                      )}
                      {logo.has_png && (
                        <span className="px-2 py-0.5 bg-green-500/10 text-green-500 rounded text-[11px] font-medium">
                          PNG
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </section>

      <section className="bg-dark-card border-y border-dark-border py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-8 text-center">
            Rychlá Referenční API
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-dark-bg rounded-xl p-6 border border-dark-border">
              <div className="flex items-start gap-4">
                <span className="px-3 py-1 bg-accent-blue/20 text-accent-blue rounded-md text-sm font-mono">
                  GET
                </span>
                <div className="flex-1">
                  <p className="font-mono text-sm mb-2">/logos</p>
                  <p className="text-gray-400 text-sm">
                    Zobrazit všechna dostupná loga
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-dark-bg rounded-xl p-6 border border-dark-border">
              <div className="flex items-start gap-4">
                <span className="px-3 py-1 bg-accent-blue/20 text-accent-blue rounded-md text-sm font-mono">
                  GET
                </span>
                <div className="flex-1">
                  <p className="font-mono text-sm mb-2">/logos/:id</p>
                  <p className="text-gray-400 text-sm">
                    Získat logo podle UUID (PNG/SVG)
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-dark-bg rounded-xl p-6 border border-dark-border">
              <div className="flex items-start gap-4">
                <span className="px-3 py-1 bg-accent-blue/20 text-accent-blue rounded-md text-sm font-mono">
                  GET
                </span>
                <div className="flex-1">
                  <p className="font-mono text-sm mb-2">/logos/:id/json</p>
                  <p className="text-gray-400 text-sm">Získat metadata loga</p>
                </div>
              </div>
            </div>

            <div className="bg-dark-bg rounded-xl p-6 border border-dark-border">
              <div className="flex items-start gap-4">
                <span className="px-3 py-1 bg-accent-green/20 text-accent-green rounded-md text-sm font-mono">
                  POST
                </span>
                <div className="flex-1">
                  <p className="font-mono text-sm mb-2">/logos/:id</p>
                  <p className="text-gray-400 text-sm">Nahrát nové logo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold mb-12 text-center">Funkce</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <div className="feature-card bg-dark-card rounded-xl p-6 border border-dark-border card-hover">
            <h3 className="text-xl font-semibold mb-2">Integrace s FAČR</h3>
            <p className="text-gray-400">
              Přímá integrace s oficiálním českým fotbalovým registrem
            </p>
          </div>

          <div className="feature-card bg-dark-card rounded-xl p-6 border border-dark-border card-hover">
            <h3 className="text-xl font-semibold mb-2">SVG &amp; PNG</h3>
            <p className="text-gray-400">
              Nahrajte SVG, PNG se vygeneruje automaticky
            </p>
          </div>

          <div className="feature-card bg-dark-card rounded-xl p-6 border border-dark-border card-hover">
            <h3 className="text-xl font-semibold mb-2">Založeno na UUID</h3>
            <p className="text-gray-400">
              Konzistentní identifikace napříč všemi platformami
            </p>
          </div>

          <div className="feature-card bg-dark-card rounded-xl p-6 border border-dark-border card-hover">
            <h3 className="text-xl font-semibold mb-2">Připraveno pro CDN</h3>
            <p className="text-gray-400">Rychlé, cachovatelné, produkční API</p>
          </div>

          <div className="feature-card bg-dark-card rounded-xl p-6 border border-dark-border card-hover">
            <h3 className="text-xl font-semibold mb-2">Bohatá Metadata</h3>
            <p className="text-gray-400">Název klubu, město, typ, web v ceně</p>
          </div>

          <div className="feature-card bg-dark-card rounded-xl p-6 border border-dark-border card-hover">
            <h3 className="text-xl font-semibold mb-2">Připraveno pro Docker</h3>
            <p className="text-gray-400">
              Nasazení jedním příkazem s Docker Compose
            </p>
          </div>
        </div>
      </section>
      <SiteFooter
        caption="České Kluby Loga API | Vytvořeno pro český fotbal"
        secondary="Poháněno FAČR Scraper API | Open Source MIT Licence"
      />
    </>
  )
}

export default App
