const STORAGE_KEY = 'clublogos-theme'

function getPreferredTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') return stored
  } catch (_) {}

  return 'light'
}

function applyTheme(theme) {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

function initThemeToggle() {
  const toggles = document.querySelectorAll('[data-theme-toggle]')
  if (!toggles.length) return
  const current = document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  updateToggleIcons(current)

  toggles.forEach((btn) => {
    btn.addEventListener('click', () => {
      const isDark = document.documentElement.classList.contains('dark')
      const next = isDark ? 'light' : 'dark'
      applyTheme(next)
      updateToggleIcons(next)
      try {
        localStorage.setItem(STORAGE_KEY, next)
      } catch (_) {}
    })
  })
}

function updateToggleIcons(theme) {
  const isDark = theme === 'dark'
  document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
    const iconSpan = btn.querySelector('[data-theme-icon]')
    if (iconSpan) {
      iconSpan.textContent = isDark ? '☾' : '☀'
    }
  })
}

const initial = getPreferredTheme()
applyTheme(initial)

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initThemeToggle)
} else {
  initThemeToggle()
}

