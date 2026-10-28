import type { LegendMap } from '../types/keyboard.types.ts'

export type ResolvedPlatform = 'win' | 'mac'

export const platformModifiers: Record<ResolvedPlatform, LegendMap> = {
  win: {
    ControlLeft: { primary: 'Ctrl' },
    ControlRight: { primary: 'Ctrl' },
    AltLeft: { primary: 'Alt' },
    AltRight: { primary: 'Alt' },
    MetaLeft: { primary: 'Win' },
    MetaRight: { primary: 'Win' },
  },
  mac: {
    ControlLeft: { primary: '⌃' },
    ControlRight: { primary: '⌃' },
    AltLeft: { primary: '⌥' },
    AltRight: { primary: '⌥' },
    MetaLeft: { primary: '⌘' },
    MetaRight: { primary: '⌘' },
  },
}
