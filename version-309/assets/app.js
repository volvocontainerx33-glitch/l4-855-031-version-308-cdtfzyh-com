(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function setupNavigation() {
        var toggle = document.querySelector('[data-nav-toggle]');
        if (!toggle) {
            return;
        }
        toggle.addEventListener('click', function () {
            document.body.classList.toggle('nav-open');
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        if (slides.length <= 1) {
            return;
        }
        var current = 0;
        var timer;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function restart() {
            window.clearInterval(timer);
            start();
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                restart();
            });
        });
        start();
    }

    function setupPageFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
        panels.forEach(function (panel) {
            var scope = panel.closest('section') || document;
            var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
            var searchInput = panel.querySelector('.js-filter-input');
            var selects = Array.prototype.slice.call(panel.querySelectorAll('.js-filter-select'));
            var count = panel.querySelector('[data-filter-count]');

            function applyFilters() {
                var keyword = normalize(searchInput ? searchInput.value : '');
                var visible = 0;
                cards.forEach(function (card) {
                    var searchText = normalize(card.getAttribute('data-search'));
                    var matchesKeyword = !keyword || searchText.indexOf(keyword) !== -1;
                    var matchesSelects = selects.every(function (select) {
                        var filterName = select.getAttribute('data-filter');
                        var expected = normalize(select.value);
                        if (!expected) {
                            return true;
                        }
                        return normalize(card.getAttribute('data-' + filterName)) === expected;
                    });
                    var shouldShow = matchesKeyword && matchesSelects;
                    card.classList.toggle('is-hidden-card', !shouldShow);
                    if (shouldShow) {
                        visible += 1;
                    }
                });
                if (count) {
                    count.textContent = visible + ' 部影片';
                }
            }

            if (searchInput) {
                searchInput.addEventListener('input', applyFilters);
            }
            selects.forEach(function (select) {
                select.addEventListener('change', applyFilters);
            });
            applyFilters();
        });
    }

    function setupGlobalSearch() {
        var input = document.querySelector('.js-global-search');
        var results = document.getElementById('global-results');
        if (!input || !results || !window.MOVIES) {
            return;
        }
        var selects = Array.prototype.slice.call(document.querySelectorAll('.js-global-select'));
        var count = document.querySelector('[data-global-count]');
        var movies = window.MOVIES;

        function fillSelect(select, values) {
            values.forEach(function (value) {
                var option = document.createElement('option');
                option.value = value;
                option.textContent = value;
                select.appendChild(option);
            });
        }

        selects.forEach(function (select) {
            var filter = select.getAttribute('data-filter');
            var values = Array.from(new Set(movies.map(function (movie) {
                return movie[filter];
            }).filter(Boolean))).sort().reverse();
            fillSelect(select, values);
        });

        function createCard(movie) {
            var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
                return '<span>' + escapeHtml(tag) + '</span>';
            }).join('');
            return [
                '<article class="movie-card" data-title="' + escapeHtml(movie.title) + '">',
                '    <a class="poster-link" href="' + escapeHtml(movie.href) + '">',
                '        <div class="image-box poster-box" data-title="' + escapeHtml(movie.title) + '">',
                '            <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" onerror="this.classList.add(\'is-hidden\'); this.parentElement.classList.add(\'image-fallback\');">',
                '        </div>',
                '    </a>',
                '    <div class="card-body">',
                '        <div class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
                '        <h3><a href="' + escapeHtml(movie.href) + '">' + escapeHtml(movie.title) + '</a></h3>',
                '        <p>' + escapeHtml(movie.oneLine) + '</p>',
                '        <div class="tag-row">' + tags + '</div>',
                '        <div class="card-actions"><a class="card-category" href="' + escapeHtml(movie.categoryHref) + '">' + escapeHtml(movie.categoryName) + '</a><a class="watch-link" href="' + escapeHtml(movie.href) + '">立即观看</a></div>',
                '    </div>',
                '</article>'
            ].join('\n');
        }

        function escapeHtml(value) {
            return String(value || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }

        function applySearch() {
            var keyword = normalize(input.value);
            var activeFilters = selects.map(function (select) {
                return {
                    name: select.getAttribute('data-filter'),
                    value: normalize(select.value)
                };
            });
            var filtered = movies.filter(function (movie) {
                var haystack = normalize([movie.title, movie.year, movie.region, movie.type, movie.genre, (movie.tags || []).join(','), movie.oneLine].join(' '));
                var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchesFilters = activeFilters.every(function (filter) {
                    return !filter.value || normalize(movie[filter.name]) === filter.value;
                });
                return matchesKeyword && matchesFilters;
            });
            var limited = filtered.slice(0, 300);
            results.innerHTML = limited.map(createCard).join('\n');
            if (count) {
                count.textContent = filtered.length + ' 条结果，当前显示 ' + limited.length + ' 条';
            }
        }

        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        input.value = initial;
        input.addEventListener('input', applySearch);
        selects.forEach(function (select) {
            select.addEventListener('change', applySearch);
        });
        applySearch();
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
        players.forEach(function (player) {
            var button = player.querySelector('[data-play-button]');
            var video = player.querySelector('video');
            var message = player.querySelector('[data-player-message]');
            var source = player.getAttribute('data-src');
            var hlsInstance;

            function setMessage(text) {
                if (message) {
                    message.textContent = text;
                }
            }

            function playVideo() {
                if (!source) {
                    setMessage('当前影片没有可用播放源。');
                    return;
                }
                player.classList.add('is-playing');
                setMessage('正在加载高清 HLS 播放源…');

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    video.play().then(function () {
                        setMessage('正在播放。');
                    }).catch(function () {
                        setMessage('浏览器阻止了自动播放，请再次点击播放器。');
                    });
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    if (hlsInstance) {
                        hlsInstance.destroy();
                    }
                    hlsInstance = new window.Hls({
                        maxBufferLength: 30,
                        backBufferLength: 30
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().then(function () {
                            setMessage('正在播放。');
                        }).catch(function () {
                            setMessage('播放器已就绪，请再次点击播放。');
                        });
                    });
                    hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            setMessage('播放源加载失败，请刷新页面或稍后重试。');
                        }
                    });
                    return;
                }

                video.src = source;
                video.play().catch(function () {
                    setMessage('当前浏览器不支持 HLS 播放，请使用最新版 Chrome、Edge、Safari 或 Firefox。');
                });
            }

            if (button) {
                button.addEventListener('click', playVideo);
            }
        });
    }

    ready(function () {
        setupNavigation();
        setupHero();
        setupPageFilters();
        setupGlobalSearch();
        setupPlayers();
    });
}());
