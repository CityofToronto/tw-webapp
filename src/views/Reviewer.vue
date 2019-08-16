
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
          :grid-type="GridTypes.Full"
        />
      </v-sheet>

      <drawer-right
        :right-side-drawer="infoPanel"
      />
    </v-flex>
  </v-layout>
</template>

<script>
import { Component, Vue, Prop } from 'vue-property-decorator';
import { useStore } from 'vuex-simple';
import GridWithToolbar, { GridType } from '@/components/grid/GridWithToolbar.vue';
import DrawerRight from '@/components/layout/DrawerRight.vue';


@Component({
  components: {
    GridWithToolbar,
    DrawerRight,
  },
})
export default class ReviewPanel extends Vue {
  // We can't use enums directly in the template!
  GridTypes = GridType;

  store = useStore(this.$store);

  get infoPanel() {
    return this.store.display.reviewPanelState;
  }
};

</script>

<style lang="scss">
.card {
  height: 100%;
  width: 100%;
}


</style>
