import './style.css'
import './theme.js'

const API_BASE_URL = '/api'

const grid = document.getElementById('allLogoGrid')
const loading = document.getElementById('allLoading')
const empty = document.getElementById('allEmpty')
const loadMoreBtn = document.getElementById('loadMoreBtn')
const searchInput = document.getElementById('allLogoSearch')
const sportFilterButtons = document.querySelectorAll('[data-sport-filter]')

let page = 1
const limit = 20
let query = ''
let isLoading = false
let hasMore = true
let sport = 'all'

async function loadPage(reset = false) {
  if (isLoading) return
  if (reset) {
    page = 1
    hasMore = true
    grid.innerHTML = ''
    empty.classList.add('hidden')
    loading.classList.remove('hidden')
  } else {
    loadMoreBtn.disabled = true
    loadMoreBtn.textContent = 'Načítání...'
  }

  isLoading = true
  try {
    const url = new URL(`${API_BASE_URL}/logos`, window.location.origin)
    url.searchParams.set('sort', 'recent')
    url.searchParams.set('limit', String(limit))
    url.searchParams.set('page', String(page))
    if (query) url.searchParams.set('q', query)
    if (sport && sport !== 'all') url.searchParams.set('sport', sport)

    const resp = await fetch(url.toString().replace(window.location.origin, ''))
    if (!resp.ok) throw new Error('Failed to fetch logos')
    const data = await resp.json()

    if (reset) loading.classList.add('hidden')

    if (Array.isArray(data) && data.length > 0) {
      appendCards(data)
      page += 1
      if (data.length < limit) {
        hasMore = false
        loadMoreBtn.classList.add('hidden')
      } else {
        loadMoreBtn.classList.remove('hidden')
      }
    } else {
      if (reset) empty.classList.remove('hidden')
      hasMore = false
      loadMoreBtn.classList.add('hidden')
    }
  } catch (_) {
    if (reset) {
      loading.classList.add('hidden')
      empty.classList.remove('hidden')
    }
  } finally {
    isLoading = false
    loadMoreBtn.disabled = false
    loadMoreBtn.textContent = 'Načíst další'
  }
}

function appendCards(items) {
  const html = items.map(logo => {
    const logoUrl = `${API_BASE_URL}/logos/${logo.id}`
    return `
      <div class="logo-card bg-dark-card rounded-xl p-4 border border-dark-border hover:border-accent-blue transition-smooth group" data-id="${logo.id}">
        <div class="aspect-square bg-dark-bg rounded-lg flex items-center justify-center mb-3 overflow-hidden cursor-pointer">
          <img src="${logoUrl}" alt="${logo.club_name}" class="max-w-full max-h-full object-contain p-2 group-hover:scale-110 transition-transform duration-300" loading="lazy" onerror="this.parentElement.innerHTML='<svg class=\'w-8 h-8 text-gray-500\' fill=\'none\' stroke=\'currentColor\' viewBox=\'0 0 24 24\'><path stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z\'></path></svg>'">
        </div>
        <div class="flex items-center gap-3">
          <div class="flex-1 min-w-0 cursor-pointer">
            <h3 class="font-semibold text-sm truncate mb-0.5">${logo.club_name}</h3>
            <p class="text-xs text-gray-400 truncate">${logo.club_type || 'fotbal'}</p>
          </div>
          <button class="delete-logo px-3 py-1.5 text-xs bg-red-600 rounded hover:bg-red-500 transition-smooth">Smazat</button>
        </div>
      </div>
    `
  }).join('')
  grid.insertAdjacentHTML('beforeend', html)
}

function updateSportFilterButtons() {
  if (!sportFilterButtons || !sportFilterButtons.length) return
  sportFilterButtons.forEach(btn => {
    const value = btn.dataset.sportFilter || 'all'
    const isActive = value === sport
    btn.classList.toggle('bg-accent-blue', isActive)
    btn.classList.toggle('text-white', isActive)
    btn.classList.toggle('bg-dark-card', !isActive)
    btn.classList.toggle('text-gray-300', !isActive)
  })
}

grid.addEventListener('click', async (e) => {
  const delBtn = e.target.closest('.delete-logo')
  if (delBtn) {
    const card = delBtn.closest('.logo-card')
    const id = card.dataset.id
    const ok = confirm('Smazat toto logo?')
    if (!ok) return
    delBtn.disabled = true
    delBtn.textContent = 'Mazání...'
    try {
      const resp = await fetch(`${API_BASE_URL}/logos/${id}`, { method: 'DELETE' })
      if (!resp.ok) throw new Error('Delete failed')
      card.remove()
      if (!grid.children.length) empty.classList.remove('hidden')
    } catch (_) {
      delBtn.textContent = 'Smazat'
      delBtn.disabled = false
      alert('Mazání selhalo')
    }
    return
  }
  const card = e.target.closest('.logo-card')
  if (card && !e.target.closest('.delete-logo')) {
    const id = card.dataset.id
    window.location.href = `/logo.html?id=${id}`
  }
})

let searchTimer
searchInput.addEventListener('input', () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    query = searchInput.value.trim()
    loadPage(true)
  }, 300)
})

if (sportFilterButtons && sportFilterButtons.length) {
  updateSportFilterButtons()
  sportFilterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const value = btn.dataset.sportFilter || 'all'
      if (value === sport) return
      sport = value
      updateSportFilterButtons()
      loadPage(true)
    })
  })
}

loadMoreBtn.addEventListener('click', () => {
  if (hasMore) loadPage(false)
})

loadPage(true)
