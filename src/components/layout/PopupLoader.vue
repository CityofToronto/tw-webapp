<template>
  <v-dialog v-model="isVisible" max-width="70%">
    <component :is="componentToShow" />
  </v-dialog>
</template>

<script lang="ts">
import { Vue, Prop, Component } from 'vue-property-decorator';
import { useStore } from 'vuex-simple';
import Store from '@/store/store';

@Component({})
export default class PopupLoader extends Vue {
  store: Store = useStore(this.$store);

  // eslint-disable-next-line getter-return
  get componentToShow() {
    return this.store.popup.popupComponent;
  }

  get isVisible() {
    return this.store.popup.isVisible;
  }

  set isVisible(value) {
    this.store.popup.closePopup();
  }
}
</script>
