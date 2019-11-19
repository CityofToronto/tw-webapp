import { FormSchema, FormFields } from '@/types/form';

export interface FieldComponent {
  component: string | (() => Promise<typeof import('*.vue')>);
  props?: Record<string, any>;
}

export default class FormFactory {
  private schema: FormSchema;

  constructor(schema: FormSchema) {
    this.schema = schema;
  }

  buildForm() {
    return this.schema.properties.map((prop) => {
      const component = this.getComponent(prop.field);
      return {
        ...component,
        key: prop.property,
        props: {
          ...component.props,
          label: prop.label,
          readonly: prop.readonly ?? false,
        },
      };
    });
  }

  private getComponent(field: FormFields): FieldComponent {
    switch (field.type) {
      case 'number':
        return {
          component: 'v-text-field',
          props: {
            type: 'number',
          },
        };
      case 'text':
        return {
          component: 'v-text-field',
        };
      case 'date':
        return {
          component: 'v-text-field',
        };
      case 'boolean':
        return {
          component:
            // Default component is the checkbox
            field.componentType === 'switch' ? 'v-switch' : 'v-checkbox',
        };
      case 'enum':
        return {
          component: 'v-select',
          props: {
            items:
              typeof field.items === 'function' ? field.items() : field.items,
          },
        };
      case 'autocomplete':
        return {
          component: 'v-autocomplete',
          props: {
            items:
              typeof field.items === 'function' ? field.items() : field.items,
          },
        };
      case 'tree':
        return {
          component: () => import('@/components/inputs/TreeviewInput.vue'),
          props: {
            items:
              typeof field.items === 'function' ? field.items() : field.items,
          },
        };
    }
  }
}
