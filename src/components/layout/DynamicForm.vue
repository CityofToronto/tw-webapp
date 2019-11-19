<template>
  <v-card>
    <v-card-title>{{ title }}</v-card-title>
    <!-- <v-divider /> -->
    <v-card-text style="height: 600px">
      <component
        :is="field.component"
        v-for="field in formComponents"
        :key="field.key"
        v-bind="field.props"
        :value="formModel[field.key]"
        @input="formModel[field.key] = $event"
      />
    </v-card-text>
    <v-divider />
    <v-card-actions>
      <v-spacer />
      <v-btn color="blue darken-1" text @click="closeModal(id)">
        Close
      </v-btn>
      <v-btn color="blue darken-1" text @click="saveForm">
        Save
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import { Component, Prop, Vue, Mixins } from 'vue-property-decorator';
import { ColDef } from 'ag-grid-community';
import modalMixin from '@/components/mixins/modalMixin';
import TreeviewInput from '@/components/inputs/TreeviewInput.vue';
import { CellType } from '@/types/grid';
import { QueryType } from '@/types/api';
import { CellParams } from '@/types/config';
import { MarkRequired } from 'ts-essentials';
import { FormSchema } from '@/types/form';
import FormFactory, { FieldComponent } from '@/components/FormFactory';

@Component({
  components: {
    TreeviewInput,
  },
})
export default class DynamicForm extends Mixins(modalMixin) {
  @Prop({ required: true }) formSchema!: FormSchema;

  @Prop({ required: false }) formData!: Record<string, any>;

  @Prop({ required: true }) title!: string;

  @Prop({ required: true }) confirmCallback!: Function;

  formModel: Record<string, any> = {};

  formComponents: FieldComponent[] = [];

  populateModel() {
    this.formModel = { ...this.formData } ?? {};
    this.formSchema.properties
      .filter(
        (
          prop, // filter for data already added
        ) => !Object.keys(this.formModel).includes(prop.property),
      )
      .forEach((prop) => (this.formModel[prop.property] = null));
  }

  created() {
    this.populateModel();
    const formFactory = new FormFactory(this.formSchema);
    this.formComponents = formFactory.buildForm();
  }

  saveForm() {
    this.confirmCallback(
      Object.fromEntries(
        Object.entries(this.formModel).filter(([key, val]) => val !== null),
      ),
    );
  }
}
</script>
