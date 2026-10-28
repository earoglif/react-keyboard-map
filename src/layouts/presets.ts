import type {
  CompactLayoutItem,
  ICompactKeyConfig,
  IKeyboardConfig,
  IKeyboardSectionConfig,
  KeyboardStandard,
} from '../types/keyboard.types.ts'
import { roundKeyUnit, validateKeyboardConfig } from './config.ts'
import type { IKeyboardSection, ILayoutKey, LayoutItem } from './geometry.ts'
import { spacer } from './geometry.ts'
import { buildKeyboardSections } from './index.ts'

const DIGITS = ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0']

export const KEYBOARD_PRESET_IDS = [
  '60%-ansi',
  '60%-iso',
  '65%-ansi',
  '65%-iso',
  '75%-ansi',
  '75%-iso',
  'tkl-ansi',
  'tkl-iso',
  '96%-ansi',
  'full-ansi',
  'full-iso',
  'laptop-ansi',
  'laptop-iso',
] as const

export type KeyboardPresetId = (typeof KEYBOARD_PRESET_IDS)[number]

export const KEYBOARD_PRESET_SUMMARIES: Record<KeyboardPresetId, string> = {
  '60%-ansi': 'Compact ANSI 60% without a function row, navigation block, or numpad.',
  '60%-iso': 'Compact ISO 60% with a split left shift and L-shaped Enter.',
  '65%-ansi': 'ANSI 60% alpha block plus a right column and dedicated arrow cluster.',
  '65%-iso': 'ISO 60% alpha block plus a right column and dedicated arrow cluster.',
  '75%-ansi': 'ANSI 75% with a function row, 1.75u right shift, 1u right modifiers, and a navigation column.',
  '75%-iso': 'ISO 75% with a function row, 1.75u right shift, 1u right modifiers, and a navigation column.',
  'tkl-ansi': 'ANSI tenkeyless (80%) with navigation keys and no numpad.',
  'tkl-iso': 'ISO tenkeyless (80%) with navigation keys and no numpad.',
  '96%-ansi': 'Compact ANSI 1800/96% with navigation and numpad in one block.',
  'full-ansi': 'ANSI full-size keyboard with navigation and numpad.',
  'full-iso': 'ISO full-size keyboard with navigation and numpad.',
  'laptop-ansi': 'ANSI laptop with a function row, Fn, and a half-height arrow stack.',
  'laptop-iso': 'ISO laptop with a function row, Fn, and a half-height arrow stack.',
}

function letters(text: string): string[] {
  return [...text].map((letter) => `Key${letter}`)
}

function wide(code: string, w: number): ICompactKeyConfig {
  return { code, w }
}

function toCompactKey(item: ILayoutKey): string | ICompactKeyConfig {
  if (item.width === 1 && item.height === 1 && item.shape === 'rect' && !item.hang) return item.code
  const compact: ICompactKeyConfig = { code: item.code }
  if (item.width !== 1) compact.w = item.width
  if (item.height !== 1) compact.h = item.height
  if (item.shape !== 'rect') compact.shape = item.shape
  if (item.hang) compact.hang = true
  return compact
}

function toCompactItem(item: LayoutItem): CompactLayoutItem {
  if (item.kind === 'spacer') return item.width
  if (item.kind === 'stack') {
    return { w: item.width, stack: [toCompactKey(item.keys[0]), toCompactKey(item.keys[1])] }
  }
  return toCompactKey(item)
}

function toSectionConfig(section: IKeyboardSection): IKeyboardSectionConfig {
  return {
    id: section.id,
    ...(section.gapLeft !== undefined ? { gapLeft: section.gapLeft } : {}),
    rows: section.rows.map((row) => row.map(toCompactItem)),
  }
}

function fromFormFactor(
  name: string,
  standard: KeyboardStandard,
  formFactor: '60%' | 'tkl' | 'full',
): IKeyboardConfig {
  return {
    name,
    standard,
    sections: buildKeyboardSections(formFactor, standard).map(toSectionConfig),
  }
}

function requireSection(config: IKeyboardConfig, id: string): IKeyboardSectionConfig {
  const section = config.sections.find((item) => item.id === id)
  if (!section) throw new Error(`Preset section "${id}" is missing`)
  return section
}

const NAV_65: IKeyboardSectionConfig = {
  id: 'nav',
  rows: [
    ['Delete', 2],
    ['Home', 2],
    ['PageUp', 2],
    [1, 'ArrowUp', 'PageDown'],
    ['ArrowLeft', 'ArrowDown', 'ArrowRight'],
  ],
}

function preset65(standard: KeyboardStandard): IKeyboardConfig {
  const base = fromFormFactor(`60%-${standard}`, standard, '60%')
  return {
    name: `65%-${standard}`,
    standard,
    sections: [...base.sections, NAV_65],
  }
}

function preset75Ansi(): IKeyboardConfig {
  return {
    name: '75%-ansi',
    standard: 'ansi',
    sections: [
      {
        id: 'main',
        rows: [
          ['Escape', 1, 'F1', 'F2', 'F3', 'F4', 0.5, 'F5', 'F6', 'F7', 'F8', 0.5, 'F9', 'F10', 'F11', 'F12', 0.5, 'Delete'],
          ['Backquote', ...DIGITS, 'Minus', 'Equal', wide('Backspace', 2), 0.5, 'Home'],
          [wide('Tab', 1.5), ...letters('QWERTYUIOP'), 'BracketLeft', 'BracketRight', wide('Backslash', 1.5), 0.5, 'PageUp'],
          [wide('CapsLock', 1.75), ...letters('ASDFGHJKL'), 'Semicolon', 'Quote', wide('Enter', 2.25), 0.5, 'PageDown'],
          [wide('ShiftLeft', 2.25), ...letters('ZXCVBNM'), 'Comma', 'Period', 'Slash', wide('ShiftRight', 1.75), 0.5, 'ArrowUp', 'End'],
          [
            wide('ControlLeft', 1.25),
            wide('MetaLeft', 1.25),
            wide('AltLeft', 1.25),
            wide('Space', 6.25),
            wide('AltRight', 1),
            wide('Fn', 1),
            wide('ControlRight', 1),
            0.5,
            'ArrowLeft',
            'ArrowDown',
            'ArrowRight',
          ],
        ],
      },
    ],
  }
}

const NAV_75_ISO: IKeyboardSectionConfig = {
  id: 'nav',
  rows: [
    ['Delete', 2],
    ['Home', 2],
    ['PageUp', 2],
    ['PageDown', 2],
    [1, 'ArrowUp', 1],
    ['ArrowLeft', 'ArrowDown', 'ArrowRight'],
  ],
}

function preset75Iso(): IKeyboardConfig {
  const main = requireSection(fromFormFactor('tkl-iso', 'iso', 'tkl'), 'main')
  const rows = main.rows.map((row) => [...row])
  rows[4] = [
    wide('ShiftLeft', 1.25),
    'IntlBackslash',
    ...letters('ZXCVBNM'),
    'Comma',
    'Period',
    'Slash',
    wide('ShiftRight', 1.75),
    1,
  ]
  rows[5] = [
    wide('ControlLeft', 1.25),
    wide('MetaLeft', 1.25),
    wide('AltLeft', 1.25),
    wide('Space', 7.25),
    wide('AltRight', 1),
    wide('Fn', 1),
    wide('ControlRight', 1),
    wide('ContextMenu', 1),
  ]
  return { name: '75%-iso', standard: 'iso', sections: [{ id: 'main', rows }, NAV_75_ISO] }
}

function rowWidth(row: LayoutItem[]): number {
  return row.reduce((sum, item) => sum + item.width, 0)
}

function hangBelow(row: LayoutItem[] | undefined): number {
  if (!row) return 0
  let width = 0
  for (const item of row) {
    if (item.kind === 'key' && item.hang) width += item.width
  }
  return width
}

function isoOverlap(row: LayoutItem[]): number {
  let overlap = 0
  for (const item of row) {
    if (item.kind === 'key' && item.hang && item.shape === 'iso-enter') overlap += 0.25
  }
  return overlap
}

function visualWidth(row: LayoutItem[], below: LayoutItem[] | undefined): number {
  return roundKeyUnit(rowWidth(row) - isoOverlap(row) + hangBelow(below))
}

interface IMergePart {
  rows: LayoutItem[][]
  width: number
}

function mergeParts(parts: readonly IMergePart[], gap: number): LayoutItem[][] {
  const height = Math.max(...parts.map((part) => part.rows.length))
  const merged: LayoutItem[][] = []
  for (let index = 0; index < height; index += 1) {
    const row: LayoutItem[] = []
    parts.forEach((part, partIndex) => {
      if (partIndex > 0) row.push(spacer(gap))
      const source = part.rows[index] ?? []
      if (source.length === 0) {
        row.push(spacer(part.width))
        return
      }
      row.push(...source)
      const deficit = roundKeyUnit(part.width - visualWidth(source, part.rows[index + 1]))
      if (deficit > 0.02) row.push(spacer(deficit))
    })
    merged.push(row)
  }
  return merged
}

function preset96(): IKeyboardConfig {
  const [main, nav, numpad] = buildKeyboardSections('full', 'ansi')
  if (!main || !nav || !numpad) throw new Error('Full ANSI layout is incomplete')
  const rows = mergeParts(
    [
      { rows: main.rows, width: 15 },
      { rows: nav.rows, width: 3 },
      { rows: numpad.rows, width: 4 },
    ],
    0.25,
  )
  return {
    name: '96%-ansi',
    standard: 'ansi',
    sections: [{ id: 'main', rows: rows.map((row) => row.map(toCompactItem)) }],
  }
}

function presetLaptop(standard: KeyboardStandard): IKeyboardConfig {
  const main = requireSection(fromFormFactor(`tkl-${standard}`, standard, 'tkl'), 'main')
  const rows = main.rows.map((row) => [...row])
  rows[0] = ['Escape', 0.5, 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12', 0.5, 'Delete']
  rows[5] = [
    wide('ControlLeft', 1.25),
    wide('Fn', 1),
    wide('MetaLeft', 1.25),
    wide('AltLeft', 1.25),
    wide('Space', 4.75),
    wide('AltRight', 1.25),
    wide('ControlRight', 1.25),
    'ArrowLeft',
    { stack: ['ArrowUp', 'ArrowDown'] },
    'ArrowRight',
  ]
  return { name: `laptop-${standard}`, standard, sections: [{ id: 'main', rows }] }
}

function publish(config: IKeyboardConfig): IKeyboardConfig {
  const result = validateKeyboardConfig(config)
  if (!result.valid) {
    throw new Error(`Preset "${config.name ?? 'keyboard'}" is invalid. ${result.errors.join(' ')}`)
  }
  return config
}

export const KEYBOARD_PRESETS: Record<KeyboardPresetId, IKeyboardConfig> = {
  '60%-ansi': publish(fromFormFactor('60%-ansi', 'ansi', '60%')),
  '60%-iso': publish(fromFormFactor('60%-iso', 'iso', '60%')),
  '65%-ansi': publish(preset65('ansi')),
  '65%-iso': publish(preset65('iso')),
  '75%-ansi': publish(preset75Ansi()),
  '75%-iso': publish(preset75Iso()),
  'tkl-ansi': publish(fromFormFactor('tkl-ansi', 'ansi', 'tkl')),
  'tkl-iso': publish(fromFormFactor('tkl-iso', 'iso', 'tkl')),
  '96%-ansi': publish(preset96()),
  'full-ansi': publish(fromFormFactor('full-ansi', 'ansi', 'full')),
  'full-iso': publish(fromFormFactor('full-iso', 'iso', 'full')),
  'laptop-ansi': publish(presetLaptop('ansi')),
  'laptop-iso': publish(presetLaptop('iso')),
}

export function getKeyboardPreset(id: string): IKeyboardConfig | undefined {
  if (!Object.hasOwn(KEYBOARD_PRESETS, id)) return undefined
  return KEYBOARD_PRESETS[id as KeyboardPresetId]
}

export function resolveKeyboardPreset(formFactor: string, standard: KeyboardStandard = 'ansi'): IKeyboardConfig | undefined {
  const factor = formFactor.toLowerCase().replaceAll('percent', '%').replaceAll(/\s+/g, '')
  const normalized =
    factor === '80' || factor === '80%' || factor === 'tkl' || factor === 'tenkeyless'
      ? 'tkl'
      : factor === '100' || factor === '100%' || factor === 'full'
        ? 'full'
        : factor === '1800' || factor === '96' || factor === '96%'
          ? '96%'
          : factor === '65' || factor === '65%'
            ? '65%'
            : factor === '75' || factor === '75%'
              ? '75%'
              : factor === '60' || factor === '60%'
                ? '60%'
                : factor
  return getKeyboardPreset(`${normalized}-${standard}`)
}
