document.addEventListener("DOMContentLoaded", function () {
  var rootPrefix = document.body.getAttribute("data-root-prefix") || "";

  function withPrefix(path) {
    if (/^https?:\/\//.test(path)) {
      return path;
    }
    return rootPrefix + path.replace(/^\.\//, "");
  }

  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("active");
    });
  }

  document.querySelectorAll("[data-global-search]").forEach(function (box) {
    var input = box.querySelector("[data-global-search-input]");
    var panel = box.querySelector("[data-global-search-panel]");

    if (!input || !panel || !window.SITE_MOVIES) {
      return;
    }

    input.addEventListener("input", function () {
      var query = input.value.trim().toLowerCase();

      if (query.length < 1) {
        panel.classList.remove("active");
        panel.innerHTML = "";
        return;
      }

      var results = window.SITE_MOVIES.filter(function (item) {
        return item.search.indexOf(query) !== -1;
      }).slice(0, 12);

      if (!results.length) {
        panel.innerHTML = '<div class="search-result"><div></div><span>没有找到匹配影片</span></div>';
        panel.classList.add("active");
        return;
      }

      panel.innerHTML = results.map(function (item) {
        return '<a class="search-result" href="' + withPrefix(item.url) + '">' +
          '<img src="' + withPrefix(item.cover) + '" alt="' + item.title + '">' +
          '<span><strong>' + item.title + '</strong>' + item.region + ' · ' + item.year + ' · ' + item.type + '</span>' +
          '</a>';
      }).join("");
      panel.classList.add("active");
    });

    document.addEventListener("click", function (event) {
      if (!box.contains(event.target)) {
        panel.classList.remove("active");
      }
    });
  });

  var hero = document.querySelector("[data-hero-carousel]");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var previous = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function restartTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        restartTimer();
      });
    });

    if (previous) {
      previous.addEventListener("click", function () {
        showSlide(index - 1);
        restartTimer();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(index + 1);
        restartTimer();
      });
    }

    showSlide(0);
    restartTimer();
  }

  document.querySelectorAll("[data-filter-area]").forEach(function (area) {
    var list = area.parentElement.querySelector("[data-filter-list]");
    var empty = area.parentElement.querySelector("[data-empty-state]");
    var input = area.querySelector("[data-filter-input]");
    var year = area.querySelector("[data-filter-year]");
    var type = area.querySelector("[data-filter-type]");

    if (!list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]"));

    function applyFilter() {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      var selectedYear = year ? year.value : "";
      var selectedType = type ? type.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var text = card.getAttribute("data-search") || "";
        var cardYear = card.getAttribute("data-year") || "";
        var cardType = card.getAttribute("data-type") || "";
        var matched = true;

        if (keyword && text.indexOf(keyword) === -1) {
          matched = false;
        }

        if (selectedYear && cardYear !== selectedYear) {
          matched = false;
        }

        if (selectedType && cardType.indexOf(selectedType) === -1) {
          matched = false;
        }

        card.style.display = matched ? "" : "none";

        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("active", visible === 0);
      }
    }

    [input, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilter);
        control.addEventListener("change", applyFilter);
      }
    });
  });

  var player = document.querySelector("[data-player]");

  if (player) {
    var video = player.querySelector("[data-video]");
    var source = player.getAttribute("data-src");
    var overlays = document.querySelectorAll("[data-play]");
    var hlsInstance = null;

    function startVideo() {
      if (!video || !source) {
        return;
      }

      var overlay = player.querySelector(".player-overlay");

      if (overlay) {
        overlay.classList.add("hidden");
      }

      if (window.Hls && window.Hls.isSupported()) {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl") || video.canPlayType("application/x-mpegURL")) {
        video.src = source;
      } else {
        video.src = source;
      }

      video.controls = true;
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          video.controls = true;
        });
      }
    }

    overlays.forEach(function (button) {
      button.addEventListener("click", startVideo);
    });
  }
});
