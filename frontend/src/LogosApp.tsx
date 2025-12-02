import React, { useCallback, useEffect, useState } from 'react'
import { TopNav, SiteFooter } from './layout'

const API_BASE_URL = '/api'
const PAGE_SIZE = 20

type Logo = {
  id: string
  club_name: string
  club_city?: string
  club_type?: string
  has_svg?: boolean
  has_png?: boolean
}

const LogosApp: React.FC = () => {
  const [logos, setLogos] = useState<Logo[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'football' | 'futsal'>('all')
  const [sort, setSort] = useState<'recent' | 'name'>('recent')
  const hasActiveFilter =
    query.trim().length > 0 || typeFilter !== 'all' || sort !== 'recent'

  const resetFilters = () => {
    setQuery('')
    setTypeFilter('all')
    setSort('recent')
    setPage(1)
  }

  useEffect(() => {
    const handle = window.setTimeout(() => setDebouncedQuery(query), 300)
    return () => window.clearTimeout(handle)
  }, [query])

  const loadPage = useCallback(
    async (reset: boolean) => {
      if (loading) return
      setLoading(true)
      setError(null)

      try {
        const nextPage = reset ? 1 : page
        const url = new URL(`${API_BASE_URL}/logos`, window.location.origin)
        url.searchParams.set('sort', sort)
        url.searchParams.set('limit', String(PAGE_SIZE))
        url.searchParams.set('page', String(nextPage))
        if (debouncedQuery) url.searchParams.set('q', debouncedQuery)
        if (typeFilter !== 'all') url.searchParams.set('type', typeFilter)

        const resp = await fetch(url.toString().replace(window.location.origin, ''))
        if (!resp.ok) throw new Error('Failed to fetch logos')
        const data: Logo[] = await resp.json()

        if (reset) {
          setLogos(data)
        } else {
          setLogos((prev) => [...prev, ...data])
        }

        if (Array.isArray(data) && data.length === PAGE_SIZE) {
          setHasMore(true)
          setPage(nextPage + 1)
        } else {
          setHasMore(false)
        }
      } catch (e) {
        if (reset) {
          setError('Načtení log selhalo')
          setLogos([])
          setHasMore(false)
        }
      } finally {
        setLoading(false)
      }
    },
    [loading, page, debouncedQuery, typeFilter, sort]
  )

  useEffect(() => {
    loadPage(true)
  }, [loadPage, debouncedQuery])

  const handleDelete = async (id: string) => {
    const ok = window.confirm('Smazat toto logo?')
    if (!ok) return

    try {
      const resp = await fetch(`${API_BASE_URL}/logos/${id}`, { method: 'DELETE' })
      if (!resp.ok) throw new Error('Delete failed')
      setLogos((prev) => prev.filter((l) => l.id !== id))
    } catch (_) {
      window.alert('Mazání selhalo')
    }
  }

  const isInitialLoading = logos.length === 0 && loading
  const showEmpty = !loading && !error && logos.length === 0

  return (
    <>
      <TopNav active="logos" />

      <header className="border-b border-dark-border bg-dark-card">
        <div className="container mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">Všechna Loga</h1>
          <p className="text-gray-400">
            Procházejte všechna dostupná loga, vyhledávejte a spravujte
          </p>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">

        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="w-full md:max-w-lg space-y-2">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              Vyhledat loga
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-500">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-4.35-4.35M11 5a6 6 0 100 12 6 6 0 000-12z"
                  />
                </svg>
              </span>
              <input
                type="text"
                value={query}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setQuery(e.target.value)
                }
                placeholder="Hledat mezi všemi logy..."
                className="w-full bg-dark-card border border-dark-border rounded-lg px-4 pl-9 py-3 text-sm text-white focus:outline-none focus:border-accent-blue transition-smooth"
              />
            </div>
            <p className="text-[11px] text-gray-500">
              Filtruje podle názvu klubu, můžete kombinovat s typem klubu a řazením.
            </p>
          </div>
          <div className="w-full md:w-auto space-y-2">
            <div className="flex flex-wrap items-center gap-2 justify-between md:justify-end text-[11px] text-gray-500">
              <span>{PAGE_SIZE} log na stránku</span>
              <span>
                řazeno: {sort === 'recent' ? 'nejnovější' : 'podle názvu'}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 justify-start md:justify-end">
              <div className="inline-flex flex-wrap gap-1 rounded-full bg-dark-card/60 border border-dark-border px-1 py-1">
                <button
                  type="button"
                  onClick={() => {
                    setPage(1)
                    setTypeFilter('all')
                  }}
                  className={`px-3 py-1.5 rounded-full border text-xs ${
                    typeFilter === 'all'
                      ? 'bg-accent-blue/10 text-accent-blue border-accent-blue'
                      : 'bg-transparent border-transparent text-gray-400 hover:bg-dark-bg/80'
                  }`}
                >
                  Vše
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPage(1)
                    setTypeFilter('football')
                  }}
                  className={`px-3 py-1.5 rounded-full border text-xs ${
                    typeFilter === 'football'
                      ? 'bg-accent-blue/10 text-accent-blue border-accent-blue'
                      : 'bg-transparent border-transparent text-gray-400 hover:bg-dark-bg/80'
                  }`}
                >
                  Fotbal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPage(1)
                    setTypeFilter('futsal')
                  }}
                  className={`px-3 py-1.5 rounded-full border text-xs ${
                    typeFilter === 'futsal'
                      ? 'bg-accent-blue/10 text-accent-blue border-accent-blue'
                      : 'bg-transparent border-transparent text-gray-400 hover:bg-dark-bg/80'
                  }`}
                >
                  Futsal
                </button>
              </div>
              <select
                value={sort}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  setPage(1)
                  setSort(e.target.value as 'recent' | 'name')
                }}
                className="bg-dark-card border border-dark-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-accent-blue transition-smooth"
              >
                <option value="recent">Nejnovější</option>
                <option value="name">Název (A–Z)</option>
              </select>
              {hasActiveFilter && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-[11px] text-gray-400 hover:text-accent-blue underline-offset-2 hover:underline"
                >
                  Vymazat filtry
                </button>
              )}
            </div>
          </div>
        </div>

        {isInitialLoading && (
          <div className="text-center py-12">
            <div className="spinner mx-auto" />
            <p className="mt-4 text-gray-400">Načítání log...</p>
          </div>
        )}

        {!isInitialLoading && error && (
          <div className="text-center py-12 text-red-400">{error}</div>
        )}

        {showEmpty && (
          <div className="text-center py-16">
            <p className="text-xl text-gray-400 mb-2">Žádná loga nenalezena</p>
            {hasActiveFilter ? (
              <p className="text-sm text-gray-500 mb-4">
                Zkuste upravit vyhledávání nebo typ klubu, případně vymažte filtry.
              </p>
            ) : (
              <p className="text-sm text-gray-500 mb-4">
                Zatím zde nejsou žádná loga.
              </p>
            )}
            {hasActiveFilter && (
              <button
                type="button"
                onClick={resetFilters}
                className="px-4 py-2 bg-dark-card border border-dark-border rounded-lg text-sm text-gray-200 hover:bg-dark-border transition-smooth mr-2"
              >
                Vymazat filtry
              </button>
            )}
            <a
              href="/admin.html"
              className="inline-flex items-center justify-center px-4 py-2 bg-accent-green rounded-lg text-sm font-medium hover:bg-green-600 transition-smooth"
            >
              Nahrát nové logo
            </a>
          </div>
        )}

        {!showEmpty && logos.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {logos.map((logo: Logo) => {
              const logoUrl = `${API_BASE_URL}/logos/${logo.id}`
              return (
                <div
                  key={logo.id}
                  className="logo-card bg-dark-card rounded-xl p-4 border border-dark-border hover:border-accent-blue transition-smooth group"
                >
                  <button
                    type="button"
                    onClick={() =>
                      (window.location.href = `/logo.html?id=${logo.id}`)
                    }
                    className="aspect-square bg-dark-bg rounded-lg flex items-center justify-center mb-3 overflow-hidden cursor-pointer w-full"
                  >
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
                  </button>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        (window.location.href = `/logo.html?id=${logo.id}`)
                      }
                      className="flex-1 min-w-0 text-left cursor-pointer"
                    >
                      <h3 className="font-semibold text-sm truncate mb-0.5">
                        {logo.club_name}
                      </h3>
                      <p className="text-xs text-gray-400 truncate">
                        {logo.club_city
                          ? `${logo.club_city}  b7 ${logo.club_type || 'fotbal'}`
                          : logo.club_type || 'fotbal'}
                      </p>
                      <div className="mt-1 flex gap-1">
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
                    <button
                      type="button"
                      onClick={() => handleDelete(logo.id)}
                      className="delete-logo px-3 py-1.5 text-xs bg-red-600 rounded hover:bg-red-500 transition-smooth"
                    >
                      Smazat
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {hasMore && !isInitialLoading && (
          <div className="text-center mt-10">
            <button
              type="button"
              onClick={() => loadPage(false)}
              className="px-6 py-3 bg-dark-card border border-dark-border rounded-lg hover:bg-dark-border transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Načítání...' : 'Načíst další'}
            </button>
          </div>
        )}
      </main>

      <SiteFooter caption="České Kluby Loga API" />
    </>
  )
}

export default LogosApp
