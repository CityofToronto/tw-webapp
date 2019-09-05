<template>
  <v-icon @click.stop="clickHandler">
    {{ params.icon }}
  </v-icon>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { ICellRendererParams } from 'ag-grid-community';

interface RendererParams extends ICellRendererParams {
  clickFunction(params: ICellRendererParams): void;
}

@Component({})
export default class GridButton extends Vue {
  params!: RendererParams;

  clickHandler() {
    this.params.clickFunction(this.params);
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
