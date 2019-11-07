<template>
  <v-card>
    <v-list>
      <v-list-item>
        <v-list-item-avatar>
          <img src="https://cdn.vuetifyjs.com/images/john.jpg" alt="John" />
        </v-list-item-avatar>

        <v-list-item-content>
          <v-list-item-title>John Leider</v-list-item-title>
          <v-list-item-subtitle>Founder of Vuetify.js</v-list-item-subtitle>
        </v-list-item-content>

        <v-list-item-action>
          <v-btn :class="fav ? 'red--text' : ''" icon @click="fav = !fav">
            <v-icon>mdi-heart</v-icon>
          </v-btn>
        </v-list-item-action>
      </v-list-item>
    </v-list>

    <v-divider></v-divider>

    <v-list>
      <v-list-item>
        <v-list-item-action>
          <v-switch v-model="debugMode" color="purple"></v-switch>
        </v-list-item-action>
        <v-list-item-title>Enable Debug Mode</v-list-item-title>
      </v-list-item>

      <v-list-item>
        <v-list-item-action>
          <v-switch v-model="hints" color="purple"></v-switch>
        </v-list-item-action>
        <v-list-item-title>Enable hints</v-list-item-title>
      </v-list-item>
    </v-list>
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
    return '';
  }

  get debugMode() {
    return this.store.settings.debugStatus;
  }

  set debugMode(value: boolean) {
    this.store.settings.setDebugMode(value);
    this.$router.go(0);
  }
}
</script>
