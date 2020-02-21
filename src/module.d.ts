import Vue from 'vue';
import { Cookies } from './types';

declare module 'vue/types/vue' {
  interface Vue {
    $cookies: Cookies;
  }
}

declare module 'vue/types/options' {
  interface ComponentOptions<V extends Vue> {
    cookies: Cookies;
  }
}

declare module 'vuex' {
  interface Store<S> {
    cookies: Cookies;
  }
}
