<template>
  <v-card>
    <v-card-title>Project Details</v-card-title>
    <v-card-text></v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn text @click="store.modal.closeModal(id)">Close</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import Store from '@/store/store';
import { useStore } from 'vuex-simple';

@Component({})
export default class ProjectDetails extends Vue {
  @Prop({ required: true }) id!: number;

  @Prop({ required: true }) projectId!: number;

  store: Store = useStore(this.$store);
}
</script>
