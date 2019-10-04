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
  formData: FormData;
  columnDefs: ColDef[];
  confirmCallback: () => void;
  cancelCallback?: () => void;
}

type PopupDataTypes = ConfirmationData | FormEditorData;

export default class PopupModule {
  @State() private visible: boolean = false;

  @State() private popupData: PopupDataTypes = {
    componentType: 'form',
    formTitle: 'Base',
    formData: {},
    columnDefs: [],
    confirmCallback: () => {},
    cancelCallback: () => this.closePopup(),
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
    this.popupData = data;
    this.visible = true;
  }

  @Mutation()
  public closePopup() {
    this.visible = false;
  }
}
