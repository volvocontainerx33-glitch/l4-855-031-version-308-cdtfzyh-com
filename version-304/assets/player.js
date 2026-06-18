(function () {
  var hlsPromise = null;

  function loadHls() {
    if (!hlsPromise) {
      hlsPromise = import('./hls-vendor.js').then(function (module) {
        return module.H;
      });
    }

    return hlsPromise;
  }

  function bindPlayer(player) {
    var video = player.querySelector('video');
    var trigger = player.querySelector('.player-poster');
    var source = video ? video.getAttribute('data-stream') : '';
    var ready = false;
    var hls = null;

    if (!video || !trigger || !source) {
      return;
    }

    function beginPlayback() {
      player.classList.add('is-playing');

      if (!ready) {
        ready = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else {
          loadHls().then(function (Hls) {
            if (Hls && Hls.isSupported()) {
              hls = new Hls({ enableWorker: true });
              hls.loadSource(source);
              hls.attachMedia(video);
            } else {
              video.src = source;
            }

            return video.play();
          }).catch(function () {
            video.src = source;
            video.play().catch(function () {
              player.classList.remove('is-playing');
            });
          });

          return;
        }
      }

      var playRequest = video.play();

      if (playRequest && typeof playRequest.catch === 'function') {
        playRequest.catch(function () {
          player.classList.remove('is-playing');
        });
      }
    }

    trigger.addEventListener('click', beginPlayback);

    video.addEventListener('click', function () {
      if (video.paused) {
        beginPlayback();
      }
    });

    video.addEventListener('play', function () {
      player.classList.add('is-playing');
    });

    video.addEventListener('ended', function () {
      player.classList.remove('is-playing');
    });

    window.addEventListener('pagehide', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(bindPlayer);
}());
