var attributionTrackingTask = (function () {
    'use strict';

    /**
     * Prints the current RequestModel to the console.
     *
     * @param request - The RequestModel object to be logged.
     * @returns The unchanged RequestModel object.
     */
    var attributionTrackingTask = function (request) {
        // Config File
        var config = {
            cookie_name: '__ad_attribution',
            ignored_referrals: ['tagassistant.google.com'],
            // From ga.js library
            organic_engines: 'daum:q eniro:search_word naver:query pchome:q images.google:q www.google:q yahoo:p www.yahoo:q msn:q www.bing:q aol:query aol:q lycos:q lycos:query ask:q cnn:query virgilio:qs baidu:wd baidu:word alice:qs yandex:text najdi:q seznam:q rakuten:qt biglobe:q goo.ne:MT search.smt.docomo:MT onet:qt onet:q kvasir:q terra:query rambler:query conduit:q babylon:q search-results:q avg:q comcast:q incredimail:q startsiden:q go.mail.ru:q centrum.cz:q 360.cn:q sogou:query tut.by:query globo:q ukr:q so.com:q haosou.com:q auone:q'.split(' '),
            cookie_expiration_days: 365
        };
        var referrer = document.referrer;
        var currentUrl = location.href;
        var attributionDetails = { first: null, current: null };
        var utmValues = { utmcsr: '', utmccn: '', utmcmd: '', utmctr: '', utmcct: '', utmcid: '', utmgclid: '' };
        var isIgnoredReferral = function (_referrer) {
            return config.ignored_referrals.some(function (ref) { return _referrer.match(ref); });
        };
        var isOrganic = function (r, o) {
            return o.some(function (engine) { return r.includes(engine.split(':')[0]); }) ? 0 : -1;
        };
        var getParameterByName = function (name, url) {
            name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
            var regex = new RegExp("[\\?&]".concat(name.toLowerCase(), "=([^&#]*)"));
            var results = regex.exec(url.toLowerCase());
            return results ? decodeURIComponent(results[1].replace(/\+/g, ' ')) : '';
        };
        var hashCode = function (s) {
            var h = 0;
            for (var i = 0; i < s.length; i++) {
                h = Math.imul(31, h) + s.charCodeAt(i) | 0;
            }
            return h;
        };
        var getUrlParts = function (url) {
            if (!url)
                return {};
            var l = document.createElement('a');
            l.href = url;
            return {
                domain: l.hostname.startsWith('www.') ? l.hostname.substring(4) : l.hostname,
                path: l.pathname
            };
        };
        var hashAttribution = function (utmValues) {
            var c = Object.entries(utmValues).filter(function (_a) {
                _a[0]; var value = _a[1];
                return value !== '';
            }).map(function (_a) {
                var key = _a[0], value = _a[1];
                return "".concat(key, "=").concat(value);
            });
            return hashCode(c.join('|')).toString();
        };
        // Logic, if we have a glicd, we can assume it's a google ad let's set the values accordingly    
        if (currentUrl.match(/gclid=([^&]+)/)) {
            var gclidMatch = currentUrl.match(/gclid=([^&]+)/);
            utmValues.utmgclid = gclidMatch[1];
            utmValues.utmcsr = 'google';
            utmValues.utmcmd = 'cpc';
            utmValues.utmccn = 'google ads';
            // Then we need to check the current UTM values
        }
        else if (getParameterByName('utm_source', currentUrl)) {
            utmValues.utmcsr = getParameterByName('utm_source', currentUrl);
            utmValues.utmcmd = getParameterByName('utm_medium', currentUrl) || '(not set)';
            utmValues.utmccn = getParameterByName('utm_campaign', currentUrl) || '(not set)';
            utmValues.utmctr = getParameterByName('utm_term', currentUrl) || '(not set)';
            utmValues.utmcct = getParameterByName('utm_content', currentUrl) || '(not set)';
            // Third is checking the referrer if it's from an organic source
        }
        else if (isOrganic(referrer, config.organic_engines) > -1) {
            var referrerParts = getUrlParts(referrer);
            utmValues.utmcsr = referrerParts.domain;
            utmValues.utmcmd = 'organic';
            utmValues.utmccn = '(not set)';
            utmValues.utmctr = '(not provided)';
            utmValues.utmcct = '(not set)';
        }
        else if (currentUrl.indexOf(getRootDomain(referrer)) === -1) {
            if (isIgnoredReferral(referrer)) {
                utmValues.utmcsr = '(direct)';
                utmValues.utmcmd = '(none)';
                utmValues.utmccn = '(direct)';
                utmValues.utmctr = '(not set)';
                utmValues.utmcct = '(not set)';
            }
            else {
                var referrerParts = getUrlParts(referrer);
                utmValues.utmcsr = referrerParts.domain || '';
                utmValues.utmcmd = 'referral';
                utmValues.utmccn = '(not set)';
                utmValues.utmctr = referrerParts.path || '';
                utmValues.utmcct = '(not set)';
            }
        }
        else {
            utmValues.utmcsr = '(direct)';
            utmValues.utmcmd = '(none)';
            utmValues.utmccn = '(direct)';
            utmValues.utmctr = '(not set)';
            utmValues.utmcct = '(not set)';
        }
        var cookieInfo = getCookie();
        if (!cookieInfo) {
            attributionDetails.first = attributionDetails.current = utmValues;
            setCookie(encodeURIComponent(JSON.stringify(attributionDetails)));
        }
        else if (utmValues.utmcsr !== '(direct)' && hashAttribution(cookieInfo.current) !== hashAttribution(utmValues)) {
            attributionDetails.first = cookieInfo.first;
            attributionDetails.current = utmValues;
            setCookie(encodeURIComponent(JSON.stringify(attributionDetails)));
        }
        // Return the RequestModel object as is
        return request;
    };

    return attributionTrackingTask;

})();
