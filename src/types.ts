import { CookieAttributes } from 'js-cookie';

export interface Cookie {
  value: string;
  options: CookieAttributes;
  isDeleted?: boolean;
}

export interface CookieBag {
  [key: string]: Cookie;
}

export interface CookieRaw {
  [key: string]: string;
}

export interface Cookies {
  defaultOptions: CookieAttributes;

  /**
   * Get a cookies by its key, undefined if cookies doesn't exist
   * @param key
   */
  get(key: string): string | undefined;

  /**
   * Get all cookies
   */
  getAll(): CookieBag;

  /**
   * Set a cookie by its key
   * @param key
   * @param value
   * @param options
   */
  set(key: string, value: string, options?: CookieAttributes): void;

  /**
   * Add all cookies by their key
   * @param values
   */
  fill(values: { [key: string]: string }): void;

  /**
   * Delete a cookie by its key. Do nothing if cookies doesn't exist
   * @param key
   * @param options
   */
  delete(key: string, options: CookieAttributes): void;
}
