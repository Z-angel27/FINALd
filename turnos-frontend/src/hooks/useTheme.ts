import { useEffect, useState } from 'react'

export function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')

  useEffect(() => {
    const themeFile = theme === 'dark' ? './styles/themes/dark.css' : './styles/themes/light.css'
    const link = document.getElementById('theme-link') as HTMLLinkElement
    if (link) link.href = themeFile
    localStorage.setItem('theme', theme)
  }, [theme])

  return { theme, setTheme }
}
