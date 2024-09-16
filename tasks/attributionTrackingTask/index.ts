/**
 * Prints the current RequestModel to the console.
 * 
 * @param request - The RequestModel object to be logged.
 * @returns The unchanged RequestModel object.
 */

interface CampaignDetails {
  medium: string;
  source: string;
  campaign: string;
  content: string;
  term: string;
  id: string;
  gclid: string;
  timestamp: number;
}

const attributionTrackingTask = (request: RequestModel): RequestModel => {
  // Config File
  const config = {
    cookieName: '__ad_attribution',
    ignoredReferrals: ['tagassistant.google.com'],
    organicEngines: 'daum:q eniro:search_word naver:query pchome:q images.google:q www.google:q yahoo:p www.yahoo:q msn:q www.bing:q aol:query aol:q lycos:q lycos:query ask:q cnn:query virgilio:qs baidu:wd baidu:word alice:qs yandex:text najdi:q seznam:q rakuten:qt biglobe:q goo.ne:MT search.smt.docomo:MT onet:qt onet:q kvasir:q terra:query rambler:query conduit:q babylon:q search-results:q avg:q comcast:q incredimail:q startsiden:q go.mail.ru:q centrum.cz:q 360.cn:q sogou:query tut.by:query globo:q ukr:q so.com:q haosou.com:q auone:q'.split(' '),
    cookieExpirationDays: 365
  };

  const campaignDetails: CampaignDetails = {
    medium: '',
    source: '',
    campaign: '',
    content: '',
    term: '',
    id: '',
    gclid: '',
    timestamp: Date.now()
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
    config.organicEngines.some(engine => referrerUrl?.hostname.includes(engine.split(':')[0]) ?? false);

  const isGoogleCPC = (): string | null => urlParams.gclid ?? null;

  const isSelfReferral = (): boolean =>
    referrerUrl?.hostname.includes(getRootDomain(document.location.href)) ?? false;

  const isUtmTagged = (): boolean =>
    urlParams.utm_source !== undefined;

  // Main Logic
  if (isGoogleCPC()) {
    campaignDetails.gclid = isGoogleCPC()!;
    campaignDetails.medium = 'cpc';
    campaignDetails.source = 'google';
    campaignDetails.campaign = 'autotagged ad campaign';
  } else if (isUtmTagged()) {
    campaignDetails.medium = urlParams.utm_medium ?? '';
    campaignDetails.source = urlParams.utm_source ?? '';
    campaignDetails.campaign = urlParams.utm_campaign ?? '';
    campaignDetails.content = urlParams.utm_content ?? '';
    campaignDetails.term = urlParams.utm_term ?? '';
  } else if (isOrganic()) {
    campaignDetails.medium = 'organic';
    campaignDetails.source = (referrerUrl?.hostname ?? '').replace('www.', '');
    campaignDetails.campaign = '(organic)';
    campaignDetails.term = '(not provided)';
  } else if (isInIgnoredReferrersList() || isSelfReferral()) {
    campaignDetails.medium = '(none)';
    campaignDetails.source = '(direct)';
    campaignDetails.campaign = '(direct)';
  } else if (documentReferrer) {
    campaignDetails.medium = 'referral';
    campaignDetails.source = referrerUrl?.hostname ?? '';
    campaignDetails.campaign = '(referral)';
    campaignDetails.content = referrerUrl?.pathname ?? '';
    campaignDetails.term = '(not set)';
  } else {
    campaignDetails.medium = '(none)';
    campaignDetails.source = '(direct)';
    campaignDetails.campaign = '(direct)';
  }

  console.log(campaignDetails);
  return request;
};

  
export default attributionTrackingTask;
  