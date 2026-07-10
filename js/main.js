/**
 * main.js
 * ------------------------------------------------------
 * サイト全体の挙動を制御するロジック。
 * WORKS 配列 (js/works-data.js) を読み込んでグリッドを描画し、
 * ヘッダーのスクロール制御、ハンバーガーメニュー、
 * スクロールリビール、モーダル(iframeの生成/破棄)を扱う。
 * ------------------------------------------------------
 */

(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ==========================================================
     Hero: letter-by-letter reveal
     ========================================================== */

  function initHero() {
    var heroName = document.getElementById("heroName");
    if (!heroName) return;

    var text = "Ayanao";
    heroName.textContent = "";
    heroName.setAttribute("aria-label", text);

    var delayStep = 0.06;

    text.split("").forEach(function (char, i) {
      var span = document.createElement("span");
      span.className = "letter";
      if (char === " ") {
        span.className += " is-space";
        span.innerHTML = "&nbsp;";
      } else {
        span.textContent = char;
      }
      span.setAttribute("aria-hidden", "true");
      if (!prefersReducedMotion) {
        span.style.animationDelay = (0.15 + i * delayStep) + "s";
      }
      heroName.appendChild(span);
    });
  }

  /* ==========================================================
     Hero background: random highlight reel of self-hosted clips
     (assets/reel/*.mp4 — 各作品から数箇所ずつ切り出した7秒クリップ)
     ========================================================== */

  var HERO_CLIPS = [
    "assets/reel/jumphigh-1.mp4",
    "assets/reel/jumphigh-2.mp4",
    "assets/reel/jumphigh-3.mp4",
    "assets/reel/meimetsu-1.mp4",
    "assets/reel/meimetsu-2.mp4",
    "assets/reel/meimetsu-3.mp4",
    "assets/reel/hotlimit-1.mp4",
    "assets/reel/hotlimit-2.mp4",
    "assets/reel/hotlimit-3.mp4",
    "assets/reel/cultic-1.mp4",
    "assets/reel/cultic-2.mp4",
    "assets/reel/cultic-3.mp4",
    "assets/reel/unruled-1.mp4",
    "assets/reel/unruled-2.mp4",
    "assets/reel/unruled-3.mp4",
    "assets/reel/irisout-1.mp4",
    "assets/reel/irisout-2.mp4",
    "assets/reel/irisout-3.mp4",
    "assets/reel/emoradar-1.mp4",
    "assets/reel/emoradar-2.mp4",
    "assets/reel/emoradar-3.mp4",
    "assets/reel/you-1.mp4",
    "assets/reel/you-2.mp4",
    "assets/reel/you-3.mp4",
    "assets/reel/players-1.mp4",
    "assets/reel/players-2.mp4",
    "assets/reel/players-3.mp4",
    "assets/reel/northern-1.mp4",
    "assets/reel/northern-2.mp4",
    "assets/reel/northern-3.mp4",
    "assets/reel/lolireq-1.mp4",
    "assets/reel/lolireq-2.mp4",
    "assets/reel/lolireq-3.mp4"
  ];

  function initHeroBackground() {
    var container = document.getElementById("heroBgFrame");
    if (!container || !HERO_CLIPS.length) return;
    if (prefersReducedMotion) return;

    var CYCLE_MS = 6000;
    var queue = [];
    var lastWork = "";

    function workOf(path) {
      return path.split("/").pop().split("-")[0];
    }

    function nextClip() {
      if (!queue.length) {
        queue = HERO_CLIPS.slice();
        for (var i = queue.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var tmp = queue[i];
          queue[i] = queue[j];
          queue[j] = tmp;
        }
      }
      // 同じ作品が2連続にならないように並べ替える
      if (queue.length > 1 && workOf(queue[0]) === lastWork) {
        queue.push(queue.shift());
      }
      var clip = queue.shift();
      lastWork = workOf(clip);
      return clip;
    }

    function showNext() {
      var video = document.createElement("video");
      video.muted = true;
      video.setAttribute("muted", "");
      video.playsInline = true;
      video.setAttribute("playsinline", "");
      video.autoplay = true;
      video.loop = true;
      video.preload = "auto";
      video.setAttribute("aria-hidden", "true");
      video.setAttribute("tabindex", "-1");
      video.src = nextClip();

      var previous = container.querySelector("video.is-active");
      container.appendChild(video);

      var shown = false;
      function reveal() {
        if (shown) return;
        shown = true;
        video.offsetHeight; // force layout flush so the opacity transition reliably triggers
        video.classList.add("is-active");
        if (previous) {
          previous.classList.remove("is-active");
          setTimeout(function () {
            if (previous.parentNode) previous.parentNode.removeChild(previous);
          }, 1300);
        }
      }

      video.addEventListener("canplay", reveal);
      setTimeout(reveal, 1500); // 読み込みが遅くてもフェードだけは進める保険

      var playPromise = video.play();
      if (playPromise && playPromise.catch) playPromise.catch(function () {});
    }

    showNext();
    setInterval(showNext, CYCLE_MS);
  }

  /* ==========================================================
     Scroll reveal via IntersectionObserver
     ========================================================== */

  function initScrollReveal() {
    var targets = document.querySelectorAll(".reveal");
    if (!targets.length) return;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      targets.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );

    targets.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ==========================================================
     Works grid rendering
     ========================================================== */

  function deriveThumbnail(work) {
    if (work.thumbnail) return work.thumbnail;
    if (work.platform === "youtube" && work.videoId) {
      return "https://i.ytimg.com/vi/" + work.videoId + "/hqdefault.jpg";
    }
    return null; // vimeo / unknown without explicit thumbnail -> CSS placeholder
  }

  function buildWorksGrid() {
    var grid = document.getElementById("worksGrid");
    if (!grid) return;

    if (typeof WORKS === "undefined" || !Array.isArray(WORKS)) {
      console.warn("WORKS data not found. Make sure js/works-data.js is loaded before js/main.js.");
      return;
    }

    var fragment = document.createDocumentFragment();

    WORKS.forEach(function (work, index) {
      var card = document.createElement("button");
      card.type = "button";
      card.className = "work-card reveal";
      card.setAttribute("data-index", String(index));
      card.setAttribute("aria-label", work.title + " を再生");

      var thumbWrap = document.createElement("div");
      var thumbUrl = deriveThumbnail(work);

      if (thumbUrl) {
        thumbWrap.className = "work-thumb";
        var img = document.createElement("img");
        img.src = thumbUrl;
        img.alt = work.title;
        img.loading = "lazy";
        thumbWrap.appendChild(img);
      } else {
        thumbWrap.className = "work-thumb is-placeholder";
      }

      var overlay = document.createElement("div");
      overlay.className = "work-overlay";

      var overlayTitle = document.createElement("span");
      overlayTitle.className = "work-overlay-title";
      overlayTitle.textContent = work.title;

      var overlayRole = document.createElement("span");
      overlayRole.className = "work-overlay-role";
      overlayRole.textContent = work.role;

      overlay.appendChild(overlayTitle);
      overlay.appendChild(overlayRole);
      thumbWrap.appendChild(overlay);

      var meta = document.createElement("div");
      meta.className = "work-meta";

      var title = document.createElement("span");
      title.className = "work-title";
      title.textContent = work.title;

      var year = document.createElement("span");
      year.className = "work-year";
      year.textContent = work.year;

      meta.appendChild(title);
      meta.appendChild(year);

      card.appendChild(thumbWrap);
      card.appendChild(meta);

      card.addEventListener("click", function () {
        openModal(work);
      });

      fragment.appendChild(card);
    });

    grid.appendChild(fragment);
    // Note: initScrollReveal() は DOMContentLoaded 内で本関数の後に呼ばれるため、
    // ここで生成した .reveal カードもまとめて監視対象になる。
  }

  /* ==========================================================
     Modal: create/destroy iframe so audio actually stops
     ========================================================== */

  var modal, modalBackdrop, modalCloseBtn, modalVideoWrap, modalTitle, modalYear, modalRole, modalDesc;
  var lastFocusedElement = null;

  function buildEmbedUrl(work) {
    if (work.platform === "youtube") {
      return "https://www.youtube.com/embed/" + work.videoId + "?autoplay=1&rel=0";
    }
    if (work.platform === "vimeo") {
      return "https://player.vimeo.com/video/" + work.videoId + "?autoplay=1";
    }
    return "";
  }

  function openModal(work) {
    if (!modal) return;

    modalTitle.textContent = work.title;
    modalYear.textContent = work.year;
    modalRole.textContent = work.role;
    modalDesc.textContent = work.description;

    // Fresh iframe every time the modal opens.
    modalVideoWrap.innerHTML = "";
    var iframe = document.createElement("iframe");
    iframe.src = buildEmbedUrl(work);
    iframe.setAttribute("title", work.title);
    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute(
      "allow",
      "autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
    );
    iframe.setAttribute("allowfullscreen", "");
    modalVideoWrap.appendChild(iframe);

    lastFocusedElement = document.activeElement;

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-locked");

    modalCloseBtn.focus();
  }

  function closeModal() {
    if (!modal || !modal.classList.contains("is-open")) return;

    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-locked");

    // Fully remove the iframe from the DOM so audio/video actually stops.
    modalVideoWrap.innerHTML = "";

    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
      lastFocusedElement.focus();
    }
  }

  function initModal() {
    modal = document.getElementById("workModal");
    modalBackdrop = document.getElementById("modalBackdrop");
    modalCloseBtn = document.getElementById("modalCloseBtn");
    modalVideoWrap = document.getElementById("modalVideoWrap");
    modalTitle = document.getElementById("modalTitle");
    modalYear = document.getElementById("modalYear");
    modalRole = document.getElementById("modalRole");
    modalDesc = document.getElementById("modalDesc");

    if (!modal) return;

    modalCloseBtn.addEventListener("click", closeModal);
    modalBackdrop.addEventListener("click", closeModal);

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.classList.contains("is-open")) {
        closeModal();
      }
    });
  }

  /* ==========================================================
     Contact form: build a mailto: link (no backend required)
     ========================================================== */

  var CONTACT_EMAIL = "ayanaocreate@gmail.com";

  function initContactForm() {
    var form = document.getElementById("contactForm");
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var name = form.elements.name.value.trim();
      var email = form.elements.email.value.trim();
      var subject = form.elements.subject.value.trim();
      var message = form.elements.message.value.trim();

      var body = "お名前: " + name + "\n" + "メールアドレス: " + email + "\n\n" + message;

      var mailtoUrl =
        "mailto:" + CONTACT_EMAIL +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);

      window.location.href = mailtoUrl;
    });
  }

  /* ==========================================================
     Init
     ========================================================== */

  document.addEventListener("DOMContentLoaded", function () {
    initHero();
    initHeroBackground();
    initModal();
    buildWorksGrid();
    initContactForm();
    initScrollReveal();
  });
})();
