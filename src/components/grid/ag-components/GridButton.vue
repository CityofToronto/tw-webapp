<template>
  <v-icon @click.stop="clickHandler">
    {{ iconName }}
  </v-icon>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import { ICellRendererParams } from 'ag-grid-community';
import { MergeContext, GridButtonRendererParams } from '@/types/grid';

@Component({})
export default class GridButton extends Vue {
  params!: GridButtonRendererParams & ICellRendererParams;

  clickHandler() {
    if (this.params.clickFunction) {
      this.params.clickFunction(this.params);
    }
  }

  get iconName() {
    if (typeof this.params.icon === 'function') {
      return this.params.icon(this.params);
    }
    return this.params.icon;
  }
}
</script>

<style scoped>
.v-icon {
  font-size: 18px !important;
  color: #bdbdbd !important;
}

.v-icon:hover {
  color: #616161 !important;
}
</style>
