(function () {
  function startMoviePlayer(videoId, buttonId, url) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var hls = null;
    var loaded = false;

    function loadVideo() {
      if (!video || loaded) {
        return;
      }
      loaded = true;
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

    function playVideo() {
      loadVideo();
      var playAction = video.play();
      if (playAction && typeof playAction.then === "function") {
        playAction.catch(function () {});
      }
      if (button) {
        button.classList.add("is-hidden");
      }
    }

    if (button && video) {
      button.addEventListener("click", playVideo);
      video.addEventListener("click", function () {
        if (video.paused) {
          playVideo();
        }
      });
      video.addEventListener("play", function () {
        button.classList.add("is-hidden");
      });
      video.addEventListener("pause", function () {
        if (!video.ended) {
          button.classList.remove("is-hidden");
        }
      });
      video.addEventListener("ended", function () {
        button.classList.remove("is-hidden");
      });
    }
  }

  window.startMoviePlayer = startMoviePlayer;
})();
