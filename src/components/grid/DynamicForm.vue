<template>
  <v-card>
    <v-card-title>Edit {{ tableName | capitalize }}</v-card-title>
    <v-divider />
    <v-card-text style="height: 600px">
      <component
        :is="getColumnType(column.cellType)"
        v-for="column in properties"
        :key="column.field"
        v-model="data[column.field]"
        class="mb-3"
        :outlined="true"
        :label="column.headerName"
        :hide-details="true"
        :items="column.cellEditorParams ? column.cellEditorParams.values : []"
        :params="column.cellEditorParams ? column.cellEditorParams : []"
      />
    </v-card-text>
    <v-divider />
    <v-card-actions>
      <v-spacer />
      <v-btn color="blue darken-1" text @click="$emit('close-form')">
        Cancel
      </v-btn>
      <v-btn color="blue darken-1" text @click="saveForm">
        Save
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { ColDef } from 'ag-grid-community';
import TreeviewInput from '@/components/form/TreeviewInput.vue';
import { CellType } from '@/types/grid';
import { QueryType } from '@/types/api';
import { BaseColumnParams } from '@/types/config';
import { MarkRequired } from 'ts-essentials';

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

  @Prop(Array) readonly columnDefs!: MarkRequired<
    BaseColumnParams,
    'showInForm'
  >[];

  @Prop({ default: () => {} }) readonly formData!: {};

  @Prop({ default: false }) readonly formDisplay!: boolean;

  @Prop(String) readonly queryType!: QueryType;

  data: FormData = this.formData;

  get properties(): BaseColumnParams[] {
    return this.columnDefs
      .filter((column): boolean => column.showInForm)
      .filter((column): boolean => column.field !== undefined);
  }

  beforeMount() {
    // This prepopulates the data, and if it does not exist populate key with empty string
    this.columnDefs.forEach((column): void => {
      if (column.field !== undefined) {
        this.data[column.field] = this.data[column.field]
          ? this.data[column.field]
          : '';
      }
    });
  }

  getColumnType = (columnType: CellType) => {
    const componentTypes: { [key in CellType]: string } = {
      [CellType.booleanCell]: 'v-checkbox',
      [CellType.numberCell]: 'v-text-field',
      [CellType.textCell]: 'v-text-field',
      [CellType.selectCell]: 'v-select',
      [CellType.treeCell]: 'treeview-input',
      [CellType.aliasCell]: 'v-text-field',
      [CellType.rearrangeCell]: 'v-text-field',
    };
    return componentTypes[columnType] || [CellType.textCell];
  };

  saveForm() {
    this.$emit('save-form', this.data);
  }
}
</script>
