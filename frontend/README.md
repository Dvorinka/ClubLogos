# 🇨🇿 Czech Clubs Logos API - Frontend

A beautiful, dark mode frontend for the Czech Clubs Logos API. Built with modern web technologies for a smooth and user-friendly experience.

## 🎨 Tech Stack

- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **GSAP** - Professional-grade animation library
- **Vanilla JavaScript** - No framework overhead

## ✨ Features

- 🌙 **Dark Mode** - Eye-friendly dark theme
- 🎭 **Smooth Animations** - GSAP-powered transitions
- 🔍 **Club Search** - Search Czech clubs by name
- ⬆️ **Logo Upload** - Drag & drop or browse to upload
- 📱 **Responsive** - Works on all device sizes
- ⚡ **Fast** - Optimized with Vite

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The app will open at `http://localhost:3000`

## 🏗️ Build for Production

```bash
npm run build
```

This will create an optimized build in the `dist` folder.

To preview the production build:
```bash
npm run preview
```

## 🔧 Configuration

### API Endpoint

Update the backend API URL in `src/main.js`:

```javascript
const API_BASE_URL = 'http://localhost:8080' // Update this to your backend URL
```

### Styling

Customize colors and theme in `tailwind.config.js`:

```javascript
colors: {
  'dark-bg': '#0a0e1a',
  'dark-card': '#131823',
  'accent-blue': '#3b82f6',
  'accent-green': '#10b981',
}
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── main.js          # Main JavaScript logic
│   └── style.css        # Global styles + Tailwind
├── index.html           # Main HTML file
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind configuration
├── postcss.config.js    # PostCSS configuration
└── package.json         # Dependencies
```

## 🎯 Usage

### Search for Clubs

1. Click the "🔍 Search Clubs" button
2. Type a club name (e.g., "Sparta", "Slavia")
3. Browse results and copy UUIDs

### Upload a Logo

1. Click the "⬆️ Upload Logo" button
2. Enter or paste a club UUID
3. Drag & drop or click to select a logo file (SVG/PNG)
4. Preview your logo
5. Click "Upload Logo"

## 🌟 Features in Detail

### Animation System

Powered by GSAP with:
- Smooth hero animations on page load
- Scroll-triggered feature cards
- Staggered API endpoint reveals
- Interactive button feedback

### Search System

- Real-time search with debouncing
- Demo data fallback when backend is unavailable
- Click to auto-fill upload form
- Copy UUID to clipboard

### Upload System

- Drag & drop support
- File type validation (SVG/PNG only)
- UUID format validation
- Image preview before upload
- Visual feedback notifications

## 🔌 Backend Integration

This frontend is designed to work with the Go backend API. Ensure the backend is running at the configured URL.

Expected endpoints:
- `GET /clubs/search?q={query}` - Search clubs
- `GET /clubs/:id` - Get club details
- `POST /logos/:id` - Upload logo
- `GET /logos/:id` - Get logo

## 🎨 Customization

### Colors

Edit `tailwind.config.js` to change the color scheme:

```javascript
theme: {
  extend: {
    colors: {
      'dark-bg': '#your-color',
      'dark-card': '#your-color',
      // ... etc
    }
  }
}
```

### Fonts

Change the font in `src/style.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=YourFont:wght@300;400;700&display=swap');
```

### Animations

Adjust GSAP animations in `src/main.js`:

```javascript
gsap.from('.hero-content', {
  duration: 1,
  opacity: 0,
  y: 50,
  // ... customize
})
```

## 📝 License

This project is part of the Czech Clubs Logos API system.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Built with ❤️ for Czech Football
