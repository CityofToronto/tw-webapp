<template>
  <v-layout row wrap fill-height px-4 py-2>
    <v-flex md6 lg8>
      <v-sheet height="100%" elevation="2">
        <grid-with-toolbar :config-key="'reconciliation_view'" />
      </v-sheet>
    </v-flex>
    <v-flex md6 lg4>
      <v-layout column fill-height>
        <v-flex xs6 px-2>
          <v-sheet height="100%" elevation="2">
            <grid-with-toolbar :config-key="'unassigned_assets'" />
          </v-sheet>
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
export default class ReconciliationView extends Vue {}
</script>
