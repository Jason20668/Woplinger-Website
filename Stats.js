const { createApp, ref, computed, onMounted } = Vue;

const SHEET_ID = '1iXzvrfzcY6m-bH3nld_vfufiKLh8Zd1YyGS8wrB2F10';

async function fetchSheet(sheetName) {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for sheet: ${sheetName}`);
  const text = await res.text();

  // Strip the Google wrapper: /*O_o*/\ngoogle.visualization.Query.setResponse({...});
  const jsonStr = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\)/)?.[1];
  if (!jsonStr) throw new Error('Could not parse gviz response for: ' + sheetName);
  const json = JSON.parse(jsonStr);

  const cols = json.table.cols.map(c => c.label);
  const idIdx = cols.indexOf('id');
  return json.table.rows
    .filter(row => {
      if (!row.c) return false;
      // If the sheet has an 'id' column, require it to be non-empty
      if (idIdx >= 0) return row.c[idIdx] && row.c[idIdx].v;
      // Otherwise just require at least one non-null cell
      return row.c.some(cell => cell && cell.v !== null && cell.v !== '');
    })
    .map(row =>
      Object.fromEntries(
        cols.map((col, i) => [col, row.c[i] ? row.c[i].v : null])
      )
    );
}

// Stats to show in the modal accordion, in order.
// Each entry: { key, label }
const STAT_FIELDS = [
  { key: 'goals',         label: 'Goals' },
  { key: 'assists',       label: 'Assists' },
  { key: 'points',        label: 'Points' },
  { key: 'gbs',           label: 'GBs' },
  { key: 'gamesPlayed',   label: 'Games Played' },
  { key: 'fosWinPercent', label: 'FOS Win %' },
  { key: 'saves',         label: 'Saves' },
  { key: 'ga',            label: 'Goals Against' },
];

createApp({
  setup() {
    const activeTab      = ref('team-stats');
    const isArchived     = ref(false);
    const teamStats      = ref({});
    const players        = ref([]);
    const coaches        = ref([]);
    const modalOpen      = ref(false);
    const selectedPlayer = ref(null);
    const loadError      = ref(null);

    onMounted(async () => {
      try {
        const [teamRows, coachRows, playerRows, seasonRows] = await Promise.all([
          fetchSheet('TeamStats'),
          fetchSheet('Coaches'),
          fetchSheet('Players'),
          fetchSheet('Seasons'),
        ]);

        // TeamStats: first row
        teamStats.value = teamRows[0] || {};

        // Coaches
        coaches.value = coachRows;

        // Players: merge in their seasons
        players.value = playerRows.map(player => ({
          ...player,
          archived: player.archived === true || String(player.archived).toUpperCase() === 'TRUE',
          seasons: seasonRows
            .filter(s => s.playerId === player.id)
            .map(s => ({
              ...s,
              _open: false,
              // Build the list of stats that actually have a value
              visibleStats: STAT_FIELDS.filter(f => {
                const v = s[f.key];
                return v !== null && v !== undefined && v !== '';
              }),
            })),
        }));

      } catch (e) {
        console.error('Failed to load from Google Sheets:', e);
        loadError.value = 'Could not load data. Make sure the spreadsheet is shared publicly (Anyone with the link → Viewer).';
      }
    });

    const activePlayers    = computed(() => players.value.filter(p => !p.archived));
    const archivedPlayers  = computed(() => players.value.filter(p =>  p.archived));
    const displayedPlayers = computed(() =>
      isArchived.value ? archivedPlayers.value : activePlayers.value
    );

    function showTab(tab) {
      activeTab.value = tab;
      if (tab === 'team-stats') isArchived.value = false;
    }

    function toggleArchive() {
      isArchived.value = !isArchived.value;
    }

    function openModal(player) {
      selectedPlayer.value = player;
      modalOpen.value = true;
    }

    function closeModal() {
      modalOpen.value = false;
      selectedPlayer.value = null;
    }

    function toggleAccordion(season) {
      season._open = !season._open;
      // Trigger Vue reactivity
      players.value = [...players.value];
    }

    return {
      activeTab,
      isArchived,
      teamStats,
      players,
      coaches,
      modalOpen,
      selectedPlayer,
      activePlayers,
      archivedPlayers,
      displayedPlayers,
      loadError,
      STAT_FIELDS,
      showTab,
      toggleArchive,
      openModal,
      closeModal,
      toggleAccordion,
    };
  },
}).mount('#app');