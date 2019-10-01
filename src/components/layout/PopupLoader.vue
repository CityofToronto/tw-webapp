<template>
  <component :is="componentType" />
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
}
</script>
