// ------------------------------
// Small helpers
// ------------------------------
const $ = (sel) => document.querySelector(sel);
const fmt = (v) => (v ?? v === 0) ? String(v) : '—';
const safeEmojiBool = (v) => {
  // Normalize in_control (boolean | emoji | string)
  if (typeof v === 'boolean') return v;
  if (typeof v === 'string') {
    const t = v.trim();
    if (['✅','✔️','🟢','true','ok','yes','y'].includes(t.toLowerCase())) return true;
    if (['❌','⛔','🔴','false','no','n','😭'].includes(t.toLowerCase())) return false;
  }
  return null;
};

// Compute percentage from steps array and steps_total
function computePercent(steps, stepsTotal){
  const totalCount = Array.isArray(steps) ? steps.reduce((acc, s) => acc + (Number(s.count) || 0), 0) : 0;
  if (typeof stepsTotal === 'number' && stepsTotal > 0) {
    return Math.max(0, Math.min(100, Math.round((totalCount / stepsTotal) * 100)));
  }
  // Fallback: assume each step target weight=1
  const denom = (Array.isArray(steps) && steps.length) ? steps.length : 1;
  return Math.max(0, Math.min(100, Math.round((totalCount / denom) * 100)));
}

// Badge for rating/status
function badge(text){
  const span = document.createElement('span');
  span.className = 'tag';
  span.textContent = text;
  return span;
}

// ------------------------------
// Latest signal + archive
// ------------------------------
async function loadSignalData() {
  const container = $('#signal-container');
  try {
    const resp = await fetch('./signals/latest.json');
    if (!resp.ok) throw new Error('Signal data not available');
    const signal = await resp.json();
    container.innerHTML = '';
    const card = document.createElement('div');
    card.className = 'card';

    const h3 = document.createElement('h3');
    h3.textContent = `${signal.emoji || '💪'} ${signal.title || 'Latest Signal'}`;
    card.appendChild(h3);

    const p1 = document.createElement('p');
    p1.innerHTML = `<strong>Summary:</strong> ${fmt(signal.summary)}`;
    card.appendChild(p1);

    const p2 = document.createElement('p');
    const ts = signal.ts_utc ? new Date(signal.ts_utc).toLocaleString() : '';
    p2.innerHTML = `<strong>Broadcast Time:</strong> ${fmt(ts)}`;
    card.appendChild(p2);

    const p3 = document.createElement('p');
    const rating = (signal.rating || '').toLowerCase();
    p3.innerHTML = `<strong>Rating:</strong> `;
    p3.appendChild(badge(signal.rating || 'normal'));
    card.appendChild(p3);

    if (Array.isArray(signal.tags) && signal.tags.length){
      const p4 = document.createElement('p');
      p4.innerHTML = `<strong>Tags:</strong> ` + signal.tags.map(t => `<span class="tag">${t}</span>`).join(' ');
      card.appendChild(p4);
    }
    if (signal.payload && signal.payload.notes){
      const det = document.createElement('details');
      const sum = document.createElement('summary'); sum.textContent = '📋 Additional Notes';
      det.appendChild(sum);
      const pre = document.createElement('div'); pre.className='card'; pre.style.padding='.5rem'; pre.textContent = signal.payload.notes;
      det.appendChild(pre);
      card.appendChild(det);
    }

    container.appendChild(card);
  } catch (err) {
    container.innerHTML = '<p class="center-muted"><em>Signal data not yet available. Generate signals/latest.json to see broadcast information.</em></p>';
  }
}

// Archive toggle
const archiveToggle = $('#archive-toggle');
const archiveContainer = $('#archive-container');
let archiveLoaded = false;
archiveToggle?.addEventListener('click', async () => {
  const expanded = archiveToggle.getAttribute('aria-expanded') === 'true';
  if (expanded){
    archiveContainer.classList.add('hidden');
    archiveToggle.textContent = 'Show archive';
    archiveToggle.setAttribute('aria-expanded','false');
    return;
  }
  archiveContainer.classList.remove('hidden');
  archiveToggle.textContent = 'Hide archive';
  archiveToggle.setAttribute('aria-expanded','true');
  if (archiveLoaded) return;
  archiveContainer.innerHTML = '<p class="center-muted"><em>Loading archive...</em></p>';
  try{
    const resp = await fetch('./signals/archive.latest.json');
    if(!resp.ok) throw new Error('Archive not available');
    const entries = await resp.json();
    if(!Array.isArray(entries) || entries.length===0){
      archiveContainer.innerHTML = '<p class="center-muted"><em>No archived signals found.</em></p>';
      archiveLoaded = true; return;
    }
    const list = document.createElement('div');
    list.className = 'cols';
    entries.forEach(item => {
      const card = document.createElement('div');
      card.className = 'card';
      const h4 = document.createElement('h4');
      h4.textContent = `${(item.origin && item.origin.emoji) ? item.origin.emoji+' ' : ''}${item.title || item.id}`;
      const meta = document.createElement('div');
      meta.className = 'meta';
      const ts = item.ts_utc ? new Date(item.ts_utc).toLocaleString() : (item.date || '');
      meta.textContent = `${ts} — ${item.rating || 'normal'}`;
      const p = document.createElement('p'); p.textContent = item.summary || '';
      const det = document.createElement('details');
      const sum = document.createElement('summary'); sum.textContent = 'More';
      const pre = document.createElement('pre');
      pre.style.whiteSpace='pre-wrap'; pre.textContent = JSON.stringify(item.payload || {}, null, 2);
      det.append(sum, pre);
      card.append(h4, meta, p, det);
      list.appendChild(card);
    });
    archiveContainer.innerHTML = ''; archiveContainer.appendChild(list); archiveLoaded = true;
  }catch(err){
    archiveContainer.innerHTML = `<p style="color:#b00;"><em>Unable to load archive: ${err.message}</em></p>`;
  }
});

// ------------------------------
// README toggle (footer)
// ------------------------------
const readmeToggle = $('#readme-toggle');
const readmeContainer = $('#readme-container');
async function loadReadme(){
  try{
    const resp = await fetch('./README.md');
    if(!resp.ok) throw new Error('README not available');
    let md = await resp.text();
    let html = md;
    if (window.marked && typeof window.marked.parse === 'function') html = marked.parse(md);
    if (window.DOMPurify && typeof DOMPurify.sanitize === 'function') html = DOMPurify.sanitize(html);
    else html = '<pre>' + html.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</pre>';
    readmeContainer.innerHTML = html;
  }catch(err){
    readmeContainer.innerHTML = `<p style="color:#b00;"><em>Unable to load README: ${err.message}</em></p>`;
  }
}
readmeToggle?.addEventListener('click', async () => {
  const expanded = readmeToggle.getAttribute('aria-expanded') === 'true';
  if (expanded){
    readmeContainer.classList.add('hidden');
    readmeToggle.textContent = 'Show README';
    readmeToggle.setAttribute('aria-expanded','false');
    return;
  }
  readmeContainer.classList.remove('hidden');
  readmeToggle.textContent = 'Hide README';
  readmeToggle.setAttribute('aria-expanded','true');
  if (!readmeContainer.dataset.loaded){ await loadReadme(); readmeContainer.dataset.loaded = '1'; }
});

// ------------------------------
// Workflow Progress (robust JSON renderer)
// ------------------------------
const progressToggle = $('#progress-toggle');
const progressContainer = $('#progress-container');
let progressLoaded = false;

progressToggle?.addEventListener('click', async () => {
  const expanded = progressToggle.getAttribute('aria-expanded') === 'true';
  if (expanded){
    progressContainer.classList.add('hidden');
    progressToggle.textContent = 'Show progress';
    progressToggle.setAttribute('aria-expanded','false');
    return;
  }
  progressContainer.classList.remove('hidden');
  progressToggle.textContent = 'Hide progress';
  progressToggle.setAttribute('aria-expanded','true');
  if (progressLoaded) return;
  await renderWorkflowProgress();
  progressLoaded = true;
});

async function renderWorkflowProgress(){
  progressContainer.innerHTML = '<p class="center-muted"><em>Loading progress...</em></p>';
  try{
    // NOTE: fetch the json from project root, not /signals/
    const resp = await fetch('./signals/funnel_progress.json');
    if (!resp.ok) throw new Error('Progress data not available');
    const doc = await resp.json();

    const skills = Array.isArray(doc.skills) ? doc.skills : [];
    if (skills.length === 0){
      progressContainer.innerHTML = '<p class="center-muted"><em>No progress data found.</em></p>';
      return;
    }

    // Outer column per skill
    const outer = document.createElement('div');
    outer.style.display='grid'; outer.style.gap='1rem';

    skills.forEach(skill => {
      const skillWrap = document.createElement('div');
      const header = document.createElement('div');
      header.style.display='flex'; header.style.justifyContent='space-between'; header.style.alignItems='baseline';

      const h3 = document.createElement('h3');
      h3.textContent = skill.skill_track_name || skill.skill_track_code || 'Skill';
      header.appendChild(h3);

      const right = document.createElement('div');
      right.className='meta';
      const status = (skill.skill_status || '').trim();
      if (status) right.appendChild(badge(status));
      if (skill.skill_track_last_update_date){
        const span = document.createElement('span');
        span.className='meta'; span.style.marginLeft='.5rem';
        span.textContent = `Updated: ${skill.skill_track_last_update_date}`;
        right.appendChild(span);
      }
      header.appendChild(right);

      const grid = document.createElement('div');
      grid.className='cols';

      const coachings = skill.coachings || {};
      Object.keys(coachings).forEach(cid => {
        const t = coachings[cid] || {};
        const card = document.createElement('div');
        card.className='card';

        const title = document.createElement('h4');
        title.textContent = t.title || cid;
        card.appendChild(title);

        const meta = document.createElement('div');
        meta.className='meta';
        const ic = safeEmojiBool(t.in_control);
        const icText = (ic === null) ? fmt(t.in_control) : (ic ? 'in control' : 'out of control');
        meta.textContent = `Target: ${fmt(t.steps_target)} / day · Metric: ${fmt(t.steps_metric)} · ${icText}`;
        card.appendChild(meta);

        const last = document.createElement('div');
        last.className='meta'; last.style.margin = '.25rem 0 .5rem';
        last.textContent = `Last: ${fmt(t.last_activity)}`;
        card.appendChild(last);

        // Progress bar
        const percent = computePercent(t.steps, Number(t.steps_total));
        const barOuter = document.createElement('div'); barOuter.className='progress-outer';
        const barInner = document.createElement('div'); barInner.className='progress-inner'; barInner.style.width = percent + '%'; barInner.setAttribute('aria-valuenow', String(percent));
        barInner.setAttribute('role','progressbar');
        barOuter.appendChild(barInner);
        card.appendChild(barOuter);

        // Steps list
        if (Array.isArray(t.steps) && t.steps.length){
          const ul = document.createElement('ul'); ul.className='steps';
          t.steps.forEach(s => {
            const li = document.createElement('li'); li.className='step';
            const left = document.createElement('div'); left.className='step-left';

            const done = (s.status === '✅') || (!!s.count && Number(s.count) > 0);
            const symbol = document.createElement('span'); symbol.textContent = done ? '✅' : '❌';
            const block = document.createElement('div');
            const title = document.createElement('div'); title.className='step-title'; title.textContent = s.title || s.id;
            const sub = document.createElement('div'); sub.className='step-sub';
            const bits = [];
            if (s.last_activity) bits.push(`Last: ${s.last_activity}`);
            if (s.count !== undefined) bits.push(String(s.count));
            sub.textContent = bits.join(' · ');

            block.append(title, sub);
            left.append(symbol, block);
            li.appendChild(left);
            ul.appendChild(li);
          });
          card.appendChild(ul);
        }

        grid.appendChild(card);
      });

      skillWrap.append(header, grid);
      outer.appendChild(skillWrap);
    });

    progressContainer.innerHTML='';
    progressContainer.appendChild(outer);
  }catch(err){
    progressContainer.innerHTML = `<p style="color:#b00;"><em>Unable to load progress: ${err.message}</em></p>`;
  }
}

// ------------------------------
// Initial boot
// ------------------------------
loadSignalData();
