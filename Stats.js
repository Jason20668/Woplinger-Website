const { createApp, ref, computed, onMounted } = Vue;

const SHEET_ID = '1iXzvrfzcY6m-bH3nld_vfufiKLh8Zd1YyGS8wrB2F10';

async function fetchSheet(sheetName) {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${sheetName}`;
  const res = await fetch(url);
  const text = await res.text();
  const json = JSON.parse(text.substring(47).slice(0, -2));

  const cols = json.table.cols.map(c => c.label);
  return json.table.rows.map(row =>
    Object.fromEntries(
      cols.map((col, i) => [col, row.c[i] ? row.c[i].v : null])
    )
  );
}

createApp({
  setup() {
    const activeTab      = ref('team-stats');
    const isArchived     = ref(false);
    const teamStats      = ref({});
    const players        = ref([]);
    const coaches        = ref([]);
    const modalOpen      = ref(false);
    const selectedPlayer = ref(null);

    onMounted(async () => {
      try {
        const [teamRows, coachRows, playerRows, seasonRows] = await Promise.all([
          fetchSheet('TeamStats'),
          fetchSheet('Coaches'),
          fetchSheet('Players'),
          fetchSheet('Seasons'),
        ]);

        teamStats.value = teamRows[0];

        coaches.value = coachRows;

        players.value = playerRows.map(player => ({
          ...player,
          archived: player.archived === true || player.archived === 'TRUE',
          seasons: seasonRows
            .filter(s => s.playerId === player.id)
            .map(s => ({ ...s, _open: false })),
        }));

      } catch (e) {
        console.error('Failed to load from Google Sheets:', e);
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
      showTab,
      toggleArchive,
      openModal,
      closeModal,
      toggleAccordion,
    };
  },
}).mount('#app');