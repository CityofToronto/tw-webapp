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
      class="px-1 pb-2"
      @change="onCheckboxChanged"
    />
    <v-divider />
    <v-treeview
      v-model="selectedItems"
      class="pb-2"
      dense
      :search="search"
      :items="params.treeData"
      selection-type="independent"
      selectable
    />
  </v-sheet>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import { IDoesFilterPassParams, RowNode } from 'ag-grid-community';
import { TreeFilterParams } from '@/types/grid';

@Component({})
export default class TreeviewFilter extends Vue {
  params!: TreeFilterParams;

  search: string = '';

  checked: boolean = true;

  valueGetter!: (rowNode: RowNode) => any;

  selectedItems: number[] = [];

  onCheckboxChanged(event: boolean) {
    this.selectedItems = event ? this.params.treeIds : [];
  }

  isFilterActive(): boolean {
    return !!(this.selectedItems.length);
  };

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
    this.selectedItems = this.params.treeIds;
  }
}
</script>
