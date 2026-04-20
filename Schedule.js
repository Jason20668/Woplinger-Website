// Schedule.js — pulls game data from Google Sheets

const SHEET_ID = '1iXzvrfzcY6m-bH3nld_vfufiKLh8Zd1YyGS8wrB2F10';

async function fetchSchedule() {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=Schedule`;
  const res  = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();

  const jsonStr = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\)/)?.[1];
  if (!jsonStr) throw new Error('Could not parse gviz response');
  const json = JSON.parse(jsonStr);

  // Columns by position: A=team1, B=team2, C=date, D=location
  return json.table.rows
    .filter(row => {
      if (!row.c) return false;
      const team1 = row.c[0] && row.c[0].v;
      const team2 = row.c[1] && row.c[1].v;
      if (!team1 || !team2) return false;
      if (String(team1).toLowerCase() === 'team1') return false;
      return true;
    })
    .map(row => {
      // For date cells gviz returns a Date object in .v and the formatted string in .f
      // Use .f (formatted) first, fall back to .v if .f isn't present
      const dateCell = row.c[2];
      let date = '';
      if (dateCell) {
        date = dateCell.f ? String(dateCell.f) : String(dateCell.v);
      }

      return {
        team1:    row.c[0] ? String(row.c[0].v) : '',
        team2:    row.c[1] ? String(row.c[1].v) : '',
        date,
        location: row.c[3] ? String(row.c[3].v) : '',
      };
    });
}

function renderSchedule(games) {
  const list = document.getElementById('scheduleList');

  if (!games.length) {
    list.innerHTML = '<p style="text-align:center; color:#888; font-size:1.1rem;">No games scheduled yet.</p>';
    return;
  }

  games.forEach((game, i) => {
    const card = document.createElement('div');
    card.classList.add('game-card');
    card.innerHTML = `
      <div class="matchup">${game.team1} vs. ${game.team2}</div>
      <div class="details">
        <span>When: ${game.date}</span>
        <span>Where: ${game.location}</span>
      </div>
    `;
    list.appendChild(card);

    // Staggered fade-in
    setTimeout(() => card.classList.add('visible'), 100 * i);
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const games = await fetchSchedule();
    renderSchedule(games);
  } catch (e) {
    console.error('Failed to load schedule:', e);
    document.getElementById('scheduleList').innerHTML =
      '<p style="text-align:center; color:red;">Could not load schedule.</p>';
  }
});