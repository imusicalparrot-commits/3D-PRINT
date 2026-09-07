/* 3D Models — burger menu + shuffle hero + 3D ad card tilt (vanilla, no deps) */
(function () {
  'use strict';

  /* ---------- Mobile fullscreen burger menu ---------- */
  var btn = document.getElementById('burgerBtn');
  var nav = document.getElementById('mobileNav');
  if (btn && nav) {
    var label = btn.querySelector('.burger-label');
    var set = function (open) {
      nav.classList.toggle('open', open);
      btn.classList.toggle('open', open);
      document.body.classList.toggle('menu-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      nav.setAttribute('aria-hidden', open ? 'false' : 'true');
      if (label) label.textContent = open ? 'Close' : 'Menu';
    };
    btn.addEventListener('click', function () { set(!nav.classList.contains('open')); });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('[data-mnav-close]') || e.target.closest('a')) set(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') set(false);
    });
  }

  /* ---------- Parallax mountain hero (1:1 with the GSAP reference, vanilla) ----------
     The section scrolls away normally; as it does, each layer moves DOWN by
     yPercent of its own height. Front layer (70%) visually "stays put",
     far layer (10%) scrolls off naturally. Progress runs from "section top
     hits viewport top" to "section bottom hits viewport top".                  */
  (function () {
    var hero = document.querySelector('.hero-parallax');
    if (!hero) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var visuals = hero.querySelector('.parallax-visuals');
    var copy = hero.querySelector('.parallax-copy');
    var layers = {};
    hero.querySelectorAll('[data-parallax-layer]').forEach(function (el) {
      layers[el.getAttribute('data-parallax-layer')] = el;
    });
    var conf = { '1': 0.70, '2': 0.55, '3': 0.40, '4': 0.10 }; // yPercent per layer
    var current = { '1': 0, '2': 0, '3': 0, '4': 0 };
    var dirty = false;

    function layerH(n) { return layers[n] ? (layers[n].offsetHeight || 1) : 1; }

    function frame() {
      dirty = false;
      var r = visuals.getBoundingClientRect();
      var p = Math.min(1, Math.max(0, (-r.top) / (r.height || 1)));
      for (var n in conf) {
        var target = p * conf[n] * layerH(n);
        var diff = target - current[n];
        if (Math.abs(diff) > 0.05) { current[n] += diff * 0.3; dirty = true; }
        else current[n] = target;
        if (layers[n]) layers[n].style.transform = 'translateX(-50%) translateY(' + current[n].toFixed(1) + 'px)';
      }
      if (copy) {
        // copy tracks the front layer so it stays readable while mountains drift
        copy.style.transform = 'translateY(' + (p * 0.70 * layerH('1')).toFixed(1) + 'px)';
        copy.style.opacity = Math.max(0, 1 - p * 1.1).toFixed(3);
      }
      if (dirty) window.requestAnimationFrame(frame);
    }
    function onScroll() {
      if (!dirty) { dirty = true; window.requestAnimationFrame(frame); }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    frame();
  })();

  /* ---------- 3D tilt for the sponsored ad card ---------- */
  if (window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.card3d').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var x = e.clientX - r.left;
        var y = e.clientY - r.top;
        var rx = (y - r.height / 2) / (r.height / 2) * -8;
        var ry = (x - r.width / 2) / (r.width / 2) * 8;
        card.style.transition = 'transform 0.1s ease-out';
        card.style.transform = 'perspective(1000px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) scale3d(1.05, 1.05, 1.05)';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transition = 'transform 0.4s ease-in-out';
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      });
    });
  }
})();
