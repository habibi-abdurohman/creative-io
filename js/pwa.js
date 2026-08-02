(() => {
    'use strict';
    const isSubfolder = window.location.pathname.includes('/pages/') || window.location.pathname.includes('/collab/');
    const rootPrefix = isSubfolder ? '../' : './';
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register(rootPrefix + 'service-worker.js')
                .then(registration => console.log('PWA: Service Worker berhasil didaftarkan.', registration.scope))
                .catch(error => console.error('PWA: Service Worker gagal didaftarkan.', error));
        });
    }
    window.deferredPrompt = null;
    let installCompleted = false;
    function isAppStandalone() {
        return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    }
    function getPlatform() {
        const userAgent = navigator.userAgent || '';
        const isIOS = /iPad|iPhone|iPod/i.test(userAgent)
            || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        const isAndroid = /Android/i.test(userAgent);
        const isMobile = navigator.userAgentData?.mobile === true || isIOS || isAndroid;
        return { isIOS, isAndroid, isMobile };
    }
    function getTopInstallBridge() {
        if (window.top === window) return null;
        try {
            const bridge = window.top.creativePwaInstall;
            if (bridge && typeof bridge.isPromptAvailable === 'function' && typeof bridge.prompt === 'function') {
                return bridge;
            }
        } catch {
        }
        return null;
    }
    function hasInstallPrompt() {
        if (window.deferredPrompt) return true;

        const bridge = getTopInstallBridge();
        if (!bridge) return false;

        try {
            return bridge.isPromptAvailable();
        } catch {
            return false;
        }
    }
    function hasCustomInstallUi() {
        return Boolean(
            document.getElementById('pwaInstallContainer')
            || document.getElementById('navbar-container')
            || document.getElementById('pageFrame')
        );
    }
    function setInstallButtonContent(button, mode) {
        if (!button) return;
        const icon = document.createElement('span');
        icon.className = 'icon';
        icon.setAttribute('aria-hidden', 'true');
        icon.textContent = mode === 'prompt' ? '\uD83D\uDCF1' : '\u2139\uFE0F';

        button.replaceChildren(icon, document.createTextNode(mode === 'prompt' ? ' Install App' : ' Cara Install'));
        button.dataset.installMode = mode;
    }
    function hideInstallButton() {
        const installContainer = document.getElementById('pwaInstallContainer');
        if (installContainer) installContainer.style.display = 'none';
    }
    window.showPwaButton = function() {
        const installContainer = document.getElementById('pwaInstallContainer');
        const installButton = document.getElementById('pwaInstallBtn');
        if (!installContainer) return;
        const topBridge = getTopInstallBridge();
        let installedInShell = false;
        try {
            installedInShell = topBridge?.isInstalled?.() === true;
        } catch {
            installedInShell = false;
        }
        if (isAppStandalone() || installCompleted || installedInShell) {
            hideInstallButton();
            return;
        }
        if (hasInstallPrompt()) {
            installContainer.style.display = 'block';
            setInstallButtonContent(installButton, 'prompt');
            return;
        }
        if (getPlatform().isMobile) {
            installContainer.style.display = 'block';
            setInstallButtonContent(installButton, 'manual');
            return;
        }

        hideInstallButton();
    };
    function notifyEmbeddedPages() {
        if (window.top !== window) return;
        document.querySelectorAll('iframe').forEach(frame => {
            try {
                frame.contentWindow?.showPwaButton?.();
            } catch {
            }
        });
    }
    function showManualInstallInstructions() {
        const platform = getPlatform();
        if (platform.isIOS) {
            alert("Untuk menginstal di iPhone/iPad:\n1. Buka menu Bagikan (Share) di browser.\n2. Pilih 'Tambahkan ke Layar Utama' (Add to Home Screen).");
            return;
        }
        if (platform.isAndroid) {
            alert("Chrome belum menyediakan dialog instalasi otomatis.\n\nTekan menu tiga titik (\u22EE) di Chrome, pilih 'Tambahkan ke layar utama', lalu pilih 'Instal aplikasi'.\n\nAgar tombol instalasi langsung tersedia, ketuk halaman dan gunakan situs setidaknya 30 detik, lalu coba lagi.");
            return;
        }
        alert("Gunakan menu browser, lalu pilih 'Install App' atau 'Tambahkan ke Layar Utama'.");
    }
    async function promptFromThisWindow() {
        const promptEvent = window.deferredPrompt;
        if (!promptEvent) return { outcome: 'unavailable' };
        try {
            const promptResult = promptEvent.prompt();
            const promptResponse = promptResult && typeof promptResult.then === 'function'
                ? await promptResult
                : promptResult;
            let outcome = promptResponse?.outcome || promptResponse?.userChoice;
            if (!outcome && promptEvent.userChoice) {
                const legacyChoice = await promptEvent.userChoice;
                outcome = legacyChoice?.outcome || legacyChoice?.userChoice;
            }
            installCompleted = outcome === 'accepted';
            return { outcome: outcome || 'dismissed' };
        } catch (error) {
            console.warn('PWA: Dialog instalasi tidak dapat dibuka.', error);
            return { outcome: 'unavailable' };
        } finally {
            window.deferredPrompt = null;
            window.showPwaButton();
            notifyEmbeddedPages();
        }
    }
    if (window.top === window) {
        window.creativePwaInstall = {
            isPromptAvailable: () => Boolean(window.deferredPrompt),
            isInstalled: () => installCompleted || isAppStandalone(),
            prompt: promptFromThisWindow
        };
    }
    window.addEventListener('beforeinstallprompt', event => {
        if (!hasCustomInstallUi()) return;
        event.preventDefault();
        window.deferredPrompt = event;
        console.log('PWA: Browser menyediakan dialog instalasi.');
        window.showPwaButton();
        notifyEmbeddedPages();
    });
    window.triggerPWAInstall = async () => {
        let result;
        if (window.deferredPrompt) {
            result = await promptFromThisWindow();
        } else {
            const bridge = getTopInstallBridge();
            if (bridge?.isPromptAvailable()) {
                result = await bridge.prompt();
            }
        }
        if (!result || result.outcome === 'unavailable') {
            showManualInstallInstructions();
        }
        window.showPwaButton();
    };
    window.addEventListener('appinstalled', () => {
        console.log('PWA: Aplikasi berhasil diinstal.');
        installCompleted = true;
        window.deferredPrompt = null;
        hideInstallButton();
        notifyEmbeddedPages();
    });
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', window.showPwaButton, { once: true });
    } else {
        window.showPwaButton();
    }
})();
