// ── Email modal ──────────────────────────────────────────────
const modal    = document.getElementById("emailModal");
const btn      = document.getElementById("emailBtn");
const closeBtn = document.querySelector(".close-btn");

btn.onclick = () => {
  modal.style.display = "flex";
  // Reset form state when reopening
  document.querySelector(".send-btn").disabled = false;
  document.querySelector(".send-btn").textContent = "Send";
  document.getElementById("form-success").style.display = "none";
  document.getElementById("form-error").style.display = "none";
};
closeBtn.onclick = () => modal.style.display = "none";
window.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; };

// ── Send email via Formspree ──────────────────────────────────
document.querySelector(".send-btn").onclick = async () => {
  const name     = document.querySelector('.form-row input[placeholder="Name"]').value.trim();
  const subject  = document.querySelector('.form-row input[placeholder="Subject"]').value.trim();
  const replyTo  = document.querySelector('.form-row input[placeholder="Email"]').value.trim();
  const body     = document.querySelector("textarea").value.trim();

  if (!name || !subject || !replyTo || !body) {
    alert("Please fill out all fields before sending.");
    return;
  }

  const sendBtn = document.querySelector(".send-btn");
  sendBtn.disabled = true;
  sendBtn.textContent = "Sending...";

  try {
    const res = await fetch("https://formspree.io/f/mpqkllav", {
      method: "POST",
      headers: { "Accept": "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ name, subject, email: replyTo, message: body }),
    });

    if (res.ok) {
      document.getElementById("form-success").style.display = "block";
      document.getElementById("form-error").style.display = "none";
      // Clear fields
      document.querySelector('.form-row input[placeholder="Name"]').value = "";
      document.querySelector('.form-row input[placeholder="Subject"]').value = "";
      document.querySelector('.form-row input[placeholder="Email"]').value = "";
      document.querySelector("textarea").value = "";
      // Auto-close after 2 seconds
      setTimeout(() => { modal.style.display = "none"; }, 2000);
    } else {
      throw new Error("Server error");
    }
  } catch (e) {
    document.getElementById("form-error").style.display = "block";
    document.getElementById("form-success").style.display = "none";
    sendBtn.disabled = false;
    sendBtn.textContent = "Send";
  }
};

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