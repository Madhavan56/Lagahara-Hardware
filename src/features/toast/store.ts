import { create } from 'zustand'

export type ToastTone = 'success' | 'info' | 'error'

export type Toast = {
  id: number
  title: string
  description?: string
  tone: ToastTone
}

type ToastState = {
  toasts: Toast[]
  show: (toast: Omit<Toast, 'id' | 'tone'> & { tone?: ToastTone }) => void
  dismiss: (id: number) => void
}

const AUTO_DISMISS_MS = 3500
const MAX_VISIBLE = 3
let nextId = 1

/** Transient, non-blocking notifications. Purely presentational: nothing waits on a toast. */
export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  show: ({ tone = 'success', ...toast }) => {
    const id = nextId++
    set((state) => ({ toasts: [...state.toasts, { id, tone, ...toast }].slice(-MAX_VISIBLE) }))
    window.setTimeout(() => get().dismiss(id), AUTO_DISMISS_MS)
  },
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
}))

/** Shorthand for components that only need to raise a toast. */
export const showToast = (toast: Parameters<ToastState['show']>[0]) => useToastStore.getState().show(toast)
