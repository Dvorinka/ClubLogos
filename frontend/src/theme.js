// Global light/dark theme handling for Czech Clubs Logos frontend

const THEME_KEY = 'clublogos-theme'

function getPreferredTheme() {
  try {
    const stored = localStorage.getItem(THEME_KEY)
    if (stored === 'light' || stored === 'dark') return stored
  } catch (_) {}

  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    return 'light'
  }
  return 'dark'
}

function applyTheme(theme) {
  const root = document.documentElement
  const mode = theme === 'light' ? 'light' : 'dark'

  root.classList.remove('theme-light', 'theme-dark', 'dark')
  if (mode === 'light') {
    root.classList.add('theme-light')
  } else {
    root.classList.add('theme-dark', 'dark')
  }

  try {
    localStorage.setItem(THEME_KEY, mode)
  } catch (_) {}

  const toggle = document.getElementById('themeToggle')
  if (toggle) {
    if (mode === 'light') {
      toggle.innerHTML = `
        <span class="inline-flex items-center gap-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
          </svg>
          <span class="hidden sm:inline">Tmavý režim</span>
        </span>
      `
    } else {
      toggle.innerHTML = `
        <span class="inline-flex items-center gap-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364-6.364l-1.414 1.414M8.05 17.95l-1.414 1.414m0-12.728L8.05 8.05m9.9 9.9l-1.414-1.414M12 8a4 4 0 100 8 4 4 0 000-8z" />
          </svg>
          <span class="hidden sm:inline">Světlý režim</span>
        </span>
      `
    }
  }
}

function setupThemeToggle() {
  const toggle = document.getElementById('themeToggle')
  if (!toggle) return

  toggle.addEventListener('click', () => {
    const isLight = document.documentElement.classList.contains('theme-light')
    applyTheme(isLight ? 'dark' : 'light')
  })
}

if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const initial = getPreferredTheme()
    applyTheme(initial)
    setupThemeToggle()
  })
}
