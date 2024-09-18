var attributionTrackingTask = (function () {
    'use strict';

    var storageHelper = {
        sync: function (name) {
            try {
                var valueFromCookie = null;
                try {
                    valueFromCookie = this.getDecodedCookie(name);
                }
                catch (error) {
                    console.error('Error getting cookie:', error);
                }
                var valueFromLocalStorage = localStorage.getItem(name);
                this.set(name, valueFromCookie || valueFromLocalStorage || '');
            }
            catch (error) {
                console.error('Error in sync method:', error);
            }
        },
        get: function (name) {
            try {
                this.sync(name);
                var value = localStorage.getItem(name);
                return value || null;
            }
            catch (error) {
                console.error('Error in get method:', error);
                return null;
            }
        },
        set: function (name, value, days, path, domain) {
            if (days === void 0) { days = 7; }
            if (path === void 0) { path = '/'; }
            if (domain === void 0) { domain = ''; }
            try {
                var safeValue = btoa(JSON.stringify(value));
                var expires = new Date(Date.now() + days * 864e5).toUTCString();
                document.cookie = "".concat(name, "=").concat(safeValue, "; expires=").concat(expires, "; path=").concat(path, "; domain=").concat(domain, "; SameSite=Strict; Secure");
                localStorage.setItem(name, value);
            }
            catch (error) {
                console.error('Error in set method:', error);
            }
        },
        getDecodedCookie: function (name) {
            try {
                var cookie = document.cookie.split('; ').find(function (row) { return row.startsWith(name + '='); });
                if (!cookie)
                    return null;
                var encodedValue = cookie.split('=')[1];
                return JSON.parse(atob(encodedValue));
            }
            catch (error) {
                console.error('Error decoding cookie:', error);
                return null;
            }
        }
    };

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
    var attributionTrackingTask = function (request, attributionModel, maxAttributionsToBeKept, storeName, ignoredReferrals) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        if (attributionModel === void 0) { attributionModel = 'last_click'; }
        if (maxAttributionsToBeKept === void 0) { maxAttributionsToBeKept = 2; }
        if (storeName === void 0) { storeName = 'ad_attribution'; }
        var isSessionStart = request.events.some(function (event) { return '_ss' in event; });
        var hasCampaignData = 'cs' in request.sharedPayload;
        var hasCampaignDetailsEvent = request.events.some(function (event) { return event.en === 'campaign_details'; });
        var removeEmptyKeys = function (obj) {
            return Object.fromEntries(Object.entries(obj).filter(function (_a) {
                _a[0]; var value = _a[1];
                return value !== '' && value !== undefined && value !== null;
            }));
        };
        // well, well, well, let's ignore this request
        if (!isSessionStart && !hasCampaignData && !hasCampaignDetailsEvent) {
            return request;
        }
        // TO-DO Need to update this list based on GA4 internal list
        var defaultIgnoredReferrals = ['tagassistant.google.com'];
        var defaultOrganicEngines = [
            'daum', 'eniro', 'naver', 'pchome', 'images.google', 'www.google', 'yahoo', 'www.yahoo',
            'msn', 'www.bing', 'aol', 'lycos', 'ask', 'cnn', 'virgilio', 'baidu', 'alice', 'yandex',
            'najdi', 'seznam', 'rakuten', 'biglobe', 'goo.ne', 'search.smt.docomo', 'onet', 'kvasir',
            'terra', 'rambler', 'conduit', 'babylon', 'search-results', 'avg', 'comcast', 'incredimail',
            'startsiden', 'go.mail.ru', 'centrum.cz', '360.cn', 'sogou', 'tut.by', 'globo', 'ukr',
            'so.com', 'haosou.com', 'auone'
        ];
        // Config File
        var config = {
            storeName: storeName || '__ad_attribution',
            ignoredReferrals: defaultIgnoredReferrals.concat(ignoredReferrals),
            organicEngines: defaultOrganicEngines,
            cookieExpirationDays: 365
        };
        var sessionCampaignDetails = {
            cm: '',
            cs: '',
            cn: '',
            cc: '',
            ct: '',
            ci: '',
            gclid: '',
            ts: Date.now()
        };
        var effectiveCampaignDetails = {
            cm: '',
            cs: '',
            cn: '',
            cc: '',
            ct: '',
            ci: '',
            gclid: '',
            ts: Date.now()
        };
        var _j = request.sharedPayload, documentReferrer = _j.dr, _k = _j.dl, documentLocation = _k === void 0 ? document.location.href : _k;
        var referrerUrl = null;
        var locationUrl = null;
        var urlParams = {};
        try {
            referrerUrl = documentReferrer ? new URL(documentReferrer) : null;
        }
        catch (_l) {
            referrerUrl = null;
        }
        try {
            locationUrl = new URL(documentLocation);
            var params = new URLSearchParams(locationUrl.search);
            params.forEach(function (value, key) {
                urlParams[key] = value;
            });
        }
        catch (_m) {
            locationUrl = null;
        }
        var getRootDomain = function (url) {
            var domainParts = (url || document.location.hostname).split('.');
            for (var i = 1; i < domainParts.length; i++) {
                var testDomain = domainParts.slice(-i).join('.');
                document.cookie = "testcookie=1; domain=".concat(testDomain, "; path=/");
                if (document.cookie.includes('testcookie=1')) {
                    document.cookie = "testcookie=1; domain=".concat(testDomain, "; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT");
                    return testDomain;
                }
            }
            return document.location.hostname;
        };
        var isInIgnoredReferrersList = function () {
            return config.ignoredReferrals.some(function (ref) { var _a; return (_a = referrerUrl === null || referrerUrl === void 0 ? void 0 : referrerUrl.hostname.includes(ref)) !== null && _a !== void 0 ? _a : false; });
        };
        var isOrganic = function () {
            return config.organicEngines.some(function (engine) { var _a; return (_a = referrerUrl === null || referrerUrl === void 0 ? void 0 : referrerUrl.hostname.includes(engine)) !== null && _a !== void 0 ? _a : false; });
        };
        var isGoogleCPC = function () { var _a; return (_a = urlParams.gclid) !== null && _a !== void 0 ? _a : null; };
        var isSelfReferral = function () { var _a; return (_a = referrerUrl === null || referrerUrl === void 0 ? void 0 : referrerUrl.hostname.replace('www.', '').includes(getRootDomain(document.location.href))) !== null && _a !== void 0 ? _a : false; };
        var isUtmTagged = function () {
            return urlParams.utm_source !== undefined;
        };
        // Main Logic
        if (isGoogleCPC()) {
            sessionCampaignDetails.gclid = isGoogleCPC();
            sessionCampaignDetails.cm = 'cpc';
            sessionCampaignDetails.cs = 'google';
            sessionCampaignDetails.cn = 'autotagged ad campaign';
        }
        else if (isUtmTagged()) {
            sessionCampaignDetails.cm = (_a = urlParams.utm_medium) !== null && _a !== void 0 ? _a : '';
            sessionCampaignDetails.cs = (_b = urlParams.utm_source) !== null && _b !== void 0 ? _b : '';
            sessionCampaignDetails.cn = (_c = urlParams.utm_campaign) !== null && _c !== void 0 ? _c : '';
            sessionCampaignDetails.cc = (_d = urlParams.utm_content) !== null && _d !== void 0 ? _d : '';
            sessionCampaignDetails.ct = (_e = urlParams.utm_term) !== null && _e !== void 0 ? _e : '';
        }
        else if (isOrganic()) {
            sessionCampaignDetails.cm = 'organic';
            sessionCampaignDetails.cs = ((_f = referrerUrl === null || referrerUrl === void 0 ? void 0 : referrerUrl.hostname) !== null && _f !== void 0 ? _f : '').replace('www.', '');
            sessionCampaignDetails.cn = '(organic)';
            sessionCampaignDetails.ct = '(not provided)';
        }
        else if (isInIgnoredReferrersList() || isSelfReferral()) {
            sessionCampaignDetails.cm = '(none)';
            sessionCampaignDetails.cs = '(direct)';
            sessionCampaignDetails.cn = '(direct)';
        }
        else if (documentReferrer) {
            sessionCampaignDetails.cm = 'referral';
            sessionCampaignDetails.cs = (_g = referrerUrl === null || referrerUrl === void 0 ? void 0 : referrerUrl.hostname) !== null && _g !== void 0 ? _g : '';
            sessionCampaignDetails.cn = '(referral)';
            sessionCampaignDetails.cc = (_h = referrerUrl === null || referrerUrl === void 0 ? void 0 : referrerUrl.pathname) !== null && _h !== void 0 ? _h : '';
            sessionCampaignDetails.ct = '(not set)';
        }
        else {
            sessionCampaignDetails.cm = '(none)';
            sessionCampaignDetails.cs = '(direct)';
            sessionCampaignDetails.cn = '(direct)';
        }
        // Based on the last campaigns and current one we calculate the effective campaign
        var attributionModelsBuilders = {
            last_click: function () {
                // No surprises here, sessionCampaignDetails is the effectiveCampaignDetails    
                effectiveCampaignDetails = sessionCampaignDetails;
            },
            last_click_non_direct: function () {
                // If the current sessionCampaignDetails is Direct, grab last campaign details as effectiveCampaignDetails  
                effectiveCampaignDetails = effectiveCampaignDetails;
            }
        };
        if (attributionModelsBuilders[attributionModel]) {
            attributionModelsBuilders[attributionModel]();
        }
        else {
            console.error('Unknown attribution model');
        }
        var history = JSON.parse(storageHelper.get(storeName) || '[]');
        console.log(history);
        history.push(removeEmptyKeys(effectiveCampaignDetails));
        if (history.length > maxAttributionsToBeKept) {
            // Remove the second item (index 1) and keep the first item (index 0)
            history.splice(1, history.length - maxAttributionsToBeKept);
        }
        console.log('history', history);
        //console.log('MERGE STUFF',effectiveCampaignDetails);
        storageHelper.set(storeName, JSON.stringify(history));
        return request;
    };

    return attributionTrackingTask;

})();
