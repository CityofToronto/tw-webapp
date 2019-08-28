<template>
  <span> {{ treeValue }}</span>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { TreeRendererParams } from '@/types/grid';

@Component({})
export default class TreeRenderer extends Vue {
  params!: TreeRendererParams;

  get treeValue(): string {
    if (!Array.isArray(this.params.value)) {
      return this.params.treeMap.get(this.params.value) || 'unknown';
    }
    const names = this.params.value
      .map((val: number): string => this.params.treeMap.get(val) || 'unknown');

    return names.join(', ');
  }
}
</script>
