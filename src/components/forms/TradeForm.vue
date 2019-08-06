<template>
  <v-form>
    <v-card>
      <v-card-title>
        <v-icon>build</v-icon>
        <span class="headline">Edit Trade</span>
      </v-card-title>
      <v-card-text>
        <v-container grid-list-md>
          <v-layout wrap>
            <v-flex
              xs12
              sm6
              md6
            >
              <v-select
                v-model="form.tradeType"
                label="Trade Type"
                :items="TRADE_TYPES.map(x=>x.name)"
              />
            </v-flex>
            <v-flex xs6>
              <v-text-field
                v-model="form.tradeQuantity"
                label="Trade Quantity"
                required
              />
            </v-flex>
            <v-flex xs6>
              <v-text-field
                v-model="form.utilization"
                label="Wrench Time Utilization (%)"
                required
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
import { required, minLength } from 'vuelidate/lib/validators';
import gql from 'graphql-tag';

export default {
  name: 'TradeForm',
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
        tradeType: this.data ? this.data.tradeType : '',
        tradeQuantity: this.data ? this.data.tradeQuantity : 0,
        utilization: this.data ? this.data.utilization : 0,
      },

      TRADE_TYPES: [],
    };
  },
  methods: {
    saveForm() {
      this.$emit('save-form', this.$data.form);
    },
  },
  validations: {
    procedureName: {
      required,
      minLength: minLength(5),
    },
  },
  apollo: {
    TRADE_TYPES: {
      query: gql`
      {
        TRADE_TYPES {
          name
        }
      }`,
      prefetch: true,
    },
  },
};
</script>

<style>
.headline {
  margin-left: 15px;
}
</style>
