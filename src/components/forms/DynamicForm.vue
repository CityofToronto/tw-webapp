<template>
  <v-card>
    <v-form>
      <v-layout
        row
      >
        <v-flex
          v-for="property in properties"
          :key="property.field"
        >
          <component
            :is="property.componentType"
            :label="property.label"
            :v-model="property.value"
          />
        </v-flex>
      </v-layout>
    </v-form>
  </v-card>
</template>


<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { ColDef } from 'ag-grid-community';
import { ColumnTypes } from '../grid/js/grid.functions';

const getColumnType = (columnType: ColumnTypes) => {
  const componentTypes = {
    booleanColumn: 'v-checkbox',
    numberColumn: 'v-text-field',
    textColumn: 'v-text-field',
  };

  return componentTypes[columnType] || 'v-text-field';
};

interface FormElement {
  field?: string,
  label?: string,
  componentType?: string,
  value?: string,
}

@Component({})
export default class DynamicForm extends Vue {
  @Prop() readonly columnDefs: ColDef[] = [];

  properties: FormElement[] = [];

  created() {
    this.properties = this.columnDefs.map(column => ({
      field: column.field,
      label: column.headerName,
      componentType: getColumnType(<ColumnTypes>column.type),
      value: '',
    }));
  }
};
</script>

<style>

</style>
