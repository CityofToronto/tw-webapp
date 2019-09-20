<template>
  <v-layout row wrap fill-height px-4 py-2>
    <v-flex md6 lg8>
      <v-sheet height="100%" elevation="2">
        <grid-with-toolbar
          :table-name="tableName"
          :grid-type="gridTypes.Tree"
        />
      </v-sheet>
    </v-flex>
    <v-flex md6 lg4>
      <v-layout column fill-height>
        <v-flex xs6 px-2>
          <v-sheet height="100%" elevation="2">
            <grid-with-toolbar
              :tableName="'inactive_asset'"
              :grid-type="gridTypes.Direct"
            />
          </v-sheet>
        </v-flex>
        <v-flex xs6>
          Bottom
        </v-flex>
      </v-layout>
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
  tableName: string = 'role_asset';
  gridTypes = GridType;
}
</script>
