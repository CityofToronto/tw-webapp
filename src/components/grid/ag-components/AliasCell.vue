<template>
  <span>
    {{ cellValue }}
  </span>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { ICellRendererParams } from 'ag-grid-community';

export interface AliasCellParams extends ICellRendererParams {
  aliasColumn: string;
}

/**
 * This component maps the id to another column value
 * Used in grouping where we group by id but display the name to the user
 */
@Component({})
export default class AliasCell extends Vue {
  params!: AliasCellParams;

  get cellValue(): string {
    if (this.params.data && this.params.data[this.params.aliasColumn]) {
      return this.params.data[this.params.aliasColumn];
    }
    return 'unknown';
  }
}
</script>
