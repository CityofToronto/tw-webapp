<template>
  <v-card height="100%" class="flexcard">
    <v-card-title>
      {{ title }}
    </v-card-title>
    <v-card-text class="grow">
      {{ subtitle }}
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn text color="blue lighten-1" :to="route">
        Launch
        <v-icon right>launch</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component({})
export default class ModuleCard extends Vue {
  @Prop({ default: '', required: true }) title!: string;

  @Prop({ default: '', required: true }) subtitle!: string;

  @Prop({ default: '', required: true }) picture!: string;

  @Prop({ default: '', required: true }) route!: string;
}
</script>

<style>
.flexcard {
  display: flex;
  flex-direction: column;
}
</style>
