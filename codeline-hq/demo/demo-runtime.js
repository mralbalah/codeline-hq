/*
 * CodeLine HQ: demo runtime
 * ---------------------------------------------------------------
 * In production, CodeLine HQ runs inside a host that provides
 * `window.claude.use('db' | 'mcp' | 'downloads')`: a realtime cloud
 * database, Google Sheets/Drive connectors and file downloads.
 *
 * This file stands in for that host so the dashboard runs on any static
 * server (or GitHub Pages) with sample data:
 *   - db        → a small Firestore-style API backed by localStorage
 *                 (collection/doc, add/set/update/delete, onSnapshot,
 *                  orderBy/limit)
 *   - downloads → saves files through a normal browser download
 *   - mcp       → not available in the demo (the Website tab explains this)
 *
 * All data below is fictional.
 */
(function () {
  'use strict';
  if (window.claude && window.claude.use) return; // real host present

  var KEY = 'codeline-hq-demo-v1';
  var listeners = []; // {kind:'col'|'doc', col, id, opts, cb}

  /* ---------- storage ---------- */
  function load() {
    try { var raw = localStorage.getItem(KEY); if (raw) return JSON.parse(raw); } catch (e) {}
    return null;
  }
  function persist() { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {} }
  function uid() { return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4); }

  /* ---------- sample data ---------- */
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function day(offset) { var d = new Date(); d.setDate(d.getDate() + offset); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function stamp(offset) { return day(offset) + 'T09:00:00.000Z'; }

  function seed() {
    var s = { leads: {}, projects: {}, payments: {}, content: {}, requests: {}, checklist: {}, invoices: {}, letters: {}, outreach: {}, settings: {} };
    function put(col, obj, id) { id = id || uid(); s[col][id] = obj; return id; }

    put('leads', { name: 'Lina Haddad', business: 'Olive & Oak Café', contact: '@oliveandoak', channel: 'Instagram DM', type: 'Local business', status: 'Call booked', package: 'Digital ID', value: 590, nextFollowUp: day(1), lastContact: day(-2), created: stamp(-9), notes: 'Needs menu website + Google profile. Call Thursday.' });
    put('leads', { name: 'Omar Saleh', business: 'Saleh Fitness', contact: 'omar@example.com', channel: 'Email', type: 'Coach / consultant', status: 'Proposal sent', package: 'Brand Launch', value: 1990, nextFollowUp: day(0), lastContact: day(-3), created: stamp(-14), notes: 'Sent proposal PDF. Follow up on timeline.' });
    put('leads', { name: 'Maya Chen', business: 'Bloom Studio', contact: '@bloom.studio', channel: 'Referral', type: 'Creative / freelancer', status: 'Contacted', package: 'Portfolio', value: 850, nextFollowUp: day(-1), lastContact: day(-5), created: stamp(-6), notes: 'Photographer, wants portfolio + booking form.' });
    put('leads', { name: 'Daniel Ross', business: 'Ross Roofing', contact: '+1 555 0142', channel: 'WhatsApp', type: 'Local business', status: 'New', package: 'Not sure yet', value: 0, nextFollowUp: day(2), created: stamp(-1), notes: 'Free website review requested.' });
    put('leads', { name: 'Sara Nasser', business: 'Nasser Legal', contact: 'LinkedIn', channel: 'LinkedIn', type: 'Startup', status: 'Replied', package: 'Brand Launch', value: 1990, nextFollowUp: day(3), lastContact: day(-1), created: stamp(-4) });
    var wonLead = put('leads', { name: 'Ahmed Karim', business: 'Karim Motors', contact: '@karimmotors', channel: 'Website form', type: 'Local business', status: 'Won', package: 'Brand Launch', value: 1990, created: stamp(-30) });
    put('leads', { name: 'Tom Becker', business: 'Becker Bikes', contact: 'tom@example.com', channel: 'Email', type: 'Local business', status: 'Lost', package: 'Digital ID', value: 590, created: stamp(-40), notes: 'Went with a cheaper template.' });

    var p1 = put('projects', { client: 'Karim Motors', package: 'Brand Launch', price: 1990, founding: true, stage: 'Build', approval: 'Waiting for client', start: day(-20), deadline: day(15), revisionsUsed: 1, leadId: wonLead, created: stamp(-20), updated: stamp(-1), notes: 'Logo approved. Building 5-page site + booking form.' });
    var p2 = put('projects', { client: 'Greenleaf Dental', package: 'Digital ID', price: 590, founding: true, stage: 'Launch', approval: 'Approved', start: day(-12), deadline: day(2), revisionsUsed: 0, created: stamp(-12), updated: stamp(-1) });
    var p3 = put('projects', { client: 'Nova Yoga', package: 'Portfolio', price: 850, founding: false, stage: 'Done', approval: 'Approved', start: day(-45), deadline: day(-20), revisionsUsed: 2, created: stamp(-45), updated: stamp(-20) });
    var p4 = put('projects', { client: 'Atlas Coffee Roasters', package: 'Monthly social content', price: 249, founding: false, stage: 'Design', approval: 'Not sent yet', start: day(-3), deadline: day(25), revisionsUsed: 0, created: stamp(-3), updated: stamp(-3) });

    put('payments', { projectId: p1, label: 'Brand Launch · deposit 50%', amount: 796, due: day(-20), paidOn: day(-19), method: 'Wise', created: stamp(-20) });
    put('payments', { projectId: p1, label: 'Brand Launch · final 50%', amount: 796, due: day(15), paidOn: '', created: stamp(-20) });
    put('payments', { projectId: p2, label: 'Digital ID · deposit 50%', amount: 236, due: day(-12), paidOn: day(-12), method: 'PayPal', created: stamp(-12) });
    put('payments', { projectId: p2, label: 'Digital ID · final 50%', amount: 236, due: day(-1), paidOn: '', created: stamp(-12) });
    put('payments', { projectId: p3, label: 'Portfolio · full payment', amount: 850, due: day(-45), paidOn: day(-44), method: 'Bank transfer', created: stamp(-45) });
    put('payments', { projectId: p4, label: 'Monthly social content · first month', amount: 249, due: day(4), paidOn: '', created: stamp(-3) });

    put('content', { date: day(0), format: 'Carousel', hook: '5 signs your website is losing clients', caption: 'Swipe to see if your site is quietly costing you customers.', hashtags: '#webdesign #smallbusiness', status: 'Scheduled' });
    put('content', { date: day(2), format: 'Reel', hook: 'What does a website cost in 2026?', status: 'Designed' });
    put('content', { date: day(4), format: 'Post', hook: 'Client launch: Greenleaf Dental', status: 'Planned' });
    put('content', { date: day(7), format: 'Story', hook: 'Free website review: 3 spots this week', status: 'Idea' });
    put('content', { date: day(-3), format: 'Carousel', hook: 'How a project runs in 5 steps', status: 'Posted' });

    put('requests', { text: 'Add a case-study page for Karim Motors', status: 'Open', created: stamp(-2) });
    put('requests', { text: 'Update package prices for 2026', status: 'Done', created: stamp(-8) });
    put('checklist', { text: 'Set up Google Analytics', done: true, order: 1 });
    put('checklist', { text: 'Submit sitemap to Google Search Console', done: true, order: 2 });
    put('checklist', { text: 'Connect custom domain', done: false, order: 3 });

    put('invoices', { number: 'CL-2026-001', billName: 'Nova Yoga', projectId: p3, projectLabel: 'Nova Yoga · Portfolio', issue: day(-45), due: day(-38), status: 'Paid', items: [{ desc: 'Portfolio website', qty: 1, rate: 850 }], discount: 0, taxRate: 0, paid: 850, total: 850, amountDue: 0, created: stamp(-45) });
    put('invoices', { number: 'CL-2026-002', billName: 'Karim Motors', projectId: p1, projectLabel: 'Karim Motors · Brand Launch', issue: day(-20), due: day(15), status: 'Sent', items: [{ desc: 'Brand Launch package', qty: 1, rate: 1990 }], discount: 398, discountLabel: 'Founding client −20%', taxRate: 0, paid: 796, total: 1592, amountDue: 796, created: stamp(-20) });

    for (var i = 0; i < 21; i++) { var d = day(-i); put('outreach', { date: d, count: [8, 10, 12, 6, 11, 9, 10, 4, 13, 10, 7, 10, 12, 9, 5, 10, 11, 8, 10, 6, 9][i] }, d); }

    s.settings.main = {
      outreachTarget: 10, foundingSlots: 5, foundingDiscount: 20,
      packages: [
        { name: 'Digital ID', price: 590, weeks: 2 }, { name: 'Portfolio', price: 850, weeks: 3 },
        { name: 'Brand Launch', price: 1990, weeks: 5 }, { name: 'Monthly social content', price: 249, weeks: 4, monthly: true },
        { name: 'Care plan: Essential', price: 39, weeks: 4, monthly: true }, { name: 'Care plan: Growth', price: 99, weeks: 4, monthly: true },
        { name: 'Care plan: Partner', price: 279, weeks: 4, monthly: true }, { name: 'Custom', price: 0, weeks: 4 }
      ],
      siteUrl: 'https://codeline-studio.akgunbalah.workers.dev',
      business: { name: 'CodeLine Studio', owner: 'Rashed Al-Balah', title: 'Founder & Lead Engineer', phone: '+1 555 0100', email: 'hello@example.com', website: 'codeline.studio', instagram: '@codeline.studio' }
    };
    return s;
  }

  var store = load() || seed();
  persist();

  /* ---------- snapshots ---------- */
  function docSnap(col, id) {
    var data = store[col] && store[col][id];
    return { id: id, exists: !!data, data: function () { return data ? JSON.parse(JSON.stringify(data)) : undefined; } };
  }
  function colSnap(col, opts) {
    var ids = Object.keys(store[col] || {});
    var docs = ids.map(function (id) { return docSnap(col, id); });
    if (opts && opts.orderBy) {
      var f = opts.orderBy, dir = opts.dir === 'desc' ? -1 : 1;
      docs.sort(function (a, b) { var x = a.data()[f], y = b.data()[f]; return x < y ? -dir : x > y ? dir : 0; });
    }
    if (opts && opts.limit) docs = docs.slice(0, opts.limit);
    return { docs: docs, size: docs.length, empty: !docs.length };
  }
  function notify(col) {
    persist();
    listeners.forEach(function (l) {
      if (l.col !== col) return;
      setTimeout(function () { l.cb(l.kind === 'col' ? colSnap(col, l.opts) : docSnap(col, l.id)); }, 0);
    });
  }
  function subscribe(l) {
    listeners.push(l);
    setTimeout(function () { l.cb(l.kind === 'col' ? colSnap(l.col, l.opts) : docSnap(l.col, l.id)); }, 0);
    return function () { listeners = listeners.filter(function (x) { return x !== l; }); };
  }

  /* ---------- Firestore-style API ---------- */
  function docRef(col, id) {
    return {
      id: id,
      set: function (data) { store[col] = store[col] || {}; store[col][id] = JSON.parse(JSON.stringify(data)); notify(col); return Promise.resolve(); },
      update: function (patch) {
        if (!store[col] || !store[col][id]) return Promise.reject({ code: 'not-found' });
        Object.assign(store[col][id], JSON.parse(JSON.stringify(patch))); notify(col); return Promise.resolve();
      },
      delete: function () { if (store[col]) delete store[col][id]; notify(col); return Promise.resolve(); },
      get: function () { return Promise.resolve(docSnap(col, id)); },
      onSnapshot: function (cb) { return subscribe({ kind: 'doc', col: col, id: id, cb: cb }); }
    };
  }
  function query(col, opts) {
    return {
      orderBy: function (f, dir) { return query(col, Object.assign({}, opts, { orderBy: f, dir: dir })); },
      limit: function (n) { return query(col, Object.assign({}, opts, { limit: n })); },
      get: function () { return Promise.resolve(colSnap(col, opts)); },
      onSnapshot: function (cb) { return subscribe({ kind: 'col', col: col, opts: opts, cb: cb }); },
      doc: function (id) { return docRef(col, id || uid()); },
      add: function (data) { var r = docRef(col, uid()); return r.set(data).then(function () { return r; }); }
    };
  }
  var db = {
    collection: function (col) { return query(col, {}); },
    doc: function (path) { var p = path.split('/'); return docRef(p[0], p[1]); }
  };

  var downloads = {
    save: function (o) {
      var url = URL.createObjectURL(o.data instanceof Blob ? o.data : new Blob([o.data]));
      var a = document.createElement('a'); a.href = url; a.download = o.filename || 'download';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
      return Promise.resolve();
    }
  };

  window.claude = {
    demo: true,
    use: function (name) {
      if (name === 'db') return Promise.resolve(db);
      if (name === 'downloads') return Promise.resolve(downloads);
      return Promise.reject({ code: 'not_granted' });
    }
  };

  // Reset helper for the demo banner
  window.resetDemo = function () { try { localStorage.removeItem(KEY); } catch (e) {} location.reload(); };
})();
