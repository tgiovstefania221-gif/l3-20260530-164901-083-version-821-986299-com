(function () {
    var heroTimers = new WeakMap();

    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function setupMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }

        function restart() {
            var existing = heroTimers.get(hero);
            if (existing) {
                window.clearInterval(existing);
            }
            heroTimers.set(hero, window.setInterval(function () {
                show(index + 1);
            }, 5200));
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot") || 0));
                restart();
            });
        });
        show(0);
        restart();
    }

    function normalizeText(value) {
        return String(value || "").toLowerCase().trim();
    }

    function setupFilters() {
        var input = document.querySelector("[data-filter-input]");
        var list = document.querySelector("[data-filter-list]");
        if (!list) {
            return;
        }
        var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter-value]"));
        var empty = document.querySelector("[data-empty-state]");
        var activeCategory = "all";

        function itemText(item) {
            return [
                item.getAttribute("data-title"),
                item.getAttribute("data-region"),
                item.getAttribute("data-year"),
                item.getAttribute("data-genre"),
                item.getAttribute("data-tags")
            ].join(" ").toLowerCase();
        }

        function apply() {
            var query = normalizeText(input ? input.value : "");
            var items = Array.prototype.slice.call(list.querySelectorAll(".movie-card, .rank-item"));
            var shown = 0;
            items.forEach(function (item) {
                var category = item.getAttribute("data-category") || "";
                var matchesCategory = activeCategory === "all" || category === activeCategory;
                var matchesQuery = !query || itemText(item).indexOf(query) !== -1;
                var visible = matchesCategory && matchesQuery;
                item.classList.toggle("is-hidden", !visible);
                if (visible) {
                    shown += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("show", shown === 0);
            }
        }

        if (input) {
            input.addEventListener("input", apply);
        }
        chips.forEach(function (chip) {
            chip.addEventListener("click", function () {
                activeCategory = chip.getAttribute("data-filter-value") || "all";
                chips.forEach(function (item) {
                    item.classList.toggle("active", item === chip);
                });
                apply();
            });
        });
        apply();
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
        players.forEach(function (player) {
            var video = player.querySelector("video");
            var button = player.querySelector(".player-start");
            var src = player.getAttribute("data-src");
            var started = false;
            var hlsInstance = null;

            if (!video || !button || !src) {
                return;
            }

            function markPlaying() {
                player.classList.add("playing");
            }

            function startPlayback() {
                if (!started) {
                    started = true;
                    if (window.Hls && window.Hls.isSupported()) {
                        hlsInstance = new window.Hls({
                            enableWorker: true,
                            lowLatencyMode: true
                        });
                        hlsInstance.loadSource(src);
                        hlsInstance.attachMedia(video);
                        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                            video.play().then(markPlaying).catch(markPlaying);
                        });
                    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                        video.src = src;
                        video.addEventListener("loadedmetadata", function () {
                            video.play().then(markPlaying).catch(markPlaying);
                        }, { once: true });
                    } else {
                        video.src = src;
                        video.play().then(markPlaying).catch(markPlaying);
                    }
                } else {
                    video.play().then(markPlaying).catch(markPlaying);
                }
            }

            button.addEventListener("click", startPlayback);
            video.addEventListener("play", markPlaying);
            video.addEventListener("pause", function () {
                if (!video.ended) {
                    player.classList.remove("playing");
                }
            });
            video.addEventListener("ended", function () {
                player.classList.remove("playing");
            });
            window.addEventListener("beforeunload", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupPlayers();
    });
})();
