var isArchived = false;

function showTab(tab) {
  document.getElementById('section-team-stats').classList.remove('visible');
  document.getElementById('section-player-stats').classList.remove('visible');
  document.getElementById('btn-team-stats').classList.remove('active');
  document.getElementById('btn-player-stats').classList.remove('active');

  if (tab === 'team-stats') {
    document.getElementById('section-team-stats').classList.add('visible');
    document.getElementById('btn-team-stats').classList.add('active');
    isArchived = false;
  } else {
    document.getElementById('section-player-stats').classList.add('visible');
    document.getElementById('btn-player-stats').classList.add('active');
  }
}

function toggleArchive() {
  isArchived = !isArchived;

  var btn      = document.getElementById('archive-toggle-btn');
  var title    = document.getElementById('player-section-title');
  var active   = document.getElementById('active-players-view');
  var archived = document.getElementById('archived-players-view');

  if (isArchived) {
    btn.textContent  = 'Active';
    btn.className    = 'archive-btn active-btn';
    title.textContent = 'Archived Players';
    active.style.display   = 'none';
    archived.style.display = 'block';
  } else {
    btn.textContent  = 'Archived';
    btn.className    = 'archive-btn archived-btn';
    title.textContent = 'Player Stats';
    active.style.display   = 'block';
    archived.style.display = 'none';
  }
}

function showRosterPage() {
  document.getElementById('nav-team').classList.add('active-nav');
  showTab('team-stats');
}