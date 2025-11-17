// AutoMobil Prototype - All Client Side (localStorage)
// NOTE: For production use real backend + SSR for best SEO.

(function(){
  const $ = (s,root=document)=>root.querySelector(s);
  const $$ = (s,root=document)=>Array.from(root.querySelectorAll(s));

  const LS_USERS = 'am_users';
  const LS_ME = 'am_me';
  const LS_LISTINGS = 'am_listings';

  const state = {
    users: [],
    me: null,
    listings: [],
    filters: { q:'', kondisi:'', brand:'', sort:'terbaru' }
  };

  const id = ()=>'id-'+Math.random().toString(36).slice(2)+Date.now().toString(36);
  const fmtRp = (n)=> new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Number(n||0));
  const escapeHtml = (str='') => str.replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));
  const onlyDigits = (s='')=> (s+'').replace(/\D+/g,'');
  const waLink = (phone, text) => {
    const p = onlyDigits(phone||'');
    const t = encodeURIComponent(text||'Halo, saya tertarik.');
    return `https://wa.me/${p}?text=${t}`;
  };

  function load(){
    try{
      state.users = JSON.parse(localStorage.getItem(LS_USERS)||'[]');
      state.me = JSON.parse(localStorage.getItem(LS_ME)||'null');
      state.listings = JSON.parse(localStorage.getItem(LS_LISTINGS)||'[]');
    }catch(e){
      state.users = []; state.me = null; state.listings = [];
    }
  }
  function save(){
    localStorage.setItem(LS_USERS, JSON.stringify(state.users));
    localStorage.setItem(LS_LISTINGS, JSON.stringify(state.listings));
    if(state.me) localStorage.setItem(LS_ME, JSON.stringify(state.me));
  }

  function toast(msg, type='info'){
    const el = $('#toast');
    el.textContent = msg;
    el.classList.add('show');
    setTimeout(()=>el.classList.remove('show'), 2200);
  }

  function seedIfEmpty(){
    if(state.users.length===0){
      const dealer = {
        id: id(), role:'sales_dealer_resmi', name:'Budi - Toyota Dealer',
        email:'dealer@toyota.example', password:'dealer123',
        whatsapp:'628111111111', brandDealer:'Toyota',
        nameTag: '', isVerifiedDealer:true
      };
      const nonDealer = {
        id: id(), role:'penjual_non_dealer', name:'Andi - Penjual',
        email:'andi@example.com', password:'penjual123',
        whatsapp:'628122222222', brandDealer:'',
        nameTag:'', isVerifiedDealer:false
      };
      state.users.push(dealer, nonDealer);

      const sampleListing = {
        id: id(), title:'Toyota Avanza G 2019', description:'Tangan pertama, servis resmi, pajak panjang.',
        kondisi:'Bekas', alamat:'Jakarta Selatan', harga:165000000, nego:true,
        brand:'Toyota', tahun:2019, pajakAktif:true, pajakBerlakuSampai:'2025-08-30',
        kilometer:52000, transmisi:'Automatic', bahanBakar:'Bensin',
        createdAt:new Date().toISOString(), sellerId: dealer.id, isDealerResmi:true,
        category:'Mobil',
        images:{
          depan:'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1200&auto=format&fit=crop',
          sampingKiri:'https://images.unsplash.com/photo-1549921296-3ecfdbc1fe0b?q=80&w=1200&auto=format&fit=crop',
          sampingKanan:'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop',
          belakang:'https://images.unsplash.com/photo-1549923746-c502d488b3ea?q=80&w=1200&auto=format&fit=crop',
          interior1:'https://images.unsplash.com/photo-1517142089942-ba376ce32a0b?q=80&w=1200&auto=format&fit=crop',
          interior2:'https://images.unsplash.com/photo-1619767886558-efdc259cde1d?q=80&w=1200&auto=format&fit=crop'
        }
      };
      const sampleListing2 = {
        id: id(), title:'Honda Brio RS 2022', description:'Kilometer rendah, interior rapi.',
        kondisi:'Bekas', alamat:'Bandung', harga:175000000, nego:false,
        brand:'Honda', tahun:2022, pajakAktif:true, pajakBerlakuSampai:'2026-01-15',
        kilometer:12000, transmisi:'Automatic', bahanBakar:'Bensin',
        createdAt:new Date(Date.now()-86400000).toISOString(), sellerId: nonDealer.id, isDealerResmi:false,
        category:'Mobil',
        images:{
          depan:'https://images.unsplash.com/photo-1549923746-c502d488b3ea?q=80&w=1200&auto=format&fit=crop',
          sampingKiri:'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=1200&auto=format&fit=crop',
          sampingKanan:'https://images.unsplash.com/photo-1518552718880-6b2f23f291d8?q=80&w=1200&auto=format&fit=crop',
          belakang:'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=1200&auto=format&fit=crop',
          interior1:'https://images.unsplash.com/photo-1517142089942-ba376ce32a0b?q=80&w=1200&auto=format&fit=crop',
          interior2:'https://images.unsplash.com/photo-1619767886558-efdc259cde1d?q=80&w=1200&auto=format&fit=crop'
        }
      };
      state.listings.push(sampleListing, sampleListing2);
      save();
    }
  }

  function renderHeader(){
    const btnAuth = $('#btnAuth');
    const userMenu = $('#userMenu');
    const userName = $('#userName');
    if(state.me){
      btnAuth.classList.add('hidden');
      userMenu.classList.remove('hidden');
      userName.textContent = `${state.me.name} • ${labelRole(state.me.role)}`;
    }else{
      btnAuth.classList.remove('hidden');
      userMenu.classList.add('hidden');
    }
  }

  function labelRole(role){
    if(role==='sales_dealer_resmi') return 'Dealer Resmi';
    if(role==='penjual_non_dealer') return 'Penjual';
    return 'Konsumen';
    }

  function brandOptions(){
    const brands = Array.from(new Set(state.listings.map(x=>x.brand))).filter(Boolean).sort();
    const sel = $('#filterBrand');
    sel.innerHTML = '<option value="">Merek: Semua</option>' + brands.map(b=>`<option value="${escapeHtml(b)}">${escapeHtml(b)}</option>`).join('');
  }

  function applyFilters(list){
    let res = list.slice();
    const f = state.filters;
    if(f.q){
      const q = f.q.toLowerCase();
      res = res.filter(x => (x.title+' '+x.brand+' '+x.alamat).toLowerCase().includes(q));
    }
    if(f.kondisi) res = res.filter(x => x.kondisi===f.kondisi);
    if(f.brand) res = res.filter(x => x.brand===f.brand);

    if(f.sort==='terbaru') res.sort((a,b)=> new Date(b.createdAt)-new Date(a.createdAt));
    if(f.sort==='termurah') res.sort((a,b)=> (a.harga||0)-(b.harga||0));
    if(f.sort==='termahal') res.sort((a,b)=> (b.harga||0)-(a.harga||0));
    if(f.sort==='tahun-terbaru') res.sort((a,b)=> (b.tahun||0)-(a.tahun||0));

    return res;
  }

  function renderGrid(){
    const grid = $('#grid');
    const empty = $('#emptyState');
    const items = applyFilters(state.listings);
    grid.innerHTML = '';
    if(items.length===0){
      empty.classList.remove('hidden');
      return;
    }
    empty.classList.add('hidden');

    grid.innerHTML = items.map(item=>{
      const seller = state.users.find(u=>u.id===item.sellerId) || {};
      const dealerBadge = item.isDealerResmi ? '<span class="badge dealer" title="Dealer Resmi Terverifikasi">Dealer Resmi</span>' : '';
      const kondBadge = `<span class="badge kondisi">${item.kondisi}</span>`;
      const img = item.images?.depan || '';
      return `
        <article class="card">
          <div class="thumb">
            <img src="${img}" alt="${escapeHtml(item.title)} - tampak depan" loading="lazy">
            <div class="badges">
              ${dealerBadge}
              ${kondBadge}
            </div>
          </div>
          <div class="body">
            <div class="price">${fmtRp(item.harga)} ${item.nego?'• Nego':''}</div>
            <div class="meta">${escapeHtml(item.title)}</div>
            <div class="meta">Merek: ${escapeHtml(item.brand)} • Tahun: ${item.tahun} • ${escapeHtml(item.alamat)}</div>
            <div class="actions">
              <button class="btn accent" data-chat="${item.id}">Chat WhatsApp</button>
              <button class="btn" data-detail="${item.id}">Lihat Detail</button>
            </div>
          </div>
        </article>
      `;
    }).join('');
    // Attach handlers
    $$('#grid [data-chat]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const item = state.listings.find(x=>x.id===btn.dataset.chat);
        const seller = state.users.find(u=>u.id===item.sellerId);
        const text = `Halo ${seller?.name||''}, saya tertarik dengan ${item.title}. Apakah unit masih tersedia?`;
        window.open(waLink(seller?.whatsapp, text), '_blank');
      });
    });
    $$('#grid [data-detail]').forEach(btn=>{
      btn.addEventListener('click', ()=> openProductDetail(btn.dataset.detail));
    });
  }

  function openModal(id){ const el = document.getElementById(id); if(!el.open) el.showModal(); }
  function closeModal(id){ const el = document.getElementById(id); if(el.open) el.close(); }

  function renderAuth(){
    // Toggle dealer extra on register role change
    const roleSel = $('#registerForm select[name="role"]');
    const dealerExtra = $('#dealerExtra');
    const nameTagInput = $('#registerForm input[name="nameTag"]');

    function updateDealerFields(){
      const v = roleSel.value;
      if(v==='sales_dealer_resmi'){
        dealerExtra.style.display = 'flex';
        nameTagInput.setAttribute('required','required');
      }else{
        dealerExtra.style.display = 'flex'; // show (optional) as requested
        nameTagInput.removeAttribute('required');
      }
    }
    roleSel.addEventListener('change', updateDealerFields);
    updateDealerFields();
  }

  function dataURL(file){
    return new Promise((res,rej)=>{
      const fr = new FileReader();
      fr.onload = ()=>res(fr.result);
      fr.onerror = rej;
      fr.readAsDataURL(file);
    });
  }

  function bindEvents(){
    $('#year').textContent = new Date().getFullYear();

    // Header buttons
    $('#btnAuth').addEventListener('click', ()=>openModal('authModal'));
    $('#btnLogout').addEventListener('click', ()=>{
      state.me = null;
      localStorage.removeItem(LS_ME);
      renderHeader();
      toast('Anda telah keluar.');
    });

    // Tabs in auth
    $$('.tab').forEach(t=>{
      t.addEventListener('click', ()=>{
        $$('.tab').forEach(x=>x.classList.remove('active'));
        $$('.tab-panel').forEach(x=>x.classList.remove('active'));
        t.classList.add('active');
        document.getElementById(t.dataset.tab).classList.add('active');
      });
    });

    // Close modal buttons
    $$('[data-close]').forEach(btn=>{
      btn.addEventListener('click', ()=> closeModal(btn.dataset.close));
    });

    // Auth forms
    $('#loginForm').addEventListener('submit', (e)=>{
      e.preventDefault();
      const fd = new FormData(e.target);
      const email = (fd.get('email')||'').toString().toLowerCase().trim();
      const password = (fd.get('password')||'').toString();
      const u = state.users.find(x=>x.email.toLowerCase()===email && x.password===password);
      if(!u){ toast('Email atau kata sandi salah.'); return; }
      state.me = { ...u };
      localStorage.setItem(LS_ME, JSON.stringify(state.me));
      renderHeader();
      closeModal('authModal');
      toast(`Halo, ${u.name}`);
    });

    $('#registerForm').addEventListener('submit', async (e)=>{
      e.preventDefault();
      const fd = new FormData(e.target);
      const email = (fd.get('email')||'').toString().toLowerCase().trim();
      if(state.users.some(u=>u.email.toLowerCase()===email)){ toast('Email sudah terdaftar.'); return; }
      const role = fd.get('role');
      const brandDealer = (fd.get('brandDealer')||'').toString();
      const nameTagFile = fd.get('nameTag');
      const nameTag = nameTagFile && nameTagFile.size ? await dataURL(nameTagFile) : '';

      if(role==='sales_dealer_resmi' && !brandDealer){
        toast('Pilih merek Dealer Resmi.');
        return;
      }

      const u = {
        id:id(), name: fd.get('name'), email, password: fd.get('password'),
        whatsapp: onlyDigits(fd.get('whatsapp')),
        role, brandDealer: role==='sales_dealer_resmi'?brandDealer:'',
        nameTag, isVerifiedDealer: role==='sales_dealer_resmi'
      };
      state.users.push(u); state.me = {...u}; save(); localStorage.setItem(LS_ME, JSON.stringify(state.me));
      renderHeader();
      closeModal('authModal');
      toast('Akun berhasil dibuat.');
    });

    // Search & filter
    $('#searchForm').addEventListener('submit', (e)=>{ e.preventDefault(); state.filters.q = $('#searchInput').value.trim(); renderGrid(); });
    $('#filterKondisi').addEventListener('change', (e)=>{ state.filters.kondisi = e.target.value; renderGrid(); });
    $('#filterBrand').addEventListener('change', (e)=>{ state.filters.brand = e.target.value; renderGrid(); });
    $('#sortSelect').addEventListener('change', (e)=>{ state.filters.sort = e.target.value; renderGrid(); });
    $('#btnResetFilter').addEventListener('click', ()=>{
      state.filters = { q:'', kondisi:'', brand:'', sort:'terbaru' };
      $('#searchInput').value = '';
      $('#filterKondisi').value = '';
      $('#filterBrand').value = '';
      $('#sortSelect').value = 'terbaru';
      renderGrid();
    });

    // Add listing
    $('#btnOpenAdd').addEventListener('click', ()=>{
      if(!state.me){ openModal('authModal'); toast('Silakan masuk/daftar terlebih dahulu.'); return; }
      if(state.me.role==='konsumen'){ toast('Akun Konsumen tidak dapat memasang iklan.'); return; }
      openModal('listingModal');
    });

    // Photo previews
    $$('#listingForm input[type="file"]').forEach(inp=>{
      inp.addEventListener('change', async ()=>{
        const prev = $('#photoPreviews');
        prev.innerHTML = '';
        const fields = ['fotoDepan','fotoKiri','fotoKanan','fotoBelakang','fotoInterior1','fotoInterior2'];
        for(const nm of fields){
          const f = $(`#listingForm input[name="${nm}"]`).files[0];
          if(f){
            const url = URL.createObjectURL(f);
            const img = document.createElement('img');
            img.src = url; img.alt = nm; img.loading = 'lazy';
            prev.appendChild(img);
          }
        }
      });
    });

    $('#listingForm').addEventListener('submit', async (e)=>{
      e.preventDefault();
      if(!state.me){ toast('Silakan masuk terlebih dahulu.'); return; }
      if(state.me.role==='konsumen'){ toast('Akun Konsumen tidak dapat memasang iklan.'); return; }

      const fd = new FormData(e.target);
      const jenis = fd.get('jenisBarang');
      if(jenis!=='Mobil'){
        toast('Error: barang yang anda jual bukan kendaraan / mobil');
        return;
      }

      // Validate 6 photos
      const requiredPhotos = ['fotoDepan','fotoKiri','fotoKanan','fotoBelakang','fotoInterior1','fotoInterior2'];
      for(const nm of requiredPhotos){
        const f = fd.get(nm);
        if(!(f && f.size)){ toast('Wajib upload 6 foto dari semua sisi.'); return; }
      }

      const newItem = {
        id: id(),
        title: (fd.get('title')||'').toString().trim(),
        description: (fd.get('description')||'').toString().trim(),
        kondisi: fd.get('kondisi'),
        brand: (fd.get('brand')||'').toString().trim(),
        tahun: Number(fd.get('tahun')),
        harga: Number(fd.get('harga')),
        nego: fd.get('nego')==='true',
        alamat: (fd.get('alamat')||'').toString().trim(),
        pajakAktif: fd.get('pajakAktif')==='true',
        pajakBerlakuSampai: (fd.get('pajakBerlakuSampai')||'').toString(),
        kilometer: Number(fd.get('kilometer')||0),
        transmisi: fd.get('transmisi'),
        bahanBakar: fd.get('bahanBakar'),
        images: {},
        category:'Mobil',
        createdAt: new Date().toISOString(),
        sellerId: state.me.id,
        isDealerResmi: state.me.role==='sales_dealer_resmi'
      };

      // Convert photos to data URLs (demo purpose)
      async function to64(nm){ const f=fd.get(nm); return await dataURL(f); }
      newItem.images.depan = await to64('fotoDepan');
      newItem.images.sampingKiri = await to64('fotoKiri');
      newItem.images.sampingKanan = await to64('fotoKanan');
      newItem.images.belakang = await to64('fotoBelakang');
      newItem.images.interior1 = await to64('fotoInterior1');
      newItem.images.interior2 = await to64('fotoInterior2');

      state.listings.unshift(newItem);
      save();
      brandOptions();
      renderGrid();
      closeModal('listingModal');
      e.target.reset();
      $('#photoPreviews').innerHTML = '';
      toast('Iklan berhasil dipasang.');
    });

    // Close modal on backdrop click (optional)
    $$('dialog').forEach(d=>{
      d.addEventListener('click', (e)=> {
        const rect = d.getBoundingClientRect();
        const inside = e.clientX>=rect.left && e.clientX<=rect.right && e.clientY>=rect.top && e.clientY<=rect.bottom;
        if(!inside) d.close();
      });
    });
  }

  function openProductDetail(idItem){
    const item = state.listings.find(x=>x.id===idItem);
    if(!item) return;
    const seller = state.users.find(u=>u.id===item.sellerId)||{};
    $('#pdTitle').textContent = item.title;
    const dealerBadge = item.isDealerResmi ? `<span class="badge dealer">Dealer Resmi • ${escapeHtml(seller.brandDealer||'')}</span>` : '';
    const html = `
      <div class="row wrap">
        ${dealerBadge}
        <span class="badge kondisi">${item.kondisi}</span>
      </div>
      <div class="pd-gallery">
        ${['depan','sampingKiri','sampingKanan','belakang','interior1','interior2'].map(k=>{
          const alt = `${item.title} - ${k.replace(/([A-Z])/g,' $1')}`;
          return `<img src="${item.images[k]}" alt="${escapeHtml(alt)}" loading="lazy">`;
        }).join('')}
      </div>
      <div class="pd-info">
        <div class="price">${fmtRp(item.harga)} ${item.nego?'• Bisa Nego':''}</div>
        <p>${escapeHtml(item.description)}</p>
        <div class="kv"><b>Merek</b><span>${escapeHtml(item.brand)}</span></div>
        <div class="kv"><b>Tahun</b><span>${item.tahun}</span></div>
        <div class="kv"><b>Kilometer</b><span>${item.kilometer.toLocaleString('id-ID')} km</span></div>
        <div class="kv"><b>Transmisi</b><span>${escapeHtml(item.transmisi)}</span></div>
        <div class="kv"><b>Bahan Bakar</b><span>${escapeHtml(item.bahanBakar)}</span></div>
        <div class="kv"><b>Pajak</b><span>${item.pajakAktif?'Aktif':'Tidak Aktif'} ${item.pajakBerlakuSampai?('• s.d. '+item.pajakBerlakuSampai):''}</span></div>
        <div class="kv"><b>Alamat Unit</b><span>${escapeHtml(item.alamat)}</span></div>
        <div class="kv"><b>Penjual</b><span>${escapeHtml(seller.name||'-')} • ${item.isDealerResmi?'Dealer Resmi':'Penjual'}</span></div>
        <div class="row">
          <a class="btn accent" target="_blank" href="${waLink(seller.whatsapp, `Halo ${seller.name||''}, saya tertarik ${item.title}.`)}">Chat Penjual via WhatsApp</a>
        </div>
      </div>

      <!-- JSON-LD: Product/Car -->
      <script type="application/ld+json">
      {
        "@context":"https://schema.org",
        "@type":"Product",
        "name": ${JSON.stringify(item.title)},
        "brand": ${JSON.stringify(item.brand)},
        "description": ${JSON.stringify(item.description)},
        "category": "Car",
        "itemCondition": ${JSON.stringify(item.kondisi==='Baru'?'https://schema.org/NewCondition':'https://schema.org/UsedCondition')},
        "image": ${JSON.stringify(Object.values(item.images))},
        "offers":{
          "@type":"Offer",
          "priceCurrency":"IDR",
          "price": "${item.harga}",
          "availability":"https://schema.org/InStock",
          "url": "${location.href.split('#')[0]}"
        }
      }
      </script>
    `;
    $('#pdBody').innerHTML = html;
    // Update meta title/desc lightly for SPA context
    document.title = `${item.title} — AutoMobil`;
    const md = document.querySelector('meta[name="description"]');
    if(md) md.setAttribute('content', `${item.brand} ${item.tahun} • ${item.kondisi} • ${item.alamat}`);
    openModal('productModal');
  }

  // Init
  load();
  seedIfEmpty();
  renderHeader();
  brandOptions();
  renderGrid();
  bindEvents();
  renderAuth();
})();
