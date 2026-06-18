(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupNavigation() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, position) {
                slide.classList.toggle("is-active", position === index);
            });
            dots.forEach(function (dot, position) {
                dot.classList.toggle("is-active", position === index);
            });
        }
        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }
        dots.forEach(function (dot, position) {
            dot.addEventListener("click", function () {
                show(position);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        start();
    }

    function setupFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
        scopes.forEach(function (scope) {
            var input = scope.querySelector("[data-filter-input]");
            var year = scope.querySelector("[data-year-filter]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-title]"));
            function apply() {
                var query = input ? input.value.trim().toLowerCase() : "";
                var selectedYear = year ? year.value : "";
                cards.forEach(function (card) {
                    var text = [
                        card.getAttribute("data-title") || "",
                        card.getAttribute("data-tags") || "",
                        card.getAttribute("data-genre") || ""
                    ].join(" ").toLowerCase();
                    var cardYear = card.getAttribute("data-year") || "";
                    var matchedQuery = !query || text.indexOf(query) !== -1;
                    var matchedYear = !selectedYear || cardYear === selectedYear;
                    card.classList.toggle("is-filtered-out", !(matchedQuery && matchedYear));
                });
            }
            if (input) {
                input.addEventListener("input", apply);
            }
            if (year) {
                year.addEventListener("change", apply);
            }
        });
    }

    function movieCard(movie) {
        var tags = (movie.tags || []).slice(0, 4).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return "<article class=\"movie-card\">" +
            "<a class=\"card-link\" href=\"./" + encodeURI(movie.file) + "\">" +
            "<span class=\"poster-wrap\">" +
            "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
            "<span class=\"poster-shade\"></span>" +
            "<span class=\"play-badge\">▶</span>" +
            "<span class=\"corner-pill\">" + escapeHtml(movie.type) + "</span>" +
            "</span>" +
            "<span class=\"card-body\">" +
            "<strong>" + escapeHtml(movie.title) + "</strong>" +
            "<span class=\"card-desc\">" + escapeHtml(movie.desc) + "</span>" +
            "<span class=\"card-meta\">" + escapeHtml(movie.year) + " · " + escapeHtml(movie.region) + " · " + escapeHtml(movie.genre) + "</span>" +
            "<span class=\"card-tags\">" + tags + "</span>" +
            "</span>" +
            "</a>" +
            "</article>";
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function setupSearchPage() {
        var results = document.querySelector("[data-search-results]");
        if (!results || !window.moviesIndex) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = (params.get("q") || "").trim();
        var input = document.querySelector("[data-search-page-input]");
        var title = document.querySelector("[data-search-title]");
        if (input) {
            input.value = query;
        }
        var list = window.moviesIndex.slice();
        if (query) {
            var lowered = query.toLowerCase();
            list = list.filter(function (movie) {
                return [movie.title, movie.desc, movie.region, movie.year, movie.genre, (movie.tags || []).join(" ")]
                    .join(" ")
                    .toLowerCase()
                    .indexOf(lowered) !== -1;
            });
            if (title) {
                title.textContent = "搜索：“" + query + "”";
            }
        } else {
            list = list.sort(function (a, b) {
                return b.heat - a.heat;
            }).slice(0, 24);
        }
        if (!list.length) {
            results.innerHTML = "<div class=\"empty-state\">没有找到匹配内容</div>";
            return;
        }
        results.innerHTML = list.slice(0, 80).map(movieCard).join("");
    }

    window.initMoviePlayer = function (videoId, coverId, url) {
        var video = document.getElementById(videoId);
        var cover = document.getElementById(coverId);
        var initialized = false;
        var hls = null;
        if (!video || !cover || !url) {
            return;
        }
        function start() {
            cover.classList.add("is-hidden");
            if (!initialized) {
                initialized = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = url;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(url);
                    hls.attachMedia(video);
                } else {
                    video.src = url;
                }
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {});
            }
        }
        cover.addEventListener("click", start);
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            } else {
                video.pause();
            }
        });
        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    ready(function () {
        setupNavigation();
        setupHero();
        setupFilters();
        setupSearchPage();
    });
})();
