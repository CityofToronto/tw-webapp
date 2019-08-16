<template>
  <div id="app">
    <v-app id="main">
      <TheNavbar />
      <NotificationBar />
      <v-content>
        <router-view />
      </v-content>
    </v-app>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import NotificationBar from './components/layout/NotificationBar.vue';
import TheNavbar from './components/layout/TheNavbar.vue';

@Component({
  components: {
    TheNavbar,
    NotificationBar,
  },
})
export default class App extends Vue {

};

</script>

<style>
@import "../node_modules/ag-grid-community/dist/styles/ag-grid.css";
@import "../node_modules/ag-grid-community/dist/styles/ag-theme-balham.css";
* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
