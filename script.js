 function getExtension(url) {
    try {
      return new URL(url).pathname.split('.').pop().toLowerCase();
    } catch {
      return "";
    }
  }

  function isDirectMedia(url) {
    return /\.(mp4|webm|m3u8|mp3|ogg|wav|mov|avi|flv|mkv|mpd)(\?|$)/i.test(url);
  }

  function isYouTube(url) {
    return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i.test(url);
  }

  function getYouTubeId(url) {
    try {
      const u = new URL(url);
      if (u.hostname === 'youtu.be') return u.pathname.slice(1);
      return u.searchParams.get('v');
    } catch {
      return null;
    }
  }

  function extractTeraboxId(url) {
    try {
      const match = url.match(/\/s\/([^\/?#]+)/);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  }

  function buildYouTubeEmbed(id) {
    return `<iframe class="iframeVK" src="https://www.youtube.com/embed/${id}" frameborder="0" allowfullscreen></iframe>`;
  }

  function buildTeraboxEmbed(id) {
    return `<iframe class="iframeVK" src="https://www.terabox.com/sharing/embed?surl=${id}" frameborder="0" allowfullscreen></iframe>`;
  }

  function buildVideoElement(url, ext) {
    return `<video class="videoVK" src="${url}" controls autoplay></video>`;
  }

  function buildAudioElement(url, ext) {
    return `<audio class="audioVK" src="${url}" controls autoplay></audio>`;
  }

  function buildHlsPlayer(url) {
    return `
      <video id="hls-video" class="videoVK" controls autoplay></video>
      <script>
        if (Hls.isSupported()) {
          const hls = new Hls();
          hls.loadSource("${url}");
          hls.attachMedia(document.getElementById('hls-video'));
        } else if (document.getElementById('hls-video').canPlayType('application/vnd.apple.mpegurl')) {
          document.getElementById('hls-video').src = "${url}";
        }
      </script>`;
  }

  function buildDashPlayer(url) {
    return `
      <video id="dash-video" class="videoVK" controls autoplay></video>
      <script>
        const player = dashjs.MediaPlayer().create();
        player.initialize(document.getElementById('dash-video'), "${url}", true);
      </script>`;
  }

  function showError(message, container) {
    container.innerHTML = `<p class="error-messageVK">${message}</p>`;
  }

  async function isUrlReachable(url) {
    try {
      const res = await fetch(url, { method: 'HEAD' });
      return res.ok;
    } catch {
      return false;
    }
  }

  async function tryVkrDownloader(url) {
    try {
      const response = await fetch(`https://vkrdownloader.xyz/server?api_key=vkrdownloader&vkr=${encodeURIComponent(url)}`);
      const result = await response.json();
      if (result?.data?.downloads?.length > 0) {
        const best = result.data.downloads.find(d => d.url.includes("mp4")) || result.data.downloads[0];
        if (best?.url) return best.url;
      }
    } catch (e) {
      console.warn("VKR Downloader failed:", e);
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

    const ext = getExtension(url);

    // ✅ YouTube Embed
    if (isYouTube(url)) {
      const ytID = getYouTubeId(url);
      if (ytID) {
        container.innerHTML = buildYouTubeEmbed(ytID);
      } else {
        showError("⚠️ Invalid YouTube link.", container);
      }
      return;
    }

    // ✅ Terabox Embed
    const teraboxID = extractTeraboxId(url);
    if (teraboxID) {
      container.innerHTML = buildTeraboxEmbed(teraboxID);
      return;
    }

    // ✅ Direct Media
    if (isDirectMedia(url)) {
      const reachable = await isUrlReachable(url);
      if (!reachable) {
        showError("❌ Media URL is not reachable or expired.", container);
        return;
      }

      if (ext === 'm3u8') return container.innerHTML = buildHlsPlayer(url);
      if (ext === 'mpd') return container.innerHTML = buildDashPlayer(url);
      if (['mp4', 'webm', 'mov', 'avi'].includes(ext)) return container.innerHTML = buildVideoElement(url, ext);
      if (['mp3', 'ogg', 'wav'].includes(ext)) return container.innerHTML = buildAudioElement(url, ext);
      return container.innerHTML = buildVideoElement(url, ext);
    }

    // ✅ Try VKR Downloader
    const vkrUrl = await tryVkrDownloader(url);
    if (vkrUrl && isDirectMedia(vkrUrl)) {
      const ext2 = getExtension(vkrUrl);
      return container.innerHTML = buildVideoElement(vkrUrl, ext2);
    }

    // ✅ Fallback iframe
    const iframeId = "vkr-fallback-frame";
    const statusId = "iframe-status";
    container.innerHTML = `
      <iframe id="${iframeId}" class="iframeVK" src="https://vkrcors.vercel.app/proxy?proxyurl=${encodeURIComponent(url)}" frameborder="0" allowfullscreen></iframe>
      <p class="loading-messageVK" id="${statusId}">⏳ Trying fallback iframe...</p>`;

    const iframe = document.getElementById(iframeId);
    const status = document.getElementById(statusId);
    let iframeLoaded = false;

    iframe.onload = () => {
      iframeLoaded = true;
      if (status) status.remove();
    };

    setTimeout(() => {
      if (!iframeLoaded) {
        showError("❌ Unable to load the video. The source might be protected or blocked.", container);
      }
    }, 8000);
  }
