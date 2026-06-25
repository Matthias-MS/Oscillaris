(() => {
  const fields = ['title', 'subtitle', 'tagline', 'description', 'year', 'location', 'materials'];

  async function loadContent() {
    const res = await fetch('/api/content');
    const c = await res.json();
    fields.forEach(f => {
      const el = document.getElementById('f-' + f);
      if (el) el.value = c[f] || '';
    });
    renderImages(c.images || []);
  }

  // save text
  document.getElementById('save-text').addEventListener('click', async () => {
    const body = {};
    fields.forEach(f => {
      const el = document.getElementById('f-' + f);
      if (el) body[f] = el.value;
    });
    await fetch('/api/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const msg = document.getElementById('text-msg');
    msg.textContent = 'gespeichert ✓';
    setTimeout(() => msg.textContent = '', 2000);
  });

  // image grid
  function renderImages(images) {
    const grid = document.getElementById('image-grid');
    grid.innerHTML = '';
    images.forEach(img => {
      const div = document.createElement('div');
      div.className = 'thumb';
      div.innerHTML = `
        <img src="${img.url}" alt="">
        <button data-fn="${img.filename}">✕ löschen</button>
      `;
      div.querySelector('button').addEventListener('click', () => deleteImage(img.filename));
      grid.appendChild(div);
    });
  }

  async function deleteImage(filename) {
    if (!confirm('Bild löschen?')) return;
    await fetch(`/api/image/${filename}`, { method: 'DELETE' });
    loadContent();
  }

  // upload
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const progress = document.getElementById('upload-progress');

  dropZone.addEventListener('click', () => fileInput.click());
  dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('over'); });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('over'));
  dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.classList.remove('over');
    uploadFiles(e.dataTransfer.files);
  });
  fileInput.addEventListener('change', () => uploadFiles(fileInput.files));

  async function uploadFiles(files) {
    if (!files || files.length === 0) return;
    progress.textContent = `Lade hoch… 0 / ${files.length}`;
    const fd = new FormData();
    Array.from(files).forEach(f => fd.append('images', f));
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const data = await res.json();
    progress.textContent = `${data.files.length} Bild(er) hochgeladen ✓`;
    setTimeout(() => progress.textContent = '', 3000);
    loadContent();
  }

  loadContent();
})();
