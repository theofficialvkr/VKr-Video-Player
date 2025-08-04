 const directExtensions = ['mp4', 'avi', 'm3u8', 'mpd', 'webm', '3gp', 'mpeg', 'flv', 'wmv', 'mov', 'ogv', 'm4v'];

    function getExtension(url) {
      return url.split('.').pop().split('?')[0].toLowerCase();
    }

    function isDirectMedia(url) {
      const ext = getExtension(url);
      return directExtensions.includes(ext);
    }

    function isYouTube(url) {
      const ytRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
      return ytRegex.test(url);
    }

    function getYouTubeId(url) {
      const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      return match ? match[1] : null;
    }

    function extractTeraboxId(url) {
      const regexes = [
        /\/s\/([a-zA-Z0-9_\-]+)/,
        /surl=([a-zA-Z0-9_\-]+)/,
        /\/[^?]*\/([a-zA-Z0-9_\-]+)/
      ];

      for (let pattern of regexes) {
        const match = url.match(pattern);
        if (match) {
          const id = match[1];
          return id.startsWith('1') ? id.slice(1) : id;
        }
      }
      return null;
    }

    async function isUrlReachable(url) {
      try {
        const res = await fetch(url, { method: 'HEAD', mode: 'no-cors' });
        return res.ok || res.status === 0;
      } catch {
        return false;
      }
    }

    function buildYouTubeEmbed(ytID) {
      return `<iframe class="iframeVK" src="https://www.youtube-nocookie.com/embed/${ytID}" frameborder="0" allowfullscreen></iframe>`;
    }

    function buildTeraboxEmbed(id) {
      return `
        <div style="overflow:hidden; background:transparent; margin: 5px auto; max-width:100vw; width: 370px;">
          <iframe align="center" sandbox="allow-same-origin allow-scripts allow-presentation" scrolling="no" allow="fullscreen" src="https://mdiskplay.com/terabox/${id}" style="border: 0; margin-left: -320px; height: 324px; margin-top: -110px; background:transparent; width: 1000px;"></iframe>
        </div>`;
    }

    function buildVideoElement(url, ext) {
      return `<video class="videoVK" controls><source src="${url}" type="video/${ext}"></video>`;
    }

    function buildAudioElement(url, ext) {
      return `<audio class="audioVK" controls><source src="${url}" type="audio/${ext}"></audio>`;
    }

    function buildHlsPlayer(url) {
      return `
        <video class="videoVK" id="video-player" controls></video>
        <script>
          const video = document.getElementById("video-player");
          if (Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource("${url}");
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => video.play());
          } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = "${url}";
            video.addEventListener("loadedmetadata", () => video.play());
          }
        </script>`;
    }

    function buildDashPlayer(url) {
      return `
        <video class="videoVK" id="video-player" controls></video>
        <script>
          const video = document.getElementById("video-player");
          const player = dashjs.MediaPlayer().create();
          player.initialize(video, "${url}", true);
        </script>`;
    }

    async function loadMedia() {
      const url = document.getElementById("media-url").value.trim();
      const ext = getExtension(url);
      const container = document.getElementById("player-output");

      if (!url) {
        container.innerHTML = `<p class="error-messageVK">Please provide a media URL.</p>`;
        return;
      }

      if (isYouTube(url)) {
        const ytID = getYouTubeId(url);
        container.innerHTML = buildYouTubeEmbed(ytID);
        return;
      }

      const teraboxID = extractTeraboxId(url);
      if (teraboxID) {
        container.innerHTML = buildTeraboxEmbed(teraboxID);
        return;
      }

      if (isDirectMedia(url)) {
        if (ext === 'm3u8') {
          container.innerHTML = buildHlsPlayer(url);
          return;
        } else if (ext === 'mpd') {
          container.innerHTML = buildDashPlayer(url);
          return;
        } else if (['mp4', 'webm', 'mov'].includes(ext)) {
          container.innerHTML = buildVideoElement(url, ext);
          return;
        } else if (['mp3', 'ogg', 'wav'].includes(ext)) {
          container.innerHTML = buildAudioElement(url, ext);
          return;
        }
      }

      // fallback iframe (CORS proxy)
      container.innerHTML = `<iframe class="iframeVK" src="https://vkrcors.vercel.app/proxy?proxyurl=${encodeURIComponent(url)}" frameborder="0" allowfullscreen></iframe>`;
    }
