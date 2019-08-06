<template>
  <v-dialog
    v-model="formDisplay"
    max-width="600px"
  >
    <v-form>
      <v-card>
        <v-card-title>
          <v-icon>build</v-icon>
          <span class="headline">Select Project</span>
        </v-card-title>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script>


export default {
  name: 'ProjectForm',
  props: {
    display: {
      type: Boolean,
    },
  },
  data() {
    return {
      formDisplay: this.display,
    };
  },
};
</script>

<style>
.headline {
  margin-left: 15px;
}
</style>
