<template>
  <v-card>
    <v-card-title>
      Edit {{tableName}}
    </v-card-title>
    <v-card-text>
      <v-layout
        column
      >
        <v-flex
          v-for="column in properties"
          :key="column.field"
        >
          <component
            :is="getColumnType(column.colType)"
            :label="column.headerName"
            :readonly="column.field === 'id'"
            :items="column.colType === 'selectColumn' ? column.cellEditorParams.values: undefined"
            v-model="data[column.field]"
          />
        </v-flex>
      </v-layout>
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
    </v-card-text>
  </v-card>
</template>


<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { ColDef } from 'ag-grid-community';
import * as _ from 'lodash';
import { ColumnTypes } from '../grid/js/grid.functions';

interface FormData {
  [key: string]: string,
}

@Component({})
export default class DynamicForm extends Vue {
  @Prop(String) readonly tableName!: string;

  @Prop(Array) readonly columnDefs!: ColDef[];

  @Prop({ default: () => {} }) readonly formData!: {};

  @Prop({ default: false }) readonly formDisplay!: boolean;

  properties: ColDef[] = this.columnDefs.filter(column => column.field !== undefined);

  data: FormData = this.formData;


  beforeMount() {
    this.columnDefs.filter(column => column.field !== undefined).forEach((column) => {
      this.data[<string>column.field] = this.data[<string>column.field] ? this.data[<string>column.field] : '';
    });
  };

  getColumnType = (columnType: ColumnTypes) => {
    const componentTypes = {
      booleanColumn: 'v-checkbox',
      numberColumn: 'v-text-field',
      textColumn: 'v-text-field',
      selectColumn: 'v-select',
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
