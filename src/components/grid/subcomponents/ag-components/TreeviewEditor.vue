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

@Component({})
export default class TreeSelectEditor extends Vue {
  selectedItems: number[] = [];

  popup: boolean = true;

  search: string = '';

  isPopup() {
    return this.popup;
  }

  /**
   * Called after cell is finished editing, return the value to send
   */
  getValue() {
    return this.selectedItems;
  }
}

</script>

<style scoped>
.grid-popup {
  background-color: white;
}
</style>
