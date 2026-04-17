// Info.js — Staggered card reveal on page load

document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.info-card');

  // Stagger each card's fade-in by 100ms
  cards.forEach((card, i) => {
    setTimeout(() => {
      card.classList.add('visible');
    }, 120 * i);
  });
});