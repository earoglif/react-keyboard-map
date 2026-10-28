import type { Meta, StoryObj } from '@storybook/react-vite'
import { KeyboardMap } from './KeyboardMap.tsx'

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
  },
  argTypes: {
    formFactor: { control: 'select', options: ['60%', 'tkl', 'full'] },
    standard: { control: 'select', options: ['ansi', 'iso'] },
    platform: { control: 'select', options: ['auto', 'win', 'mac'] },
    locale: { control: 'select', options: ['en', 'ru'] },
    secondaryLocale: { control: 'select', options: ['en', 'ru'] },
    theme: { control: 'inline-radio', options: ['light', 'dark'] },
    listenKeyboard: { control: 'boolean' },
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
} satisfies Meta<typeof KeyboardMap>

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
