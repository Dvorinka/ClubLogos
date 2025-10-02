# 🤝 Contributing to Czech Clubs Logos API

Thank you for considering contributing to this project! This document provides guidelines and instructions for contributing.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)

## 📜 Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Maintain professional communication

## 🚀 Getting Started

### 1. Fork the Repository

Click the "Fork" button on GitHub to create your own copy.

### 2. Clone Your Fork

```bash
git clone https://github.com/YOUR_USERNAME/ClubLogos.git
cd ClubLogos
```

### 3. Add Upstream Remote

```bash
git remote add upstream https://github.com/ORIGINAL_OWNER/ClubLogos.git
```

### 4. Install Dependencies

```bash
# Backend
cd backend
go mod download

# Frontend
cd ../frontend
npm install
```

### 5. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-fix-name
```

## 💻 Development Workflow

### Running Locally

```bash
# Option 1: Docker Compose (recommended)
docker-compose up

# Option 2: Manual
# Terminal 1 - Backend
cd backend
go run .

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Making Changes

1. **Backend changes:** Edit files in `backend/`
2. **Frontend changes:** Edit files in `frontend/`
3. **Documentation:** Edit `.md` files

### Testing Your Changes

```bash
# Backend tests
cd backend
go test ./...

# Frontend build test
cd frontend
npm run build
```

## 📏 Coding Standards

### Go (Backend)

- Follow [Effective Go](https://golang.org/doc/effective_go)
- Use `gofmt` for formatting
- Use meaningful variable names
- Add comments for exported functions
- Handle errors properly

**Example:**
```go
// GetClub retrieves a club by its UUID from the FAČR API
func (c *FACRClient) GetClub(id string) (*Club, error) {
    if id == "" {
        return nil, fmt.Errorf("club ID is required")
    }
    
    // Implementation...
}
```

### JavaScript (Frontend)

- Use ES6+ features
- Use `const` by default, `let` when reassignment needed
- Use async/await for asynchronous operations
- Add JSDoc comments for functions
- Keep functions small and focused

**Example:**
```javascript
/**
 * Search for clubs by name
 * @param {string} query - Search query
 * @returns {Promise<Array>} Array of club objects
 */
async function searchClubs(query) {
    const response = await fetch(`${API_BASE_URL}/clubs/search?q=${query}`)
    return await response.json()
}
```

### CSS

- Use Tailwind utility classes
- Add custom CSS only when necessary
- Follow BEM naming for custom classes
- Keep styles modular and reusable

### General

- Write self-documenting code
- Add comments for complex logic
- Keep functions under 50 lines
- Use descriptive names
- Avoid magic numbers

## 📝 Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat:** New feature
- **fix:** Bug fix
- **docs:** Documentation changes
- **style:** Code style changes (formatting, no logic change)
- **refactor:** Code refactoring
- **test:** Adding or updating tests
- **chore:** Maintenance tasks

### Examples

```bash
# Feature
git commit -m "feat(backend): add PostgreSQL support"

# Bug fix
git commit -m "fix(frontend): resolve upload preview issue"

# Documentation
git commit -m "docs: update API examples"

# With body
git commit -m "feat(api): add rate limiting

- Implement rate limiting middleware
- Set default limit to 100 req/min
- Add configuration options"
```

## 🔄 Pull Request Process

### 1. Update Your Branch

```bash
git fetch upstream
git rebase upstream/main
```

### 2. Push Your Changes

```bash
git push origin feature/your-feature-name
```

### 3. Create Pull Request

Go to GitHub and click "New Pull Request"

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested locally
- [ ] Added tests
- [ ] Existing tests pass

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] Code follows project style
- [ ] Self-reviewed my code
- [ ] Commented complex code
- [ ] Updated documentation
- [ ] No new warnings
```

### 4. Code Review

- Address review comments
- Push updates to your branch
- Be responsive to feedback

### 5. Merge

Once approved, a maintainer will merge your PR.

## 🐛 Reporting Bugs

### Before Reporting

1. Check existing issues
2. Try the latest version
3. Verify it's reproducible

### Bug Report Template

```markdown
**Describe the bug**
Clear description of the bug

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen

**Screenshots**
Add screenshots if applicable

**Environment:**
- OS: [e.g., Windows 11]
- Browser: [e.g., Chrome 120]
- Version: [e.g., 1.0.0]

**Additional context**
Any other relevant information
```

## 💡 Feature Requests

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
Clear description of the problem

**Describe the solution you'd like**
What you want to happen

**Describe alternatives you've considered**
Other solutions you've thought about

**Additional context**
Any other relevant information
```

## 🏷️ Issue Labels

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Documentation improvements
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `question` - Further information requested

## 🎯 Development Tips

### Backend

- Use `go run .` for quick testing
- Check logs for debugging
- Test with demo data first
- Validate UUID formats

### Frontend

- Use browser DevTools
- Check console for errors
- Test responsive design
- Verify GSAP animations

### Docker

- Use `docker-compose logs -f` for live logs
- Rebuild images after dependency changes
- Clear volumes if database issues occur

## 📚 Resources

- [Go Documentation](https://golang.org/doc/)
- [Gin Framework](https://gin-gonic.com/docs/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [GSAP Documentation](https://greensock.com/docs/)

## 🌟 Recognition

Contributors will be:
- Listed in project documentation
- Credited in release notes
- Acknowledged in README

## ❓ Questions?

- Open an issue with the `question` label
- Check existing documentation
- Review closed issues

---

**Thank you for contributing! 🎉**
