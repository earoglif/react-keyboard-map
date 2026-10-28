import type { ICompactKeyConfig, IKeyLegend, KeyCode } from '../types/keyboard.types.ts'
import type { IKeyboardSection, ILayoutKey, ILayoutStack, KeyShape, LayoutItem } from './geometry.ts'
import { KNOWN_KEY_CODES, suggestKeyCode } from './keycodes.ts'

const ISO_ENTER_OVERLAP = 0.25
const ISO_ENTER_WIDTH = 1.5
const HANG_HEIGHT = 2
const STACK_KEY_HEIGHT = 0.5
const WIDTH_EPSILON = 0.02

export interface IKeyCodeWarning {
  code: string
  sectionId: string
  rowIndex: number
  message: string
  suggestion?: string
}

export interface ILayoutRowReport {
  sectionId: string
  rowIndex: number
  width: number
  expected: number
  delta: number
}

export interface INormalizedKeyboard {
  sections: IKeyboardSection[]
  legendOverrides: Record<string, Partial<IKeyLegend>>
}

export interface ILayoutValidationResult {
  valid: boolean
  errors: string[]
  warnings: IKeyCodeWarning[]
  rows: ILayoutRowReport[]
  preview: string
}

interface ILocatedKey {
  code: string
  sectionId: string
  rowIndex: number
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function roundKeyUnit(value: number): number {
  return Math.round(value * 1000) / 1000
}

export function formatKeyUnit(value: number): string {
  const rounded = roundKeyUnit(value)
  return Number.isInteger(rounded) ? String(rounded) : String(rounded)
}

function formatSignedUnit(value: number): string {
  const rounded = roundKeyUnit(value)
  if (rounded > 0) return `+${formatKeyUnit(rounded)}`
  return formatKeyUnit(rounded)
}

function fail(path: string, message: string): never {
  throw new Error(`${path}: ${message}`)
}

function readKeyConfig(value: Record<string, unknown>, path: string): ICompactKeyConfig {
  if (typeof value.code !== 'string') fail(path, 'key object requires a code')
  if (value.shape !== undefined && value.shape !== 'rect' && value.shape !== 'iso-enter') {
    fail(path, `unsupported key shape "${String(value.shape)}"`)
  }
  if (value.w !== undefined && typeof value.w !== 'number') fail(path, 'key width must be a number')
  if (value.h !== undefined && typeof value.h !== 'number') fail(path, 'key height must be a number')
  if (value.hang !== undefined && typeof value.hang !== 'boolean') fail(path, 'hang must be a boolean')
  if (value.legend !== undefined && typeof value.legend !== 'string') fail(path, 'legend must be a string')
  if (value.shift !== undefined && typeof value.shift !== 'string') fail(path, 'shift must be a string')

  return {
    code: value.code,
    ...(typeof value.w === 'number' ? { w: value.w } : {}),
    ...(typeof value.h === 'number' ? { h: value.h } : {}),
    ...(value.shape === 'rect' || value.shape === 'iso-enter' ? { shape: value.shape } : {}),
    ...(typeof value.hang === 'boolean' ? { hang: value.hang } : {}),
    ...(typeof value.legend === 'string' ? { legend: value.legend } : {}),
    ...(typeof value.shift === 'string' ? { shift: value.shift } : {}),
  }
}

function legendPartial(legend: string | undefined, shift: string | undefined): Partial<IKeyLegend> | undefined {
  if (legend === undefined && shift === undefined) return undefined
  return {
    ...(legend !== undefined ? { primary: legend } : {}),
    ...(shift !== undefined ? { shift } : {}),
  }
}

function mergeLegend(
  target: Record<string, Partial<IKeyLegend>>,
  code: KeyCode,
  next: Partial<IKeyLegend> | undefined,
) {
  if (!next) return
  const current = target[code]
  target[code] = {
    primary: next.primary ?? current?.primary,
    shift: next.shift ?? current?.shift,
  }
}

function normalizeKey(source: ICompactKeyConfig, path: string): ILayoutKey {
  if (typeof source.code !== 'string' || source.code.trim() === '') fail(path, 'key code is required')
  const shape: KeyShape = source.shape === 'iso-enter' ? 'iso-enter' : 'rect'
  if (source.shape !== undefined && source.shape !== 'rect' && source.shape !== 'iso-enter') {
    fail(path, `unsupported key shape "${String(source.shape)}"`)
  }
  const hang = shape === 'iso-enter' || source.hang === true
  const width = shape === 'iso-enter' ? ISO_ENTER_WIDTH : source.w ?? 1
  const height = hang ? HANG_HEIGHT : source.h ?? 1
  if (!Number.isFinite(width) || width <= 0) fail(path, 'key width must be a positive number')
  if (!Number.isFinite(height) || height <= 0) fail(path, 'key height must be a positive number')
  return { kind: 'key', code: source.code, width, height, shape, hang }
}

function normalizeStack(
  source: Record<string, unknown>,
  path: string,
  legends: Record<string, Partial<IKeyLegend>>,
): ILayoutStack {
  if (!Array.isArray(source.stack) || source.stack.length !== 2) fail(path, 'stack must contain exactly two keys')
  const width = source.w === undefined ? 1 : source.w
  if (typeof width !== 'number' || !Number.isFinite(width) || width <= 0) fail(path, 'stack width must be a positive number')
  const keys = source.stack.map((entry: unknown, index) => {
    const entryPath = `${path}.stack[${index}]`
    const compact = typeof entry === 'string' ? { code: entry } : isRecord(entry) ? readKeyConfig(entry, entryPath) : fail(entryPath, 'stack key must be a code or object')
    const key = normalizeKey({ ...compact, w: width, h: STACK_KEY_HEIGHT, hang: false, shape: 'rect' }, entryPath)
    mergeLegend(legends, key.code, legendPartial(compact.legend, compact.shift))
    return { ...key, height: STACK_KEY_HEIGHT, hang: false, shape: 'rect' as const }
  })
  const top = keys[0]
  const bottom = keys[1]
  if (!top || !bottom) fail(path, 'stack must contain exactly two keys')
  return { kind: 'stack', width, keys: [top, bottom] }
}

function normalizeItem(item: unknown, path: string, legends: Record<string, Partial<IKeyLegend>>): LayoutItem {
  if (typeof item === 'string') {
    if (item.trim() === '') fail(path, 'key code is empty')
    return { kind: 'key', code: item, width: 1, height: 1, shape: 'rect', hang: false }
  }
  if (typeof item === 'number') {
    if (!Number.isFinite(item) || item < 0) fail(path, 'spacer width must be zero or greater')
    return { kind: 'spacer', width: item }
  }
  if (!isRecord(item)) fail(path, 'layout item must be a key code, spacer width, or object')
  if (typeof item.spacer === 'number' && !('code' in item)) {
    if (!Number.isFinite(item.spacer) || item.spacer < 0) fail(path, 'spacer width must be zero or greater')
    return { kind: 'spacer', width: item.spacer }
  }
  if ('stack' in item) return normalizeStack(item, path, legends)
  const compact = readKeyConfig(item, path)
  const key = normalizeKey(compact, path)
  mergeLegend(legends, key.code, legendPartial(compact.legend, compact.shift))
  return key
}

function readLegendMap(value: unknown, path: string): Record<string, Partial<IKeyLegend>> {
  if (value === undefined) return {}
  if (!isRecord(value)) fail(path, 'legends must be an object')
  const legends: Record<string, Partial<IKeyLegend>> = {}
  for (const [code, entry] of Object.entries(value)) {
    if (typeof entry === 'string') {
      legends[code] = { primary: entry }
      continue
    }
    if (!isRecord(entry) || typeof entry.primary !== 'string') {
      fail(`${path}.${code}`, 'legend must be a string or { primary, shift? }')
    }
    legends[code] = {
      primary: entry.primary,
      ...(typeof entry.shift === 'string' ? { shift: entry.shift } : {}),
    }
  }
  return legends
}

export function normalizeKeyboardConfig(config: unknown): INormalizedKeyboard {
  if (!isRecord(config)) fail('config', 'keyboard config must be an object')
  if (!Array.isArray(config.sections) || config.sections.length === 0) {
    fail('config.sections', 'at least one section is required')
  }

  const legendOverrides = readLegendMap(config.legends, 'config.legends')
  const sections: IKeyboardSection[] = config.sections.map((section: unknown, sectionIndex: number) => {
    const sectionPath = `config.sections[${sectionIndex}]`
    if (!isRecord(section)) fail(sectionPath, 'section must be an object')
    if (typeof section.id !== 'string' || section.id.trim() === '') fail(sectionPath, 'section id is required')
    if (!Array.isArray(section.rows)) fail(`${sectionPath}.rows`, 'rows must be an array')
    if (section.gapLeft !== undefined && (typeof section.gapLeft !== 'number' || !Number.isFinite(section.gapLeft))) {
      fail(`${sectionPath}.gapLeft`, 'gapLeft must be a number')
    }

    return {
      id: section.id,
      ...(typeof section.gapLeft === 'number' ? { gapLeft: section.gapLeft } : {}),
      rows: section.rows.map((row, rowIndex) => {
        if (!Array.isArray(row)) fail(`${sectionPath}.rows[${rowIndex}]`, 'row must be an array')
        return row.map((item, itemIndex) =>
          normalizeItem(item, `${sectionPath}.rows[${rowIndex}][${itemIndex}]`, legendOverrides),
        )
      }),
    }
  })

  return { sections, legendOverrides }
}

export function layoutItemWidth(item: LayoutItem): number {
  return item.width
}

function hangContribution(row: LayoutItem[]): number {
  let width = 0
  for (const item of row) {
    if (item.kind === 'key' && item.hang) width += item.width
  }
  return width
}

function rowOverlap(row: LayoutItem[]): number {
  let overlap = 0
  for (const item of row) {
    if (item.kind === 'key' && item.hang && item.shape === 'iso-enter') overlap += ISO_ENTER_OVERLAP
  }
  return overlap
}

export function visualRowWidths(rows: LayoutItem[][]): number[] {
  return rows.map((row, index) => {
    const raw = row.reduce((sum, item) => sum + layoutItemWidth(item), 0)
    const fromBelow = hangContribution(rows[index + 1] ?? [])
    return roundKeyUnit(raw - rowOverlap(row) + fromBelow)
  })
}

function dominantWidth(widths: readonly number[]): number {
  const counts = new Map<number, number>()
  for (const width of widths) {
    if (width <= WIDTH_EPSILON) continue
    counts.set(width, (counts.get(width) ?? 0) + 1)
  }

  let best = 0
  let bestCount = 0
  for (const [width, count] of counts) {
    if (count > bestCount || (count === bestCount && width > best)) {
      best = width
      bestCount = count
    }
  }
  return best
}

function shortCode(code: string): string {
  if (code.startsWith('Key') && code.length === 4) return code.slice(3)
  if (code.startsWith('Digit')) return code.slice(5)
  if (code.startsWith('Numpad')) return `N${code.slice(6)}`
  return code
}

function itemLabel(item: LayoutItem): string {
  if (item.kind === 'spacer') return `gap:${formatKeyUnit(item.width)}`
  if (item.kind === 'stack') {
    return `stack(${item.keys.map((key) => shortCode(key.code)).join('/')})`
  }
  const marker = item.hang ? 'h' : ''
  return `${shortCode(item.code)}:${formatKeyUnit(item.width)}${marker}`
}

export function renderAsciiPreview(sections: readonly IKeyboardSection[]): string {
  const lines: string[] = []
  for (const section of sections) {
    const widths = visualRowWidths(section.rows)
    const expected = dominantWidth(widths)
    const gap = section.gapLeft ? ` gapLeft=${formatKeyUnit(section.gapLeft)}` : ''
    lines.push(`section ${section.id}${gap} target=${formatKeyUnit(expected)}u`)
    section.rows.forEach((row, index) => {
      const width = widths[index] ?? 0
      const mismatch = expected > WIDTH_EPSILON && width > WIDTH_EPSILON && Math.abs(width - expected) > WIDTH_EPSILON
      const body = row.length ? row.map(itemLabel).join(' ') : '(empty)'
      lines.push(`  r${index} ${formatKeyUnit(width).padStart(6)}  ${body}${mismatch ? ' !' : ''}`)
    })
  }
  return lines.join('\n')
}

function collectKeys(sections: readonly IKeyboardSection[]): ILocatedKey[] {
  const found: ILocatedKey[] = []
  for (const section of sections) {
    section.rows.forEach((row, rowIndex) => {
      for (const item of row) {
        if (item.kind === 'key') found.push({ code: item.code, sectionId: section.id, rowIndex })
        if (item.kind === 'stack') {
          for (const key of item.keys) found.push({ code: key.code, sectionId: section.id, rowIndex })
        }
      }
    })
  }
  return found
}

function keyCodeWarnings(sections: readonly IKeyboardSection[]): IKeyCodeWarning[] {
  const warnings: IKeyCodeWarning[] = []
  const seen = new Map<string, ILocatedKey>()

  for (const key of collectKeys(sections)) {
    const suggestion = suggestKeyCode(key.code)
    if (!KNOWN_KEY_CODES.has(key.code)) {
      warnings.push({
        code: key.code,
        sectionId: key.sectionId,
        rowIndex: key.rowIndex,
        suggestion,
        message: suggestion
          ? `Unknown key code "${key.code}". Did you mean "${suggestion}"?`
          : `Unknown key code "${key.code}".`,
      })
    }

    const previous = seen.get(key.code)
    if (previous) {
      warnings.push({
        code: key.code,
        sectionId: key.sectionId,
        rowIndex: key.rowIndex,
        message: `Duplicate key code "${key.code}" (also in section "${previous.sectionId}" row ${previous.rowIndex}).`,
      })
    } else {
      seen.set(key.code, key)
    }
  }

  return warnings
}

export function validateKeyboardConfig(config: unknown): ILayoutValidationResult {
  try {
    const normalized = normalizeKeyboardConfig(config)
    const errors: string[] = []
    const rows: ILayoutRowReport[] = []

    for (const section of normalized.sections) {
      const widths = visualRowWidths(section.rows)
      const expected = dominantWidth(widths)
      section.rows.forEach((row, index) => {
        const width = widths[index] ?? 0
        if (width <= WIDTH_EPSILON) return
        const delta = roundKeyUnit(width - expected)
        rows.push({ sectionId: section.id, rowIndex: index, width, expected, delta })
        if (Math.abs(delta) > WIDTH_EPSILON) {
          errors.push(
            `Section "${section.id}" row ${index} is ${formatKeyUnit(width)}u, expected ${formatKeyUnit(expected)}u (diff ${formatSignedUnit(delta)}u).`,
          )
        }
        for (const item of row) {
          if (item.kind === 'key' && item.hang && index === 0) {
            errors.push(`Section "${section.id}" row 0 contains hanging key "${item.code}", which needs a row above it.`)
          }
        }
      })
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings: keyCodeWarnings(normalized.sections),
      rows,
      preview: renderAsciiPreview(normalized.sections),
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid keyboard config'
    return { valid: false, errors: [message], warnings: [], rows: [], preview: '' }
  }
}
