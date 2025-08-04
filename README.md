# 🎬 VKr Video Player

A futuristic, responsive, and progressive  video player that intelligently detects and plays videos from various sources including:

✅ Direct media URLs (.mp4, .webm, .m3u8, .mp3, .mov, etc.)

✅ YouTube, TeraBox (custom handling if implemented)

✅ Instagram, Facebook, and others via:

VKRDownloader API

Smart iframe fallback


❌ Shows error if loading fails


Built with:

HTML + CSS + JavaScript

HLS.js + Dash.js support

Tailored for both desktop and mobile devices



---

## 🚀 Features

🔗 Paste any video URL and play instantly

📺 Supports HLS/DASH streaming formats

🤖 Smart detection of media type

🌐 Fallback to iframe embedding if direct link or API fails

❗ Displays error if all methods fail

💡 Minimal, elegant UI with dark mode styling

📱 Fully mobile responsive

📦 PWA-ready (installable app on Android/desktop)

🔌 Offline-capable service worker (basic fetch passthrough)



---

📁 Project Structure

📦 Smart Video Player

├── index.html          
├── script.js           
├── style.css          
├── sw.js              
├── manifest.webmanifest 

└── icon.png           


---

## 🔧 How it Works

1. User enters a URL.


2. If it's a direct media link (e.g., .mp4, .m3u8), plays it using <video>, HLS.js or dash.js.


3. If YouTube or TeraBox, uses known embed/playback strategies.


4. If unsupported:

Calls VKRDownloader API.

If API fails, attempts iframe embedding

If iframe fails to load within 10 seconds, displays an error message.





---

📲 How to Use

1. Open index.html in a browser or deploy it on GitHub Pages / Vercel.


2. Paste any valid video URL and click "Load Video".


3. Watch the magic happen ✨




---

🧠 Technologies Used

HTML5, CSS3, JavaScript

HLS.js

Dash.js

VKRDownloader API (custom)

Service Workers

PWA Manifest



---

⚙️ PWA Setup

Add manifest.webmanifest in the root.

Register sw.js in your index.html.

App becomes installable on Android or desktop Chrome.


<link rel="manifest" href="manifest.webmanifest">
<script>
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
  }
</script>


---

🚧 Future Improvements

✅ Add support for more fallback APIs (SnapSave, Y2Mate, SaveFrom)

✅ Smart scoring/ranking of video qualities

❌ Offline caching of recent videos

⬆️ Expand video format support (e.g., .avi, .flv)



---

📜 License

MIT License — free to use, modify, and distribute.


---

👨‍💻 Author

Made with ❤️ by TheOfficialVKR
