// Configure header numbering scheme.
// const numberedHeader = (n) => n; // Identity: No transformation (ambiguous with sub-chapters).
// const numberedHeader = romanNumeral;
const numberedHeader = base26;

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
  const chapterList = document.querySelector("mdbook-sidebar-scrollbox ol");
  if (chapterList) {
    let activeLink = chapterList.querySelector("li > a.active");
    if (activeLink) {
      chapterList.insertAdjacentHTML("afterend", `
        <ol id="header-tree" class="chapter">
          <li class="spacer"></li>
          <li class="chapter-item expanded">
            <a href="${activeLink.href}">
              <strong>${getChapterNumber()}</strong> ${activeLink.lastChild.textContent}
            </a>
            <a class="toggle">
              <div>❱</div>
            </a>
          </li>
          <li>
            <ol class="pagetoc section"></ol>
          </li>
        </ol>
      `);

      function toggleSection(ev) {
        ev.currentTarget.parentElement.classList.toggle("expanded");
      }

      const toggleButton = document.querySelector("#header-tree a.toggle");
      toggleButton.addEventListener("click", toggleSection);
    }
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

function createSection(listRoot, chapterNumber, tree, depth) {
  let i = 1;
  tree.forEach(header => {
    if (Array.isArray(header)) {
      const listItem = document.createElement("li");
      const ordered_list = Object.assign(document.createElement("ol"), {
        className: "section",
      });
      listItem.appendChild(ordered_list);
      createSection(ordered_list, chapterNumber ? `${chapterNumber}${depth === 0 ? numberedHeader(i - 1) : i}.` : "", header, depth + 1);
      listRoot.appendChild(listItem);
    } else {
      const parent = header.parentElement
      if (!parent.classList.contains("toc-ignore")) {
        const listItem = Object.assign(document.createElement("li"), {
          className: "chapter-item expanded",
        });
        const section_number = Object.assign(document.createElement("strong"), {
          textContent: chapterNumber ? `${chapterNumber}${depth === 0 ? numberedHeader(i) : i}. ` : "",
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

function base26(n) {
  let out = '';
  while (n > 0) {
    n--; // shift to 0-based for bijective base-26
    out = String.fromCharCode(97 + (n % 26)) + out;
    n = Math.floor(n / 26);
  }
  return out;
}

function romanNumeral(n) {
  const map = [
    [1000, 'm'], [900, 'cm'], [500, 'd'], [400, 'cd'],
    [100, 'c'],  [90,  'xc'], [50,  'l'], [40,  'xl'],
    [10,  'x'],  [9,   'ix'], [5,   'v'], [4,   'iv'],
    [1,   'i']
  ];
  let out = '';
  for (const [value, symbol] of map) {
    if (n === 0) break;
    const count = Math.floor(n / value);
    if (count) {
      out += symbol.repeat(count);
      n -= value * count;
    }
  }
  return out;
}

window.addEventListener('load', () => {
  if (location.pathname.endsWith('/bibliography.html')) return;
  const pagetoc = getPagetoc();
  if (!pagetoc) return;
  const chapterNumber = getChapterNumber();
  const tree = headersIntoTree([...document.getElementsByClassName("header")]);
  createSection(pagetoc, chapterNumber, tree, 0);

  updateFunction();
  listenActive();
  window.addEventListener("scroll", updateFunction);
});

