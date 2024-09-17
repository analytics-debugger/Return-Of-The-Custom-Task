interface StorageHelper {
  sync(name: string): void;
  get(name: string): string | null;
  set(name: string, value: string, days?: number, path?: string, domain?: string): void;
  getDecodedCookie<T = any>(name: string): T | null;
}
  

interface StorageHelper {
  sync(name: string): void;
  get(name: string): string | null;
  set(name: string, value: string, days?: number, path?: string, domain?: string): void;
  getDecodedCookie<T = any>(name: string): T | null;
}

const storageHelper: StorageHelper = {
  sync(name: string): void {
    try {
      let valueFromCookie: string | null = null;
      try {
        valueFromCookie = this.getDecodedCookie<string>(name);
      } catch (error) {
      }

      const valueFromLocalStorage = localStorage.getItem(name);
      this.set(name, valueFromCookie || valueFromLocalStorage || '');
    } catch (error) {
      console.error('Error in sync method:', error);
    }
  },
  
  get(name: string): string | null {
    try {
      // Uncomment the following line if you want to ensure synchronization before getting the value
      // this.sync(name);
      const value = localStorage.getItem(name);
      return value || null;
    } catch (error) {
      console.error('Error in get method:', error);
      return null;
    }
  },
  
  set(name: string, value: string, days: number = 7, path: string = '/', domain: string = ''): void {
    try {
      const safeValue = btoa(value);
      const expires = new Date(Date.now() + days * 864e5).toUTCString();
      document.cookie = `${name}=${safeValue}; expires=${expires}; path=${path}; domain=${domain}; SameSite=Strict; Secure`;
      localStorage.setItem(name, value);
    } catch (error) {
      console.error('Error in set method:', error);
    }
  },
  
  getDecodedCookie<T = any>(name: string): T | null {
    try {
      const cookie = document.cookie.split('; ').find(row => row.startsWith(name + '='));
      if (!cookie) return null;
      const encodedValue = cookie.split('=')[1];
      return JSON.parse(atob(encodedValue)) as T;
    } catch (error) {
      console.error('Error decoding cookie:', error);
      return null;
    }
  }
};

  
  
export default storageHelper;
  