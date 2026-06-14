<script lang="ts">
  import { toasts, type ToastType } from '../lib/notifications';
  import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from 'lucide-svelte';

  const TOAST_CONFIG: Record<ToastType, { class: string; icon: typeof Info }> = {
    info: { class: 'alert-info', icon: Info },
    success: { class: 'alert-success', icon: CircleCheck },
    warning: { class: 'alert-warning', icon: TriangleAlert },
    error: { class: 'alert-error', icon: CircleAlert },
  };
</script>

<div class="toast toast-end toast-top z-[100]">
  {#each $toasts as toast (toast.id)}
    {@const config = TOAST_CONFIG[toast.type]}
    <div class="alert {config.class} shadow-lg gap-2 min-w-64">
      <config.icon size={18} />
      <span class="text-sm">{toast.message}</span>
      <button class="btn btn-ghost btn-xs" onclick={() => toasts.remove(toast.id)}>
        <X size={14} />
      </button>
    </div>
  {/each}
</div>
