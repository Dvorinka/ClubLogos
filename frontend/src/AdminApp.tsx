import React, { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { TopNav, SiteFooter } from './layout'

const API_BASE_URL = '/api'
const FACR_API_URL = 'https://facr.tdvorak.dev'

type Club = {
  id: string
  name: string
  type?: string
  website?: string
  logo_url?: string
}

type ExistingLogo = {
  id: string
}

type ClubResult = Club & {
  existingLogo?: boolean
  logoUrl?: string
}

type SelectedFile = {
  file: File
  ext: string
  name: string
  description: string
}

type Notification = {
  message: string
  type: 'success' | 'error' | 'info'
} | null

const ClubLogoImage: React.FC<{ src?: string; alt: string }> = ({ src, alt }) => {
  const [errored, setErrored] = useState(false)

  if (!src || errored) {
    return (
      <svg
        className="w-8 h-8 text-gray-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className="max-w-full max-h-full object-contain"
      onError={() => setErrored(true)}
    />
  )
}

const AdminApp: React.FC = () => {
  const [clubSearchQuery, setClubSearchQuery] = useState('')
  const [clubs, setClubs] = useState<ClubResult[]>([])
  const [clubSearchLoading, setClubSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  const [clubUuid, setClubUuid] = useState('')
  const [clubName, setClubName] = useState('')
  const [clubType, setClubType] = useState<'football' | 'futsal'>('football')
  const [clubWebsite, setClubWebsite] = useState('')
  const [uploadVisible, setUploadVisible] = useState(false)

  const [isEditMode, setIsEditMode] = useState(false)

  const [websiteSearchLoading, setWebsiteSearchLoading] = useState(false)
  const [websiteSearchUrl, setWebsiteSearchUrl] = useState<string | null>(null)

  const [logoUrlInput, setLogoUrlInput] = useState('')
  const [loadFromUrlLoading, setLoadFromUrlLoading] = useState(false)

  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ uploaded: number; total: number } | null>(
    null,
  )

  const [dragOver, setDragOver] = useState(false)

  const [notification, setNotification] = useState<Notification>(null)

  const searchTimeoutRef = useRef<number | null>(null)
  const searchResultsRef = useRef<HTMLDivElement | null>(null)
  const uploadSectionRef = useRef<HTMLElement | null>(null)
  const filesPreviewAreaRef = useRef<HTMLDivElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type })
    window.setTimeout(() => setNotification(null), 3000)
  }

  const searchClubs = async (query: string) => {
    setClubSearchLoading(true)
    setSearchError(null)
    try {
      const response = await fetch(`${API_BASE_URL}/clubs/search?q=${encodeURIComponent(query)}`)
      if (!response.ok) throw new Error('API nedostupné')

      const contentType = response.headers.get('content-type') || ''
      if (!contentType.includes('application/json')) throw new Error('API vrátilo neplatnou odpověď')

      const clubsData = (await response.json()) as Club[]

      let existingLogos: ExistingLogo[] = []
      try {
        const logosResponse = await fetch(`${API_BASE_URL}/logos`)
        if (logosResponse.ok) {
          const logosContentType = logosResponse.headers.get('content-type') || ''
          if (logosContentType.includes('application/json')) {
            const logosData = (await logosResponse.json()) as ExistingLogo[]
            existingLogos = logosData || []
          }
        }
      } catch {
        // optional
      }

      const enriched: ClubResult[] = clubsData.map((club) => {
        const existingLogo = existingLogos.find((l) => l.id === club.id)
        let logoUrl = ''
        if (existingLogo) logoUrl = `${API_BASE_URL}/logos/${club.id}`
        else if (club.logo_url) logoUrl = club.logo_url
        return { ...club, existingLogo: Boolean(existingLogo), logoUrl: logoUrl || undefined }
      })

      setClubs(enriched)
    } catch (error: any) {
      if (!String(error?.message || '').includes('<!DOCTYPE')) {
        console.warn('Search failed:', error?.message || error)
      }
      setClubs([])
      setSearchError('Hledání dočasně nedostupné')
    } finally {
      setClubSearchLoading(false)
    }
  }

  const handleSelectClub = (club: ClubResult) => {
    setClubUuid(club.id)
    setClubName(club.name)
    setClubType((club.type as 'football' | 'futsal') || 'football')
    setClubWebsite(club.website || '')
    setUploadVisible(true)

    window.setTimeout(() => {
      if (uploadSectionRef.current) {
        uploadSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
        gsap.from(uploadSectionRef.current, {
          duration: 0.5,
          opacity: 0,
          y: 20,
          ease: 'power2.out',
        })
      }
    }, 0)

    showNotification(`Vybráno: ${club.name}`, 'success')
  }

  const handleSearchWebsite = () => {
    const name = clubName.trim()
    if (!name) {
      showNotification('Nejprve zadejte název klubu', 'error')
      return
    }
    setWebsiteSearchLoading(true)
    try {
      const searchQuery = encodeURIComponent(`${name} český fotbal oficiální web`)
      const searchUrl = `https://www.google.com/search?q=${searchQuery}`
      setWebsiteSearchUrl(searchUrl)
    } catch (error) {
      console.error('Website search error:', error)
    } finally {
      setWebsiteSearchLoading(false)
    }
  }

  const handleFilesSelect = (files: File[]) => {
    const validFiles: SelectedFile[] = []
    for (const file of files) {
      const ext = file.name.split('.').pop()?.toLowerCase() || ''
      if (ext === 'svg' || ext === 'png' || ext === 'pdf') {
        validFiles.push({ file, ext, name: '', description: '' })
      }
    }
    if (validFiles.length === 0) {
      showNotification('Vyberte prosím SVG, PNG nebo PDF soubory', 'error')
      return
    }
    setSelectedFiles(validFiles)
  }

  const handleFileMetadataChange = (
    index: number,
    field: 'name' | 'description',
    value: string,
  ) => {
    setSelectedFiles((prev) => {
      const next = [...prev]
      if (!next[index]) return prev
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => {
      const next = [...prev]
      next.splice(index, 1)
      if (next.length === 0 && fileInputRef.current) fileInputRef.current.value = ''
      return next
    })
  }

  const handleLoadFromUrl = async () => {
    const url = logoUrlInput.trim()
    if (!url) {
      showNotification('Zadejte prosím URL obrázku', 'error')
      return
    }
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      showNotification('URL musí začínat http:// nebo https://', 'error')
      return
    }

    setLoadFromUrlLoading(true)
    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error('Nelze načíst obrázek')
      const blob = await response.blob()

      let ext = 'png'
      const contentType = response.headers.get('content-type') || ''
      if (contentType.includes('svg')) ext = 'svg'
      else if (contentType.includes('pdf')) ext = 'pdf'
      else if (contentType.includes('png')) ext = 'png'
      else {
        const urlExt = url.split('.').pop()?.toLowerCase().split('?')[0]
        if (urlExt && ['svg', 'png', 'pdf'].includes(urlExt)) ext = urlExt
      }

      const filename = `logo-${Date.now()}.${ext}`
      const file = new File([blob], filename, { type: blob.type })
      handleFilesSelect([file])
      showNotification('Obrázek úspěšně načten z URL', 'success')
    } catch (error: any) {
      console.error('Load from URL error:', error)
      showNotification(`Chyba načítání: ${error?.message || 'Chyba'}`, 'error')
    } finally {
      setLoadFromUrlLoading(false)
    }
  }

  const resetFormAfterUpload = () => {
    setClubUuid('')
    setClubName('')
    setClubType('football')
    setClubWebsite('')
    setSelectedFiles([])
    setUploadVisible(false)
    setClubSearchQuery('')
    setClubs([])
    setWebsiteSearchUrl(null)
    setLogoUrlInput('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const uploadLogos = async (
    uuid: string,
    clubNameValue: string,
    clubTypeValue: string,
    clubWebsiteValue: string,
    filesData: SelectedFile[],
  ) => {
    setUploading(true)
    setUploadProgress({ uploaded: 0, total: filesData.length })
    try {
      let uploadedCount = 0
      for (let i = 0; i < filesData.length; i++) {
        const fileData = filesData[i]
        const formData = new FormData()
        formData.append('file', fileData.file)
        formData.append('club_name', clubNameValue)
        if (clubTypeValue) formData.append('club_type', clubTypeValue)
        if (clubWebsiteValue) formData.append('club_website', clubWebsiteValue)

        if (i > 0) {
          formData.append('variant', 'true')
          if (fileData.name) formData.append('variant_name', fileData.name)
          if (fileData.description) formData.append('variant_description', fileData.description)
        } else {
          if (fileData.name) formData.append('variant_name', fileData.name || 'Hlavní')
          if (fileData.description) formData.append('variant_description', fileData.description)
        }

        const response = await fetch(`${API_BASE_URL}/logos/${uuid}`, {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          let message = 'Upload failed'
          try {
            const errorData = await response.json()
            if (errorData && errorData.error) message = errorData.error
          } catch {
            // ignore
          }
          throw new Error(message)
        }

        uploadedCount++
        setUploadProgress({ uploaded: uploadedCount, total: filesData.length })
      }

      showNotification(
        `${uploadedCount} ${uploadedCount === 1 ? 'logo' : 'loga'} úspěšně nahráno pro ${
          clubNameValue || uuid
        }! ✓`,
        'success',
      )

      window.setTimeout(() => {
        resetFormAfterUpload()
      }, 2000)
    } catch (error: any) {
      console.error('Upload error:', error)
      showNotification(`Nahrání selhalo: ${error?.message || 'Chyba'}`, 'error')
    } finally {
      setUploading(false)
      setUploadProgress(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const uuid = clubUuid.trim()
    const name = clubName.trim()
    const type = clubType
    const website = clubWebsite.trim()

    if (!uuid) {
      showNotification('Nejprve vyberte klub', 'error')
      return
    }
    if (selectedFiles.length === 0) {
      showNotification('Vyberte prosím soubor loga', 'error')
      return
    }
    if (!uuidRegex.test(uuid)) {
      showNotification('Neplatný formát UUID', 'error')
      return
    }

    await uploadLogos(uuid, name, type, website, selectedFiles)
  }

  useEffect(() => {
    console.log('🇨🇿 České Kluby Loga API - Administrace')
    console.log('Backend API:', API_BASE_URL)
    console.log('FAČR API:', FACR_API_URL)
  }, [])

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const editId = params.get('id')
      if (editId) {
        setIsEditMode(true)
        setClubUuid(editId)
        setUploadVisible(true)
        showNotification('Režim úprav pro existující logo', 'info')
        ;(async () => {
          try {
            const resp = await fetch(`${API_BASE_URL}/logos/${editId}/json`)
            if (resp.ok) {
              const contentType = resp.headers.get('content-type') || ''
              if (contentType.includes('application/json')) {
                const data = await resp.json()
                if (data.club_name) setClubName(data.club_name)
                if (data.club_type) setClubType(data.club_type)
                if (data.club_website) setClubWebsite(data.club_website)
              }
            }
          } catch {
            // non-fatal
          }
        })()
      }
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      showNotification('Administrace: Vyhledejte kluby a nahrajte loga', 'info')
    }, 1000)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (searchTimeoutRef.current) window.clearTimeout(searchTimeoutRef.current)
    const query = clubSearchQuery.trim()
    if (query.length < 2) {
      setClubs([])
      setSearchError(null)
      return
    }
    searchTimeoutRef.current = window.setTimeout(() => {
      searchClubs(query)
    }, 300)
  }, [clubSearchQuery])

  useEffect(() => {
    if (!searchResultsRef.current || clubs.length === 0) return
    const items = searchResultsRef.current.querySelectorAll('.club-result')
    if (!items.length) return
    gsap.from(items, {
      duration: 0.4,
      opacity: 0,
      y: 20,
      stagger: 0.08,
      ease: 'power2.out',
    })
  }, [clubs])

  useEffect(() => {
    if (!filesPreviewAreaRef.current || selectedFiles.length === 0) return
    const items = filesPreviewAreaRef.current.querySelectorAll('[data-file-index]')
    if (!items.length) return
    gsap.from(items, {
      duration: 0.4,
      opacity: 0,
      y: 10,
      stagger: 0.05,
      ease: 'power2.out',
    })
  }, [selectedFiles])

  return (
    <>
      {/* Navigation */}
      <TopNav active="admin" />

      {/* Admin Header */}
      <header className="border-b border-dark-border bg-dark-card">
        <div className="container mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">Administrace</h1>
          <p className="text-gray-400">Vyhledejte kluby a nahrajte jejich loga</p>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        {/* Club Search Section */}
        <section className="mb-12">
          <div className="bg-dark-card rounded-xl p-6 border border-dark-border">
            <h2 className="text-2xl font-bold mb-2">Krok 1: Vyhledat klub</h2>
            <p className="text-sm text-gray-400 mb-4">
              Začněte psát název klubu nebo města, poté vyberte správný klub ze seznamu.
            </p>

            <div className="relative mb-6">
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
                id="clubSearch"
                placeholder="Hledat české kluby (např. Sparta, Slavia)..."
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 pl-9 py-3 text-sm text-white focus:outline-none focus:border-accent-blue transition-smooth"
                value={clubSearchQuery}
                onChange={(e) => setClubSearchQuery(e.target.value)}
              />
            </div>

            {/* Search Results */}
            <div id="searchResults" className="space-y-3" ref={searchResultsRef}>
              {clubSearchLoading && (
                <div className="text-center py-4">
                  <div className="spinner mx-auto" />
                </div>
              )}

              {!clubSearchLoading && searchError && (
                <div className="text-center py-4 text-yellow-400">
                  <p className="mb-2">Hledání dočasně nedostupné</p>
                  <p className="text-xs text-gray-400">Zkontrolujte, zda běží backend server</p>
                </div>
              )}

              {!clubSearchLoading &&
                !searchError &&
                clubSearchQuery.trim().length >= 2 &&
                clubs.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <p>Žádné kluby nenalezeny</p>
                  </div>
                )}

              {!clubSearchLoading &&
                !searchError &&
                clubs.map((club) => (
                  <div
                    key={club.id}
                    className="club-result bg-dark-bg rounded-lg p-4 border border-dark-border hover:border-accent-blue transition-smooth cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center bg-dark-border/30 rounded-lg p-2">
                        <ClubLogoImage src={club.logoUrl} alt={club.name} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate">{club.name}</h3>
                        <p className="text-sm text-gray-400">{club.type || 'football'}</p>
                        <p className="text-xs text-gray-500 font-mono mt-1 truncate">{club.id}</p>
                        {club.website && (
                          <p className="text-xs text-blue-400 mt-1 truncate">{club.website}</p>
                        )}
                        {club.existingLogo && (
                          <p className="text-xs text-green-400 mt-1">Logo již nahráno</p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        {club.existingLogo && (
                          <a
                            href={`/logo.html?id=${club.id}`}
                            className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-smooth text-sm text-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Detail
                          </a>
                        )}
                        <button
                          type="button"
                          className="select-club px-4 py-2 bg-accent-blue rounded-lg hover:bg-blue-600 transition-smooth text-sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSelectClub(club)
                          }}
                        >
                          Vybrat
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </section>

        {/* Upload Section */}
        <section
          id="uploadSection"
          ref={uploadSectionRef}
          className={uploadVisible ? '' : 'hidden'}
        >
          <div className="bg-dark-card rounded-xl p-6 border border-dark-border">
            <h2 className="text-2xl font-bold mb-2">Krok 2: Nahrát logo</h2>
            <p className="text-sm text-gray-400 mb-4">
              Zkontrolujte údaje o klubu a nahrajte hlavní logo i případné varianty.
            </p>
            {clubUuid && (
              <div className="mb-4 rounded-lg border border-dark-border bg-dark-bg/60 px-4 py-3 text-sm md:flex md:items-center md:justify-between md:gap-4">
                <div className="min-w-0">
                  {isEditMode && (
                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-accent-blue">
                      Režim úprav existujícího loga
                    </p>
                  )}
                  <p className="font-semibold truncate">
                    {clubName || 'Vybraný klub'}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {clubType === 'futsal' ? 'Futsal' : 'Fotbal'}
                    {clubWebsite ? ` • ${clubWebsite}` : ''}
                  </p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 md:mt-0 md:ml-4">
                  <span className="inline-flex items-center rounded-full border border-dark-border px-3 py-1 text-xs text-gray-400 font-mono max-w-full truncate">
                    {clubUuid}
                  </span>
                  <a
                    href={`/logo.html?id=${clubUuid}`}
                    className="inline-flex items-center rounded-full border border-dark-border px-3 py-1 text-xs text-accent-blue hover:border-accent-blue transition-smooth"
                  >
                    Detail loga
                  </a>
                </div>
              </div>
            )}
            <form id="uploadForm" className="space-y-6" onSubmit={handleSubmit}>
              {/* Club UUID (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  UUID Klubu <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="clubUuid"
                  readOnly
                  className="w-full bg-dark-bg/50 border border-dark-border rounded-lg px-4 py-3 text-gray-400 cursor-not-allowed"
                  value={clubUuid}
                />
              </div>

              {/* Club Name (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Název Klubu{' '}
                  <span className="text-gray-500 text-xs">(volitelné)</span>
                </label>
                <input
                  type="text"
                  id="clubName"
                  placeholder="AC Sparta Praha"
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-blue transition-smooth"
                  value={clubName}
                  onChange={(e) => setClubName(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Volitelné: Pokud název neuvedete, doplníme jej automaticky dle
                  FAČR (podle UUID)
                </p>
              </div>

              {/* Club Type */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Typ Klubu
                </label>
                <select
                  id="clubType"
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-blue transition-smooth"
                  value={clubType}
                  onChange={(e) => setClubType(e.target.value as 'football' | 'futsal')}
                >
                  <option value="football">Fotbal</option>
                  <option value="futsal">Futsal</option>
                </select>
              </div>

              {/* Club Website with Search */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Web Klubu
                  <button
                    type="button"
                    id="searchWebsite"
                    className="ml-2 text-accent-blue hover:text-blue-400 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleSearchWebsite}
                    disabled={websiteSearchLoading}
                  >
                    {websiteSearchLoading ? (
                      <span className="inline-flex items-center">
                        <div className="spinner inline-block w-4 h-4" />
                      </span>
                    ) : (
                      'Hledat online'
                    )}
                  </button>
                </label>
                <input
                  type="url"
                  id="clubWebsite"
                  placeholder="https://www.sparta.cz"
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-blue transition-smooth"
                  value={clubWebsite}
                  onChange={(e) => setClubWebsite(e.target.value)}
                />
                <div
                  id="websiteSearchResults"
                  className={`mt-2 ${websiteSearchUrl ? '' : 'hidden'}`}
                >
                  {websiteSearchUrl && (
                    <div className="bg-dark-bg rounded-lg p-3 border border-dark-border">
                      <p className="text-sm text-gray-400 mb-2">Vyhledat web klubu:</p>
                      <a
                        href={websiteSearchUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-accent-blue hover:text-blue-400 text-sm"
                      >
                        Hledat "{clubName || 'klub'}" na Google
                      </a>
                      <p className="text-xs text-gray-500 mt-2">
                        Zkopírujte URL oficiálního webu a vložte jej výše
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* File Upload Area */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Soubor Loga <span className="text-red-500">*</span>
                </label>

                {/* URL Upload */}
                <div className="mb-3">
                  <input
                    type="url"
                    id="logoUrl"
                    placeholder="Nebo vložte URL obrázku (https://...)"
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-blue transition-smooth"
                    value={logoUrlInput}
                    onChange={(e) => setLogoUrlInput(e.target.value)}
                  />
                  <button
                    type="button"
                    id="loadFromUrl"
                    className="mt-2 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-smooth text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleLoadFromUrl}
                    disabled={loadFromUrlLoading}
                  >
                    {loadFromUrlLoading ? (
                      <span className="inline-flex items-center">
                        <div className="spinner inline-block w-4 h-4" />
                      </span>
                    ) : (
                      'Načíst z URL'
                    )}
                  </button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-dark-border" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-dark-card text-gray-400">nebo</span>
                  </div>
                </div>

                <div
                  id="uploadArea"
                  className={`upload-area rounded-lg p-12 text-center cursor-pointer border-2 border-dashed border-dark-border hover:border-accent-blue transition-smooth mt-3 ${
                    dragOver ? 'dragover border-accent-blue' : ''
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault()
                    setDragOver(true)
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault()
                    setDragOver(false)
                  }}
                  onDrop={(e) => {
                    e.preventDefault()
                    setDragOver(false)
                    const files = Array.from(e.dataTransfer.files || [])
                    if (files.length > 0) {
                      handleFilesSelect(files)
                    }
                  }}
                >
                  <svg
                    style={{ width: 75, paddingTop: 20 }}
                    className="mx-auto h-12 w-12 text-gray-400 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="text-lg mb-2">
                    Přetáhněte logo sem nebo{' '}
                    <span className="text-accent-blue font-semibold">
                      procházet
                    </span>
                  </p>
                  <p className="text-sm text-gray-500">
                    SVG, PNG nebo PDF • Preferováno průhledné pozadí
                  </p>
                  <p className="text-xs text-gray-600 mt-2">
                    SVG a PDF soubory budou automaticky převedeny na PNG
                  </p>
                  <input
                    type="file"
                    id="fileInput"
                    accept=".svg,.png,.pdf"
                    className="hidden"
                    multiple
                    ref={fileInputRef}
                    onChange={(e) => {
                      const files = Array.from(e.target.files || [])
                      if (files.length > 0) {
                        handleFilesSelect(files)
                      }
                    }}
                  />
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  Můžete vybrat více souborů najednou pro nahrání variant
                </p>
              </div>

              {/* Files Preview */}
              <div
                id="filesPreviewArea"
                ref={filesPreviewAreaRef}
                className={selectedFiles.length > 0 ? '' : 'hidden'}
              >
                <h3 className="text-lg font-semibold mb-3">Vybrané soubory</h3>
                <div id="filesPreviewList" className="space-y-3">
                  {selectedFiles.map((fileObj, index) => {
                    const sizeKB = (fileObj.file.size / 1024).toFixed(2)
                    const isPrimary = index === 0
                    const icon =
                      fileObj.ext === 'svg' ? 'SVG' : fileObj.ext === 'pdf' ? 'PDF' : 'PNG'
                    return (
                      <div
                        key={index}
                        className="bg-dark-bg rounded-lg p-4 border border-dark-border"
                        data-file-index={index}
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-16 h-16 bg-dark-border/30 rounded flex items-center justify-center">
                            <span className="text-2xl">{icon}</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold">{fileObj.file.name}</h4>
                              {isPrimary && (
                                <span className="px-2 py-0.5 bg-accent-blue rounded text-xs">
                                  Hlavní
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 mb-3">
                              {fileObj.ext.toUpperCase()} • {sizeKB} KB
                            </p>
                            <div className="space-y-2">
                              <input
                                type="text"
                                placeholder="Název varianty (volitelné)"
                                value={fileObj.name}
                                onChange={(e) =>
                                  handleFileMetadataChange(index, 'name', e.target.value)
                                }
                                className="w-full bg-dark-card border border-dark-border rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-blue transition-smooth"
                              />
                              <input
                                type="text"
                                placeholder="Popis (volitelné)"
                                value={fileObj.description}
                                onChange={(e) =>
                                  handleFileMetadataChange(index, 'description', e.target.value)
                                }
                                className="w-full bg-dark-card border border-dark-border rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-blue transition-smooth"
                              />
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(index)}
                            className="flex-shrink-0 p-2 text-red-400 hover:text-red-300 transition-smooth"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Upload Button */}
              <button
                type="submit"
                id="uploadSubmit"
                className="w-full px-6 py-4 bg-accent-green rounded-lg font-semibold hover:bg-green-600 transition-smooth disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                disabled={uploading}
              >
                {uploading && uploadProgress ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <div className="spinner mx-auto" />
                    <span>
                      {uploadProgress.uploaded}/{uploadProgress.total}
                    </span>
                  </span>
                ) : (
                  isEditMode ? 'Aktualizovat logo' : 'Nahrát logo'
                )}
              </button>

              {/* Requirements Notice */}
              <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-sm">
                <p className="font-semibold text-red-400 mb-2">
                  ⚠️ Požadavky na nahrání:
                </p>
                <ul className="list-disc list-inside space-y-1 text-red-300/80">
                  <li>
                    Název klubu je volitelný (doplníme dle FAČR podle UUID)
                  </li>
                  <li>UUID klubu musí být platné</li>
                  <li>Akceptovány pouze SVG, PNG a PDF soubory</li>
                  <li>Doporučeno průhledné pozadí</li>
                </ul>
              </div>
            </form>
          </div>
        </section>
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

export default AdminApp
