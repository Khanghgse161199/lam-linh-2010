/**
 * ============================================================================
 * UPBEAT TIKTOK PIANO ENGINE — "NƠI NÀY CÓ ANH" (BLUE & WHITE EDITION)
 * ============================================================================
 * Defaults to the bright, cheerful Upbeat Pop-Piano track (/data/noi-nay-co-anh-upbeat.mp3)
 * and includes 1-click switching to TikTok Speed-Up (/data/noi-nay-co-anh-speedup.mp3)
 * and Gentle Piano (/data/noi-nay-co-anh-tiktok.mp3).
 */

class NoiNayCoAnhPianoEngine {
  constructor() {
    this.audio = new Audio();
    this.audio.loop = true;
    this.audio.preload = 'auto';
    this.audio.src = 'data/noi-nay-co-anh-upbeat.mp3';

    this.ctx = null;
    this.analyser = null;
    this.sourceNode = null;
    this.freqData = null;

    this.isPlaying = false;
    this.currentTrackKey = 'upbeat'; // 'upbeat' | 'speedup' | 'gentle' | 'custom'

    // Synced lyrics for Nơi Này Có Anh
    this.lyrics = [
      { t: 0, text: '♪ Giai điệu Piano mở đầu — Nơi Này Có Anh' },
      { t: 8, text: 'Em là ai từ đâu bước đến nơi đây dịu dàng chân phương' },
      { t: 16, text: 'Em là ai tựa như ánh nắng ban mai ngọt ngào trong sương' },
      { t: 24, text: 'Ngắm em thật lâu, con tim anh yếu mềm' },
      { t: 31, text: 'Đắm say từ phút đó, từng giây trôi yêu thêm' },
      { t: 38, text: 'Bao ngày qua bình minh đánh thức xua tan bộn bề nơi anh' },
      { t: 46, text: 'Bao ngày qua niềm thương nỗi nhớ bay theo bầu trời trong xanh' },
      { t: 54, text: 'Liếc đôi hàng mi, mong manh anh thẫn thờ' },
      { t: 60, text: 'Muốn hôn nhẹ mái tóc, bờ môi em, anh mơ' },
      { t: 67, text: 'Cầm tay anh, dựa vai anh, kề bên anh nơi này có anh' },
      { t: 75, text: 'Gió mang câu tình ca, ngàn ánh sao vụt qua nhẹ ôm lấy em' },
      { t: 83, text: 'Cầm tay anh, dựa vai anh, kề bên anh nơi này có anh' },
      { t: 91, text: 'Khép đôi mi thật lâu, nguyện mãi bên cạnh nhau, yêu say đắm như ngày đầu' },
      { t: 100, text: 'Mùa xuân đến bình yên cho anh những giấc mơ' },
      { t: 108, text: 'Hạ lưu giữ ngày mưa ngọt ngào nên thơ' },
      { t: 115, text: 'Mùa thu lá vàng rơi đông sang anh nhớ em' },
      { t: 122, text: 'Tình yêu bé nhỏ xin dành tặng riêng em — Lam Linh' }
    ];

    this.visCanvas = document.getElementById('piano-visualizer-canvas');
    this.visCtx = this.visCanvas ? this.visCanvas.getContext('2d') : null;

    this.bindAudioEvents();
    this.startVisualizerLoop();
  }

  ensureWebAudio() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 128;
      this.analyser.smoothingTimeConstant = 0.8;
      this.freqData = new Uint8Array(this.analyser.frequencyBinCount);

      this.sourceNode = this.ctx.createMediaElementSource(this.audio);
      this.sourceNode.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    } catch (e) {}
  }

  bindAudioEvents() {
    this.audio.addEventListener('timeupdate', () => {
      this.updateProgressAndLyrics();
    });

    this.audio.addEventListener('loadedmetadata', () => {
      const totalEl = document.getElementById('time-total');
      if (totalEl && this.audio.duration) {
        totalEl.textContent = this.formatTime(this.audio.duration);
      }
    });

    this.audio.addEventListener('play', () => {
      this.isPlaying = true;
      this.updateUI();
    });

    this.audio.addEventListener('pause', () => {
      this.isPlaying = false;
      this.updateUI();
    });
  }

  formatTime(sec) {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  updateProgressAndLyrics() {
    const cur = this.audio.currentTime || 0;
    const dur = this.audio.duration || 131;
    const pct = Math.min(100, (cur / dur) * 100);

    const fill = document.getElementById('song-progress-fill');
    const curTimeEl = document.getElementById('time-current');
    if (fill) fill.style.width = `${pct}%`;
    if (curTimeEl) curTimeEl.textContent = this.formatTime(cur);

    const cycleTime = cur % 130;
    let activeIdx = 0;
    for (let i = 0; i < this.lyrics.length; i++) {
      if (cycleTime >= this.lyrics[i].t) {
        activeIdx = i;
      }
    }

    const prevLine = this.lyrics[(activeIdx - 1 + this.lyrics.length) % this.lyrics.length]?.text || '';
    const currLine = this.lyrics[activeIdx]?.text || '';
    const nextLine = this.lyrics[(activeIdx + 1) % this.lyrics.length]?.text || '';

    const prevEl = document.getElementById('lyric-prev');
    const currEl = document.getElementById('lyric-current');
    const nextEl = document.getElementById('lyric-next');

    if (currEl && currEl.textContent !== currLine) {
      if (prevEl) prevEl.textContent = prevLine;
      currEl.textContent = currLine;
      if (nextEl) nextEl.textContent = nextLine;
    }
  }

  play() {
    this.ensureWebAudio();
    this.audio.play().catch(() => {});
  }

  pause() {
    this.audio.pause();
  }

  togglePlay() {
    if (this.audio.paused) {
      this.play();
    } else {
      this.pause();
    }
  }

  restart() {
    this.audio.currentTime = 0;
    this.play();
  }

  seekToRatio(ratio) {
    if (this.audio.duration) {
      this.audio.currentTime = Math.max(0, Math.min(1, ratio)) * this.audio.duration;
    }
  }

  switchPresetTrack(key) {
    this.currentTrackKey = key;
    const badge = document.getElementById('audio-source-badge');
    const navLabel = document.getElementById('nav-music-label');

    if (key === 'speedup') {
      this.audio.src = 'data/noi-nay-co-anh-speedup.mp3';
      if (badge) badge.textContent = 'TIKTOK SPEED-UP VERSION';
      if (navLabel) navLabel.textContent = 'Speed-Up';
    } else if (key === 'gentle') {
      this.audio.src = 'data/noi-nay-co-anh-tiktok.mp3';
      if (badge) badge.textContent = 'GENTLE PIANO VERSION';
      if (navLabel) navLabel.textContent = 'Piano Dịu Dàng';
    } else {
      this.audio.src = 'data/noi-nay-co-anh-upbeat.mp3';
      if (badge) badge.textContent = 'UPBEAT PIANO • TIKTOK VER';
      if (navLabel) navLabel.textContent = 'Piano Vui Tươi';
    }

    this.play();
  }

  loadCustomAudioBlob(blobOrUrl, fileName = 'Custom MP3') {
    this.currentTrackKey = 'custom';
    const url = typeof blobOrUrl === 'string' ? blobOrUrl : URL.createObjectURL(blobOrUrl);
    this.audio.src = url;

    const badge = document.getElementById('audio-source-badge');
    if (badge) badge.textContent = fileName.toUpperCase();
  }

  updateUI() {
    const playIcon = document.getElementById('play-icon');
    const navBars = document.getElementById('nav-music-bars');
    if (playIcon) playIcon.textContent = this.isPlaying ? '⏸' : '▶';
    if (navBars) navBars.classList.toggle('playing', this.isPlaying);
  }

  startVisualizerLoop() {
    if (!this.visCanvas || !this.visCtx) return;

    const render = () => {
      const w = this.visCanvas.width;
      const h = this.visCanvas.height;
      this.visCtx.clearRect(0, 0, w, h);

      const bars = 46;
      const barWidth = 4.5;
      const totalSpace = w / bars;

      if (this.analyser && this.isPlaying && this.freqData) {
        this.analyser.getByteFrequencyData(this.freqData);
      }

      const t = performance.now() * 0.005;

      for (let i = 0; i < bars; i++) {
        let norm = 0.1;
        if (this.isPlaying) {
          if (this.freqData && this.freqData[i] > 0) {
            norm = Math.max(0.1, (this.freqData[i] / 255) * 0.95);
          } else {
            norm = 0.2 + 0.6 * Math.abs(Math.sin(t + i * 0.32) * Math.cos(t * 0.85 - i * 0.18));
          }
        }

        const barH = Math.max(4, norm * (h - 6));
        const x = i * totalSpace + (totalSpace - barWidth) / 2;
        const y = (h - barH) / 2;

        this.visCtx.fillStyle = this.isPlaying
          ? 'rgba(147, 197, 253, 0.92)'
          : 'rgba(255, 255, 255, 0.22)';
        this.visCtx.beginPath();
        this.visCtx.roundRect(x, y, barWidth, barH, 2.5);
        this.visCtx.fill();
      }

      requestAnimationFrame(render);
    };

    requestAnimationFrame(render);
  }
}

window.NoiNayCoAnhPianoEngine = NoiNayCoAnhPianoEngine;
