<script lang="ts">
  import Header from './components/Header.svelte';
  import MainLayout from './components/MainLayout.svelte';
  import ToastContainer from './components/ToastContainer.svelte';
  import { units, videoSource } from './lib/stores';
  import { loadCSVFromPath } from './lib/csv-parser';
  import { EXAMPLE_DATASETS } from './lib/constants';
  import { toasts } from './lib/notifications';
  import { onMount } from 'svelte';

  onMount(async () => {
    const example = EXAMPLE_DATASETS[0];
    try {
      units.set(await loadCSVFromPath(example.csvPath));
      videoSource.set({ type: 'youtube', id: example.youtubeId });
    } catch {
      toasts.error('Failed to load default dataset');
    }
  });
</script>

<div data-theme="lhll" class="flex flex-col h-screen bg-base-100 text-base-content">
  <Header />
  <MainLayout />
  <ToastContainer />
</div>
