const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector("#main-nav");
const videoDialog = document.querySelector(".video-dialog");
const videoFrame = document.querySelector(".video-frame");
const videoDialogTitle = document.querySelector(".video-dialog-title");
const currentYear = document.querySelector("#current-year");
const musicGrid = document.querySelector(".music-grid");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

currentYear.textContent = String(new Date().getFullYear());

musicGrid.querySelectorAll(".video-trigger").forEach((button) => {
  const thumbnail = document.createElement("img");
  thumbnail.className = "video-thumbnail";
  thumbnail.alt = "";
  thumbnail.setAttribute("aria-hidden", "true");
  thumbnail.loading = "lazy";
  thumbnail.decoding = "async";
  thumbnail.src = `https://i.ytimg.com/vi/${encodeURIComponent(button.dataset.video)}/hqdefault.jpg`;
  thumbnail.addEventListener("error", () => thumbnail.remove(), { once: true });
  button.prepend(thumbnail);
});

const originalCards = [...musicGrid.children];
let loopWidth = 0;
let animationFrame = 0;
let previousFrameTime = 0;
let pointerInside = false;
let focusInside = false;
let interactionPauseUntil = 0;

function addLoopCopies() {
  originalCards.forEach((card) => {
    const clone = card.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    clone.querySelectorAll("a, button").forEach((control) => control.setAttribute("tabindex", "-1"));
    musicGrid.append(clone);
  });
  loopWidth = musicGrid.children[originalCards.length].offsetLeft - originalCards[0].offsetLeft;
}

function animateMusicCarousel(timestamp) {
  animationFrame = 0;
  if (document.hidden || reducedMotion.matches) {
    previousFrameTime = 0;
    return;
  }
  if (pointerInside || focusInside || timestamp < interactionPauseUntil) {
    previousFrameTime = 0;
  } else if (previousFrameTime) {
    const elapsed = Math.min(timestamp - previousFrameTime, 50);
    musicGrid.scrollLeft += elapsed * 0.035;
    if (musicGrid.scrollLeft >= loopWidth) musicGrid.scrollLeft -= loopWidth;
  }
  previousFrameTime = timestamp;
  animationFrame = window.requestAnimationFrame(animateMusicCarousel);
}

function startMusicCarousel() {
  if (!reducedMotion.matches && loopWidth && !animationFrame && !document.hidden) {
    animationFrame = window.requestAnimationFrame(animateMusicCarousel);
  }
}

if (!reducedMotion.matches && originalCards.length > 1) addLoopCopies();
startMusicCarousel();

musicGrid.addEventListener("pointerenter", (event) => {
  if (event.pointerType === "mouse") pointerInside = true;
});
musicGrid.addEventListener("pointerleave", (event) => {
  if (event.pointerType === "mouse") pointerInside = false;
});
musicGrid.addEventListener("pointerdown", () => {
  interactionPauseUntil = performance.now() + 1200;
});
musicGrid.addEventListener("focusin", () => {
  focusInside = true;
});
musicGrid.addEventListener("focusout", () => {
  window.setTimeout(() => {
    focusInside = musicGrid.contains(document.activeElement);
  }, 0);
});

document.addEventListener("visibilitychange", startMusicCarousel);
reducedMotion.addEventListener("change", (event) => {
  if (event.matches) {
    window.cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    musicGrid.querySelectorAll(".music-card[aria-hidden='true']").forEach((card) => card.remove());
    musicGrid.scrollLeft = 0;
    loopWidth = 0;
    return;
  }
  if (!loopWidth) addLoopCopies();
  startMusicCarousel();
});

menuToggle.addEventListener("click", () => {
  const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isExpanded));
  mainNav.classList.toggle("open", !isExpanded);
});

mainNav.addEventListener("click", (event) => {
  if (!event.target.closest("a")) return;
  menuToggle.setAttribute("aria-expanded", "false");
  mainNav.classList.remove("open");
});

musicGrid.addEventListener("click", (event) => {
  const button = event.target.closest(".video-trigger");
  if (!button) return;
  const videoId = button.dataset.video;
  if (!videoId) return;
  videoDialogTitle.textContent = button.dataset.title || "KCM1948";
  const iframe = document.createElement("iframe");
  iframe.title = videoDialogTitle.textContent;
  iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0`;
  iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
  iframe.referrerPolicy = "strict-origin-when-cross-origin";
  iframe.allowFullscreen = true;
  videoFrame.replaceChildren(iframe);
  videoDialog.showModal();
});

function closeVideo() {
  videoDialog.close();
  videoFrame.replaceChildren();
}

document.querySelector(".video-close").addEventListener("click", closeVideo);
videoDialog.addEventListener("click", (event) => {
  if (event.target === videoDialog) closeVideo();
});
videoDialog.addEventListener("close", () => videoFrame.replaceChildren());
