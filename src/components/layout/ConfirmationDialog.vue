<template>
  <v-card>
    <v-card-title>{{ dialogData.popupTitle }}</v-card-title>
    <v-card-text>{{ dialogData.message }}</v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn text @click="dialogData.cancelCallback">
        {{ dialogData.cancelButtonText }}
      </v-btn>
      <v-btn text color="primary" @click="dialogData.confirmCallback">
        {{ dialogData.confirmButtonText }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import Store from '../../store/store';
import { useStore } from 'vuex-simple';
import { ConfirmationData } from '@/store/modules/popup';

@Component({})
export default class ConfirmationDialog extends Vue {
  store: Store = useStore(this.$store);

  get dialogData(): ConfirmationData {
    return this.store.popup.popupProperties as ConfirmationData;
  }
}
</script>
