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
      v-model="selectedItems"
      class="px-4"
      :search="searchModel"
      :items="params.treeData"
      selection-type="independent"
      selectable
    />
  </v-sheet>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';

interface TreeItem {
  id: number;
  name: string;
}

@Component({})
export default class TreeViewInput extends Vue {
  @Prop(String) readonly label!: string;

  @Prop(Number) readonly value!: number;

  @Prop(Array) readonly items!: {
    id: number;
    name: string;
    children: [];
  }[];

  @Prop(Object) readonly params!: {
    treeData: [];
  };

  searchModel: string = '';

  selectedItems: number[] = [];

  beforeMount() {
    this.selectedItems = [this.value];
  }

  @Watch('selectedItems')
  onChange(newValue: number[]) {
    this.$emit('input', newValue[0]);
  }
}
</script>

<style></style>
;
