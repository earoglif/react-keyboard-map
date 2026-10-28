export { KeyboardMap } from './components/KeyboardMap/KeyboardMap.tsx'
export { normalizeKeyboardConfig, validateKeyboardConfig } from './layouts/config.ts'
export type { IKeyCodeWarning, ILayoutRowReport, ILayoutValidationResult, INormalizedKeyboard } from './layouts/config.ts'
export { KEY_CODE_GROUPS } from './layouts/keycodes.ts'
export type { IKeyCodeGroup } from './layouts/keycodes.ts'
export { KEYBOARD_PRESETS, KEYBOARD_PRESET_IDS, KEYBOARD_PRESET_SUMMARIES, getKeyboardPreset, resolveKeyboardPreset } from './layouts/presets.ts'
export type { KeyboardPresetId } from './layouts/presets.ts'
export { enLegends } from './locales/en.ts'
export { ruLegends } from './locales/ru.ts'
export type {
  CompactLayoutItem,
  ICompactKeyConfig,
  IKeyAnnotation,
  IKeyLegend,
  IKeyRenderContext,
  IKeyStackConfig,
  IKeyZoneStyle,
  IKeyboardConfig,
  IKeyboardMapProps,
  IKeyboardSectionConfig,
  ISpacerConfig,
  KeyCode,
  KeyShape,
  KeyboardFormFactor,
  KeyboardLocale,
  KeyboardPlatform,
  KeyboardStandard,
  KeyboardTheme,
  LegendMap,
} from './types/keyboard.types.ts'
