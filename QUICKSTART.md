# 🚀 Quick Start Guide

Get the Czech Clubs Logos API running in under 5 minutes!

## 🐳 Option 1: Docker (Easiest)

**Prerequisites:** Docker Desktop installed

```bash
# Start everything
docker-compose up

# That's it! 🎉
```

**Access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- Health Check: http://localhost:8080/health

## 💻 Option 2: Local Development

### Backend Setup

**Prerequisites:** Go 1.21+, GCC

```bash
# Navigate to backend
cd backend

# Install dependencies
go mod download

# Run the server
go run .
```

Backend runs at: http://localhost:8080

### Frontend Setup

**Prerequisites:** Node.js 18+

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend runs at: http://localhost:3000

## 🎯 First Steps

### 1. Search for a Club
- Open http://localhost:3000
- Click "🔍 Search Clubs"
- Type "Sparta" or "Slavia"
- Click a result to copy its UUID

### 2. Upload a Logo
- Click "⬆️ Upload Logo"
- Paste the UUID from step 1
- Drag & drop or browse for a logo file (SVG/PNG)
- Click "Upload Logo"

### 3. Access the Logo
Visit: `http://localhost:8080/logos/{UUID}`

Or get JSON metadata: `http://localhost:8080/logos/{UUID}/json`

## 📦 Test with Demo Data

The backend includes demo clubs you can search for:
- SK Slavia Praha
- AC Sparta Praha
- FC Viktoria Plzeň
- FC Baník Ostrava
- SK Sigma Olomouc

## 🛠️ Common Commands

### Docker
```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild images
docker-compose build --no-cache
```

### Backend
```bash
cd backend
go run .              # Run dev server
go build .            # Build binary
go test ./...         # Run tests
```

### Frontend
```bash
cd frontend
npm run dev           # Dev server
npm run build         # Production build
npm run preview       # Preview build
```

## 🔧 Configuration

### Change Backend Port
Edit `docker-compose.yml`:
```yaml
environment:
  - PORT=8080  # Change this
```

### Change Frontend API URL
Edit `frontend/src/main.js`:
```javascript
const API_BASE_URL = 'http://localhost:8080'  // Change this
```

## ⚠️ Troubleshooting

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :8080
netstat -ano | findstr :3000

# Kill process by PID
taskkill /PID <PID> /F
```

### Docker Issues
```bash
# Clean everything and restart
docker-compose down -v
docker-compose up --build
```

### Backend Won't Start
- Ensure GCC is installed (needed for SQLite)
- Check if port 8080 is available
- Check logs: `docker-compose logs backend`

### Frontend Build Fails
```bash
# Clear node_modules and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## 📚 Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check [vision.md](vision.md) for project goals
- Explore the API endpoints in [backend/README.md](backend/README.md)
- Customize the frontend in [frontend/README.md](frontend/README.md)

## 🆘 Need Help?

- Check logs: `docker-compose logs -f`
- Test API: `curl http://localhost:8080/health`
- Verify frontend: Open http://localhost:3000

---

**Happy coding! 🎉**
