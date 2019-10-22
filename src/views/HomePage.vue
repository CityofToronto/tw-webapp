<template>
  <v-container></v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import Store from '@/store/store';
import { useStore } from 'vuex-simple';

@Component({})
export default class HomeView extends Vue {
  store: Store = useStore(this.$store);

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
        'Define maintenance and their respective properties and relations',
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
