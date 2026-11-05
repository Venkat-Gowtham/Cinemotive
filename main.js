document.addEventListener('DOMContentLoaded', () => {

    // MOBILE NAVIGATION
    const menuButton = document.getElementById('menuToggle');
    const navigation = document.getElementById('navLinks');

    if (menuButton && navigation) {
        menuButton.addEventListener('click', () => {
            const isOpen = navigation.classList.toggle('nav-open');

            menuButton.setAttribute('aria-expanded', String(isOpen));
            menuButton.setAttribute(
                'aria-label',
                isOpen ? 'Close navigation' : 'Open navigation'
            );
        });

        navigation.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navigation.classList.remove('nav-open');
                menuButton.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // AUTOMATIC COPYRIGHT YEAR
    const year = document.getElementById('year');

    if (year) {
        year.textContent = new Date().getFullYear();
    }

    // WHATSAPP
    // Replace XXXXXXXXXX with your actual number.
    // Use country code 91, digits only.
    const WHATSAPP_NUMBER = '91XXXXXXXXXX';

    const whatsapp = document.getElementById('whatsappButton');
    const bookingWhatsApp = document.getElementById('bookingWhatsApp');

    const whatsappMessage =
        'Hi CINEMOTIVE! I would like to enquire about a cinematic reel. Please share the details.';

    const whatsappURL =
        `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;

    [whatsapp, bookingWhatsApp].forEach(button => {
        if (!button) return;

        button.href = whatsappURL;
        button.target = '_blank';
        button.rel = 'noopener noreferrer';

        button.addEventListener('click', event => {
            if (WHATSAPP_NUMBER.includes('X')) {
                event.preventDefault();

                alert(
                    'Please add your WhatsApp number in main.js first.'
                );
            }
        });
    });

    // INSTAGRAM
    // Replace this with your actual profile link.
    const INSTAGRAM_URL = 'https://www.instagram.com/';

    const instagram = document.getElementById('instagramButton');

    if (instagram) {
        instagram.href = INSTAGRAM_URL;
    }

    // SCROLL REVEAL ANIMATIONS
    const revealItems = document.querySelectorAll('.reveal');

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                } else {
                    entry.target.classList.remove('is-visible');
                }
            });
        }, {
            threshold: 0.12,
            rootMargin: '0px 0px -4% 0px'
        });

        revealItems.forEach(item => observer.observe(item));
    } else {
        revealItems.forEach(item => {
            item.classList.add('is-visible');
        });
    }

    // =====================================================================
    // REEL CAROUSEL
    // ---------------------------------------------------------------------
    // Why this is fast:
    //  * Real <video> elements (muted, inline) instead of 5 Instagram iframes.
    //    Only the CENTER video plays; neighbours just hold their first frame.
    //  * Sliding only changes `transform`/`opacity` (GPU), never layout.
    //  * Neighbour videos are warmed up in the background so the next reel
    //    starts instantly when you slide.
    //
    // HOW TO ADD YOUR REELS
    //  1. Export each reel as MP4 (H.264 + AAC, 720x1280, faststart):
    //       ffmpeg -i in.mp4 -vf scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280 \
    //         -c:v libx264 -profile:v main -crf 24 -preset slow -r 30 \
    //         -c:a aac -b:a 128k -movflags +faststart assets/reels/reel-01.mp4
    //  2. Make a poster (first frame):
    //       ffmpeg -i assets/reels/reel-01.mp4 -frames:v 1 -q:v 3 assets/reels/reel-01.jpg
    //  3. Point `src` / `poster` below at them. If a file is missing the card
    //     falls back to a light "tap to load" Instagram embed, so nothing breaks.
    // =====================================================================

    const INSTAGRAM_HANDLE = 'cinemotive';   // shown in the reel overlay

    // Embed mode only: put an invisible click-shield over the bottom strip of the
    // embed so Instagram's "Watch on Instagram" label can't redirect visitors.
    // (Side effect: Instagram's tiny mute/fullscreen buttons there can't be clicked.)
    const SHIELD_EMBED_BOTTOM = true;

    const reels = [
        {
            title: 'Hey Baby Reel',
            caption: 'Cinematic reel shot & edited on iPhone.',
            audio: 'Original audio',
            src: 'assets/reels/reel-01.mp4',
            poster: 'assets/reels/reel-01.jpg',
            instagram: 'https://www.instagram.com/reel/DezFdskP17T/'
        },
        {
            title: 'Creative Reel 02',
            caption: 'Every moment, a story.',
            audio: 'Original audio',
            src: 'assets/reels/reel-02.mp4',
            poster: 'assets/reels/reel-02.jpg',
            instagram: 'https://www.instagram.com/reel/DdJvPMbTP9h/'
        },
        {
            title: 'Creative Reel 03',
            caption: 'Wedding & engagement storytelling.',
            audio: 'Original audio',
            src: 'assets/reels/reel-03.mp4',
            poster: 'assets/reels/reel-03.jpg',
            instagram: 'https://www.instagram.com/reel/DdUIvBMscaA/'
        },
        {
            title: 'Creative Reel 04',
            caption: 'Birthday & event highlights.',
            audio: 'Original audio',
            src: 'assets/reels/reel-04.mp4',
            poster: 'assets/reels/reel-04.jpg',
            instagram: 'https://www.instagram.com/reel/DecSOMKTVgV/'
        },
        {
            title: 'Creative Reel 05',
            caption: 'New vehicle delivery reel.',
            audio: 'Original audio',
            src: 'assets/reels/reel-05.mp4',
            poster: 'assets/reels/reel-05.jpg',
            instagram: 'https://www.instagram.com/reel/DdQUjsoyXzz/'
        }
    ];

    const stage = document.getElementById('reelStage');
    const track = document.getElementById('reelTrack');
    const prevButton = document.getElementById('prevReel');
    const nextButton = document.getElementById('nextReel');
    const number = document.getElementById('reelNumber');
    const total = document.getElementById('reelTotal');
    const autoplayButton = document.getElementById('toggleReelAutoplay');

    if (!stage || !track || !prevButton || !nextButton || !reels.length) {
        return;
    }

    const COUNT = reels.length;
    const pad = n => String(n).padStart(2, '0');
    const esc = value => String(value).replace(/[&<>"']/g, ch => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
    ));

    if (total) total.textContent = pad(COUNT);

    const ICON = {
        heart: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.9" stroke-linejoin="round"><path d="M12 20.4s-7.6-4.6-9.3-9.5C1.6 7.7 3.5 4.4 6.9 4.4c2 0 3.6 1.2 5.1 3 1.5-1.8 3.1-3 5.1-3 3.4 0 5.3 3.300 4.200 6.500-1.700 4.900-9.300 9.500-9.300 9.500z"/></svg>',
        comment: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.9" stroke-linejoin="round"><path d="M20.7 12.2c0 4.600-3.900 8.300-8.700 8.300-1.200 0-2.400-.2-3.400-.7L3.500 21l1.300-4.300c-1.100-1.400-1.500-2.900-1.500-4.500C3.300 7.600 7.200 3.900 12 3.900s8.700 3.700 8.700 8.300z"/></svg>',
        share: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.9" stroke-linejoin="round" stroke-linecap="round"><path d="M21.500 3 2.800 9.600l7.600 3.400 3.200 8L21.500 3z"/><path d="m10.400 13 5.200-4.700"/></svg>',
        dots: '<svg viewBox="0 0 24 24" fill="#fff"><circle cx="12" cy="5" r="1.800"/><circle cx="12" cy="12" r="1.800"/><circle cx="12" cy="19" r="1.800"/></svg>',
        soundOff: '<svg class="i-off" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.500h3.500L12 5.500v13l-4.500-4H4z" fill="#fff"/><path d="m16 9.500 5 5m0-5-5 5"/></svg>',
        soundOn: '<svg class="i-on" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.500h3.500L12 5.500v13l-4.500-4H4z" fill="#fff"/><path d="M15.500 9a4.200 4.200 0 0 1 0 6M18.300 6.500a8 8 0 0 1 0 11"/></svg>',
        play: '<svg viewBox="0 0 24 24"><path d="M7 4.500v15l13-7.500z" fill="#fff"/></svg>',
        music: '<svg viewBox="0 0 24 24" fill="#fff"><path d="M9 18V6l11-2v12"/><circle cx="6.500" cy="18" r="3"/><circle cx="17.500" cy="16" r="3"/></svg>'
    };

    // ---- build the slides -------------------------------------------------
    const items = reels.map((reel, index) => {
        const el = document.createElement('article');
        el.className = 'cm-reel';
        el.setAttribute('role', 'group');
        el.setAttribute('aria-roledescription', 'slide');
        el.setAttribute('aria-label', `${reel.title} (${index + 1} of ${COUNT})`);

        const initials = INSTAGRAM_HANDLE.slice(0, 2).toUpperCase();

        el.innerHTML = `
            <div class="cm-reel-device">
                <span class="cm-reel-island"></span>
                <div class="cm-reel-screen">
                    <div class="cm-reel-facade"${reel.poster ? ` style="background-image:url('${esc(reel.poster)}')"` : ''}></div>
                    <video class="cm-reel-video" muted playsinline
                        preload="metadata" disablepictureinpicture
                        disableremoteplayback aria-label="${esc(reel.title)}"></video>

                    <button class="cm-reel-tap" type="button"
                        aria-label="${esc(reel.title)}: play or pause"></button>

                    <span class="cm-reel-shield" aria-hidden="true"></span>

                    <div class="cm-reel-ui" aria-hidden="false">
                        <div class="cm-reel-header">
                            <span>Reels</span>
                            <button class="cm-reel-sound" type="button" aria-label="Turn sound on">
                                ${ICON.soundOff}${ICON.soundOn}
                            </button>
                        </div>

                        <div class="cm-reel-rail" aria-hidden="true">
                            ${ICON.heart}${ICON.comment}${ICON.share}${ICON.dots}
                            <span class="cm-reel-audio-art"></span>
                        </div>

                        <div class="cm-reel-info">
                            <div class="cm-reel-author">
                                <span class="cm-reel-avatar">${esc(initials)}</span>
                                <span class="cm-reel-handle">${esc(INSTAGRAM_HANDLE)}</span>
                                <a class="cm-reel-follow" href="${esc(INSTAGRAM_URL)}"
                                    target="_blank" rel="noopener noreferrer">Follow</a>
                            </div>
                            <p class="cm-reel-caption">${esc(reel.caption || reel.title)}</p>
                            <div class="cm-reel-audio">${ICON.music}<span>${esc(reel.audio || 'Original audio')}</span></div>
                        </div>

                        <div class="cm-reel-progress"><i></i></div>
                    </div>

                    <span class="cm-reel-spinner"></span>
                    <span class="cm-reel-state">${ICON.play}</span>
                </div>
            </div>`;

        const item = {
            el,
            reel,
            index,
            video: el.querySelector('video'),
            screen: el.querySelector('.cm-reel-screen'),
            bar: el.querySelector('.cm-reel-progress i'),
            tap: el.querySelector('.cm-reel-tap'),
            sound: el.querySelector('.cm-reel-sound'),
            facade: el.querySelector('.cm-reel-facade'),
            mode: reel.src ? 'video' : 'embed',
            embed: null,
            pos: null,
            leaveTimer: 0
        };

        track.appendChild(el);
        return item;
    });

    // A reel without an MP4 runs in "embed mode": no fake Instagram overlay
    // (Instagram's own player is shown instead), just the phone + the cropped embed.
    function enterEmbedMode(item) {
        item.mode = 'embed';
        item.el.classList.add('is-embed');
        item.el.classList.remove('has-video', 'is-loading', 'is-paused');
        decorateFacade(item);
    }

    items.forEach(item => {
        if (SHIELD_EMBED_BOTTOM) item.el.classList.add('has-shield');
        if (item.mode === 'embed') enterEmbedMode(item);
    });

    // ---- state --------------------------------------------------------------
    let current = 0;
    let soundOn = false;
    let userPaused = false;
    let inView = true;
    let lastNav = 0;
    let rafId = 0;
    let autoAdvanceTimer = 0;
    let autoRotationPaused = false;
    let stageHovered = false;
    let stageFocused = false;

    // Local MP4 reels advance on their real `ended` event. Instagram embeds
    // are cross-origin, so their playback state is unavailable; this prevents
    // a fallback embed from holding the carousel indefinitely.
    const EMBED_ADVANCE_DELAY = 12000;
    const reducedMotion = window.matchMedia
        ? window.matchMedia('(prefers-reduced-motion: reduce)')
        : { matches: false };

    const activeItem = () => items[current];

    function slideDuration() {
        if (reducedMotion.matches) return 0;

        const value = getComputedStyle(stage).getPropertyValue('--glide').trim();
        const duration = Number.parseFloat(value);

        if (!Number.isFinite(duration)) return 620;
        return value.endsWith('ms') ? duration : duration * 1000;
    }

    function clearAutoAdvance() {
        window.clearTimeout(autoAdvanceTimer);
        autoAdvanceTimer = 0;
    }

    function canAutoAdvance() {
        return !autoRotationPaused && !userPaused && !stageHovered && !stageFocused &&
            !reducedMotion.matches && inView && !document.hidden;
    }

    function syncAutoplayControl() {
        if (!autoplayButton) return;

        autoplayButton.setAttribute('aria-pressed', String(autoRotationPaused));
        autoplayButton.setAttribute(
            'aria-label',
            autoRotationPaused ? 'Resume automatic reel rotation' : 'Pause automatic reel rotation'
        );
        stage.classList.toggle('is-rotation-paused', autoRotationPaused);
    }

    function scheduleAutoAdvance() {
        clearAutoAdvance();
        if (!canAutoAdvance() || COUNT < 2) return;

        const item = activeItem();

        // A local video controls its own transition through the `ended` event.
        if (item.mode === 'video') {
            if (item.video.ended) goTo(current + 1);
            return;
        }

        autoAdvanceTimer = window.setTimeout(() => {
            autoAdvanceTimer = 0;
            if (canAutoAdvance()) goTo(current + 1);
        }, EMBED_ADVANCE_DELAY);
    }

    // ---- positions (transform-only animation) ------------------------------
    function offsetOf(index) {
        let offset = ((index - current) % COUNT + COUNT) % COUNT;
        if (offset > COUNT / 2) offset -= COUNT;
        return offset;
    }

    function setPosition(item, offset, animate) {
        const next = Math.abs(offset) > 2 ? 'hidden' : String(offset);
        if (item.pos === next) return;

        const wrapped = item.pos !== null && item.pos !== 'hidden' && next !== 'hidden' &&
            Math.abs(Number(next) - Number(item.pos)) > 2;

        // A slide that wraps around the ends re-enters from behind the centre phone
        // instead of flying across the whole stage.
        if (!animate || wrapped) {
            item.el.style.transition = 'none';
            if (wrapped) item.el.dataset.pos = 'hidden';
            else item.el.dataset.pos = next;
            void item.el.offsetWidth;            // flush
            item.el.style.transition = '';
            if (wrapped) item.el.dataset.pos = next;
        } else {
            item.el.dataset.pos = next;
        }

        item.pos = next;
    }

    // ---- video helpers ------------------------------------------------------
    function attachSource(item) {
        if (item.mode !== 'video' || item.video.getAttribute('src')) return;

        const video = item.video;
        if (item.reel.poster) video.poster = item.reel.poster;

        video.addEventListener('loadeddata', () => item.el.classList.add('has-video'));

        video.addEventListener('playing', () => {
            item.el.classList.remove('is-loading', 'is-paused');
            if (item === activeItem()) startProgress();
        });

        video.addEventListener('pause', () => {
            if (item === activeItem()) item.el.classList.toggle('is-paused', !video.ended);
        });

        video.addEventListener('waiting', () => {
            if (item === activeItem() && !video.paused) item.el.classList.add('is-loading');
        });

        video.addEventListener('canplay', () => item.el.classList.remove('is-loading'));

        video.addEventListener('ended', () => {
            if (item === activeItem()) scheduleAutoAdvance();
        });

        // File missing / unsupported: degrade to the Instagram embed facade.
        video.addEventListener('error', () => {
            video.removeAttribute('src');
            video.load();
            enterEmbedMode(item);
            if (item === activeItem()) {
                window.setTimeout(() => loadEmbed(item), 0);
                scheduleAutoAdvance();
            }
        });

        video.src = `${item.reel.src}#t=0.001`;
        if (item === activeItem()) video.preload = 'auto';
    }

    function decorateFacade(item) {
        if (item.facade.dataset.ready) return;
        item.facade.dataset.ready = '1';
        item.facade.innerHTML =
            `<span class="cm-reel-facade-title">${esc(item.reel.title)}</span>` +
            `<small>Loading reel\u2026</small>`;
    }

    function startProgress() {
        cancelAnimationFrame(rafId);
        const item = activeItem();
        const video = item.video;

        const tick = () => {
            if (item !== activeItem() || video.paused) return;
            const ratio = video.duration ? video.currentTime / video.duration : 0;
            item.bar.style.transform = `scaleX(${ratio})`;
            rafId = requestAnimationFrame(tick);
        };

        rafId = requestAnimationFrame(tick);
    }

    function syncSound() {
        items.forEach(item => {
            item.el.classList.toggle('is-sound-on', soundOn);
            item.sound.setAttribute('aria-label', soundOn ? 'Turn sound off' : 'Turn sound on');
        });
    }

    function playActive() {
        const item = activeItem();
        if (item.mode !== 'video' || !inView || document.hidden || userPaused) return;

        const video = item.video;
        video.preload = 'auto';
        video.muted = !soundOn;

        if (video.ended) {
            try { video.currentTime = 0; } catch (e) { /* not ready */ }
            item.bar.style.transform = 'scaleX(0)';
        }

        const attempt = video.play();
        if (!attempt || !attempt.catch) return;

        attempt.catch(error => {
            // Browser blocked sound without a gesture → retry muted.
            if (error && error.name === 'NotAllowedError' && !video.muted) {
                soundOn = false;
                syncSound();
                video.muted = true;
                return video.play();
            }
        }).catch(() => item.el.classList.add('is-paused'));
    }

    function pauseActive() {
        const item = activeItem();
        if (item.mode === 'video') item.video.pause();
    }

    // Warm the neighbours (and only the neighbours) so sliding feels instant.
    function warmNeighbours() {
        [-1, 1].forEach(step => {
            const item = items[(current + step + COUNT) % COUNT];
            attachSource(item);
            if (item.mode === 'video' && item.video.preload !== 'auto') item.video.preload = 'auto';
        });
    }

    // ---- embed fallback (only when there is no MP4) ------------------------
    // Instagram's embed is a cross-origin iframe: its header/footer cannot be styled
    // or hidden, so we crop it instead. Geometry of the embed at width 326px:
    //   56px header  +  326x408 (4:5) video box  +  footer
    // We scale the video box to COVER the phone screen and clip everything else.
    // Tunable: if Instagram changes its embed, nudge these two numbers.
    // 4px of overscan top and bottom hides sub-pixel/rounding differences.
    const EMBED_W = 326;
    const EMBED_HEADER = 60;                 // real header ~56px + 4px overscan
    const EMBED_BOX_H = EMBED_W * 1.25 - 8;  // 4:5 video box minus 8px overscan

    function loadEmbed(item) {
        if (item.embed || !item.reel.instagram) return;

        const frame = document.createElement('iframe');
        frame.className = 'cm-reel-embed';
        frame.title = `${item.reel.title} on Instagram`;
        frame.allow = 'autoplay; encrypted-media; picture-in-picture';
        frame.allowFullscreen = true;
        frame.scrolling = 'no';
        frame.src = `${item.reel.instagram}embed/`;

        item.screen.appendChild(frame);
        item.embed = frame;
        item.el.classList.add('is-embed-live');
        fitEmbed(item);
    }

    function unloadEmbed(item) {
        if (!item.embed) return;
        item.embed.remove();          // also stops any audio that is playing
        item.embed = null;
        item.el.classList.remove('is-embed-live');
    }

    function fitEmbed(item) {
        if (!item.embed) return;

        const sw = item.screen.clientWidth;
        const sh = item.screen.clientHeight;
        const scale = Math.max(sw / EMBED_W, sh / EMBED_BOX_H);   // "cover"
        const offsetX = (sw - EMBED_W * scale) / 2;               // centre horizontally

        item.embed.style.width = `${EMBED_W}px`;
        item.embed.style.height = `${EMBED_HEADER + EMBED_BOX_H + 200}px`;
        item.embed.style.transform =
            `translate(${offsetX}px, ${-EMBED_HEADER * scale}px) scale(${scale})`;
    }

    // ---- render -------------------------------------------------------------
    function render(animate) {
        const incoming = activeItem();
        const settleDelay = animate ? slideDuration() : 0;

        items.forEach(item => {
            const offset = offsetOf(item.index);
            const isActive = item === incoming;

            setPosition(item, offset, animate);

            item.el.classList.toggle('is-active', isActive);
            item.el.toggleAttribute('inert', !isActive && Math.abs(offset) > 2);
            item.tap.tabIndex = isActive || Math.abs(offset) === 1 ? 0 : -1;
            item.sound.tabIndex = isActive ? 0 : -1;
            item.el.querySelector('.cm-reel-follow').tabIndex = isActive ? 0 : -1;

            if (Math.abs(offset) <= 2) attachSource(item);

            if (!isActive) {
                if (item.mode === 'video') {
                    if (!item.video.paused) item.video.pause();
                    // Rewind once it has slid away, so it is ready to play from the start.
                    clearTimeout(item.leaveTimer);
                    item.leaveTimer = window.setTimeout(() => {
                        if (item !== activeItem() && item.mode === 'video') {
                            try { item.video.currentTime = 0; } catch (e) { /* not ready */ }
                            item.bar.style.transform = 'scaleX(0)';
                        }
                    }, settleDelay);
                }
                item.el.classList.remove('is-paused', 'is-loading');

                if (item.embed) {
                    clearTimeout(item.leaveTimer);
                    item.leaveTimer = window.setTimeout(() => {
                        if (item !== activeItem()) unloadEmbed(item);
                    }, settleDelay);
                }
            } else {
                clearTimeout(item.leaveTimer);

                if (item.mode === 'embed') {
                    // wait for the slide to settle so the iframe never janks the glide
                    item.leaveTimer = window.setTimeout(() => {
                        if (item === activeItem()) loadEmbed(item);
                    }, settleDelay);
                }
            }
        });

        if (number) number.textContent = pad(current + 1);

        userPaused = false;
        incoming.el.classList.remove('is-paused');
        playActive();
        window.setTimeout(warmNeighbours, animate ? Math.max(settleDelay - 100, 0) : 0);
        scheduleAutoAdvance();
    }

    function goTo(index) {
        const now = performance.now();
        if (now - lastNav < slideDuration()) return;

        const target = ((index % COUNT) + COUNT) % COUNT;
        if (target === current) {
            scheduleAutoAdvance();
            return;
        }

        lastNav = now;
        clearAutoAdvance();
        current = target;
        render(true);
    }

    // ---- interactions -------------------------------------------------------
    let dragged = false;

    prevButton.addEventListener('click', () => goTo(current - 1));
    nextButton.addEventListener('click', () => goTo(current + 1));

    if (autoplayButton) {
        autoplayButton.addEventListener('click', event => {
            event.stopPropagation();
            autoRotationPaused = !autoRotationPaused;
            syncAutoplayControl();

            if (autoRotationPaused) clearAutoAdvance();
            else scheduleAutoAdvance();
        });
    }

    items.forEach(item => {
        // tap: neighbour → bring to centre; centre → play / pause (like the app)
        item.tap.addEventListener('click', () => {
            if (dragged) return;

            if (item !== activeItem()) {
                goTo(item.index);
                return;
            }

            if (item.mode === 'embed') {
                loadEmbed(item);
                return;
            }

            if (item.video.paused) {
                userPaused = false;
                playActive();
                scheduleAutoAdvance();
            } else {
                userPaused = true;
                item.video.pause();
                clearAutoAdvance();
            }
        });

        item.sound.addEventListener('click', event => {
            event.stopPropagation();
            soundOn = !soundOn;
            syncSound();
            if (item.mode === 'video') {
                item.video.muted = !soundOn;
                if (item.video.paused && !userPaused) playActive();
            }
        });
    });

    // swipe (touch + mouse drag)
    let startX = 0;
    let startY = 0;
    let tracking = false;

    stage.addEventListener('pointerdown', event => {
        if (event.target.closest('.cm-stage-arrow, .cm-stage-autoplay, .cm-reel-sound, .cm-reel-follow')) return;
        clearAutoAdvance();
        tracking = true;
        dragged = false;
        startX = event.clientX;
        startY = event.clientY;
    });

    stage.addEventListener('pointerup', event => {
        if (!tracking) return;
        tracking = false;

        const dx = event.clientX - startX;
        const dy = event.clientY - startY;

        if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.2) {
            dragged = true;
            goTo(current + (dx < 0 ? 1 : -1));
            window.setTimeout(() => { dragged = false; }, slideDuration());
        } else {
            scheduleAutoAdvance();
        }
    });

    stage.addEventListener('pointercancel', () => {
        tracking = false;
        scheduleAutoAdvance();
    });

    stage.addEventListener('mouseenter', () => {
        stageHovered = true;
        clearAutoAdvance();
    });

    stage.addEventListener('mouseleave', () => {
        stageHovered = false;
        scheduleAutoAdvance();
    });

    function updateKeyboardFocusState() {
        stageFocused = stage.matches(':focus-visible') || Boolean(stage.querySelector(':focus-visible'));
        if (stageFocused) clearAutoAdvance();
        else scheduleAutoAdvance();
    }

    stage.addEventListener('focusin', () => requestAnimationFrame(updateKeyboardFocusState));
    stage.addEventListener('focusout', () => requestAnimationFrame(updateKeyboardFocusState));

    stage.addEventListener('keydown', event => {
        if (event.key === 'ArrowLeft') { event.preventDefault(); goTo(current - 1); }
        if (event.key === 'ArrowRight') { event.preventDefault(); goTo(current + 1); }
    });

    // only play while the carousel is actually on screen and the tab is visible
    if ('IntersectionObserver' in window) {
        new IntersectionObserver(([entry]) => {
            inView = entry.isIntersecting;
            if (inView) {
                playActive();
                scheduleAutoAdvance();
            } else {
                clearAutoAdvance();
                pauseActive();
            }
        }, { threshold: 0.35 }).observe(stage);
    }

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            clearAutoAdvance();
            pauseActive();
        } else {
            playActive();
            scheduleAutoAdvance();
        }
    });

    if (reducedMotion.addEventListener) {
        reducedMotion.addEventListener('change', () => {
            if (reducedMotion.matches) clearAutoAdvance();
            else scheduleAutoAdvance();
        });
    }

    let resizeFrame = 0;
    window.addEventListener('resize', () => {
        cancelAnimationFrame(resizeFrame);
        resizeFrame = requestAnimationFrame(() => items.forEach(fitEmbed));
    });

    // ---- start --------------------------------------------------------------
    syncSound();
    syncAutoplayControl();
    render(false);

});
