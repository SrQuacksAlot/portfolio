(() => {
  "use strict";

  const header = document.querySelector(".site-header");
  const nav = document.querySelector("#site-nav");
  const navToggle = document.querySelector(".nav-toggle");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Header state */
  const updateHeader = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  /* Mobile navigation */
  if (nav && navToggle) {
    const navLabel = navToggle.querySelector(".nav-toggle-label");

    const closeNav = () => {
      nav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("nav-open");
      if (navLabel) navLabel.textContent = "Menu";
    };

    navToggle.addEventListener("click", () => {
      const isOpen = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!isOpen));
      nav.classList.toggle("is-open", !isOpen);
      document.body.classList.toggle("nav-open", !isOpen);
      if (navLabel) navLabel.textContent = isOpen ? "Menu" : "Close";
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeNav);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeNav();
    });

    document.addEventListener("click", (event) => {
      if (!nav.contains(event.target) && !navToggle.contains(event.target)) {
        closeNav();
      }
    });
  }

  /* Reveal sections as they enter the viewport */
  const revealItems = document.querySelectorAll(".reveal");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  }

  /* Highlight the section currently in view */
  const sections = Array.from(document.querySelectorAll("main section[id]"));
  const navLinks = Array.from(document.querySelectorAll('.site-nav a[href^="#"]'));

  if ("IntersectionObserver" in window && sections.length && navLinks.length) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = `#${entry.target.id}`;
          navLinks.forEach((link) => {
            link.classList.toggle("is-active", link.getAttribute("href") === id);
          });
        });
      },
      { rootMargin: "-38% 0px -52% 0px", threshold: 0 }
    );

    sections.forEach((section) => spy.observe(section));
  }

  /* Copy email to clipboard */
  const copyText = async (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        /* Fall through to the older copy path. */
      }
    }

    const field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.top = "-9999px";
    document.body.appendChild(field);
    field.select();

    let copied = false;
    try {
      copied = document.execCommand("copy");
    } catch {
      copied = false;
    }

    field.remove();
    return copied;
  };

  document.querySelectorAll("[data-copy-email]").forEach((button) => {
    const email = button.getAttribute("data-copy-email");

    button.addEventListener("click", async () => {
      if (!email) return;

      const copied = await copyText(email);
      const original = button.textContent;
      button.textContent = copied ? "Copied" : "Copy failed";
      button.classList.add("is-copied");

      window.setTimeout(() => {
        button.textContent = original;
        button.classList.remove("is-copied");
      }, 1800);
    });
  });

  /* Footer year */
  const year = document.querySelector("#year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
