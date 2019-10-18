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
      <v-list-group
        v-for="mod in modules"
        :key="mod.title"
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
          <v-list-item-content>
            <v-list-item-title v-text="item.title"></v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list-group>
    </v-list>
  </v-navigation-drawer>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component({})
export default class NavigationDrawer extends Vue {
  @Prop(Boolean) readonly leftSideDrawer: boolean = false;

  modules = [
    {
      icon: 'assignment',
      title: 'Project Asset',
      active: true,
      items: [
        { title: 'Reservation', route: '/assets/reservation' },
        { title: 'Record Reconciliation', route: '/assets/reconciliation' },
        { title: 'Change Representation', route: '/assets/update' },
      ],
    },
    {
      icon: 'person',
      title: 'Administration',
      active: true,
      items: [{ title: 'Reservation Approval', route: '/admin/approval' }],
    },
  ];
}
</script>
