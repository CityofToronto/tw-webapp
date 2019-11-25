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
    <!-- <v-card v-for="grid in gridList" :key="grid.tableName" class="mx-2 my-3">
      <grid-with-toolbar
        :grid-type="grid.relation"
        :table-name="grid.tableName"
      />
    </v-card> -->
  </v-navigation-drawer>
</template>

<script lang="ts">
import { Vue, Prop, Component } from 'vue-property-decorator';
import { GridType } from '@/types/grid';
import GridWithToolbar from '@/components/GridWithToolbar.vue';

@Component({
  components: {
    GridWithToolbar,
  },
})
export default class DrawerRight extends Vue {
  @Prop(Boolean) readonly rightSideDrawer!: boolean;

  gridList: { tableName: string; relation: GridType }[] = [];

  async created() {
    // const relationships = await apolloClient.getRelationships(
    //   this.$route.params.table,
    // );
    // Filter for table relationships
    // this.gridList = relationships
    //   .filter((relationship): boolean =>
    //     relationship.name.includes('aggregate'),
    //   )
    //   .map((relationship) => {
    //     /**
    //      *  Two options, activity_legislation_aggregate returns length of 3 when split by _ (MTM)
    //      *  trade_aggregate returns length of 2 when split by _ (OTM)
    //      */
    //     switch (relationship.name.split('_').length) {
    //       case 2:
    //         return {
    //           tableName: relationship.name.split('_')[0],
    //           relation: GridType.OneToMany,
    //         };
    //       case 3:
    //         return {
    //           tableName: relationship.name.split('_')[1],
    //           relation: GridType.ManyToMany,
    //         };
    //       default:
    //         throw new Error(
    //           `Incorrect relationship schema for ${this.$route.params.table}`,
    //         );
    //     }
    //   });
  }
}
</script>

<style scoped>
.v-toolbar {
  border-bottom: 0.5px solid #e2e2e2;
}
</style>
