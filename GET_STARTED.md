# 🚀 GET STARTED - Czech Clubs Logos API

Welcome! This guide will get you up and running in minutes.

## 📦 What You Have

A complete, production-ready fullstack application with:
- ✅ Go backend API with FAČR integration
- ✅ Modern dark mode frontend with animations
- ✅ Docker deployment ready
- ✅ Comprehensive documentation
- ✅ All features from vision.md implemented

## ⚡ Quick Start (Choose One)

### Option 1: Docker (Recommended) 🐳

**Prerequisites:** Docker Desktop

```bash
# Navigate to project
cd ClubLogos

# Start everything
docker-compose up
```

**That's it!** 🎉
- Frontend: http://localhost:3000
- Backend: http://localhost:8080

### Option 2: Local Development 💻

**Prerequisites:** Go 1.21+, Node.js 18+, GCC

```bash
# Terminal 1 - Backend
cd backend
go mod download
go run .

# Terminal 2 - Frontend  
cd frontend
npm install
npm run dev
```

### Option 3: Windows PowerShell Script 🪟

```powershell
.\start-dev.ps1
```

## 🎯 Your First Steps

### 1. Open the App
Visit: http://localhost:3000

### 2. Search for a Club
- Click "🔍 Search Clubs"
- Type: "Sparta" or "Slavia"
- Click any result to copy UUID

### 3. Upload a Logo
- Click "⬆️ Upload Logo"  
- Paste the UUID
- Drag & drop or select an SVG/PNG file
- Click "Upload Logo"

### 4. Access the Logo
Visit: `http://localhost:8080/logos/{UUID}`

## 📚 Essential Documentation

| File | When to Read |
|------|--------------|
| **[QUICKSTART.md](QUICKSTART.md)** | Right now - 5 min setup |
| **[README.md](README.md)** | Main documentation |
| **[API_EXAMPLES.md](API_EXAMPLES.md)** | When integrating API |
| **[DEPLOYMENT.md](DEPLOYMENT.md)** | Before production deploy |
| **[vision.md](vision.md)** | To understand the project |

## 🛠️ Project Structure

```
ClubLogos/
├── backend/           # Go API (port 8080)
├── frontend/          # Web UI (port 3000)
├── docker-compose.yml # Run everything
└── docs/*.md         # All documentation
```

## 🔧 Common Tasks

### View Logs
```bash
docker-compose logs -f
```

### Stop Services
```bash
docker-compose down
```

### Rebuild
```bash
docker-compose up --build
```

### Clean Everything
```bash
docker-compose down -v
rm -rf data/
```

## 📡 API Quick Reference

```bash
# Search clubs
curl "http://localhost:8080/clubs/search?q=sparta"

# Upload logo
curl -X POST http://localhost:8080/logos/{UUID} \
  -F "file=@logo.svg"

# Get logo
curl http://localhost:8080/logos/{UUID} -o logo.svg

# Get metadata
curl http://localhost:8080/logos/{UUID}/json
```

## 🎨 Customize

### Change Colors
Edit: `frontend/tailwind.config.js`

### Modify API URL
Edit: `frontend/src/main.js` (line 8)

### Backend Port
Edit: `docker-compose.yml` (PORT env var)

## ⚠️ Troubleshooting

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

### Docker Issues
```bash
docker-compose down -v
docker-compose up --build
```

### Backend Won't Start
- Install GCC (needed for SQLite)
- Check port 8080 availability

### Frontend Build Fails
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## 🎓 Learning Path

1. **Day 1:** Run the app, explore UI
2. **Day 2:** Read API_EXAMPLES.md, try API calls
3. **Day 3:** Review backend code in `backend/`
4. **Day 4:** Customize frontend styling
5. **Day 5:** Deploy to production (DEPLOYMENT.md)

## 🔗 Useful Commands

```bash
# Backend
cd backend
go run .              # Run
go build .            # Build binary
go test ./...         # Test

# Frontend  
cd frontend
npm run dev           # Dev server
npm run build         # Production build
npm run preview       # Preview build

# Docker
docker-compose up     # Start
docker-compose down   # Stop
docker-compose logs   # View logs
docker-compose ps     # List services
```

## 🎯 What to Do Next

**Using the App:**
- Upload logos for your favorite Czech clubs
- Integrate the API into your projects
- Share with other developers

**Customizing:**
- Change the color scheme
- Add new features
- Improve animations

**Contributing:**
- Report bugs
- Suggest features
- Submit pull requests

**Deploying:**
- Follow DEPLOYMENT.md
- Choose your hosting provider
- Set up SSL and backups

## 💡 Pro Tips

1. **Use Demo Data:** The backend includes 5 demo clubs for testing
2. **Check Health:** `curl http://localhost:8080/health`
3. **Copy UUIDs:** Click any search result to auto-fill upload form
4. **Keyboard Shortcuts:** Browser DevTools (F12) for debugging
5. **Hot Reload:** Frontend auto-refreshes on file changes

## 🆘 Need Help?

1. **Check Logs:** `docker-compose logs -f`
2. **Test API:** Visit http://localhost:8080/health
3. **Read Docs:** All `.md` files in project root
4. **Search Issues:** Check GitHub issues
5. **Ask Questions:** Open a new issue

## 📊 System Requirements

### Minimum
- **Docker:** Any recent version
- **RAM:** 2GB
- **Disk:** 500MB
- **OS:** Windows/Mac/Linux

### For Local Development
- **Go:** 1.21+
- **Node.js:** 18+
- **GCC:** For SQLite compilation
- **RAM:** 4GB
- **Disk:** 1GB

## 🎉 Success Indicators

You'll know it's working when:
- ✅ Frontend loads at http://localhost:3000
- ✅ Backend health check returns OK
- ✅ Search returns demo clubs
- ✅ You can upload a test logo
- ✅ Logo is accessible via API

## 🚀 You're Ready!

The project is fully set up and running. Here's what you have:

✅ Modern web interface  
✅ RESTful API backend  
✅ Docker deployment  
✅ Complete documentation  
✅ Production-ready code  

**Next Step:** Open http://localhost:3000 and start exploring!

---

<div align="center">

**Questions?** Check [README.md](README.md) or [QUICKSTART.md](QUICKSTART.md)

**Want to contribute?** Read [CONTRIBUTING.md](CONTRIBUTING.md)

**Ready to deploy?** Follow [DEPLOYMENT.md](DEPLOYMENT.md)

Made with ❤️ for Czech Football 🇨🇿

</div>
