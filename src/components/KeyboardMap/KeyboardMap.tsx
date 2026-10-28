import { useMemo } from 'react'
import { useKeyboardListener } from '../../hooks/useKeyboardListener.ts'
import { useResolvedPlatform } from '../../hooks/usePlatformDetect.ts'
import { buildKeyboardSections } from '../../layouts/index.ts'
import { createLegendResolver } from '../../locales/index.ts'
import styles from '../../styles/keyboard.module.css'
import type { IKeyboardMapProps, KeyCode } from '../../types/keyboard.types.ts'
import { KeyboardSection } from '../KeyboardSection/KeyboardSection.tsx'

function joinClasses(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

export function KeyboardMap({
  formFactor = 'full',
  standard = 'ansi',
  platform = 'auto',
  locale = 'en',
  secondaryLocale,
  listenKeyboard = false,
  activeKeys,
  annotations,
  zones,
  renderKeyContent,
  theme = 'light',
  className,
  style,
}: IKeyboardMapProps) {
  const resolvedPlatform = useResolvedPlatform(platform)
  const listened = useKeyboardListener(listenKeyboard)
  const sections = useMemo(
    () => buildKeyboardSections(formFactor, standard),
    [formFactor, standard],
  )
  const legendFor = useMemo(
    () => createLegendResolver(locale, resolvedPlatform),
    [locale, resolvedPlatform],
  )
  const secondaryLegendFor = useMemo(
    () => (secondaryLocale ? createLegendResolver(secondaryLocale, resolvedPlatform) : undefined),
    [secondaryLocale, resolvedPlatform],
  )
  const active = useMemo(() => {
    if (!activeKeys?.length) return listened
    const next = new Set(listened)
    for (const code of activeKeys) next.add(code)
    return next
  }, [listened, activeKeys])

  const isPressed = (code: KeyCode) => active.has(code)

  return (
    <div
      className={joinClasses(styles.root, theme === 'dark' && styles.themeDark, className)}
      style={style}
      role="group"
      aria-label="Keyboard map"
      data-form-factor={formFactor}
      data-standard={standard}
      data-platform={resolvedPlatform}
      data-theme={theme}
    >
      {sections.map((section) => (
        <KeyboardSection
          key={section.id}
          section={section}
          isPressed={isPressed}
          legendFor={legendFor}
          secondaryLegendFor={secondaryLegendFor}
          annotations={annotations}
          zones={zones}
          renderKeyContent={renderKeyContent}
        />
      ))}
    </div>
  )
}
