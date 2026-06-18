(function() {
    function ready(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    ready(function() {
        var menuButton = document.querySelector('[data-menu-button]');
        var mobilePanel = document.querySelector('[data-mobile-panel]');
        if (menuButton && mobilePanel) {
            menuButton.addEventListener('click', function() {
                mobilePanel.classList.toggle('is-open');
            });
        }

        var hero = document.querySelector('[data-hero]');
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
            var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
            var index = 0;
            var timer = null;

            function show(nextIndex) {
                if (!slides.length) {
                    return;
                }
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function(slide, slideIndex) {
                    slide.classList.toggle('is-active', slideIndex === index);
                });
                dots.forEach(function(dot, dotIndex) {
                    dot.classList.toggle('is-active', dotIndex === index);
                });
            }

            function start() {
                stop();
                timer = window.setInterval(function() {
                    show(index + 1);
                }, 5200);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
            }

            dots.forEach(function(dot, dotIndex) {
                dot.addEventListener('click', function() {
                    show(dotIndex);
                    start();
                });
            });
            hero.addEventListener('mouseenter', stop);
            hero.addEventListener('mouseleave', start);
            show(0);
            start();
        }

        var lists = Array.prototype.slice.call(document.querySelectorAll('[data-card-list]'));
        lists.forEach(function(list) {
            var scope = list.closest('section') || document;
            var input = scope.querySelector('[data-search-input]');
            var selects = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-select]'));
            var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));

            function applyFilters() {
                var query = normalize(input ? input.value : '');
                var filters = {};
                selects.forEach(function(select) {
                    filters[select.getAttribute('data-filter-select')] = normalize(select.value);
                });
                cards.forEach(function(card) {
                    var text = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-type'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-tags')
                    ].join(' '));
                    var passQuery = !query || text.indexOf(query) !== -1;
                    var passType = !filters.type || normalize(card.getAttribute('data-type')).indexOf(filters.type) !== -1 || normalize(card.getAttribute('data-tags')).indexOf(filters.type) !== -1;
                    var passYear = !filters.year || normalize(card.getAttribute('data-year')).indexOf(filters.year) !== -1;
                    card.classList.toggle('hidden-card', !(passQuery && passType && passYear));
                });
            }

            if (input) {
                input.addEventListener('input', applyFilters);
                var params = new URLSearchParams(window.location.search);
                var q = params.get('q');
                if (q) {
                    input.value = q;
                }
            }
            selects.forEach(function(select) {
                select.addEventListener('change', applyFilters);
            });
            applyFilters();
        });
    });
})();

function setupMoviePlayer(videoId, sourceUrl) {
    var video = document.getElementById(videoId);
    if (!video || !sourceUrl) {
        return;
    }
    var overlay = document.querySelector('[data-player-target="' + videoId + '"]');
    var hlsInstance = null;
    var sourceLoaded = false;

    function loadSource() {
        if (sourceLoaded) {
            return;
        }
        sourceLoaded = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = sourceUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hlsInstance.loadSource(sourceUrl);
            hlsInstance.attachMedia(video);
        } else {
            video.src = sourceUrl;
        }
    }

    function startPlayback() {
        loadSource();
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function() {});
        }
    }

    if (overlay) {
        overlay.addEventListener('click', startPlayback);
    }

    video.addEventListener('click', function() {
        if (video.paused) {
            startPlayback();
        }
    });

    video.addEventListener('play', function() {
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
    });

    window.addEventListener('beforeunload', function() {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
