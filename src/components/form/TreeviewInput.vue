<template>
  <v-sheet class="grey lighten-4">
    <v-sheet class="primary lighten-2 pa-4">
      <p class="text-left white--text subtitle-2">
        {{ label }}
      </p>
      <v-text-field
        v-model="searchModel"
        :label="'Search ' + label"
        flat
        solo
        hide-details
        clearable
      />
    </v-sheet>
    <v-treeview
      v-model="selection"
      return-object
      class="px-4"
      :search="searchModel"
      :items="items"
      selectable
    />
  </v-sheet>
</template>

<script lang="ts">
import {
  Vue, Component, Prop, PropSync,
} from 'vue-property-decorator';

interface TreeItem {
  id: number;
  name: string;
}

@Component({})
export default class TreeViewInput extends Vue {
  @Prop(String) readonly label!: string;

  @Prop(Array) readonly items!: {
    id: number;
    name: string;
    children: [];
  }[]

  @PropSync('inputValue', { type: Array }) syncedValue!: [];

  searchModel: string = '';

  selection: TreeItem[] = [];
}
</script>

<style>

</style>
