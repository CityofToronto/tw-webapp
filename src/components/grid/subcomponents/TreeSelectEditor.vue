<template>
  <v-treeview
    v-model="selectedItems"
    :items="params.list"
    selection-type="leaf"
  >

  </v-treeview>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

@Component({})
export default class TreeSelectEditor extends Vue {
  selectedItems: string[] = [];

  get listItems()
}

</script>

// items: [
//         {
//           id: 1,
//           name: 'Root',
//           children: [
//             { id: 2, name: 'Child #1' },
//             { id: 3, name: 'Child #2' },
//             {
//               id: 4,
//               name: 'Child #3',
//               children: [
//                 { id: 5, name: 'Grandchild #1' },
//                 { id: 6, name: 'Grandchild #2' },
//               ],
//             },
//           ],
//         },
//       ],