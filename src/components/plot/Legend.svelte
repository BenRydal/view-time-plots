<script lang="ts">
  import type { Unit, PlayMethod } from '../../lib/types';
  import { COLOR_MAP } from '../../lib/constants';
  import { activeMethods, ALL_METHODS } from '../../lib/stores';

  interface Props {
    units: Unit[];
  }

  let { units }: Props = $props();

  const METHOD_GROUPS: { label: string; methods: PlayMethod[] }[] = [
    { label: 'Reverse', methods: ['jrev', 'frev', 'srev'] },
    { label: 'Neutral', methods: ['still'] },
    { label: 'Forward', methods: ['sfwd', 'play', 'ffwd', 'jfwd'] },
  ];

  let methodCounts = $derived(() => {
    const counts: Partial<Record<PlayMethod, number>> = {};
    for (const u of units) {
      counts[u.playMethod] = (counts[u.playMethod] || 0) + 1;
    }
    return counts;
  });

  let allActive = $derived($activeMethods.size === ALL_METHODS.length);

  // Reset filters when units change
  $effect(() => {
    units; // track dependency
    activeMethods.set(new Set(ALL_METHODS));
  });

  function toggle(method: PlayMethod) {
    activeMethods.update((s) => {
      const next = new Set(s);
      if (next.has(method)) {
        next.delete(method);
      } else {
        next.add(method);
      }
      return next;
    });
  }

  function showAll() {
    activeMethods.set(new Set(ALL_METHODS));
  }

  function hideAll() {
    activeMethods.set(new Set());
  }
</script>

<div class="card bg-base-100 shadow-sm border border-base-300">
  <div class="card-body p-3 gap-1">
    <div class="flex items-center justify-between">
      <h3 class="text-xs font-semibold text-base-content/60 uppercase tracking-wider">Methods</h3>
      <button
        class="text-[10px] font-medium text-primary hover:text-primary-focus cursor-pointer"
        onclick={() => allActive ? hideAll() : showAll()}
      >
        {allActive ? 'Hide All' : 'Show All'}
      </button>
    </div>
    {#each METHOD_GROUPS as group}
      {@const items = group.methods.filter((m) => methodCounts()[m])}
      {#if items.length > 0}
        <div>
          <div class="text-[10px] font-medium text-base-content/40 uppercase tracking-wider mb-1">{group.label}</div>
          <div class="grid grid-cols-2 gap-x-1 gap-y-1">
            {#each items as method}
              {@const active = $activeMethods.has(method)}
              <button
                class="flex items-center gap-1.5 text-sm text-base-content cursor-pointer rounded px-1.5 py-1 hover:bg-base-200 transition-opacity {active ? 'opacity-100' : 'opacity-40'}"
                onclick={() => toggle(method)}
              >
                <div
                  class="w-4 h-4 rounded-sm shrink-0 border border-base-300"
                  style="background-color: {active ? COLOR_MAP[method] : '#d1d5db'};"
                ></div>
                <span class="truncate">{method}</span>
                <span class="text-base-content/40 tabular-nums text-[10px]">(x{methodCounts()[method]})</span>
              </button>
            {/each}
          </div>
        </div>
      {/if}
    {/each}
  </div>
</div>
