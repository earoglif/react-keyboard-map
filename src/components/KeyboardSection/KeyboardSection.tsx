import type { CSSProperties } from 'react'
import type { IKeyboardSection, LayoutItem } from '../../layouts/geometry.ts'
import type { LegendResolver } from '../../locales/index.ts'
import styles from '../../styles/keyboard.module.css'
import type {
  IKeyAnnotation,
  IKeyZoneStyle,
  IKeyboardMapProps,
  KeyCode,
} from '../../types/keyboard.types.ts'
import { KeyCap } from '../KeyCap/KeyCap.tsx'

interface ISpacerStyle extends CSSProperties {
  '--key-u'?: number
}

interface IKeyboardSectionProps {
  section: IKeyboardSection
  isPressed: (code: KeyCode) => boolean
  legendFor: LegendResolver
  secondaryLegendFor?: LegendResolver
  annotations?: Record<KeyCode, IKeyAnnotation>
  zones?: Record<string, IKeyZoneStyle>
  renderKeyContent?: IKeyboardMapProps['renderKeyContent']
}

function Spacer({ width }: { width: number }) {
  const style: ISpacerStyle = { '--key-u': width }
  return <span className={styles.spacer} style={style} />
}

interface IKeyItemProps {
  item: Extract<LayoutItem, { kind: 'key' }>
  isPressed: (code: KeyCode) => boolean
  legendFor: LegendResolver
  secondaryLegendFor?: LegendResolver
  annotations?: Record<KeyCode, IKeyAnnotation>
  zones?: Record<string, IKeyZoneStyle>
  renderKeyContent?: IKeyboardMapProps['renderKeyContent']
}

function KeyItem({
  item,
  isPressed,
  legendFor,
  secondaryLegendFor,
  annotations,
  zones,
  renderKeyContent,
}: IKeyItemProps) {
  const annotation = annotations?.[item.code]
  const zone = annotation?.zone ? zones?.[annotation.zone] : undefined

  return (
    <KeyCap
      code={item.code}
      legend={legendFor(item.code)}
      secondaryLegend={secondaryLegendFor?.(item.code)}
      width={item.width}
      height={item.height}
      shape={item.shape}
      hang={item.hang}
      isActive={isPressed(item.code)}
      annotation={annotation}
      zoneClassName={zone?.className}
      backgroundColor={zone?.backgroundColor ?? annotation?.color}
      borderColor={zone?.borderColor}
      textColor={zone?.textColor}
      renderContent={renderKeyContent}
    />
  )
}

export function KeyboardSection({
  section,
  isPressed,
  legendFor,
  secondaryLegendFor,
  annotations,
  zones,
  renderKeyContent,
}: IKeyboardSectionProps) {
  return (
    <div className={styles.section} data-section={section.id}>
      {section.rows.map((row, rowIndex) => (
        <div className={styles.row} key={`${section.id}-${rowIndex}`}>
          {row.map((item, itemIndex) =>
            item.kind === 'spacer' ? (
              <Spacer key={`${section.id}-${rowIndex}-gap-${itemIndex}`} width={item.width} />
            ) : (
              <KeyItem
                key={item.code}
                item={item}
                isPressed={isPressed}
                legendFor={legendFor}
                secondaryLegendFor={secondaryLegendFor}
                annotations={annotations}
                zones={zones}
                renderKeyContent={renderKeyContent}
              />
            ),
          )}
        </div>
      ))}
    </div>
  )
}
