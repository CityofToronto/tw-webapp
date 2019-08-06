<template>
  <v-card
    height="100%"
    elevation="1"
  >
    <v-card-title>
      Define Fields
    </v-card-title>
    <v-layout
      column
      pa-3
    >
      <v-flex
        v-for="property in properties"
        :key="property.field"
        xs6
      >
        <component
          :is="property.component"
          :label="property.name"
          :v-model="property.value"
        />
      </v-flex>

      <v-flex
        xs6
        align-self-end
      >
        <v-btn
          text
          color="primary"
        >
          Cancel
        </v-btn>
        <v-btn
          text
          color="primary"
        >
          Submit
        </v-btn>
      </v-flex>
    </v-layout>
  </v-card>
</template>

<script>

export default {
  data() {
    return {
      properties: [
        {
          field: 'name',
          name: 'Name of Activity',
          component: 'v-text-field',
          value: '',
        },
        {
          field: 'action',
          name: 'Action',
          component: 'v-text-field',
          value: '',
        },
        {
          field: 'wrenchTime',
          name: 'Wrench Time (hr)',
          component: 'v-text-field',
          value: '',
        },
      ],
    };
  },
};
</script>

<style>

</style>
