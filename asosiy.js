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

// Sozlamalar: mijoz ma'lumoti kelganda shu yerni to'ldiring
var SOZLAMA = {
  telefon: '+998501765025',  // SMS va qo'ng'iroq uchun
  telegram: '',              // masalan 'shuxratogli' (@ belgisisiz) — bo'sh bo'lsa tugma ko'rinmaydi
  instagram: '',             // masalan 'shuxratogli'
  // Yandex Maps JS API 2.1 kaliti («JavaScript API и HTTP Геокодер», developer.tech.yandex.ru).
  // Kalit sahifa kodida ochiq turadi — Yandex kabinetida uni sayt domeniga cheklang.
  // Bo'sh bo'lsa xarita o'rnida brend kartochkasi turadi.
  yandexKalit: '868c338e-c07c-4bf9-9adc-8f86a7625381',
  xarita: { lat: 40.595514, lng: 72.239171, zoom: 13 }  // xo'jalikning haqiqiy nuqtasi (egasi, 21.10)
};

(function () {
  var html = document.documentElement;

  // ?toldir — mijozdan keladigan ma'lumot joylarini ko'rsatadi
  var toldir = /[?&]toldir\b/.test(location.search);
  if (toldir) html.classList.add('toldir');

  // Ijtimoiy tarmoqlar
  [['ijt-tg', SOZLAMA.telegram && 'https://t.me/' + SOZLAMA.telegram],
   ['ijt-ig', SOZLAMA.instagram && 'https://instagram.com/' + SOZLAMA.instagram]].forEach(function (x) {
    var a = document.querySelector('.' + x[0]);
    if (!a) return;
    if (x[1]) { a.href = x[1]; a.hidden = false; }
    else if (toldir) a.hidden = false;
  });

  // Ulgurji ariza: matnni tayyorlab, SMS / Telegram / nusxa orqali yuborish
  var forma = document.getElementById('ariza');
  if (!forma) return;
  var xato = forma.querySelector('.ariza-xato');
  var natija = forma.querySelector('.ariza-natija');
  var matnQuti = forma.querySelector('.ariza-matn');
  var sms = forma.querySelector('.ariza-sms');
  var tg = forma.querySelector('.ariza-tg');
  var nusxa = forma.querySelector('.ariza-nusxa');
  var nusxalandi = forma.querySelector('.ariza-nusxalandi');

  function yorliq(el) {
    var l = el.closest('label');
    var s = l && l.querySelector('span');
    return s ? s.textContent.trim() : el.name;
  }

  forma.addEventListener('submit', function (e) {
    e.preventDefault();
    var ism = forma.elements.ism, tel = forma.elements.tel;
    var telOk = tel.value.replace(/\D/g, '').length >= 9;
    ism.setAttribute('aria-invalid', String(!ism.value.trim()));
    tel.setAttribute('aria-invalid', String(!telOk));
    if (!ism.value.trim() || !telOk) {
      xato.hidden = false;
      (!ism.value.trim() ? ism : tel).focus();
      return;
    }
    xato.hidden = true;

    var qatorlar = [forma.querySelector('#ariza-sarlavha').textContent.trim() + ' — Shuxrat oʻgʻli', ''];
    ['ism', 'tel', 'korxona', 'manzil'].forEach(function (n) {
      var el = forma.elements[n];
      if (el.value.trim()) qatorlar.push(yorliq(el) + ': ' + el.value.trim());
    });
    var tanlangan = [].slice.call(forma.querySelectorAll('input[name="mahsulot"]:checked'))
      .map(function (c) { return c.nextElementSibling.textContent.trim(); });
    if (tanlangan.length) qatorlar.push(forma.querySelector('.tanlov legend').textContent.trim() + ' ' + tanlangan.join(', '));
    ['hajm', 'izoh'].forEach(function (n) {
      var el = forma.elements[n];
      if (el.value.trim()) qatorlar.push(yorliq(el) + ': ' + el.value.trim());
    });
    var matn = qatorlar.join('\n');

    matnQuti.textContent = matn;
    sms.href = 'sms:' + SOZLAMA.telefon + '?body=' + encodeURIComponent(matn);
    if (SOZLAMA.telegram) {
      tg.href = 'https://t.me/' + SOZLAMA.telegram + '?text=' + encodeURIComponent(matn);
      tg.hidden = false;
    }
    nusxalandi.hidden = true;
    natija.hidden = false;
    natija.focus();
    natija.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  });

  nusxa.addEventListener('click', function () {
    var matn = matnQuti.textContent;
    var tayyor = function () { nusxalandi.hidden = false; };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(matn).then(tayyor, function () { belgila(); });
    } else belgila();
    function belgila() {
      var r = document.createRange(); r.selectNodeContents(matnQuti);
      var s = getSelection(); s.removeAllRanges(); s.addRange(r);
      try { document.execCommand('copy'); tayyor(); } catch (e) {}
    }
  });
})();

// Xarita: Yandex (brend ranglarida) yoki kalitsiz brend kartochkasi
(function () {
  var quti = document.querySelector('.sotuv-xarita');
  if (!quti) return;
  var x = SOZLAMA.xarita;
  var och = quti.querySelector('.xarita-och'), yol = quti.querySelector('.xarita-yol');
  if (och) och.href = 'https://yandex.uz/maps/?pt=' + x.lng + ',' + x.lat + '&z=16&l=map';
  if (yol) yol.href = 'https://yandex.uz/maps/?rtext=~' + x.lat + ',' + x.lng + '&rtt=auto';
  if (!SOZLAMA.yandexKalit) return;

  var til = { uz: 'uz_UZ', ru: 'ru_RU', en: 'en_US' }[document.documentElement.lang] || 'uz_UZ';
  var pin = quti.querySelector('.xarita-nuqta img').getAttribute('src').replace('belgi.svg', 'xarita-nuqta.svg');
  var yuklandi = false;
  function yukla() {
    if (yuklandi) return; yuklandi = true;
    var s = document.createElement('script');
    s.src = 'https://api-maps.yandex.ru/2.1/?apikey=' + encodeURIComponent(SOZLAMA.yandexKalit) + '&lang=' + til;
    s.onload = function () { ymaps.ready(chiz); };
    document.head.appendChild(s);
  }
  // xarita faqat ekranga yaqinlashganda yuklanadi
  if ('IntersectionObserver' in window) {
    var k = new IntersectionObserver(function (e) { if (e[0].isIntersecting) { k.disconnect(); yukla(); } }, { rootMargin: '400px' });
    k.observe(quti);
  } else yukla();

  function chiz() {
    var el = document.createElement('div');
    el.className = 'xarita-jonli';
    quti.appendChild(el);
    var map = new ymaps.Map(el, { center: [x.lat, x.lng], zoom: x.zoom, controls: ['zoomControl'] },
      { suppressMapOpenBlock: true, yandexMapDisablePoiInteractivity: true });
    map.behaviors.disable('scrollZoom');  // sahifa aylantirilganda xarita kattalashmasin
    map.geoObjects.add(new ymaps.Placemark([x.lat, x.lng], {}, {
      iconLayout: 'default#image', iconImageHref: pin,
      iconImageSize: [48, 60], iconImageOffset: [-24, -60]
    }));
    var a = document.createElement('a');
    a.className = 'xarita-ochish'; a.href = och.href; a.target = '_blank'; a.rel = 'noopener';
    a.textContent = och.textContent;
    quti.appendChild(a);
    quti.classList.add('jonli');
  }
})();
