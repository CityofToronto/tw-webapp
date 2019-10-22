<template>
  <v-layout column>
    <v-flex md6></v-flex>
    <v-flex md6></v-flex>
  </v-layout>
</template>

<script lang="ts">
import apolloClient from '@/apollo';
import { Vue, Component } from 'vue-property-decorator';

@Component({})
export default class ProjectForm extends Vue {
  data = {};
}
</script>
