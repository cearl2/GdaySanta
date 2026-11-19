(function() {
    var hidden = false;

    function hideSplash() {
        if (hidden) return;
        hidden = true;
        document.documentElement.classList.add('site-loaded');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', hideSplash, { once: true });
    } else {
        hideSplash();
    }

    window.setTimeout(hideSplash, 2000);
})();
