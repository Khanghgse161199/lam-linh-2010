/**
 * ============================================================================
 * MAIN APPLICATION — TRẦN LAM LINH 💙 20.10 (BLUE & WHITE FUN EDITION)
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  const pianoEngine = new window.NoiNayCoAnhPianoEngine();

  // ==========================================================================
  // 1. SERVER SYNC & INDEXED-DB STORAGE
  // ==========================================================================
  const DB_NAME = 'TranLamLinh2010BlueWhiteDB';
  const DB_VERSION = 1;
  let dbInstance = null;

  function openMediaDB() {
    return new Promise((resolve, reject) => {
      if (dbInstance) return resolve(dbInstance);
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('media')) {
          db.createObjectStore('media');
        }
      };
      req.onsuccess = (e) => {
        dbInstance = e.target.result;
        resolve(dbInstance);
      };
      req.onerror = (err) => reject(err);
    });
  }

  async function saveMediaItem(key, value) {
    try {
      const db = await openMediaDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('media', 'readwrite');
        tx.objectStore('media').put(value, key);
        tx.oncomplete = () => resolve();
        tx.onerror = (e) => reject(e);
      });
    } catch (e) {}
  }

  async function getMediaItem(key) {
    try {
      const db = await openMediaDB();
      return new Promise((resolve) => {
        const tx = db.transaction('media', 'readonly');
        const req = tx.objectStore('media').get(key);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      });
    } catch (e) {
      return null;
    }
  }

  async function syncToServer(payload) {
    if (location.protocol === 'file:') return;
    try {
      await fetch('/api/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (e) {}
  }

  // ==========================================================================
  // 2. TOAST NOTIFICATION
  // ==========================================================================
  let toastTimeout = null;
  function showToast(message) {
    const toast = document.getElementById('toast-notification');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.remove('hidden');
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.add('hidden');
    }, 3200);
  }

  // ==========================================================================
  // 3. BLUE & WHITE CONFETTI + FLOATING PETALS ENGINE
  // ==========================================================================
  const canvas = document.getElementById('ambient-canvas');
  const ctx = canvas.getContext('2d');
  let cw = (canvas.width = window.innerWidth);
  let ch = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    cw = canvas.width = window.innerWidth;
    ch = canvas.height = window.innerHeight;
  });

  const confettiList = [];

  function launchBlueWhiteConfetti(originX = cw / 2, originY = ch / 2, count = 48) {
    const colors = ['#23589a', '#3b82f6', '#93c5fd', '#ffffff', '#dbeafe', '#1d4ed8'];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = 3 + Math.random() * 8;
      confettiList.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3.2,
        gravity: 0.16,
        w: 7 + Math.random() * 6,
        h: 5 + Math.random() * 5,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1
      });
    }
  }

  function animateCanvas() {
    ctx.clearRect(0, 0, cw, ch);

    for (let i = confettiList.length - 1; i >= 0; i--) {
      const c = confettiList[i];
      c.x += c.vx;
      c.y += c.vy;
      c.vy += c.gravity;
      c.rot += c.rotSpeed;
      c.alpha -= 0.012;

      if (c.alpha <= 0 || c.y > ch + 40) {
        confettiList.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = Math.max(0, c.alpha);
      ctx.translate(c.x, c.y);
      ctx.rotate(c.rot);
      ctx.fillStyle = c.color;
      ctx.beginPath();
      ctx.roundRect(-c.w / 2, -c.h / 2, c.w, c.h, 2);
      ctx.fill();
      ctx.restore();
    }

    requestAnimationFrame(animateCanvas);
  }
  animateCanvas();

  // ==========================================================================
  // 4. INTRO CARD UNLOCK
  // ==========================================================================
  const introOverlay = document.getElementById('intro-overlay');
  const btnOpenExperience = document.getElementById('btn-open-experience');
  let isOpened = false;

  function enterExperience() {
    if (isOpened) return;
    isOpened = true;
    pianoEngine.play();
    introOverlay?.classList.add('dismissed');
    launchBlueWhiteConfetti(window.innerWidth / 2, window.innerHeight * 0.35, 50);
    showToast('Chúc mừng ngày 20/10, Lam Linh!');
  }

  btnOpenExperience?.addEventListener('click', enterExperience);

  // ==========================================================================
  // 5. PLAYER CONTROLS & 3 UPBEAT TRACK SWITCHERS
  // ==========================================================================
  const btnPlayPause = document.getElementById('btn-play-pause');
  const btnRestartSong = document.getElementById('btn-restart-song');
  const btnToggleNavMusic = document.getElementById('btn-toggle-music-Quick');
  const btnTrackUpbeat = document.getElementById('btn-track-upbeat');
  const btnTrackSpeedup = document.getElementById('btn-track-speedup');
  const btnTrackGentle = document.getElementById('btn-track-gentle');
  const labelUploadMp3 = document.getElementById('label-upload-mp3');
  const mp3FileInput = document.getElementById('mp3-file-input');
  const progressBg = document.getElementById('song-progress-bg');

  btnPlayPause?.addEventListener('click', () => pianoEngine.togglePlay());
  btnRestartSong?.addEventListener('click', () => pianoEngine.restart());
  btnToggleNavMusic?.addEventListener('click', () => pianoEngine.togglePlay());

  function setActiveModePill(activeEl) {
    [btnTrackUpbeat, btnTrackSpeedup, btnTrackGentle, labelUploadMp3].forEach((el) => {
      el?.classList.toggle('active', el === activeEl);
    });
  }

  btnTrackUpbeat?.addEventListener('click', () => {
    setActiveModePill(btnTrackUpbeat);
    pianoEngine.switchPresetTrack('upbeat');
    showToast('🎹 Đang phát: Nơi Này Có Anh (Piano Vui Tươi)');
  });

  btnTrackSpeedup?.addEventListener('click', () => {
    setActiveModePill(btnTrackSpeedup);
    pianoEngine.switchPresetTrack('speedup');
    showToast('⚡ Đang phát: Nơi Này Có Anh (TikTok Speed-Up)');
  });

  btnTrackGentle?.addEventListener('click', () => {
    setActiveModePill(btnTrackGentle);
    pianoEngine.switchPresetTrack('gentle');
    showToast('💙 Đang phát: Nơi Này Có Anh (Piano Dịu Dàng)');
  });

  mp3FileInput?.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setActiveModePill(labelUploadMp3);
    await saveMediaItem('custom-mp3', { blob: file, name: file.name });
    pianoEngine.loadCustomAudioBlob(file, file.name);
    pianoEngine.play();
    showToast(`Đã tải nhạc: ${file.name}`);

    const reader = new FileReader();
    reader.onload = (ev) => {
      syncToServer({ customMp3DataUrl: ev.target.result, customMp3Name: file.name });
    };
    reader.readAsDataURL(file);
  });

  progressBg?.addEventListener('click', (e) => {
    const rect = progressBg.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    pianoEngine.seekToRatio(ratio);
  });

  // ==========================================================================
  // 6. PLAYFUL CONTRACT MINI-GAME (RUNAWAY BUTTON!)
  // ==========================================================================
  const btnAcceptLove = document.getElementById('btn-accept-love');
  const btnRunaway = document.getElementById('btn-runaway');
  const contractResult = document.getElementById('contract-result');

  const funnyPrompts = [
    'Ơ kìa bấm nhầm nút rồi!',
    'Nút bên trái cơ mà',
    'Đã vào đây rồi không từ chối được đâu!',
    'Không cần suy nghĩ đâu, bấm Đồng ý đi!',
    'Nút này không bấm được đâu'
  ];
  let dodgeCount = 0;
  let lastRx = 0;
  let lastRy = 0;
  let lastDodgeTime = 0;

  function dodgeButton(e) {
    if (!btnRunaway) return;
    const now = performance.now();
    // Prevent double-firing when touchstart + click/pointerenter fire together on mobile
    if (now - lastDodgeTime < 180) return;
    lastDodgeTime = now;

    // Update label first so we measure its actual width on mobile
    btnRunaway.textContent = funnyPrompts[dodgeCount % funnyPrompts.length];
    dodgeCount++;

    const card = btnRunaway.closest('.contract-card');
    const cardWidth = card ? card.clientWidth : window.innerWidth;
    const btnWidth = btnRunaway.offsetWidth || 180;

    // Safe horizontal & vertical bounds so button never clips outside card on mobile
    const safeMaxX = Math.max(45, Math.min(130, (cardWidth - btnWidth) / 2 - 16));
    const safeMaxY = window.innerWidth < 600 ? 68 : 55;

    // Pick a new offset guaranteed to jump away from the current finger/cursor position
    let rx = 0;
    let ry = 0;
    for (let attempt = 0; attempt < 10; attempt++) {
      rx = (Math.random() * 2 - 1) * safeMaxX;
      ry = (Math.random() * 2 - 1) * safeMaxY;
      if (Math.hypot(rx - lastRx, ry - lastRy) > 55) break;
    }
    lastRx = rx;
    lastRy = ry;

    btnRunaway.style.transform = `translate(${Math.round(rx)}px, ${Math.round(ry)}px)`;

    // Subtle grow on the Accept button each time she tries to refuse
    if (btnAcceptLove) {
      const scale = Math.min(1.18, 1 + dodgeCount * 0.03);
      btnAcceptLove.style.transform = `scale(${scale})`;
    }
  }

  // Desktop mouse hover
  btnRunaway?.addEventListener('pointerenter', (e) => {
    if (e.pointerType === 'mouse') dodgeButton(e);
  });

  // Mobile touchstart — dodges the instant her finger touches the button
  btnRunaway?.addEventListener(
    'touchstart',
    (e) => {
      e.preventDefault();
      dodgeButton(e);
    },
    { passive: false }
  );

  // Fallback click
  btnRunaway?.addEventListener('click', (e) => {
    e.preventDefault();
    dodgeButton(e);
  });

  btnAcceptLove?.addEventListener('click', () => {
    contractResult?.classList.remove('hidden');
    if (btnRunaway) btnRunaway.classList.add('hidden');
    btnAcceptLove.style.transform = 'scale(1)';
    btnAcceptLove.textContent = 'Đã đồng ý!';
    const rect = btnAcceptLove.getBoundingClientRect();
    launchBlueWhiteConfetti(rect.left + rect.width / 2, rect.top, 60);
    showToast('Đã lưu câu trả lời của Lam Linh!');
  });

  // ==========================================================================
  // 7. OFFICIAL 20.10 ANNIVERSARY COUNTER
  // ==========================================================================
  const STORAGE_DATE_KEY = 'tran_lam_linh_official_2010_date';
  let loveStartDate = localStorage.getItem(STORAGE_DATE_KEY) || '2026-10-20';

  const startDateInput = document.getElementById('love-start-date-input');
  const startDateLabel = document.getElementById('start-date-label');
  const btnChangeStartDate = document.getElementById('btn-change-start-date');

  function formatVNDate(isoStr) {
    const parts = isoStr.split('-');
    if (parts.length !== 3) return isoStr;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  function updateLoveCounter() {
    if (startDateLabel) startDateLabel.textContent = formatVNDate(loveStartDate);
    const start = new Date(`${loveStartDate}T00:00:00`);
    const now = new Date();
    const diffMs = Math.max(0, now - start);

    const totalSeconds = Math.floor(diffMs / 1000);
    const days = Math.max(1, Math.floor(totalSeconds / 86400));
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const elDays = document.getElementById('count-days');
    const elHours = document.getElementById('count-hours');
    const elMinutes = document.getElementById('count-minutes');
    const elSeconds = document.getElementById('count-seconds');

    if (elDays) elDays.textContent = String(days).padStart(2, '0');
    if (elHours) elHours.textContent = String(hours).padStart(2, '0');
    if (elMinutes) elMinutes.textContent = String(minutes).padStart(2, '0');
    if (elSeconds) elSeconds.textContent = String(seconds).padStart(2, '0');
  }

  updateLoveCounter();
  setInterval(updateLoveCounter, 1000);

  btnChangeStartDate?.addEventListener('click', () => {
    if (startDateInput.showPicker) {
      startDateInput.showPicker();
    } else {
      startDateInput.classList.toggle('hidden');
      startDateInput.focus();
    }
  });

  startDateInput?.addEventListener('change', (e) => {
    if (e.target.value) {
      loveStartDate = e.target.value;
      localStorage.setItem(STORAGE_DATE_KEY, loveStartDate);
      syncToServer({ startDate: loveStartDate });
      updateLoveCounter();
      showToast(`Đã cập nhật ngày chính thức: ${formatVNDate(loveStartDate)}`);
    }
  });

  // ==========================================================================
  // 8. PHOTO UPLOAD & SERVER SYNC
  // ==========================================================================
  const photoUploadInput = document.getElementById('photo-upload-input');
  let activePhotoSlot = null;
  const photoSlots = ['hero', 'gallery-1', 'gallery-2', 'gallery-3'];

  function renderPhotoInSlot(slot, dataUrl) {
    const imgEl = document.getElementById(`img-slot-${slot}`);
    const placeholderEl = document.getElementById(`placeholder-${slot}`);
    if (imgEl) {
      imgEl.src = dataUrl;
      imgEl.classList.remove('hidden');
    }
    if (placeholderEl) {
      placeholderEl.classList.add('hidden');
    }
  }

  (async () => {
    for (const slot of photoSlots) {
      const dataUrl = await getMediaItem(`photo-${slot}`);
      if (dataUrl) renderPhotoInSlot(slot, dataUrl);
    }
  })();

  document.querySelectorAll('[data-upload-trigger]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      activePhotoSlot = btn.getAttribute('data-upload-trigger');
      photoUploadInput?.click();
    });
  });

  photoUploadInput?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file || !activePhotoSlot) return;

    const targetSlot = activePhotoSlot;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target.result;
      renderPhotoInSlot(targetSlot, dataUrl);
      await saveMediaItem(`photo-${targetSlot}`, dataUrl);
      syncToServer({ photos: { [targetSlot]: dataUrl } });
      showToast('💙 Đã lưu và đồng bộ ảnh mới!');
    };
    reader.readAsDataURL(file);
    photoUploadInput.value = '';
  });

  // ==========================================================================
  // 9. HEART COUNTER & INLINE EDIT MODE
  // ==========================================================================
  const btnHeartStamp = document.getElementById('btn-heart-stamp');
  const heartBurstCountEl = document.getElementById('heart-burst-count');
  let heartCount = parseInt(localStorage.getItem('linh_heart_count') || '2010', 10);

  if (heartBurstCountEl) {
    heartBurstCountEl.textContent = heartCount.toLocaleString('vi-VN');
  }

  btnHeartStamp?.addEventListener('click', () => {
    heartCount += 10;
    localStorage.setItem('linh_heart_count', String(heartCount));
    if (heartBurstCountEl) {
      heartBurstCountEl.textContent = heartCount.toLocaleString('vi-VN');
    }
    const rect = btnHeartStamp.getBoundingClientRect();
    launchBlueWhiteConfetti(rect.left + rect.width / 2, rect.top, 35);
    syncToServer({ heartCount });
  });

  const btnCustomize = document.getElementById('btn-customize-mode');
  const editBanner = document.getElementById('edit-mode-banner');
  const btnExitEdit = document.getElementById('btn-exit-edit');
  const btnResetDefaults = document.getElementById('btn-reset-defaults');
  const editableElements = document.querySelectorAll('[data-editable]');

  editableElements.forEach((el) => {
    const fieldName = el.getAttribute('data-editable');
    const key = `linh_clean_text_${fieldName}`;
    const saved = localStorage.getItem(key);
    if (saved !== null) el.innerHTML = saved;

    el.addEventListener('input', () => {
      localStorage.setItem(key, el.innerHTML);
      syncToServer({ texts: { [fieldName]: el.innerHTML } });
    });
  });

  if (location.protocol !== 'file:') {
    fetch('/api/state')
      .then((r) => (r.ok ? r.json() : null))
      .then((state) => {
        if (!state) return;
        if (state.startDate) {
          loveStartDate = state.startDate;
          updateLoveCounter();
        }
        if (typeof state.heartCount === 'number' && heartBurstCountEl) {
          heartCount = state.heartCount;
          heartBurstCountEl.textContent = heartCount.toLocaleString('vi-VN');
        }
        if (state.texts) {
          Object.entries(state.texts).forEach(([field, html]) => {
            const el = document.querySelector(`[data-editable="${field}"]`);
            if (el) el.innerHTML = html;
          });
        }
        if (state.photos) {
          Object.entries(state.photos).forEach(([slot, dataUrl]) => {
            if (dataUrl) renderPhotoInSlot(slot, dataUrl);
          });
          if (!state.photos['hero'] && state.photos['gallery-1']) {
            renderPhotoInSlot('hero', state.photos['gallery-1']);
          }
        }
        if (state.customMp3Url) {
          setActiveModePill(labelUploadMp3);
          pianoEngine.loadCustomAudioBlob(state.customMp3Url, state.customMp3Name || 'Custom MP3');
        }
      })
      .catch(() => {});
  }

  function setEditMode(enabled) {
    document.body.classList.toggle('edit-mode', enabled);
    btnCustomize?.classList.toggle('active', enabled);
    editBanner?.classList.toggle('hidden', !enabled);
    editableElements.forEach((el) => {
      el.setAttribute('contenteditable', enabled ? 'true' : 'false');
    });
    showToast(enabled ? 'Đang bật chế độ sửa nhanh' : 'Đã lưu thay đổi');
  }

  btnCustomize?.addEventListener('click', () => {
    setEditMode(!document.body.classList.contains('edit-mode'));
  });

  btnExitEdit?.addEventListener('click', () => setEditMode(false));

  btnResetDefaults?.addEventListener('click', async () => {
    editableElements.forEach((el) => {
      localStorage.removeItem(`linh_clean_text_${el.getAttribute('data-editable')}`);
    });
    localStorage.removeItem(STORAGE_DATE_KEY);
    await syncToServer({ reset: true });
    location.reload();
  });

  // ==========================================================================
  // 10. SCROLL REVEAL & NAV SPY
  // ==========================================================================
  const revealItems = document.querySelectorAll('.reveal-up');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    revealItems.forEach((el) => revealObserver.observe(el));

    const sections = document.querySelectorAll('main section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    const spyObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navLinks.forEach((link) => {
              link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
            });
          }
        });
      },
      { threshold: 0.35 }
    );
    sections.forEach((sec) => spyObserver.observe(sec));
  } else {
    revealItems.forEach((el) => el.classList.add('revealed'));
  }
});
