<template>
  <v-dialog v-model="isVisible" width="500">
    <component :is="componentType" />
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
  get componentType() {
    switch (this.store.popup.componentType) {
      case 'confirmation':
        return () => import('./ConfirmationDialog.vue');
      case 'form':
        return () => import('./DynamicForm.vue');
    }
  }

  get isVisible() {
    return this.store.popup.isVisible;
  }

  set isVisible(value) {
    this.store.popup.closePopup();
  }
}
</script>
