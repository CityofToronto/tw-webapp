<template>
  <div>
    <!-- Global App Bar -->
    <v-app-bar color="primary" dark dense fixed clipped-left clipped-right app>
      <!-- Left Hamburger Menu -->
      <v-app-bar-nav-icon @click="leftSideDrawer = !leftSideDrawer" />

      <v-toolbar-items>
        <!-- Define Toolbar Title -->

        <v-btn text class="title" @click="$router.replace('/')">
          Management Engine
        </v-btn>
        <v-btn text class="project-title" @click="() => {}">
          {{ businessUnit }}
          <v-icon right>
            arrow_drop_down
          </v-icon>
        </v-btn>

        <v-menu offset-y>
          <template v-slot:activator="{ on }">
            <v-btn text class="project-title" v-on="on">
              {{ currentProject.name }}
              <v-icon right>
                arrow_drop_down
              </v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item
              v-for="project in userData.projects"
              :key="project.id"
              @click="setActiveProject(project)"
            >
              <v-list-item-title>{{ project.name }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-toolbar-items>

      <!-- Push Items to The Right -->
      <v-spacer />
      <v-toolbar-items>
        <v-menu v-model="menu" :close-on-content-click="false" offset-y>
          <template v-slot:activator="{ on }">
            <v-btn text dark class="username" v-on="on">
              Amber Brasher
            </v-btn>
          </template>
          <user-panel></user-panel>
        </v-menu>
      </v-toolbar-items>
      <!-- Left and Right Drawers -->
    </v-app-bar>
    <navigation-drawer :left-side-drawer="leftSideDrawer" />
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import NavigationDrawer from './NavigationDrawer.vue';
import UserPanel from '@/components/UserPanel.vue';
import Store from '@/store/store';
import { useStore } from 'vuex-simple';

@Component({
  components: {
    NavigationDrawer,
    UserPanel,
  },
})
export default class Navbar extends Vue {
  leftSideDrawer = false;

  rightSideDrawer = false;

  menu = false;

  store: Store = useStore(this.$store);

  get userData() {
    return this.store.auth.currentUserData;
  }

  get currentProject() {
    return this.store.auth.activeProjectData;
  }

  get loginStatus() {
    return this.store.auth.loginStatus;
  }

  logout() {
    this.$router.push('/');
  }

  changeUser() {
    this.store.auth.changeUser();
  }

  businessUnit = 'Highland Creek';
}
</script>

<style scoped>
.title {
  font-weight: 300;
  font-size: 22px;
  position: relative;
  overflow: visible;
  padding-right: 20px;
  text-transform: none;
}
.project-title,
.username {
  font-weight: 300;
  font-size: 16px;
  position: relative;
  overflow: visible;
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
