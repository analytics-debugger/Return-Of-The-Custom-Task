import storageHelper from '../../src/helpers/storageHelper';

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


/**
 * Handles attribution tracking for the current RequestModel.
 * 
 * This function checks if the request contains session start information, campaign data, 
 * and campaign details events. If any of these are missing, the request is returned unchanged.
 * Otherwise, it configures attribution tracking settings, such as ignored referrals and the cookie name.
 * 
 * @param request - The RequestModel object to be processed.
 * @param attributionModel: string = 'last_click'
 * @param storeName - The name of the cookie to be used for attribution (default: '__ad_attribution').
 * @param ignoredReferrals - The custom list of ignored referrals to be merged with default values.
 * @returns The unchanged RequestModel object if conditions are not met or after processing.
 */

const attributionTrackingTask = (
  request: RequestModel, 
  attributionModel: string = 'last_click', 
  storeName: string = 'ad_attribution', 
  ignoredReferrals: string[]
): RequestModel => {

  const isSessionStart: boolean = request.events.some(event => '_ss' in event);
  const hasCampaignData: boolean = 'cs' in request.sharedPayload;
  const hasCampaignDetailsEvent: boolean = request.events.some(event => event.en === 'campaign_details');

  // well, well, well, let's ignore this request
  if (!isSessionStart && !hasCampaignData && !hasCampaignDetailsEvent) {
    return request;
  }

  // TO-DO Need to update this list based on GA4 internal list
  const defaultIgnoredReferrals = ['tagassistant.google.com'];
  const defaultOrganicEngines = [
    'daum', 'eniro', 'naver', 'pchome', 'images.google', 'www.google', 'yahoo', 'www.yahoo', 
    'msn', 'www.bing', 'aol', 'lycos', 'ask', 'cnn', 'virgilio', 'baidu', 'alice', 'yandex', 
    'najdi', 'seznam', 'rakuten', 'biglobe', 'goo.ne', 'search.smt.docomo', 'onet', 'kvasir', 
    'terra', 'rambler', 'conduit', 'babylon', 'search-results', 'avg', 'comcast', 'incredimail', 
    'startsiden', 'go.mail.ru', 'centrum.cz', '360.cn', 'sogou', 'tut.by', 'globo', 'ukr', 
    'so.com', 'haosou.com', 'auone'
  ];  

  // Config File
  const config = {
    storeName: storeName || '__ad_attribution',
    ignoredReferrals: defaultIgnoredReferrals.concat(ignoredReferrals),
    organicEngines: defaultOrganicEngines,
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
    config.organicEngines.some(engine => referrerUrl?.hostname.includes(engine) ?? false);

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
  // TO-DO. apply attributionModel, for not it's all last_click
  /*if(attributionModel === 'last_click') {
    console.log('MERGE STUFF', {
      first: campaignDetails, 
      last: campaignDetails
    });

  }else if(attributionModel === 'last_click_non_direct') {
    console.log('MERGE STUFF', {
      first: campaignDetails, 
      last: campaignDetails
    });
  } else if(attributionModel === 'last_click_non_direct_asdasd') {
    console.log('MERGE STUFF', {
      first: campaignDetails, 
      last: campaignDetails
    });
  }c
    */
  console.log('MERGE STUFF',JSON.stringify([campaignDetails, campaignDetails]));
  storageHelper.set(storeName, JSON.stringify([campaignDetails, campaignDetails]));
  // Write to cookie
  return request;
};

  
export default attributionTrackingTask;
  