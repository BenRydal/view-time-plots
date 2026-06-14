<script lang="ts">
  import { axisBottom, axisLeft } from 'd3-axis';
  import { select } from 'd3-selection';
  import type { ScaleLinear } from 'd3-scale';
  import { formatTime } from '../../lib/format';

  interface Props {
    xScale: ScaleLinear<number, number>;
    yScale: ScaleLinear<number, number>;
    height: number;
    analystLength: number;
  }

  let { xScale, yScale, height, analystLength }: Props = $props();

  function renderXAxis(node: SVGGElement) {
    $effect(() => {
      const axis = axisBottom(xScale)
        .ticks(5)
        .tickFormat((d) => formatTime(d as number));
      select(node).call(axis);
    });
  }

  function renderYAxis(node: SVGGElement) {
    $effect(() => {
      const tickInterval = 300;
      const tickValues = Array.from(
        { length: Math.floor(analystLength / tickInterval) + 1 },
        (_, i) => i * tickInterval
      );
      const axis = axisLeft(yScale)
        .tickValues(tickValues)
        .tickFormat((d) => formatTime(d as number));
      select(node).call(axis);
    });
  }
</script>

<g use:renderXAxis></g>
<g use:renderYAxis></g>
