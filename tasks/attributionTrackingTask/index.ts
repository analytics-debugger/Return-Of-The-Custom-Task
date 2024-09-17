/**
 * Prints the current RequestModel to the console.
 * 
 * @param request - The RequestModel object to be logged.
 * @returns The unchanged RequestModel object.
 */

interface CampaignDetailsModel {
  cm: string; // Medium
  cs: string; // Source
  cn: string; // Campaign Name
  cc: string; // Content
  ct: string; // Term
  ci: string; // Umt ID
  gclid: string; 
  ts: number; // TimeStamp
}

const attributionTrackingTask = (request: RequestModel, ignoredReferrals: string[]): RequestModel => {
  // Config File
  const config = {
    cookieName: '__ad_attribution',
    ignoredReferrals: ['tagassistant.google.com'],
    organicEngines: 'daum,eniro,naver,pchome,images.google,www.google,yahoo,www.yahoo,msn,www.bing,aol,aol,lycos,lycos,ask,cnn,virgilio,baidu,baidu,alice,yandex,najdi,seznam,rakuten,biglobe,goo.ne,search.smt.docomo,onet,onet,kvasir,terra,rambler,conduit,babylon,search-results,avg,comcast,incredimail,startsiden,go.mail.ru,centrum.cz,360.cn,sogou,tut.by,globo,ukr,so.com,haosou.com,auone',
    cookieExpirationDays: 365
  };

  const campaignDetails: CampaignDetailsModel = {
    cm: '',
    cs: '',
    cn: '',
    cc: '',
    ct: '',
    ci: '',
    gclid: '',
    ts: Date.now()
  };

  const { dr: documentReferrer, dl: documentLocation = document.location.href } = request.sharedPayload;

  let referrerUrl: URL | null = null;
  let locationUrl: URL | null = null;
  const urlParams: { [key: string]: string } = {};

  try {
    referrerUrl = documentReferrer ? new URL(documentReferrer) : null;
  } catch {
    referrerUrl = null;
  }

  try {
    locationUrl = new URL(documentLocation);
    const params = new URLSearchParams(locationUrl.search);
    params.forEach((value, key) => {
      urlParams[key] = value;
    });
  } catch {
    locationUrl = null;
  }

  const getRootDomain = (url: string | null): string => {
    const domainParts = (url || document.location.hostname).split('.');
    for (let i = 1; i < domainParts.length; i++) {
      const testDomain = domainParts.slice(-i).join('.');
      document.cookie = `testcookie=1; domain=${testDomain}; path=/`;
      if (document.cookie.includes('testcookie=1')) {
        document.cookie = `testcookie=1; domain=${testDomain}; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`;
        return testDomain;
      }
    }
    return document.location.hostname;
  };

  const isInIgnoredReferrersList = (): boolean =>
    config.ignoredReferrals.some(ref => referrerUrl?.hostname.includes(ref) ?? false);

  const isOrganic = (): boolean =>
    config.organicEngines.split(',').some(engine => referrerUrl?.hostname.includes(engine) ?? false);

  const isGoogleCPC = (): string | null => urlParams.gclid ?? null;

  const isSelfReferral = (): boolean =>
    referrerUrl?.hostname.includes(getRootDomain(document.location.href)) ?? false;

  const isUtmTagged = (): boolean =>
    urlParams.utm_source !== undefined;

  // Main Logic
  if (isGoogleCPC()) {
    campaignDetails.gclid = isGoogleCPC()!;
    campaignDetails.cm = 'cpc';
    campaignDetails.cs = 'google';
    campaignDetails.cn = 'autotagged ad campaign';
  } else if (isUtmTagged()) {
    campaignDetails.cm = urlParams.utm_medium ?? '';
    campaignDetails.cs = urlParams.utm_source ?? '';
    campaignDetails.cn = urlParams.utm_campaign ?? '';
    campaignDetails.cc = urlParams.utm_content ?? '';
    campaignDetails.ct = urlParams.utm_term ?? '';
  } else if (isOrganic()) {
    campaignDetails.cm = 'organic';
    campaignDetails.cs = (referrerUrl?.hostname ?? '').replace('www.', '');
    campaignDetails.cn = '(organic)';
    campaignDetails.ct = '(not provided)';
  } else if (isInIgnoredReferrersList() || isSelfReferral()) {
    campaignDetails.cm = '(none)';
    campaignDetails.cs = '(direct)';
    campaignDetails.cn = '(direct)';
  } else if (documentReferrer) {
    campaignDetails.cm = 'referral';
    campaignDetails.cs = referrerUrl?.hostname ?? '';
    campaignDetails.cn = '(referral)';
    campaignDetails.cc = referrerUrl?.pathname ?? '';
    campaignDetails.ct = '(not set)';
  } else {
    campaignDetails.cm = '(none)';
    campaignDetails.cs = '(direct)';
    campaignDetails.cn = '(direct)';
  }

  console.log(campaignDetails);
  return request;
};

  
export default attributionTrackingTask;
  