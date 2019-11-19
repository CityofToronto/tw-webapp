interface FormSchema {}

type FormFields = TextField | NumberField;

interface TextField {
  type: 'text';
}

interface NumberField {
  type: 'number';
}
