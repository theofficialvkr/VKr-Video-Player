  const directExtensions = ['mp4', 'avi', 'm3u8', 'mpd', 'webm', '3gp', 'mpeg', 'flv', 'wmv', 'mov', 'ogv', 'm4v', 'mp3', 'ogg', 'wav'];

  function getExtension(url) {
    try {
      return url.split('.').pop().split(/[?#]/)[0].toLowerCase();
    } catch {
      return '';
    }
  }

  function isDirectMedia(url) {
    return directExtensions.includes(getExtension(url));
  }

  function isYouTube(url) {
    return /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/.test(url);
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
    for (const pattern of regexes) {
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

  function showError(message, container) {
    container.innerHTML = `<p class="error-messageVK">${message}</p>`;
  }

  function buildYouTubeEmbed(id) {
    return `<iframe class="iframeVK" src="https://www.youtube-nocookie.com/embed/${id}" frameborder="0" allowfullscreen></iframe>`;
  }

  function buildTeraboxEmbed(id) {
    return `
      <div style="overflow:hidden; background:transparent; margin: 5px auto; max-width:100vw; width: 370px;">
        <iframe align="center" sandbox="allow-same-origin allow-scripts allow-presentation" scrolling="no" allow="fullscreen" 
          src="https://mdiskplay.com/terabox/${id}" 
          style="border: 0; margin-left: -320px; height: 324px; margin-top: -110px; background:transparent; width: 1000px;"></iframe>
      </div>`;
  }

  function buildVideoElement(url, ext = "mp4") {
    return `<video class="videoVK" controls><source src="${url}" type="video/${ext}"></video>`;
  }

  function buildAudioElement(url, ext = "mp3") {
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

  function buildFallbackIframe(url) {
    return `<iframe class="iframeVK" src="https://vkrcors.vercel.app/proxy?proxyurl=${encodeURIComponent(url)}" frameborder="0" allowfullscreen></iframe>`;
  }

  async function tryVkrDownloader(url) {
    try {
      const response = await fetch(`https://vkrdownloader.xyz/server?api_key=vkrdownloader&vkr=${encodeURIComponent(url)}`);
      const result = await response.json();

      if (result?.data?.downloads?.length > 0) {
        // Pick best one, e.g., first mp4 or highest resolution
        const best = result.data.downloads.find(d => d.url.includes("mp4")) || result.data.downloads[0];
        if (best?.url) return best.url;
      }
    } catch (e) {
      console.warn("VKR API fallback failed", e);
    }
    return null;
  }

  async function loadMedia() {
    const url = document.getElementById("media-url").value.trim();
    const container = document.getElementById("player-output");
    container.innerHTML = `<p class="loading-messageVK">🔄 Loading media...</p>`;

    if (!url) {
      showError("⚠️ Please provide a media URL.", container);
      return;
    }

    // YouTube
    if (isYouTube(url)) {
      const ytID = getYouTubeId(url);
      if (ytID) {
        container.innerHTML = buildYouTubeEmbed(ytID);
      } else {
        showError("⚠️ Invalid YouTube link.", container);
      }
      return;
    }

    // Terabox
    const teraboxID = extractTeraboxId(url);
    if (teraboxID) {
      container.innerHTML = buildTeraboxEmbed(teraboxID);
      return;
    }

    const ext = getExtension(url);

    // Direct Media File
    if (isDirectMedia(url)) {
      const reachable = await isUrlReachable(url);
      if (!reachable) {
        showError("❌ Media URL is not reachable. Trying fallback...", container);
      } else {
        if (ext === 'm3u8') return container.innerHTML = buildHlsPlayer(url);
        if (ext === 'mpd') return container.innerHTML = buildDashPlayer(url);
        if (['mp4', 'webm', 'mov'].includes(ext)) return container.innerHTML = buildVideoElement(url, ext);
        if (['mp3', 'ogg', 'wav'].includes(ext)) return container.innerHTML = buildAudioElement(url, ext);
        return container.innerHTML = buildVideoElement(url, ext);
      }
    }

    // Try VKR Downloader API
    const vkrUrl = await tryVkrDownloader(url);
    if (vkrUrl && isDirectMedia(vkrUrl)) {
      const ext2 = getExtension(vkrUrl);
      return container.innerHTML = buildVideoElement(vkrUrl, ext2);
    }

    // Final Fallback
    container.innerHTML = buildFallbackIframe(url);
  }
