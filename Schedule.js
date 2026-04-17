// Schedule.js — Game data & card rendering

const games = [
  { matchup: "Marlboro vs. Manalapan", when: "3/2/19", where: "Marlboro" },
  { matchup: "Marlboro vs. Manalapan", when: "3/2/19", where: "Marlboro" },
  { matchup: "Marlboro vs. Manalapan", when: "3/2/19", where: "Marlboro" },
];

function renderSchedule() {
  const list = document.getElementById('scheduleList');

  games.forEach((game, i) => {
    const card = document.createElement('div');
    card.classList.add('game-card');
    card.innerHTML = `
      <div class="matchup">${game.matchup}</div>
      <div class="details">
        <span>When: ${game.when}</span>
        <span>Where: ${game.where}</span>
      </div>
    `;
    list.appendChild(card);

    // Staggered fade-in
    setTimeout(() => card.classList.add('visible'), 100 * i);
  });
}

document.addEventListener('DOMContentLoaded', renderSchedule);