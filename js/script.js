/* js/script.js — interactions for the black theme site
   - theme toggle (auto detect + manual)
   - navbar active + burger
   - slideshow (hero auto)
   - reveal on scroll
   - search with history
   - Spotify song loading
   - photos lightbox
   - skills -> GeeksforGeeks
   - notes unit clicks
   - contact form via Formspree (AJAX fallback)
   - page transition fade in
*/

(() => {
  const GFG = {
    html: 'https://www.geeksforgeeks.org/html/',
    css:  'https://www.geeksforgeeks.org/css/',
    c:    'https://www.geeksforgeeks.org/c-programming-language/',
    cpp:  'https://www.geeksforgeeks.org/c-plus-plus/'
  };

  document.addEventListener('DOMContentLoaded', () => {

    /* PAGE TRANSITION: add fade-in to body */
    document.body.style.opacity = 0;
    document.body.style.transition = 'opacity 420ms ease';
    requestAnimationFrame(()=> document.body.style.opacity = 1);

    /* THEME toggle stored (we keep black theme default; still keep toggle for future) */
    const body = document.body;
    const themeToggle = document.querySelector('.theme-toggle');
    function setTheme(t){
      if(t === 'dark'){ body.classList.add('theme-dark'); } else { body.classList.remove('theme-dark'); }
      localStorage.setItem('monsum_theme', t);
      if(themeToggle) themeToggle.textContent = (t === 'dark') ? '☀️' : '🌙';
    }
    const saved = localStorage.getItem('monsum_theme');
    if(saved) setTheme(saved);
    else {
      // default to dark (user requested all black)
      setTheme('dark');
    }
    if(themeToggle){
      themeToggle.addEventListener('click', ()=>{
        const isDark = body.classList.contains('theme-dark');
        setTheme(isDark ? 'light' : 'dark');
      });
    }

    /* NAV active link */
    const current = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(a => {
      if(a.getAttribute('href') === current) a.classList.add('active');
      else a.classList.remove('active');
    });

    /* mobile burger */
    const burger = document.getElementById('burgerBtn');
    const navLinks = document.querySelector('.nav-links');
    if(burger && navLinks){
      burger.addEventListener('click', ()=> {
        const vis = getComputedStyle(navLinks).display;
        navLinks.style.display = (vis === 'none' || navLinks.style.display === 'none') ? 'flex' : 'none';
        navLinks.style.flexDirection = 'column';
        navLinks.style.background = 'linear-gradient(180deg, rgba(255,255,255,0.01), rgba(255,255,255,0.01))';
        navLinks.style.padding = '12px';
        navLinks.style.position = 'absolute';
        navLinks.style.top = '70px';
        navLinks.style.right = '12px';
        navLinks.style.borderRadius = '12px';
      });
    }

    /* HERO slideshow */
    const slides = Array.from(document.querySelectorAll('.slideshow img'));
    if(slides.length){
      let sIdx = 0;
      slides.forEach((s,i)=> i===0 ? s.classList.add('active') : s.classList.remove('active'));
      setInterval(()=> {
        slides[sIdx].classList.remove('active');
        sIdx = (sIdx + 1) % slides.length;
        slides[sIdx].classList.add('active');
      }, 4000);
    }

    /* reveal on scroll */
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal, .card, .photo, .music-card, .unit, .contact-card, .profile img').forEach(el => io.observe(el));

    /* SEARCH with history */
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const historyWrap = document.getElementById('search-history');
    const HIST = 'monsum_search_v_final';
    function loadHistory(){
      if(!historyWrap) return;
      const arr = JSON.parse(localStorage.getItem(HIST) || '[]');
      historyWrap.innerHTML = '';
      arr.slice().reverse().forEach(q => {
        const d = document.createElement('div'); d.className = 'item'; d.textContent = q;
        d.addEventListener('click', ()=> { if(searchInput) searchInput.value = q; runSearch(q); hideHistory(); });
        historyWrap.appendChild(d);
      });
      historyWrap.style.display = arr.length ? 'block' : 'none';
    }
    function saveHistory(q){
      if(!q) return;
      let arr = JSON.parse(localStorage.getItem(HIST) || '[]');
      arr = arr.filter(x => x.toLowerCase() !== q.toLowerCase());
      arr.push(q);
      if(arr.length > 12) arr = arr.slice(arr.length - 12);
      localStorage.setItem(HIST, JSON.stringify(arr));
      loadHistory();
    }
    function hideHistory(){ if(historyWrap) historyWrap.style.display = 'none'; }
    function runSearch(q){
      q = (q||'').trim().toLowerCase();
      if(!q) return;
      saveHistory(q);
      const areas = document.querySelectorAll('.section, .cards, .music-section, .about-section, .notes-section, .contact-section');
      for(const a of areas){
        if(a.innerText.toLowerCase().includes(q)){
          a.scrollIntoView({behavior:'smooth', block:'center'});
          return;
        }
      }
      alert('No matches on this page.');
    }
    if(searchInput){
      searchInput.addEventListener('focus', loadHistory);
      searchInput.addEventListener('keydown', e => { if(e.key === 'Enter') runSearch(searchInput.value); });
    }
    if(searchBtn) searchBtn.addEventListener('click', ()=> runSearch(searchInput.value));

    /* Spotify track loader - set iframe src when clicking song card */
    document.querySelectorAll('.song-card').forEach(card=>{
      card.addEventListener('click', ()=> {
        const track = card.dataset.track;
        const player = document.getElementById('spotifyPlayer');
        if(track && player) player.src = `https://open.spotify.com/embed/track/${track}`;
      });
    });

    /* Photos lightbox */
    const modal = document.createElement('div'); modal.className = 'modal'; modal.innerHTML = '<div class="box"><img id="lightImg" src="" style="max-width:92vw;max-height:80vh;border-radius:10px"/></div>';
    document.body.appendChild(modal);
    modal.addEventListener('click', ()=> modal.classList.remove('open'));
    document.querySelectorAll('.photo img').forEach(img => {
      img.addEventListener('click', ()=> {
        document.getElementById('lightImg').src = img.src;
        modal.classList.add('open');
      });
    });

    /* skill buttons open GeeksforGeeks */
    document.querySelectorAll('.skills button').forEach(b=>{
      const key = b.dataset.skill;
      if(key && GFG[key]) b.addEventListener('click', ()=> window.open(GFG[key], '_blank'));
    });
    window.openSkill = (k) => { if(GFG[k]) window.open(GFG[k], '_blank'); };

    /* notes units click -> open data-link or show hint */
    document.querySelectorAll('.unit').forEach(u=>{
      u.addEventListener('click', ()=> {
        const link = u.dataset.link || '';
        if(link) window.open(link, '_blank');
        else alert('No note linked yet. Upload to Google Drive and paste public link in the unit\'s data-link attribute.');
      });
    });

    /* contact form: prefer Formspree form action (HTML), but add AJAX fallback to stay on page */
    const contactForm = document.getElementById('contactForm');
    if(contactForm){
      contactForm.addEventListener('submit', async (e) => {
        // try AJAX post; if form has action to formspree, use that.
        e.preventDefault();
        const btn = contactForm.querySelector('button[type="submit"]');
        const status = document.getElementById('formStatus');
        if(btn){ btn.disabled = true; btn.textContent = 'Sending...'; }
        if(status) status.textContent = '';
        const action = contactForm.getAttribute('action') || '';
        const fd = new FormData(contactForm);
        fd.append('_captcha', 'false');
        try{
          if(action && action.includes('formspree.io')){
            const res = await fetch(action, { method: 'POST', body: fd });
            if(res.ok){
              // success
              if(document.getElementById('successInline')){
                const s = document.getElementById('successInline');
                s.style.display = 'block'; s.style.opacity = '1';
                setTimeout(()=> { s.style.opacity = '0'; setTimeout(()=> s.style.display = 'none', 400); }, 6000);
              }
              if(document.getElementById('successModal')) document.getElementById('successModal').classList.add('open');
              contactForm.reset();
            } else {
              if(status) status.textContent = 'Could not send message. Try again later.';
            }
          } else {
            // no action: fake success and show inline
            if(document.getElementById('successInline')){
              const s = document.getElementById('successInline');
              s.style.display = 'block'; s.style.opacity = '1';
              setTimeout(()=> { s.style.opacity = '0'; setTimeout(()=> s.style.display = 'none', 400); }, 6000);
            }
            contactForm.reset();
          }
        } catch(err){
          if(status) status.textContent = 'Network error. Try again.';
        } finally {
          if(btn){ btn.disabled = false; btn.textContent = 'Send Message'; }
        }
      });
    }

    /* accessibility: escape closes modals */
    document.addEventListener('keydown', (e)=> {
      if(e.key === 'Escape') document.querySelectorAll('.modal.open').forEach(m => m.classList.remove('open'));
    });

  }); // DOMContentLoaded
})();
