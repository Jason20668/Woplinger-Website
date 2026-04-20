// ── Email modal ──────────────────────────────────────────────
const modal    = document.getElementById("emailModal");
const btn      = document.getElementById("emailBtn");
const closeBtn = document.querySelector(".close-btn");

btn.onclick = () => modal.style.display = "flex";
closeBtn.onclick = () => modal.style.display = "none";
window.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; };

// ── Announcements from Google Sheets ─────────────────────────
const SHEET_ID = '1iXzvrfzcY6m-bH3nld_vfufiKLh8Zd1YyGS8wrB2F10';

async function fetchAnnouncements() {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=Announcements`;
  const res  = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();

  const jsonStr = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\)/)?.[1];
  if (!jsonStr) throw new Error('Could not parse gviz response');
  const json = JSON.parse(jsonStr);

  return json.table.rows
    .filter(row => {
      if (!row.c) return false;
      const id  = row.c[0] && row.c[0].v;
      const msg = row.c[1] && row.c[1].v;
      // Skip if either cell is empty, or if this is the header row being returned as data
      if (!id || !msg) return false;
      if (String(id).toLowerCase() === 'id' || String(msg).toLowerCase() === 'message') return false;
      return true;
    })
    .map(row => ({
      id:      row.c[0].v,
      message: row.c[1].v,
    }));
}

function renderAnnouncements(items) {
  const list = document.getElementById('announcements-list');
  if (!items.length) {
    list.innerHTML = '<p style="color:#888; padding:10px 0;">No announcements at this time.</p>';
    return;
  }
  list.innerHTML = items.map(item => `
    <div class="announcement-item">
      <p class="ann-message">${item.message}</p>
    </div>
  `).join('');
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const items = await fetchAnnouncements();
    renderAnnouncements(items);
  } catch (e) {
    console.error('Failed to load announcements:', e);
    document.getElementById('announcements-list').innerHTML =
      '<p style="color:red; padding:10px 0;">Could not load announcements.</p>';
  }
});