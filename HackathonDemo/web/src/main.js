import './style.css';

const API_URL = 'http://localhost:5050';

const app = document.querySelector('#app');
app.innerHTML = `
  <main class="shell">
    <nav class="nav"><div class="brand"><span class="brand-mark">PNC</span><span>PNC Bank</span></div><span class="nav-status"><i></i> Banking workspace</span></nav>
    <section class="hero"><div><p class="eyebrow">PNC BANKING</p><h1>Know your banking<br><em>at a glance.</em></h1><p class="lede">Manage your services, accounts, and everyday banking in one secure place.</p><button id="check-api">Check banking connection <span>→</span></button></div><div class="hero-card"><div class="orb"></div><p>BANKING STATUS<br><strong>All systems</strong></p><div class="score">98<span>%</span></div><small>All services are operational</small></div></section>
    <section class="grid"><article class="panel"><div class="panel-head"><div><p class="label">OVERVIEW</p><h2>Banking overview</h2></div><span class="tag">LIVE</span></div><div class="metrics"><div><strong>98%</strong><span>Services online</span></div><div><strong>12</strong><span>Active services</span></div><div><strong>0</strong><span>Service alerts</span></div></div><div id="api-result" class="api-result">Ready to connect to banking services.</div></article><article class="panel accent"><p class="label">NEXT STEP</p><h2>Explore your services<br>to get started.</h2><p>Access loans, statements, cards, customer details, and more.</p><button class="outline">Open services <span>↗</span></button></article></section>
    <footer>PNC Bank <span>•</span> Banking made simple</footer>
  </main>`;

document.querySelector('#check-api').addEventListener('click', async () => {
  const result = document.querySelector('#api-result');
  result.textContent = 'Checking API…';
  try {
    const response = await fetch(`${API_URL}/api/health`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    result.textContent = `${data.service} is healthy.`;
    result.classList.add('success');
  } catch (error) {
    result.textContent = `API unavailable: ${error.message}`;
    result.classList.remove('success');
  }
});
