var attributionTrackingTask = (function () {
    'use strict';

    /**
     * Prints the current RequestModel to the console.
     *
     * @param request - The RequestModel object to be logged.
     * @returns The unchanged RequestModel object.
     */
    var attributionTrackingTask = function (request) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        // Config File
        var config = {
            cookieName: '__ad_attribution',
            ignoredReferrals: ['tagassistant.google.com'],
            organicEngines: 'daum:q eniro:search_word naver:query pchome:q images.google:q www.google:q yahoo:p www.yahoo:q msn:q www.bing:q aol:query aol:q lycos:q lycos:query ask:q cnn:query virgilio:qs baidu:wd baidu:word alice:qs yandex:text najdi:q seznam:q rakuten:qt biglobe:q goo.ne:MT search.smt.docomo:MT onet:qt onet:q kvasir:q terra:query rambler:query conduit:q babylon:q search-results:q avg:q comcast:q incredimail:q startsiden:q go.mail.ru:q centrum.cz:q 360.cn:q sogou:query tut.by:query globo:q ukr:q so.com:q haosou.com:q auone:q'.split(' '),
            cookieExpirationDays: 365
        };
        var campaignDetails = {
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
            return config.organicEngines.some(function (engine) { var _a; return (_a = referrerUrl === null || referrerUrl === void 0 ? void 0 : referrerUrl.hostname.includes(engine.split(':')[0])) !== null && _a !== void 0 ? _a : false; });
        };
        var isGoogleCPC = function () { var _a; return (_a = urlParams.gclid) !== null && _a !== void 0 ? _a : null; };
        var isSelfReferral = function () { var _a; return (_a = referrerUrl === null || referrerUrl === void 0 ? void 0 : referrerUrl.hostname.includes(getRootDomain(document.location.href))) !== null && _a !== void 0 ? _a : false; };
        var isUtmTagged = function () {
            return urlParams.utm_source !== undefined;
        };
        // Main Logic
        if (isGoogleCPC()) {
            campaignDetails.gclid = isGoogleCPC();
            campaignDetails.cm = 'cpc';
            campaignDetails.cs = 'google';
            campaignDetails.cn = 'autotagged ad campaign';
        }
        else if (isUtmTagged()) {
            campaignDetails.cm = (_a = urlParams.utm_medium) !== null && _a !== void 0 ? _a : '';
            campaignDetails.cs = (_b = urlParams.utm_source) !== null && _b !== void 0 ? _b : '';
            campaignDetails.cn = (_c = urlParams.utm_campaign) !== null && _c !== void 0 ? _c : '';
            campaignDetails.cc = (_d = urlParams.utm_content) !== null && _d !== void 0 ? _d : '';
            campaignDetails.ct = (_e = urlParams.utm_term) !== null && _e !== void 0 ? _e : '';
        }
        else if (isOrganic()) {
            campaignDetails.cm = 'organic';
            campaignDetails.cs = ((_f = referrerUrl === null || referrerUrl === void 0 ? void 0 : referrerUrl.hostname) !== null && _f !== void 0 ? _f : '').replace('www.', '');
            campaignDetails.cn = '(organic)';
            campaignDetails.ct = '(not provided)';
        }
        else if (isInIgnoredReferrersList() || isSelfReferral()) {
            campaignDetails.cm = '(none)';
            campaignDetails.cs = '(direct)';
            campaignDetails.cn = '(direct)';
        }
        else if (documentReferrer) {
            campaignDetails.cm = 'referral';
            campaignDetails.cs = (_g = referrerUrl === null || referrerUrl === void 0 ? void 0 : referrerUrl.hostname) !== null && _g !== void 0 ? _g : '';
            campaignDetails.cn = '(referral)';
            campaignDetails.cc = (_h = referrerUrl === null || referrerUrl === void 0 ? void 0 : referrerUrl.pathname) !== null && _h !== void 0 ? _h : '';
            campaignDetails.ct = '(not set)';
        }
        else {
            campaignDetails.cm = '(none)';
            campaignDetails.cs = '(direct)';
            campaignDetails.cn = '(direct)';
        }
        console.log(campaignDetails);
        return request;
    };

    return attributionTrackingTask;

})();
