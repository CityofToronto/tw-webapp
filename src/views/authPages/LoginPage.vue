<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>Login</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-form>
              <v-text-field
                v-model="email"
                label="Email"
                name="email"
                prepend-icon="mail"
                type="text"
                required
                :error-messages="emailErrors"
                @input="$v.email.$touch()"
                @blur="$v.email.$touch()"
              ></v-text-field>

              <v-text-field
                id="password"
                v-model="password"
                label="Password"
                name="password"
                prepend-icon="lock"
                type="password"
                required
                :error-messages="passwordErrors"
                @input="$v.password.$touch()"
                @blur="$v.password.$touch()"
              ></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" :disabled="$v.$invalid" @click="login">
              Login
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import Store from '@/store/store';
import { required, email } from 'vuelidate/lib/validators';
import { useStore } from 'vuex-simple';
import { validationMixin } from 'vuelidate';

@Component({
  validations: {
    email: { required, email },
    password: { required },
  },
})
export default class LoginPage extends Mixins(validationMixin) {
  email = '';

  password = '';

  store: Store = useStore(this.$store);

  get passwordErrors() {
    const errors: string[] = [];
    if (!this.$v.password) return [];
    if (!this.$v.password.$dirty) return [];
    if (!this.$v.password.required) errors.push('Password is required.');
    return errors;
  }

  get emailErrors() {
    const errors: string[] = [];
    if (!this.$v.email) return errors;
    if (!this.$v.email.$dirty) return errors;
    if (!this.$v.email.email) errors.push('Must be a valid e-mail.');
    if (!this.$v.email.required) errors.push('Email is required.');
    return errors;
  }

  login() {
    this.store.auth
      .logUserIn(this.email)
      .then(() => this.$router.push('home'))
      .catch((error) => this.$toast(error, { type: 'info', timeout: 2000 }));
  }
}
</script>
