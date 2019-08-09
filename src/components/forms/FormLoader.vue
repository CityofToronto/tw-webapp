<template>
  <v-dialog
    v-model="display"
    max-width="600px"
  >
    <DynamicForm
      :column-defs="columnDefs"
      :table-name="tableName"
      @close-form="closeForm"
      @save-form="saveForm"
    />
  </v-dialog>
</template>
<script>
import DynamicForm from './DynamicForm.vue';

export default {
  name: 'FormLoader',
  components: {
    DynamicForm,
  },
  props: {
    data: {
      required: false,
      default: () => {},
      type: Object,
    },
    display: {
      required: true,
      type: Boolean,
    },
    columnDefs: {
      required: true,
      type: Array,
    },
    tableName: {
      required: true,
      type: String,
    },
  },
  data() {
    return {
      component: null,
    };
  },
  computed: {
    loader() {
      if (!this.type) {
        return null;
      }
      return () => import(`./${this.type}`);
    },

  },
  mounted() {
    this.loader()
      .then(() => {
        this.component = () => this.loader();
      })
      .catch(() => {
        this.component = () => import('./DynamicForm.vue');
      });
  },
  methods: {
    saveForm(data) {
      this.$emit('save', data);
    },
    closeForm() {
      this.$emit('close');
    },
  },
};
</script>
