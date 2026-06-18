(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMobileMenu() {
        var button = document.querySelector("[data-menu-button]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHeroCarousel() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        if (!slides.length) {
            return;
        }
        var index = 0;
        function show(nextIndex) {
            index = nextIndex;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                var next = Number(dot.getAttribute("data-hero-dot"));
                show(next);
            });
        });
        window.setInterval(function () {
            show((index + 1) % slides.length);
        }, 5200);
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function setupMovieFilters() {
        var lists = Array.prototype.slice.call(document.querySelectorAll("[data-movie-list]"));
        if (!lists.length) {
            return;
        }
        var searchInput = document.querySelector(".movie-search-input");
        var filterSelect = document.querySelector(".movie-filter-select");
        var empty = document.querySelector("[data-empty-result]");
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q");
        if (q && searchInput) {
            searchInput.value = q;
        }
        function apply() {
            var query = normalize(searchInput ? searchInput.value : "");
            var selected = normalize(filterSelect ? filterSelect.value : "");
            var visibleCount = 0;
            lists.forEach(function (list) {
                var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-category"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-genre")
                    ].join(" "));
                    var matchedQuery = !query || haystack.indexOf(query) !== -1;
                    var matchedSelect = !selected || haystack.indexOf(selected) !== -1;
                    var matched = matchedQuery && matchedSelect;
                    card.style.display = matched ? "" : "none";
                    if (matched) {
                        visibleCount += 1;
                    }
                });
            });
            if (empty) {
                empty.classList.toggle("is-visible", visibleCount === 0);
            }
        }
        if (searchInput) {
            searchInput.addEventListener("input", apply);
        }
        if (filterSelect) {
            filterSelect.addEventListener("change", apply);
        }
        apply();
    }

    window.initVideoPlayer = function (source) {
        var shell = document.querySelector("[data-player]");
        if (!shell) {
            return;
        }
        var video = shell.querySelector("video");
        var trigger = shell.querySelector(".player-cover");
        var hlsInstance = null;
        var started = false;
        function start() {
            if (!video || started) {
                return;
            }
            started = true;
            shell.classList.add("is-playing");
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                video.play().catch(function () {});
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal && hlsInstance) {
                        hlsInstance.destroy();
                        hlsInstance = null;
                        video.src = source;
                        video.play().catch(function () {});
                    }
                });
                return;
            }
            video.src = source;
            video.play().catch(function () {});
        }
        if (trigger) {
            trigger.addEventListener("click", start);
        }
        if (video) {
            video.addEventListener("click", function () {
                if (!started) {
                    start();
                }
            });
        }
    };

    ready(function () {
        setupMobileMenu();
        setupHeroCarousel();
        setupMovieFilters();
    });
}());
