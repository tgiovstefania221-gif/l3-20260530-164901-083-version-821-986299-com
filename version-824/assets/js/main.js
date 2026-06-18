(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-nav-menu]");

    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        menu.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
      var thumbs = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-thumb]"));
      var index = 0;

      function showSlide(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === index);
        });
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          showSlide(dotIndex);
        });
      });

      thumbs.forEach(function (thumb, thumbIndex) {
        thumb.addEventListener("mouseenter", function () {
          showSlide(thumbIndex);
        });
      });

      showSlide(0);
      setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]")).forEach(function (scope) {
      var input = scope.querySelector("[data-search-input]");
      var selects = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-select]"));
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));

      function valueOf(name) {
        var select = scope.querySelector('[data-filter-select="' + name + '"]');
        return select ? select.value.trim().toLowerCase() : "";
      }

      function applyFilters() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var year = valueOf("year");
        var type = valueOf("type");
        var region = valueOf("region");

        cards.forEach(function (card) {
          var text = [
            card.getAttribute("data-title"),
            card.getAttribute("data-type"),
            card.getAttribute("data-region"),
            card.getAttribute("data-category")
          ].join(" ").toLowerCase();
          var matchQuery = !query || text.indexOf(query) !== -1;
          var matchYear = !year || (card.getAttribute("data-year") || "").toLowerCase() === year;
          var matchType = !type || (card.getAttribute("data-type") || "").toLowerCase() === type;
          var matchRegion = !region || (card.getAttribute("data-region") || "").toLowerCase() === region;
          card.style.display = matchQuery && matchYear && matchType && matchRegion ? "" : "none";
        });
      }

      if (input) {
        input.addEventListener("input", applyFilters);
      }
      selects.forEach(function (select) {
        select.addEventListener("change", applyFilters);
      });
    });
  });
})();
