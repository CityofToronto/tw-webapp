import { State, Getter, Mutation, Action } from 'vuex-simple';
import { FormData } from '@/types/grid';
import { CellParams } from '@/types/config';

interface PopupData {
  popupTitle: string;
  confirmButtonText?: string | false;
  cancelButtonText?: string | false;
  confirmCallback: () => void;
  cancelCallback?: () => void;
}

export interface ConfirmationData extends PopupData {
  componentType: 'confirmation';
  message: string;
}

export interface FormEditorData extends PopupData {
  componentType: 'form';
  formData: FormData;
  columnDefs: CellParams[];
}

type PopupDataTypes = ConfirmationData | FormEditorData;

export default class PopupModule {
  @State() private visible: boolean = false;

  @State() customComponent!: () => Promise<any>;

  @State() private popupData: PopupDataTypes = {
    componentType: 'confirmation',
    popupTitle: '',
    message: '',
    confirmButtonText: 'Confirm',
    cancelButtonText: 'Cancel',
    confirmCallback: () => {},
    cancelCallback: () => this.closePopup,
  };

  @Getter()
  public get popupProperties(): PopupDataTypes {
    return this.popupData;
  }

  @Getter()
  public get popupComponent(): () => Promise<any> {
    if (this.customComponent) {
      return this.customComponent;
    }
    switch (this.popupData.componentType) {
      case 'confirmation':
        return () => import('@/components/layout/ConfirmationDialog.vue');
      default:
        return () => import('@/components/layout/DynamicForm.vue');
    }
  }

  @Getter()
  public get isVisible(): boolean {
    return this.visible;
  }

  @Mutation()
  public setPopup(data: PopupDataTypes) {
    const defaultData = {
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      cancelCallback: this.closePopup,
    };

    this.popupData = {
      ...defaultData,
      ...data,
    };
    this.visible = true;
  }

  @Mutation()
  public closePopup() {
    this.visible = false;
  }

  @Mutation()
  public setComponentPopup(component: () => Promise<any>) {
    this.customComponent = component;
    this.visible = true;
  }
}
