<template>
  <v-alert
    v-if="!validType"
    type="warning"
    prominent
    width="50%"
    class="alert"
  >
    The "{{ tableName }}" table you are defining does not exist.
  </v-alert>
  <v-layout
    v-else
    row
    fill-height
    pa-3
  >
    <v-flex
      xs4
      fill-height
      pr-3
    >
      <form-panel />
    </v-flex>
    <v-flex
      xs9
    >
      <v-sheet
        height="100%"
        elevation="1"
      >
        <v-tabs
          dense
          fixed-tabs
          background-color="primary"
          dark
          style="height:100%"
        >
          <v-tab
            v-for="tab in tabs"
            :key="tab.name"
          >
            {{ tab.name }}
          </v-tab>
          <v-tab-item
            v-for="tab in tabs"
            :key="tab.name"
            transition="none"
            reverse-transition="none"
            style="height: 100%"
          >
            <v-layout
              v-if="tab.relation === 'manyToMany'"
              column
              fill-height
            >
              <v-flex
                xs-7
                fill-height
                py1
              >
                <grid-with-toolbar
                  :mini-toolbar="true"
                  :simple-toolbar="true"
                  :table-name="tab.name"
                  :grid-title="'All ' + tab.name"
                  :draggable="true"
                  :editable="false"
                />
              </v-flex>
              <v-flex
                xs-5
                fill-height
                @dragover.prevent
                @dragend.prevent
                @drop.prevent
              >
                <grid-with-toolbar
                  :grid-type="'drag'"
                  :mini-toolbar="true"
                  :simple-toolbar="true"
                  :relation="tab.relation"
                  :table-name="tab.name"
                  :depends-on="tableName"
                  :grid-title="'Applied ' + tab.name"
                />
              </v-flex>
            </v-layout>
            <v-layout
              v-else
              column
              fill-height
            >
              <v-flex
                xs12
                fill-height
              >
                <grid-with-toolbar
                  :relation="tab.relation"
                  :table-name="tab.name"
                  :grid-title="tab.name"
                  :mini-toolbar="true"
                  :grid-side-bar="false"
                />
              </v-flex>
            </v-layout>
          </v-tab-item>
        </v-tabs>
      </v-sheet>
    </v-flex>
  </v-layout>
</template>

<script>
import GridWithToolbar from '@/components/grid/GridWithToolbar.vue';
import FormPanel from '@/components/FormPanel.vue';
import { getRelationships } from '@/components/grid/apollo';


export default {
  components: {
    FormPanel,
    GridWithToolbar,
  },
  data() {
    return {

      tabs: [

      ],
      tableName: this.$route.params.type,
      relationships: null,
    };
  },
  computed: {
    validType() {
      const types = ['activity'];
      return types.includes(this.tableName);
    },
  },
  async created() {
    // On Load, query relationships and determine if they are manyToMany or oneToMany
    const relationships = await getRelationships({
      tableName: this.tableName,
    });

    this.tabs = relationships.map(relation => ({
      name: relation.name.includes('_') ? relation.name.split('_')[1] : relation.name,
      relation: relation.name.includes('_') ? 'manyToMany' : 'oneToMany',
    }));
  },
};
</script>

<style>
.v-window {
  height: calc(100% - 48px);
}
.v-window__container {
  height: 100%;
}
</style>
