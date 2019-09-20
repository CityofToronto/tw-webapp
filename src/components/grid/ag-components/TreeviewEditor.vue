<template>
  <v-sheet>
    <v-text-field
      v-model="search"
      class="px-3 pt-3"
      label="Search..."
      hide-details
      clearable
    />
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
import { Vue, Component } from 'vue-property-decorator';
import { TreeEditorParams } from '@/types/grid';

@Component({})
export default class TreeSelectEditor extends Vue {
  params!: TreeEditorParams;

  selectedItems: number[] = [];

  popup: boolean = true;

  search: string = '';

  created() {
    this.selectedItems.push(this.params.value);
  }

  isPopup() {
    return this.popup;
  }

  /**
   * Called after cell is finished editing, return the value to send
   */
  getValue() {
    return this.selectedItems[0];
  }
}
</script>

<style scoped>
.grid-popup {
  background-color: white;
}
</style>
