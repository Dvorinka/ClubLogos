# 🇨🇿 Czech Clubs Logos API

<div align="center">

![Status](https://img.shields.io/badge/status-production%20ready-brightgreen)
![Go](https://img.shields.io/badge/Go-1.21+-00ADD8?logo=go)
![Node](https://img.shields.io/badge/Node-18+-339933?logo=node.js)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker)
![License](https://img.shields.io/badge/license-MIT-blue)

A fullstack project for serving high-quality, transparent background logos of Czech football & futsal clubs. Logos are mapped by FAČR UUIDs (from [facr.tdvorak.dev](https://facr.tdvorak.dev)) to ensure consistency across projects.

[Quick Start](#-quick-start) • [Documentation](#-documentation) • [API Examples](API_EXAMPLES.md) • [Deployment](DEPLOYMENT.md)

</div>

## ✨ Features

- ⚽ Fetch Czech clubs metadata from FAČR Scraper API
- 🖼️ Upload & store full-quality transparent logos (SVG/PNG)
- 🔄 Reuse FAČR UUID as a unique identifier
- 🌐 Serve logos through a simple CDN-style API
- 📝 Optional metadata (club name, city, colors, competition)
- 📦 Self-hosted with Go backend + CDN storage
- 🌙 Beautiful dark mode frontend
- 🎭 Smooth GSAP animations
- 🐳 Docker support for easy deployment

## 🔧 Tech Stack

### Backend
- **Go 1.21+** with Gin framework
- **SQLite** for metadata storage
- **FAČR API** integration

### Frontend
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Modern styling
- **GSAP** - Professional animations
- **Vanilla JavaScript** - Fast and lightweight

### DevOps
- **Docker** & **Docker Compose**
- **Nginx** for frontend serving

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)

The easiest way to run the entire stack:

```bash
# Clone the repository
git clone <repository-url>
cd ClubLogos

# Start both frontend and backend
docker-compose up
```

Access the application:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080

### Option 2: Local Development

#### Backend

```bash
cd backend
go mod download
go run .
```

Backend will run on `http://localhost:8080`

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on `http://localhost:3000`

## 📂 Project Structure

```
czech-clubs-logos-api/
│
├── backend/                   # Go backend
│   ├── main.go                # API entrypoint
│   ├── handlers.go            # Route handlers
│   ├── facr_client.go         # FAČR API client
│   ├── go.mod                 # Go dependencies
│   ├── Dockerfile             # Backend Docker config
│   └── README.md              # Backend documentation
│
├── frontend/                  # Vite + Tailwind frontend
│   ├── src/
│   │   ├── main.js            # JavaScript logic & GSAP
│   │   └── style.css          # Tailwind styles
│   ├── index.html             # Main HTML
│   ├── vite.config.js         # Vite configuration
│   ├── tailwind.config.js     # Tailwind configuration
│   ├── nginx.conf             # Nginx config for Docker
│   ├── Dockerfile             # Frontend Docker config
│   └── README.md              # Frontend documentation
│
├── data/                      # Persistent data (created by Docker)
│   ├── logos/                 # Uploaded logos
│   └── db/                    # SQLite database
│
├── docker-compose.yml         # Full stack orchestration
├── vision.md                  # Project vision document
└── README.md                  # This file
```

## 🚀 API Endpoints

### Club Search
```bash
GET /clubs/search?q=sparta
```
Search for clubs by name.

### Get Club Info
```bash
GET /clubs/:id
```
Get detailed club information.

### Upload Logo
```bash
POST /logos/:id
FormData: file=@logo.svg
```
Upload a club logo.

### Get Logo
```bash
GET /logos/:id
```
Retrieve a logo file.

### Get Logo Metadata
```bash
GET /logos/:id/json
```
Get logo with metadata in JSON format.

## 📊 Example Workflow

1. **Search for a club:**
   - Open the frontend at http://localhost:3000
   - Click "🔍 Search Clubs"
   - Type "Sparta" or "Slavia"
   - Copy the UUID

2. **Upload a logo:**
   - Click "⬆️ Upload Logo"
   - Paste the UUID
   - Drag & drop or browse for a logo file (SVG/PNG)
   - Click "Upload Logo"

3. **Access the logo:**
   - Navigate to `http://localhost:8080/logos/{UUID}`
   - Or use the API endpoint in your projects

## 🐳 Docker Configuration

### Build Images

```bash
# Build backend
cd backend
docker build -t czech-clubs-backend .

# Build frontend
cd frontend
docker build -t czech-clubs-frontend .
```

### Run with Docker Compose

```bash
docker-compose up -d
```

### Stop Services

```bash
docker-compose down
```

### View Logs

```bash
docker-compose logs -f
```

## 🔧 Configuration

### Backend Configuration

Edit environment variables in `docker-compose.yml`:

```yaml
environment:
  - PORT=8080
```

### Frontend Configuration

Update the API endpoint in `frontend/src/main.js`:

```javascript
const API_BASE_URL = 'http://localhost:8080'
```

## 📦 Data Persistence

When using Docker Compose, data is persisted in the `./data` directory:

- `./data/logos/` - Uploaded logo files
- `./data/db/` - SQLite database

## 🌟 Features in Detail

### Frontend Features
- 🌙 Dark mode optimized UI
- 🎭 GSAP scroll-triggered animations
- 🔍 Real-time search with debouncing
- ⬆️ Drag & drop file upload
- 📋 One-click UUID copying
- 📱 Fully responsive design
- ⚡ Lightning-fast Vite build

### Backend Features
- 🚀 High-performance Go API
- 💾 SQLite for lightweight storage
- 🔌 FAČR API integration
- 🔒 UUID validation
- 📁 File type validation
- 🌐 CORS enabled
- 💨 Efficient caching headers

## 🔮 Future Ideas

- ✍️ Web admin panel with authentication
- 🎨 Auto background remover (e.g., remove.bg API)
- 🔎 Logo search by club name
- 📦 NPM package (@czech-football/logos)
- 🗄️ PostgreSQL support
- ☁️ Cloud storage (S3, R2, Supabase)
- 🔐 API key authentication

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [QUICKSTART.md](QUICKSTART.md) | Get started in 5 minutes |
| [API_EXAMPLES.md](API_EXAMPLES.md) | Code examples in multiple languages |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Production deployment guide |
| [CONTRIBUTING.md](CONTRIBUTING.md) | How to contribute |
| [CHANGELOG.md](CHANGELOG.md) | Version history |
| [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) | Complete project overview |

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Credits

- **FAČR Scraper API** - Club data source: [facr.tdvorak.dev](https://facr.tdvorak.dev)
- Built with ❤️ for Czech Football

## 🌟 Show Your Support

If this project helps you, please consider:
- ⭐ Starring the repository
- 🐛 Reporting bugs
- 💡 Suggesting features
- 🤝 Contributing code

---

<div align="center">

**👉 This way, you'll have a FAČR-aware logo CDN that anyone can integrate into websites, apps, or your SportCreative projects.**

Made with ❤️ • [Report Bug](../../issues) • [Request Feature](../../issues)

</div>
