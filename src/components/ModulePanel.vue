<template>
  <v-layout column>
    <v-flex>
      <v-card>
        <p class="pl-3 py-2">
          <span class="title">{{ title }}</span>
          <span class="description grey--text text--darken-1">
            {{ description }}
          </span>
        </p>
      </v-card>
    </v-flex>
    <v-flex>
      <v-layout row>
        <v-flex
          v-for="subModule in subModules"
          :key="subModule.title"
          xs6
          md4
          lg3
          px-3
        >
          <module-card
            :title="subModule.title"
            :subtitle="subModule.subtitle"
            :route="subModule.route"
            :picture="subModule.picture"
          />
        </v-flex>
      </v-layout>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import ModuleCard from '@/components/ModuleCard.vue';

@Component({
  components: {
    ModuleCard,
  },
})
export default class ModulePanel extends Vue {
  @Prop({ required: true, default: '' }) title!: string;
  @Prop({ required: true, default: '' }) description!: string;
  @Prop({ required: true, default: () => {} }) subModules!: {};
}
</script>
