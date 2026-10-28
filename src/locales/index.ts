import type { IKeyLegend, IKeyLegendOverride, KeyboardLocale, LegendMap } from '../types/keyboard.types.ts'
import { enLegends } from './en.ts'
import { builtinLegendIcon } from './icons.ts'
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

function resolveLegendIcon(
  code: string,
  platform: ResolvedPlatform,
  override: IKeyLegendOverride | undefined,
): string | undefined {
  if (override && Object.hasOwn(override, 'icon')) {
    const icon = override.icon?.trim() ?? ''
    return icon || undefined
  }
  return builtinLegendIcon(code, platform)
}

export function createLegendResolver(
  locale: KeyboardLocale,
  platform: ResolvedPlatform,
  overrides?: Readonly<Record<string, IKeyLegendOverride>>,
) {
  const table = resolveLocaleTable(locale)
  const modifiers = platformModifiers[platform]
  const cache = new Map<string, IKeyLegend>()

  return (code: string): IKeyLegend => {
    const cached = cache.get(code)
    if (cached) return cached

    const base = table[code] ?? { primary: fallbackLabel(code) }
    const modifier = modifiers[code]
    const override = overrides?.[code]
    const icon = resolveLegendIcon(code, platform, override)
    const legend: IKeyLegend = {
      primary: override?.primary ?? modifier?.primary ?? base.primary,
      shift: override?.shift ?? base.shift,
      ...(icon ? { icon } : {}),
    }
    cache.set(code, legend)
    return legend
  }
}

export type LegendResolver = ReturnType<typeof createLegendResolver>
