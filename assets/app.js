(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-button]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupCardsFilter() {
        var roots = selectAll("[data-filter-root]");
        roots.forEach(function (root) {
            var input = root.querySelector("[data-search-input]");
            var buttons = selectAll("[data-filter-button]", root);
            var cards = selectAll("[data-movie-card]", root);
            var activeValue = "all";

            function apply() {
                var query = normalize(input ? input.value : "");
                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute("data-search-text"));
                    var type = normalize(card.getAttribute("data-type"));
                    var year = normalize(card.getAttribute("data-year"));
                    var channel = normalize(card.getAttribute("data-channel"));
                    var matchQuery = !query || text.indexOf(query) !== -1;
                    var matchButton = activeValue === "all" || type.indexOf(activeValue) !== -1 || year === activeValue || channel === activeValue;
                    card.classList.toggle("hidden-card", !(matchQuery && matchButton));
                });
            }

            if (input) {
                input.addEventListener("input", apply);
            }

            buttons.forEach(function (button) {
                button.addEventListener("click", function () {
                    buttons.forEach(function (item) {
                        item.classList.remove("is-active");
                    });
                    button.classList.add("is-active");
                    activeValue = normalize(button.getAttribute("data-filter-button"));
                    apply();
                });
            });

            apply();
        });
    }

    function setupPlayer() {
        var player = document.querySelector("[data-player]");
        if (!player) {
            return;
        }

        var video = player.querySelector("video");
        var layer = player.querySelector("[data-play-layer]");
        var trigger = player.querySelector("[data-play-trigger]");
        var url = player.getAttribute("data-m3u8");
        var loaded = false;
        var hls = null;

        function start() {
            if (!video || !url) {
                return;
            }

            if (!loaded) {
                loaded = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = url;
                    video.play();
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(url);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MEDIA_ATTACHED, function () {
                        video.play();
                    });
                } else {
                    video.src = url;
                    video.play();
                }
            } else {
                video.play();
            }

            if (layer) {
                layer.classList.add("is-hidden");
            }
        }

        if (trigger) {
            trigger.addEventListener("click", start);
        }

        if (layer) {
            layer.addEventListener("click", start);
        }

        video.addEventListener("play", function () {
            if (layer) {
                layer.classList.add("is-hidden");
            }
        });

        video.addEventListener("pause", function () {
            if (video.currentTime === 0 && layer) {
                layer.classList.remove("is-hidden");
            }
        });

        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        setupMenu();
        setupCardsFilter();
        setupPlayer();
    });
})();
