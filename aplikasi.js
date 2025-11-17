// AutoMobil Prototype - GitHub Pages (/ecomerce/)
// Simpan data di localStorage (demo). Produksi: pakai backend & SSR.

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

  function toast(msg){
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
