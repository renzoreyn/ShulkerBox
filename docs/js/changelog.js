/** Parse CHANGELOG.md and show per-version notes in a modal. */

const Changelog = (() => {
  const CHANGELOG_URLS = ["CHANGELOG.md", "../CHANGELOG.md"];

  let modalEl = null;
  let scrollRoot = null;
  let navEl = null;
  let titleEl = null;
  let lastFocus = null;
  let mounted = false;
  let mountPromise = null;
  let entriesCache = [];

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

  function normalizeVersion(v) {
    return String(v || "")
      .replace(/^v/i, "")
      .trim();
  }

  function entryId(version) {
    return `changelog-${version.replace(/\s+/g, "-").toLowerCase()}`;
  }

  function findEntry(version) {
    const key = normalizeVersion(version);
    return entriesCache.find((e) => normalizeVersion(e.version) === key);
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

  function scrollToVersion(version) {
    const el = document.getElementById(entryId(version));
    if (!el || !scrollRoot) return;
    const top = el.offsetTop - scrollRoot.offsetTop - 8;
    scrollRoot.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
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
    article.dataset.version = entry.version;
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

  function renderNav(entries) {
    if (!navEl) return;
    navEl.innerHTML = "";
    for (const entry of entries) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent =
        entry.version === "Unreleased" ? "Unreleased" : `v${entry.version}`;
      btn.dataset.version = entry.version;
      btn.addEventListener("click", () => {
        showVersion(entry.version);
      });
      navEl.appendChild(btn);
    }
  }

  function setActiveNav(version) {
    if (!navEl) return;
    const key = normalizeVersion(version);
    navEl.querySelectorAll("button").forEach((b) => {
      b.classList.toggle("active", normalizeVersion(b.dataset.version) === key);
    });
  }

  function showVersion(version) {
    if (!modalEl) return;
    const key = normalizeVersion(version);
    const entry = findEntry(version);

    modalEl.classList.add("changelog-modal--single");
    if (titleEl) {
      titleEl.textContent = entry
        ? entry.version === "Unreleased"
          ? "Unreleased"
          : `v${entry.version}`
        : `v${key}`;
    }

    document.querySelectorAll(".changelog-entry").forEach((el) => {
      const match = normalizeVersion(el.dataset.version) === key;
      el.classList.toggle("hidden", !match);
    });

    setActiveNav(version);
    if (scrollRoot) scrollRoot.scrollTop = 0;
  }

  function showAllVersions() {
    if (!modalEl) return;
    modalEl.classList.remove("changelog-modal--single");
    if (titleEl) titleEl.textContent = "Changelog";
    document.querySelectorAll(".changelog-entry").forEach((el) => {
      el.classList.remove("hidden");
    });
    if (navEl) navEl.querySelectorAll("button").forEach((b) => b.classList.remove("active"));
    if (scrollRoot) scrollRoot.scrollTop = 0;
  }

  async function mount({ feedEl, navEl: nav, statusEl }) {
    navEl = nav || navEl;
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
        entriesCache = parseMarkdown(md);
        if (statusEl) statusEl.classList.add("hidden");

        feedEl.innerHTML = "";
        const frag = document.createDocumentFragment();
        entriesCache.forEach((entry) => {
          frag.appendChild(renderEntry(entry));
        });
        feedEl.appendChild(frag);

        renderNav(entriesCache);

        mounted = true;
        document.dispatchEvent(
          new CustomEvent("changelog:ready", { detail: { entries: entriesCache } })
        );
        if (window.lucide) lucide.createIcons();
        return entriesCache;
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
    showAllVersions();
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

  async function openVersion(version, mountOpts) {
    open();
    try {
      await mount(mountOpts);
      const feed = mountOpts?.feedEl;
      feed?.querySelector(".changelog-missing")?.remove();

      const entry = findEntry(version);
      if (entry) {
        showVersion(version);
      } else {
        modalEl?.classList.add("changelog-modal--single");
        if (titleEl) titleEl.textContent = `v${normalizeVersion(version)}`;
        feed?.querySelectorAll(".changelog-entry").forEach((el) => el.classList.add("hidden"));
        const empty = document.createElement("p");
        empty.className = "changelog-missing";
        empty.textContent = `No CHANGELOG.md section for v${normalizeVersion(version)} yet. Check the GitHub release page for notes.`;
        feed?.appendChild(empty);
      }
    } catch {
      /* error in modal */
    }
  }

  function initModal({ modalId = "changelog-modal", mountOpts, preload = true } = {}) {
    modalEl = document.getElementById(modalId);
    if (!modalEl) return;

    scrollRoot = modalEl.querySelector(".changelog-modal-scroll");
    navEl = modalEl.querySelector("#changelog-nav");
    titleEl = document.getElementById("changelog-modal-title");

    modalEl.querySelectorAll("[data-changelog-close]").forEach((el) => {
      el.addEventListener("click", close);
    });

    document.addEventListener("keydown", (ev) => {
      if (ev.key === "Escape" && modalEl?.classList.contains("is-open")) {
        close();
      }
    });

    if (mountOpts && preload) {
      mount(mountOpts).catch(() => {});
    }
  }

  const api = {
    parseMarkdown,
    fetchMarkdown,
    mount,
    initModal,
    open,
    close,
    openVersion,
    showVersion,
    showAllVersions,
    findEntry,
  };

  window.Changelog = api;
  return api;
})();
