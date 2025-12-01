import './style.css'
import './theme.js'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Configuration
const API_BASE_URL = '/api'  // Always use /api - Vite proxy will handle routing in dev mode

// ==================== GSAP Animations ====================

// Hero animation on load
gsap.from('.hero-content', {
  duration: 1,
  opacity: 0,
  y: 50,
  ease: 'power3.out',
  delay: 0.2
})

// Animate feature cards on scroll
gsap.utils.toArray('.feature-card').forEach((card, index) => {
  gsap.from(card, {
    scrollTrigger: {
      trigger: card,
      start: 'top 80%',
      toggleActions: 'play none none reverse'
    },
    duration: 0.6,
    opacity: 0,
    y: 30,
    delay: index * 0.1,
    ease: 'power2.out'
  })
})

// ==================== Logo Gallery ====================

const logoGrid = document.getElementById('logoGrid')
const loadingState = document.getElementById('loadingState')
const emptyState = document.getElementById('emptyState')
const gallerySearch = document.getElementById('gallerySearch')
const browseBtn = document.getElementById('browseBtn')

let allLogos = []

async function loadRecentLogos() {
  try {
    const response = await fetch(`${API_BASE_URL}/logos?sort=recent&limit=8`)
    if (!response.ok) throw new Error('Failed to fetch recent logos')
    allLogos = await response.json()
    loadingState.classList.add('hidden')
    if (allLogos.length === 0) {
      emptyState.classList.remove('hidden')
    } else {
      displayLogos(allLogos)
    }
  } catch (error) {
    console.error('Error loading recent logos:', error)
    loadingState.classList.add('hidden')
    emptyState.classList.remove('hidden')
  }
}

// Display logos in grid
function displayLogos(logos) {
  logoGrid.innerHTML = logos.map(logo => {
    // Construct logo URL properly through API proxy
    const logoUrl = `${API_BASE_URL}/logos/${logo.id}`
    
    return `
    <div class="logo-card bg-dark-card rounded-xl p-4 border border-dark-border hover:border-accent-blue transition-smooth cursor-pointer group" data-logo-id="${logo.id}">
      <div class="aspect-square bg-dark-bg rounded-lg flex items-center justify-center mb-3 overflow-hidden">
        <img 
          src="${logoUrl}" 
          alt="${logo.club_name}"
          class="max-w-full max-h-full object-contain p-2 group-hover:scale-110 transition-transform duration-300"
          loading="lazy"
          onerror="this.parentElement.innerHTML='<svg class=\\'w-8 h-8 text-gray-500\\' fill=\\'none\\' stroke=\\'currentColor\\' viewBox=\\'0 0 24 24\\'><path stroke-linecap=\\'round\\' stroke-linejoin=\\'round\\' stroke-width=\\'2\\' d=\\'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z\\'></path></svg>'"
        >
      </div>
      <h3 class="font-semibold text-sm truncate mb-1">${logo.club_name}</h3>
      <p class="text-xs text-gray-400 truncate">${logo.club_type || 'fotbal'}</p>
      <div class="flex gap-1 mt-2">
        ${logo.has_svg ? '<span class="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs">SVG</span>' : ''}
        ${logo.has_png ? '<span class="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs">PNG</span>' : ''}
      </div>
    </div>
  `
  }).join('')
  
  // Animate logo cards
  gsap.from('.logo-card', {
    duration: 0.5,
    opacity: 0,
    scale: 0.9,
    stagger: 0.05,
    ease: 'power2.out'
  })
  
  // Add click handlers to navigate to logo detail page
  document.querySelectorAll('.logo-card').forEach((card, index) => {
    card.addEventListener('click', () => {
      const logo = logos[index]
      window.location.href = `/logo.html?id=${logo.id}`
    })
  })
}

// Filter logos
async function filterLogos(query) {
  const q = query.trim()
  if (!q) {
    displayLogos(allLogos)
    return
  }
  try {
    const resp = await fetch(`${API_BASE_URL}/logos?q=${encodeURIComponent(q)}&limit=50`)
    if (!resp.ok) throw new Error('Search failed')
    const results = await resp.json()
    displayLogos(results)
    if (results.length === 0) {
      logoGrid.innerHTML = `
        <div class="col-span-full text-center py-16">
          <p class="text-xl text-gray-400">No logos found matching "${q}"</p>
        </div>
      `
    }
  } catch (e) {
    console.warn('Search error:', e.message)
  }
}

// Copy logo URL
function copyLogoURL(url, clubName) {
  navigator.clipboard.writeText(url).then(() => {
    showNotification(`Logo URL copied for ${clubName}!`, 'success')
  }).catch(() => {
    showNotification('Failed to copy URL', 'error')
  })
}

// ==================== Event Handlers ====================

// Gallery search
if (gallerySearch) {
  let searchTimeout
  gallerySearch.addEventListener('input', (e) => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
      filterLogos(e.target.value.trim())
    }, 300)
  })
}

// Browse button - scroll to gallery
if (browseBtn) {
  browseBtn.addEventListener('click', () => {
    window.location.href = '/logos.html'
  })
}

// ==================== Utility Functions ====================

function showNotification(message, type = 'info') {
  const notification = document.createElement('div')
  notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
    type === 'success' ? 'bg-accent-green' : 
    type === 'error' ? 'bg-red-500' : 
    'bg-accent-blue'
  } text-white font-medium`
  notification.textContent = message
  
  document.body.appendChild(notification)
  
  gsap.from(notification, {
    duration: 0.3,
    opacity: 0,
    y: -20,
    ease: 'power2.out'
  })
  
  setTimeout(() => {
    gsap.to(notification, {
      duration: 0.3,
      opacity: 0,
      y: -20,
      ease: 'power2.in',
      onComplete: () => notification.remove()
    })
  }, 3000)
}

// ==================== Initialize ====================

console.log('🇨🇿 Czech Clubs Logos API - Home')
console.log('Backend API:', API_BASE_URL)

// Load logos on page load
loadRecentLogos()

// Show welcome notification
setTimeout(() => {
  showNotification('Welcome to Czech Clubs Logos API! 🇨🇿', 'info')
}, 1000)
