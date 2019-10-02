<template>
  <v-toolbar dense flat>
    <v-toolbar-title>
      {{ gridTitle | capitalize }}
    </v-toolbar-title>

    <v-spacer />

    <!-- Center Buttons -->

    <v-tooltip
      v-for="item in centerItems"
      :key="item.text"
      bottom
      open-delay="500"
    >
      <template v-slot:activator="{ on }">
        <v-btn
          text
          color="primary"
          v-on="on"
          @click="clickEmitter(item.clickType)"
        >
          <v-icon left class="tool-icon">
            {{ item.icon }}
          </v-icon>
          {{ item.text }}
        </v-btn>
      </template>
      <span>{{ item.tooltip }}</span>
    </v-tooltip>

    <v-spacer v-if="!!rightItems.length" />

    <!-- Right Buttons -->
    <div>
      <v-btn
        v-for="item in rightItems"
        :key="item.text"
        color="primary"
        text
        @click="clickEmitter(item.clickType)"
      >
        {{ visible }}
      </v-btn>
    </div>
  </v-toolbar>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { useStore } from 'vuex-simple';
import Store from '@/store/store';

export enum ToolbarOperations {
  AddRow = 'addRow',
  CloneRow = 'cloneRow',
  RemoveRow = 'removeRow',
  FitColumns = 'fitColumns',
  SizeColumns = 'sizeColumns',
  TogglePanel = 'togglePanel',
  EditLinks = 'editLinks',
  MarkDoesNotExist = 'markDoesNotExist',
  CollapseAll = 'collapseAll',
}

enum Position {
  Left,
  Center,
  Right,
}

interface GridFunction {
  icon?: string;
  text: string;
  clickType: ToolbarOperations;
  tooltip: string;
  position: Position;
}

@Component
export default class GridToolbar extends Vue {
  @Prop(Array) readonly toolbarItems!: string[];

  @Prop({ default: '' }) readonly gridTitle!: string;

  store: Store = useStore(this.$store);

  gridFunctions: GridFunction[] = [
    {
      icon: 'add_circle',
      text: 'Add',
      clickType: ToolbarOperations.AddRow,
      tooltip: 'Add a New Row to Grid',
      position: Position.Center,
    },
    {
      icon: 'file_copy',
      text: 'Clone',
      clickType: ToolbarOperations.CloneRow,
      tooltip: 'Clone Currently Selected Row(s)',
      position: Position.Center,
    },
    {
      icon: 'remove_circle',
      text: 'Toggle Existence',
      clickType: ToolbarOperations.MarkDoesNotExist,
      tooltip: 'Mark All Selected Rows as Does Not Exist',
      position: Position.Center,
    },
    {
      icon: 'expand_less',
      text: 'Collapse All',
      clickType: ToolbarOperations.CollapseAll,
      tooltip: 'Close All Currently Open Groups',
      position: Position.Center,
    },
    {
      icon: 'remove_circle',
      text: 'Remove',
      clickType: ToolbarOperations.RemoveRow,
      tooltip: 'Remove Currently Selected Row(s)',
      position: Position.Center,
    },
    {
      icon: 'link',
      text: 'Edit Links',
      clickType: ToolbarOperations.EditLinks,
      tooltip: 'Edit Relational Links',
      position: Position.Center,
    },
    {
      icon: 'tune',
      text: 'Fit',
      clickType: ToolbarOperations.FitColumns,
      tooltip: 'Size Columns to Fit Grid',
      position: Position.Center,
    },
    {
      icon: 'sort',
      text: 'Size',
      clickType: ToolbarOperations.SizeColumns,
      tooltip: 'Size Columns to Fit Their Contents',
      position: Position.Center,
    },
    {
      icon: undefined,
      text: '',
      clickType: ToolbarOperations.TogglePanel,
      tooltip: 'Toggle Side Panel',
      position: Position.Right,
    },
  ];

  get visible() {
    return this.store.display.reviewPanelState ? 'Close Panel' : 'Expand Panel';
  }

  get centerItems() {
    return this.gridFunctions.filter(
      (func) =>
        func.position === Position.Center &&
        this.toolbarItems.includes(func.clickType),
    );
  }

  get rightItems() {
    return this.gridFunctions.filter(
      (func) =>
        func.position === Position.Right &&
        this.toolbarItems.includes(func.clickType),
    );
  }

  clickEmitter(clickType: string) {
    this.$emit('toolbarClick', clickType);
  }
}
</script>

<style scoped>
.tool-icon {
  overflow: visible;
  font-size: 22px;
}
.v-toolbar {
  border-bottom: 0.5px solid #e2e2e2;
}
.sub-menu {
  font-size: 12px;
}
</style>
