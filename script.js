document.addEventListener("DOMContentLoaded", () => {
  /* ===============================
      Проверка устройства
  =============================== */
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  if (isMobile) return;

  /* ===============================
      Параллакс + курсор
  =============================== */
  function initParallaxAndCursor() {
    const layerBack = document.querySelector('.layer-back');
    const layerMiddle = document.querySelector('.layer-middle');
    const layerFront = document.querySelector('.layer-front');

    // общий курсор
    const cursor = document.createElement("div");
    cursor.classList.add("cursor-dot");
    document.body.appendChild(cursor);

    // координаты для курсора (сырые)
    let rawX = 0, rawY = 0;
    // нормализованные для параллакса (-1 .. 1)
    let normX = 0, normY = 0;
    let curX = 0, curY = 0;
    let rafId = null;
    let isHovering = false;

    // Обработчик движения
    function onMove(e) {
      rawX = e.clientX;
      rawY = e.clientY;
      normX = (rawX / window.innerWidth - 0.5) * 2;
      normY = (rawY / window.innerHeight - 0.5) * 2;
    }
    document.addEventListener('mousemove', onMove, { passive: true });

    // Реакция на hover-элементы
    const hoverTargets = document.querySelectorAll("a, button, .view-btn, .portfolio-item");
    hoverTargets.forEach((el) => {
      el.addEventListener("mouseenter", () => {
        isHovering = true;
        cursor.style.background = 'radial-gradient(circle, rgba(76, 201, 240, 0.95) 0%, rgba(76, 201, 240, 0.3) 70%)';
      });
      el.addEventListener("mouseleave", () => {
        isHovering = false;
        cursor.style.background = 'radial-gradient(circle, rgba(76, 201, 240, 0.9) 0%, rgba(76, 201, 240, 0) 70%)';
      });
    });

    document.addEventListener("mouseleave", () => { cursor.style.opacity = '0'; });
    document.addEventListener("mouseenter", () => { cursor.style.opacity = isHovering ? '0.8' : '0.4'; });

    // Анимация: параллакс + курсор (rAF)
    function tick() {
      const ease = 0.08;
      curX += (normX - curX) * ease;
      curY += (normY - curY) * ease;

      // Параллакс слоёв
      if (layerBack)  layerBack.style.transform = `translate3d(${curX * 40}px, ${curY * 20}px, 0)`;
      if (layerMiddle) layerMiddle.style.transform = `translate3d(${curX * -25}px, ${curY * -25}px, 0)`;
      if (layerFront) layerFront.style.transform = `translate3d(${curX * 15}px, ${curY * 15}px, 0)`;

      // Курсор
      cursor.style.transform = `translate(${rawX - 9}px, ${rawY - 9}px) scale(${isHovering ? 2 : 1})`;
      cursor.style.opacity = isHovering ? '0.8' : '0.4';

      rafId = requestAnimationFrame(tick);
    }

    // Старт параллакса — после окончания анимаций слоёв
    function startWhenReady() {
      let started = false;
      function start() {
        if (started) return;
        started = true;
        if (!rafId) tick();
      }

      if (layerFront) {
        const onAnimEnd = () => {
          start();
          layerFront.removeEventListener('animationend', onAnimEnd);
        };
        layerFront.addEventListener('animationend', onAnimEnd);
        setTimeout(start, 4000);
      } else {
        start();
      }
    }

    startWhenReady();

    // Возврат функции очистки
    return () => {
      document.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafId);
      if (cursor && cursor.parentNode) cursor.parentNode.removeChild(cursor);
    };
  }

  /* ===============================
     Плавное появление секций
  =============================== */
  const sections = document.querySelectorAll(".section");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        } else {
          entry.target.classList.remove("visible");
        }
      });
    },
    { 
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    }
  );

  sections.forEach((sec) => observer.observe(sec));

  /* ===============================
     Скрытие / появление хедера
  =============================== */
  const header = document.querySelector(".site-header");
  let lastScrollY = window.scrollY;
  let ticking = false;

  function updateHeader() {
    if (window.scrollY > lastScrollY && window.scrollY > 100) {
      header.classList.add("hide");
    } else {
      header.classList.remove("hide");
    }
    lastScrollY = window.scrollY;
    ticking = false;
  }

  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(updateHeader);
      ticking = true;
    }
  });

  /* ===============================
      Появление боковой панели (aside)
  =============================== */
  const sideNav = document.querySelector(".side-nav");
  
  function updateSideNav() {
    const scrollY = window.scrollY;
    const triggerPoint = window.innerHeight * 0.4;
    const scrollBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 200;

    if (scrollY > triggerPoint && !scrollBottom) {
      sideNav.classList.add("visible");
    } else {
      sideNav.classList.remove("visible");
    }
  }

  window.addEventListener("scroll", updateSideNav);

  /* ===============================
      Плавная прокрутка по якорным ссылкам
  =============================== */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      
      if (href === "#" || href.startsWith("#!")) return;
      
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        
        const headerHeight = document.querySelector('.site-header').offsetHeight;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: "smooth"
        });
        
        history.pushState(null, null, href);
      }
    });
  });

  /* ===============================
     Анимация изображений при наведении
  =============================== */
  function initImageAnimations() {
    const images = document.querySelectorAll('.my-photo, .portfolio-image');
    
    images.forEach(img => {
      img.style.transition = 'transform 0.4s ease';
      
      img.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.05)';
      });
      
      img.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
      });
    });

    const programIcons = document.querySelectorAll('.prog-item img');
    programIcons.forEach(icon => {
      icon.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.2)';
        this.style.opacity = '1';
      });
      
      icon.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
        this.style.opacity = '0.7';
      });
    });
  }

  /* ===============================
     Инициализация всего
  =============================== */
  function init() {
    initParallaxAndCursor();
    initImageAnimations();
    
    window.history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    
    console.log('🎨 Портфолио инициализировано!');
  }

  init();

  /* ===============================
     Оптимизация производительности
  =============================== */
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      updateSideNav();
    }, 250);
  });
});
