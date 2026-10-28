import type { KeyboardFormFactor, KeyboardStandard } from '../types/keyboard.types.ts'
import { ansiAlphaRows } from './ansi.ts'
import type { IKeyboardSection } from './geometry.ts'
import { isoAlphaRows } from './iso.ts'
import { functionRow, navSection, numpadSection } from './rows.ts'

export function buildKeyboardSections(
  formFactor: KeyboardFormFactor,
  standard: KeyboardStandard,
): IKeyboardSection[] {
  const compact = formFactor === '60%'
  const alphaRows = standard === 'iso' ? isoAlphaRows(compact) : ansiAlphaRows(compact)
  const mainRows = compact ? alphaRows : [functionRow(), ...alphaRows]
  const sections: IKeyboardSection[] = [{ id: 'main', rows: mainRows }]

  if (!compact) sections.push(navSection())
  if (formFactor === 'full') sections.push(numpadSection())

  return sections
}

export type { IKeyboardSection, ILayoutKey, ILayoutSpacer, ILayoutStack, KeyShape, LayoutItem } from './geometry.ts'
