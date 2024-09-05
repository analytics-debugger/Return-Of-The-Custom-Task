interface StorageHelper {
    sync(name: string): void;
    get(name: string): string | null;
    set(name: string, value: string, days?: number, path?: string, domain?: string): void;
  }
  
  const storageHelper: StorageHelper = {
    sync(name: string): void {
        const cookie = document.cookie.split('; ').find(row => row.startsWith(name + '='));
        const valueFromLocalStorage = localStorage.getItem(name);
      
        const valueFromCookie = cookie ? cookie.split('=')[1] : null;
      
        if (valueFromCookie !== null) {
          const decodedValue = decodeURIComponent(valueFromCookie);
          const timestampFromCookie = parseInt(decodedValue.split(':')[0], 10);
          const timestampFromLocalStorage = valueFromLocalStorage ? parseInt(valueFromLocalStorage.split(':')[0], 10) : 0;
      
          if (timestampFromCookie > timestampFromLocalStorage) {
            localStorage.setItem(name, decodedValue);
          } else if (timestampFromLocalStorage > timestampFromCookie) {
            if (valueFromLocalStorage !== null) {
              document.cookie = `${name}=${encodeURIComponent(valueFromLocalStorage)}; path=/; SameSite=Strict; Secure`;
            }
          }
        } else {
          // Handle case where cookie is null
          if (valueFromLocalStorage !== null) {
            document.cookie = `${name}=${encodeURIComponent(valueFromLocalStorage)}; path=/; SameSite=Strict; Secure`;
          }
        }
      },
  
    get(name: string): string | null {
      this.sync(name);
      const value = localStorage.getItem(name);
      return value ? value.split(':')[1] || null : null;
    },
  
    set(name: string, value: string, days: number = 7, path: string = '/', domain: string = ''): void {
      const timestamp = Date.now();
      const valueWithTimestamp = `${timestamp}:${value}`;
      
      const encodedValue = encodeURIComponent(valueWithTimestamp);
      
      localStorage.setItem(name, valueWithTimestamp);
  
      const expires = new Date(Date.now() + days * 864e5).toUTCString();
      document.cookie = `${name}=${encodedValue}; expires=${expires}; path=${path}; domain=${domain}; SameSite=Strict; Secure`;
    }
  };
  
  export default storageHelper;
  