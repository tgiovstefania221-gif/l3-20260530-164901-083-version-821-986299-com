(function() {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupNavigation() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !mobileNav) {
            return;
        }
        toggle.addEventListener("click", function() {
            var opened = mobileNav.classList.toggle("open");
            toggle.setAttribute("aria-expanded", opened ? "true" : "false");
        });
    }

    function setupHeroSlider() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        var prev = slider.querySelector("[data-hero-prev]");
        var next = slider.querySelector("[data-hero-next]");
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function() {
                show(current + 1);
            }, 5600);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener("click", function() {
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function() {
                show(current + 1);
                start();
            });
        }
        dots.forEach(function(dot, index) {
            dot.addEventListener("click", function() {
                show(index);
                start();
            });
        });
        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function applyFilter(section) {
        var input = section.querySelector("[data-filter-input]");
        var year = section.querySelector("[data-filter-year]");
        var type = section.querySelector("[data-filter-type]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
        var empty = document.querySelector("[data-empty-state]");
        var keyword = normalize(input ? input.value : "");
        var yearValue = year ? year.value : "";
        var typeValue = type ? type.value : "";
        var visibleCount = 0;

        cards.forEach(function(card) {
            var haystack = normalize([
                card.dataset.title,
                card.dataset.genre,
                card.dataset.region,
                card.dataset.tags,
                card.dataset.type,
                card.dataset.year
            ].join(" "));
            var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
            var matchYear = !yearValue || card.dataset.year === yearValue;
            var matchType = !typeValue || card.dataset.type === typeValue;
            var matched = matchKeyword && matchYear && matchType;
            card.classList.toggle("is-hidden", !matched);
            if (matched) {
                visibleCount += 1;
            }
        });

        if (empty) {
            empty.classList.toggle("show", visibleCount === 0);
        }
    }

    function setupFilters() {
        var toolbar = document.querySelector("[data-filter-section]");
        if (!toolbar) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        var input = toolbar.querySelector("[data-filter-input]");
        if (input && query && !input.value) {
            input.value = query;
        }
        Array.prototype.slice.call(toolbar.querySelectorAll("input, select")).forEach(function(element) {
            element.addEventListener("input", function() {
                applyFilter(toolbar);
            });
            element.addEventListener("change", function() {
                applyFilter(toolbar);
            });
        });
        var reset = toolbar.querySelector("[data-filter-reset]");
        if (reset) {
            reset.addEventListener("click", function() {
                Array.prototype.slice.call(toolbar.querySelectorAll("input, select")).forEach(function(element) {
                    element.value = "";
                });
                applyFilter(toolbar);
            });
        }
        applyFilter(toolbar);
    }

    window.initMoviePlayer = function(streamUrl) {
        var video = document.querySelector(".watch-video");
        var layer = document.querySelector(".player-layer");
        if (!video || !layer || !streamUrl) {
            return;
        }
        var loaded = false;
        var hlsInstance = null;

        function load() {
            if (loaded) {
                return;
            }
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    maxBufferLength: 30
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
        }

        function start() {
            load();
            layer.classList.add("is-hidden");
            video.setAttribute("controls", "controls");
            var playAction = video.play();
            if (playAction && typeof playAction.catch === "function") {
                playAction.catch(function() {});
            }
        }

        layer.addEventListener("click", start);
        layer.addEventListener("keydown", function(event) {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                start();
            }
        });
        window.addEventListener("beforeunload", function() {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    ready(function() {
        setupNavigation();
        setupHeroSlider();
        setupFilters();
    });
})();
