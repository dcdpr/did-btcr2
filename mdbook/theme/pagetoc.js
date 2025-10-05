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
  const active_li = document.querySelector("mdbook-sidebar-scrollbox ol > li:has(> a.active)");
  if (active_li) {
    active_li.insertAdjacentHTML("afterend", '<li class="expanded"><ol class="pagetoc section"></ol></li>');
  }

  return document.querySelector(".pagetoc");
};

function getChapterNumber() {
  const chapter_label_number = document.querySelector("mdbook-sidebar-scrollbox ol > li > a.active > strong");

  return chapter_label_number.textContent;
}

function updateFunction() {
  if (scrollTimeout) return; // Skip updates if within the cooldown period from a click
  const headers = [...document.getElementsByClassName("header")];
  const scrolledY = window.scrollY;
  let lastHeader = null;

  // Find the last header that is above the current scroll position
  for (let i = headers.length - 1; i >= 0; i--) {
    if (scrolledY >= headers[i].offsetTop) {
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
  let last_level = 1;
  let last_section = null;

  headers.forEach(header => {
    const level = parseInt(header.parentElement.tagName.substring(1) - 1);
    if (level > 0) {
      // TODO: This logic isn't correct. It doesn't create a tree.
      if (level != last_level) {
        if (last_section) {
          tree.push(last_section);
        }
        last_level = level;
        last_section = [];
      }

      (last_section || tree).push(header);
    }
  });

  if (last_section) {
    tree.push(last_section);
  }

  return tree;
}

function createSection(list_root, chapter_number, tree) {
  tree.forEach((header, i) => {
    if (Array.isArray(header)) {
      const list_item = Object.assign(document.createElement("li"), {
        className: "chapter-item expanded",
      });
      const ordered_list = Object.assign(document.createElement("ol"), {
        className: "section",
      });
      list_item.appendChild(ordered_list);
      createSection(ordered_list, `${chapter_number}${i}.`, header);
      list_root.appendChild(list_item);
    } else {
      console.log("header: ", header);
      const parent = header.parentElement
      if (!parent.classList.contains("toc-ignore")) {
        const list_item = Object.assign(document.createElement("li"), {
          className: "chapter-item expanded",
        });
        const section_number = Object.assign(document.createElement("strong"), {
          textContent: `${chapter_number}${i + 1}. `,
          ariaHidden: "true",
        });
        const link = Object.assign(document.createElement("a"), {
          textContent: [...parent.childNodes].map(({ textContent }) => textContent).join(''),
          href: header.href,
        });
        link.insertAdjacentElement("afterbegin", section_number);
        list_item.appendChild(link);
        list_root.appendChild(list_item);
      }
    }
  });
}

window.addEventListener('load', () => {
  const pagetoc = getPagetoc();
  if (!pagetoc) return;
  const chapter_number = getChapterNumber();
  const tree = headersIntoTree([...document.getElementsByClassName("header")]);
  createSection(pagetoc, chapter_number, tree);

  updateFunction();
  listenActive();
  window.addEventListener("scroll", updateFunction);
});

