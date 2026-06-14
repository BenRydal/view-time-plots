<script lang="ts">
  interface Props {
    y: number;
    width: number;
  }

  let { y, width }: Props = $props();
</script>

<line
  x1={0}
  y1={y}
  x2={width}
  y2={y}
  stroke="#00cc00"
  stroke-width="2"
  stroke-dasharray="8,6"
  pointer-events="none"
/>
