import type { LayoutItem } from './geometry.ts'
import { key } from './geometry.ts'
import { letterKeys, numberRow, spaceRow } from './rows.ts'

export function ansiAlphaRows(compact: boolean): LayoutItem[][] {
  return [
    numberRow(compact),
    [
      key('Tab', 1.5),
      ...letterKeys('QWERTYUIOP'),
      key('BracketLeft'),
      key('BracketRight'),
      key('Backslash', 1.5),
    ],
    [
      key('CapsLock', 1.75),
      ...letterKeys('ASDFGHJKL'),
      key('Semicolon'),
      key('Quote'),
      key('Enter', 2.25),
    ],
    [
      key('ShiftLeft', 2.25),
      ...letterKeys('ZXCVBNM'),
      key('Comma'),
      key('Period'),
      key('Slash'),
      key('ShiftRight', 2.75),
    ],
    spaceRow(compact),
  ]
}
