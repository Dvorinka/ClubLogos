import './style.css'
import './theme.js'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Configuration
const API_BASE_URL = '/api'  // Always use /api - Vite proxy will handle routing in dev mode
const FACR_API_URL = 'https://facr.tdvorak.dev'

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

// Animate API endpoint cards
gsap.utils.toArray('.api-section .card-hover').forEach((card, index) => {
  gsap.from(card, {
    scrollTrigger: {
      trigger: card,
      start: 'top 85%',
      toggleActions: 'play none none reverse'
    },
    duration: 0.5,
    opacity: 0,
    x: -20,
    delay: index * 0.08,
    ease: 'power2.out'
  })
})

// ==================== UI State Management ====================

const searchSection = document.getElementById('searchSection')
const uploadSection = document.getElementById('uploadSection')
const searchBtn = document.getElementById('searchBtn')
const uploadBtn = document.getElementById('uploadBtn')

// Section toggle handlers
searchBtn.addEventListener('click', () => {
  gsap.to(searchSection, {
    duration: 0.5,
    opacity: 1,
    display: 'block',
    ease: 'power2.inOut'
  })
  gsap.to(uploadSection, {
    duration: 0.5,
    opacity: 0,
    display: 'none',
    ease: 'power2.inOut'
  })
  
  // Smooth scroll to section
  searchSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
})

uploadBtn.addEventListener('click', () => {
  gsap.to(uploadSection, {
    duration: 0.5,
    opacity: 1,
    display: 'block',
    ease: 'power2.inOut'
  })
  gsap.to(searchSection, {
    duration: 0.5,
    opacity: 0,
    display: 'none',
    ease: 'power2.inOut'
  })
  
  // Smooth scroll to section
  uploadSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
})

// ==================== Search Functionality ====================

const searchInput = document.getElementById('searchInput')
const searchResults = document.getElementById('searchResults')
let searchTimeout

searchInput.addEventListener('input', (e) => {
  clearTimeout(searchTimeout)
  const query = e.target.value.trim()
  
  if (query.length < 2) {
    searchResults.innerHTML = ''
    return
  }
  
  // Debounce search
  searchTimeout = setTimeout(() => {
    searchClubs(query)
  }, 300)
})

async function searchClubs(query) {
  searchResults.innerHTML = '<div class="text-center py-4"><div class="spinner mx-auto"></div></div>'
  
  try {
    // Try to fetch from your backend API first
    // If backend is not ready, show demo data
    const response = await fetch(`${API_BASE_URL}/clubs/search?q=${encodeURIComponent(query)}`)
    
    if (!response.ok) {
      throw new Error('Backend not available')
    }
    
    const data = await response.json()
    displaySearchResults(data)
    
  } catch (error) {
    console.log('Backend not available, showing demo data')
    // Demo data when backend is not ready
    displaySearchResults(getDemoClubs(query))
  }
}

function getDemoClubs(query) {
  const demoClubs = [
    {
      id: '11111111-2222-3333-4444-555555555555',
      name: 'SK Slavia Praha',
      city: 'Praha',
      type: 'football'
    },
    {
      id: '22222222-3333-4444-5555-666666666666',
      name: 'AC Sparta Praha',
      city: 'Praha',
      type: 'football'
    },
    {
      id: '33333333-4444-5555-6666-777777777777',
      name: 'FC Viktoria Plzeň',
      city: 'Plzeň',
      type: 'football'
    },
    {
      id: '44444444-5555-6666-7777-888888888888',
      name: 'FC Baník Ostrava',
      city: 'Ostrava',
      type: 'football'
    }
  ]
  
  return demoClubs.filter(club => 
    club.name.toLowerCase().includes(query.toLowerCase())
  )
}

function displaySearchResults(clubs) {
  if (clubs.length === 0) {
    searchResults.innerHTML = `
      <div class="text-center py-8 text-gray-400">
        <p>No clubs found</p>
      </div>
    `
    return
  }
  
  searchResults.innerHTML = clubs.map(club => `
    <div class="club-result bg-dark-bg rounded-lg p-4 border border-dark-border hover:border-accent-blue transition-smooth cursor-pointer">
      <div class="flex items-center justify-between">
        <div class="flex-1">
          <h3 class="font-semibold text-lg">${club.name}</h3>
          <p class="text-sm text-gray-400">${club.city || 'N/A'} • ${club.type || 'football'}</p>
          <p class="text-xs text-gray-500 font-mono mt-1">${club.id}</p>
        </div>
        <button 
          class="copy-uuid px-4 py-2 bg-accent-blue/20 text-accent-blue rounded-lg hover:bg-accent-blue/30 transition-smooth text-sm"
          data-uuid="${club.id}"
        >
          Copy UUID
        </button>
      </div>
    </div>
  `).join('')
  
  // Animate results
  gsap.from('.club-result', {
    duration: 0.4,
    opacity: 0,
    y: 20,
    stagger: 0.08,
    ease: 'power2.out'
  })
  
  // Add copy UUID handlers
  document.querySelectorAll('.copy-uuid').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      const uuid = btn.dataset.uuid
      copyToClipboard(uuid)
      
      // Visual feedback
      const originalText = btn.textContent
      btn.textContent = 'Copied!'
      setTimeout(() => {
        btn.textContent = originalText
      }, 2000)
    })
  })
  
  // Add click handlers to fill upload form
  document.querySelectorAll('.club-result').forEach(result => {
    result.addEventListener('click', () => {
      const uuid = result.querySelector('.copy-uuid').dataset.uuid
      document.getElementById('clubUuid').value = uuid
      uploadBtn.click() // Switch to upload section
      
      // Highlight the UUID input
      const uuidInput = document.getElementById('clubUuid')
      gsap.fromTo(uuidInput, 
        { backgroundColor: 'rgba(59, 130, 246, 0.2)' },
        { backgroundColor: 'transparent', duration: 1, ease: 'power2.out' }
      )
    })
  })
}

// ==================== Upload Functionality ====================

const uploadArea = document.getElementById('uploadArea')
const fileInput = document.getElementById('fileInput')
const previewArea = document.getElementById('previewArea')
const previewImage = document.getElementById('previewImage')
const uploadSubmit = document.getElementById('uploadSubmit')
const clubUuidInput = document.getElementById('clubUuid')

let selectedFile = null

// Click to browse
uploadArea.addEventListener('click', () => {
  fileInput.click()
})

// Drag and drop handlers
uploadArea.addEventListener('dragover', (e) => {
  e.preventDefault()
  uploadArea.classList.add('dragover')
})

uploadArea.addEventListener('dragleave', () => {
  uploadArea.classList.remove('dragover')
})

uploadArea.addEventListener('drop', (e) => {
  e.preventDefault()
  uploadArea.classList.remove('dragover')
  
  const files = e.dataTransfer.files
  if (files.length > 0) {
    handleFileSelect(files[0])
  }
})

// File input change
fileInput.addEventListener('change', (e) => {
  if (e.target.files.length > 0) {
    handleFileSelect(e.target.files[0])
  }
})

function handleFileSelect(file) {
  // Validate file type
  if (!file.type.match('image/(svg\\+xml|png)')) {
    showNotification('Please select an SVG or PNG file', 'error')
    return
  }
  
  selectedFile = file
  
  // Show preview
  const reader = new FileReader()
  reader.onload = (e) => {
    previewImage.src = e.target.result
    
    // Animate preview
    gsap.to(previewArea, {
      duration: 0.5,
      opacity: 1,
      display: 'block',
      ease: 'power2.out'
    })
  }
  reader.readAsDataURL(file)
}

// Upload submit
uploadSubmit.addEventListener('click', async () => {
  const uuid = clubUuidInput.value.trim()
  
  if (!uuid) {
    showNotification('Please enter a club UUID', 'error')
    return
  }
  
  if (!selectedFile) {
    showNotification('Please select a logo file', 'error')
    return
  }
  
  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(uuid)) {
    showNotification('Invalid UUID format', 'error')
    return
  }
  
  await uploadLogo(uuid, selectedFile)
})

async function uploadLogo(uuid, file) {
  const formData = new FormData()
  formData.append('file', file)
  
  // Disable button and show loading
  uploadSubmit.disabled = true
  uploadSubmit.innerHTML = '<div class="spinner mx-auto"></div>'
  
  try {
    const response = await fetch(`${API_BASE_URL}/logos/${uuid}`, {
      method: 'POST',
      body: formData
    })
    
    if (!response.ok) {
      throw new Error('Upload failed')
    }
    
    showNotification('Logo uploaded successfully!', 'success')
    
    // Reset form
    setTimeout(() => {
      clubUuidInput.value = ''
      fileInput.value = ''
      selectedFile = null
      previewArea.style.display = 'none'
    }, 1500)
    
  } catch (error) {
    console.error('Upload error:', error)
    showNotification('Upload failed. Make sure the backend is running.', 'error')
  } finally {
    uploadSubmit.disabled = false
    uploadSubmit.textContent = 'Upload Logo'
  }
}

// ==================== Utility Functions ====================

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showNotification('UUID copied to clipboard!', 'success')
  }).catch(() => {
    showNotification('Failed to copy UUID', 'error')
  })
}

function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div')
  notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
    type === 'success' ? 'bg-accent-green' : 
    type === 'error' ? 'bg-red-500' : 
    'bg-accent-blue'
  } text-white font-medium`
  notification.textContent = message
  
  document.body.appendChild(notification)
  
  // Animate in
  gsap.from(notification, {
    duration: 0.3,
    opacity: 0,
    y: -20,
    ease: 'power2.out'
  })
  
  // Remove after 3 seconds
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

console.log('Czech Clubs Logos API Frontend')
console.log('Backend API:', API_BASE_URL)
console.log('FAČR API:', FACR_API_URL)

// Show a welcome notification
setTimeout(() => {
  showNotification('Welcome to Czech Clubs Logos API!', 'info')
}, 1000)
