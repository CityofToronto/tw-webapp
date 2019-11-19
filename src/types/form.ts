export interface FormSchema {
  properties: {
    label: string;
    property: string;
    readonly: boolean;
    field: FormFields;
  }[];
}

type LocalOrAsyncItems = string[] | ((...args: any[]) => string[]);

export type FormFields =
  | TextField
  | NumberField
  | DateField
  | BooleanField
  | EnumField
  | AutocompleteField
  | TreeField;

interface TextField {
  type: 'text';
}

interface NumberField {
  type: 'number';
}

interface DateField {
  type: 'date';
}

interface BooleanField {
  type: 'boolean';
  componentType?: 'switch' | 'checkbox';
}

interface EnumField {
  type: 'enum';
  items: LocalOrAsyncItems;
}

interface AutocompleteField {
  type: 'autocomplete';
  items: LocalOrAsyncItems;
}

interface TreeField {
  type: 'tree';
  items: LocalOrAsyncItems;
}
