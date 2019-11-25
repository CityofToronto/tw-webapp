<template>
  <div id="app">
    <v-app id="main">
      <v-content>
        <router-view />
      </v-content>
    </v-app>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

@Component({})
export default class App extends Vue {}
</script>

<style lang="scss">
$grid-size: 7px;
$icon-size: 18px;

@import '../node_modules/@ag-grid-enterprise/all-modules/dist/styles/ag-grid.scss';
@import '../node_modules/@ag-grid-enterprise/all-modules/dist/styles/ag-theme-material/sass/ag-theme-material.scss';

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
