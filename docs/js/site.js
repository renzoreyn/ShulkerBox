/** ShulkerBox landing: GSAP + Lucide */

const SB = {
  repo: "renzoreyn/ShulkerBox",
  releasesApi: "https://api.github.com/repos/renzoreyn/ShulkerBox/releases?per_page=12",
};

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function initLucide() {
  if (typeof lucide !== "undefined" && lucide.createIcons) {
    lucide.createIcons({ attrs: { "stroke-width": 2 } });
  }
}

function initUnselectable() {
  document.addEventListener("copy", (ev) => ev.preventDefault());
  document.addEventListener("cut", (ev) => ev.preventDefault());
  document.addEventListener("selectstart", (ev) => ev.preventDefault());
}

function initContextMenu() {
  const menu = document.getElementById("context-menu");
  if (!menu) return;

  const hide = () => {
    menu.classList.add("hidden");
    menu.setAttribute("aria-hidden", "true");
  };

  const show = (x, y) => {
    const pad = 8;
    menu.classList.remove("hidden");
    menu.setAttribute("aria-hidden", "false");
    menu.style.visibility = "hidden";
    menu.style.left = "0";
    menu.style.top = "0";
    if (window.lucide) lucide.createIcons();
    const rect = menu.getBoundingClientRect();
    let left = x;
    let top = y;
    if (left + rect.width > window.innerWidth - pad) {
      left = window.innerWidth - rect.width - pad;
    }
    if (top + rect.height > window.innerHeight - pad) {
      top = window.innerHeight - rect.height - pad;
    }
    menu.style.left = `${Math.max(pad, left)}px`;
    menu.style.top = `${Math.max(pad, top)}px`;
    menu.style.visibility = "";
  };

  document.addEventListener("contextmenu", (ev) => {
    ev.preventDefault();
    show(ev.clientX, ev.clientY);
  });

  document.addEventListener("pointerdown", (ev) => {
    if (!menu.contains(ev.target)) hide();
  });
  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape") hide();
  });
  window.addEventListener("blur", hide);
  window.addEventListener("resize", hide);
  window.addEventListener("scroll", hide, { passive: true });
}

function initNav() {
  const nav = document.getElementById("site-nav");
  if (!nav) return;

  const onScroll = () => {
    nav.classList.toggle("scrolled", window.scrollY > 24);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  nav.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function formatDate(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso.slice(0, 10);
  }
}

function findPortableAsset(assets) {
  return (assets || []).find(
    (a) => a.name && a.name.includes("windows-portable") && a.name.endsWith(".zip")
  );
}

async function loadReleases() {
  const container = document.getElementById("releases-list");
  const status = document.getElementById("releases-status");
  if (!container) return;

  try {
    const res = await fetch(SB.releasesApi, {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!res.ok) throw new Error(`GitHub API ${res.status}`);
    const releases = await res.json();
    if (status) status.classList.add("hidden");

    container.innerHTML = "";
    if (!releases.length) {
      container.innerHTML =
        '<p class="loading-block">No releases published yet.</p>';
      return;
    }

    releases.forEach((rel, index) => {
      const tag = (rel.tag_name || "").replace(/^v/i, "");
      const portable = findPortableAsset(rel.assets);
      const card = document.createElement("article");
      card.className = `release-card reveal${index === 0 ? " latest" : ""}`;

      card.innerHTML = `
        <div class="release-version">v${tag}</div>
        <div class="release-body">
          <h3>${rel.name || rel.tag_name || "Release"}</h3>
          <p>${(rel.body || "").split("\n")[0].slice(0, 140) || "Windows portable build."}${(rel.body || "").length > 140 ? "…" : ""}</p>
          <div class="release-meta">${formatDate(rel.published_at)}${index === 0 ? ' · <span style="color:var(--gold)">Latest</span>' : ""}</div>
        </div>
        <div class="release-actions">
          ${portable ? `<a class="btn btn-gold btn-sm" href="${portable.browser_download_url}" download><i data-lucide="download"></i> Portable zip</a>` : ""}
          <a class="btn btn-ghost btn-sm" href="${rel.html_url}" target="_blank" rel="noopener"><i data-lucide="external-link"></i> Release</a>
        </div>
      `;
      container.appendChild(card);
    });

    initLucide();
    document.dispatchEvent(new CustomEvent("releases:ready"));
  } catch (err) {
    if (status) {
      status.innerHTML = `<p>Could not load releases. <a href="https://github.com/${SB.repo}/releases">Open GitHub Releases</a></p>`;
    }
    console.warn(err);
  }
}

function initGsap() {
  if (typeof gsap === "undefined" || prefersReducedMotion()) {
    return;
  }

  try {
    if (typeof ScrollTrigger !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);
    }

    const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });
    heroTl
      .fromTo(
        ".hero .eyebrow",
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.5 }
      )
      .fromTo(
        ".hero h1",
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.65 },
        "-=0.25"
      )
      .fromTo(
        ".hero-sub",
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.5 },
        "-=0.35"
      )
      .fromTo(
        ".hero-actions .btn",
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, stagger: 0.08, duration: 0.45 },
        "-=0.3"
      )
      .fromTo(
        ".hero-meta span",
        { opacity: 0, x: -10 },
        { opacity: 1, x: 0, stagger: 0.06, duration: 0.4 },
        "-=0.25"
      )
      .fromTo(
        ".hero-shot",
        { opacity: 0, scale: 0.98, y: 24 },
        { opacity: 1, scale: 1, y: 0, duration: 0.75 },
        "-=0.35"
      );

    gsap.to(".hero-glow", {
      opacity: 0.85,
      scale: 1.05,
      duration: 4,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    document.querySelectorAll(".section, .stats-band, .cta-section").forEach((section) => {
      const items = section.querySelectorAll(".reveal");
      if (!items.length || typeof ScrollTrigger === "undefined") return;
      gsap.fromTo(
        items,
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.06,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 82%",
            toggleActions: "play none none none",
          },
        }
      );
    });

    if (typeof ScrollTrigger !== "undefined") {
      ScrollTrigger.batch(".stat-item", {
        start: "top 85%",
        onEnter: (batch) => {
          gsap.fromTo(
            batch,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.55, stagger: 0.1, ease: "power2.out" }
          );
        },
        once: true,
      });
    }

    document.addEventListener("releases:ready", () => {
      gsap.fromTo(
        "#releases-list .release-card",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.08,
          duration: 0.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: "#releases",
            start: "top 75%",
          },
        }
      );
    });

  } catch (err) {
    console.warn("GSAP init failed", err);
  }
}

function setLatestVersionBadge() {
  fetch(SB.releasesApi, { headers: { Accept: "application/vnd.github+json" } })
    .then((r) => (r.ok ? r.json() : []))
    .then((releases) => {
      const latest = releases[0]?.tag_name;
      if (!latest) return;
      document.querySelectorAll("[data-latest-version]").forEach((el) => {
        el.textContent = latest.replace(/^v/i, "v");
      });
    })
    .catch(() => {});
}

document.addEventListener("DOMContentLoaded", () => {
  initLucide();
  initUnselectable();
  initContextMenu();
  initNav();
  setLatestVersionBadge();
  loadReleases();

  const changelogMount = {
    feedEl: document.getElementById("changelog-feed"),
    navEl: document.getElementById("changelog-nav"),
    statusEl: document.getElementById("changelog-status"),
  };

  Changelog.initModal({ mountOpts: changelogMount, preload: true });
  initGsap();
});
