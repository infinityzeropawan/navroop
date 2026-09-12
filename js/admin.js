/* =============================================
   NavRoop — Admin Panel JavaScript
   ============================================= */

// ═══ INDEXEDDB ═══
const IDB = { name: 'NavRoop_Media', ver: 2, store: 'media' };

function openDB() {
  return new Promise((res, rej) => {
    const r = indexedDB.open(IDB.name, IDB.ver);
    r.onupgradeneeded = e => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(IDB.store)) {
        db.createObjectStore(IDB.store, { keyPath: 'id' });
      }
    };
    r.onsuccess = e => res(e.target.result);
    r.onerror = e => rej(e);
  });
}

async function getAllMedia() {
  try {
    const db = await openDB();
    return new Promise(res => {
      const tx = db.transaction(IDB.store, 'readonly');
      const req = tx.objectStore(IDB.store).getAll();
      req.onsuccess = () => res(req.result || []);
      req.onerror = () => res([]);
    });
  } catch { return []; }
}

async function saveMedia(item) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(IDB.store, 'readwrite');
    tx.objectStore(IDB.store).put(item);
    tx.oncomplete = res;
    tx.onerror = rej;
  });
}

async function deleteMedia(id) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(IDB.store, 'readwrite');
    tx.objectStore(IDB.store).delete(id);
    tx.oncomplete = res;
    tx.onerror = rej;
  });
}

async function clearAllMedia() {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(IDB.store, 'readwrite');
    tx.objectStore(IDB.store).clear();
    tx.oncomplete = res;
    tx.onerror = rej;
  });
}

async function updateMedia(id, updates) {
  const all = await getAllMedia();
  const item = all.find(x => x.id === id);
  if (item) { Object.assign(item, updates); await saveMedia(item); }
}

// ═══ AUTH ═══
const PASS = 'navroop2024';

function checkLogin() {
  if (sessionStorage.getItem('nr_auth') === 'yes') {
    document.getElementById('loginScreen').classList.add('hide');
    document.getElementById('app').classList.remove('hide');
    refreshStats();
  }
}

document.getElementById('loginBtn').addEventListener('click', doLogin);
document.getElementById('passInput').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });

function doLogin() {
  const v = document.getElementById('passInput').value;
  if (v === PASS) {
    sessionStorage.setItem('nr_auth', 'yes');
    document.getElementById('loginScreen').classList.add('hide');
    document.getElementById('app').classList.remove('hide');
    refreshStats();
    toast('Welcome back! Admin panel ready.', 'success');
  } else {
    const err = document.getElementById('loginErr');
    err.style.display = 'block';
    document.getElementById('passInput').value = '';
    document.getElementById('passInput').focus();
    setTimeout(() => err.style.display = 'none', 3000);
  }
}

function logout() { sessionStorage.removeItem('nr_auth'); location.reload(); }

checkLogin();

// ═══ TOAST ═══
function toast(msg, type = '') {
  const wrap = document.getElementById('toastWrap');
  const t = document.createElement('div');
  t.className = 'toast ' + (type || '');
  t.innerHTML = (type === 'success' ? '✓ ' : type === 'error' ? '✗ ' : '') + msg;
  wrap.appendChild(t);
  setTimeout(() => {
    t.style.animation = 'toastout .4s ease forwards';
    setTimeout(() => t.remove(), 400);
  }, 3000);
}

// ═══ NAVIGATION ═══
function showSection(name) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById('sec-' + name).classList.add('active');
  document.querySelectorAll('.sb-nav a').forEach(a => {
    a.classList.remove('active');
    if (a.dataset.section === name) a.classList.add('active');
  });
  if (name === 'library') renderLibrary();
}

// ═══ UPLOAD ═══
let pendingFiles = [];

const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const previewGrid = document.getElementById('previewGrid');
const uploadForm = document.getElementById('uploadForm');

fileInput.addEventListener('change', e => addFiles([...e.target.files]));
dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag'));
dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('drag');
  addFiles([...e.dataTransfer.files]);
});

function addFiles(files) {
  const valid = files.filter(f => f.type.startsWith('image/') || f.type.startsWith('video/'));
  if (!valid.length) { toast('Please select image or video files only.', 'error'); return; }
  pendingFiles.push(...valid);
  renderPreviews();
  uploadForm.classList.add('show');
  document.getElementById('uploadAllBtn').style.display = 'flex';
  document.getElementById('fileCountLabel').textContent =
    '(' + pendingFiles.length + ' file' + (pendingFiles.length > 1 ? 's' : '') + ' ready)';
  toast(valid.length + ' file' + (valid.length > 1 ? 's' : '') + ' added — click Save to upload.', 'success');
}

function renderPreviews() {
  previewGrid.innerHTML = '';
  pendingFiles.forEach((f, i) => {
    const div = document.createElement('div');
    div.className = 'preview-item';
    const type = f.type.startsWith('video/') ? 'video' : 'image';
    if (type === 'video') {
      const v = document.createElement('video');
      v.src = URL.createObjectURL(f); v.muted = true;
      v.style.cssText = 'width:100%;height:100%;object-fit:cover';
      div.appendChild(v);
    } else {
      const img = document.createElement('img');
      img.src = URL.createObjectURL(f);
      div.appendChild(img);
    }
    const badge = document.createElement('div');
    badge.className = 'preview-type';
    badge.textContent = type === 'video' ? 'VIDEO' : 'IMAGE';
    const rm = document.createElement('button');
    rm.className = 'preview-remove'; rm.innerHTML = '&#215;';
    rm.onclick = () => {
      pendingFiles.splice(i, 1); renderPreviews();
      if (!pendingFiles.length) {
        uploadForm.classList.remove('show');
        document.getElementById('uploadAllBtn').style.display = 'none';
      }
    };
    div.appendChild(badge); div.appendChild(rm);
    previewGrid.appendChild(div);
  });
}

async function uploadAll() {
  if (!pendingFiles.length) { toast('No files to upload.', 'error'); return; }
  const cat = document.getElementById('newCat').value;
  const titlePfx = document.getElementById('newTitle').value.trim();
  const prog = document.getElementById('progressWrap');
  const bar = document.getElementById('progressBar');
  prog.classList.add('show');
  let done = 0;
  const allItems = await getAllMedia();
  const baseOrder = allItems.length;

  for (const f of pendingFiles) {
    const id = 'nr_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    const type = f.type.startsWith('video/') ? 'video' : 'image';
    await saveMedia({
      id, type, blob: f, name: f.name,
      title: titlePfx || f.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
      category: cat, order: baseOrder + done, size: f.size, createdAt: Date.now()
    });
    done++;
    bar.style.width = ((done / pendingFiles.length) * 100) + '%';
  }

  setTimeout(() => { prog.classList.remove('show'); bar.style.width = '0'; }, 600);
  toast(done + ' item' + (done > 1 ? 's' : '') + ' saved to gallery!', 'success');
  pendingFiles = []; previewGrid.innerHTML = '';
  uploadForm.classList.remove('show');
  document.getElementById('uploadAllBtn').style.display = 'none';
  document.getElementById('newTitle').value = '';
  fileInput.value = '';
  await refreshStats();
}

// ═══ STATS ═══
async function refreshStats() {
  const items = await getAllMedia();
  const imgs = items.filter(i => i.type === 'image').length;
  const vids = items.filter(i => i.type === 'video').length;
  const sz = items.reduce((a, i) => a + (i.size || 0), 0);
  document.getElementById('sc-total').textContent = items.length;
  document.getElementById('sc-img').textContent = imgs;
  document.getElementById('sc-vid').textContent = vids;
  document.getElementById('sc-size').textContent = (sz / (1024 * 1024)).toFixed(1) + ' MB';
  document.getElementById('sbTotal').textContent = items.length;
  document.getElementById('sbImgs').textContent = imgs;
  document.getElementById('sbVids').textContent = vids;
}

// ═══ LIBRARY ═══
let allMedia = [], currentFilter = 'all', searchQuery = '';

async function renderLibrary() {
  allMedia = await getAllMedia();
  allMedia.sort((a, b) => (a.order || 0) - (b.order || 0));
  renderFiltered();
  await refreshStats();
}

function renderFiltered() {
  let items = allMedia;
  if (currentFilter !== 'all') {
    if (currentFilter === 'image' || currentFilter === 'video') {
      items = items.filter(i => i.type === currentFilter);
    } else {
      items = items.filter(i => i.category === currentFilter);
    }
  }
  if (searchQuery) {
    items = items.filter(i =>
      (i.title || '').toLowerCase().includes(searchQuery) ||
      (i.category || '').toLowerCase().includes(searchQuery)
    );
  }
  const grid = document.getElementById('mediaGrid');
  if (!items.length) {
    grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><span class="big-icon">🖼️</span><h3>No media found</h3><p>Try a different filter or upload some content.</p></div>';
    return;
  }
  grid.innerHTML = '';
  items.forEach(item => {
    const url = URL.createObjectURL(item.blob);
    const card = document.createElement('div');
    card.className = 'media-card';
    const szMB = ((item.size || 0) / (1024 * 1024)).toFixed(2);
    card.innerHTML = `
      <div class="media-thumb">
        ${item.type === 'video'
          ? `<video src="${url}" muted loop preload="metadata" onmouseenter="this.play()" onmouseleave="this.pause()"></video>
             <div class="media-type-badge badge-vid">🎬 VIDEO</div>`
          : `<img src="${url}" alt="${item.title || 'NavRoop Interior'}" loading="lazy">
             <div class="media-type-badge badge-img">📷 IMAGE</div>`}
      </div>
      <div class="media-info">
        <div class="media-title">${item.title || 'Untitled'}</div>
        <div class="media-cat">${item.category || 'Interior'}</div>
        <div class="media-size">${szMB} MB &nbsp;|&nbsp; Order: ${item.order || 0}</div>
        <div class="media-actions">
          <button class="btn-edit" onclick="openEdit('${item.id}')">✏️ Edit</button>
          <button class="btn-del" onclick="confirmDelete('${item.id}')">🗑️ Delete</button>
        </div>
      </div>`;
    grid.appendChild(card);
  });
}

function filterMedia(filter, btn) {
  currentFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderFiltered();
}

function searchMedia(q) { searchQuery = q.toLowerCase(); renderFiltered(); }

// ═══ DELETE ═══
let deleteId = null;

function confirmDelete(id) {
  deleteId = id;
  document.getElementById('confirmBg').classList.add('open');
}

document.getElementById('confirmNo').addEventListener('click', () => {
  document.getElementById('confirmBg').classList.remove('open');
  deleteId = null;
});

document.getElementById('confirmYes').addEventListener('click', async () => {
  if (!deleteId) return;
  await deleteMedia(deleteId);
  document.getElementById('confirmBg').classList.remove('open');
  toast('Media deleted.', 'success');
  deleteId = null;
  await renderLibrary();
});

function deleteAll() {
  if (!confirm('Delete ALL media? This cannot be undone.')) return;
  clearAllMedia().then(() => { toast('All media cleared.', 'success'); renderLibrary(); });
}

// ═══ EDIT ═══
let editId = null;

function openEdit(id) {
  const item = allMedia.find(i => i.id === id);
  if (!item) return;
  editId = id;
  document.getElementById('editTitle').value = item.title || '';
  document.getElementById('editCat').value = item.category || 'Interior';
  document.getElementById('editOrder').value = item.order || 0;
  document.getElementById('editDesc').value = item.description || '';
  document.getElementById('editModal').classList.add('open');
}

document.getElementById('editClose').addEventListener('click', () => {
  document.getElementById('editModal').classList.remove('open'); editId = null;
});
document.getElementById('editCancel').addEventListener('click', () => {
  document.getElementById('editModal').classList.remove('open'); editId = null;
});
document.getElementById('editSave').addEventListener('click', async () => {
  if (!editId) return;
  await updateMedia(editId, {
    title: document.getElementById('editTitle').value.trim(),
    category: document.getElementById('editCat').value,
    order: +document.getElementById('editOrder').value || 0,
    description: document.getElementById('editDesc').value.trim()
  });
  document.getElementById('editModal').classList.remove('open');
  editId = null;
  toast('Media updated!', 'success');
  await renderLibrary();
});
