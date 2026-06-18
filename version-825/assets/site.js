(function () {
  const root = document.documentElement;

  function toggleMenu() {
    const button = document.querySelector('.mobile-toggle');
    const nav = document.querySelector('.mobile-nav');
    if (!button || !nav) return;
    button.addEventListener('click', function () {
      const opened = nav.classList.toggle('is-open');
      button.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  function setupHero() {
    const hero = document.querySelector('[data-hero]');
    if (!hero) return;
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    if (!slides.length) return;
    let index = 0;
    let timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  function setupSearch() {
    const lists = Array.from(document.querySelectorAll('[data-movie-list]'));
    if (!lists.length) return;
    const input = document.querySelector('[data-movie-search]');
    const buttons = Array.from(document.querySelectorAll('[data-filter]'));
    const empty = document.querySelector('[data-empty-state]');
    let filter = 'all';

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function matchCard(card, query) {
      const text = [
        card.dataset.title,
        card.dataset.type,
        card.dataset.region,
        card.dataset.genre,
        card.dataset.tags
      ].join(' ').toLowerCase();
      const type = card.dataset.type || '';
      const passQuery = !query || text.indexOf(query) !== -1;
      const passFilter = filter === 'all' || type.indexOf(filter) !== -1;
      return passQuery && passFilter;
    }

    function apply() {
      const query = normalize(input ? input.value : '');
      let visible = 0;
      lists.forEach(function (list) {
        Array.from(list.querySelectorAll('.movie-card')).forEach(function (card) {
          const ok = matchCard(card, query);
          card.style.display = ok ? '' : 'none';
          if (ok) visible += 1;
        });
      });
      if (empty) empty.classList.toggle('is-visible', visible === 0);
    }

    if (input) input.addEventListener('input', apply);
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        filter = button.dataset.filter || 'all';
        buttons.forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        apply();
      });
    });
    apply();
  }

  function setupPlayer(source) {
    const video = document.getElementById('moviePlayer');
    const cover = document.querySelector('.player-cover');
    if (!video || !cover || !source) return;
    let mounted = false;

    function mount() {
      if (mounted) return;
      mounted = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        video._hls = hls;
      } else {
        video.src = source;
      }
    }

    function play() {
      mount();
      cover.classList.add('is-hidden');
      const task = video.play();
      if (task && typeof task.catch === 'function') {
        task.catch(function () {
          cover.classList.remove('is-hidden');
        });
      }
    }

    cover.addEventListener('click', play);
    video.addEventListener('play', function () {
      cover.classList.add('is-hidden');
    });
    video.addEventListener('pause', function () {
      if (!video.currentTime) cover.classList.remove('is-hidden');
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    toggleMenu();
    setupHero();
    setupSearch();
  });

  window.MovieSite = {
    setupPlayer: setupPlayer
  };
})();
