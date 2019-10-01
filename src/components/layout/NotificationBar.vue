<template>
  <v-snackbar
    v-model="notification.visible"
    :timeout="notification.timeout"
    color="error"
    :top="isPositionActive(positions.Top)"
    :bottom="isPositionActive(positions.Bottom)"
    :left="isPositionActive(positions.Left)"
    :right="isPositionActive(positions.Right)"
    dark
    @input="closeNotification"
  >
    {{ notification.message }}
    <v-btn dark text @click="closeNotification">
      Close
    </v-btn>
  </v-snackbar>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { useStore } from 'vuex-simple';
import Store from '@/store/store';
import { NotificationPosition } from '@/store/modules/notification';

@Component({})
export default class NotificationBar extends Vue {
  store: Store = useStore(this.$store);

  positions = NotificationPosition;

  get notification() {
    return this.store.notification.notification;
  }

  set notification(payload) {
    this.store.notification.popNotification();
  }

  closeNotification() {
    this.store.notification.popNotification();
  }

  isPositionActive(position: NotificationPosition) {
    const positions = this.store.notification.notification.position;
    return positions.includes(position);
  }
}
</script>
