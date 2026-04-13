const { createApp, ref, computed, onMounted } = Vue;

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
        const res  = await fetch('Stats.json');
        const data = await res.json();
        teamStats.value = data.teamStats;
        players.value   = data.players;
        coaches.value   = data.coaches;
      } catch (e) {
        console.error('Failed to load Stats.json:', e);
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