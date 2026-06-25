(() => {
  async function init() {
    const res = await fetch('/api/content');
    const c = await res.json();

    document.getElementById('title').textContent = c.title || 'Oscillaris';
    document.getElementById('subtitle').textContent = c.subtitle || '';
    document.getElementById('tagline').textContent = c.tagline || '';
    document.getElementById('description').textContent = c.description || '';
    document.getElementById('year').textContent = c.year || '';
    document.getElementById('location').textContent = c.location || '';
    document.getElementById('materials').textContent = c.materials || '';
    document.title = (c.title || 'Oscillaris') + ' — mntg';

    // gallery
    const gallery = document.getElementById('gallery');
    if (c.images && c.images.length > 0) {
      c.images.forEach((img, i) => {
        const div = document.createElement('div');
        div.className = 'gallery-item';
        div.innerHTML = `<img src="${img.url}" alt="Oscillaris ${i+1}" loading="lazy">`;
        div.addEventListener('click', () => openLightbox(img.url));
        gallery.appendChild(div);
      });
    }
  }

  // lightbox
  let lightbox;
  function openLightbox(src) {
    if (!lightbox) {
      lightbox = document.createElement('div');
      lightbox.className = 'lightbox';
      lightbox.innerHTML = `
        <button class="lightbox-close">Schließen</button>
        <img id="lb-img" src="" alt="">
      `;
      lightbox.querySelector('.lightbox-close').addEventListener('click', () => {
        lightbox.classList.remove('open');
      });
      lightbox.addEventListener('click', e => {
        if (e.target === lightbox) lightbox.classList.remove('open');
      });
      document.body.appendChild(lightbox);
    }
    lightbox.querySelector('#lb-img').src = src;
    lightbox.classList.add('open');
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && lightbox) lightbox.classList.remove('open');
  });

  init();
})();
