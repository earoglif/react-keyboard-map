import { renderAsciiPreview, validateKeyboardConfig } from '../layouts/config.ts'
import { KNOWN_KEY_CODES, suggestKeyCode } from '../layouts/keycodes.ts'
import type {
  CompactLayoutItem,
  ICompactKeyConfig,
  IKeyboardConfig,
  KeyboardStandard,
} from '../types/keyboard.types.ts'

const API_BASE = 'https://keyboards.qmk.fm/v1'
const LIST_URL = `${API_BASE}/keyboard_list.json`
const REQUEST_TIMEOUT_MS = 8000

export interface IQmkSearchMatch {
  id: string
  score: number
}

export interface IQmkSearchResult {
  matches: IQmkSearchMatch[]
  layoutName?: string
  config?: IKeyboardConfig
  preview?: string
  warnings: string[]
  error?: string
}

interface IQmkKey {
  x?: number
  y?: number
  w?: number
  h?: number
  label?: string
  r?: number
}

interface IQmkLayout {
  layout?: IQmkKey[]
}

interface IQmkKeyboard {
  keyboard_name?: string
  layouts?: Record<string, IQmkLayout>
}

interface IPlacedKey {
  x: number
  y: number
  w: number
  h: number
  label: string
  rotated: boolean
  code: string
  shape: ICompactKeyConfig['shape']
  hang: boolean
}

const SYMBOL_CODES: Record<string, string> = {
  '`': 'Backquote',
  '~': 'Backquote',
  '¬': 'Backquote',
  '!': 'Digit1',
  '@': 'Digit2',
  '#': 'Digit3',
  $: 'Digit4',
  '%': 'Digit5',
  '^': 'Digit6',
  '&': 'Digit7',
  '*': 'Digit8',
  '(': 'Digit9',
  ')': 'Digit0',
  '-': 'Minus',
  _: 'Minus',
  '=': 'Equal',
  '+': 'Equal',
  '[': 'BracketLeft',
  '{': 'BracketLeft',
  ']': 'BracketRight',
  '}': 'BracketRight',
  '\\': 'Backslash',
  '|': 'Backslash',
  ';': 'Semicolon',
  ':': 'Semicolon',
  "'": 'Quote',
  '"': 'Quote',
  ',': 'Comma',
  '<': 'Comma',
  '.': 'Period',
  '>': 'Period',
  '/': 'Slash',
  '?': 'Slash',
  '↑': 'ArrowUp',
  '↓': 'ArrowDown',
  '←': 'ArrowLeft',
  '→': 'ArrowRight',
}

const NUMPAD_SYMBOLS: Record<string, string> = {
  '/': 'NumpadDivide',
  '*': 'NumpadMultiply',
  '-': 'NumpadSubtract',
  '+': 'NumpadAdd',
  '.': 'NumpadDecimal',
  ',': 'NumpadComma',
  '=': 'NumpadEqual',
}

let keyboardList: Promise<string[]> | undefined

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'QMK lookup failed'
}

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url, {
    headers: { accept: 'application/json' },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })
  if (!response.ok) throw new Error(`QMK request failed (${response.status}) for ${url}`)
  return response.json() as Promise<unknown>
}

function unwrapKeyboardList(payload: unknown): string[] {
  if (Array.isArray(payload)) return payload.filter((item): item is string => typeof item === 'string')
  if (!isRecord(payload) || !Array.isArray(payload.keyboards)) return []
  return payload.keyboards.filter((item): item is string => typeof item === 'string')
}

function loadKeyboardList(): Promise<string[]> {
  keyboardList ??= fetchJson(LIST_URL)
    .then((payload) => {
      const list = unwrapKeyboardList(payload)
      if (list.length === 0) throw new Error('QMK keyboard list was empty')
      return list
    })
    .catch((error: unknown) => {
      keyboardList = undefined
      throw error
    })
  return keyboardList
}

function unwrapKeyboard(payload: unknown, id: string): IQmkKeyboard | undefined {
  if (!isRecord(payload)) return undefined
  if (isRecord(payload.layouts)) return payload as IQmkKeyboard
  if (!isRecord(payload.keyboards)) return undefined
  const keyboards = payload.keyboards
  if (isRecord(keyboards[id])) return keyboards[id] as IQmkKeyboard
  const first = Object.values(keyboards).find(isRecord)
  return first as IQmkKeyboard | undefined
}

function tokensOf(value: string): string[] {
  return value.toLowerCase().split(/[^a-z0-9]+/).filter((token) => token.length > 0)
}

function scoreKeyboard(query: string, id: string): number {
  const queryTokens = tokensOf(query)
  if (queryTokens.length === 0) return 0
  const normalizedId = id.toLowerCase()
  if (normalizedId === query.trim().toLowerCase()) return 1000
  if (normalizedId.replace(/[^a-z0-9]/g, '') === queryTokens.join('')) return 900
  const idTokens = tokensOf(id)
  const hits = queryTokens.filter((token) => idTokens.some((part) => part.includes(token))).length
  if (hits === 0) return 0
  const coverage = hits / queryTokens.length
  const extra = Math.max(0, idTokens.length - queryTokens.length)
  return Math.round(coverage * 500 - extra * 8)
}

function layoutScore(name: string, standard: KeyboardStandard | undefined): number {
  const lower = name.toLowerCase()
  let score = 0
  if (standard && lower.includes(standard)) score += 50
  else if (!standard && lower.includes('ansi')) score += 10
  if (lower.includes('all')) score -= 25
  if (lower.includes('split')) score -= 5
  score -= Math.min(lower.length, 80) * 0.05
  return score
}

function pickLayout(
  layouts: Record<string, IQmkLayout>,
  standard: KeyboardStandard | undefined,
): [string, IQmkKey[]] | undefined {
  const entries = Object.entries(layouts).flatMap(([name, layout]) => {
    if (!Array.isArray(layout.layout) || layout.layout.length === 0) return []
    return [[name, layout.layout] as [string, IQmkKey[]]]
  })
  if (entries.length === 0) return undefined
  entries.sort((left, right) => layoutScore(right[0], standard) - layoutScore(left[0], standard))
  return entries[0]
}

function mapKnownLabel(label: string, x: number): string | undefined {
  if (KNOWN_KEY_CODES.has(label)) return label
  const named = suggestKeyCode(label)
  if (named && label.length > 1) return named
  if (/^[a-z]$/i.test(label)) return `Key${label.toUpperCase()}`
  if (/^[0-9]$/.test(label)) return x >= 15.5 ? `Numpad${label}` : `Digit${label}`
  if (x >= 15.5 && NUMPAD_SYMBOLS[label]) return NUMPAD_SYMBOLS[label]
  return SYMBOL_CODES[label]
}

function inferCode(label: string, x: number, w: number, h: number): string {
  const trimmed = label.trim()
  const lower = trimmed.toLowerCase()
  if (lower === 'altgr') return 'AltRight'
  if (lower === 'menu' || lower === 'app' || lower === 'apps') return 'ContextMenu'
  if (lower === 'back' || lower === 'bksp') return 'Backspace'
  if (lower === 'caps lock' || lower === 'caps') return 'CapsLock'
  if (lower === 'win' || lower === 'gui' || lower === 'cmd' || lower === 'command') return x >= 8 ? 'MetaRight' : 'MetaLeft'
  if (/^k[0-9a-f]+$/i.test(trimmed)) return w >= 4 ? 'Space' : ''
  if (trimmed === '' && w >= 4) return 'Space'
  return mapKnownLabel(trimmed, x) ?? (h >= 1.75 && lower.includes('enter') ? 'Enter' : '')
}

function applyGeometry(key: IPlacedKey): void {
  const tall = key.h >= 1.75
  key.hang = tall
  const isoEnter = tall && key.w >= 1.15 && key.w <= 1.6 && key.x < 15.5 && (key.code === 'Enter' || key.code === '')
  key.shape = isoEnter ? 'iso-enter' : 'rect'
  if (key.code === 'Enter' && key.x >= 15.5) key.code = 'NumpadEnter'
  if (isoEnter) key.code = 'Enter'
}

function disambiguatePair(keys: IPlacedKey[], left: string, right: string) {
  const matches = keys.filter((key) => key.code === left || key.code === right)
  if (matches.length < 2) return
  matches.sort((leftKey, rightKey) => leftKey.x - rightKey.x)
  const midpoint = Math.ceil(matches.length / 2)
  matches.forEach((key, index) => {
    key.code = index < midpoint ? left : right
  })
}

function toCompactKey(key: IPlacedKey): CompactLayoutItem {
  const compact: ICompactKeyConfig = { code: key.code }
  if (key.shape === 'iso-enter') {
    compact.shape = 'iso-enter'
    compact.hang = true
    compact.w = 1.5
    compact.h = 2
    return compact
  }
  if (key.w !== 1) compact.w = key.w
  if (key.hang) {
    compact.hang = true
    compact.h = 2
  }
  if (compact.w === undefined && compact.h === undefined && compact.hang === undefined) return key.code
  return compact
}

export function convertQmkLayout(
  layout: readonly IQmkKey[],
  name: string,
  standard: KeyboardStandard | undefined,
): { config: IKeyboardConfig; warnings: string[] } {
  const warnings: string[] = []
  let unlabeled = 0
  const placed: IPlacedKey[] = layout.map((source) => {
    const x = source.x ?? 0
    const y = source.y ?? 0
    const w = source.w ?? 1
    const h = source.h ?? 1
    const label = source.label ?? ''
    const rotated = typeof source.r === 'number' && source.r !== 0
    const code = inferCode(label, x, w, h)
    const key: IPlacedKey = {
      x,
      y,
      w,
      h,
      label,
      rotated,
      code,
      shape: 'rect',
      hang: false,
    }
    applyGeometry(key)
    if (!key.code) {
      unlabeled += 1
      key.code = `Unlabeled${unlabeled}`
      warnings.push(`Could not map QMK label "${label || '(empty)'}" at x=${x} y=${y}. Assigned "${key.code}".`)
    }
    return key
  })

  disambiguatePair(placed, 'ShiftLeft', 'ShiftRight')
  disambiguatePair(placed, 'ControlLeft', 'ControlRight')
  disambiguatePair(placed, 'AltLeft', 'AltRight')
  disambiguatePair(placed, 'MetaLeft', 'MetaRight')

  const rotatedCount = placed.filter((key) => key.rotated).length
  if (rotatedCount > 0) {
    warnings.push(`${rotatedCount} rotated keys were placed without rotation. Split and Alice layouts will not match the photo.`)
  }

  const rowKeys = new Map<number, IPlacedKey[]>()
  for (const key of placed) {
    const bottom = key.h >= 1.75 ? key.y + key.h - 1 : key.y
    const row = Math.round(bottom)
    const bucket = rowKeys.get(row) ?? []
    bucket.push(key)
    rowKeys.set(row, bucket)
  }

  const rows: CompactLayoutItem[][] = [...rowKeys.keys()]
    .sort((left, right) => left - right)
    .map((row) => {
      const keys = (rowKeys.get(row) ?? []).sort((left, right) => left.x - right.x)
      const items: CompactLayoutItem[] = []
      let cursor = 0
      for (const key of keys) {
        const gap = Math.round((key.x - cursor) * 1000) / 1000
        if (gap > 0.05) items.push(gap)
        else if (gap < -0.3) {
          warnings.push(`Key "${key.code}" overlaps the previous key by ${Math.abs(gap)}u.`)
        }
        items.push(toCompactKey(key))
        cursor = Math.round((key.x + key.w) * 1000) / 1000
      }
      return items
    })

  const config: IKeyboardConfig = {
    name,
    ...(standard ? { standard } : {}),
    sections: [{ id: 'main', rows }],
  }
  return { config, warnings }
}

export async function searchQmkKeyboards(
  query: string,
  standard?: KeyboardStandard,
): Promise<IQmkSearchResult> {
  const trimmed = query.trim()
  if (!trimmed) return { matches: [], warnings: [], error: 'Query is empty.' }

  try {
    const list = await loadKeyboardList()
    const exact = list.find((id) => id.toLowerCase() === trimmed.toLowerCase())
    const ranked = list
      .map((id) => ({ id, score: exact && id === exact ? 1000 : scoreKeyboard(trimmed, id) }))
      .filter((match) => match.score > 0)
      .sort((left, right) => right.score - left.score || left.id.length - right.id.length)
    const matches = ranked.slice(0, 8)
    if (!exact && (matches.length === 0 || matches[0].score < 250)) {
      return { matches, warnings: [], error: `No QMK keyboard matched "${trimmed}".` }
    }

    const best = exact ? { id: exact, score: 1000 } : matches[0]
    const runnerUp = matches.find((match) => match.id !== best.id)
    if (!exact && runnerUp && best.score - runnerUp.score < 12) {
      const close = matches.filter((match) => best.score - match.score < 12).map((match) => match.id)
      return {
        matches,
        warnings: [],
        error: `Multiple QMK keyboards match "${trimmed}". Choose an id: ${close.join(', ')}`,
      }
    }

    const payload = await fetchJson(`${API_BASE}/keyboards/${best.id}/info.json`)
    const keyboard = unwrapKeyboard(payload, best.id)
    if (!keyboard?.layouts) {
      return { matches, warnings: [], error: `QMK keyboard "${best.id}" has no layouts.` }
    }
    const picked = pickLayout(keyboard.layouts, standard)
    if (!picked) return { matches, warnings: [], error: `QMK keyboard "${best.id}" has no usable layout.` }

    const [layoutName, layout] = picked
    const resolvedStandard: KeyboardStandard | undefined = layoutName.toLowerCase().includes('iso')
      ? 'iso'
      : layoutName.toLowerCase().includes('ansi')
        ? 'ansi'
        : standard
    const converted = convertQmkLayout(layout, keyboard.keyboard_name ?? best.id, resolvedStandard)
    const validation = validateKeyboardConfig(converted.config)
    return {
      matches,
      layoutName,
      config: converted.config,
      preview: validation.preview || renderAsciiPreview([]),
      warnings: [...converted.warnings, ...validation.warnings.map((warning) => warning.message), ...validation.errors],
    }
  } catch (error) {
    return { matches: [], warnings: [], error: errorMessage(error) }
  }
}
