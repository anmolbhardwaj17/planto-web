// Reduce motion gate — mirrors the app's reduce-motion handling
if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  document.documentElement.classList.add("reduced-motion");
}

// Scroll reveal
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add("in"), i * 60);
        io.unobserve(e.target);
      }
    });
  },
  { threshold: 0.12 }
);
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

// Speech bubble cycler — lines from Planto/Models/Dialogue.swift
const lines = [
  "Oh, hi there!",
  "Hey friend.",
  "Missed your face.",
  "There you are!",
  "I am here. You are here. Lovely.",
  "Hey. New leaf today, see?",
];

const bubble = document.querySelector(".bubble");
let lineIdx = 0;
let bubbleTimer = null;

function cycleSpeechBubble() {
  if (!bubble) return;
  bubble.style.opacity = "0";
  bubble.style.transform = "translateX(-50%) scale(0.9)";
  setTimeout(() => {
    lineIdx = (lineIdx + 1) % lines.length;
    bubble.textContent = lines[lineIdx];
    bubble.style.opacity = "1";
    bubble.style.transform = "translateX(-50%) scale(1)";
  }, 350);
}

function startBubble() {
  stopBubble();
  bubbleTimer = setInterval(cycleSpeechBubble, 4500);
}
function stopBubble() {
  if (bubbleTimer) { clearInterval(bubbleTimer); bubbleTimer = null; }
}

if (bubble) {
  bubble.textContent = lines[0];
  startBubble();
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopBubble();
    else startBubble();
  });
}

// Sticky floating Install CTA
const heroCta = document.querySelector(".hero .cta-row");
const installSection = document.getElementById("install");
const floatCta = document.querySelector(".float-cta");

let heroOut = false;
let installIn = false;

function updateFloat() {
  if (!floatCta) return;
  if (heroOut && !installIn) floatCta.classList.add("visible");
  else floatCta.classList.remove("visible");
}

if (heroCta) {
  new IntersectionObserver(
    ([e]) => { heroOut = !e.isIntersecting; updateFloat(); },
    { threshold: 0 }
  ).observe(heroCta);
}
if (installSection) {
  new IntersectionObserver(
    ([e]) => { installIn = e.isIntersecting; updateFloat(); },
    { threshold: 0.05 }
  ).observe(installSection);
}
