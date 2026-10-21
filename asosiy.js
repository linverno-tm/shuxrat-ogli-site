// Telefon menyusi, sarlavha soyasi, joriy yil
(function () {
  var tugma = document.querySelector('.menyu-tugma');
  var menyu = document.getElementById('menyu');
  var sarlavha = document.querySelector('.sarlavha');

  function yop() {
    menyu.classList.remove('ochiq');
    tugma.setAttribute('aria-expanded', 'false');
  }
  tugma.addEventListener('click', function () {
    var ochiq = menyu.classList.toggle('ochiq');
    tugma.setAttribute('aria-expanded', String(ochiq));
  });
  menyu.addEventListener('click', function (e) { if (e.target.closest('a')) yop(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') yop(); });

  function suril() { sarlavha.classList.toggle('surilgan', window.scrollY > 8); }
  window.addEventListener('scroll', suril, { passive: true });
  suril();

  document.getElementById('yil').textContent = new Date().getFullYear();

  // Kirish animatsiyasi tugashi yoki o'tkazib yuborilishi
  var html = document.documentElement;
  if (html.classList.contains('kirish-bor')) {
    try { sessionStorage.setItem('kirish', '1'); } catch (e) {}
    var kirish = document.querySelector('.kirish');
    var tugadi = false;
    var tugat = function () {
      if (tugadi) return;
      tugadi = true;
      html.classList.add('kirish-tugadi');
      setTimeout(function () { kirish.remove(); }, 700);
    };
    setTimeout(tugat, 3550);
    ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(function (t) {
      window.addEventListener(t, tugat, { once: true, passive: true });
    });
  }
})();
