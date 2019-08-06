<template>
  <v-form>
    <v-card>
      <v-card-title>
        <v-icon>build</v-icon>
        <span class="headline">Edit Legislation</span>
      </v-card-title>
      <v-card-text>
        <v-container grid-list-md>
          <v-layout wrap>
            <v-flex
              xs12
            >
              <v-text-field
                v-model="form.description"
                label="Legislation Description"
              />
            </v-flex>
          </v-layout>
        </v-container>
      </v-card-text>
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
    </v-card>
  </v-form>
</template>

<script>

export default {
  name: 'ActivityForm',
  props: {
    data: {
      type: Object,
      required: false,
      default: null,
    },
  },
  data() {
    return {
      form: {
        description: this.data ? this.data.description : '',
      },
      table: null,
    };
  },
  created() {
    apollo.getTableRows({
      tableName: 'legislation',
    });
  },
  methods: {
    saveForm() {
      this.$emit('save-form', this.$data.form);
    },
  },
};
</script>

<style>
.headline {
  margin-left: 15px;
}
</style>
