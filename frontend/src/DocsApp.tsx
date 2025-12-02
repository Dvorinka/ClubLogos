import React from 'react'
import { TopNav, SiteFooter } from './layout'

const DocsApp: React.FC = () => {
  return (
    <>
      {/* Navigation */}
      <TopNav active="docs" />

      {/* Header */}
      <header className="border-b border-dark-border bg-dark-card">
        <div className="container mx-auto px-6 py-12">
          <h1 className="text-4xl font-bold gradient-text mb-3">API dokumentace</h1>
          <p className="text-xl text-gray-400">
            Kompletní referenční příručka pro České Kluby Loga API
          </p>
          <div className="mt-6 flex gap-4 items-center flex-wrap">
            <div>
              <span className="text-sm text-gray-400 mr-2">Frontend (prod):</span>
              <code className="bg-dark-bg px-4 py-2 rounded text-accent-blue">
                https://loga.sportcreative.eu
              </code>
            </div>
            <div>
              <span className="text-sm text-gray-400 mr-2">Backend API (prod):</span>
              <code className="bg-dark-bg px-4 py-2 rounded text-accent-green">
                https://logoapi.sportcreative.eu
              </code>
            </div>
          </div>
          <p className="text-sm text-gray-400 mt-3">
            Ve vývojovém prostředí používejte relativní cesty (např.{' '}
            <code className="text-accent-blue">/logos</code>), Vite proxy je
            přesměruje na backend
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 space-y-16 max-w-5xl">
        {/* Quick Start */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Rychlý start</h2>
          <div className="bg-gradient-to-br from-accent-green/10 to-accent-blue/10 rounded-xl p-6 border-2 border-accent-green/30">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              Nahrání loga klubu - Základní příkaz
            </h3>
            <pre className="bg-dark-bg rounded-lg p-4 overflow-x-auto">
              <code className="text-sm">
                {`curl -X POST https://logoapi.sportcreative.eu/logos/{club-uuid} \
  -F "file=@logo.svg" \
  -F "club_name=Název Klubu"`}
              </code>
            </pre>
            <div className="mt-4 space-y-2">
              <p className="text-sm text-gray-300">
                <strong className="text-accent-green">Povinné:</strong> Club UUID v
                URL, soubor loga (SVG/PNG/PDF), název klubu
              </p>
              <p className="text-sm text-gray-300">
                <strong className="text-accent-blue">Volitelné:</strong> club_type,
                club_website, club_city
              </p>
            </div>
          </div>

          <div className="bg-dark-card rounded-xl p-6 border border-dark-border mt-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              Stažení loga klubu
            </h3>
            <pre className="bg-dark-bg rounded-lg p-4 overflow-x-auto">
              <code className="text-sm">
                {`# Produkční API
curl https://logoapi.sportcreative.eu/logos/{uuid}

# Přes frontend (loga.sportcreative.eu)
curl https://loga.sportcreative.eu/api/logos/{uuid}`}
              </code>
            </pre>
            <p className="text-gray-400 mt-3 text-sm">
              Vrátí PNG obrázek loga (SVG jako fallback)
            </p>
          </div>
        </section>

        {/* Endpoints */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Endpointy</h2>

          {/* List Logos */}
          <div className="bg-dark-card rounded-xl p-6 border border-dark-border mb-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded font-mono text-sm">
                GET
              </span>
              <code className="text-lg">/logos</code>
            </div>
            <p className="text-gray-400 mb-4">Seznam všech nahraných log</p>

            <div className="bg-dark-bg rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-400 mb-2">
                Response 200:
              </h4>
              <pre className="text-sm overflow-x-auto">
                <code>{`[
  {
    "id": "uuid-here",
    "club_name": "AC Sparta Praha",
    "club_type": "football",
    "has_svg": true,
    "has_png": true,
    "logo_url": "https://logoapi.sportcreative.eu/logos/uuid-here",
    "created_at": "2024-01-01T12:00:00Z"
  }
]`}</code>
              </pre>
            </div>
          </div>

          {/* Get Logo File */}
          <div className="bg-dark-card rounded-xl p-6 border border-dark-border mb-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded font-mono text-sm">
                GET
              </span>
              <code className="text-lg">/logos/:id</code>
            </div>
            <p className="text-gray-400 mb-4">
              Získání souboru loga (PNG preferováno, SVG jako fallback)
            </p>

            <h4 className="text-sm font-semibold mb-2">Query Parameters (volitelné):</h4>
            <div className="bg-dark-bg rounded-lg p-4 mb-4">
              <code className="text-sm">format</code>{' '}
              <span className="text-gray-500">string</span> - "png" nebo "svg"
            </div>

            <div className="bg-dark-bg rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-400 mb-2">
                Response 200:
              </h4>
              <p className="text-sm text-gray-400">
                Binární data obrázku (image/png nebo image/svg+xml)
              </p>
            </div>
          </div>

          {/* Get Logo Metadata */}
          <div className="bg-dark-card rounded-xl p-6 border border-dark-border mb-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded font-mono text-sm">
                GET
              </span>
              <code className="text-lg">/logos/:id/json</code>
            </div>
            <p className="text-gray-400 mb-4">
              Získání metadat loga ve formátu JSON
            </p>

            <div className="bg-dark-bg rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-400 mb-2">
                Response 200:
              </h4>
              <pre className="text-sm overflow-x-auto">
                <code>{`{
  "id": "uuid-here",
  "club_name": "AC Sparta Praha",
  "club_type": "football",
  "club_website": "https://sparta.cz",
  "has_svg": true,
  "has_png": true,
  "primary_format": "png",
  "logo_url": "https://logoapi.sportcreative.eu/logos/uuid-here",
  "logo_url_svg": "https://logoapi.sportcreative.eu/logos/uuid-here?format=svg",
  "logo_url_png": "https://logoapi.sportcreative.eu/logos/uuid-here?format=png",
  "file_size_svg": 12345,
  "file_size_png": 54321,
  "created_at": "2024-01-01T12:00:00Z",
  "updated_at": "2024-01-01T12:00:00Z"
}`}</code>
              </pre>
            </div>
          </div>

          {/* Upload Logo */}
          <div className="bg-dark-card rounded-xl p-6 border border-dark-border mb-6 border-2 border-accent-green/40">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-accent-green/20 text-accent-green rounded font-mono text-sm">
                POST
              </span>
              <code className="text-lg">/logos/:id</code>
            </div>
            <p className="text-gray-400 mb-4">
              Nahrání nového loga klubu s kompletními daty (ID klubu, název, logo
              soubory)
            </p>

            <h4 className="text-sm font-semibold mb-2">URL Parameters:</h4>
            <div className="bg-dark-bg rounded-lg p-4 mb-4">
              <code className="text-sm">:id</code>{' '}
              <span className="text-red-400">*</span>{' '}
              <span className="text-gray-500">UUID</span> - Jedinečné ID klubu
              (např.{' '}
              <code className="text-xs">
                550e8400-e29b-41d4-a716-446655440000
              </code>
              )
            </div>

            <h4 className="text-sm font-semibold mb-2">Content-Type:</h4>
            <div className="bg-dark-bg rounded-lg p-4 mb-4">
              <code className="text-sm">multipart/form-data</code>
            </div>

            <h4 className="text-sm font-semibold mb-2">Form Data (Povinné pole):</h4>
            <div className="bg-dark-bg rounded-lg p-4 mb-4 space-y-3">
              <div className="border-l-2 border-red-400 pl-3">
                <code className="text-sm font-semibold text-red-400">file</code>{' '}
                <span className="text-red-400">*</span>{' '}
                <span className="text-gray-500">file (SVG nebo PNG)</span>
                <p className="text-xs text-gray-500 mt-1">
                  Soubor loga. Podporované formáty: SVG (doporučeno), PNG, PDF
                </p>
              </div>
              <div className="border-l-2 border-red-400 pl-3">
                <code className="text-sm font-semibold text-red-400">
                  club_name
                </code>{' '}
                <span className="text-red-400">*</span>{' '}
                <span className="text-gray-500">string</span>
                <p className="text-xs text-gray-500 mt-1">
                  Název klubu (např. "AC Sparta Praha")
                </p>
              </div>
            </div>

            <h4 className="text-sm font-semibold mb-2">Form Data (Volitelné):</h4>
            <div className="bg-dark-bg rounded-lg p-4 mb-4 space-y-3">
              <div className="border-l-2 border-blue-400 pl-3">
                <code className="text-sm">club_type</code>{' '}
                <span className="text-gray-500">string</span>
                <p className="text-xs text-gray-500 mt-1">
                  Typ klubu: <code>"football"</code> (výchozí) nebo{' '}
                  <code>"futsal"</code>
                </p>
              </div>
              <div className="border-l-2 border-blue-400 pl-3">
                <code className="text-sm">club_website</code>{' '}
                <span className="text-gray-500">string</span>
                <p className="text-xs text-gray-500 mt-1">
                  URL webové stránky klubu (např. "https://sparta.cz")
                </p>
              </div>
              <div className="border-l-2 border-blue-400 pl-3">
                <code className="text-sm">club_city</code>{' '}
                <span className="text-gray-500">string</span>
                <p className="text-xs text-gray-500 mt-1">
                  Město klubu (např. "Praha")
                </p>
              </div>
            </div>

            <div className="bg-dark-bg rounded-lg p-4 mb-4">
              <h4 className="text-sm font-semibold text-gray-400 mb-2">
                Response 200 (Úspěch):
              </h4>
              <pre className="text-sm overflow-x-auto">
                <code>{`{
  "success": true,
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "club_name": "AC Sparta Praha",
  "has_svg": true,
  "has_png": true,
  "size_svg": 12543,
  "size_png": 45210,
  "message": "logo uploaded successfully"
}`}</code>
              </pre>
            </div>

            <div className="bg-red-900/20 rounded-lg p-4 border border-red-600/30">
              <h4 className="text-sm font-semibold text-red-400 mb-2">
                Response 400 (Chyba):
              </h4>
              <pre className="text-sm overflow-x-auto">
                <code>{`{
  "error": "club_name is required"
}`}</code>
              </pre>
              <p className="text-xs text-gray-400 mt-2">
                Možné chyby: <code>"no file provided"</code>,{' '}
                <code>"invalid UUID format"</code>,{' '}
                <code>"only .svg, .png and .pdf files are allowed"</code>
              </p>
            </div>
          </div>
        </section>

        {/* Examples */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">
            Příklady použití – nahrání loga
          </h2>

          {/* cURL Example */}
          <div className="bg-dark-card rounded-xl p-6 border border-dark-border mb-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              cURL (terminal)
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold mb-2 text-accent-green">
                  Minimální nahrání (pouze povinná pole):
                </h4>
                <pre className="bg-dark-bg rounded-lg p-4 overflow-x-auto">
                  <code className="text-sm">
                    {`curl -X POST https://logoapi.sportcreative.eu/logos/550e8400-e29b-41d4-a716-446655440000 \
  -F "file=@sparta_logo.svg" \
  -F "club_name=AC Sparta Praha"`}
                  </code>
                </pre>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-2 text-accent-blue">
                  Kompletní nahrání (všechna data):
                </h4>
                <pre className="bg-dark-bg rounded-lg p-4 overflow-x-auto">
                  <code className="text-sm">
                    {`curl -X POST https://logoapi.sportcreative.eu/logos/550e8400-e29b-41d4-a716-446655440000 \
  -F "file=@sparta_logo.svg" \
  -F "club_name=AC Sparta Praha" \
  -F "club_type=football" \
  -F "club_website=https://sparta.cz" \
  -F "club_city=Praha"`}
                  </code>
                </pre>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-2 text-gray-400">
                  Nahrání PNG místo SVG:
                </h4>
                <pre className="bg-dark-bg rounded-lg p-4 overflow-x-auto">
                  <code className="text-sm">
                    {`curl -X POST https://logoapi.sportcreative.eu/logos/550e8400-e29b-41d4-a716-446655440000 \
  -F "file=@sparta_logo.png" \
  -F "club_name=AC Sparta Praha"`}
                  </code>
                </pre>
              </div>
            </div>
          </div>

          {/* JavaScript Example */}
          <div className="bg-dark-card rounded-xl p-6 border border-dark-border mb-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              JavaScript (Fetch API)
            </h3>
            <pre className="bg-dark-bg rounded-lg p-4 overflow-x-auto">
              <code className="text-sm">
                {`// Funkce pro nahrání loga s kompletními daty
async function uploadClubLogo(clubId, file, clubData) {
  const formData = new FormData();
  
  // Povinná pole
  formData.append('file', file);
  formData.append('club_name', clubData.name);
  
  // Volitelná pole
  if (clubData.type) formData.append('club_type', clubData.type);
  if (clubData.website) formData.append('club_website', clubData.website);
  if (clubData.city) formData.append('club_city', clubData.city);
  
  const response = await fetch(
    'https://logoapi.sportcreative.eu/logos/' + clubId,
    {
      method: 'POST',
      body: formData,
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }
  
  return await response.json();
}

// Použití s file input
const fileInput = document.getElementById('logoFile');
const clubId = '550e8400-e29b-41d4-a716-446655440000';

const result = await uploadClubLogo(clubId, fileInput.files[0], {
  name: 'AC Sparta Praha',
  type: 'football',
  website: 'https://sparta.cz',
  city: 'Praha',
});

console.log('Upload successful:', result);`}
              </code>
            </pre>
          </div>

          {/* Python Example */}
          <div className="bg-dark-card rounded-xl p-6 border border-dark-border mb-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              Python (requests)
            </h3>
            <pre className="bg-dark-bg rounded-lg p-4 overflow-x-auto">
              <code className="text-sm">
                {`import requests


def upload_club_logo(club_id, file_path, club_name, **optional_data):
    """
    Nahraje logo klubu s kompletními daty
    
    Args:
        club_id: UUID klubu
        file_path: Cesta k souboru loga
        club_name: Název klubu (povinný)
        **optional_data: club_type, club_website, club_city
    """
    with open(file_path, 'rb') as f:
        files = {'file': f}
        data = {'club_name': club_name}
        data.update(optional_data)
        
        response = requests.post(
            f"https://logoapi.sportcreative.eu/logos/{club_id}",
            files=files,
            data=data,
        )
        response.raise_for_status()
        return response.json()


# Použití
result = upload_club_logo(
    club_id='550e8400-e29b-41d4-a716-446655440000',
    file_path='sparta_logo.svg',
    club_name='AC Sparta Praha',
    club_type='football',
    club_website='https://sparta.cz',
    club_city='Praha',
)

print(f"Upload úspěšný: {result['message']}")
print(f"Has SVG: {result['has_svg']}, Has PNG: {result['has_png']}")`}
              </code>
            </pre>
          </div>

          {/* PowerShell Example */}
          <div className="bg-dark-card rounded-xl p-6 border border-dark-border mb-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              PowerShell
            </h3>
            <pre className="bg-dark-bg rounded-lg p-4 overflow-x-auto">
              <code className="text-sm">
                {`# Nahrání loga s kompletními daty
$clubId = "550e8400-e29b-41d4-a716-446655440000"
$logoFile = "C:\\logos\\sparta_logo.svg"

$form = @{
    file = Get-Item -Path $logoFile
    club_name = "AC Sparta Praha"
    club_type = "football"
    club_website = "https://sparta.cz"
    club_city = "Praha"
}

$result = Invoke-RestMethod -Uri "https://logoapi.sportcreative.eu/logos/$clubId" -Method Post -Form $form

Write-Host "Upload úspěšný: $($result.message)" -ForegroundColor Green
Write-Host "Club: $($result.club_name)" -ForegroundColor Cyan`}
              </code>
            </pre>
          </div>
        </section>

        {/* Error Codes */}
        <section>
          <h2 className="text-3xl font-bold mb-6">Chybové kódy</h2>
          <div className="bg-dark-card rounded-xl p-6 border border-dark-border">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <span className="px-3 py-1 bg-green-600/20 text-green-400 rounded text-sm font-mono">
                  200
                </span>
                <div>
                  <h4 className="font-semibold">OK</h4>
                  <p className="text-gray-400 text-sm">Požadavek úspěšně dokončen</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="px-3 py-1 bg-red-600/20 text-red-400 rounded text-sm font-mono">
                  400
                </span>
                <div>
                  <h4 className="font-semibold">Bad Request</h4>
                  <p className="text-gray-400 text-sm">
                    Neplatné parametry nebo chybějící povinná pole
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="px-3 py-1 bg-red-600/20 text-red-400 rounded text-sm font-mono">
                  404
                </span>
                <div>
                  <h4 className="font-semibold">Not Found</h4>
                  <p className="text-gray-400 text-sm">Logo nebo klub nenalezen</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="px-3 py-1 bg-red-600/20 text-red-400 rounded text-sm font-mono">
                  500
                </span>
                <div>
                  <h4 className="font-semibold">Internal Server Error</h4>
                  <p className="text-gray-400 text-sm">Interní chyba serveru</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <SiteFooter caption="České Kluby Loga API" />
    </>
  )
}

export default DocsApp
