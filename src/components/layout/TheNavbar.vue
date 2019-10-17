<template>
  <div>
    <!-- Global App Bar -->
    <v-app-bar color="primary" dark dense fixed clipped-left clipped-right app>
      <!-- Left Hamburger Menu -->
      <v-app-bar-nav-icon @click="leftSideDrawer = !leftSideDrawer" />
      <!-- Define Toolbar Title -->
      <v-toolbar-title class="title">
        Management Engine
      </v-toolbar-title>

      <v-toolbar-items>
        <v-btn text class="project-title" @click="() => {}">
          {{ currentProject }}
          <v-icon right>
            arrow_drop_down
          </v-icon>
        </v-btn>
      </v-toolbar-items>

      <!-- Push Items to The Right -->
      <v-spacer />

      <!-- Items on the Toolbar -->
      <template v-if="!!loginStatus">
        <v-menu v-model="menu" :close-on-click="true" offset-y>
          <template v-slot:activator="{ on }">
            <v-btn text v-on="on">
              {{ username }}
            </v-btn>
          </template>
          <v-card>
            <v-list>
              <v-list-item>
                <v-list-item-avatar>
                  <img :src="`https://ui-avatars.com/api/?name=${username}`" />
                </v-list-item-avatar>

                <v-list-item-content>
                  <v-list-item-title>Amber Brasher</v-list-item-title>
                  <v-list-item-subtitle>
                    Technical Assistant
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn text color="primary" @click="logout">Logout</v-btn>
            </v-card-actions>
          </v-card>
        </v-menu>
      </template>
    </v-app-bar>

    <!-- Left and Right Drawers -->
    <navigation-drawer :left-side-drawer="leftSideDrawer" />
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import NavigationDrawer from './NavigationDrawer.vue';
import Store from '@/store/store';
import { useStore } from 'vuex-simple';

@Component({
  components: {
    NavigationDrawer,
  },
})
export default class Navbar extends Vue {
  leftSideDrawer = false;

  rightSideDrawer = false;

  menu = false;

  store: Store = useStore(this.$store);

  get username() {
    return this.store.auth.username;
  }

  get loginStatus() {
    return this.store.auth.loginStatus;
  }

  logout() {
    this.$router.push('/');
  }

  currentProject = 'Highland Creek';
}
</script>

<style scoped>
.title {
  font-weight: 300;
  font-size: 22px;
  position: relative;
  overflow: visible;
  padding-right: 20px;
}
.project-title {
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
