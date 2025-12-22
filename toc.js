// Populate the sidebar
//
// This is a script, and not included directly in the page, to control the total size of the book.
// The TOC contains an entry for each page, so if each page includes a copy of the TOC,
// the total size of the page becomes O(n**2).
class MDBookSidebarScrollbox extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        this.innerHTML = '<ol class="chapter"><li class="chapter-item expanded affix "><a href="index.html">did:btcr2 DID Method</a></li><li class="chapter-item expanded affix "><li class="spacer"></li><li class="chapter-item expanded "><a href="intro.html"><strong aria-hidden="true">1.</strong> Introduction and Motivation</a></li><li class="chapter-item expanded "><a href="conformance.html"><strong aria-hidden="true">2.</strong> Conformance</a></li><li class="chapter-item expanded "><a href="terminology.html"><strong aria-hidden="true">3.</strong> Terminology</a></li><li class="chapter-item expanded "><a href="update-data-distribution.html"><strong aria-hidden="true">4.</strong> BTCR2 Update Data Distribution</a></li><li class="chapter-item expanded "><a href="beacons.html"><strong aria-hidden="true">5.</strong> Beacons</a></li><li><ol class="section"><li class="chapter-item expanded "><a href="beacons/aggregate-beacons.html"><strong aria-hidden="true">5.1.</strong> Aggregate Beacons</a></li></ol></li><li class="chapter-item expanded "><a href="data-structures.html"><strong aria-hidden="true">6.</strong> Data Structures</a></li><li class="chapter-item expanded "><a href="operations.html"><strong aria-hidden="true">7.</strong> Operations</a></li><li><ol class="section"><li class="chapter-item expanded "><a href="operations/create.html"><strong aria-hidden="true">7.1.</strong> Create</a></li><li class="chapter-item expanded "><a href="operations/resolve.html"><strong aria-hidden="true">7.2.</strong> Resolve</a></li><li class="chapter-item expanded "><a href="operations/update.html"><strong aria-hidden="true">7.3.</strong> Update</a></li><li class="chapter-item expanded "><a href="operations/deactivate.html"><strong aria-hidden="true">7.4.</strong> Deactivate</a></li></ol></li><li class="chapter-item expanded "><a href="algorithms.html"><strong aria-hidden="true">8.</strong> Algorithms</a></li><li class="chapter-item expanded "><a href="errors.html"><strong aria-hidden="true">9.</strong> Errors</a></li><li class="chapter-item expanded "><a href="appendix.html"><strong aria-hidden="true">10.</strong> Appendix</a></li><li><ol class="section"><li class="chapter-item expanded "><a href="appendix/privacy-considerations.html"><strong aria-hidden="true">10.1.</strong> Privacy Considerations</a></li><li class="chapter-item expanded "><a href="appendix/security-considerations.html"><strong aria-hidden="true">10.2.</strong> Security Considerations</a></li><li class="chapter-item expanded "><a href="appendix/optimized-smt.html"><strong aria-hidden="true">10.3.</strong> Optimized Sparse Merkle Tree Implementation</a></li></ol></li><li class="chapter-item expanded "><a href="bibliography.html">References</a></li></ol>';
        // Set the current, active page, and reveal it if it's hidden
        let current_page = document.location.href.toString().split("#")[0].split("?")[0];
        if (current_page.endsWith("/")) {
            current_page += "index.html";
        }
        var links = Array.prototype.slice.call(this.querySelectorAll("a"));
        var l = links.length;
        for (var i = 0; i < l; ++i) {
            var link = links[i];
            var href = link.getAttribute("href");
            if (href && !href.startsWith("#") && !/^(?:[a-z+]+:)?\/\//.test(href)) {
                link.href = path_to_root + href;
            }
            // The "index" page is supposed to alias the first chapter in the book.
            if (link.href === current_page || (i === 0 && path_to_root === "" && current_page.endsWith("/index.html"))) {
                link.classList.add("active");
                var parent = link.parentElement;
                if (parent && parent.classList.contains("chapter-item")) {
                    parent.classList.add("expanded");
                }
                while (parent) {
                    if (parent.tagName === "LI" && parent.previousElementSibling) {
                        if (parent.previousElementSibling.classList.contains("chapter-item")) {
                            parent.previousElementSibling.classList.add("expanded");
                        }
                    }
                    parent = parent.parentElement;
                }
            }
        }
        // Track and set sidebar scroll position
        this.addEventListener('click', function(e) {
            if (e.target.tagName === 'A') {
                sessionStorage.setItem('sidebar-scroll', this.scrollTop);
            }
        }, { passive: true });
        var sidebarScrollTop = sessionStorage.getItem('sidebar-scroll');
        sessionStorage.removeItem('sidebar-scroll');
        if (sidebarScrollTop) {
            // preserve sidebar scroll position when navigating via links within sidebar
            this.scrollTop = sidebarScrollTop;
        } else {
            // scroll sidebar to current active section when navigating via "next/previous chapter" buttons
            var activeSection = document.querySelector('#sidebar .active');
            if (activeSection) {
                activeSection.scrollIntoView({ block: 'center' });
            }
        }
        // Toggle buttons
        var sidebarAnchorToggles = document.querySelectorAll('#sidebar a.toggle');
        function toggleSection(ev) {
            ev.currentTarget.parentElement.classList.toggle('expanded');
        }
        Array.from(sidebarAnchorToggles).forEach(function (el) {
            el.addEventListener('click', toggleSection);
        });
    }
}
window.customElements.define("mdbook-sidebar-scrollbox", MDBookSidebarScrollbox);
