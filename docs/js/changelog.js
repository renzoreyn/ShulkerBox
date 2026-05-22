/** Parse CHANGELOG.md and show in a modal popup. */

const Changelog = (() => {
  const CHANGELOG_URLS = ["CHANGELOG.md", "../CHANGELOG.md"];

  let modalEl = null;
  let scrollRoot = null;
  let lastFocus = null;
  let mounted = false;
  let mountPromise = null;

  function plainText(text) {
    return String(text)
      .replace(/`—`/g, "`-`")
      .replace(/`\u2014`/g, "`-`")
      .replace(/\u2014/g, ": ")
      .replace(/\u2013/g, ", ")
      .replace(/—/g, ": ")
      .replace(/–/g, ", ");
  }

  function parseMarkdown(md) {
    md = plainText(md);
    const entries = [];
    const blocks = md.split(/\n## \[/).slice(1);

    for (const block of blocks) {
      const headerEnd = block.indexOf("]");
      if (headerEnd < 0) continue;
      const headerRest = block.slice(headerEnd + 1);
      const titleLine = block.slice(0, headerEnd);
      const version = titleLine.trim();
      const dateMatch = headerRest.match(/^\s*-\s*(\d{4}-\d{2}-\d{2})/);
      const date = dateMatch ? dateMatch[1] : "";
      const linkMatch = block.match(/\[Release\]\(([^)]+)\)/);
      const releaseUrl = linkMatch ? linkMatch[1] : null;

      const body = block.slice(headerRest.indexOf("\n"));
      const sections = [];
      const sectionParts = body.split(/\n### /).slice(1);
      for (const part of sectionParts) {
        const nl = part.indexOf("\n");
        const name = nl >= 0 ? part.slice(0, nl).trim() : part.trim();
        const items = [];
        for (const line of part.split("\n")) {
          const m = line.match(/^-\s+(.+)/);
          if (m) items.push(m[1].trim());
        }
        if (items.length) sections.push({ name, items });
      }

      entries.push({ version, date, releaseUrl, sections });
    }
    return entries;
  }

  async function fetchMarkdown() {
    for (const url of CHANGELOG_URLS) {
      try {
        const res = await fetch(url, { cache: "no-store" });
        if (res.ok) return res.text();
      } catch {
        /* try next */
      }
    }
    throw new Error("Could not load CHANGELOG.md");
  }

  function entryId(version) {
    return `changelog-${version.replace(/\s+/g, "-").toLowerCase()}`;
  }

  function scrollToVersion(version) {
    const el = document.getElementById(entryId(version));
    if (!el) return;
    const root = scrollRoot || el.parentElement;
    if (root && root.scrollHeight > root.clientHeight) {
      const top = el.offsetTop - root.offsetTop - 8;
      root.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    } else {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function renderItem(html) {
    const li = document.createElement("li");
    const safe = plainText(html);
    li.innerHTML = safe.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    return li;
  }

  function renderEntry(entry) {
    const article = document.createElement("article");
    article.className = "changelog-entry";
    article.id = entryId(entry.version);
    if (entry.version === "Unreleased") {
      article.classList.add("unreleased");
    }

    const h3 = document.createElement("h3");
    h3.textContent = entry.version === "Unreleased" ? "Unreleased" : `v${entry.version}`;
    if (entry.releaseUrl) {
      const a = document.createElement("a");
      a.href = entry.releaseUrl;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = h3.textContent;
      h3.textContent = "";
      h3.appendChild(a);
    }
    article.appendChild(h3);

    if (entry.date) {
      const p = document.createElement("p");
      p.className = "date";
      p.textContent = entry.date;
      article.appendChild(p);
    }

    for (const sec of entry.sections) {
      const h4 = document.createElement("h4");
      h4.textContent = sec.name;
      article.appendChild(h4);
      const ul = document.createElement("ul");
      for (const item of sec.items) {
        ul.appendChild(renderItem(item));
      }
      article.appendChild(ul);
    }

    return article;
  }

  function renderNav(entries, navEl) {
    navEl.innerHTML = "";
    for (const entry of entries) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent =
        entry.version === "Unreleased" ? "Unreleased" : `v${entry.version}`;
      btn.dataset.version = entry.version;
      btn.addEventListener("click", () => {
        navEl.querySelectorAll("button").forEach((b) => {
          b.classList.toggle("active", b.dataset.version === entry.version);
        });
        scrollToVersion(entry.version);
      });
      navEl.appendChild(btn);
    }
    const first = navEl.querySelector("button");
    if (first) first.classList.add("active");
  }

  async function mount({ feedEl, navEl, statusEl }) {
    if (mounted) return mountPromise;
    mountPromise = (async () => {
      if (statusEl) {
        statusEl.classList.remove("hidden");
        statusEl.innerHTML =
          '<i data-lucide="loader-circle"></i><p>Loading changelog…</p>';
        if (window.lucide) lucide.createIcons();
      }

      try {
        const md = await fetchMarkdown();
        const entries = parseMarkdown(md);
        if (statusEl) statusEl.classList.add("hidden");

        feedEl.innerHTML = "";
        const frag = document.createDocumentFragment();
        entries.forEach((entry) => {
          frag.appendChild(renderEntry(entry));
        });
        feedEl.appendChild(frag);

        if (navEl) renderNav(entries, navEl);

        mounted = true;
        document.dispatchEvent(
          new CustomEvent("changelog:ready", { detail: { entries } })
        );
        if (window.lucide) lucide.createIcons();
        return entries;
      } catch (err) {
        if (statusEl) {
          statusEl.classList.remove("hidden");
          statusEl.innerHTML = `<p>Changelog unavailable. <a href="https://github.com/renzoreyn/ShulkerBox/blob/main/CHANGELOG.md" target="_blank" rel="noopener">View on GitHub</a></p><p style="color:var(--muted);margin-top:8px">${err.message}</p>`;
        }
        throw err;
      }
    })();
    return mountPromise;
  }

  function close() {
    if (!modalEl) return;
    modalEl.classList.remove("is-open");
    modalEl.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    if (lastFocus && typeof lastFocus.focus === "function") {
      lastFocus.focus();
    }
    lastFocus = null;
  }

  function open() {
    if (!modalEl) return;
    lastFocus = document.activeElement;
    modalEl.classList.add("is-open");
    modalEl.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    const closeBtn = modalEl.querySelector(".changelog-modal-close");
    if (closeBtn) closeBtn.focus();
    if (window.lucide) lucide.createIcons();
  }

  async function openAndLoad(mountOpts) {
    open();
    try {
      await mount(mountOpts);
    } catch {
      /* error UI in modal */
    }
  }

  function initModal({ modalId = "changelog-modal", mountOpts, preload = true } = {}) {
    modalEl = document.getElementById(modalId);
    if (!modalEl) return;

    scrollRoot = modalEl.querySelector(".changelog-modal-scroll");

    modalEl.querySelectorAll("[data-changelog-close]").forEach((el) => {
      el.addEventListener("click", close);
    });

    document.addEventListener("keydown", (ev) => {
      if (ev.key === "Escape" && modalEl?.classList.contains("is-open")) {
        close();
      }
    });

    document.querySelectorAll(".js-open-changelog").forEach((trigger) => {
      trigger.addEventListener("click", (ev) => {
        const href = trigger.getAttribute("href");
        if (href === "#changelog" || trigger.classList.contains("js-open-changelog")) {
          ev.preventDefault();
        }
        openAndLoad(mountOpts);
      });
    });

    if (mountOpts && preload) {
      mount(mountOpts).catch(() => {});
    }
  }

  return {
    parseMarkdown,
    fetchMarkdown,
    mount,
    initModal,
    open,
    close,
    openAndLoad,
  };
})();
