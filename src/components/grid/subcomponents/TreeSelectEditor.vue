<template>
  <v-treeview
    v-model="selectedItems"
    :items="params.values"
    selection-type="leaf"
  />
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

@Component({})
export default class TreeSelectEditor extends Vue {
  selectedItems: string[] = [];
}

</script>
