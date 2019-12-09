<template>
  <v-card>
    <v-card-title>{{ title }}</v-card-title>
    <!-- <v-divider /> -->
    <v-card-text style="min-height: 400px">
      <component
        :is="field.component"
        v-for="field in formComponents"
        :key="field.key"
        :items="
          field.component === 'v-data-table' ? formModel[field.key] : undefined
        "
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
import { Component, Prop, Mixins } from 'vue-property-decorator';
import modalMixin from '@/components/mixins/modalMixin';
import TreeviewInput from '@/components/inputs/TreeviewInput.vue';
import { FormSchema } from '@/types/form';
import FormFactory, { FieldComponent } from '@/components/FormFactory';
import {
  VTextField,
  VSelect,
  VSwitch,
  VCheckbox,
  VAutocomplete,
  VDataTable,
} from 'vuetify/lib';

@Component({
  components: {
    TreeviewInput,
    VTextField,
    VSelect,
    VSwitch,
    VCheckbox,
    VAutocomplete,
    VDataTable,
  },
})
export default class DynamicForm extends Mixins(modalMixin) {
  @Prop({ required: true }) formSchema!: FormSchema;

  @Prop({ required: false }) formData!: Record<string, any>;

  @Prop({ required: true }) title!: string;

  @Prop({ required: true }) confirmCallback!: Function;

  @Prop({ required: false, default: () => [] }) sortingOrder!: string[];

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
    this.formSchema.properties = this.formSchema.properties.filter((prop) =>
      prop.readonly // if the prop is readonly, and no data is provided it is omitted
        ? this.formData[prop.property] !== null
        : true,
    );
    const formFactory = new FormFactory(this.formSchema);
    this.formComponents = formFactory.buildForm(this.sortingOrder);
  }

  saveForm() {
    Object.keys(this.formModel).forEach(
      (key) => this.formModel[key] == null && delete this.formModel[key],
    );
    this.confirmCallback(this.closeModal, this.formModel);
  }
}
</script>
