<template>
  <v-dialog
    v-model="display"
    max-width="600px"
  >
    <!-- <component
      :is="component"
      v-if="display"
      :data="data"
      :display="display"
      :trade-type="'Helper'"
      @close-form="closeForm"
      @save-form="saveForm"
    /> -->
    <DynamicForm
      :column-defs="columnDefs"
    />
  </v-dialog>
</template>
<script>
import DynamicForm from './DynamicForm.vue';

const emptyObject = {}

export default {
  name: 'FormLoader',
  components: {
    DynamicForm,
  },
  props: {
    data: {
      required: false,
      default: emptyObject,
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
    type: {
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
