(function () {
    function initTabs(root) {
        const tablist = root.querySelector('[role="tablist"]');
        if (!tablist) return;

        const tabs = Array.from(root.querySelectorAll('[role="tab"]'));
        const panels = Array.from(root.querySelectorAll('[role="tabpanel"]'));
        const groupId = root.id || `tabs-${Math.random().toString(36).slice(2)}`;
        if (!root.id) root.id = groupId;

        // Map tab -> panel
        const byId = Object.fromEntries(panels.map(p => [p.id, p]));

        function setActive(tabEl, { pushHash = false } = {}) {
            tabs.forEach(t => {
                const isActive = t === tabEl;
                t.classList.toggle('is-active', isActive);
                t.setAttribute('aria-selected', isActive ? 'true' : 'false');
                t.tabIndex = isActive ? 0 : -1;

                const panelId = t.getAttribute('aria-controls');
                const panel = byId[panelId];
                if (panel) {
                    if (isActive) panel.removeAttribute('hidden');
                    else panel.setAttribute('hidden', '');
                }
            });

            // Remember per-group in sessionStorage
            try {
                sessionStorage.setItem(`tabs:${groupId}`, tabEl.id);
            } catch { }

            // Optional: sync URL hash to the active panel for deep-linking
            if (pushHash) {
                const panelId = tabEl.getAttribute('aria-controls');
                if (panelId) {
                    const url = new URL(location.href);
                    url.hash = panelId;
                    history.replaceState(null, '', url);
                }
            }
        }

        // Click to activate
        tabs.forEach(t => {
            t.addEventListener('click', () => setActive(t, { pushHash: true }));
            t.addEventListener('keydown', (ev) => {
                const i = tabs.indexOf(document.activeElement);
                if (i === -1) return;
                if (ev.key === 'ArrowRight') {
                    ev.preventDefault();
                    const next = tabs[(i + 1) % tabs.length];
                    next.focus();
                    setActive(next, { pushHash: true });
                } else if (ev.key === 'ArrowLeft') {
                    ev.preventDefault();
                    const prev = tabs[(i - 1 + tabs.length) % tabs.length];
                    prev.focus();
                    setActive(prev, { pushHash: true });
                } else if (ev.key === 'Home') {
                    ev.preventDefault();
                    tabs[0].focus();
                    setActive(tabs[0], { pushHash: true });
                } else if (ev.key === 'End') {
                    ev.preventDefault();
                    tabs[tabs.length - 1].focus();
                    setActive(tabs[tabs.length - 1], { pushHash: true });
                }
            });
        });

        // Initial state: use hash > session > first tab
        const fromHash = location.hash && panels.find(p => `#${p.id}` === location.hash);
        const savedTabId = (() => { try { return sessionStorage.getItem(`tabs:${groupId}`); } catch { return null; } })();
        const savedTab = savedTabId && root.querySelector(`#${CSS.escape(savedTabId)}`);

        if (fromHash) {
            const tabForHash = root.querySelector(`[role="tab"][aria-controls="${fromHash.id}"]`);
            if (tabForHash) setActive(tabForHash);
            else setActive(tabs[0]);
        } else if (savedTab) {
            setActive(savedTab);
        } else {
            // Ensure one tab is active (default: first with aria-selected="true", else first)
            const preSelected = tabs.find(t => t.getAttribute('aria-selected') === 'true') || tabs[0];
            setActive(preSelected);
        }
    }

    function initAll() {
        document.querySelectorAll('.tabs').forEach(initTabs);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAll);
    } else {
        initAll();
    }
})();
