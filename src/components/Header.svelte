<script lang="ts">
  import { units, videoSource } from '../lib/stores';
  import { EXAMPLE_DATASETS } from '../lib/constants';
  import { loadCSVFromPath, parseCSV } from '../lib/csv-parser';
  import { toasts } from '../lib/notifications';
  import { Upload, Video, Youtube, ChevronDown } from 'lucide-svelte';

  let selectedExample = $state(0);
  let youtubeUrlInput = $state('');
  let examplesOpen = $state(false);
  let importOpen = $state(false);

  function closeAll() {
    examplesOpen = false;
    importOpen = false;
  }

  async function loadExample(idx: number) {
    selectedExample = idx;
    closeAll();
    const example = EXAMPLE_DATASETS[idx];
    try {
      units.set(await loadCSVFromPath(example.csvPath));
      videoSource.set({ type: 'youtube', id: example.youtubeId });
      toasts.success(`Loaded ${example.label}`);
    } catch {
      toasts.error('Failed to load dataset');
    }
  }

  function handleCSVUpload(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = parseCSV(reader.result as string);
        if (parsed.length === 0) {
          toasts.error('No valid data found in CSV');
          return;
        }
        units.set(parsed);
        toasts.success(`Loaded ${parsed.length} units from ${file.name}`);
        closeAll();
      } catch {
        toasts.error('Failed to parse CSV file');
      }
    };
    reader.readAsText(file);
  }

  function handleVideoUpload(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    videoSource.set({ type: 'local', url: URL.createObjectURL(file) });
    toasts.success(`Loaded video: ${file.name}`);
    closeAll();
  }

  function handleYoutubeUrl() {
    const input = youtubeUrlInput.trim();
    if (!input) return;
    const match =
      input.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/) ||
      input.match(/^([a-zA-Z0-9_-]{11})$/);
    if (match) {
      videoSource.set({ type: 'youtube', id: match[1] });
      toasts.success('YouTube video loaded');
      youtubeUrlInput = '';
      closeAll();
    } else {
      toasts.error('Invalid YouTube URL or ID');
    }
  }

  function handleWindowClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (!target.closest('.dropdown-examples') && examplesOpen) examplesOpen = false;
    if (!target.closest('.dropdown-import') && importOpen) importOpen = false;
  }
</script>

<svelte:window onclick={handleWindowClick} />

<div class="navbar bg-base-200 border-b border-base-300 px-4 gap-2 shrink-0">
  <div class="navbar-start">
    <span class="font-bold text-lg tracking-tight text-base-content">View Time Plots</span>
  </div>

  <div class="navbar-end gap-2">
    <!-- Dataset selector -->
    <div class="relative dropdown-examples">
      <button
        class="flex items-center rounded border border-gray-300 px-3 py-1.5 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer max-w-[14rem]"
        onclick={() => { importOpen = false; examplesOpen = !examplesOpen; }}
      >
        <span class="truncate">{EXAMPLE_DATASETS[selectedExample].label}</span>
        <ChevronDown size={12} class="ml-2 flex-shrink-0" />
      </button>
      {#if examplesOpen}
        <ul class="absolute right-0 top-full mt-1 menu rounded-box z-[60] w-56 p-2 shadow bg-base-100 border border-gray-200 max-h-[60vh] overflow-y-auto">
          {#each EXAMPLE_DATASETS as dataset, i}
            <li>
              <button
                class="text-sm w-full {selectedExample === i ? 'active' : ''}"
                onclick={() => loadExample(i)}
              >
                {dataset.label}
              </button>
            </li>
          {/each}
        </ul>
      {/if}
    </div>

    <!-- Import dropdown -->
    <div class="relative dropdown-import">
      <button
        class="flex items-center rounded border border-gray-300 px-3 py-1.5 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
        onclick={() => { examplesOpen = false; importOpen = !importOpen; }}
      >
        <Upload size={14} class="mr-1.5 flex-shrink-0" />
        <span>Import</span>
        <ChevronDown size={12} class="ml-2 flex-shrink-0" />
      </button>
      {#if importOpen}
        <ul class="absolute right-0 top-full mt-1 menu rounded-box z-[60] w-72 p-2 shadow bg-base-100 border border-gray-200">
          <li>
            <label class="flex items-center gap-2 text-sm cursor-pointer">
              <Upload size={16} class="flex-shrink-0" />
              <span>Upload CSV</span>
              <input type="file" accept=".csv" class="hidden" onchange={handleCSVUpload} />
            </label>
          </li>
          <li>
            <label class="flex items-center gap-2 text-sm cursor-pointer">
              <Video size={16} class="flex-shrink-0" />
              <span>Upload Video</span>
              <input type="file" accept="video/*" class="hidden" onchange={handleVideoUpload} />
            </label>
          </li>
          <div class="divider my-0 px-2"></div>
          <li class="px-2 py-1.5">
            <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
            <div class="flex items-center gap-2 p-0 hover:bg-transparent active:!bg-transparent" onclick={(e: MouseEvent) => e.stopPropagation()}>
              <Youtube size={16} class="flex-shrink-0 text-gray-500" />
              <input
                type="text"
                placeholder="YouTube URL or ID"
                class="input input-bordered input-sm flex-1 min-w-0"
                bind:value={youtubeUrlInput}
                onkeydown={(e: KeyboardEvent) => e.key === 'Enter' && handleYoutubeUrl()}
              />
              <button
                class="btn btn-sm btn-primary"
                onclick={handleYoutubeUrl}
              >
                Load
              </button>
            </div>
          </li>
        </ul>
      {/if}
    </div>

  </div>
</div>
