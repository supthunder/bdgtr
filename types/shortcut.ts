export interface Shortcut {
  id: string
  name: string
  url: string
  category: string
  emoji: string
  createdAt: string
  updatedAt: string
}

export interface ShortcutCreate {
  name: string
  url: string
  category: string
  emoji: string
} 