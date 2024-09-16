// returns the current root domain of the website by a cookie test method.

function getRootDomain(): string {
  const domainParts: string[] = document.location.hostname.split('.');
  for (let i = 1; i < domainParts.length; i++) {
    const testDomain: string = domainParts.slice(-i).join('.');
    document.cookie = `testcookie=1; domain=${testDomain}; path=/`;
  
    if (document.cookie.includes('testcookie=1')) {
      // Cookie was successfully set, now clean up and return root domain
      document.cookie = `testcookie=1; domain=${testDomain}; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`;
      return testDomain;
    }
  }
  
  // If no valid domain was found, fallback to document.location.hostname
  return document.location.hostname;
}
  
export default getRootDomain;