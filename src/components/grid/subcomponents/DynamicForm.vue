<template>
  <v-card>
    <v-card-title>
      Edit {{ tableName | capitalize }}
    </v-card-title>
    <v-divider />
    <v-card-text style="height: 600px">
      <component
        :is="getColumnType(column.colType)"
        v-for="column in properties"
        :key="column.field"
        v-model="data[column.field]"
        class="mb-3"
        :outlined="true"
        :label="column.headerName"
        :readonly="column.field === 'id'"
        :hide-details="true"
        :items="column.cellEditorParams ? column.cellEditorParams.values : []"
      />
    </v-card-text>
    <v-divider />
    <v-card-actions>
      <v-spacer />
      <v-btn
        color="blue darken-1"
        text
        @click="$emit('close-form')"
      >
        Cancel
      </v-btn>
      <v-btn
        color="blue darken-1"
        text
        @click="saveForm"
      >
        Save
      </v-btn>
    </v-card-actions>
  </v-card>
</template>


<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { ColDef } from 'ag-grid-community';
import TreeviewInput from '@/components/form/TreeviewInput.vue';

interface FormData {
  [key: string]: string;
}

@Component({
  components: {
    TreeviewInput,
  },
})
export default class DynamicForm extends Vue {
  @Prop(String) readonly tableName!: string;

  @Prop(Array) readonly columnDefs!: ColDef[];

  @Prop({ default: () => {} }) readonly formData!: {};

  @Prop({ default: false }) readonly formDisplay!: boolean;

  properties: ColDef[] = this.columnDefs.filter((column) => column.field !== undefined);

  data: FormData = this.formData;

  beforeMount() {
    this.columnDefs.filter((column) => column.field !== undefined).forEach((column) => {
      this.data[<string>column.field] = this.data[<string>column.field] ? this.data[<string>column.field] : '';
    });
  };

  getColumnType = (columnType: ColumnTypes) => {
    const componentTypes: {[key in ColumnTypes]: string} = {
      booleanColumn: 'v-checkbox',
      numberColumn: 'v-text-field',
      textColumn: 'v-text-field',
      selectColumn: 'v-select',
      treeColumn: 'treeview-input',
    };
    return componentTypes[columnType];
  }

  saveForm() {
    this.$emit('save-form', this.data);
  };
};
</script>

<style>

</style>
