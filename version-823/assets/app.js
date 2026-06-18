(function () {
    var menuToggle = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener("click", function () {
            mobileNav.classList.toggle("is-open");
        });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var active = 0;
        var timer;

        function show(index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, current) {
                slide.classList.toggle("is-active", current === active);
            });
            dots.forEach(function (dot, current) {
                dot.classList.toggle("is-active", current === active);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5600);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(active - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(active + 1);
                restart();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                restart();
            });
        });

        show(0);
        restart();
    }

    var localForms = Array.prototype.slice.call(document.querySelectorAll("[data-local-search]"));
    var searchInputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
    var yearFilters = Array.prototype.slice.call(document.querySelectorAll("[data-filter-year]"));
    var regionFilters = Array.prototype.slice.call(document.querySelectorAll("[data-filter-region]"));
    var typeFilters = Array.prototype.slice.call(document.querySelectorAll("[data-filter-type]"));
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var emptyState = document.querySelector("[data-empty-state]");

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function currentValue(list) {
        return list.length ? normalize(list[0].value) : "";
    }

    function runFilters() {
        if (!cards.length) {
            return;
        }
        var query = normalize(searchInputs.length ? searchInputs[0].value : "");
        var year = currentValue(yearFilters);
        var region = currentValue(regionFilters);
        var type = currentValue(typeFilters);
        var visible = 0;

        cards.forEach(function (card) {
            var haystack = normalize([
                card.dataset.title,
                card.dataset.region,
                card.dataset.year,
                card.dataset.type,
                card.dataset.genre,
                card.dataset.tags,
                card.textContent
            ].join(" "));
            var cardYear = normalize(card.dataset.year);
            var cardRegion = normalize(card.dataset.region);
            var cardType = normalize(card.dataset.type);
            var matched = (!query || haystack.indexOf(query) !== -1) &&
                (!year || cardYear === year) &&
                (!region || cardRegion.indexOf(region) !== -1) &&
                (!type || cardType.indexOf(type) !== -1);

            card.style.display = matched ? "" : "none";
            if (matched) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle("is-visible", visible === 0);
        }
    }

    if (searchInputs.length) {
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q");
        if (initialQuery) {
            searchInputs.forEach(function (input) {
                input.value = initialQuery;
            });
        }
    }

    localForms.forEach(function (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            runFilters();
        });
    });

    searchInputs.concat(yearFilters).concat(regionFilters).concat(typeFilters).forEach(function (element) {
        element.addEventListener("input", runFilters);
        element.addEventListener("change", runFilters);
    });

    runFilters();
})();
