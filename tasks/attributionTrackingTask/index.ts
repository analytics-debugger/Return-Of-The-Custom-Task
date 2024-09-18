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


// Define allowed attribution models
type AttributionModel = 'last_click' | 'last_click_non_direct';

/**
 * Handles attribution tracking for the current RequestModel.
 * 
 * This function checks if the request contains session start information, campaign data, 
 * and campaign details events. If any of these are missing, the request is returned unchanged.
 * Otherwise, it configures attribution tracking settings, such as ignored referrals and the cookie name.
 * 
 * @param request - The RequestModel object to be processed.
 * @param attributionModel: string = 'last_click'
 * @param maxAttributionsToBeKept: number = 2
 * @param storeName - The name of the cookie to be used for attribution (default: '__ad_attribution').
 * @param ignoredReferrals - The custom list of ignored referrals to be merged with default values.
 * @returns The unchanged RequestModel object if conditions are not met or after processing.
 */

const attributionTrackingTask = (
  request: RequestModel,
  attributionModel: AttributionModel = 'last_click',
  maxAttributionsToBeKept: number = 2,
  storeName: string = 'ad_attribution',
  ignoredReferrals: string[]
): RequestModel => {

  const isSessionStart: boolean = request.events.some(event => '_ss' in event);
  const hasCampaignData: boolean = 'cs' in request.sharedPayload;
  const hasCampaignDetailsEvent: boolean = request.events.some(event => event.en === 'campaign_details');
  const removeEmptyKeys = <T extends Record<string, any>>(obj: T): T => {
    return Object.fromEntries(
      Object.entries(obj).filter(([_, value]) => value !== '' && value !== undefined && value !== null)
    ) as T;
  };
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
  
  const createEmptyCampaignDetails = (): CampaignDetailsModel => ({
    cm: '',
    cs: '',
    cn: '',
    cc: '',
    ct: '',
    ci: '',
    gclid: '',
    ts: Date.now()
  });

  const sessionCampaignDetails: CampaignDetailsModel = createEmptyCampaignDetails();
  let effectiveCampaignDetails: CampaignDetailsModel = createEmptyCampaignDetails();
  
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
    referrerUrl?.hostname.replace('www.','').includes(getRootDomain(document.location.href)) ?? false;

  const isUtmTagged = (): boolean =>
    urlParams.utm_source !== undefined;

  // Main Logic
  if (isGoogleCPC()) {
    sessionCampaignDetails.gclid = isGoogleCPC()!;
    sessionCampaignDetails.cm = 'cpc';
    sessionCampaignDetails.cs = 'google';
    sessionCampaignDetails.cn = 'autotagged ad campaign';
  } else if (isUtmTagged()) {
    sessionCampaignDetails.cm = urlParams.utm_medium ?? '';
    sessionCampaignDetails.cs = urlParams.utm_source ?? '';
    sessionCampaignDetails.cn = urlParams.utm_campaign ?? '';
    sessionCampaignDetails.cc = urlParams.utm_content ?? '';
    sessionCampaignDetails.ct = urlParams.utm_term ?? '';
  } else if (isOrganic()) {
    sessionCampaignDetails.cm = 'organic';
    sessionCampaignDetails.cs = (referrerUrl?.hostname ?? '').replace('www.', '');
    sessionCampaignDetails.cn = '(organic)';
    sessionCampaignDetails.ct = '(not provided)';
  } else if (isInIgnoredReferrersList() || isSelfReferral()) {
    sessionCampaignDetails.cm = '(none)';
    sessionCampaignDetails.cs = '(direct)';
    sessionCampaignDetails.cn = '(direct)';
  } else if (documentReferrer) {
    sessionCampaignDetails.cm = 'referral';
    sessionCampaignDetails.cs = referrerUrl?.hostname ?? '';
    sessionCampaignDetails.cn = '(referral)';
    sessionCampaignDetails.cc = referrerUrl?.pathname ?? '';
    sessionCampaignDetails.ct = '(not set)';
  } else {
    sessionCampaignDetails.cm = '(none)';
    sessionCampaignDetails.cs = '(direct)';
    sessionCampaignDetails.cn = '(direct)';
  }

  // Based on the last campaigns and current one we calculate the effective campaign
  const attributionModelsBuilders = {
    last_click: () => {
      // No surprises here, sessionCampaignDetails is the effectiveCampaignDetails    
      effectiveCampaignDetails = sessionCampaignDetails;
    },
    last_click_non_direct: () => {
      // If the current sessionCampaignDetails is Direct, grab last campaign details as effectiveCampaignDetails  
      effectiveCampaignDetails = effectiveCampaignDetails;
    }
  };

  if (attributionModelsBuilders[attributionModel]) {
    attributionModelsBuilders[attributionModel](); 
  } else {
    console.error('Unknown attribution model');
  }
  
  const history = JSON.parse(storageHelper.get(storeName) || '[]');

  history.push(removeEmptyKeys(effectiveCampaignDetails));
  if (history.length > maxAttributionsToBeKept) {
    history.splice(1, history.length - maxAttributionsToBeKept);
  }
  console.log('history',history);
  
  storageHelper.set(storeName, JSON.stringify(history));
  return request;
};

  
export default attributionTrackingTask;
  