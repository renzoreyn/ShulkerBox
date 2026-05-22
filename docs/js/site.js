/** ShulkerBox landing — GSAP + Lucide */

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
    document.querySelectorAll(".reveal").forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
    return;
  }

  if (typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
  }

  const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });
  heroTl
    .from(".hero .eyebrow", { opacity: 0, y: 16, duration: 0.5 })
    .from(".hero h1", { opacity: 0, y: 24, duration: 0.65 }, "-=0.25")
    .from(".hero-sub", { opacity: 0, y: 18, duration: 0.5 }, "-=0.35")
    .from(".hero-actions .btn", { opacity: 0, y: 14, stagger: 0.08, duration: 0.45 }, "-=0.3")
    .from(".hero-meta span", { opacity: 0, x: -10, stagger: 0.06, duration: 0.4 }, "-=0.25")
    .from(".hero-visual", { opacity: 0, scale: 0.96, y: 30, duration: 0.8 }, "-=0.5");

  gsap.to(".hero-glow", {
    opacity: 0.85,
    scale: 1.05,
    duration: 4,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
  });

  const reveal = gsap.utils.toArray(".section .reveal, .stats-band .reveal, .cta-section .reveal");
  reveal.forEach((el) => {
    gsap.from(el, {
      scrollTrigger: {
        trigger: el,
        start: "top 88%",
        toggleActions: "play none none none",
      },
      opacity: 0,
      y: 32,
      duration: 0.65,
      ease: "power2.out",
    });
  });

  document.addEventListener("releases:ready", () => {
    gsap.from("#releases-list .release-card", {
      opacity: 0,
      y: 20,
      stagger: 0.08,
      duration: 0.5,
      ease: "power2.out",
      scrollTrigger: {
        trigger: "#releases",
        start: "top 75%",
      },
    });
  });

  document.addEventListener("changelog:ready", () => {
    gsap.from("#changelog-feed .changelog-entry", {
      opacity: 0,
      y: 18,
      stagger: 0.06,
      duration: 0.45,
      ease: "power2.out",
      scrollTrigger: {
        trigger: "#changelog",
        start: "top 78%",
      },
    });
  });

  gsap.from(".stat-item", {
    scrollTrigger: { trigger: ".stats-band", start: "top 80%" },
    opacity: 0,
    y: 20,
    stagger: 0.1,
    duration: 0.55,
    ease: "power2.out",
  });
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
      const mockBadge = document.querySelector(".mock-badge");
      if (mockBadge) mockBadge.textContent = latest.replace(/^v/i, "v");
    })
    .catch(() => {});
}

document.addEventListener("DOMContentLoaded", () => {
  initLucide();
  initNav();
  setLatestVersionBadge();
  loadReleases();

  Changelog.mount({
    feedEl: document.getElementById("changelog-feed"),
    navEl: document.getElementById("changelog-nav"),
    statusEl: document.getElementById("changelog-status"),
  }).then(() => initLucide());

  initGsap();
});
