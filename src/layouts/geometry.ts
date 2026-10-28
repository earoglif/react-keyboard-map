import type { KeyCode, KeyShape } from '../types/keyboard.types.ts'

export type { KeyShape }

export interface ILayoutKey {
  kind: 'key'
  code: KeyCode
  width: number
  height: number
  shape: KeyShape
  hang: boolean
}

export interface ILayoutSpacer {
  kind: 'spacer'
  width: number
}

export interface ILayoutStack {
  kind: 'stack'
  width: number
  keys: [ILayoutKey, ILayoutKey]
}

export type LayoutItem = ILayoutKey | ILayoutSpacer | ILayoutStack

export interface IKeyboardSection {
  id: string
  gapLeft?: number
  rows: LayoutItem[][]
}

export function key(code: KeyCode, width = 1, height = 1): ILayoutKey {
  return { kind: 'key', code, width, height, shape: 'rect', hang: false }
}

export function hangKey(code: KeyCode, width = 1, shape: KeyShape = 'rect'): ILayoutKey {
  return { kind: 'key', code, width, height: 2, shape, hang: true }
}

export function spacer(width: number): ILayoutSpacer {
  return { kind: 'spacer', width }
}

export function keys(codes: readonly KeyCode[]): ILayoutKey[] {
  return codes.map((code) => key(code))
}
