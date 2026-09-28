/* ============================================
   LUMIÈRE — JavaScript Engine
   Particles, Transitions, Scroll Effects,
   Filtering, Parallax, Mobile Nav
   ============================================ */

(function () {
  'use strict';

  // =====================
  // 1. PARTICLES & STARS
  // =====================
  const canvas = document.getElementById('particles-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let stars = [];
  let mouseX = 0, mouseY = 0;
  let animId;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createParticles() {
    particles = [];
    const count = Math.min(Math.floor(window.innerWidth / 15), 80);
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: (Math.random() - 0.5) * 0.3 - 0.15,
        opacity: Math.random() * 0.5 + 0.1,
        hue: Math.random() > 0.6 ? 42 : 260, // gold or purple
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.02 + 0.005
      });
    }
  }

  function createStars() {
    stars = [];
    const count = Math.min(Math.floor(window.innerWidth / 8), 150);
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.5 + 0.3,
        opacity: Math.random() * 0.7 + 0.2,
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.03 + 0.01
      });
    }
  }

  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Stars
    for (const s of stars) {
      s.twinkle += s.twinkleSpeed;
      const op = s.opacity * (0.5 + 0.5 * Math.sin(s.twinkle));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${op})`;
      ctx.fill();
    }

    // Particles
    for (const p of particles) {
      p.x += p.speedX;
      p.y += p.speedY;
      p.pulse += p.pulseSpeed;

      // Mouse repulsion
      const dx = p.x - mouseX;
      const dy = p.y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        const force = (120 - dist) / 120;
        p.x += (dx / dist) * force * 0.8;
        p.y += (dy / dist) * force * 0.8;
      }

      // Wrap
      if (p.x < -10) p.x = canvas.width + 10;
      if (p.x > canvas.width + 10) p.x = -10;
      if (p.y < -10) p.y = canvas.height + 10;
      if (p.y > canvas.height + 10) p.y = -10;

      const pulseOp = p.opacity * (0.6 + 0.4 * Math.sin(p.pulse));

      // Glow
      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
      if (p.hue === 42) {
        gradient.addColorStop(0, `rgba(212, 168, 83, ${pulseOp})`);
        gradient.addColorStop(1, `rgba(212, 168, 83, 0)`);
      } else {
        gradient.addColorStop(0, `rgba(155, 109, 255, ${pulseOp})`);
        gradient.addColorStop(1, `rgba(155, 109, 255, 0)`);
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Core
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.hue === 42
        ? `rgba(240, 214, 138, ${pulseOp})`
        : `rgba(180, 150, 255, ${pulseOp})`;
      ctx.fill();
    }

    // Connection lines between nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          const op = (1 - dist / 100) * 0.12;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(212, 168, 83, ${op})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    animId = requestAnimationFrame(drawParticles);
  }

  resizeCanvas();
  createParticles();
  createStars();
  drawParticles();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resizeCanvas();
      createParticles();
      createStars();
    }, 200);
  });

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // =====================
  // 2. NAVBAR
  // =====================
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  const allNavLinks = document.querySelectorAll('.nav-link');

  // Scroll class
  function updateNavbar() {
    if (window.scrollY > 80) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', updateNavbar, { passive: true });
  updateNavbar();

  // Mobile toggle
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('open');
    navLinks.classList.toggle('open');
  });

  // Close mobile nav on link click
  allNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });

  // =====================
  // 3. PAGE TRANSITIONS
  // =====================
  const pages = document.querySelectorAll('.page');
  const transition = document.getElementById('pageTransition');
  let currentPage = 'home';

  function switchPage(pageId) {
    if (pageId === currentPage) return;

    transition.classList.add('active');

    setTimeout(() => {
      pages.forEach(p => p.classList.remove('active'));
      const target = document.getElementById(pageId);
      if (target) {
        target.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'instant' });

        // Re-trigger scroll animations for new page
        setTimeout(() => {
          initScrollAnimations();
          transition.classList.remove('active');
        }, 100);
      }

      currentPage = pageId;

      // Update nav active
      allNavLinks.forEach(l => l.classList.remove('active'));
      const activeLink = document.querySelector(`.nav-link[data-page="${pageId}"]`);
      if (activeLink) activeLink.classList.add('active');
    }, 400);
  }

  // Handle nav clicks
  document.querySelectorAll('[data-page]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const page = el.getAttribute('data-page');
      switchPage(page);
      history.pushState(null, '', `#${page}`);
    });
  });

  // Handle hash on load
  const hash = window.location.hash.replace('#', '');
  if (hash && document.getElementById(hash)) {
    switchPage(hash);
  }

  window.addEventListener('popstate', () => {
    const h = window.location.hash.replace('#', '') || 'home';
    switchPage(h);
  });

  // =====================
  // 4. SCROLL ANIMATIONS
  // =====================
  function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      // Re-observe by removing and adding class
      el.classList.remove('visible');
      observer.observe(el);
    });
  }

  initScrollAnimations();

  // =====================
  // 5. PARALLAX EFFECT
  // =====================
  function updateParallax() {
    const activePage = document.querySelector('.page.active');
    if (!activePage) return;

    const parallaxElements = activePage.querySelectorAll('[data-parallax]');
    const scrollY = window.scrollY;

    parallaxElements.forEach(el => {
      const speed = parseFloat(el.getAttribute('data-parallax')) || 0.3;
      const img = el.querySelector('img');
      if (img) {
        const rect = el.getBoundingClientRect();
        if (rect.bottom > 0 && rect.top < window.innerHeight) {
          const offset = scrollY * speed;
          img.style.transform = `translateY(${offset * 0.3}px) scale(1.1)`;
        }
      }
    });
  }

  window.addEventListener('scroll', updateParallax, { passive: true });

  // =====================
  // 6. MENU FILTERING
  // =====================
  const filterBtns = document.querySelectorAll('.menu-filters .filter-btn');
  const menuCards = document.querySelectorAll('.menu-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');

      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      menuCards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          card.classList.remove('hidden');
          card.style.animation = 'fadeUp 0.5s var(--ease-out-expo) forwards';
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

  // =====================
  // 7. GALLERY FILTERING
  // =====================
  const gFilterBtns = document.querySelectorAll('.gallery-filters .filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');

  gFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-gfilter');

      gFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      galleryItems.forEach(item => {
        const cat = item.getAttribute('data-gcategory');
        if (filter === 'all' || cat === filter) {
          item.style.display = '';
          item.style.animation = 'fadeUp 0.5s var(--ease-out-expo) forwards';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

  // =====================
  // 8. ORDER NOW BUTTONS
  // =====================
  document.querySelectorAll('.order-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.menu-card');
      const name = card.querySelector('h3').textContent;
      const price = card.querySelector('.menu-price').textContent;

      btn.textContent = 'Added! ✓';
      btn.style.background = 'linear-gradient(135deg, #27ae60, #2ecc71)';

      setTimeout(() => {
        btn.textContent = 'Order Now';
        btn.style.background = '';
      }, 2000);
    });
  });

  // =====================
  // 9. RESERVATION FORM
  // =====================
  const form = document.getElementById('reservationForm');
  if (form) {
    // Set min date to today
    const dateInput = document.getElementById('resDate');
    if (dateInput) {
      const today = new Date().toISOString().split('T')[0];
      dateInput.setAttribute('min', today);
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const card = form.closest('.glass-card');

      // Hide form, show success
      form.style.display = 'none';
      let success = card.querySelector('.form-success');
      if (!success) {
        success = document.createElement('div');
        success.className = 'form-success show';
        success.innerHTML = `
          <span class="success-icon glow-text">✓</span>
          <h3>Reservation Confirmed!</h3>
          <p>Thank you for choosing Lumière. You'll receive a confirmation email shortly. We look forward to welcoming you.</p>
          <br>
          <button class="btn btn-outline" onclick="location.reload()">Make Another Reservation</button>
        `;
        card.appendChild(success);
      } else {
        success.classList.add('show');
      }
    });
  }

  // =====================
  // 10. SMOOTH SCROLL FOR INTERNAL LINKS
  // =====================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href').replace('#', '');
      if (targetId && document.getElementById(targetId) && document.getElementById(targetId).classList.contains('page')) {
        // Already handled by page switcher
        return;
      }
    });
  });

  // =====================
  // 11. HOVER TILT EFFECT ON CARDS
  // =====================
  document.querySelectorAll('.glass-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / centerY * -3;
      const rotateY = (x - centerX) / centerX * 3;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  // =====================
  // 12. TEXT SCRAMBLE ON SCROLL
  // =====================
  function initTextReveal() {
    const reveals = document.querySelectorAll('.hero-title, .page-header-title');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, { threshold: 0.3 });

    reveals.forEach(el => {
      observer.observe(el);
    });
  }

  initTextReveal();

  // =====================
  // 13. SCROLL PROGRESS (for navbar glow)
  // =====================
  window.addEventListener('scroll', () => {
    const scrollPct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
    const glowIntensity = Math.min(scrollPct * 2, 1);

    navbar.style.boxShadow = `0 4px ${30 * glowIntensity}px rgba(212, 168, 83, ${0.05 * glowIntensity})`;
  }, { passive: true });

  // =====================
  // 14. CURSOR GLOW EFFECT (desktop only)
  // =====================
  if (window.matchMedia('(pointer: fine)').matches) {
    const cursorGlow = document.createElement('div');
    cursorGlow.style.cssText = `
      position: fixed;
      width: 300px;
      height: 300px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(212,168,83,0.04) 0%, transparent 70%);
      pointer-events: none;
      z-index: 1;
      transition: transform 0.15s ease-out;
      transform: translate(-50%, -50%);
    `;
    document.body.appendChild(cursorGlow);

    document.addEventListener('mousemove', (e) => {
      cursorGlow.style.left = e.clientX + 'px';
      cursorGlow.style.top = e.clientY + 'px';
    });
  }

  // =====================
  // 15. LOADING ANIMATION
  // =====================
  window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.6s ease';
    requestAnimationFrame(() => {
      document.body.style.opacity = '1';
    });
  });

})();
