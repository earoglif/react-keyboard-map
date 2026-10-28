import { memo, type CSSProperties, type ReactNode } from 'react'
import type { KeyShape } from '../../layouts/geometry.ts'
import type { IKeyAnnotation, IKeyLegend, IKeyRenderContext, KeyCode } from '../../types/keyboard.types.ts'
import styles from '../../styles/keyboard.module.css'
import { KeyLegendIcon } from './KeyLegendIcon.tsx'

interface IKeyCapStyle extends CSSProperties {
  '--key-u'?: number
  '--key-h'?: number
  '--key-bg'?: string
  '--key-border'?: string
  '--key-color'?: string
}

interface IKeyCapProps {
  code: KeyCode
  legend: IKeyLegend
  secondaryLegend?: IKeyLegend
  width: number
  height: number
  shape: KeyShape
  hang: boolean
  isActive: boolean
  annotation?: IKeyAnnotation
  zoneClassName?: string
  backgroundColor?: string
  borderColor?: string
  textColor?: string
  renderContent?: (context: IKeyRenderContext) => ReactNode
}

function joinClasses(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

function accessibleName(code: string, legend: IKeyLegend, isActive: boolean): string {
  const name = legend.primary || (code === 'Space' ? 'Space' : code)
  return isActive ? `${name}, pressed` : name
}

export const KeyCap = memo(function KeyCap({
  code,
  legend,
  secondaryLegend,
  width,
  height,
  shape,
  hang,
  isActive,
  annotation,
  zoneClassName,
  backgroundColor,
  borderColor,
  textColor,
  renderContent,
}: IKeyCapProps) {
  const secondaryText =
    secondaryLegend && secondaryLegend.primary !== legend.primary ? secondaryLegend.primary : undefined
  const style: IKeyCapStyle = {
    '--key-u': width,
    '--key-h': height,
    '--key-bg': backgroundColor,
    '--key-border': borderColor,
    '--key-color': textColor,
  }
  const context: IKeyRenderContext = { code, legend, isActive, annotation }

  return (
    <div
      className={joinClasses(
        styles.cap,
        isActive && styles.capActive,
        hang && styles.hang,
        shape === 'iso-enter' && styles.isoEnter,
        annotation?.disabled && styles.capDisabled,
        (legend.shift || secondaryText) && styles.hasCorner,
        zoneClassName,
      )}
      style={style}
      data-key-code={code}
      data-active={isActive ? 'true' : 'false'}
      aria-label={accessibleName(code, legend, isActive)}
    >
      {renderContent ? (
        renderContent(context)
      ) : (
        <>
          {legend.shift ? <span className={styles.shift}>{legend.shift}</span> : null}
          {secondaryText ? <span className={styles.secondary}>{secondaryText}</span> : null}
          {legend.icon ? (
            <KeyLegendIcon name={legend.icon} label={legend.primary} />
          ) : legend.primary ? (
            <span className={styles.primary}>{legend.primary}</span>
          ) : null}
          {annotation?.badge ? <span className={styles.badge}>{annotation.badge}</span> : null}
          {annotation?.tooltip ? <span className={styles.tooltip}>{annotation.tooltip}</span> : null}
        </>
      )}
    </div>
  )
})
