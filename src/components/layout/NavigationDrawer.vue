<template>
  <v-navigation-drawer
    v-model="leftSideDrawer"
    class="grey lighten-3"
    fixed
    hide-overlay
    clipped
    app
    stateless
  >
    <v-list dense>
      <div v-for="mod in modules" :key="mod.title">
        <v-list-group
          v-if="!mod.admin || showAdminPanel"
          :prepend-icon="mod.icon"
          value="true"
          no-action
        >
          <template v-slot:activator>
            <v-list-item-content>
              <v-list-item-title v-text="mod.title"></v-list-item-title>
            </v-list-item-content>
          </template>
          <v-list-item
            v-for="item in mod.items"
            :key="item.title"
            :to="item.route"
          >
            <v-list-item-content class="indent">
              <v-list-item-title v-text="item.title"></v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-group>
      </div>
    </v-list>
  </v-navigation-drawer>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import Store from '@/store/store';
import { useStore } from 'vuex-simple';

@Component({})
export default class NavigationDrawer extends Vue {
  @Prop(Boolean) readonly leftSideDrawer: boolean = false;

  store: Store = useStore(this.$store);

  get showAdminPanel() {
    return this.store.auth.user.username === 'tony.huang';
  }

  modules = [
    {
      icon: 'assignment',
      title: 'Project Asset',
      active: true,
      admin: false,
      items: [
        { title: 'Reservation', route: '/assets/reservation' },
        { title: 'Record Reconciliation', route: '/assets/reconciliation' },
        { title: 'Change Representation', route: '/assets/update' },
      ],
    },
    {
      icon: 'person',
      admin: true,
      title: 'Administration',
      active: true,
      items: [{ title: 'Reservation Approval', route: '/admin/approval' }],
    },
  ];
}
</script>

<style scoped>
.indent {
  margin-left: 10px;
}
</style>
