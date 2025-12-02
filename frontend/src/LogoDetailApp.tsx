import React, { useEffect, useState } from 'react'
import gsap from 'gsap'
import { TopNav, SiteFooter } from './layout'

const API_BASE_URL = 'https://logoapi.sportcreative.eu'

type LogoVariant = {
  url: string
  name?: string
  description?: string
  format: string
  size?: number
}

type LogoDetail = {
  id: string
  club_name: string
  club_city?: string
  club_type?: string
  club_website?: string
  has_svg?: boolean
  has_png?: boolean
  file_size_svg?: number
  file_size_png?: number
  created_at?: string
  variants?: LogoVariant[]
}

type Notification = {
  message: string
  type: 'success' | 'error' | 'info'
} | null

function formatFileSize(bytes?: number): string {
  if (!bytes) return 'N/A'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function formatDate(dateString?: string): string {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('cs-CZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const LogoDetailApp: React.FC = () => {
  const [logo, setLogo] = useState<LogoDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notification, setNotification] = useState<Notification>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const id = params.get('id')

    if (!id) {
      setError('Logo s tímto UUID neexistuje')
      setLoading(false)
      return
    }

    const loadLogo = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/logos/${id}/json`)
        if (!response.ok) {
          throw new Error('Logo not found')
        }
        const data: LogoDetail = await response.json()
        setLogo(data)
      } catch (e) {
        console.error('Error loading logo:', e)
        setError('Logo s tímto UUID neexistuje')
      } finally {
        setLoading(false)
      }
    }

    loadLogo()
  }, [])

  useEffect(() => {
    if (!logo) return
    gsap.from('.logo-detail-section', {
      duration: 0.6,
      opacity: 0,
      y: 20,
      stagger: 0.1,
      ease: 'power2.out',
    })
  }, [logo])

  const handleCopy = (text: string, label: string) => {
    if (!text) return
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setNotification({
          message: `URL zkopírováno: ${label}`,
          type: 'success',
        })
      })
      .catch(() => {
        setNotification({
          message: 'Chyba při kopírování',
          type: 'error',
        })
      })

    setTimeout(() => {
      setNotification(null)
    }, 3000)
  }

  const logoId = logo?.id
  const previewUrl = logoId ? `${API_BASE_URL}/logos/${logoId}` : ''

  const formats = logo
    ? [
        logo.has_png && {
          name: 'PNG',
          url: `${API_BASE_URL}/logos/${logoId}?format=png`,
          size: formatFileSize(logo.file_size_png),
          icon: 'PNG',
          color: 'bg-blue-600',
        },
        logo.has_svg && {
          name: 'SVG',
          url: `${API_BASE_URL}/logos/${logoId}?format=svg`,
          size: formatFileSize(logo.file_size_svg),
          icon: 'SVG',
          color: 'bg-green-600',
        },
      ].filter(Boolean) as {
        name: string
        url: string
        size: string
        icon: string
        color: string
      }[]
    : []

  const apiUrlDefault = logoId ? `${API_BASE_URL}/logos/${logoId}` : ''
  const apiUrlJson = logoId ? `${API_BASE_URL}/logos/${logoId}/json` : ''

  return (
    <>
      {/* Navigation */}
      <TopNav active="logos" />

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        {loading && (
          <div className="text-center py-12">
            <div className="spinner mx-auto mb-4" />
            <p className="text-gray-400">Načítání...</p>
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-16 w-16 text-red-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="text-2xl font-bold mb-2">Logo nenalezeno</h2>
            <p className="text-gray-400 mb-4">Logo s tímto UUID neexistuje</p>
            <a
              href="/"
              className="px-4 py-2 bg-accent-blue rounded-lg hover:bg-blue-600 transition-smooth inline-block"
            >
              Zpět na hlavní stránku
            </a>
          </div>
        )}

        {!loading && !error && logo && (
          <div className="space-y-8 logo-detail-section">
            {/* Header */}
            <div className="mb-8 space-y-3">
              <div className="text-sm text-gray-500">
                <a
                  href="/logos.html"
                  className="hover:text-accent-blue transition-smooth"
                >
                  Všechna loga
                </a>
                <span> / </span>
                <span className="text-gray-300">{logo.club_name}</span>
              </div>
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <h1 className="text-4xl font-bold gradient-text mb-2 truncate">
                    {logo.club_name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-gray-400">
                    <span>{logo.club_type || 'fotbal'}</span>
                    {logo.club_city && (
                      <>
                        <span>•</span>
                        <span>{logo.club_city}</span>
                      </>
                    )}
                    {logo.club_website && (
                      <>
                        <span>•</span>
                        <a
                          href={logo.club_website}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-accent-blue"
                        >
                          Oficiální web
                        </a>
                      </>
                    )}
                    {logo.created_at && (
                      <>
                        <span>•</span>
                        <span>Nahráno {formatDate(logo.created_at)}</span>
                      </>
                    )}
                  </div>
                </div>
                {logoId && (
                  <div className="flex flex-col gap-2 md:items-end">
                    <a
                      href={`/admin.html?id=${logoId}`}
                      className="px-4 py-2 bg-accent-blue rounded-lg hover:bg-blue-600 transition-smooth text-sm"
                    >
                      Upravit logo
                    </a>
                    <a
                      href="/logos.html"
                      className="text-xs text-gray-400 hover:text-accent-blue transition-smooth"
                    >
                      Zpět na seznam log
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Logo Preview */}
            <section className="mb-8 logo-detail-section">
              <div className="bg-dark-card rounded-xl p-8 border border-dark-border">
                <h2 className="text-2xl font-bold mb-6">Náhled loga</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Light Background */}
                  <div className="logo-preview-surface logo-preview-light rounded-lg p-8 flex items-center justify-center min-h-[300px]">
                    {previewUrl && (
                      <div className="logo-preview-inner">
                        <img
                          src={previewUrl}
                          alt={logo.club_name}
                          className="max-w-full max-h-64 object-contain"
                        />
                      </div>
                    )}
                  </div>
                  {/* Dark Background */}
                  <div className="logo-preview-surface logo-preview-dark rounded-lg p-8 flex items-center justify-center min-h-[300px]">
                    {previewUrl && (
                      <div className="logo-preview-inner">
                        <img
                          src={previewUrl}
                          alt={logo.club_name}
                          className="max-w-full max-h-64 object-contain"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Available Formats */}
            <section className="mb-8 logo-detail-section">
              <div className="bg-dark-card rounded-xl p-6 border border-dark-border">
                <h2 className="text-2xl font-bold mb-6">Dostupné formáty</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {formats.map((format) => (
                    <a
                      key={format.name}
                      href={format.url}
                      download
                      className="block bg-dark-bg rounded-lg p-4 border border-dark-border hover:border-accent-blue transition-smooth"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl">{format.icon}</span>
                        <span
                          className={`${format.color} px-2 py-1 rounded text-xs font-semibold`}
                        >
                          {format.name}
                        </span>
                      </div>
                      <h3 className="font-semibold mb-1">{format.name} Format</h3>
                      <p className="text-sm text-gray-400">{format.size}</p>
                      <div className="mt-3 flex items-center text-accent-blue text-sm">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                        Stáhnout
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </section>

            {/* Variants */}
            {logo.variants && logo.variants.length > 0 && (
              <section className="mb-8 logo-detail-section">
                <div className="bg-dark-card rounded-xl p-6 border border-dark-border">
                  <h2 className="text-2xl font-bold mb-6">Varianty loga</h2>
                  <div className="space-y-4">
                    {logo.variants.map((variant) => (
                      <div
                        key={variant.url}
                        className="bg-dark-bg rounded-lg p-4 border border-dark-border"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-20 h-20 bg-white rounded flex items-center justify-center p-2">
                            <img
                              src={variant.url}
                              alt={variant.name || 'Varianta'}
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold mb-1">
                              {variant.name || 'Varianta'}
                            </h3>
                            {variant.description && (
                              <p className="text-sm text-gray-400 mb-2">
                                {variant.description}
                              </p>
                            )}
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span>{variant.format.toUpperCase()}</span>
                              <span>•</span>
                              <span>{formatFileSize(variant.size)}</span>
                            </div>
                          </div>
                          <a
                            href={variant.url}
                            download
                            className="px-3 py-2 bg-accent-blue rounded-lg hover:bg-blue-600 transition-smooth text-sm"
                          >
                            ⬇️
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Metadata */}
            <section className="mb-8 logo-detail-section">
              <div className="bg-dark-card rounded-xl p-6 border border-dark-border">
                <h2 className="text-2xl font-bold mb-6">Informace</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">UUID</h3>
                    <p className="font-mono text-sm bg-dark-bg rounded px-3 py-2">
                      {logo.id}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">
                      Typ Klubu
                    </h3>
                    <p className="text-sm bg-dark-bg rounded px-3 py-2">
                      {logo.club_type || 'fotbal'}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">
                      Webová Stránka
                    </h3>
                    <p className="text-sm bg-dark-bg rounded px-3 py-2">
                      {logo.club_website ? (
                        <a
                          href={logo.club_website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-accent-blue hover:underline"
                        >
                          {logo.club_website}
                        </a>
                      ) : (
                        'N/A'
                      )}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">
                      Datum Nahrání
                    </h3>
                    <p className="text-sm bg-dark-bg rounded px-3 py-2">
                      {formatDate(logo.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* API Usage */}
            <section className="logo-detail-section">
              <div className="bg-dark-card rounded-xl p-6 border border-dark-border">
                <h2 className="text-2xl font-bold mb-6">Použití API</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">
                      GET Logo (PNG preferováno)
                    </h3>
                    <div className="bg-dark-bg rounded px-4 py-3 font-mono text-sm flex items-center justify-between">
                      <code>{apiUrlDefault}</code>
                      <button
                        type="button"
                        onClick={() => handleCopy(apiUrlDefault, 'GET /logos/:id')}
                        className="px-3 py-1 bg-accent-blue rounded text-xs hover:bg-blue-600 transition-smooth"
                      >
                        Kopírovat
                      </button>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">
                      GET Logo s Metadaty (JSON)
                    </h3>
                    <div className="bg-dark-bg rounded px-4 py-3 font-mono text-sm flex items-center justify-between">
                      <code>{apiUrlJson}</code>
                      <button
                        type="button"
                        onClick={() => handleCopy(apiUrlJson, 'GET /logos/:id/json')}
                        className="px-3 py-1 bg-accent-blue rounded text-xs hover:bg-blue-600 transition-smooth"
                      >
                        Kopírovat
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Footer */}
      <SiteFooter caption="České Kluby Loga API" />

      {notification && (
        <div
          className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 text-white font-medium ${
            notification.type === 'success'
              ? 'bg-accent-green'
              : notification.type === 'error'
              ? 'bg-red-500'
              : 'bg-accent-blue'
          }`}
        >
          {notification.message}
        </div>
      )}
    </>
  )
}

export default LogoDetailApp
