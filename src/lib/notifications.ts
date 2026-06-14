import { writable } from 'svelte/store';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

let nextId = 0;

function createToastStore() {
  const { subscribe, update } = writable<Toast[]>([]);

  function add(message: string, type: ToastType = 'info', timeout = 3000) {
    const id = nextId++;
    update((toasts) => [...toasts, { id, message, type }]);
    setTimeout(() => remove(id), timeout);
  }

  function remove(id: number) {
    update((toasts) => toasts.filter((t) => t.id !== id));
  }

  return {
    subscribe,
    info: (msg: string) => add(msg, 'info'),
    success: (msg: string) => add(msg, 'success'),
    warning: (msg: string) => add(msg, 'warning'),
    error: (msg: string, timeout = 5000) => add(msg, 'error', timeout),
    remove,
  };
}

export const toasts = createToastStore();
