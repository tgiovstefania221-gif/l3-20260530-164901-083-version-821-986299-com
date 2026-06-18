(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var toggle = qs('[data-menu-toggle]');
    var panel = qs('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHeaderSearch() {
    qsa('[data-site-search]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"]');
        var target = form.getAttribute('data-search-url') || 'search.html';
        var value = input ? input.value.trim() : '';
        var url = value ? target + '?q=' + encodeURIComponent(value) : target;
        window.location.href = url;
      });
    });
  }

  function initHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    if (!slides.length) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function normalize(text) {
    return String(text || '').toLowerCase().replace(/\s+/g, '');
  }

  function movieCard(movie) {
    var tags = (movie.tags || []).join(' ');
    return [
      '<article class="movie-card" data-title="', movie.title, '" data-genre="', movie.genre, '" data-region="', movie.region, '" data-type="', movie.type, '" data-year="', movie.year, '" data-tags="', tags, '">',
      '<a class="poster-link" href="', movie.path, '">',
      '<span class="poster-art poster-tone-', movie.posterTone, '" aria-label="', movie.title, ' 海报">',
      '<span class="poster-mark">', movie.title.slice(0, 2), '</span>',
      '<span class="poster-title">', movie.title, '</span>',
      '<span class="poster-category">', movie.categoryName, '</span>',
      '</span>',
      '<span class="duration-badge">', movie.duration, '</span>',
      '<span class="play-float">▶</span>',
      '</a>',
      '<div class="card-body">',
      '<div class="card-category">', movie.genre, '</div>',
      '<h3><a href="', movie.path, '">', movie.title, '</a></h3>',
      '<p>', movie.summary, '</p>',
      '<div class="card-foot"><span>', movie.year, '</span><span>', movie.region, '</span><span>评分 ', Number(movie.score).toFixed(1), '</span></div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function getQueryParam(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || '';
  }

  function initSearchPage() {
    var data = window.MOVIE_DATA || [];
    var form = qs('[data-search-page-form]');
    var input = qs('[data-search-page-input]');
    var results = qs('[data-search-results]');
    var status = qs('[data-search-status]');
    var filterButtons = qsa('[data-filter]');
    if (!form || !input || !results || !status) {
      return;
    }

    var activeFilter = 'all';

    function runSearch() {
      var query = input.value.trim();
      var q = normalize(query);
      var filtered = data.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.year,
          movie.region,
          movie.type,
          movie.genre,
          movie.categoryName,
          (movie.tags || []).join(' '),
          movie.summary
        ].join(' '));
        var matchesQuery = !q || haystack.indexOf(q) !== -1;
        var matchesType = activeFilter === 'all' || movie.type.indexOf(activeFilter) !== -1;
        return matchesQuery && matchesType;
      }).slice(0, 96);

      results.innerHTML = filtered.map(movieCard).join('');
      if (filtered.length) {
        status.textContent = query ? '找到 ' + filtered.length + ' 条相关影片。' : '为你推荐 ' + filtered.length + ' 部热门影片。';
      } else {
        status.textContent = '没有找到匹配影片，请换一个关键词。';
      }
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      runSearch();
    });

    input.addEventListener('input', function () {
      window.clearTimeout(input._timer);
      input._timer = window.setTimeout(runSearch, 160);
    });

    filterButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        activeFilter = button.getAttribute('data-filter') || 'all';
        filterButtons.forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        runSearch();
      });
    });

    input.value = getQueryParam('q');
    runSearch();
  }

  function initPlayerShell() {
    qsa('[data-player-panel]').forEach(function (panel) {
      var button = panel.querySelector('[data-player-start]');
      if (!button) {
        return;
      }
      button.addEventListener('click', function () {
        panel.classList.add('is-playing');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHeaderSearch();
    initHero();
    initSearchPage();
    initPlayerShell();
  });
}());
