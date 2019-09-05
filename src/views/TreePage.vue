<template>
  <v-layout column wrap fill-height px-4 py-2>
    <v-flex grow>
      <v-sheet height="100%" elevation="2">
        <grid-with-toolbar
          :table-name="'WORK_TYPE'"
          :grid-type="gridTypes.Tree"
        />
      </v-sheet>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import GridWithToolbar from '@/components/GridWithToolbar.vue';
import { GridType } from '@/types/grid';

@Component({
  components: {
    GridWithToolbar,
  },
})
export default class TreePage extends Vue {
  tableName: string = 'WORK_TYPE';
  gridTypes = GridType;
}
</script>
