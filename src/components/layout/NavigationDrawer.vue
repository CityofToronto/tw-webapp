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
    <v-list

      dense
    >
      <!-- List Group for PM Modules -->
      <v-list-group
        v-for="item in items"
        :key="item.title"
        v-model="item.active"

        :prepend-icon="item.action"
      >
        <template v-slot:activator>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>

        <v-list-item
          v-for="subItem in item.items"
          :key="subItem.title"
          :to="subItem.route"
        >
          <v-list-item-content>
            <v-list-item-title>{{ subItem.title }}</v-list-item-title>
          </v-list-item-content>

          <v-list-item-action>
            <v-icon>{{ subItem.action }}</v-icon>
          </v-list-item-action>
        </v-list-item>
      </v-list-group>

      <!-- Items for Other Models Modules -->
      <v-list-item
        v-for="item in navigationItems"
        :key="item.title"
        :to="item.route"
      >
        <v-list-item-action class="center">
          <v-icon>{{ item.icon }}</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>
            {{ item.title }}
          </v-list-item-title>
        </v-list-item-content>

        <v-list-item-content />
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component({})
export default class NavigationDrawer extends Vue {
  @Prop(Boolean) readonly leftSideDrawer: boolean = false;

  navigationItems = [
    {
      id: 1, icon: 'list', title: 'Hierarchy', route: '/hierarchy',
    },
    {
      id: 2, icon: 'data_usage', title: 'Data Model', route: '/model',
    },

  ];

  items = [
    {
      action: 'assignment',
      title: 'Activities',
      active: true,
      items: [
        { title: 'Overview', route: '/review/activity', action: 'assignment' },
      ],
    },
  ]
};
</script>

<style scoped>

/* This makes a grouped list not have a border around it */
.theme--light.v-list,
.v-list__group--active:after,
.theme--light.v-list .v-list__group--active:before {
  background: transparent
}

</style>
