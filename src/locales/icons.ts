import type { ResolvedPlatform } from './modifiers.ts'

const sharedIcons: Record<string, string> = {
  ArrowUp: 'arrow-up',
  ArrowDown: 'arrow-down',
  ArrowLeft: 'arrow-left',
  ArrowRight: 'arrow-right',
  ShiftLeft: 'arrow-big-up',
  ShiftRight: 'arrow-big-up',
}

const macIcons: Record<string, string> = {
  MetaLeft: 'command',
  MetaRight: 'command',
  AltLeft: 'option',
  AltRight: 'option',
}

export function builtinLegendIcon(code: string, platform: ResolvedPlatform): string | undefined {
  if (platform === 'mac') return macIcons[code] ?? sharedIcons[code]
  return sharedIcons[code]
}
