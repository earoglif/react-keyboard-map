import type { Meta, StoryObj } from '@storybook/react-vite'
import { validateKeyboardConfig } from '../../layouts/config.ts'
import type { IKeyboardConfig, IKeyboardMapProps } from '../../types/keyboard.types.ts'
import { KeyboardMap } from './KeyboardMap.tsx'

interface IKeyboardMapStoryArgs extends IKeyboardMapProps {
  configJson: string
}

function readConfigJson(configJson: string): { config?: IKeyboardConfig; error?: string } {
  const source = configJson.trim()
  if (!source) return {}

  let parsed: unknown
  try {
    parsed = JSON.parse(source)
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Invalid JSON' }
  }

  const validation = validateKeyboardConfig(parsed)
  if (!validation.valid) return { error: validation.errors.join('\n') }
  return { config: parsed as IKeyboardConfig }
}

const meta = {
  title: 'KeyboardMap',
  component: KeyboardMap,
  args: {
    formFactor: 'full',
    standard: 'ansi',
    platform: 'auto',
    locale: 'en',
    theme: 'light',
    listenKeyboard: true,
    configJson: '',
  },
  argTypes: {
    config: { control: false, table: { disable: true } },
    configJson: {
      name: 'config',
      control: 'text',
      description: 'IKeyboardConfig as JSON. Leave empty to use formFactor and standard.',
    },
    formFactor: { control: 'select', options: ['60%', 'tkl', 'full'] },
    standard: { control: 'select', options: ['ansi', 'iso'] },
    platform: { control: 'select', options: ['auto', 'win', 'mac'] },
    locale: { control: 'select', options: ['en', 'ru'] },
    secondaryLocale: { control: 'select', options: ['en', 'ru'] },
    theme: { control: 'inline-radio', options: ['light', 'dark'] },
    listenKeyboard: { control: 'boolean' },
  },
  render: ({ configJson, ...args }) => {
    const { config, error } = readConfigJson(configJson)
    return (
      <>
        {error ? (
          <p role="alert" style={{ color: '#dc2626', font: '13px/1.4 ui-monospace, monospace', margin: '0 0 12px', whiteSpace: 'pre-wrap' }}>
            {error}
          </p>
        ) : null}
        <KeyboardMap {...args} config={config} />
      </>
    )
  },
  decorators: [
    (Story, context) => (
      <div
        style={{
          padding: 24,
          borderRadius: 16,
          background: context.args.theme === 'dark' ? '#0c0a09' : '#fafaf9',
        }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<IKeyboardMapStoryArgs>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const RussianWithEnglish: Story = {
  args: {
    locale: 'ru',
    secondaryLocale: 'en',
  },
}

export const MacIso: Story = {
  args: {
    standard: 'iso',
    platform: 'mac',
    formFactor: 'tkl',
  },
}

export const SixtyPercent: Story = {
  args: {
    formFactor: '60%',
  },
}

export const Dark: Story = {
  args: {
    theme: 'dark',
    locale: 'ru',
    platform: 'win',
  },
}

export const Hotkeys: Story = {
  args: {
    listenKeyboard: false,
    formFactor: 'tkl',
    activeKeys: ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ShiftLeft', 'Space'],
    zones: {
      movement: {
        backgroundColor: '#dbeafe',
        borderColor: '#60a5fa',
        textColor: '#1e3a8a',
      },
      action: {
        backgroundColor: '#fef3c7',
        borderColor: '#f59e0b',
        textColor: '#78350f',
      },
    },
    annotations: {
      KeyW: { badge: '↑', zone: 'movement', tooltip: 'Forward' },
      KeyA: { badge: '←', zone: 'movement', tooltip: 'Left' },
      KeyS: { badge: '↓', zone: 'movement', tooltip: 'Back' },
      KeyD: { badge: '→', zone: 'movement', tooltip: 'Right' },
      ShiftLeft: { badge: 'Run', zone: 'action', tooltip: 'Hold to sprint' },
      Space: { badge: 'Jump', tooltip: 'Jump' },
    },
  },
}

export const CustomKeyContent: Story = {
  args: {
    listenKeyboard: false,
    formFactor: '60%',
    activeKeys: ['KeyF', 'KeyJ'],
    renderKeyContent: (context) => (
      <span>
        {context.code === 'KeyF' || context.code === 'KeyJ'
          ? context.isActive
            ? '●'
            : '○'
          : context.legend.primary}
      </span>
    ),
  },
}
