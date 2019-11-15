<template>
  <div style="height: 100%">
    <TheNavbar />
    <PopupLoader />
    <NotificationBar />
    <keep-alive>
      <router-view style="height:100%" />
    </keep-alive>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import NotificationBar from '@/components/layout/NotificationBar.vue';
import TheNavbar from '@/components/layout/TheNavbar.vue';
import PopupLoader from '@/components/layout/PopupLoader.vue';
import Store from '@/store/store';
import { useStore } from 'vuex-simple';

@Component({
  components: {
    TheNavbar,
    NotificationBar,
    PopupLoader,
  },
})
export default class extends Vue {
  store: Store = useStore(this.$store);
  created() {
    this.store.settings.getSettings();
  }
}
</script>
