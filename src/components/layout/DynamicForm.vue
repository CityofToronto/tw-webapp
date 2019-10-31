<template>
  <v-card>
    <v-card-title>{{ popupData.popupTitle }}</v-card-title>
    <!-- <v-divider /> -->
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
        :readonly="!!column.readonly"
        :items="column.cellEditorParams ? column.cellEditorParams.values : []"
        :params="column.cellEditorParams ? column.cellEditorParams : []"
      />
    </v-card-text>
    <v-divider />
    <v-card-actions>
      <v-spacer />
      <v-btn
        v-if="!!popupData.cancelButtonText"
        color="blue darken-1"
        text
        @click="popupData.cancelCallback()"
      >
        {{ popupData.cancelButtonText }}
      </v-btn>
      <v-btn
        color="blue darken-1"
        text
        @click="popupData.confirmCallback(data)"
      >
        {{ popupData.confirmButtonText }}
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
import Store from '@/store/store';
import { useStore } from 'vuex-simple';
import { FormEditorData } from '@/store/modules/popup';

@Component({
  components: {
    TreeviewInput,
  },
})
export default class DynamicForm extends Vue {
  store: Store = useStore(this.$store);

  data: { [p: string]: any } = {};

  get popupData() {
    return this.store.popup.popupProperties as FormEditorData;
  }

  get properties(): BaseColumnParams[] {
    return this.popupData.columnDefs
      .filter((column): boolean =>
        typeof column.showInForm !== 'undefined' ? column.showInForm : true,
      )
      .filter((column): boolean => column.field !== undefined);
  }

  beforeMount() {
    // This repopulates the data, and if it does not exist populate key with empty string
    this.popupData.columnDefs.forEach((column): void => {
      if (column.field !== undefined) {
        this.data[column.field] = this.data[column.field]
          ? this.data[column.field]
          : '';
      }
    });
    this.data = { ...this.data, ...this.popupData.formData };
  }

  getColumnType = (columnType: CellType) => {
    const componentTypes: { [key in CellType]: string } = {
      booleanCell: 'v-checkbox',
      numberCell: 'v-text-field',
      textCell: 'v-text-field',
      selectCell: 'v-select',
      treeCell: 'treeview-input',
      rearrangeCell: 'v-text-field',
    };
    return componentTypes[columnType] ?? componentTypes.textCell;
  };

  saveForm() {
    this.$emit('save-form', this.data);
  }
}
</script>
