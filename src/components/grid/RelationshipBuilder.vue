<template>
  <v-sheet
    height="800px"
  >
    <v-layout
      fill-height=""
      column
    >
      <v-flex xs7>
        <grid-with-toolbar
          :table-name="tableName"
          :grid-type="gridTypes.DragFrom"
        />
      </v-flex>
      <v-divider />
      <v-flex shrink>
        <grid-with-toolbar
          :table-name="tableName"
          :grid-type="gridTypes.DragTo"
        />
      </v-flex>
      <v-spacer />
      <v-divider />
      <v-flex
        align-self-end
        shrink
      >
        <v-btn
          color="primary"
          text
          @click="$emit('close-form')"
        >
          Submit
        </v-btn>
      </v-flex>
    </v-layout>
  </v-sheet>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { GridType } from '../GridWithToolbar.vue';

@Component({
  components: {
    // https://vuejs.org/v2/guide/components-edge-cases.html#Circular-References-Between-Components
    GridWithToolbar: () => import('../GridWithToolbar.vue'),
  },
})
export default class RelationshipBuilder extends Vue {
  @Prop(String) readonly gridType!: GridType;

  @Prop(String) readonly tableName!: string;

  gridTypes = GridType;
}
</script>

<style scoped>

.grid-outlined {
  border: 0.5px solid black;
}

</style>
