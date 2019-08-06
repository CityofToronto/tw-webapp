'<template>
  <v-snackbar
    v-model="notificationVisible"
    :timeout="10000"
    :bottom="getNotification.bottom"
    :top="getNotification.top"
    :right="getNotification.right"
    :left="getNotification.left"
    color="error"
    dark
    auto-height
  >
    {{ getNotification.message }}
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
        this.clearNotification();
      },
    },
    ...mapGetters('notification', [
      'getNotification',
    ]),
  },
  methods: {
    ...mapActions('notification', [
      'clearNotification',
    ]),
  },
};
</script>

<style>

</style>
