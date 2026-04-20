// Gallery.js — fetches photos from Google Sheets, handles filtering & lightbox

const SHEET_ID = '1iXzvrfzcY6m-bH3nld_vfufiKLh8Zd1YyGS8wrB2F10';

let allPhotos = [];

// ── Fetch from Google Sheets ──────────────────────────────────
async function fetchGallery() {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=Gallery`;
  const res  = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();

  const jsonStr = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\)/)?.[1];
  if (!jsonStr) throw new Error('Could not parse gviz response');
  const json = JSON.parse(jsonStr);

  // Columns by position: A=image, B=title, C=gh, D=tp
  return json.table.rows
    .filter(row => {
      if (!row.c) return false;
      const image = row.c[0] && row.c[0].v;
      const title = row.c[1] && row.c[1].v;
      // Skip empty rows and header row
      if (!image || !title) return false;
      if (String(image).toLowerCase() === 'image') return false;
      return true;
    })
    .map(row => ({
      image: row.c[0] ? String(row.c[0].v) : '',
      title: row.c[1] ? String(row.c[1].v) : '',
      gh:    row.c[2] ? String(row.c[2].v).toUpperCase() === 'TRUE' : false,
      tp:    row.c[3] ? String(row.c[3].v).toUpperCase() === 'TRUE' : false,
    }));
}

// ── Render grid ───────────────────────────────────────────────
function renderGrid(photos) {
  const grid = document.getElementById('galleryGrid');
  grid.innerHTML = '';

  if (!photos.length) {
    grid.innerHTML = '<p class="loading-msg">No photos found.</p>';
    return;
  }

  photos.forEach(photo => {
    const item = document.createElement('div');
    item.classList.add('gallery-item');
    item.innerHTML = `
      <img src="${photo.image}" alt="${photo.title}">
      <div class="gallery-caption">${photo.title}</div>
    `;
    item.addEventListener('click', () => openLightbox(photo));
    grid.appendChild(item);
  });
}

// ── Filter logic ──────────────────────────────────────────────
function applyFilter(filter) {
  if (filter === 'all') return renderGrid(allPhotos);
  if (filter === 'gh')  return renderGrid(allPhotos.filter(p => p.gh));
  if (filter === 'tp')  return renderGrid(allPhotos.filter(p => p.tp));
}

// ── Lightbox ──────────────────────────────────────────────────
function openLightbox(photo) {
  document.getElementById('lightboxImg').src     = photo.image;
  document.getElementById('lightboxImg').alt     = photo.title;
  document.getElementById('lightboxCaption').textContent = photo.title;
  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.getElementById('lightboxImg').src = '';
  document.body.style.overflow = '';
}

// ── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  // Filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilter(btn.dataset.filter);
    });
  });

  // Lightbox close
  document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
  document.getElementById('lightbox').addEventListener('click', e => {
    if (e.target === document.getElementById('lightbox')) closeLightbox();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeLightbox();
  });

  // Fetch and render
  try {
    allPhotos = await fetchGallery();
    renderGrid(allPhotos);
  } catch (err) {
    console.error('Failed to load gallery:', err);
    document.getElementById('galleryGrid').innerHTML =
      '<p class="loading-msg" style="color:red;">Could not load photos.</p>';
  }
});