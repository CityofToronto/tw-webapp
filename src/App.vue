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

<script>
import NotificationBar from './components/layout/NotificationBar.vue';
import TheNavbar from './components/layout/TheNavbar.vue';

export default {
  name: 'App',
  components: {
    TheNavbar,
    NotificationBar,
  },
  apollo: {},
  data() {
    return {
      dialog: false,
    };
  },
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
.btn {
  display: inline-block;
  border: none;
  background: #555;
  color: #fff;
  padding: 7px 20px;
  cursor: pointer;
}
.btn:hover {
  background: #666;
}
</style>
