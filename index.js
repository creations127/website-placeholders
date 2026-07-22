/* ============================================================
   VISALIA CERAMIC TILE — JavaScript
   ============================================================ */

'use strict';

// ============================================================
// UTILITY: Debounce
// ============================================================
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// ============================================================
// NAV: Scroll behaviour (transparent → glass)
// ============================================================
(function initNavScroll() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  function updateNav() {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();
})();

// ============================================================
// NAV: Mobile hamburger menu
// ============================================================
(function initMobileMenu() {
  const btn  = document.getElementById('hamburger-btn');
  const menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;

  function toggleMenu(open) {
    btn.classList.toggle('open', open);
    menu.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-hidden', String(!open));
  }

  btn.addEventListener('click', () => {
    const isOpen = menu.classList.contains('open');
    toggleMenu(!isOpen);
  });

  // Close on link click
  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!btn.contains(e.target) && !menu.contains(e.target)) {
      toggleMenu(false);
    }
  });
})();

// ============================================================
// SMOOTH SCROLL: Anchor links
// ============================================================
(function initSmoothScroll() {
  const NAV_HEIGHT = parseInt(getComputedStyle(document.documentElement)
    .getPropertyValue('--nav-h')) || 72;

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#' || !href) return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

// ============================================================
// PARALLAX: Hero background subtle parallax
// ============================================================
(function initHeroParallax() {
  const heroBg = document.getElementById('hero-bg');
  if (!heroBg) return;

  function onScroll() {
    const scrolled = window.scrollY;
    const rate = scrolled * 0.3;
    heroBg.style.transform = `scale(1.05) translateY(${rate}px)`;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
})();

// ============================================================
// SCROLL REVEAL: IntersectionObserver-based
// ============================================================
(function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach(el => observer.observe(el));
})();

// ============================================================
// STATS COUNTER: Animated number count-up
// ============================================================
(function initStatsCounter() {
  const statEls = document.querySelectorAll('.stat-number[data-target]');
  if (!statEls.length) return;

  function animateCount(el, target, duration) {
    let start = null;
    const startVal = 0;

    function step(timestamp) {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target;
      }
    }

    requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.target, 10);
        animateCount(el, target, 1800);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  statEls.forEach(el => observer.observe(el));
})();

// ============================================================
// GALLERY FILTER: Category-based filtering
// ============================================================
(function initGalleryFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      // Update active button state
      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      // Filter items
      galleryItems.forEach(item => {
        const category = item.dataset.category;
        if (filter === 'all' || category === filter) {
          item.classList.remove('hidden');
          // Re-trigger reveal animation
          item.style.animation = 'none';
          item.offsetHeight; // force reflow
          item.style.animation = '';
        } else {
          item.classList.add('hidden');
        }
      });
    });
  });
})();

// ============================================================
// COUNTERTOP TABS: Tabbed content switching
// ============================================================
(function initCountertopTabs() {
  const tabBtns   = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');
  if (!tabBtns.length) return;

  function activateTab(tabId) {
    tabBtns.forEach(btn => {
      const active = btn.dataset.tab === tabId;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-selected', String(active));
    });

    tabPanels.forEach(panel => {
      const active = panel.id === `panel-${tabId}`;
      panel.classList.toggle('active', active);
    });
  }

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => activateTab(btn.dataset.tab));

    // Keyboard support
    btn.addEventListener('keydown', (e) => {
      const tabs = [...tabBtns];
      const idx = tabs.indexOf(btn);
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        tabs[(idx + 1) % tabs.length].click();
        tabs[(idx + 1) % tabs.length].focus();
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        tabs[(idx - 1 + tabs.length) % tabs.length].click();
        tabs[(idx - 1 + tabs.length) % tabs.length].focus();
      }
    });
  });
})();

// ============================================================
// TESTIMONIAL CAROUSEL: Auto-rotating with controls
// ============================================================
(function initTestimonialCarousel() {
  const track    = document.getElementById('testimonial-track');
  const dots     = document.querySelectorAll('.dot');
  const prevBtn  = document.getElementById('carousel-prev');
  const nextBtn  = document.getElementById('carousel-next');
  if (!track) return;

  const slides = track.querySelectorAll('.testimonial-slide');
  let current  = 0;
  let autoTimer = null;
  const AUTO_INTERVAL = 5000;

  function goTo(index) {
    current = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;

    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === current);
      dot.setAttribute('aria-selected', String(i === current));
    });
  }

  function startAuto() {
    autoTimer = setInterval(() => goTo(current + 1), AUTO_INTERVAL);
  }

  function stopAuto() {
    clearInterval(autoTimer);
  }

  function restartAuto() {
    stopAuto();
    startAuto();
  }

  // Button controls
  if (prevBtn) {
    prevBtn.addEventListener('click', () => { goTo(current - 1); restartAuto(); });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => { goTo(current + 1); restartAuto(); });
  }

  // Dot controls
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => { goTo(i); restartAuto(); });
  });

  // Touch/swipe support
  let touchStartX = 0;
  track.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) {
      goTo(dx < 0 ? current + 1 : current - 1);
      restartAuto();
    }
  }, { passive: true });

  // Pause on hover
  const carousel = document.getElementById('testimonial-carousel');
  if (carousel) {
    carousel.addEventListener('mouseenter', stopAuto);
    carousel.addEventListener('mouseleave', startAuto);
  }

  // Init
  goTo(0);
  startAuto();
})();

// ============================================================
// FLOATING CTA: Appears after scrolling past hero
// ============================================================
(function initFloatingCTA() {
  const floatingCta = document.getElementById('floating-cta');
  const hero        = document.getElementById('hero');
  if (!floatingCta || !hero) return;

  function updateFloating() {
    const heroBottom = hero.getBoundingClientRect().bottom;
    const show = heroBottom < 0;
    floatingCta.classList.toggle('visible', show);
    floatingCta.setAttribute('aria-hidden', String(!show));
  }

  window.addEventListener('scroll', updateFloating, { passive: true });
  updateFloating();
})();

// ============================================================
// CONTACT FORM: Client-side validation & submission mock
// ============================================================
(function initContactForm() {
  const form      = document.getElementById('contact-form');
  const submitBtn = document.getElementById('form-submit-btn');
  const success   = document.getElementById('form-success');
  if (!form) return;

  function validateField(input) {
    const parent = input.closest('.form-group');
    const errorEl = parent ? parent.querySelector('.form-error') : null;

    let error = '';

    if (input.required && !input.value.trim()) {
      error = 'This field is required.';
    } else if (input.type === 'tel' && input.value.trim()) {
      const digitsOnly = input.value.replace(/\D/g, '');
      if (digitsOnly.length < 10) error = 'Please enter a valid phone number.';
    }

    if (parent) parent.classList.toggle('has-error', !!error);
    if (errorEl) errorEl.textContent = error;

    return !error;
  }

  // Real-time validation on blur
  form.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
      const parent = field.closest('.form-group');
      if (parent && parent.classList.contains('has-error')) {
        validateField(field);
      }
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let valid = true;
    form.querySelectorAll('input[required], select[required], textarea[required]').forEach(field => {
      if (!validateField(field)) valid = false;
    });

    if (!valid) return;

    // Simulate submission
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    setTimeout(() => {
      form.reset();
      if (success) {
        success.hidden = false;
        success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      submitBtn.textContent = 'Send My Request';
      submitBtn.disabled = false;

      setTimeout(() => {
        if (success) success.hidden = true;
      }, 8000);
    }, 1200);
  });
})();

// ============================================================
// FOOTER YEAR: Auto-update copyright year
// ============================================================
(function initFooterYear() {
  const el = document.getElementById('footer-year');
  if (el) el.textContent = new Date().getFullYear();
})();

// ============================================================
// HERO: Load complete — trigger animations
// ============================================================
(function initHeroLoad() {
  document.documentElement.classList.add('loaded');
})();
