// Check if the URL belongs to GA4
function isGA4Hit(url: string): boolean {
    try {
        const urlObj = new URL(url);
        const params = new URLSearchParams(urlObj.search);

        const tid = params.get('tid');
        const cid = params.get('cid');
        const v = params.get('v');

        return !!tid && tid.startsWith('G-') && !!cid && v === '2';
    } catch (e) {
        console.error('Error parsing URL:', e);
        return false;
    }
}

export default isGA4Hit