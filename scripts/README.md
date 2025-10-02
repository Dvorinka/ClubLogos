# 🛠️ Utility Scripts

Helpful PowerShell scripts for managing the Czech Clubs Logos API.

## Available Scripts

### setup-check.ps1
Verifies your development environment is properly configured.

**Usage:**
```powershell
.\scripts\setup-check.ps1
```

**Checks:**
- Docker installation
- Docker Compose installation
- Go installation (optional)
- Node.js installation (optional)
- Project structure
- Port availability

### health-check.ps1
Tests if the services are running and responding correctly.

**Usage:**
```powershell
.\scripts\health-check.ps1
```

**Checks:**
- Backend health endpoint
- Frontend accessibility
- API functionality

**Note:** Services must be running first (`docker-compose up` or manual start)

### test-api.ps1
Comprehensive API endpoint testing suite.

**Usage:**
```powershell
# Test against localhost
.\scripts\test-api.ps1

# Test against custom URL
.\scripts\test-api.ps1 -BaseUrl "http://your-server:8080"
```

**Tests:**
- Health check endpoint
- Club search functionality
- Club details retrieval
- Logo metadata access
- Error handling (invalid UUIDs)

## Quick Reference

```powershell
# 1. Verify setup
.\scripts\setup-check.ps1

# 2. Start services
docker-compose up -d

# 3. Check health
.\scripts\health-check.ps1

# 4. Run API tests
.\scripts\test-api.ps1
```

## Script Permissions

If you get execution policy errors, run:
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

## CI/CD Integration

These scripts can be integrated into CI/CD pipelines:

```yaml
# GitHub Actions example
- name: Verify Setup
  run: pwsh ./scripts/setup-check.ps1

- name: Health Check
  run: pwsh ./scripts/health-check.ps1

- name: Run API Tests
  run: pwsh ./scripts/test-api.ps1
```

## Adding New Scripts

When adding new scripts:
1. Use `.ps1` extension
2. Add parameter support
3. Include help comments
4. Use colored output
5. Return proper exit codes
6. Update this README

## Tips

- Run scripts from project root directory
- Check script output colors:
  - 🟢 Green = Success
  - 🔴 Red = Error
  - 🟡 Yellow = Warning
  - ⚪ Gray = Info

---

**Need help?** Check the main [README.md](../README.md)
