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
        :simple-toolbar="true"
        :relation="grid.relation"
        :table-name="grid.tableName"
        :grid-title="grid.title"
        :mini-toolbar="grid.mini"
        :grid-side-bar="false"
      />
    </v-card>
  </v-navigation-drawer>
</template>

<script>
import GridWithToolbar from '../grid/GridWithToolbar.vue';

export default {
  components: {
    GridWithToolbar,
  },
  props: {
    rightSideDrawer: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  data() {
    return {
      gridList: [
        {
          title: 'Trades',
          tableName: 'trade',
          mini: true,
          relation: 'oneToMany',
        },
        {
          title: 'Legislation',
          tableName: 'legislation',
          mini: true,
          relation: 'manyToMany',
        },
        {
          title: 'Safety',
          tableName: 'safety',
          mini: true,
          relation: 'manyToMany',
        },
      ],
    };
  },
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
