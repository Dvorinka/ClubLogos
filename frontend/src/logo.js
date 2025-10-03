import './style.css'
import gsap from 'gsap'

// Configuration
const API_BASE_URL = 'https://logoapi.sportcreative.eu'

// Get UUID from URL
const urlParams = new URLSearchParams(window.location.search)
const logoId = urlParams.get('id')

// DOM Elements
const loadingState = document.getElementById('loadingState')
const errorState = document.getElementById('errorState')
const logoDetail = document.getElementById('logoDetail')

// Initialize
if (!logoId) {
  showError()
} else {
  loadLogoDetails(logoId)
}

async function loadLogoDetails(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/logos/${id}/json`)
    
    if (!response.ok) {
      throw new Error('Logo not found')
    }
    
    const logo = await response.json()
    displayLogoDetails(logo)
    
  } catch (error) {
    console.error('Error loading logo:', error)
    showError()
  }
}

function displayLogoDetails(logo) {
  // Hide loading, show content
  loadingState.classList.add('hidden')
  logoDetail.classList.remove('hidden')
  
  // Club Info
  const editBtn = document.getElementById('editButton')
  if (editBtn) editBtn.href = `/admin.html?id=${logoId}`
  document.getElementById('clubName').textContent = logo.club_name
  document.getElementById('clubMeta').textContent = `${logo.club_type || 'fotbal'}`
  
  // Logo Previews - construct URL through API proxy
  const previewUrl = `${API_BASE_URL}/logos/${logoId}`
  document.getElementById('logoPreviewLight').src = previewUrl
  document.getElementById('logoPreviewDark').src = previewUrl
  
  // Formats
  const formatsGrid = document.getElementById('formatsGrid')
  const formats = []
  
  if (logo.has_png) {
    formats.push({
      name: 'PNG',
      url: `${API_BASE_URL}/logos/${logoId}?format=png`,
      size: formatFileSize(logo.file_size_png),
      icon: '🖼️',
      color: 'bg-blue-600'
    })
  }
  
  if (logo.has_svg) {
    formats.push({
      name: 'SVG',
      url: `${API_BASE_URL}/logos/${logoId}?format=svg`,
      size: formatFileSize(logo.file_size_svg),
      icon: '📐',
      color: 'bg-green-600'
    })
  }
  
  formatsGrid.innerHTML = formats.map(format => `
    <a href="${format.url}" download class="block bg-dark-bg rounded-lg p-4 border border-dark-border hover:border-accent-blue transition-smooth">
      <div class="flex items-center justify-between mb-3">
        <span class="text-2xl">${format.icon}</span>
        <span class="px-2 py-1 ${format.color} rounded text-xs font-semibold">${format.name}</span>
      </div>
      <h3 class="font-semibold mb-1">${format.name} Format</h3>
      <p class="text-sm text-gray-400">${format.size}</p>
      <div class="mt-3 flex items-center text-accent-blue text-sm">
        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
        </svg>
        Stáhnout
      </div>
    </a>
  `).join('')
  
  // Variants (if supported)
  if (logo.variants && logo.variants.length > 0) {
    document.getElementById('variantsSection').classList.remove('hidden')
    const variantsGrid = document.getElementById('variantsGrid')
    
    variantsGrid.innerHTML = logo.variants.map(variant => `
      <div class="bg-dark-bg rounded-lg p-4 border border-dark-border">
        <div class="flex items-start gap-4">
          <div class="flex-shrink-0 w-20 h-20 bg-white rounded flex items-center justify-center p-2">
            <img src="${variant.url}" alt="${variant.name}" class="max-w-full max-h-full object-contain">
          </div>
          <div class="flex-1">
            <h3 class="font-semibold mb-1">${variant.name || 'Varianta'}</h3>
            ${variant.description ? `<p class="text-sm text-gray-400 mb-2">${variant.description}</p>` : ''}
            <div class="flex items-center gap-3 text-xs text-gray-500">
              <span>${variant.format.toUpperCase()}</span>
              <span>•</span>
              <span>${formatFileSize(variant.size)}</span>
            </div>
          </div>
          <a href="${variant.url}" download class="px-3 py-2 bg-accent-blue rounded-lg hover:bg-blue-600 transition-smooth text-sm">
            ⬇️
          </a>
        </div>
      </div>
    `).join('')
  } else {
    document.getElementById('variantsSection').classList.add('hidden')
  }
  
  // Metadata
  document.getElementById('logoUuid').textContent = logo.id
  document.getElementById('clubType').textContent = logo.club_type || 'fotbal'
  
  const website = logo.club_website || 'N/A'
  const websiteElement = document.getElementById('clubWebsite')
  if (logo.club_website) {
    websiteElement.innerHTML = `<a href="${logo.club_website}" target="_blank" class="text-accent-blue hover:underline">${logo.club_website}</a>`
  } else {
    websiteElement.textContent = website
  }
  
  document.getElementById('uploadDate').textContent = formatDate(logo.created_at)
  
  // API URLs
  const baseUrl = API_BASE_URL
  document.getElementById('apiUrlDefault').textContent = `${baseUrl}/logos/${logo.id}`
  document.getElementById('apiUrlJson').textContent = `${baseUrl}/logos/${logo.id}/json`
  
  // Animate
  gsap.from('#logoDetail > *', {
    duration: 0.6,
    opacity: 0,
    y: 20,
    stagger: 0.1,
    ease: 'power2.out'
  })
}

function showError() {
  loadingState.classList.add('hidden')
  errorState.classList.remove('hidden')
}

function formatFileSize(bytes) {
  if (!bytes) return 'N/A'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

function formatDate(dateString) {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('cs-CZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

window.copyToClipboard = function(elementId) {
  const element = document.getElementById(elementId)
  const text = element.textContent
  
  navigator.clipboard.writeText(text).then(() => {
    showNotification('URL zkopírováno do schránky', 'success')
  }).catch(err => {
    console.error('Failed to copy:', err)
    showNotification('Chyba při kopírování', 'error')
  })
}

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

console.log('🇨🇿 České Kluby Loga API - Detail Loga')
console.log('Logo ID:', logoId)
