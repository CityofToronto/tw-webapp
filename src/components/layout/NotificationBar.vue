'<template>
  <v-snackbar
    v-model="notificationVisible"
    :timeout="10000"
    color="error"
    top
    dark
  >
    {{ notification.message }}
    <v-btn
      dark
      text
      @click="notificationVisible = false"
    >
      Close
    </v-btn>
  </v-snackbar>
</template>

<script>

import { mapActions, mapGetters } from 'vuex';

export default {
  name: 'NotificationBar',
  data() {
    return {
      timeoutLength: 5000,
    };
  },
  computed: {
    notificationVisible: {
      get() {
        return this.$store.state.notification.visible;
      },
      set() {
        this.popNotification();
      },
    },
    ...mapGetters('notification', [
      'notification',
    ]),
  },
  methods: {
    ...mapActions('notification', [
      'popNotification',
    ]),
  },
};
</script>

<style>

</style>
