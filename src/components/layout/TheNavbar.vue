<template>
  <div>
    <!-- Global App Bar -->
    <v-app-bar
      color="primary"
      dark
      dense
      fixed
      clipped-left
      clipped-right
      app
    >
      <!-- Left Hamburger Menu -->
      <v-app-bar-nav-icon
        @click="leftSideDrawer = !leftSideDrawer"
      />
      <!-- Define Toolbar Title -->
      <v-toolbar-title
        class="title"
      >
        Management Engine
      </v-toolbar-title>

      <v-toolbar-items>
        <v-btn
          text
          class="project-title"
          @click=""
        >
          {{ currentProject }}
          <v-icon right>
            arrow_drop_down
          </v-icon>
        </v-btn>
      </v-toolbar-items>


      <!-- Push Items to The Right -->
      <v-spacer />

      <!-- Items on the Toolbar -->

      <v-btn
        v-for="item in toolBarItems"
        :key="item.id"
        icon
      >
        <v-icon @click="item.buttonFunction">
          {{ item.icon }}
        </v-icon>
      </v-btn>


      <!-- Right Hamburger Menu -->
      <!-- <v-app-bar-nav-icon
        @click="rightSideDrawer = !rightSideDrawer"
      /> -->
    </v-app-bar>

    <!-- Left and Right Drawers -->
    <drawer-left
      :left-side-drawer="leftSideDrawer"
    />
  </div>
</template>

<script>
import DrawerLeft from './DrawerLeft.vue';
import DrawerRight from './DrawerRight.vue';

export default {
  name: 'Navbar',
  components: {
    DrawerLeft,
    DrawerRight,
  },
  data() {
    return {
      leftSideDrawer: false,
      rightSideDrawer: false,
      projectForm: false,
      mini: true,

      toolBarItems: [
        { id: 0, icon: 'person', buttonFunction: this.showForm },
        { id: 1, icon: 'help_outline', buttonFunction: this.navigateToHelp },
      ],
      menu: false,
      currentProject: 'Highland Creek',
    };
  },
  methods: {
    showForm() {
      this.$store.dispatch('form/showForm');
    },
    removeRow() {
      this.$store.dispatch('grid/removeRow');
    },
    navigateToHelp() {
      window.open('https://toronto.ca');
    },
  },
};
</script>

<style scoped>

.title {
  font-weight: 300;
  font-size: 22px;
  position: relative;
  overflow:visible;
  padding-right:20px
}
.project-title {
  font-weight: 300;
  font-size: 16px;
  position: relative;
  overflow:visible;
  text-transform: none;
}
.subtitle {
  font-size: 10px;
  font-weight: 400;

}
.center {
  text-align: center;
}

</style>
