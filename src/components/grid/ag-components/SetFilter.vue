<template>
  <v-sheet>
    <v-text-field
      v-model="search"
      class="px-3"
      label="Search..."
      hide-details
      clearable
    />
    <v-checkbox
      v-model="checked"
      label="(Select All)"
      hide-details
      class="px-1 pb-2 shrink"
      @change="onCheckboxChanged"
    />
    <v-divider />
    <v-checkbox
      v-for="item in params.values"
      :key="item"
      v-model="selectedItems"
      class="shrink px-1"
      :label="item"
      :value="item"
      hide-details
    />
  </v-sheet>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import { IDoesFilterPassParams, RowNode } from 'ag-grid-community';
import { SetFilterParams } from '@/types/grid';

@Component({})
export default class SetFilter extends Vue {
  params!: SetFilterParams;

  search: string = '';

  checked: boolean = true;

  valueGetter!: (rowNode: RowNode) => any;

  selectedItems: any[] = [];

  onCheckboxChanged(event: boolean) {
    this.selectedItems = event ? this.params.values : [];
  }

  isFilterActive(): boolean {
    return !!this.selectedItems.length;
  }

  // TODO If you select a higher level have all children filtered to
  doesFilterPass(params: IDoesFilterPassParams): boolean {
    return this.selectedItems.includes(params.data);
  }

  getModel() {
    return {
      values: this.selectedItems,
      filterType: 'array',
    };
  }

  setModel(model: any) {
    if (model) {
      this.selectedItems = model.value;
    }
  }

  @Watch('selectedItems')
  onSelectedChanged(newValue: number[], oldValue: number[]) {
    if (newValue !== oldValue) {
      this.params.filterChangedCallback();
    }
  }

  created() {
    this.valueGetter = this.params.valueGetter;
    this.selectedItems = this.params.values;
  }
}
</script>

<style>
.shrink {
  /* transform: scale(0.875); */
  /* transform-origin: left; */
  margin-top: 2px !important;
}
</style>
