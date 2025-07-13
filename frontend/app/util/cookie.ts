import CryptoJS from "crypto-js";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { env } from "~/env";
import log from "~/util/logger";

type CookieKey = "access" | "email";

const set = (
   key: CookieKey,
   value: string,
   options: Cookies.CookieAttributes = {},
): void => {
   if (!env.cookieKey) throw new Error("cookie key not found");
   const encryptedValue = CryptoJS.AES.encrypt(value, env.cookieKey).toString();

   Cookies.set(key, encryptedValue, {
      secure: true,
      sameSite: "Strict",
      expires: options.expires ?? 1,
      ...options,
   });
};

const get = (key: CookieKey): string | null => {
   const encryptedValue = Cookies.get(key);
   if (!encryptedValue) return null;
   if (!env.cookieKey) return null;

   try {
      const bytes = CryptoJS.AES.decrypt(encryptedValue, env.cookieKey);
      return bytes.toString(CryptoJS.enc.Utf8);
   } catch (error) {
      log.error("Error decrypting cookie:", error);
      return null;
   }
};

const remove = (key: CookieKey): void => {
   Cookies.remove(key);
};

const claims = (): Record<string, string> => {
   const result: Record<string, string> = {};
   const token = get("access");
   if (!token) {
      return result;
   }
   const claims = jwtDecode(token);
   for (const [key, val] of Object.entries(claims)) {
      result[key] = val.toString();
   }
   return result;
};

const removeAll = (): void => {
   remove("access");
   remove("email");
};

export const secureCookie = {
   set,
   get,
   remove,
   claims,
   removeAll,
};
