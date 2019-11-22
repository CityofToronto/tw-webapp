<template>
  <v-card>
    <v-card-title>
      Select Project
      <v-spacer></v-spacer>
      <v-text-field
        v-model="search"
        append-icon="search"
        label="Search"
        single-line
        hide-details
      ></v-text-field>
    </v-card-title>
    <v-card-text>
      <v-data-table
        v-model="selectedItem"
        :items="data"
        :headers="headers"
        :search="search"
        single-select
        show-select
        loading-text="Loading Projects..."
      >
        <template v-slot:item.launch="{ item }">
          <v-icon small @click="showProjectInfo(item.id)">launch</v-icon>
        </template>
      </v-data-table>
    </v-card-text>
    <v-divider></v-divider>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn text @click="store.modal.closeModal(id)">Cancel</v-btn>
      <v-btn text @click="saveProject">Save</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import apolloClient from '@/apollo';
import { Vue, Component, Prop } from 'vue-property-decorator';
import gql from 'graphql-tag';
import { dispatchError } from '../../apollo/lib/utils';
import Store from '@/store/store';
import { useStore } from 'vuex-simple';
import { Project } from '@/store/modules/user/projects';
import { hasuraTableToFormSchema } from '@/components/grid/ts/formAdapter';

interface TableHeader {
  text: string;
  value: string;
  align?: 'start' | 'center' | 'end';
  sortable?: boolean;
  filterable?: boolean;
  divider?: boolean;
  class?: string | string[];
  width?: string | number;
  filter?: (value: any, search: string | null, item: any) => boolean;
}

@Component({})
export default class ProjectForm extends Vue {
  @Prop({ required: true }) id!: number;

  projects!: Project;

  store: Store = useStore(this.$store);

  search = '';

  data = [];

  headers: TableHeader[] = [
    {
      text: 'Project Number',
      value: 'project_number',
    },
    {
      text: 'Project Name',
      value: 'project_name',
    },
    {
      text: 'Role',
      value: 'user_role',
    },
    {
      text: 'Show Details',
      value: 'launch',
    },
  ];

  selectedItem: Project[] = [this.store.project.project];

  saveProject() {
    this.store.project.setProject(this.selectedItem[0]);
    this.store.modal.closeModal(this.id);
    this.$router.go(0);
  }

  created() {
    const tableName = 'user_projects';
    apolloClient
      .query({
        query: gql`{
          ${tableName} {
            id
            project_number
            project_name
            user_role
          }
        } `,
      })
      .then(({ data }) => (this.data = data[tableName]))
      .catch(dispatchError);
  }

  async showProjectInfo(id: number) {
    const formSchema = await hasuraTableToFormSchema('project_details');

    const formData = await apolloClient.queryTable('project_details', {
      id: { _eq: id },
    });

    this.store.modal.createFormModal({
      title: 'Project Details',
      formSchema,
      formData,
      confirmCallback: (closeForm) => {
        closeForm();
      },
    });
  }
}
</script>
