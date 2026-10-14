/* =====================================================================
   APOLOGY CARD — script.js

   ✏️  EDIT THE TWO NAMES BELOW. They are filled in automatically
       wherever the card shows [HER NAME] or [YOUR NAME].
   ===================================================================== */
const CONFIG = {
  herName: "Sima",   // shown on the envelope ("For Sima")
  yourName: "Venus", // shown in the signature
};

(() => {
  "use strict";

  /* ---------- Helpers ---------- */
  const $ = (selector) => document.querySelector(selector);
  const rand = (min, max) => Math.random() * (max - min) + min;
  const reducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Elements ---------- */
  const scene = $("#scene");
  const cardStage = $("#cardStage");
  const card = $("#card");
  const cardTitle = $("#cardTitle");
  const openBtn = $("#openBtn");
  const replayBtn = $("#replayBtn");
  const moreLoveBtn = $("#moreLoveBtn");
  const moreLoveText = $("#moreLoveText");
  const closeBtn = $("#closeBtn");
  const roseStage = $("#roseStage");
  const roseText = $("#roseText");
  const reopenBtn = $("#reopenBtn");
  const petalsAmbient = $("#petalsAmbient");
  const petalsBurst = $("#petalsBurst");
  const heartsLayer = $("#heartsLayer");
  const revealItems = document.querySelectorAll(".reveal");

  /* ---------- Fill in the names ---------- */
  document.querySelectorAll("[data-her-name]").forEach((el) => {
    el.textContent = CONFIG.herName;
  });
  document.querySelectorAll("[data-your-name]").forEach((el) => {
    el.textContent = CONFIG.yourName;
  });
  document.title = `A card for ${CONFIG.herName}`;

  /* ---------- Stagger order for the letter reveal ---------- */
  revealItems.forEach((el, index) => el.style.setProperty("--i", index));

  /* ---------- Rose petals ---------- */
  function spawnPetal(layer, burst = false) {
    const petal = document.createElement("span");
    const duration = burst ? rand(5, 8) : rand(10, 18);

    petal.className = "petal";
    petal.style.setProperty("--x", `${rand(0, 100)}%`);
    petal.style.setProperty("--size", `${rand(10, 20)}px`);
    petal.style.setProperty("--dur", `${duration}s`);
    petal.style.setProperty("--delay", burst ? `${rand(0, 1.8)}s` : `${-rand(0, duration)}s`);
    petal.style.setProperty("--drift", `${rand(-140, 140)}px`);
    petal.style.setProperty("--spin", `${rand(180, 720)}deg`);
    petal.style.setProperty("--sway", `${rand(2.4, 4.2)}s`);

    if (burst) {
      petal.style.setProperty("--iter", "1");
      petal.addEventListener("animationend", (event) => {
        if (event.animationName === "petal-fall") petal.remove();
      });
    }
    layer.appendChild(petal);
  }

  function startAmbientPetals() {
    if (reducedMotion()) return;
    const count = window.innerWidth < 600 ? 7 : 12;
    for (let i = 0; i < count; i++) spawnPetal(petalsAmbient);
  }

  function burstPetals() {
    if (reducedMotion()) return;
    for (let i = 0; i < 16; i++) spawnPetal(petalsBurst, true);
  }

  /* ---------- Floating hearts ---------- */
  function floatHearts(origin, count = 14) {
    if (reducedMotion()) return;
    const rect = origin.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    for (let i = 0; i < count; i++) {
      const heart = document.createElement("span");
      heart.className = "heart-float";
      heart.textContent = "♥";
      heart.style.left = `${centerX + rand(-rect.width / 2, rect.width / 2)}px`;
      heart.style.top = `${centerY}px`;
      heart.style.setProperty("--size", `${rand(14, 30)}px`);
      heart.style.setProperty("--rise", `${rand(140, 300)}px`);
      heart.style.setProperty("--dx", `${rand(-50, 50)}px`);
      heart.style.setProperty("--rot", `${rand(-25, 25)}deg`);
      heart.style.setProperty("--delay", `${i * 0.07}s`);
      heart.addEventListener("animationend", () => heart.remove());
      heartsLayer.appendChild(heart);
    }
  }

  /* ---------- Letter reveal (also used by "Read My Letter Again") ---------- */
  function playLetterReveal() {
    card.classList.remove("is-revealing");
    void card.offsetWidth; // restart the CSS animation
    card.classList.add("is-revealing");
  }

  /* ---------- Opening the envelope ---------- */
  let opened = false;

  function openCard() {
    if (opened) return;
    opened = true;
    openBtn.disabled = true;

    const quick = reducedMotion();

    // 1. Seal breaks, flap opens, letter slides out (all CSS, via .is-open)
    scene.classList.add("is-open");

    // 2. Envelope scene fades away
    window.setTimeout(() => scene.classList.add("is-leaving"), quick ? 0 : 1900);

    // 3. Card fades in, letter is revealed, petals drift across the screen
    window.setTimeout(() => {
      scene.hidden = true;
      cardStage.hidden = false;
      cardStage.classList.add("is-visible");
      card.scrollTop = 0;
      playLetterReveal();
      burstPetals();
      cardTitle.focus({ preventScroll: true });
    }, quick ? 50 : 2500);
  }

  openBtn.addEventListener("click", openCard);

  /* ---------- Button 1: Read My Letter Again ---------- */
  replayBtn.addEventListener("click", () => {
    const quick = reducedMotion();
    card.scrollTo({ top: 0, behavior: quick ? "auto" : "smooth" });
    // Small pause so the card scrolls back up before the letter replays.
    // Nothing else (e.g. the "More Love" message) is reset.
    window.setTimeout(playLetterReveal, quick ? 0 : 300);
  });

  /* ---------- Button 2: A Little More Love ---------- */
  moreLoveBtn.addEventListener("click", () => {
    moreLoveText.hidden = false;
    floatHearts(moreLoveBtn);
    moreLoveText.scrollIntoView({
      block: "nearest",
      behavior: reducedMotion() ? "auto" : "smooth",
    });
  });

  /* ---------- Button 3: Close the Card → roses come forward ---------- */
  closeBtn.addEventListener("click", () => {
    const quick = reducedMotion();
    cardStage.classList.add("is-closing");

    window.setTimeout(() => {
      cardStage.hidden = true;
      cardStage.classList.remove("is-closing", "is-visible");

      roseStage.hidden = false;
      roseStage.classList.remove("is-visible");
      void roseStage.offsetWidth; // restart the roses' animation
      roseStage.classList.add("is-visible");

      burstPetals();
      roseText.focus({ preventScroll: true });
    }, quick ? 0 : 650);
  });

  /* ---------- Open the card again ---------- */
  reopenBtn.addEventListener("click", () => {
    roseStage.hidden = true;
    roseStage.classList.remove("is-visible");

    cardStage.hidden = false;
    cardStage.classList.remove("is-closing", "is-visible");
    void cardStage.offsetWidth;
    cardStage.classList.add("is-visible");

    card.scrollTop = 0;
    playLetterReveal();
    cardTitle.focus({ preventScroll: true });
  });

  /* ---------- Go ---------- */
  startAmbientPetals();
})();