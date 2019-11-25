<template>
  <div>
    <v-dialog
      v-for="modal in modals"
      :key="modal.id"
      value="true"
      max-width="70%"
      @click:outside="store.modal.closeModal(modal.id)"
    >
      <component :is="modal.component" :id="modal.id" v-bind="modal.props" />
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { useStore } from 'vuex-simple';
import Store from '@/store/store';

@Component({})
export default class ModalLoader extends Vue {
  store: Store = useStore(this.$store);

  get modals() {
    return this.store.modal.modals;
  }
}
</script>
