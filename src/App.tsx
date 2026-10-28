import { useState } from 'react'
import { KeyboardMap } from './index.ts'
import type {
  KeyboardFormFactor,
  KeyboardPlatform,
  KeyboardStandard,
  KeyboardTheme,
} from './types/keyboard.types.ts'

export default function App() {
  const [formFactor, setFormFactor] = useState<KeyboardFormFactor>('full')
  const [standard, setStandard] = useState<KeyboardStandard>('ansi')
  const [locale, setLocale] = useState<'en' | 'ru'>('en')
  const [platform, setPlatform] = useState<KeyboardPlatform>('auto')
  const [theme, setTheme] = useState<KeyboardTheme>('light')

  return (
    <main className={theme === 'dark' ? 'playground playgroundDark' : 'playground'}>
      <div className="toolbar">
        <label>
          Form
          <select value={formFactor} onChange={(event) => setFormFactor(event.target.value as KeyboardFormFactor)}>
            <option value="60%">60%</option>
            <option value="tkl">TKL</option>
            <option value="full">Full</option>
          </select>
        </label>
        <label>
          Standard
          <select value={standard} onChange={(event) => setStandard(event.target.value as KeyboardStandard)}>
            <option value="ansi">ANSI</option>
            <option value="iso">ISO</option>
          </select>
        </label>
        <label>
          Locale
          <select value={locale} onChange={(event) => setLocale(event.target.value as 'en' | 'ru')}>
            <option value="en">EN</option>
            <option value="ru">RU</option>
          </select>
        </label>
        <label>
          Platform
          <select value={platform} onChange={(event) => setPlatform(event.target.value as KeyboardPlatform)}>
            <option value="auto">Auto</option>
            <option value="win">Windows</option>
            <option value="mac">macOS</option>
          </select>
        </label>
        <label>
          Theme
          <select value={theme} onChange={(event) => setTheme(event.target.value as KeyboardTheme)}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
      </div>
      <KeyboardMap
        formFactor={formFactor}
        standard={standard}
        locale={locale}
        platform={platform}
        theme={theme}
        listenKeyboard
      />
    </main>
  )
}
