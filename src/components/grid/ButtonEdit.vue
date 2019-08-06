<template>
  <v-icon
    class="edit-button"
    @click.stop="invokeParentMethod"
  >
    create
  </v-icon>
</template>

<script>
export default {
  name: 'ButtonEdit',
  methods: {
    invokeParentMethod() {
      // * Runs the launchFormEditor function in the parent component
      this.params.context.componentParent.launchFormEditor(this.params.node);
      this.params.context.componentParent.gridApi.clearFocusedCell();
    },
  },
};
</script>

<style scoped>
.edit-button {
  font-size:18px;
  color: #BDBDBD;
}

.edit-button:hover {
  color: #616161;
}
</style>
