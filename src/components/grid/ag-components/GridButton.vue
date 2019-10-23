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
      // Handle the custom click
      this.params.clickFunction(this.params);
      // Ag-Grid doesn't refresh the cell if it based on another value, so force it
      this.params.api.refreshCells({
        rowNodes: [this.params.node],
        force: true,
        columns: [this.params.column.getColId()],
      });
      // // Deselect the row for a bit better of a user experience
      // this.params.api.deselectAll();
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
