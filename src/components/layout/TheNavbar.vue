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
    </v-app-bar>

    <!-- Left and Right Drawers -->
    <navigation-drawer
      :left-side-drawer="leftSideDrawer"
    />
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import NavigationDrawer from './NavigationDrawer.vue';

@Component({
  components: {
    NavigationDrawer,
  },
})
export default class Navbar extends Vue {
  leftSideDrawer = false;

  rightSideDrawer = false;

  projectForm = false;

  mini = true;

  toolBarItems = [
    {
      id: 0,
      icon: 'person',
      buttonFunction: () => {},
    },
    {
      id: 1,
      icon: 'help_outline',
      buttonFunction: () => { window.open('https://toronto.ca'); },
    },
  ];

  currentProject = 'Highland Creek';
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
