let scrollTimeout;

function listenActive() {
  const elems = document.querySelectorAll(".pagetoc li > a");
  [...elems].forEach(el => {
    el.addEventListener("click", (event) => {
      clearTimeout(scrollTimeout);
      [...elems].forEach(el => el.classList.remove("active"));
      el.classList.add("active");
      // Prevent scroll updates for a short period
      scrollTimeout = setTimeout(() => {
        scrollTimeout = null;
      }, 100); // Adjust timing as needed
    });
  });
};

const getPagetoc = () => document.querySelector(".pagetoc") || autoCreatePagetoc();

function autoCreatePagetoc() {
  const activeLi = document.querySelector("mdbook-sidebar-scrollbox ol > li:has(> a.active)");
  if (activeLi) {
    activeLi.insertAdjacentHTML("afterend", '<li class="expanded"><ol class="pagetoc section"></ol></li>');
  }

  return document.querySelector(".pagetoc");
};

function getChapterNumber() {
  const chapter_label_number = document.querySelector("mdbook-sidebar-scrollbox ol > li > a.active > strong");

  return chapter_label_number?.textContent || "";
}

function updateFunction() {
  if (scrollTimeout) return; // Skip updates if within the cooldown period from a click
  const menubarHeight = parseFloat(window.getComputedStyle(document.querySelector("#menu-bar .menu-title")).height);
  const headers = [...document.getElementsByClassName("header")];
  const scrolledY = window.scrollY;
  let lastHeader = null;

  // Find the last header that is above the current scroll position
  for (let i = headers.length - 1; i >= 0; i--) {
    let marginTop = menubarHeight + parseFloat(window.getComputedStyle(headers[i])["font-size"]) / 2;
    if (scrolledY >= headers[i].offsetTop - marginTop) {
      lastHeader = headers[i];
      break;
    }
  }

  const pagetocLinks = [...document.querySelectorAll(".pagetoc li > a")];
  pagetocLinks.forEach(link => link.classList.remove("active"));

  if (lastHeader) {
    const activeLink = pagetocLinks.find(link => lastHeader.href === link.href);
    if (activeLink) activeLink.classList.add("active");
  }
};

function headersIntoTree(headers) {
  const tree = [];
  const stack = [];
  let items = tree;
  let lastLevel = 1;

  headers.forEach(header => {
    const level = parseInt(header.parentElement.tagName.substring(1) - 1);
    if (level > 0) {
      if (level > lastLevel) {
        lastLevel = level;
        stack.push(items);
        items.push([]);
        items = items.slice(-1)[0];
      } else if (level < lastLevel) {
        lastLevel = level;
        items = stack.pop();
      }

      items.push(header);
    }
  });

  return tree;
}

function createSection(listRoot, chapterNumber, tree) {
  let i = 1;
  tree.forEach(header => {
    if (Array.isArray(header)) {
      const listItem = document.createElement("li");
      const ordered_list = Object.assign(document.createElement("ol"), {
        className: "section",
      });
      listItem.appendChild(ordered_list);
      createSection(ordered_list, chapterNumber ? `${chapterNumber}${i - 1}.` : "", header);
      listRoot.appendChild(listItem);
    } else {
      const parent = header.parentElement
      if (!parent.classList.contains("toc-ignore")) {
        const listItem = Object.assign(document.createElement("li"), {
          className: "chapter-item expanded",
        });
        const section_number = Object.assign(document.createElement("strong"), {
          textContent: chapterNumber ? `${chapterNumber}${i}. ` : "",
          ariaHidden: "true",
        });
        const link = Object.assign(document.createElement("a"), {
          textContent: [...parent.childNodes].map(({ textContent }) => textContent).join(''),
          href: header.href,
        });
        link.insertAdjacentElement("afterbegin", section_number);
        listItem.appendChild(link);
        listRoot.appendChild(listItem);

        i += 1;
      }
    }
  });
}

window.addEventListener('load', () => {
  if (location.pathname.endsWith('/bibliography.html')) return;
  const pagetoc = getPagetoc();
  if (!pagetoc) return;
  const chapterNumber = getChapterNumber();
  const tree = headersIntoTree([...document.getElementsByClassName("header")]);
  createSection(pagetoc, chapterNumber, tree);

  updateFunction();
  listenActive();
  window.addEventListener("scroll", updateFunction);
});

