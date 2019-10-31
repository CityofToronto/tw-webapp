<template>
  <v-toolbar dense flat>
    <v-toolbar-title>
      {{ gridTitle | capitalize }}
    </v-toolbar-title>

    <v-spacer />

    <!-- Center Buttons -->

    <v-tooltip
      v-for="item in toolbarComputed"
      :key="item.text"
      bottom
      open-delay="300"
    >
      <template v-slot:activator="{ on }">
        <v-btn
          text
          color="primary"
          :disabled="item.disabled"
          v-on="on"
          @click="clickHandler(item.clickFunction)"
        >
          <v-icon v-if="item.icon" left class="tool-icon">
            {{ item.icon }}
          </v-icon>
          {{ item.text }}
        </v-btn>
      </template>
      <span>{{ item.tooltip }}</span>
    </v-tooltip>
  </v-toolbar>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import Store from '@/store/store';
import { ToolbarObject } from './ts/toolbarItems';
import { storeInstance } from '@/store';
import GridInstance from './ts/GridInstance';
import { useStore } from 'vuex-simple';

@Component
export default class GridToolbar extends Vue {
  @Prop({ default: '' }) readonly gridTitle!: string;

  @Prop({ default: () => [] }) readonly toolbarItems!: ToolbarObject[];

  @Prop({ required: true, default: () => {} })
  readonly gridInstance!: GridInstance;

  store: Store = useStore(this.$store);

  get toolbarComputed() {
    return this.toolbarItems.map((item) => ({
      ...item,
      text:
        typeof item.text === 'string' ? item.text : item.text(storeInstance),
      disabled: item.disabled({
        gridInstance: this.gridInstance,
        vueStore: this.store,
      }),
    }));
  }

  // Click handler just passes the parameters into the function
  clickHandler(clickFunction) {
    clickFunction({
      gridInstance: this.gridInstance,
      vueStore: this.store,
    });
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
