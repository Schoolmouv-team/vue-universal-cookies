import ClientCookies, { CookieAttributes } from 'js-cookie';
import { CookieOptions, Response } from 'express';
import _Vue, { ComponentOptions } from 'vue';
import { Cookie, CookieBag, CookieRaw, Cookies } from './types';

/**
 * To use cookies on server side
 */
class ServerSide implements Cookies {
  defaultOptions: CookieAttributes;
  cookies: CookieBag;

  constructor(options: CookieAttributes) {
    this.cookies = {};
    this.defaultOptions = options || {};
  }

  get(key: string) {
    if (this.cookies[key]) {
      return this.cookies[key].value;
    }
    return undefined;
  }

  getAll() {
    return this.cookies;
  }

  set(key: string, value: string, options: CookieAttributes = {}) {
    this.cookies[key] = {
      value,
      options: { ...this.defaultOptions, ...options },
    };
  }

  fill(values: CookieRaw) {
    this.cookies = Object.keys(values).reduce((acc, key) => {
      acc[key] = { value: values[key], options: this.defaultOptions };
      return acc;
    }, this.cookies);
  }

  delete(key: string, options: CookieAttributes = {}) {
    if (this.cookies[key]) {
      this.cookies[key].isDeleted = true;
      this.cookies[key].options = {
        ...this.defaultOptions,
        ...this.cookies[key].options,
        ...options,
      };
    }
  }
}

/**
 * To use cookies on client side
 */
class ClientSide implements Cookies {
  defaultOptions: CookieAttributes;

  constructor(options: CookieAttributes) {
    this.defaultOptions = options || {};
  }

  get(key: string) {
    return ClientCookies.get(key);
  }

  getAll() {
    return Object.entries(ClientCookies.get()).reduce((acc, [key, value]) => {
      return {
        [key]: { value },
        ...acc,
      };
    }, {});
  }

  set(key: string, value: string, options: CookieAttributes = {}) {
    ClientCookies.set(key, value, { ...this.defaultOptions, ...options });
  }

  fill(values: CookieRaw) {
    Object.entries(values).forEach(([key, value]) => {
      ClientCookies.set(key, value);
    });
  }

  delete(key: string, options: CookieAttributes = {}) {
    ClientCookies.remove(key, { ...this.defaultOptions, ...options });
  }
}

/**
 * A mixin to attach cookies to all components
 */
// @ts-ignore
export const CookiesMixin: ComponentOptions<any> = {
  beforeCreate() {
    const options = this.$options;
    // cookies injection
    if (options.cookies) {
      this.$cookies =
        typeof options.cookies === 'function'
          ? options.cookies()
          : options.cookies;
    } else if (options.parent && options.parent.$cookies) {
      this.$cookies = options.parent.$cookies;
    }
  },
};

/**
 * It allow to manage cookies both on server side and client side, according to config
 * It must be attach to Vue app into it's constructor, into cookies key
 * @return {ServerSide|ClientSide}
 */
export const initCookies = (options: CookieAttributes): Cookies => {
  if (typeof window === 'undefined') {
    return new ServerSide(options);
  }
  return new ClientSide(options);
};

const getClearOptions = (
  cookie: Cookie | undefined,
  defaultDomain: string | null,
) => {
  if (cookie && cookie.options.domain) return { domain: cookie.options.domain };

  return defaultDomain ? { domain: defaultDomain } : {};
};

/**
 * Execute all stuff to add/edit/delete cookies to express response
 * @param cookies
 * @param reqCookies
 * @param res
 * @param defaultDomain
 */
export const execServerCookies = (
  cookies: CookieBag,
  reqCookies: CookieRaw,
  res: Response,
  defaultDomain: string | null = null,
) => {
  Object.keys(cookies).forEach(key => {
    if (
      !reqCookies[key] ||
      reqCookies[key] !== cookies[key].value ||
      cookies[key].isDeleted
    ) {
      if (cookies[key].isDeleted) {
        const options = getClearOptions(cookies[key], defaultDomain);
        res.clearCookie(key, options);
      } else {
        const options = cookies[key].options as CookieOptions;
        res.cookie(key, cookies[key].value, options);
      }
    }
  });
};

/**
 * Vue plugin
 * Use mixin to attach cookies to components
 */
export default {
  install(Vue: typeof _Vue) {
    Vue.mixin(CookiesMixin);
  },
};
