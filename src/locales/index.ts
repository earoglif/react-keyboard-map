import type { IKeyLegend, KeyboardLocale, LegendMap } from '../types/keyboard.types.ts'
import { enLegends } from './en.ts'
import type { ResolvedPlatform } from './modifiers.ts'
import { platformModifiers } from './modifiers.ts'
import { ruLegends } from './ru.ts'

const builtinLocales: Record<'en' | 'ru', LegendMap> = {
  en: enLegends,
  ru: ruLegends,
}

export function resolveLocaleTable(locale: KeyboardLocale): LegendMap {
  if (locale === 'en' || locale === 'ru') return builtinLocales[locale]
  return locale
}

export function fallbackLabel(code: string): string {
  if (code.startsWith('Key') && code.length === 4) return code.slice(3)
  if (code.startsWith('Digit')) return code.slice(5)
  return code
}

export function createLegendResolver(
  locale: KeyboardLocale,
  platform: ResolvedPlatform,
  overrides?: Readonly<Record<string, Partial<IKeyLegend>>>,
) {
  const table = resolveLocaleTable(locale)
  const modifiers = platformModifiers[platform]
  const cache = new Map<string, IKeyLegend>()

  return (code: string): IKeyLegend => {
    const cached = cache.get(code)
    if (cached) return cached

    const base = table[code] ?? { primary: fallbackLabel(code) }
    const modifier = modifiers[code]
    const resolved = modifier ? { ...base, primary: modifier.primary } : base
    const override = overrides?.[code]
    const legend: IKeyLegend = override
      ? {
          primary: override.primary ?? resolved.primary,
          shift: override.shift ?? resolved.shift,
        }
      : resolved
    cache.set(code, legend)
    return legend
  }
}

export type LegendResolver = ReturnType<typeof createLegendResolver>
