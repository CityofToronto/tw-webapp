import { State, Getter, Mutation, Action } from 'vuex-simple';
import { ColDef } from 'ag-grid-community';
import { FormData } from '@/types/grid';
import { MarkRequired } from 'ts-essentials';
import { BaseColumnParams } from '@/types/config';

interface PopupData {
  popupTitle: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
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
  columnDefs: BaseColumnParams[];
}

type PopupDataTypes = ConfirmationData | FormEditorData;

export default class PopupModule {
  @State() private visible: boolean = false;

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
  public get componentType(): 'form' | 'confirmation' {
    return this.popupData.componentType;
  }

  @Getter()
  public get isVisible(): boolean {
    return this.visible;
  }

  @Mutation()
  public setPopup(data: PopupDataTypes) {
    this.popupData = {
      ...data,
      cancelCallback: data.cancelCallback || this.closePopup,
      confirmButtonText: data.confirmButtonText || 'Confirm',
      cancelButtonText: data.confirmButtonText || 'Cancel',
    };
    this.visible = true;
  }

  @Mutation()
  public closePopup() {
    this.visible = false;
  }
}
