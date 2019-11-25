import { Component, Vue, Prop } from 'vue-property-decorator';
import Store from '@/store/store';
import { useStore } from 'vuex-simple';

@Component({})
export default class ModalMixin extends Vue {
  store: Store = useStore(this.$store);
  @Prop({ required: true }) id!: number;

  closeModal() {
    this.store.modal.closeModal(this.id);
  }
}
