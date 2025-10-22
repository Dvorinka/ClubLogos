🇨🇿 Czech Clubs Logos API

A fullstack project for serving high-quality, transparent background logos of Czech football & futsal clubs.
Logos are mapped by FAČR UUIDs (from facr.tdvorak.dev
) to ensure consistency across projects.

✨ Features

⚽ Fetch Czech clubs metadata from FAČR Scraper API.

🖼️ Upload & store full-quality transparent logos (SVG/PNG).

🔄 Reuse FAČR UUID as a unique identifier.

🌐 Serve logos through a simple CDN-style API.

📝 Optional metadata (club name, city, colors, competition).

📦 Self-hosted with Go backend + CDN storage.

🔧 Tech Stack

Backend: Golang (Gin or Fiber)

Storage:

Local /logos/{id}.svg

Or cloud (Supabase / Cloudflare R2 / S3)

Database: SQLite/Postgres (to link UUID ↔ metadata ↔ logo file)

External API: facr.tdvorak.dev

📂 Project Structure
czech-clubs-logos-api/
│── backend/
│   ├── main.go              # Go API entrypoint
│   ├── routes.go            # API routes
│   ├── facr_client.go       # Client for facr.tdvorak.dev
│   ├── handlers/
│   │    ├── upload.go       # Handle logo upload
│   │    ├── logos.go        # Serve logos
│   │    └── clubs.go        # Proxy FAČR API
│   └── storage/
│        └── local.go        # Logo saving/loading
│── logos/                   # Stored club logos (UUID.svg/png)
│── frontend/                # (optional, for admin upload UI)
│── db.sqlite                # Database (UUID ↔ metadata)
│── go.mod
│── README.md

🚀 API Endpoints
Search clubs

Proxy FAČR search to help find correct UUID:

GET /clubs/search?q=sparta
→ proxies facr.tdvorak.dev/club/search?q=sparta

Get club info
GET /clubs/:id
→ proxies facr.tdvorak.dev/club/{id}

Upload logo

Upload a full-quality SVG/PNG logo mapped to a FAČR UUID:

POST /logos/:id
FormData: file=@slavia.svg
→ Saves to ./logos/{id}.svg
→ Stores metadata in DB

Get logo

Serve logo by FAČR UUID:

GET /logos/:id
→ returns {id}.svg/png

Get logo with metadata
GET /logos/:id/json
{
  "id": "00000000-0000-0000-0000-000000000000",
  "club": "AC Sparta Praha",
  "type": "football",
  "logo_url": "https://cdn.example.com/logos/00000000-0000-0000-0000-000000000000.svg"
}

📊 Example Workflow

Search for a club:

GET /clubs/search?q=Slavia
→ returns UUID: 11111111-2222-3333-4444-555555555555


Upload logo for club:

POST /logos/11111111-2222-3333-4444-555555555555
file=@slavia.svg


Get logo:

GET /logos/11111111-2222-3333-4444-555555555555
→ returns full quality transparent SVG

🔮 Future Ideas

✍️ Web admin panel for uploading logos.

🎨 Auto background remover (e.g., remove.bg API).

🔎 Logo search by club name (maps internally to UUID).

📦 Publish as NPM package (@czech-football/logos) or Go module.

👉 This way, you’ll have a FAČR-aware logo CDN that anyone can integrate into websites, apps, or your SportCreative projects.