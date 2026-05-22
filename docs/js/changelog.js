/** Parse CHANGELOG.md and render live feed (fetched from repo on GitHub Pages). */

const Changelog = (() => {
  const CHANGELOG_URLS = ["CHANGELOG.md", "../CHANGELOG.md"];

  function parseMarkdown(md) {
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

  function renderItem(html) {
    const li = document.createElement("li");
    li.innerHTML = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    return li;
  }

  function renderEntry(entry, { active } = {}) {
    const article = document.createElement("article");
    article.className = "changelog-entry reveal";
    article.id = `changelog-${entry.version.replace(/\s+/g, "-").toLowerCase()}`;
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

    if (active) article.classList.add("active-entry");
    return article;
  }

  function renderNav(entries, navEl, onSelect) {
    navEl.innerHTML = "";
    for (const entry of entries) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent =
        entry.version === "Unreleased" ? "Unreleased" : `v${entry.version}`;
      btn.dataset.version = entry.version;
      btn.addEventListener("click", () => {
        onSelect(entry.version);
        document
          .getElementById(`changelog-${entry.version.replace(/\s+/g, "-").toLowerCase()}`)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      navEl.appendChild(btn);
    }
  }

  async function mount({ feedEl, navEl, statusEl }) {
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
      entries.forEach((entry, i) => {
        frag.appendChild(renderEntry(entry, { active: i === 0 }));
      });
      feedEl.appendChild(frag);

      if (navEl) {
        renderNav(entries, navEl, (version) => {
          navEl.querySelectorAll("button").forEach((b) => {
            b.classList.toggle("active", b.dataset.version === version);
          });
        });
        const first = navEl.querySelector("button");
        if (first) first.classList.add("active");
      }

      document.dispatchEvent(
        new CustomEvent("changelog:ready", { detail: { entries } })
      );
      return entries;
    } catch (err) {
      if (statusEl) {
        statusEl.innerHTML = `<p>Changelog unavailable. <a href="https://github.com/renzoreyn/ShulkerBox/blob/main/CHANGELOG.md">View on GitHub</a></p><p style="color:var(--muted);margin-top:8px">${err.message}</p>`;
      }
      throw err;
    }
  }

  return { parseMarkdown, fetchMarkdown, mount };
})();
