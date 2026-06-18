(function () {
  var navToggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startHero() {
      stopHero();
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    function stopHero() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var index = Number(dot.getAttribute('data-hero-dot')) || 0;
        showSlide(index);
        startHero();
      });
    });

    hero.addEventListener('mouseenter', stopHero);
    hero.addEventListener('mouseleave', startHero);
    showSlide(0);
    startHero();
  }

  var filterPanels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

  filterPanels.forEach(function (panel) {
    var input = panel.querySelector('[data-search-input]');
    var category = panel.querySelector('[data-category-filter]');
    var year = panel.querySelector('[data-year-filter]');
    var scope = panel.parentElement || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
    var empty = scope.querySelector('[data-empty-state]');

    function applyFilter() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var categoryValue = category ? category.value : '';
      var yearValue = year ? year.value : '';
      var shown = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-tags') || '',
          card.getAttribute('data-category') || '',
          card.getAttribute('data-year') || ''
        ].join(' ').toLowerCase();
        var matchQuery = !query || haystack.indexOf(query) !== -1;
        var matchCategory = !categoryValue || card.getAttribute('data-category') === categoryValue;
        var matchYear = !yearValue || card.getAttribute('data-year') === yearValue;
        var visible = matchQuery && matchCategory && matchYear;

        card.classList.toggle('is-filtered-out', !visible);

        if (visible) {
          shown += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', shown === 0);
      }
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    if (category) {
      category.addEventListener('change', applyFilter);
    }

    if (year) {
      year.addEventListener('change', applyFilter);
    }

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');

    if (q && input) {
      input.value = q;
    }

    applyFilter();
  });

  var playerBlocks = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  playerBlocks.forEach(function (block) {
    var video = block.querySelector('video');
    var cover = block.querySelector('.player-cover');
    var source = block.getAttribute('data-video');
    var hlsInstance = null;
    var isReady = false;

    if (!video || !source) {
      return;
    }

    function prepareVideo() {
      if (isReady) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }

      video.controls = true;
      isReady = true;
    }

    function playVideo() {
      prepareVideo();

      if (cover) {
        cover.classList.add('is-hidden');
      }

      var result = video.play();

      if (result && typeof result.catch === 'function') {
        result.catch(function () {
          video.controls = true;
        });
      }
    }

    if (cover) {
      cover.addEventListener('click', playVideo);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });

    video.addEventListener('play', function () {
      if (cover) {
        cover.classList.add('is-hidden');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
