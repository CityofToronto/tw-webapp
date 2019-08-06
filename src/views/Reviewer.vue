
<template>
  <v-layout
    column
    wrap
    fill-height
    px-4
    py-2
  >
    <v-flex
      grow
    >
      <v-sheet
        height="100%"
        elevation="2"
      >
        <grid-with-toolbar
          :key="$route.params.table"
          :table-name="$route.params.table"
          :grid-title="$route.params.table"
          :grid-side-bar="true"
          :grid-auto-height="false"
          :panel-visible="infoPanel"
          @toggle-panel="infoPanel = !infoPanel"
        />
      </v-sheet>

      <drawer-right
        v-if="true"
        :right-side-drawer="infoPanel"
      />
    </v-flex>
  </v-layout>
</template>

<script>
import GridWithToolbar from '../components/grid/GridWithToolbar.vue';
import DrawerRight from '../components/layout/DrawerRight.vue';

export default {
  components: {
    GridWithToolbar,
    DrawerRight,

  },
  data() {
    return {
      infoPanel: false,
    };
  },

};

</script>

<style lang="scss">
.card {
  height: 100%;
  width: 100%;
}


</style>
