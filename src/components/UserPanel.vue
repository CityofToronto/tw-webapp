<template>
  <v-card>
    <v-list>
      <v-list-item>
        <v-list-item-avatar>
          <v-avatar color="primary">
            <span class="white--text">{{ userInitials }}</span>
          </v-avatar>
        </v-list-item-avatar>

        <v-list-item-content>
          <v-list-item-title>{{ fullName }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>

    <v-divider></v-divider>
    <v-list v-if="userType === 'ADMIN'">
      <v-list-item>
        <v-list-item-action>
          <v-switch v-model="debugMode" color="red"></v-switch>
        </v-list-item-action>
        <v-list-item-title>Enable Debug Mode</v-list-item-title>
      </v-list-item>
    </v-list>
    <v-card-actions>
      <v-spacer />
      <v-btn text color="red lighten-1" @click="logout">Logout</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import Store from '@/store/store';
import { useStore } from 'vuex-simple';

@Component({})
export default class UserPanel extends Vue {
  store: Store = useStore(this.$store);

  get userInitials() {
    const { firstName, lastName } = this.store.auth;
    return `${firstName[0]}${lastName[0]}`;
  }

  get fullName() {
    return this.store.auth.fullName;
  }

  get userType() {
    return this.store.auth.userType;
  }

  get debugMode() {
    return this.store.settings.debugStatus;
  }

  logout() {
    this.store.auth.logUserOut();
  }

  set debugMode(value: boolean) {
    this.store.settings.setDebugMode(value);
    this.$router.go(0);
  }
}
</script>
