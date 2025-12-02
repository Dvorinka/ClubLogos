import './style.css'
import './theme.js'
import gsap from 'gsap'

// Configuration
const API_BASE_URL = '/api'  // Always use /api - Vite proxy will handle routing in dev mode
const FACR_API_URL = 'https://facr.tdvorak.dev'

// ==================== Club Search ====================

const clubSearch = document.getElementById('clubSearch')
const searchResults = document.getElementById('searchResults')
const uploadSection = document.getElementById('uploadSection')

let searchTimeout

clubSearch.addEventListener('input', (e) => {
  clearTimeout(searchTimeout)
  const query = e.target.value.trim()
  
  if (query.length < 2) {
    searchResults.innerHTML = ''
    return
  }
  
  searchTimeout = setTimeout(() => {
    searchClubs(query)
  }, 300)
})

async function searchClubs(query) {
  searchResults.innerHTML = '<div class="text-center py-4"><div class="spinner mx-auto"></div></div>'
  
  try {
    const response = await fetch(`${API_BASE_URL}/clubs/search?q=${encodeURIComponent(query)}`)
    
    if (!response.ok) {
      throw new Error('API nedostupné')
    }
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('API vrátilo neplatnou odpověď')
    }
    
    const clubs = await response.json()
    await displaySearchResults(clubs)
    
  } catch (error) {
    // Suppress console spam from HTML responses
    if (!error.message.includes('<!DOCTYPE')) {
      console.warn('Search failed:', error.message)
    }
    searchResults.innerHTML = `
      <div class="text-center py-4 text-yellow-400">
        <p class="mb-2">Hledání dočasně nedostupné</p>
        <p class="text-xs text-gray-400">Zkontrolujte, zda běží backend server</p>
      </div>
    `
  }
}

async function displaySearchResults(clubs) {
  if (!clubs || clubs.length === 0) {
    searchResults.innerHTML = `
      <div class="text-center py-8 text-gray-400">
        <p>Žádné kluby nenalezeny</p>
      </div>
    `
    return
  }
  
  // Fetch logos from our API first
  let existingLogos = []
  try {
    const logosResponse = await fetch(`${API_BASE_URL}/logos`)
    if (logosResponse.ok) {
      const contentType = logosResponse.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        const data = await logosResponse.json()
        existingLogos = data || []
      }
    }
  } catch (error) {
    // Silently fail - this is optional data
  }
  
  searchResults.innerHTML = clubs.map(club => {
    // Check if we have this logo in our API
    const existingLogo = existingLogos.find(l => l.id === club.id)
    
    // Priority: 1. Our API logos, 2. FACR API logos
    let logoUrl = ''
    if (existingLogo) {
      // Use our API endpoint (proxied through /api)
      logoUrl = `${API_BASE_URL}/logos/${club.id}`
    } else if (club.logo_url) {
      // Use FACR logo as fallback
      logoUrl = club.logo_url
    }
    
    // Create logo HTML with fallback icon
    let logoHtml = ''
    if (logoUrl) {
      logoHtml = `
        <div class="flex-shrink-0 w-16 h-16 flex items-center justify-center bg-dark-border/30 rounded-lg p-2">
          <img src="${logoUrl}" 
               alt="${club.name}" 
               class="max-w-full max-h-full object-contain" 
               onerror="this.parentElement.innerHTML='<svg class=\\'w-8 h-8 text-gray-500\\' fill=\\'none\\' stroke=\\'currentColor\\' viewBox=\\'0 0 24 24\\'><path stroke-linecap=\\'round\\' stroke-linejoin=\\'round\\' stroke-width=\\'2\\' d=\\'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z\\'></path></svg>'">
        </div>
      `
    } else {
      logoHtml = `
        <div class="flex-shrink-0 w-16 h-16 flex items-center justify-center bg-dark-border/30 rounded-lg">
          <svg class="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
        </div>
      `
    }
    
    return `
    <div class="club-result bg-dark-bg rounded-lg p-4 border border-dark-border hover:border-accent-blue transition-smooth cursor-pointer" data-club='${JSON.stringify(club)}' data-logo-url='${logoUrl}'>
      <div class="flex items-center gap-4">
        ${logoHtml}
        <div class="flex-1 min-w-0">
          <h3 class="font-semibold text-lg truncate">${club.name}</h3>
          <p class="text-sm text-gray-400">${club.type || 'football'}</p>
          <p class="text-xs text-gray-500 font-mono mt-1 truncate">${club.id}</p>
          ${club.website ? `<p class="text-xs text-blue-400 mt-1 truncate">${club.website}</p>` : ''}
          ${existingLogo ? '<p class="text-xs text-green-400 mt-1">Logo již nahráno</p>' : ''}
        </div>
        <div class="flex flex-col gap-2 flex-shrink-0">
          ${existingLogo ? `<a href="/logo.html?id=${club.id}" class="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-smooth text-sm text-center" onclick="event.stopPropagation()">Detail</a>` : ''}
          <button class="select-club px-4 py-2 bg-accent-blue rounded-lg hover:bg-blue-600 transition-smooth text-sm">
            Vybrat
          </button>
        </div>
      </div>
    </div>
  `
  }).join('')
  
  // Animate results
  gsap.from('.club-result', {
    duration: 0.4,
    opacity: 0,
    y: 20,
    stagger: 0.08,
    ease: 'power2.out'
  })
  
  // Add click handlers
  document.querySelectorAll('.club-result').forEach(result => {
    result.addEventListener('click', (e) => {
      if (e.target.classList.contains('select-club') || e.target.closest('.select-club')) {
        const clubData = JSON.parse(result.dataset.club)
        selectClub(clubData)
      }
    })
  })
}

function selectClub(club) {
  // Fill form
  document.getElementById('clubUuid').value = club.id
  document.getElementById('clubName').value = club.name
  document.getElementById('clubType').value = club.type || 'football'
  document.getElementById('clubWebsite').value = club.website || ''
  
  // Show upload section
  uploadSection.classList.remove('hidden')
  
  // Scroll to upload section
  uploadSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
  
  // Animate upload section
  gsap.from(uploadSection, {
    duration: 0.5,
    opacity: 0,
    y: 20,
    ease: 'power2.out'
  })
  
  showNotification(`Vybráno: ${club.name}`, 'success')
}

// ==================== Website Search ====================

const searchWebsiteBtn = document.getElementById('searchWebsite')
const websiteSearchResults = document.getElementById('websiteSearchResults')

searchWebsiteBtn.addEventListener('click', async () => {
  const clubName = document.getElementById('clubName').value.trim()
  
  if (!clubName) {
    showNotification('Nejprve zadejte název klubu', 'error')
    return
  }
  
  searchWebsiteBtn.innerHTML = '<div class="spinner inline-block w-4 h-4"></div>'
  searchWebsiteBtn.disabled = true
  
  try {
    const searchQuery = encodeURIComponent(`${clubName} český fotbal oficiální web`)
    const searchUrl = `https://www.google.com/search?q=${searchQuery}`
    
    websiteSearchResults.innerHTML = `
      <div class="bg-dark-bg rounded-lg p-3 border border-dark-border">
        <p class="text-sm text-gray-400 mb-2">Vyhledat web klubu:</p>
        <a href="${searchUrl}" target="_blank" class="text-accent-blue hover:text-blue-400 text-sm">
          Hledat "${clubName}" na Google
        </a>
        <p class="text-xs text-gray-500 mt-2">Zkopírujte URL oficiálního webu a vložte jej výše</p>
      </div>
    `
    websiteSearchResults.classList.remove('hidden')
    
  } catch (error) {
    console.error('Website search error:', error)
  } finally {
    searchWebsiteBtn.innerHTML = 'Hledat Online'
    searchWebsiteBtn.disabled = false
  }
})

// ==================== File Upload ====================

const uploadArea = document.getElementById('uploadArea')
const fileInput = document.getElementById('fileInput')
const filesPreviewArea = document.getElementById('filesPreviewArea')
const filesPreviewList = document.getElementById('filesPreviewList')
const uploadForm = document.getElementById('uploadForm')

let selectedFiles = []

// Click to browse
uploadArea.addEventListener('click', (e) => {
  if (e.target === uploadArea || e.target.closest('#uploadArea')) {
    fileInput.click()
  }
})

// Drag and drop
uploadArea.addEventListener('dragover', (e) => {
  e.preventDefault()
  uploadArea.classList.add('dragover', 'border-accent-blue')
})

uploadArea.addEventListener('dragleave', () => {
  uploadArea.classList.remove('dragover', 'border-accent-blue')
})

uploadArea.addEventListener('drop', (e) => {
  e.preventDefault()
  uploadArea.classList.remove('dragover', 'border-accent-blue')
  
  const files = Array.from(e.dataTransfer.files)
  if (files.length > 0) {
    handleFilesSelect(files)
  }
})

// File input change
fileInput.addEventListener('change', (e) => {
  if (e.target.files.length > 0) {
    handleFilesSelect(Array.from(e.target.files))
  }
})

function handleFilesSelect(files) {
  // Validate and filter files
  const validFiles = []
  
  for (const file of files) {
    const ext = file.name.split('.').pop().toLowerCase()
    if (ext === 'svg' || ext === 'png' || ext === 'pdf') {
      validFiles.push({
        file: file,
        ext: ext,
        name: '',
        description: ''
      })
    }
  }
  
  if (validFiles.length === 0) {
    showNotification('Vyberte prosím SVG, PNG nebo PDF soubory', 'error')
    return
  }
  
  selectedFiles = validFiles
  displayFilesPreview()
}

function displayFilesPreview() {
  if (selectedFiles.length === 0) {
    filesPreviewArea.classList.add('hidden')
    return
  }
  
  filesPreviewArea.classList.remove('hidden')
  
  filesPreviewList.innerHTML = selectedFiles.map((fileObj, index) => {
    const sizeKB = (fileObj.file.size / 1024).toFixed(2)
    const isPrimary = index === 0
    
    return `
      <div class="bg-dark-bg rounded-lg p-4 border border-dark-border" data-file-index="${index}">
        <div class="flex items-start gap-4">
          <div class="flex-shrink-0 w-16 h-16 bg-dark-border/30 rounded flex items-center justify-center">
            <span class="text-2xl">${fileObj.ext === 'svg' ? 'SVG' : fileObj.ext === 'pdf' ? 'PDF' : 'PNG'}</span>
          </div>
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <h4 class="font-semibold">${fileObj.file.name}</h4>
              ${isPrimary ? '<span class="px-2 py-0.5 bg-accent-blue rounded text-xs">Hlavní</span>' : ''}
            </div>
            <p class="text-xs text-gray-400 mb-3">${fileObj.ext.toUpperCase()} • ${sizeKB} KB</p>
            
            <div class="space-y-2">
              <input 
                type="text" 
                placeholder="Název varianty (volitelné)" 
                value="${fileObj.name}"
                onchange="updateFileMetadata(${index}, 'name', this.value)"
                class="w-full bg-dark-card border border-dark-border rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-blue transition-smooth"
              >
              <input 
                type="text" 
                placeholder="Popis (volitelné)" 
                value="${fileObj.description}"
                onchange="updateFileMetadata(${index}, 'description', this.value)"
                class="w-full bg-dark-card border border-dark-border rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-blue transition-smooth"
              >
            </div>
          </div>
          <button type="button" onclick="removeFile(${index})" class="flex-shrink-0 p-2 text-red-400 hover:text-red-300 transition-smooth">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
    `
  }).join('')
  
  gsap.from('.bg-dark-bg[data-file-index]', {
    duration: 0.4,
    opacity: 0,
    y: 10,
    stagger: 0.05,
    ease: 'power2.out'
  })
}

window.updateFileMetadata = function(index, field, value) {
  if (selectedFiles[index]) {
    selectedFiles[index][field] = value
  }
}

window.removeFile = function(index) {
  selectedFiles.splice(index, 1)
  displayFilesPreview()
  
  if (selectedFiles.length === 0) {
    fileInput.value = ''
  }
}

// Form submission
uploadForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  
  const uuid = document.getElementById('clubUuid').value.trim()
  const clubName = document.getElementById('clubName').value.trim()
  const clubType = document.getElementById('clubType').value
  const clubWebsite = document.getElementById('clubWebsite').value.trim()
  
  // Validation
  if (!uuid) {
    showNotification('Nejprve vyberte klub', 'error')
    return
  }
  
  if (selectedFiles.length === 0) {
    showNotification('Vyberte prosím soubor loga', 'error')
    return
  }
  
  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(uuid)) {
    showNotification('Neplatný formát UUID', 'error')
    return
  }
  
  await uploadLogos(uuid, clubName, clubType, clubWebsite, selectedFiles)
})

async function uploadLogos(uuid, clubName, clubType, clubWebsite, filesData) {
  const submitBtn = document.getElementById('uploadSubmit')
  const originalText = submitBtn.textContent
  submitBtn.disabled = true
  submitBtn.innerHTML = '<div class="spinner mx-auto"></div>'
  
  try {
    let uploadedCount = 0
    
    // Upload each file
    for (let i = 0; i < filesData.length; i++) {
      const fileData = filesData[i]
      const formData = new FormData()
      
      formData.append('file', fileData.file)
      formData.append('club_name', clubName)
      if (clubType) formData.append('club_type', clubType)
      if (clubWebsite) formData.append('club_website', clubWebsite)
      
      // Add variant metadata if not the first file
      if (i > 0) {
        formData.append('variant', 'true')
        if (fileData.name) formData.append('variant_name', fileData.name)
        if (fileData.description) formData.append('variant_description', fileData.description)
      } else {
        // First file is primary
        if (fileData.name) formData.append('variant_name', fileData.name || 'Hlavní')
        if (fileData.description) formData.append('variant_description', fileData.description)
      }
      
      const response = await fetch(`${API_BASE_URL}/logos/${uuid}`, {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }
      
      uploadedCount++
      submitBtn.innerHTML = `<div class="spinner mx-auto"></div> ${uploadedCount}/${filesData.length}`
    }
    
    showNotification(`${uploadedCount} ${uploadedCount === 1 ? 'logo' : 'loga'} úspěšně nahráno pro ${clubName}!`, 'success')
    
    // Reset form after delay
    setTimeout(() => {
      uploadForm.reset()
      filesPreviewArea.classList.add('hidden')
      selectedFiles = []
      uploadSection.classList.add('hidden')
      clubSearch.value = ''
      searchResults.innerHTML = ''
      fileInput.value = ''
    }, 2000)
    
  } catch (error) {
    console.error('Upload error:', error)
    showNotification(`Nahrání selhalo: ${error.message}`, 'error')
  } finally {
    submitBtn.disabled = false
    submitBtn.textContent = originalText
  }
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

console.log('České Kluby Loga API - Administrace')
console.log('Backend API:', API_BASE_URL)
console.log('FAČR API:', FACR_API_URL)

// Prefill editing when navigated with ?id=<uuid>
try {
  const params = new URLSearchParams(window.location.search)
  const editId = params.get('id')
  if (editId) {
    // Fill UUID and show upload section
    const uuidInput = document.getElementById('clubUuid')
    uuidInput.value = editId
    uploadSection.classList.remove('hidden')
    uploadSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    showNotification('Režim úprav pro existující logo', 'info')

    // Load metadata to prefill fields
    ;(async () => {
      try {
        const resp = await fetch(`${API_BASE_URL}/logos/${editId}/json`)
        if (resp.ok) {
          const contentType = resp.headers.get('content-type') || ''
          if (contentType.includes('application/json')) {
            const data = await resp.json()
            if (data.club_name) document.getElementById('clubName').value = data.club_name
            if (data.club_type) document.getElementById('clubType').value = data.club_type
            if (data.club_website) document.getElementById('clubWebsite').value = data.club_website
          }
        }
      } catch (e) {
        // Non-fatal
      }
    })()
  }
} catch (_) {}

// Load from URL functionality
const loadFromUrlBtn = document.getElementById('loadFromUrl')
const logoUrlInput = document.getElementById('logoUrl')

loadFromUrlBtn.addEventListener('click', async () => {
  const url = logoUrlInput.value.trim()
  
  if (!url) {
    showNotification('Zadejte prosím URL obrázku', 'error')
    return
  }
  
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    showNotification('URL musí začínat http:// nebo https://', 'error')
    return
  }
  
  loadFromUrlBtn.disabled = true
  loadFromUrlBtn.innerHTML = '<div class="spinner inline-block w-4 h-4"></div>'
  
  try {
    // Fetch the image from URL
    const response = await fetch(url)
    if (!response.ok) throw new Error('Nelze načíst obrázek')
    
    const blob = await response.blob()
    
    // Determine file extension from content type or URL
    let ext = 'png'
    const contentType = response.headers.get('content-type')
    if (contentType) {
      if (contentType.includes('svg')) ext = 'svg'
      else if (contentType.includes('pdf')) ext = 'pdf'
      else if (contentType.includes('png')) ext = 'png'
    } else {
      const urlExt = url.split('.').pop().toLowerCase().split('?')[0]
      if (['svg', 'png', 'pdf'].includes(urlExt)) ext = urlExt
    }
    
    // Create a file from the blob
    const filename = `logo-${Date.now()}.${ext}`
    const file = new File([blob], filename, { type: blob.type })
    
    handleFilesSelect([file])
    showNotification('Obrázek úspěšně načten z URL', 'success')
    
  } catch (error) {
    console.error('Load from URL error:', error)
    showNotification(`Chyba načítání: ${error.message}`, 'error')
  } finally {
    loadFromUrlBtn.disabled = false
    loadFromUrlBtn.innerHTML = 'Načíst z URL'
  }
})

// Show info notification
setTimeout(() => {
  showNotification('Administrace: Vyhledejte kluby a nahrajte loga', 'info')
}, 1000)
