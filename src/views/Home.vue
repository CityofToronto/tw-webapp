<template>
  <v-layout row wrap px-4 py-2 justify-start>
    <v-flex v-for="module in modules" :key="module.name" px-2 xs4>
      <v-card>
        <v-card-title dark>
          {{ module.name }}
        </v-card-title>
        <v-card-text class="px-0">
          {{ module.description }}
        </v-card-text>
        <v-card-actions>
          <v-btn text :to="module.route" exact color="primary">
            Launch Module
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

@Component({})
export default class HomeView extends Vue {
  modules = [
    {
      name: 'Define Module',
      description:
        'Define activities and their respective properties and relations',
      route: '/review/activity',
    },
    {
      name: 'Hierarchical Module',
      description:
        'Define mainetence and their respective properties and relations',
      route: '/',
    },
    {
      name: 'Another Module',
      description:
        'Define something and their respective properties and relations',
      route: '/',
    },
  ];
}
</script>

<style></style>
