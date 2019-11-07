<template>
  <div id="app">
    <v-app id="main">
      <TheNavbar />
      <PopupLoader />
      <NotificationBar />
      <v-content>
        <keep-alive>
          <router-view />
        </keep-alive>
      </v-content>
    </v-app>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import NotificationBar from './components/layout/NotificationBar.vue';
import TheNavbar from './components/layout/TheNavbar.vue';
import PopupLoader from './components/layout/PopupLoader.vue';
import Store from '@/store/store';
import { useStore } from 'vuex-simple';

@Component({
  components: {
    TheNavbar,
    NotificationBar,
    PopupLoader,
  },
})
export default class App extends Vue {
  store: Store = useStore(this.$store);
  created() {
    this.store.settings.getSettings();
  }
}
</script>

<style>
@import '../node_modules/ag-grid-community/dist/styles/ag-grid.css';
@import '../node_modules/ag-grid-community/dist/styles/ag-theme-balham.css';
* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
