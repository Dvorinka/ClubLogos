# 🇨🇿 Czech Clubs Logos API - Backend

A Go backend API for serving high-quality, transparent background logos of Czech football & futsal clubs. Logos are mapped by FAČR UUIDs to ensure consistency across projects.

## 🔧 Tech Stack

- **Go 1.21+** - Fast and efficient backend
- **Gin** - Web framework
- **SQLite** - Lightweight database
- **FAČR API** - External club data source

## ✨ Features

- ⚽ Fetch Czech clubs metadata from FAČR Scraper API
- 🖼️ Upload & store full-quality transparent logos (SVG/PNG)
- 🔄 Reuse FAČR UUID as a unique identifier
- 🌐 Serve logos through a simple CDN-style API
- 📝 Optional metadata (club name, city, colors, competition)
- 📦 Self-hosted with local or cloud storage

## 🚀 Quick Start

### Prerequisites

- Go 1.21 or higher
- GCC (for SQLite compilation)

### Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
go mod download
```

3. Run the server:
```bash
go run .
```

The API will start on `http://localhost:8080`

## 🐳 Docker

### Build and run with Docker:

```bash
docker build -t czech-clubs-backend .
docker run -p 8080:8080 -v $(pwd)/logos:/root/logos czech-clubs-backend
```

### Or use Docker Compose (recommended):

From the root directory:
```bash
docker-compose up
```

## 📂 Project Structure

```
backend/
├── main.go              # Application entrypoint
├── handlers.go          # API route handlers
├── facr_client.go       # FAČR API client
├── go.mod               # Go dependencies
├── go.sum               # Dependency checksums
├── Dockerfile           # Docker configuration
└── README.md            # This file
```

## 🚀 API Endpoints

### Health Check
```
GET /health
```
Returns server health status.

### Search Clubs
```
GET /clubs/search?q=sparta
```
Search for clubs by name. Proxies to FAČR API with fallback to demo data.

**Response:**
```json
[
  {
    "id": "22222222-3333-4444-5555-666666666666",
    "name": "AC Sparta Praha",
    "city": "Praha",
    "type": "football"
  }
]
```

### Get Club Info
```
GET /clubs/:id
```
Get detailed club information by UUID.

### Upload Logo
```
POST /logos/:id
```
Upload a logo for a specific club UUID.

**Parameters:**
- `file` (multipart/form-data) - SVG or PNG file

**Example with curl:**
```bash
curl -X POST http://localhost:8080/logos/22222222-3333-4444-5555-666666666666 \
  -F "file=@sparta.svg"
```

**Response:**
```json
{
  "success": true,
  "id": "22222222-3333-4444-5555-666666666666",
  "filename": "22222222-3333-4444-5555-666666666666.svg",
  "size": 12345,
  "message": "logo uploaded successfully"
}
```

### Get Logo
```
GET /logos/:id
```
Retrieve a logo by UUID. Returns the image file.

**Response Headers:**
- `Content-Type`: `image/svg+xml` or `image/png`
- `Cache-Control`: `public, max-age=31536000`

### Get Logo with Metadata
```
GET /logos/:id/json
```
Get logo metadata in JSON format.

**Response:**
```json
{
  "id": "22222222-3333-4444-5555-666666666666",
  "club_name": "AC Sparta Praha",
  "club_city": "Praha",
  "club_type": "football",
  "logo_url": "http://localhost:8080/logos/22222222-3333-4444-5555-666666666666",
  "file_size": 12345,
  "created_at": "2024-01-01T12:00:00Z",
  "updated_at": "2024-01-01T12:00:00Z"
}
```

## 📊 Database Schema

### logos table

| Column         | Type     | Description                    |
|---------------|----------|--------------------------------|
| id            | TEXT     | UUID (Primary Key)             |
| club_name     | TEXT     | Club name                      |
| club_city     | TEXT     | City                           |
| club_type     | TEXT     | Type (football/futsal)         |
| file_extension| TEXT     | .svg or .png                   |
| file_size     | INTEGER  | File size in bytes             |
| created_at    | DATETIME | Creation timestamp             |
| updated_at    | DATETIME | Last update timestamp          |

## 🔌 External APIs

### FAČR Scraper API
- **Base URL:** `https://facr.tdvorak.dev`
- **Endpoints Used:**
  - `/club/search?q={query}` - Search clubs
  - `/club/{id}` - Get club details

## 🔒 Security Features

- UUID format validation
- File type validation (SVG/PNG only)
- CORS enabled for frontend integration
- Input sanitization

## 🌟 Environment Variables

| Variable | Default | Description           |
|----------|---------|----------------------|
| PORT     | 8080    | Server port          |

## 📝 Example Workflow

1. **Search for a club:**
```bash
curl "http://localhost:8080/clubs/search?q=Slavia"
```

2. **Upload logo for club:**
```bash
curl -X POST http://localhost:8080/logos/11111111-2222-3333-4444-555555555555 \
  -F "file=@slavia.svg"
```

3. **Get logo:**
```bash
curl http://localhost:8080/logos/11111111-2222-3333-4444-555555555555 \
  -o slavia.svg
```

4. **Get logo with metadata:**
```bash
curl http://localhost:8080/logos/11111111-2222-3333-4444-555555555555/json
```

## 🔮 Future Enhancements

- ✍️ Admin authentication
- 🎨 Auto background remover integration
- 🔎 Advanced logo search capabilities
- 📦 Cloud storage support (S3, R2, Supabase)
- 🗄️ PostgreSQL support

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is part of the Czech Clubs Logos API system.

---

Built with ❤️ for Czech Football
