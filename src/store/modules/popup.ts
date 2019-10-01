import { State, Getter, Mutation, Action } from 'vuex-simple';
import { ColDef } from 'ag-grid-community';

interface ConfirmationData {
  componentType: 'confirmation';
  message: string;
  confirmButtonText: string;
  cancelButtonText: string;
  confirmCallback(): () => void;
  cancelCallback(): () => void;
}

interface FormEditorData {
  componentType: 'form';
  formTitle: string;
  formData: {
    [p: string]: any;
  };
  columnDefs: ColDef[];
}

type PopupDataTypes = ConfirmationData | FormEditorData;

export default class PopupModule {
  @State() private popupData: PopupDataTypes = {
    componentType: 'form',
    formTitle: 'Base',
    formData: {},
    columnDefs: [],
  };

  @Getter()
  public get popupProperties(): PopupDataTypes {
    return this.popupData;
  }

  @Getter()
  public get componentType(): 'form' | 'confirmation' {
    return this.popupData.componentType;
  }

  @Mutation()
  public setPopup(data: PopupDataTypes) {
    this.popupData = data;
  }
}
