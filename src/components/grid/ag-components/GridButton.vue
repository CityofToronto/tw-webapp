<template>
  <v-icon @click.stop="clickHandler">
    {{ iconName }}
  </v-icon>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { ICellRendererParams } from '@ag-grid-enterprise/all-modules';
import { GridButtonRendererParams } from '@/types/grid';

@Component({})
export default class GridButton extends Vue {
  params!: GridButtonRendererParams & ICellRendererParams;

  clickHandler() {
    if (this.params.clickFunction) {
      // Handle the custom click
      this.params.clickFunction(this.params);
    }
  }

  get iconName() {
    return typeof this.params.icon === 'function'
      ? this.params.icon(this.params)
      : this.params.icon;
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
