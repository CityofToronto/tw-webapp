import { State, Mutation, Action } from 'vuex-simple';
import Vue from 'vue';
import { FormSchema } from '@/types/form';

type AsyncComponent = () => Promise<typeof import('*.vue')>;

interface Modal {
  id: number;
  component: AsyncComponent | typeof Vue;
  props: Record<string, any>;
}

interface DynamicFormModal {
  title: string;
  confirmButtonText?: string | false;
  cancelButtonText?: string | false;
  confirmCallback: (closeForm: () => void) => void;
  cancelCallback?: () => void;
  sortingOrder?: string[];
  formData: Record<string, any>;
  formSchema: FormSchema;
}

export default class ModalModule {
  generateId() {
    const ids = this.modals.map((modal) => modal.id);
    return ids.length ? Math.max(...ids) + 1 : 0;
  }

  @State() modals: Modal[] = [];

  @Mutation()
  closeModal(idToClose: number) {
    this.modals = this.modals.filter((modal) => modal.id !== idToClose);
  }

  @Mutation()
  addModal(modal: Modal) {
    this.modals.push(modal);
  }

  @Action()
  createModal(component: AsyncComponent, props = []) {
    const id = this.generateId();
    this.addModal({ id, component, props });
    return id;
  }

  @Mutation()
  createFormModal(modal: DynamicFormModal) {
    const id = this.generateId();
    const component = () => import('@/components/layout/DynamicForm.vue');
    this.addModal({ id, component, props: modal });
    return id;
  }
}
