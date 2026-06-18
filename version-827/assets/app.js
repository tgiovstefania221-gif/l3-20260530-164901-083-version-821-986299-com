(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function textMatch(movie, query) {
    if (!query) {
      return true;
    }
    var haystack = [
      movie.title,
      movie.year,
      movie.region,
      movie.genre,
      movie.type,
      movie.category,
      movie.oneLine,
      (movie.tags || []).join(" ")
    ].join(" ").toLowerCase();
    return haystack.indexOf(query.toLowerCase()) !== -1;
  }

  function renderSearchResults() {
    var page = document.querySelector("[data-search-page]");
    if (!page || !window.SEARCH_MOVIES) {
      return;
    }
    var input = page.querySelector("[data-search-input]");
    var category = page.querySelector("[data-search-category]");
    var button = page.querySelector("[data-search-button]");
    var results = document.getElementById("search-results");
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;

    function card(movie) {
      var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
        return "<span>" + escapeHtml(tag) + "</span>";
      }).join("");
      return [
        "<article class=\"movie-card\">",
        "<a class=\"poster-link\" href=\"" + escapeHtml(movie.href) + "\">",
        "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
        "<span class=\"poster-gradient\"></span>",
        "<span class=\"poster-play\">▶</span>",
        "<span class=\"poster-badge\">" + escapeHtml(movie.category) + "</span>",
        "</a>",
        "<div class=\"card-body\">",
        "<a class=\"card-title\" href=\"" + escapeHtml(movie.href) + "\">" + escapeHtml(movie.title) + "</a>",
        "<p>" + escapeHtml(movie.oneLine) + "</p>",
        "<div class=\"card-meta\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span>" + tags + "</div>",
        "</div>",
        "</article>"
      ].join("");
    }

    function update() {
      var query = input.value.trim();
      var selectedCategory = category.value;
      var matches = window.SEARCH_MOVIES.filter(function (movie) {
        return textMatch(movie, query) && (!selectedCategory || movie.category === selectedCategory);
      }).slice(0, 120);
      if (!matches.length) {
        results.innerHTML = "<div class=\"empty-state\">没有找到匹配影片</div>";
        return;
      }
      results.innerHTML = matches.map(card).join("");
    }

    input.addEventListener("input", update);
    category.addEventListener("change", update);
    button.addEventListener("click", update);
    update();
  }

  ready(function () {
    var toggle = document.querySelector(".mobile-toggle");
    var menu = document.querySelector(".mobile-menu");
    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        var isOpen = !menu.hasAttribute("hidden");
        if (isOpen) {
          menu.setAttribute("hidden", "");
          toggle.setAttribute("aria-expanded", "false");
          toggle.textContent = "☰";
        } else {
          menu.removeAttribute("hidden");
          toggle.setAttribute("aria-expanded", "true");
          toggle.textContent = "×";
        }
      });
    }

    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var field = form.querySelector("input[name='q']");
        var value = field ? field.value.trim() : "";
        window.location.href = value ? "./search.html?q=" + encodeURIComponent(value) : "./search.html";
      });
    });

    var hero = document.querySelector("[data-hero-slider]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
      var index = 0;
      function show(next) {
        index = (next + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === index);
        });
      }
      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
        });
      });
      if (slides.length > 1) {
        window.setInterval(function () {
          show(index + 1);
        }, 5600);
      }
    }

    document.querySelectorAll("[data-card-filter]").forEach(function (panel) {
      var input = panel.querySelector("[data-filter-text]");
      var year = panel.querySelector("[data-filter-year]");
      var region = panel.querySelector("[data-filter-region]");
      var cards = Array.prototype.slice.call(document.querySelectorAll("[data-filter-card]"));
      function updateCards() {
        var q = input.value.trim().toLowerCase();
        var y = year.value;
        var r = region.value;
        cards.forEach(function (card) {
          var title = (card.getAttribute("data-title") || "").toLowerCase();
          var genre = (card.getAttribute("data-genre") || "").toLowerCase();
          var type = (card.getAttribute("data-type") || "").toLowerCase();
          var okText = !q || title.indexOf(q) !== -1 || genre.indexOf(q) !== -1 || type.indexOf(q) !== -1;
          var okYear = !y || card.getAttribute("data-year") === y;
          var okRegion = !r || card.getAttribute("data-region") === r;
          card.classList.toggle("is-hidden-card", !(okText && okYear && okRegion));
        });
      }
      [input, year, region].forEach(function (control) {
        control.addEventListener("input", updateCards);
        control.addEventListener("change", updateCards);
      });
    });

    renderSearchResults();
  });
})();
