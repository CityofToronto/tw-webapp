<template>
  <v-container>
    <module-panel
      v-for="module in modules"
      :key="module.title"
      :title="module.title"
      :description="module.description"
      :sub-modules="module.subModules"
    />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import Store from '@/store/store';
import ModulePanel from '@/components/ModulePanel.vue';
import { useStore } from 'vuex-simple';

@Component({
  components: {
    ModulePanel,
  },
})
export default class HomeView extends Vue {
  store: Store = useStore(this.$store);

  modules = [
    {
      title: 'Project Asset Module',
      description: 'Reserve, reconciliation and update assets',
      subModules: [
        {
          title: 'Reservation',
          subtitle:
            'Reserve entities for a project to be approved for reconciliation and update.',
          route: '/asset/reservation',
        },
        {
          title: 'Reconciliation',
          subtitle: 'Rearrange role hierarchy and assign new assets',
          route: '/asset/reconciliation',
        },
        {
          title: 'Update',
          subtitle: 'Update the role and asset information',
          route: '/asset/update',
        },
      ],
    },
  ];
}
</script>

<style>
.description {
  padding-left: 10px;
  font-size: 15px;
}
</style>
