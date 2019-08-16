<template>
  <v-navigation-drawer
    v-model="rightSideDrawer"
    class="grey lighten-3"
    fixed
    clipped
    app
    right
    width="35%"
    stateless
  >
    <v-card
      v-for="grid in gridList"
      :key="grid.tableName"
      class="mx-2 my-3"
    >
      <grid-with-toolbar
        :grid-type="grid.relation"
        :table-name="grid.tableName"
      />
    </v-card>
  </v-navigation-drawer>
</template>

<script lang="ts">
import { Vue, Prop, Component } from 'vue-property-decorator';
import GridWithToolbar, { GridType } from '../grid/GridWithToolbar.vue';

@Component({
  components: {
    GridWithToolbar,
  },
})
export default class DrawerRight extends Vue {
  @Prop(Boolean) readonly rightSideDrawer!: boolean;

  gridList: {tableName: string; relation: GridType}[] = [
    {
      tableName: 'trade',
      relation: GridType.OneToMany,
    },
    {
      tableName: 'legislation',
      relation: GridType.ManyToMany,
    },
    {
      tableName: 'safety',
      relation: GridType.ManyToMany,
    },
  ];
};
</script>

<style scoped>
.tool-icon {
  overflow: visible;
  font-size: 22px;
}
.v-toolbar {
  border-bottom: 0.5px solid #e2e2e2;
}
</style>
