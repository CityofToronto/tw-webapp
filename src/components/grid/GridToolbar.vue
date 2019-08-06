<template>
  <v-toolbar
    v-resize="onResize"
    dense
    flat
  >
    <v-toolbar-title
      class="text-capitalize"
    >
      {{ gridTitle }}
    </v-toolbar-title>

    <v-spacer />

    <!-- Center Buttons -->
    <template
      v-if="true"
    >
      <v-tooltip
        v-for="item in listItems"
        :key="item.text"
        bottom
        open-delay="500"
      >
        <template v-slot:activator="{ on }">
          <v-btn
            text
            color="primary"
            v-on="on"
            @click="item.onClick"
          >
            <v-icon
              left
              class="tool-icon"
            >
              {{ item.icon }}
            </v-icon>
            {{ item.text }}
          </v-btn>
        </template>
        <span>{{ item.tooltip }}</span>
      </v-tooltip>
    </template>
    <v-menu
      v-else
      bottom
      left
    >
      <template v-slot:activator="{ on }">
        <v-btn
          icon
          v-on="on"
        >
          <v-icon>more_vert</v-icon>
        </v-btn>
      </template>

      <v-list
        dense
      >
        <v-list-item
          v-for="item in listItems"
          :key="item.text"

          @click="item.onClick"
        >
          <v-list-item-icon>
            <v-icon

              color="primary"
              v-text="item.icon"
            />
          </v-list-item-icon>
          <v-list-item-title color="primary">
            {{ item.text }}
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>


    <v-spacer v-if="!mini" />

    <!-- Right Buttons -->
    <div v-if="!mini">
      <v-btn
        v-for="item in rightItems"

        :key="item.text"
        color="primary"
        text
        @click="item.onClick"
      >
        {{ visible }}
      </v-btn>
    </div>
  </v-toolbar>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component
export default class GridToolbar extends Vue {
  @Prop({ default: false }) readonly mini!: boolean;

  @Prop(Boolean) readonly panelVisible!: boolean;

  @Prop({ default: false }) readonly simple!: boolean;

  @Prop({ default: '' }) readonly gridTitle!: string;

  gridFunctions = [
    {
      icon: 'add_circle',
      text: 'Add',
      onClick: this.add,
      inSimple: false,
      tooltip: 'Add a New Row to Grid',
    },
    {
      icon: 'file_copy',
      text: 'Clone',
      onClick: this.clone,
      inSimple: false,
      tooltip: 'Clone Currently Selected Row(s)',
    },
    {
      icon: 'remove_circle',
      text: 'Remove',
      onClick: this.remove,
      inSimple: false,
      tooltip: 'Remove Currently Selected Row(s)',
    },
    {
      icon: 'tune',
      text: 'Fit',
      onClick: this.fit,
      inSimple: true,
      tooltip: 'Size Columns to Fit Grid',
    },
    {
      icon: 'sort',
      text: 'Size',
      onClick: this.size,
      inSimple: true,
      tooltip: 'Size Columns to Fit Their Contents',
    },
  ];

  windowSize = {
    x: 0,
    y: 0,
  };

  rightItems = [
    {
      icon: null,
      text: '',
      onClick: this.toggle,
    },
  ];

  get visible() {
    return this.panelVisible ? 'Close Panel' : 'Expand Panel';
  };

  get listItems() {
    if (this.simple) {
      return this.gridFunctions.filter(item => item.inSimple === true);
    }
    return this.gridFunctions;
  };

  mounted() {
    this.onResize();
  };

  onResize() {
    this.windowSize = {
      x: this.mini ? window.innerWidth * 0.35 : window.innerWidth * 0.65,
      y: this.mini ? window.innerHeight * 0.35 : window.innerHeight * 0.65,
    };
  };

  toggle() {
    this.$emit('click:toggle');
  };

  add() {
    this.$emit('click:add');
  };

  remove() {
    this.$emit('click:remove');
  };

  fit() {
    this.$emit('click:fit');
  };

  size() {
    this.$emit('click:size');
  };

  clone() {
    this.$emit('click:clone');
  };
};
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
  font-size:12px;
}
</style>
