/* I Love Boston: clickable demo of look H (map, pull-up list, tabs), plus the Spots & badges,
   business, vendor and sign-up screens. Plain JS, no libraries. Sample data only. */
(() => {
  'use strict';

  const $ = (s, el) => (el || document).querySelector(s);
  const app = $('#app');
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const mins = (d) => Math.max(1, Math.round(d * 20));
  const maps = (q) => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q);

  const NAVY = '#13254A', PICK = '#1F5BD8', LIVE = '#D7263D';
  // One color per category, used on the map pin, the stop in the list and the filter chip.
  const CAT_COLOR = { eat: '#C2410C', drinks: '#DB2777', shop: '#1D4ED8', see: '#15803D', services: '#7E22CE' };
  const WORLD = { x0: -260, y0: -300, x1: 650, y1: 900 };

  /* ---------- icons ---------- */
  const I = {
    heart: (w, h, fill, stroke, sw) => `<svg width="${w}" height="${h}" viewBox="0 0 24 22" aria-hidden="true"><path fill="${fill}"${stroke ? ` stroke="${stroke}" stroke-width="${sw || 2}"` : ''} d="M12 21.6l-1.5-1.36C5.1 15.36 1.5 12.1 1.5 8.1 1.5 4.84 4.06 2.3 7.3 2.3c1.84 0 3.6.86 4.7 2.2 1.1-1.34 2.86-2.2 4.7-2.2 3.24 0 5.8 2.54 5.8 5.8 0 4-3.6 7.26-9 12.15L12 21.6z"/></svg>`,
    s: (d, size, sw) => `<svg width="${size || 18}" height="${size || 18}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw || 2}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`,
  };
  const P = {
    right: '<path d="M9 6l6 6-6 6"/>',
    left: '<path d="M15 6l-6 6 6 6"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    pin: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
    cal: '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    map: '<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14M15 6v14"/>',
    photo: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><circle cx="9" cy="10" r="1.8"/><path d="M21 16l-5.5-5L6 19"/>',
    train: '<rect x="5" y="3" width="14" height="14" rx="3"/><path d="M5 11h14"/><path d="M8 21l2-4M16 21l-2-4"/><circle cx="9" cy="14" r="0.6"/><circle cx="15" cy="14" r="0.6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    lock: '<path d="M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5z"/>',
    call: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
    insta: '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="0.6"/>',
    save: '<path d="M12 20s-7-4.4-9-8.9C1.6 7.6 3.8 4.5 7.1 4.5c2 0 3.6 1.2 4.9 2.8 1.3-1.6 2.9-2.8 4.9-2.8 3.3 0 5.5 3.1 4.1 6.6C19 15.6 12 20 12 20z"/>',
    share: '<path d="M12 3v12"/><path d="M7.5 7.5L12 3l4.5 4.5"/><path d="M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7"/>',
    gift: '<path d="M20 12v8H4v-8"/><path d="M2.5 7.5h19v4.5h-19z"/><path d="M12 7.5V20"/><path d="M12 7.5C10.5 4 7 4 7 6s3 1.5 5 1.5c2 0 5 .5 5-1.5s-3.5-2-5 1.5z"/>',
    book: '<path d="M3.5 5.5A1.5 1.5 0 0 1 5 4h6v15H5a1.5 1.5 0 0 0-1.5 1.5z"/><path d="M20.5 5.5A1.5 1.5 0 0 0 19 4h-6v15h6a1.5 1.5 0 0 1 1.5 1.5z"/>',
    flower: '<circle cx="12" cy="8" r="2.2"/><path d="M12 5.8c0-2 1.2-3.3 2.4-3.3s1.6 1.9.3 3.2M14.2 8c2 0 3.3 1.2 3.3 2.4s-1.9 1.6-3.2.3M12 10.2c0 2-1.2 3.3-2.4 3.3s-1.6-1.9-.3-3.2M9.8 8c-2 0-3.3-1.2-3.3-2.4s1.9-1.6 3.2-.3"/><path d="M12 10.5V21"/><path d="M12 16c-2.2-2.6-4.6-2.8-6-2.4.4 2.3 2.8 3.6 6 3.4"/>',
    food: '<path d="M3.5 12h17a8.5 8.5 0 0 1-17 0z"/><path d="M8 8.5c0-1.5 1-1.6 1-3.2M12 8.5c0-1.5 1-1.6 1-3.2M16 8.5c0-1.5 1-1.6 1-3.2"/>',
    candle: '<rect x="8.5" y="10" width="7" height="11" rx="1.2"/><path d="M12 10V8.2"/><path d="M12 2.8c1.6 1.7 2.1 2.7 2.1 3.5a2.1 2.1 0 0 1-4.2 0c0-.8.5-1.8 2.1-3.5z"/>',
    vintage: '<path d="M10 6a2 2 0 1 1 2 2v1.5"/><path d="M12 9.5L3 16.5h18z"/><path d="M6 16.5V20h12v-3.5"/>',
    wrench: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.2L3.6 17.2a1.6 1.6 0 0 0 2.3 2.3l5.7-5.7a4 4 0 0 0 5.2-5.4l-2.4 2.4-2.3-.4-.4-2.3z"/>',
    steps: '<path d="M7.5 3.5c1.6 0 2.4 1.9 2.4 4.1 0 2.1-.9 3.6-2.4 3.6S5.1 9.7 5.1 7.6c0-2.2.8-4.1 2.4-4.1zM5.6 13.4h3.8v1.9a1.9 1.9 0 0 1-3.8 0zM16.5 8.5c1.6 0 2.4 1.9 2.4 4.1 0 2.1-.9 3.6-2.4 3.6s-2.4-1.5-2.4-3.6c0-2.2.8-4.1 2.4-4.1zM14.6 18.4h3.8v1.4a1.9 1.9 0 0 1-3.8 0z"/>',
    star: '<path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.3L12 17.1l-5.7 3.1 1.2-6.3-4.7-4.4 6.4-.8z"/>',
    play: '<path d="M7 4.5v15l12.5-7.5z" fill="currentColor" stroke="none"/>',
    nav: '<path d="M3.5 10.6L20 4l-6.6 16.5-2.1-7.2z" fill="currentColor" stroke="none"/>',
    sliders: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/>',
    thumb: '<path d="M7 10v11"/><path d="M15 5.9L14 10h5.8a2 2 0 0 1 1.9 2.6l-2.3 7.5A2 2 0 0 1 17.5 21H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h2.8a2 2 0 0 0 1.8-1.1L12 3a3.1 3.1 0 0 1 3 2.9z"/>',
    flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.4-.5-2-1-3-1.1-2.1-.2-4.1 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.2.4-2.3 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
    camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z"/><circle cx="12" cy="13" r="3.2"/>',
    tree: '<path d="M12 22v-7"/><path d="M9 22h6"/><path d="M12 2.5a6 6 0 0 1 5.6 8.1A4.2 4.2 0 0 1 15.8 15H8.2a4.2 4.2 0 0 1-1.8-4.4A6 6 0 0 1 12 2.5z"/>',
    columns: '<path d="M3 9l9-5 9 5"/><path d="M5 9.5h14"/><path d="M6.5 10v8M10.2 10v8M13.8 10v8M17.5 10v8"/><path d="M4.5 18.5h15M3 21h18"/>',
    ticket: '<path d="M2.5 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h15a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2h-15a2 2 0 0 0-2 2z"/><path d="M14 5v2M14 11v2M14 17v2"/>',
    gate: '<path d="M2.5 5.5Q12 8.2 21.5 5.5"/><path d="M4.5 9h15"/><path d="M6.5 7.2V21M17.5 7.2V21"/><path d="M10.5 9v4.5M13.5 9v4.5"/><path d="M6.5 13.5h11"/>',
    fish: '<path d="M2.5 12c3-4.2 8.7-5.6 13-2.4L20.5 6v12l-5-3.6C11.2 17.6 5.5 16.2 2.5 12z"/><circle cx="7.6" cy="11.3" r=".9" fill="currentColor" stroke="none"/>',
    bag: '<path d="M5.5 8h13l1 13h-15z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>',
    medal: '<circle cx="12" cy="15" r="5.5"/><path d="M8.6 10.6L6 3h4l2 5 2-5h4l-2.6 7.6"/>',
    cocktail: '<path d="M4 4h16l-8 9.5z"/><path d="M12 13.5V20"/><path d="M8 20.5h8"/><path d="M7.5 8h9"/>',
    beer: '<path d="M6 8.5h9v10.5a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2z"/><path d="M15 11h2.2a2 2 0 0 1 2 2v2.5a2 2 0 0 1-2 2H15"/><path d="M6 8.5c-.8-2.4 1-4.6 3.3-4 .9-1.5 3-1.7 4.2-.4 1.6-.3 2.9 1.2 2.4 2.8"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>',
    users: '<circle cx="9" cy="8.5" r="3.4"/><path d="M2.8 19.5c.9-3.4 3.2-5.2 6.2-5.2s5.3 1.8 6.2 5.2"/><path d="M15.5 5.3a3.3 3.3 0 0 1 0 6.4M17.6 14.6c1.8.6 3 2.2 3.6 4.9"/>',
    person: '<circle cx="12" cy="8.2" r="3.8"/><path d="M4.5 20.5c1.4-3.8 4.2-5.6 7.5-5.6s6.1 1.8 7.5 5.6"/>',
  };

  /* ---------- languages (strings from look A, plus H's own) ---------- */
  const FLAG = {
    en: '<svg viewBox="0 0 30 20"><rect width="30" height="20" fill="#fff"/><g fill="#B22234"><rect width="30" height="1.54"/><rect y="3.08" width="30" height="1.54"/><rect y="6.15" width="30" height="1.54"/><rect y="9.23" width="30" height="1.54"/><rect y="12.31" width="30" height="1.54"/><rect y="15.38" width="30" height="1.54"/><rect y="18.46" width="30" height="1.54"/></g><rect width="13" height="10.77" fill="#3C3B6E"/><g fill="#fff"><circle cx="2" cy="2.2" r=".6"/><circle cx="5" cy="2.2" r=".6"/><circle cx="8" cy="2.2" r=".6"/><circle cx="11" cy="2.2" r=".6"/><circle cx="3.5" cy="5.4" r=".6"/><circle cx="6.5" cy="5.4" r=".6"/><circle cx="9.5" cy="5.4" r=".6"/><circle cx="2" cy="8.6" r=".6"/><circle cx="5" cy="8.6" r=".6"/><circle cx="8" cy="8.6" r=".6"/><circle cx="11" cy="8.6" r=".6"/></g></svg>',
    es: '<svg viewBox="0 0 30 20"><rect width="30" height="20" fill="#AA151B"/><rect y="5" width="30" height="10" fill="#F1BF00"/></svg>',
    pt: '<svg viewBox="0 0 30 20"><rect width="30" height="20" fill="#009C3B"/><polygon points="15,2.5 27.5,10 15,17.5 2.5,10" fill="#FFDF00"/><circle cx="15" cy="10" r="4.4" fill="#002776"/></svg>',
    zh: '<svg viewBox="0 0 30 20"><rect width="30" height="20" fill="#EE1C25"/><polygon fill="#FFDE00" points="5,2 5.676,4.07 7.853,4.073 6.094,5.355 6.763,7.427 5,6.15 3.237,7.427 3.906,5.355 2.147,4.073 4.324,4.07"/><g fill="#FFDE00"><circle cx="10" cy="2" r=".7"/><circle cx="12" cy="4" r=".7"/><circle cx="12" cy="7" r=".7"/><circle cx="10" cy="9" r=".7"/></g></svg>',
    fr: '<svg viewBox="0 0 30 20"><rect width="10" height="20" fill="#002654"/><rect x="10" width="10" height="20" fill="#fff"/><rect x="20" width="10" height="20" fill="#CE1126"/></svg>',
    vi: '<svg viewBox="0 0 30 20"><rect width="30" height="20" fill="#DA251D"/><polygon fill="#FFFF00" points="15,4 16.352,8.139 20.706,8.146 17.188,10.711 18.527,14.854 15,12.3 11.473,14.854 12.812,10.711 9.294,8.146 13.648,8.139"/></svg>',
    it: '<svg viewBox="0 0 30 20"><rect width="10" height="20" fill="#009246"/><rect x="10" width="10" height="20" fill="#fff"/><rect x="20" width="10" height="20" fill="#CE2B37"/></svg>',
    ja: '<svg viewBox="0 0 30 20"><rect width="30" height="20" fill="#fff"/><circle cx="15" cy="10" r="6" fill="#BC002D"/></svg>',
    ko: '<svg viewBox="0 0 30 20"><rect width="30" height="20" fill="#fff"/><path d="M10 10a5 5 0 0 1 10 0a2.5 2.5 0 0 1-5 0a2.5 2.5 0 0 0-5 0z" fill="#CD2E3A"/><path d="M10 10a2.5 2.5 0 0 0 5 0a2.5 2.5 0 0 1 5 0a5 5 0 0 1-10 0z" fill="#0047A0"/><g fill="#000"><g transform="translate(5.2 4.2) rotate(-56)"><rect x="-2" y="-1.6" width="4" height=".7"/><rect x="-2" y="-.35" width="4" height=".7"/><rect x="-2" y=".9" width="4" height=".7"/></g><g transform="translate(24.8 15.8) rotate(-56)"><rect x="-2" y="-1.6" width="4" height=".7"/><rect x="-2" y="-.35" width="4" height=".7"/><rect x="-2" y=".9" width="4" height=".7"/></g><g transform="translate(24.8 4.2) rotate(56)"><rect x="-2" y="-1.6" width="4" height=".7"/><rect x="-2" y="-.35" width="4" height=".7"/><rect x="-2" y=".9" width="4" height=".7"/></g><g transform="translate(5.2 15.8) rotate(56)"><rect x="-2" y="-1.6" width="4" height=".7"/><rect x="-2" y="-.35" width="4" height=".7"/><rect x="-2" y=".9" width="4" height=".7"/></g></g></svg>',
    hi: '<svg viewBox="0 0 30 20"><rect width="30" height="6.67" fill="#FF9933"/><rect y="6.67" width="30" height="6.66" fill="#fff"/><rect y="13.33" width="30" height="6.67" fill="#138808"/><circle cx="15" cy="10" r="2.3" fill="none" stroke="#000080" stroke-width=".5"/><circle cx="15" cy="10" r=".5" fill="#000080"/></svg>',
  };
  const LANGS = [
    { code: 'en', name: 'English', short: 'EN' }, { code: 'es', name: 'Español', short: 'ES' },
    { code: 'pt', name: 'Português', short: 'PT' }, { code: 'zh', name: '简体中文', short: '中文' },
    { code: 'fr', name: 'Français', short: 'FR' }, { code: 'vi', name: 'Tiếng Việt', short: 'VI' },
    { code: 'it', name: 'Italiano', short: 'IT' }, { code: 'ja', name: '日本語', short: '日本語' },
    { code: 'ko', name: '한국어', short: '한국어' }, { code: 'hi', name: 'हिन्दी', short: 'हिन्दी' },
  ];
  const STR = {
    en: { here: "You're at", sponsored: 'Sponsored', directions: 'Directions', lang: 'Language', tabNear: 'Nearby', tabEvents: "What's on", tabLive: 'Live now', sample: 'Sample listings', biz: 'Own a business nearby? Get listed',
      all: 'All', eat: 'Eat', shop: 'Shop', see: 'See', services: 'Services',
      flowers: 'Flowers', repair: 'Phone repair', books: 'Bookstore', theater: 'Theater', park: 'Park', historic: 'Historic site', market: 'Marketplace', japanese: 'Japanese', sushi: 'Sushi', landmark: 'Landmark',
      walk: (n) => n + ' min walk', mins: (n) => n + ' min', walk5: '5-minute walk', allWithin: "That's everything within a 10-minute walk of this sign.", tHead: 'Get around on the T',
      seePage: 'See page', photos: 'See photos', addCal: 'Add to calendar', today: 'Today', tonight: 'Tonight', tomorrow: 'Tomorrow', weekend: 'Weekend', now: 'Now', later: 'Later today', till: (t) => 'till ' + t,
      liveCount: (n) => n + ' stands selling near you right now', openingLater: 'Opening later today', opens: (t) => 'Opens ' + t, goLive: 'Sell at a market or pop-up? Go live here',
      langNote: 'The menus switch right away. On the real site, listings and events get translated too.' },
    es: { here: 'Estás en', sponsored: 'Patrocinado', directions: 'Cómo llegar', lang: 'Idioma', tabNear: 'Cerca de ti', tabEvents: 'Eventos', tabLive: 'En vivo', sample: 'Ejemplos', biz: '¿Tienes un negocio cerca? Únete',
      all: 'Todo', eat: 'Comer', shop: 'Tiendas', see: 'Ver', services: 'Servicios',
      flowers: 'Flores', repair: 'Reparación de celulares', books: 'Librería', theater: 'Teatro', park: 'Parque', historic: 'Sitio histórico', market: 'Mercado', japanese: 'Japonés', sushi: 'Sushi', landmark: 'Lugar emblemático',
      walk: (n) => n + ' min a pie', mins: (n) => n + ' min', walk5: '5 minutos a pie', allWithin: 'Eso es todo lo que hay a 10 minutos a pie de este cartel.', tHead: 'Muévete en el T (metro)',
      seePage: 'Ver página', photos: 'Ver fotos', addCal: 'Añadir al calendario', today: 'Hoy', tonight: 'Esta noche', tomorrow: 'Mañana', weekend: 'Fin de semana', now: 'Ahora', later: 'Más tarde hoy', till: (t) => 'hasta las ' + t,
      liveCount: (n) => n + ' puestos vendiendo cerca ahora mismo', openingLater: 'Abren más tarde hoy', opens: (t) => 'Abre a las ' + t, goLive: '¿Vendes en un mercado o pop-up? Aparece en vivo aquí',
      langNote: 'El menú cambia al instante. En el sitio real, los lugares y eventos también se traducen.' },
    pt: { here: 'Você está em', sponsored: 'Patrocinado', directions: 'Como chegar', lang: 'Idioma', tabNear: 'Perto de você', tabEvents: 'Eventos', tabLive: 'Ao vivo', sample: 'Exemplos', biz: 'Tem um negócio por perto? Anuncie aqui',
      all: 'Tudo', eat: 'Comer', shop: 'Lojas', see: 'Passeios', services: 'Serviços',
      flowers: 'Flores', repair: 'Conserto de celular', books: 'Livraria', theater: 'Teatro', park: 'Parque', historic: 'Local histórico', market: 'Mercado', japanese: 'Japonês', sushi: 'Sushi', landmark: 'Ponto turístico',
      walk: (n) => n + ' min a pé', mins: (n) => n + ' min', walk5: '5 minutos a pé', allWithin: 'Isso é tudo a até 10 minutos a pé desta placa.', tHead: 'Ande de T (metrô)',
      seePage: 'Ver página', photos: 'Ver fotos', addCal: 'Adicionar à agenda', today: 'Hoje', tonight: 'Hoje à noite', tomorrow: 'Amanhã', weekend: 'Fim de semana', now: 'Agora', later: 'Mais tarde hoje', till: (t) => 'até ' + t,
      liveCount: (n) => n + ' barracas vendendo perto de você agora', openingLater: 'Abrem mais tarde hoje', opens: (t) => 'Abre às ' + t, goLive: 'Vende em feira ou pop-up? Apareça ao vivo aqui',
      langNote: 'O menu muda na hora. No site de verdade, lugares e eventos também são traduzidos.' },
    zh: { here: '您在', sponsored: '赞助', directions: '路线', lang: '语言', tabNear: '附近', tabEvents: '活动', tabLive: '正在营业', sample: '示例', biz: '附近有店铺？加入我们',
      all: '全部', eat: '美食', shop: '购物', see: '景点', services: '服务',
      flowers: '鲜花', repair: '手机维修', books: '书店', theater: '剧院', park: '公园', historic: '历史古迹', market: '市集', japanese: '日本料理', sushi: '寿司', landmark: '地标',
      walk: (n) => '步行' + n + '分钟', mins: (n) => n + '分钟', walk5: '步行5分钟', allWithin: '以上是离这块标牌步行10分钟以内的全部地点。', tHead: '乘坐地铁（T）',
      seePage: '查看详情', photos: '查看照片', addCal: '添加到日历', today: '今天', tonight: '今晚', tomorrow: '明天', weekend: '周末', now: '进行中', later: '今天稍后', till: (t) => '至' + t,
      liveCount: (n) => '附近有' + n + '个摊位正在营业', openingLater: '今天稍后开门', opens: (t) => t + '开门', goLive: '在市集或快闪店摆摊？在这里显示营业中',
      langNote: '菜单已切换语言。正式网站上，商家和活动信息也会翻译。' },
    fr: { here: 'Vous êtes à', sponsored: 'Sponsorisé', directions: 'Itinéraire', lang: 'Langue', tabNear: 'Près de vous', tabEvents: 'Agenda', tabLive: 'En ce moment', sample: 'Exemples', biz: 'Vous avez un commerce ? Rejoignez-nous',
      all: 'Tout', eat: 'Manger', shop: 'Boutiques', see: 'À voir', services: 'Services',
      flowers: 'Fleurs', repair: 'Réparation de téléphones', books: 'Librairie', theater: 'Théâtre', park: 'Parc', historic: 'Site historique', market: 'Marché', japanese: 'Japonais', sushi: 'Sushi', landmark: 'Monument',
      walk: (n) => n + ' min à pied', mins: (n) => n + ' min', walk5: '5 min à pied', allWithin: 'Voilà tout ce qui se trouve à moins de 10 minutes à pied de ce panneau.', tHead: 'Se déplacer en T (métro)',
      seePage: 'Voir la page', photos: 'Voir les photos', addCal: 'Ajouter au calendrier', today: 'Aujourd’hui', tonight: 'Ce soir', tomorrow: 'Demain', weekend: 'Week-end', now: 'En cours', later: 'Plus tard aujourd’hui', till: (t) => 'jusqu’à ' + t,
      liveCount: (n) => n + ' stands ouverts près de vous en ce moment', openingLater: 'Ouvrent plus tard aujourd’hui', opens: (t) => 'Ouvre à ' + t, goLive: 'Vous vendez sur un marché ? Signalez-vous ici en direct',
      langNote: 'Les menus changent tout de suite. Sur le vrai site, les lieux et les événements sont traduits aussi.' },
    vi: { here: 'Bạn đang ở', sponsored: 'Tài trợ', directions: 'Chỉ đường', lang: 'Ngôn ngữ', tabNear: 'Gần bạn', tabEvents: 'Sự kiện', tabLive: 'Đang mở', sample: 'Ví dụ', biz: 'Bạn có cửa hàng gần đây? Tham gia ngay',
      all: 'Tất cả', eat: 'Ăn uống', shop: 'Mua sắm', see: 'Tham quan', services: 'Dịch vụ',
      flowers: 'Hoa', repair: 'Sửa điện thoại', books: 'Hiệu sách', theater: 'Nhà hát', park: 'Công viên', historic: 'Di tích lịch sử', market: 'Chợ', japanese: 'Món Nhật', sushi: 'Sushi', landmark: 'Địa danh',
      walk: (n) => n + ' phút đi bộ', mins: (n) => n + ' phút', walk5: '5 phút đi bộ', allWithin: 'Đó là tất cả những nơi trong vòng 10 phút đi bộ từ biển này.', tHead: 'Đi tàu điện ngầm (T)',
      seePage: 'Xem trang', photos: 'Xem ảnh', addCal: 'Thêm vào lịch', today: 'Hôm nay', tonight: 'Tối nay', tomorrow: 'Ngày mai', weekend: 'Cuối tuần', now: 'Bây giờ', later: 'Sắp diễn ra hôm nay', till: (t) => 'đến ' + t,
      liveCount: (n) => n + ' quầy đang bán gần bạn', openingLater: 'Sắp mở cửa hôm nay', opens: (t) => 'Mở lúc ' + t, goLive: 'Bạn bán ở chợ hoặc quầy pop-up? Hiện trực tiếp tại đây',
      langNote: 'Menu đã đổi ngôn ngữ. Trên trang thật, địa điểm và sự kiện cũng được dịch.' },
    it: { here: 'Sei a', sponsored: 'Sponsorizzato', directions: 'Indicazioni', lang: 'Lingua', tabNear: 'Vicino a te', tabEvents: 'Eventi', tabLive: 'Aperti ora', sample: 'Esempi', biz: 'Hai un’attività qui vicino? Unisciti',
      all: 'Tutto', eat: 'Mangiare', shop: 'Negozi', see: 'Da vedere', services: 'Servizi',
      flowers: 'Fiori', repair: 'Riparazione telefoni', books: 'Libreria', theater: 'Teatro', park: 'Parco', historic: 'Sito storico', market: 'Mercato', japanese: 'Giapponese', sushi: 'Sushi', landmark: 'Luogo simbolo',
      walk: (n) => n + ' min a piedi', mins: (n) => n + ' min', walk5: '5 minuti a piedi', allWithin: 'Questo è tutto ciò che si trova entro 10 minuti a piedi da questo cartello.', tHead: 'Muoversi con la T (metro)',
      seePage: 'Vedi pagina', photos: 'Vedi foto', addCal: 'Aggiungi al calendario', today: 'Oggi', tonight: 'Stasera', tomorrow: 'Domani', weekend: 'Weekend', now: 'Ora', later: 'Più tardi oggi', till: (t) => 'fino alle ' + t,
      liveCount: (n) => n + ' bancarelle aperte vicino a te', openingLater: 'Aprono più tardi oggi', opens: (t) => 'Apre alle ' + t, goLive: 'Vendi a un mercato o pop-up? Fatti trovare qui in diretta',
      langNote: 'I menu cambiano subito. Sul sito vero si traducono anche luoghi ed eventi.' },
    ja: { here: '現在地', sponsored: 'スポンサー', directions: '経路', lang: '言語', tabNear: '周辺', tabEvents: 'イベント', tabLive: '営業中', sample: 'サンプル', biz: '近くでお店を経営していますか？掲載はこちら',
      all: 'すべて', eat: 'グルメ', shop: 'ショップ', see: '観光', services: 'サービス',
      flowers: '花屋', repair: 'スマホ修理', books: '書店', theater: '劇場', park: '公園', historic: '史跡', market: 'マーケット', japanese: '日本料理', sushi: '寿司', landmark: 'ランドマーク',
      walk: (n) => '徒歩' + n + '分', mins: (n) => n + '分', walk5: '徒歩5分', allWithin: 'この看板から徒歩10分以内のスポットはこれで全部です。', tHead: '地下鉄（T）で移動',
      seePage: '詳しく見る', photos: '写真を見る', addCal: 'カレンダーに追加', today: '今日', tonight: '今夜', tomorrow: '明日', weekend: '週末', now: '開催中', later: 'このあと', till: (t) => t + 'まで',
      liveCount: (n) => '近くで' + n + '軒が営業中', openingLater: 'このあとオープン', opens: (t) => t + 'オープン', goLive: 'マーケットやポップアップで出店中？ここで営業中と表示',
      langNote: 'メニューの言語が切り替わりました。本番サイトではお店やイベントの情報も翻訳されます。' },
    ko: { here: '현재 위치', sponsored: '스폰서', directions: '길찾기', lang: '언어', tabNear: '내 주변', tabEvents: '이벤트', tabLive: '영업 중', sample: '예시', biz: '근처에서 가게를 하시나요? 등록하기',
      all: '전체', eat: '맛집', shop: '쇼핑', see: '명소', services: '서비스',
      flowers: '꽃집', repair: '휴대폰 수리', books: '서점', theater: '극장', park: '공원', historic: '사적지', market: '마켓', japanese: '일식', sushi: '스시', landmark: '랜드마크',
      walk: (n) => '도보 ' + n + '분', mins: (n) => n + '분', walk5: '도보 5분', allWithin: '이 표지판에서 도보 10분 이내의 장소는 여기까지예요.', tHead: '지하철(T)로 이동',
      seePage: '자세히 보기', photos: '사진 보기', addCal: '캘린더에 추가', today: '오늘', tonight: '오늘 밤', tomorrow: '내일', weekend: '주말', now: '진행 중', later: '오늘 이따가', till: (t) => t + '까지',
      liveCount: (n) => '근처에서 ' + n + '곳이 영업 중', openingLater: '오늘 이따가 오픈', opens: (t) => t + ' 오픈', goLive: '마켓이나 팝업에서 판매하시나요? 여기서 영업 중으로 표시하세요',
      langNote: '메뉴 언어가 바로 바뀌어요. 실제 사이트에서는 장소와 이벤트 정보도 번역돼요.' },
    hi: { here: 'आप यहाँ हैं', sponsored: 'प्रायोजित', directions: 'रास्ता', lang: 'भाषा', tabNear: 'आसपास', tabEvents: 'कार्यक्रम', tabLive: 'अभी खुले', sample: 'उदाहरण', biz: 'पास में आपका बिज़नेस है? जुड़ें',
      all: 'सभी', eat: 'खाना', shop: 'शॉपिंग', see: 'घूमें', services: 'सेवाएँ',
      flowers: 'फूल', repair: 'फ़ोन रिपेयर', books: 'किताबों की दुकान', theater: 'थिएटर', park: 'पार्क', historic: 'ऐतिहासिक स्थल', market: 'बाज़ार', japanese: 'जापानी खाना', sushi: 'सुशी', landmark: 'प्रसिद्ध स्थल',
      walk: (n) => n + ' मिनट पैदल', mins: (n) => n + ' मिनट', walk5: '5 मिनट पैदल', allWithin: 'इस साइन से 10 मिनट पैदल की दूरी में बस इतना ही है।', tHead: 'T (मेट्रो) से घूमें',
      seePage: 'पेज देखें', photos: 'फ़ोटो देखें', addCal: 'कैलेंडर में जोड़ें', today: 'आज', tonight: 'आज रात', tomorrow: 'कल', weekend: 'वीकेंड', now: 'अभी', later: 'आज बाद में', till: (t) => t + ' तक',
      liveCount: (n) => 'आपके पास ' + n + ' स्टॉल अभी खुले हैं', openingLater: 'आज बाद में खुलेंगे', opens: (t) => 'खुलेगा: ' + t, goLive: 'बाज़ार या पॉप-अप में बेचते हैं? यहाँ लाइव दिखें',
      langNote: 'मेन्यू की भाषा तुरंत बदल जाती है। असली साइट पर जगहों और कार्यक्रमों का भी अनुवाद होगा।' },
  };
  // Recommendations, visitor photos and points (merged into STR just below).
  const STR2 = {
    en: { topPicks: 'Top picks nearby', rec: (n) => n + ' recommend', todayN: (n) => n + ' today',
      recNote: 'Ranked by how many people who checked in recommend each place. Sponsored places are labeled and can’t pay to rank higher.',
      photosHead: 'Most-liked photos nearby', photosNote: 'Photos people took of what they got. The most-liked ones go first and become the place’s cover.',
      bestEat: 'Best food', bestShop: 'Best shops', bestSee: 'Best things to see', bestServices: 'Best services', seeAll: (n) => 'See all ' + n,
      checkIn: 'Check in', recommend: 'Recommend', addPhoto: 'Add photo', checkedIn: 'Checked in', recommended: 'Recommended', photoAdded: 'Photo added',
      beenHere: 'Been here? Earn points', mostLiked: 'Most liked', stations: (n) => n + ' stations' },
    es: { topPicks: 'Lo mejor cerca de ti', rec: (n) => n + ' lo recomiendan', todayN: (n) => n + ' hoy',
      recNote: 'Ordenado según cuántas personas que hicieron check-in recomiendan cada lugar. Los lugares patrocinados están señalados y no pueden pagar para subir.',
      photosHead: 'Las fotos con más me gusta', photosNote: 'Fotos de lo que pidió o compró la gente. Las que tienen más me gusta salen primero y se vuelven la portada del lugar.',
      bestEat: 'Lo mejor para comer', bestShop: 'Las mejores tiendas', bestSee: 'Lo mejor para ver', bestServices: 'Los mejores servicios', seeAll: (n) => 'Ver los ' + n,
      checkIn: 'Estoy aquí', recommend: 'Recomendar', addPhoto: 'Subir foto', checkedIn: 'Check-in hecho', recommended: 'Recomendado', photoAdded: 'Foto subida',
      beenHere: '¿Ya fuiste? Gana puntos', mostLiked: 'Más me gusta', stations: (n) => n + ' estaciones' },
    pt: { topPicks: 'O melhor perto de você', rec: (n) => n + ' recomendam', todayN: (n) => n + ' hoje',
      recNote: 'Ordenado por quantas pessoas que fizeram check-in recomendam cada lugar. Lugares patrocinados são identificados e não podem pagar para subir.',
      photosHead: 'Fotos mais curtidas por perto', photosNote: 'Fotos do que as pessoas pediram ou compraram. As mais curtidas aparecem primeiro e viram a capa do lugar.',
      bestEat: 'Melhores para comer', bestShop: 'Melhores lojas', bestSee: 'Melhores passeios', bestServices: 'Melhores serviços', seeAll: (n) => 'Ver todos os ' + n,
      checkIn: 'Fazer check-in', recommend: 'Recomendar', addPhoto: 'Enviar foto', checkedIn: 'Check-in feito', recommended: 'Recomendado', photoAdded: 'Foto enviada',
      beenHere: 'Já foi? Ganhe pontos', mostLiked: 'Mais curtida', stations: (n) => n + ' estações' },
    zh: { topPicks: '附近精选', rec: (n) => n + '人推荐', todayN: (n) => '今日' + n + '人',
      recNote: '按到过并打卡的人的推荐数排序。赞助商家都有标注，不能花钱提高排名。',
      photosHead: '附近点赞最多的照片', photosNote: '大家拍下自己点的、买的东西。点赞最多的排在最前，并成为该地点的封面。',
      bestEat: '最佳美食', bestShop: '最佳购物', bestSee: '最佳景点', bestServices: '最佳服务', seeAll: (n) => '查看全部' + n + '个',
      checkIn: '打卡', recommend: '推荐', addPhoto: '上传照片', checkedIn: '已打卡', recommended: '已推荐', photoAdded: '已上传',
      beenHere: '去过了？赚积分', mostLiked: '点赞最多', stations: (n) => n + '个车站' },
    fr: { topPicks: 'Le top près d’ici', rec: (n) => n + ' recommandent', todayN: (n) => n + ' aujourd’hui',
      recNote: 'Classé selon le nombre de personnes venues sur place qui recommandent chaque lieu. Les lieux sponsorisés sont signalés et ne peuvent pas payer pour monter.',
      photosHead: 'Les photos les plus aimées', photosNote: 'Des photos de ce que les gens ont commandé ou acheté. Les plus aimées passent en premier et deviennent la couverture du lieu.',
      bestEat: 'Les meilleures tables', bestShop: 'Les meilleures boutiques', bestSee: 'À voir absolument', bestServices: 'Les meilleurs services', seeAll: (n) => 'Voir les ' + n,
      checkIn: 'Je suis là', recommend: 'Recommander', addPhoto: 'Ajouter une photo', checkedIn: 'Validé', recommended: 'Recommandé', photoAdded: 'Photo ajoutée',
      beenHere: 'Vous y êtes allé ? Gagnez des points', mostLiked: 'La plus aimée', stations: (n) => n + ' stations' },
    vi: { topPicks: 'Gợi ý hàng đầu gần đây', rec: (n) => n + ' người đề xuất', todayN: (n) => n + ' hôm nay',
      recNote: 'Xếp hạng theo số người đã check-in tại đó đề xuất từng nơi. Nơi được tài trợ luôn có nhãn và không thể trả tiền để lên hạng.',
      photosHead: 'Ảnh được thích nhiều nhất', photosNote: 'Ảnh mọi người chụp món họ đã gọi hoặc mua. Ảnh được thích nhiều nhất hiện trước và làm ảnh bìa của địa điểm.',
      bestEat: 'Ăn ngon nhất', bestShop: 'Cửa hàng tốt nhất', bestSee: 'Đáng xem nhất', bestServices: 'Dịch vụ tốt nhất', seeAll: (n) => 'Xem cả ' + n,
      checkIn: 'Check-in', recommend: 'Đề xuất', addPhoto: 'Thêm ảnh', checkedIn: 'Đã check-in', recommended: 'Đã đề xuất', photoAdded: 'Đã thêm ảnh',
      beenHere: 'Đã đến đây? Nhận điểm', mostLiked: 'Thích nhiều nhất', stations: (n) => n + ' ga' },
    it: { topPicks: 'I migliori qui vicino', rec: (n) => n + ' lo consigliano', todayN: (n) => n + ' oggi',
      recNote: 'In ordine di quante persone che hanno fatto check-in consigliano ogni posto. I luoghi sponsorizzati sono segnalati e non possono pagare per salire.',
      photosHead: 'Le foto più amate qui vicino', photosNote: 'Foto di quello che le persone hanno ordinato o comprato. Le più amate vanno per prime e diventano la copertina del posto.',
      bestEat: 'Dove mangiare meglio', bestShop: 'I negozi migliori', bestSee: 'Da non perdere', bestServices: 'I servizi migliori', seeAll: (n) => 'Vedi tutti e ' + n,
      checkIn: 'Sono qui', recommend: 'Consiglia', addPhoto: 'Aggiungi foto', checkedIn: 'Check-in fatto', recommended: 'Consigliato', photoAdded: 'Foto aggiunta',
      beenHere: 'Ci sei stato? Guadagna punti', mostLiked: 'La più amata', stations: (n) => n + ' stazioni' },
    ja: { topPicks: '近くの人気スポット', rec: (n) => n + '人がおすすめ', todayN: (n) => '今日' + n + '人',
      recNote: '実際にチェックインした人のおすすめ数で並べています。スポンサーには表示があり、お金で順位を上げることはできません。',
      photosHead: '近くの「いいね」が多い写真', photosNote: 'みんなが注文したもの・買ったものの写真。いいねが多い写真ほど先に表示され、お店のカバー写真になります。',
      bestEat: 'おすすめグルメ', bestShop: 'おすすめショップ', bestSee: 'おすすめ観光', bestServices: 'おすすめサービス', seeAll: (n) => n + '件すべて見る',
      checkIn: 'チェックイン', recommend: 'おすすめする', addPhoto: '写真を追加', checkedIn: 'チェックイン済み', recommended: 'おすすめ済み', photoAdded: '追加済み',
      beenHere: '行きましたか？ポイントがたまります', mostLiked: 'いいね最多', stations: (n) => n + '駅' },
    ko: { topPicks: '근처 인기 추천', rec: (n) => n + '명 추천', todayN: (n) => '오늘 ' + n + '명',
      recNote: '직접 체크인한 사람들의 추천 수로 순위를 매겨요. 스폰서 장소는 표시되며, 돈으로 순위를 올릴 수 없어요.',
      photosHead: '근처에서 좋아요가 많은 사진', photosNote: '사람들이 주문하거나 산 것을 찍은 사진이에요. 좋아요가 많은 사진이 먼저 나오고 장소의 대표 사진이 돼요.',
      bestEat: '최고의 맛집', bestShop: '최고의 쇼핑', bestSee: '꼭 가볼 곳', bestServices: '최고의 서비스', seeAll: (n) => n + '곳 모두 보기',
      checkIn: '체크인', recommend: '추천하기', addPhoto: '사진 추가', checkedIn: '체크인 완료', recommended: '추천 완료', photoAdded: '추가 완료',
      beenHere: '가 보셨나요? 포인트를 받으세요', mostLiked: '좋아요 최다', stations: (n) => '역 ' + n + '곳' },
    hi: { topPicks: 'आसपास की टॉप पसंद', rec: (n) => n + ' लोगों ने सुझाया', todayN: (n) => 'आज ' + n,
      recNote: 'वहाँ चेक-इन करने वालों की सिफ़ारिशों के हिसाब से क्रम। प्रायोजित जगहों पर लेबल होता है और वे पैसे देकर ऊपर नहीं आ सकतीं।',
      photosHead: 'आसपास की सबसे पसंद की गई फ़ोटो', photosNote: 'लोगों ने जो ऑर्डर किया या ख़रीदा, उसकी फ़ोटो। सबसे ज़्यादा लाइक वाली फ़ोटो पहले दिखती है और जगह की कवर फ़ोटो बनती है।',
      bestEat: 'सबसे अच्छा खाना', bestShop: 'सबसे अच्छी दुकानें', bestSee: 'ज़रूर देखें', bestServices: 'सबसे अच्छी सेवाएँ', seeAll: (n) => 'सभी ' + n + ' देखें',
      checkIn: 'चेक-इन', recommend: 'सुझाएँ', addPhoto: 'फ़ोटो जोड़ें', checkedIn: 'चेक-इन हो गया', recommended: 'सुझा दिया', photoAdded: 'फ़ोटो जुड़ गई',
      beenHere: 'यहाँ गए थे? पॉइंट कमाएँ', mostLiked: 'सबसे ज़्यादा लाइक', stations: (n) => n + ' स्टेशन' },
  };
  Object.keys(STR2).forEach((k) => Object.assign(STR[k], STR2[k]));
  // Sign in, reviews and critics (merged into STR just below). recNote replaces the earlier one.
  const STR3 = {
    en: { signIn: 'Sign in', signToEarn: 'Sign in to earn points', signTitle: 'Sign in to check in, review and earn points',
      signBody: 'Signing in with Google or Apple keeps reviews real: one person, one account. Looking around stays free, no account needed.',
      withGoogle: 'Continue with Google', withApple: 'Continue with Apple', review: 'Review', reviewed: 'Reviewed',
      wouldRec: (n) => 'Would you recommend ' + n + '?', yes: 'Yes', notReally: 'Not really', sayWhy: 'What did you get? What did you like? (optional)', post: 'Post review',
      criticsPick: "Critics' pick", criticsRow: 'Local critics recommend',
      recNote: 'Ranked by recommendations from signed-in visitors who checked in. 🏆 marks local critics’ picks. Sponsored places are labeled and can’t pay to rank higher.' },
    es: { signIn: 'Entrar', signToEarn: 'Inicia sesión para ganar puntos', signTitle: 'Inicia sesión para hacer check-in, opinar y ganar puntos',
      signBody: 'Entrar con Google o Apple mantiene las reseñas reales: una persona, una cuenta. Mirar sigue siendo gratis y sin cuenta.',
      withGoogle: 'Continuar con Google', withApple: 'Continuar con Apple', review: 'Reseña', reviewed: 'Reseña hecha',
      wouldRec: (n) => '¿Recomendarías ' + n + '?', yes: 'Sí', notReally: 'No mucho', sayWhy: '¿Qué pediste? ¿Qué te gustó? (opcional)', post: 'Publicar reseña',
      criticsPick: 'Elegido por críticos', criticsRow: 'Lo que recomiendan los críticos locales',
      recNote: 'Ordenado según las recomendaciones de visitantes con sesión iniciada que hicieron check-in. 🏆 marca lo que eligen los críticos locales. Los lugares patrocinados están señalados y no pueden pagar para subir.' },
    pt: { signIn: 'Entrar', signToEarn: 'Entre para ganhar pontos', signTitle: 'Entre para fazer check-in, avaliar e ganhar pontos',
      signBody: 'Entrar com Google ou Apple mantém as avaliações reais: uma pessoa, uma conta. Navegar continua grátis, sem conta.',
      withGoogle: 'Continuar com o Google', withApple: 'Continuar com a Apple', review: 'Avaliar', reviewed: 'Avaliado',
      wouldRec: (n) => 'Você recomendaria ' + n + '?', yes: 'Sim', notReally: 'Não muito', sayWhy: 'O que você pediu? Do que gostou? (opcional)', post: 'Publicar avaliação',
      criticsPick: 'Escolha dos críticos', criticsRow: 'Os críticos locais recomendam',
      recNote: 'Ordenado pelas recomendações de visitantes conectados que fizeram check-in. 🏆 marca as escolhas dos críticos locais. Lugares patrocinados são identificados e não podem pagar para subir.' },
    zh: { signIn: '登录', signToEarn: '登录即可赚积分', signTitle: '登录后即可打卡、评价并赚积分',
      signBody: '用 Google 或 Apple 登录，让评价更真实：一人一个账号。随便看看无需登录，完全免费。',
      withGoogle: '使用 Google 继续', withApple: '使用 Apple 继续', review: '评价', reviewed: '已评价',
      wouldRec: (n) => '你会推荐' + n + '吗？', yes: '会', notReally: '不太会', sayWhy: '你点了什么？喜欢什么？（选填）', post: '发布评价',
      criticsPick: '评论家推荐', criticsRow: '本地评论家推荐',
      recNote: '按已登录并打卡的访客推荐数排序。🏆 表示本地评论家的推荐。赞助商家都有标注，不能花钱提高排名。' },
    fr: { signIn: 'Connexion', signToEarn: 'Connectez-vous pour gagner des points', signTitle: 'Connectez-vous pour faire un check-in, donner votre avis et gagner des points',
      signBody: 'Se connecter avec Google ou Apple garde les avis authentiques : une personne, un compte. Regarder reste gratuit, sans compte.',
      withGoogle: 'Continuer avec Google', withApple: 'Continuer avec Apple', review: 'Avis', reviewed: 'Avis publié',
      wouldRec: (n) => 'Recommanderiez-vous ' + n + ' ?', yes: 'Oui', notReally: 'Pas vraiment', sayWhy: 'Qu’avez-vous pris ? Qu’avez-vous aimé ? (facultatif)', post: 'Publier l’avis',
      criticsPick: 'Choix des critiques', criticsRow: 'Les critiques locaux recommandent',
      recNote: 'Classé selon les recommandations des visiteurs connectés venus sur place. 🏆 indique les choix des critiques locaux. Les lieux sponsorisés sont signalés et ne peuvent pas payer pour monter.' },
    vi: { signIn: 'Đăng nhập', signToEarn: 'Đăng nhập để nhận điểm', signTitle: 'Đăng nhập để check-in, đánh giá và nhận điểm',
      signBody: 'Đăng nhập bằng Google hoặc Apple giúp đánh giá luôn thật: mỗi người một tài khoản. Xem thì vẫn miễn phí, không cần tài khoản.',
      withGoogle: 'Tiếp tục với Google', withApple: 'Tiếp tục với Apple', review: 'Đánh giá', reviewed: 'Đã đánh giá',
      wouldRec: (n) => 'Bạn có giới thiệu ' + n + ' không?', yes: 'Có', notReally: 'Không hẳn', sayWhy: 'Bạn đã gọi gì? Bạn thích gì? (không bắt buộc)', post: 'Đăng đánh giá',
      criticsPick: 'Nhà phê bình chọn', criticsRow: 'Nhà phê bình địa phương giới thiệu',
      recNote: 'Xếp hạng theo đề xuất của khách đã đăng nhập và check-in. 🏆 là lựa chọn của nhà phê bình địa phương. Nơi được tài trợ luôn có nhãn và không thể trả tiền để lên hạng.' },
    it: { signIn: 'Accedi', signToEarn: 'Accedi per guadagnare punti', signTitle: 'Accedi per fare check-in, recensire e guadagnare punti',
      signBody: 'Accedere con Google o Apple mantiene le recensioni vere: una persona, un account. Guardare resta gratis, senza account.',
      withGoogle: 'Continua con Google', withApple: 'Continua con Apple', review: 'Recensisci', reviewed: 'Recensito',
      wouldRec: (n) => 'Consiglieresti ' + n + '?', yes: 'Sì', notReally: 'Non proprio', sayWhy: 'Cosa hai preso? Cosa ti è piaciuto? (facoltativo)', post: 'Pubblica recensione',
      criticsPick: 'Scelto dai critici', criticsRow: 'I critici locali consigliano',
      recNote: 'In ordine di consigli dei visitatori registrati che hanno fatto check-in. 🏆 indica le scelte dei critici locali. I luoghi sponsorizzati sono segnalati e non possono pagare per salire.' },
    ja: { signIn: 'ログイン', signToEarn: 'ログインしてポイントをためる', signTitle: 'ログインしてチェックイン、レビュー、ポイント獲得',
      signBody: 'Google か Apple でログインすると、レビューが本物に保たれます（1人1アカウント）。見るだけならアカウント不要・無料です。',
      withGoogle: 'Google で続ける', withApple: 'Apple で続ける', review: 'レビュー', reviewed: 'レビュー済み',
      wouldRec: (n) => n + 'をおすすめしますか？', yes: 'はい', notReally: 'あまり', sayWhy: '何を頼みましたか？どこが良かったですか？（任意）', post: 'レビューを投稿',
      criticsPick: '評論家のおすすめ', criticsRow: '地元の評論家のおすすめ',
      recNote: 'ログインしてチェックインした人のおすすめ数で並べています。🏆 は地元の評論家のおすすめ。スポンサーには表示があり、お金で順位を上げることはできません。' },
    ko: { signIn: '로그인', signToEarn: '로그인하고 포인트 받기', signTitle: '로그인하고 체크인, 리뷰, 포인트 받기',
      signBody: 'Google이나 Apple로 로그인하면 리뷰가 진짜로 유지돼요. 한 사람에 한 계정. 둘러보기는 계정 없이 무료예요.',
      withGoogle: 'Google로 계속하기', withApple: 'Apple로 계속하기', review: '리뷰', reviewed: '리뷰 완료',
      wouldRec: (n) => n + ', 추천하시겠어요?', yes: '네', notReally: '별로요', sayWhy: '무엇을 주문했나요? 무엇이 좋았나요? (선택)', post: '리뷰 올리기',
      criticsPick: '평론가 추천', criticsRow: '지역 평론가 추천',
      recNote: '로그인하고 체크인한 방문자의 추천 수로 순위를 매겨요. 🏆는 지역 평론가의 추천이에요. 스폰서 장소는 표시되며, 돈으로 순위를 올릴 수 없어요.' },
    hi: { signIn: 'साइन इन', signToEarn: 'पॉइंट कमाने के लिए साइन इन करें', signTitle: 'चेक-इन, रिव्यू और पॉइंट के लिए साइन इन करें',
      signBody: 'Google या Apple से साइन इन करने से रिव्यू असली रहते हैं: एक व्यक्ति, एक अकाउंट। घूमना-देखना मुफ़्त है, अकाउंट की ज़रूरत नहीं।',
      withGoogle: 'Google के साथ जारी रखें', withApple: 'Apple के साथ जारी रखें', review: 'रिव्यू', reviewed: 'रिव्यू दिया',
      wouldRec: (n) => 'क्या आप ' + n + ' की सिफ़ारिश करेंगे?', yes: 'हाँ', notReally: 'ज़्यादा नहीं', sayWhy: 'आपने क्या लिया? क्या अच्छा लगा? (वैकल्पिक)', post: 'रिव्यू पोस्ट करें',
      criticsPick: 'समीक्षकों की पसंद', criticsRow: 'स्थानीय समीक्षक सुझाते हैं',
      recNote: 'साइन इन करके चेक-इन करने वाले लोगों की सिफ़ारिशों के हिसाब से क्रम। 🏆 स्थानीय समीक्षकों की पसंद है। प्रायोजित जगहों पर लेबल होता है और वे पैसे देकर ऊपर नहीं आ सकतीं।' },
  };
  Object.keys(STR3).forEach((k) => Object.assign(STR[k], STR3[k]));
  // Bars, friends, Nearest and "Recommend a place" (merged into STR just below)
  const STR4 = {
    en: { drinks: 'Drinks', friends: 'Friends', cocktails: 'Cocktail bar', pub: 'Irish pub', tavern: 'Historic tavern', dive: 'Dive bar', grill: 'Bar & grill', seafood: 'Seafood', bakery: 'Bakery', library: 'Library',
      bestDrinks: 'Best bars', sortTop: 'Top picks', sortNear: 'Nearest', recPlace: 'Recommend a place', recPlaceSub: 'Been somewhere good? One tap tells everyone, and your friends see your name.',
      searchPlaces: 'Search places', newTag: 'New', inviteFriends: 'Invite friends', friendsHere: 'Your friends here', you: 'You' },
    es: { drinks: 'Bares', friends: 'Amigos', cocktails: 'Coctelería', pub: 'Pub irlandés', tavern: 'Taberna histórica', dive: 'Bar de barrio', grill: 'Bar y parrilla', seafood: 'Mariscos', bakery: 'Pastelería', library: 'Biblioteca',
      bestDrinks: 'Los mejores bares', sortTop: 'Lo mejor', sortNear: 'Más cerca', recPlace: 'Recomienda un lugar', recPlaceSub: '¿Fuiste a un buen sitio? Con un toque se lo cuentas a todos, y tus amigos ven tu nombre.',
      searchPlaces: 'Buscar lugares', newTag: 'Nuevo', inviteFriends: 'Invitar amigos', friendsHere: 'Tus amigos aquí', you: 'Tú' },
    pt: { drinks: 'Bares', friends: 'Amigos', cocktails: 'Coquetelaria', pub: 'Pub irlandês', tavern: 'Taverna histórica', dive: 'Boteco', grill: 'Bar e grelhados', seafood: 'Frutos do mar', bakery: 'Confeitaria', library: 'Biblioteca',
      bestDrinks: 'Melhores bares', sortTop: 'Destaques', sortNear: 'Mais perto', recPlace: 'Recomende um lugar', recPlaceSub: 'Foi a um lugar bom? Um toque conta para todos, e seus amigos veem seu nome.',
      searchPlaces: 'Buscar lugares', newTag: 'Novo', inviteFriends: 'Convidar amigos', friendsHere: 'Seus amigos aqui', you: 'Você' },
    zh: { drinks: '酒吧', friends: '好友', cocktails: '鸡尾酒吧', pub: '爱尔兰酒馆', tavern: '老字号酒馆', dive: '平价小酒吧', grill: '酒吧餐厅', seafood: '海鲜', bakery: '甜品店', library: '图书馆',
      bestDrinks: '最佳酒吧', sortTop: '精选', sortNear: '最近', recPlace: '推荐一个地方', recPlaceSub: '去过好地方？点一下就能告诉大家，好友还能看到你的名字。',
      searchPlaces: '搜索地点', newTag: '新', inviteFriends: '邀请好友', friendsHere: '你在这里的好友', you: '你' },
    fr: { drinks: 'Bars', friends: 'Amis', cocktails: 'Bar à cocktails', pub: 'Pub irlandais', tavern: 'Taverne historique', dive: 'Bar de quartier', grill: 'Bar-grill', seafood: 'Fruits de mer', bakery: 'Pâtisserie', library: 'Bibliothèque',
      bestDrinks: 'Les meilleurs bars', sortTop: 'Le top', sortNear: 'Les plus proches', recPlace: 'Recommander un lieu', recPlaceSub: 'Un bon endroit ? Un geste suffit pour le dire à tous, et vos amis voient votre nom.',
      searchPlaces: 'Rechercher un lieu', newTag: 'Nouveau', inviteFriends: 'Inviter des amis', friendsHere: 'Vos amis ici', you: 'Vous' },
    vi: { drinks: 'Quán bar', friends: 'Bạn bè', cocktails: 'Quán cocktail', pub: 'Quán rượu Ireland', tavern: 'Quán rượu lâu đời', dive: 'Quán bar bình dân', grill: 'Bar & đồ nướng', seafood: 'Hải sản', bakery: 'Tiệm bánh', library: 'Thư viện',
      bestDrinks: 'Quán bar tốt nhất', sortTop: 'Nổi bật', sortNear: 'Gần nhất', recPlace: 'Đề xuất một nơi', recPlaceSub: 'Đã đến nơi hay? Chạm một lần để mọi người biết, bạn bè sẽ thấy tên bạn.',
      searchPlaces: 'Tìm địa điểm', newTag: 'Mới', inviteFriends: 'Mời bạn bè', friendsHere: 'Bạn bè của bạn ở đây', you: 'Bạn' },
    it: { drinks: 'Bar', friends: 'Amici', cocktails: 'Cocktail bar', pub: 'Pub irlandese', tavern: 'Taverna storica', dive: 'Bar alla buona', grill: 'Bar e griglia', seafood: 'Pesce', bakery: 'Pasticceria', library: 'Biblioteca',
      bestDrinks: 'I bar migliori', sortTop: 'I migliori', sortNear: 'Più vicini', recPlace: 'Consiglia un posto', recPlaceSub: 'Sei stato in un bel posto? Con un tocco lo dici a tutti, e i tuoi amici vedono il tuo nome.',
      searchPlaces: 'Cerca un posto', newTag: 'Nuovo', inviteFriends: 'Invita amici', friendsHere: 'I tuoi amici qui', you: 'Tu' },
    ja: { drinks: 'バー', friends: '友だち', cocktails: 'カクテルバー', pub: 'アイリッシュパブ', tavern: '老舗の酒場', dive: '気軽なバー', grill: 'バー＆グリル', seafood: 'シーフード', bakery: 'ベーカリー', library: '図書館',
      bestDrinks: 'おすすめバー', sortTop: 'おすすめ順', sortNear: '近い順', recPlace: '場所をおすすめする', recPlaceSub: 'いい場所に行った？ワンタップでみんなに伝わり、友だちにはあなたの名前が表示されます。',
      searchPlaces: '場所を検索', newTag: '新着', inviteFriends: '友だちを招待', friendsHere: 'ここにいる友だち', you: 'あなた' },
    ko: { drinks: '바', friends: '친구', cocktails: '칵테일 바', pub: '아이리시 펍', tavern: '오래된 선술집', dive: '동네 바', grill: '바 & 그릴', seafood: '해산물', bakery: '베이커리', library: '도서관',
      bestDrinks: '최고의 바', sortTop: '추천순', sortNear: '가까운 순', recPlace: '장소 추천하기', recPlaceSub: '좋은 곳에 다녀왔나요? 한 번 탭으로 모두에게 알리고, 친구에게는 내 이름이 보여요.',
      searchPlaces: '장소 검색', newTag: '새로운', inviteFriends: '친구 초대', friendsHere: '여기 있는 친구', you: '나' },
    hi: { drinks: 'बार', friends: 'दोस्त', cocktails: 'कॉकटेल बार', pub: 'आयरिश पब', tavern: 'पुराना टैवर्न', dive: 'सादा बार', grill: 'बार और ग्रिल', seafood: 'सीफ़ूड', bakery: 'बेकरी', library: 'पुस्तकालय',
      bestDrinks: 'सबसे अच्छे बार', sortTop: 'टॉप पसंद', sortNear: 'सबसे पास', recPlace: 'कोई जगह सुझाएँ', recPlaceSub: 'कहीं अच्छी जगह गए? एक टैप में सबको बताएँ, और दोस्तों को आपका नाम दिखेगा।',
      searchPlaces: 'जगह खोजें', newTag: 'नया', inviteFriends: 'दोस्तों को बुलाएँ', friendsHere: 'यहाँ आपके दोस्त', you: 'आप' },
  };
  Object.keys(STR4).forEach((k) => Object.assign(STR[k], STR4[k]));

  /* ---------- sample data (same as the canvas) ---------- */
  const PLACES = [
    { id: 'florabella', name: 'Florabella Flowers', cat: 'shop', kind: 'flowers', dist: 0.05, sponsored: true, spotlight: true, photo: true, tint: '#F6E1E4', ink: '#B8232F', page: 'place/florabella', q: 'Downtown Crossing Boston', x: 230, y: 236 },
    { id: 'brattle', name: 'Brattle Book Shop', cat: 'shop', kind: 'books', dist: 0.1, page: 'place/brattle', q: 'Brattle Book Shop Boston', x: 186, y: 290 },
    { id: 'opera', name: 'Boston Opera House', cat: 'see', kind: 'theater', dist: 0.1, page: 'place/opera', q: 'Boston Opera House', x: 208, y: 334 },
    { id: 'drphil', name: 'Dr Phil Repair Center', cat: 'services', kind: 'repair', dist: 0.2, sponsored: true, photo: true, tint: '#E6EDFA', ink: '#2A4E9B', page: 'place/drphil', q: 'Dr Phil Repair Center Tremont St Boston', x: 160, y: 318 },
    { id: 'paku', name: 'Paku Katsuya', cat: 'eat', kind: 'japanese', dist: 0.2, page: 'place/paku', q: 'Paku Katsuya Boston', x: 146, y: 276 },
    { id: 'common', name: 'Boston Common', cat: 'see', kind: 'park', dist: 0.2, page: 'place/common', q: 'Boston Common', x: 126, y: 244 },
    { id: 'oldstate', name: 'Old State House', cat: 'see', kind: 'historic', dist: 0.3, page: 'place/oldstate', q: 'Old State House Boston', x: 246, y: 116 },
    { id: 'genki', name: 'Genki Ya', cat: 'eat', kind: 'sushi', dist: 0.3, page: 'place/genki', q: 'Genki Ya Boston', x: 150, y: 370 },
    { id: 'faneuil', name: 'Faneuil Hall Marketplace', cat: 'see', kind: 'market', dist: 0.4, page: 'place/faneuil', q: 'Faneuil Hall Marketplace Boston', x: 326, y: 82 },
    { id: 'chinatown', name: 'Chinatown Gate', cat: 'see', kind: 'landmark', dist: 0.4, page: 'place/chinatown', q: 'Chinatown Gate Boston', x: 300, y: 372 },
    { id: 'yvonnes', name: "Yvonne's", cat: 'drinks', kind: 'cocktails', dist: 0.1, till: '1 am', page: 'place/yvonnes', q: "Yvonne's Boston", x: 188, y: 250 },
    { id: 'silvertone', name: 'Silvertone Bar & Grill', cat: 'drinks', kind: 'grill', dist: 0.15, till: '2 am', page: 'place/silvertone', q: 'Silvertone Bar & Grill Boston', x: 198, y: 206 },
    { id: 'tam', name: 'The Tam', cat: 'drinks', kind: 'dive', dist: 0.25, till: '2 am', page: 'place/tam', q: 'The Tam Tremont St Boston', x: 132, y: 352 },
    { id: 'blackrose', name: 'The Black Rose', cat: 'drinks', kind: 'pub', dist: 0.4, till: '2 am', page: 'place/blackrose', q: 'The Black Rose State St Boston', x: 372, y: 96 },
    { id: 'bellinhand', name: 'Bell in Hand Tavern', cat: 'drinks', kind: 'tavern', dist: 0.45, till: '2 am', page: 'place/bellinhand', q: 'Bell in Hand Tavern Boston', x: 300, y: 50 },
    { id: 'unionoyster', name: 'Union Oyster House', cat: 'eat', kind: 'seafood', dist: 0.45, sug: true, page: 'place/unionoyster', q: 'Union Oyster House Boston', x: 286, y: 34 },
    { id: 'mikes', name: "Mike's Pastry", cat: 'eat', kind: 'bakery', dist: 0.8, sug: true, page: 'place/mikes', q: "Mike's Pastry Boston", x: 452, y: -158 },
    { id: 'bpl', name: 'Boston Public Library', cat: 'see', kind: 'library', dist: 1, sug: true, page: 'place/bpl', q: 'Boston Public Library Copley', x: -200, y: 640 },
  ];
  const PICON = { florabella: 'flower', brattle: 'book', opera: 'ticket', drphil: 'wrench', paku: 'food', common: 'tree', oldstate: 'columns', genki: 'fish', faneuil: 'bag', chinatown: 'gate',
    yvonnes: 'cocktail', silvertone: 'beer', tam: 'beer', blackrose: 'beer', bellinhand: 'beer', unionoyster: 'fish', mikes: 'food', bpl: 'book' };
  // Sample recommendations. On the real site they come from people who checked in.
  const SOCIAL = { common: { rec: 55, today: 12 }, faneuil: { rec: 47, today: 7 }, paku: { rec: 42, today: 8 }, brattle: { rec: 38, today: 4 }, florabella: { rec: 31, today: 6 },
    genki: { rec: 27, today: 3 }, drphil: { rec: 24, today: 2 }, opera: { rec: 22, today: 2 }, oldstate: { rec: 19, today: 1 }, chinatown: { rec: 16, today: 2 },
    bellinhand: { rec: 36, today: 9 }, silvertone: { rec: 33, today: 6 }, yvonnes: { rec: 29, today: 5 }, blackrose: { rec: 25, today: 4 }, tam: { rec: 21, today: 3 },
    unionoyster: { rec: 0, today: 0 }, mikes: { rec: 0, today: 0 }, bpl: { rec: 0, today: 0 } };
  // Sample visitor photos: real photos from Wikimedia Commons under free licenses (credits at #/credits).
  // Most aren't from these exact places. [place, caption, likes, who took it, average color, author, license, Commons file]
  const PHOTOS = [
    ['common', 'Frog Pond and the skyline', 52, 'Maya', '#466174', 'AlexiusHoratius', 'CC BY-SA 3.0', 'Frog_Pond_Boston_5.JPG'],
    ['common', 'Fall on the Common', 33, 'Lucas', '#787d66', 'Robert Linsdell', 'CC BY 2.0', 'View_from_Boston_Common_Frog_Pond,_Massachusetts_(493523)_(11061275685).jpg'],
    ['common', 'Skating on Frog Pond', 21, 'Ana', '#8b919b', 'Daderot', 'CC0', 'Boston_Common_Frog_Pond_-_IMG_8279.JPG'],
    ['faneuil', 'Faneuil Hall on a blue-sky day', 40, 'Priya', '#7f756b', 'Robert Linsdell', 'CC BY 2.0', 'Faneuil_Hall_Square,_Boston_(493562)_(11061833634).jpg'],
    ['faneuil', 'Lunch at Quincy Market', 37, 'Tom', '#677793', 'Brian-R-Phillips', 'CC BY-SA 4.0', 'Quincy_Market,_with_Custom_House_Tower,_Boston.jpg'],
    ['paku', 'Katsu plate', 34, 'Kenji', '#85724e', 'Fred Cherrygarden', 'CC BY-SA 4.0', 'Tonkatsu_at_Miyoshiya.jpg'],
    ['paku', 'Katsu curry', 21, 'Ana', '#79685b', 'Hykw-a4', 'CC BY-SA 3.0', 'Katsukare-.jpg'],
    ['paku', 'Gyoza to share', 12, 'Sam', '#946b3b', 'Enming Yan', 'CC BY-SA 4.0', 'Gyoza_no_Antei_-_3.jpg'],
    ['brattle', 'The outdoor book carts', 25, 'Leo', '#74635f', 'Rob Faulkner', 'CC BY 2.0', 'Alleyway_Bookstore_(13190847904)_(2).jpg'],
    ['brattle', 'The yellow front on West St', 18, 'Sofia', '#645c57', 'Sharon Mollerus', 'CC BY 2.0', 'Brattle_Book_Shop.jpg'],
    ['florabella', 'Sunflower bouquet', 41, 'Mei', '#3d4026', '4028mdk09', 'CC BY-SA 3.0', 'Altarschmuck_Sonnenblumen_und_Dahlien.JPG'],
    ['florabella', 'Pink roses', 19, 'Arjun', '#645458', 'Caroline Attwood', 'CC0', 'Pink_rose_bouquet_(Unsplash).jpg'],
    ['florabella', 'Fresh at the stand', 12, 'Ji-woo', '#7f5f5d', 'PattayaPatrol', 'CC BY-SA 4.0', 'DFC_4186_Bright_purple_orchids_and_fresh_white_blossoms_arranged_at_a_bustling_market_stall_ready_for_sale.jpg'],
    ['genki', 'Sushi rolls', 28, 'Lucas', '#8c7a45', 'Loozrboy', 'CC BY-SA 2.0', 'Golden_Maki_Rainbow_Roll_sushi.jpg'],
    ['genki', 'Torched nigiri', 17, 'Maya', '#8b6c50', 'ウィ貴公子', 'CC BY-SA 4.0', '202407171813_IMG_7121.jpg'],
    ['drphil', 'The repair bench', 9, 'Tom', '#605a53', 'Tech. Sgt. Christina Styer, US Air Force', 'Public domain', 'Volunteering_to_fix_what_we_break_130131-F-ME639-082.jpg'],
    ['drphil', 'Before the fix', 7, 'Sam', '#3c3d3f', 'Ashwin Kumar', 'CC BY-SA 2.0', 'Samsung_Galaxy_S2_shattered_screen.jpg'],
    ['opera', 'Inside before the show', 30, 'Sofia', '#4d3833', 'Sdkb', 'CC BY-SA 4.0', 'B.F._Keith_Memorial_Theater,_Boston_Opera_House_panorama_(front).jpg'],
    ['opera', 'The lobby ceiling', 14, 'Priya', '#755c44', 'Phoebe', 'CC BY-SA 4.0', 'Boston_Opera_House_interior_1_2024_02.jpg'],
    ['oldstate', 'The Old State House at sunset', 26, 'Leo', '#65503b', 'Rizka', 'CC BY-SA 3.0', 'Old_State_House,_Boston,_Massachusetts.JPG'],
    ['oldstate', 'The golden lion', 11, 'Kenji', '#927e6d', 'Farragutful', 'CC BY-SA 4.0', '2024_Old_State_House_Lion_-_Boston.jpg'],
    ['chinatown', 'The gate on Beach St', 20, 'Mei', '#616f77', '4300streetcar', 'CC BY 4.0', 'Chinatown_Gate_Boston_July_2025.jpg'],
    ['chinatown', 'The gate at night', 16, 'Ji-woo', '#584e45', 'FASTILY', 'CC BY-SA 4.0', 'Chinatown_gate,_Boston_1_2019-12-18.jpg'],
    ['yvonnes', 'Cocktails at the bar', 31, 'Priya', '#624b32', 'Cocktailmarler (derivative work: Jocian)', 'CC BY-SA 3.0', 'Rum,_Manhattan,_Tequila_Old_Fashioned_(1).jpg'],
    ['yvonnes', 'An old fashioned', 14, 'Lucas', '#f3dbc1', 'Tim Sackton', 'CC BY-SA 2.0', 'Rye_Old_Fashioned_(57-366)_-_Flickr_-_timsackton.jpg'],
    ['silvertone', 'Burger, fries and a beer', 27, 'Sam', '#795b43', 'JIP', 'CC BY-SA 4.0', 'Chipotle_burger_and_beer_at_Speakeasy_Finlayson.jpg'],
    ['tam', 'Beer on tap', 15, 'Leo', '#4a3e35', 'Bernt Rostad', 'CC BY 2.0', 'Taps_@_McGivney’s_(15089278651).jpg'],
    ['blackrose', 'A pint by the window', 19, 'Leo', '#60563d', 'Avatar (German Wikipedia)', 'Public domain', 'Guinness_on_table.jpg'],
    ['bellinhand', 'The front on Union St', 30, 'Priya', '#68635f', 'Seasider53', 'CC BY-SA 4.0', 'Bell_in_Hand_Tavern_2023.jpg'],
    ['bellinhand', 'The sign out front', 12, 'Maya', '#73787e', 'Rhododendrites', 'CC BY-SA 4.0', 'Bell_in_Hand_Tavern_(36199).jpg'],
    ['unionoyster', 'The brick front on Union St', 0, 'Tom', '#7a777a', 'Manuel Velazquez', 'CC BY 3.0', 'EL_VIEJO_UNION_OYSTER_HOUSE_-_panoramio.jpg'],
    ['mikes', 'Cannoli to go', 0, 'Mei', '#93775c', 'Gatorfan252525', 'CC BY-SA 4.0', "A_chocolate_chip_cannoli_(left)_and_cookies_&_cream_cannoli_(right)_from_Mike's_Pastry_in_Boston,_MA.jpg"],
    ['mikes', 'The line out the door', 0, 'Sam', '#72665b', 'Tim Sackton', 'CC BY-SA 2.0', "Mike's_Pastry_-2_(6709504099).jpg"],
    ['bpl', 'The library on Copley Square', 0, 'Leo', '#99989a', 'Lëa-Kim Châteauneuf', 'CC BY-SA 4.0', 'Boston_Public_Library,_McKim_Building_(11-2019).jpg'],
  ];
  const PH = {};
  PHOTOS.forEach(([place, cap, likes, by, color, artist, lic, file]) => {
    const list = PH[place] || (PH[place] = []);
    const key = place + '-' + list.length;
    list.push({ pid: key, place, cap, base: likes, by, color, src: 'p/' + key + '.webp', thumb: 'p/' + key + '-t.webp', artist, lic, file });
  });
  const CATS = ['eat', 'drinks', 'shop', 'see', 'services'];
  // Sample friends (once you're signed in) and what they recommend
  const FRIENDS = ['Sam K.', 'Priya S.', 'Leo M.'];
  const FRIEND_RECS = { silvertone: ['Sam K.', 'Priya S.'], tam: ['Sam K.'], bellinhand: ['Priya S.', 'Leo M.'], blackrose: ['Leo M.'], faneuil: ['Priya S.'], brattle: ['Leo M.'], paku: ['Leo M.'], drphil: ['Sam K.'] };
  const firstName = (n) => String(n).split(' ')[0];
  const EVENTS = [
    { id: 'market', day: 'today', now: true, until: '7 pm', name: 'Holiday market stalls', where: 'Summer St plaza', dist: 0.1, price: 'Free', q: 'Downtown Crossing Boston', x: 266, y: 314 },
    { id: 'music', day: 'today', now: true, until: '3 pm', name: 'Lunchtime street music', where: 'Winter St', dist: 0.1, price: 'Free', q: 'Winter St Boston', x: 176, y: 236 },
    { id: 'trivia', day: 'today', time: '5:30', ap: 'pm', name: 'Happy hour + trivia', where: '[Bar on Tremont St]', dist: 0.2, price: 'Free entry', sponsored: true, photo: true, tint: '#FCEBDD', ink: '#A2461A', x: 152, y: 300 },
    { id: 'musical', day: 'today', time: '7:30', ap: 'pm', name: '[Touring musical]', where: 'Boston Opera House', dist: 0.1, price: 'From [$]', photo: true, tint: '#EFE8F7', ink: '#5B3A8A', q: 'Boston Opera House', x: 208, y: 334 },
    { id: 'tour', day: 'tomorrow', time: '10', ap: 'am', name: 'Free walking tour', where: 'Boston Common', dist: 0.2, price: 'Free', q: 'Boston Common', x: 122, y: 236 },
    { id: 'gallery', day: 'tomorrow', time: '6', ap: 'pm', name: 'Gallery opening', where: '[Gallery on Washington St]', dist: 0.3, price: 'Free', x: 196, y: 374 },
    { id: 'jazz', day: 'tomorrow', time: '8', ap: 'pm', name: 'Live jazz', where: '[Club near Chinatown]', dist: 0.4, price: '[$] cover', x: 282, y: 362 },
    { id: 'makers', day: 'weekend', wd: 'Sat', time: '11', ap: 'am', name: 'Makers market', where: '[Plaza near Faneuil Hall]', dist: 0.4, price: 'Free', x: 318, y: 98 },
    { id: 'skate', day: 'weekend', wd: 'Sat', time: '4', ap: 'pm', name: 'Family skate', where: 'Frog Pond', dist: 0.3, price: 'From [$]', q: 'Frog Pond Boston Common', x: 100, y: 268 },
    { id: 'trucks', day: 'weekend', wd: 'Sun', time: '1', ap: 'pm', name: 'Food truck afternoon', where: 'City Hall Plaza', dist: 0.5, price: 'Free entry', q: 'City Hall Plaza Boston', x: 262, y: 140 },
  ];
  const WEEKDAY = { Sat: 'Saturday', Sun: 'Sunday' };
  const VENDORS = [
    { id: 'florabella', name: 'Florabella Flowers', short: 'Flowers', what: 'Bouquets and sunflowers', till: '6 pm', dist: 0.05, tint: '#F6E1E4', ink: '#B8232F', icon: 'flower', video: true, x: 230, y: 236, slides: ['Video', 'Photo', 'Photo'] },
    { id: 'dumpling', name: 'Dumpling cart', short: 'Street food', what: 'Street food', till: '8 pm', dist: 0.1, tint: '#FCEBDD', ink: '#A2461A', icon: 'food', video: true, x: 198, y: 294, slides: ['Video', 'Photo', 'Photo'] },
    { id: 'candles', name: 'Handmade candles', short: 'Candles', what: 'Holiday market stall', till: '7 pm', dist: 0.2, tint: '#EFE8F7', ink: '#5B3A8A', icon: 'candle', x: 150, y: 214, slides: ['Photo', 'Video', 'Photo'] },
    { id: 'vintage', name: 'Vintage rack', short: 'Vintage clothes', what: 'Secondhand clothes', till: '5 pm', dist: 0.2, tint: '#E6EDFA', ink: '#2A4E9B', icon: 'vintage', x: 282, y: 306, slides: ['Photo', 'Photo', 'Video'] },
  ];
  // Photos for the Live now stands (Wikimedia Commons, credited at #/credits; Florabella reuses its sunflowers)
  const VPHOTOS = {
    dumpling: ['Dumpling cart', '#897d26', 'PattayaPatrol', 'CC BY-SA 4.0', 'DFC_6168_Steaming_skewers_of_golden_pork_shumai_ready_to_bite_into_at_a_street_food_stall_in_Klet_Kaeo_Sattahip.jpg'],
    candles: ['Handmade candles', '#605c58', 'Mx. Granger', 'CC0', 'Candles_on_display_at_Diptyque.jpg'],
    vintage: ['Vintage rack', '#463e36', 'PattayaPatrol', 'CC BY-SA 4.0', 'DZ3_0654_A_bustling_night_market_stall_in_Sattahip_Thailand_where_shoppers_browse_racks_of_clothes_under_warm_lamps.jpg'],
  };
  const vPhoto = (v) => (VPHOTOS[v.id] ? { src: 'p/v-' + v.id + '.webp', thumb: 'p/v-' + v.id + '-t.webp', color: VPHOTOS[v.id][1] } : PH[v.id][0]);
  const LATER = [
    { name: 'Taco truck', what: 'Street food · Summer St', opens: '5 pm' },
    { name: 'Night market jewelry', what: 'Handmade jewelry · Winter St', opens: '6 pm' },
  ];
  const SPOTS = [
    { code: 'DTC-002', area: 'Post Office Square', x: 452, y: 170 },
    { code: 'DTC-003', area: 'City Hall Plaza', x: 240, y: -50, got: true },
    { code: 'NE-001', area: 'Hanover Street, North End', x: 420, y: -170, got: true },
    { code: 'NE-002', area: 'Paul Revere Mall, North End', x: 470, y: -250 },
    { code: 'NE-003', area: 'Columbus Park, North End', x: 560, y: -140 },
    { code: 'BH-001', area: 'State House steps, Beacon Hill', x: 70, y: -62 },
    { code: 'BH-002', area: 'Charles Street, Beacon Hill', x: -118, y: -60 },
    { code: 'CT-001', area: 'Chinatown', x: 320, y: 460 },
    { code: 'BB-001', area: 'Copley Square, Back Bay', x: -210, y: 600 },
    { code: 'BB-002', area: 'Newbury Street, Back Bay', x: -170, y: 520 },
  ];
  const LINE = { Red: { c: '#C8102E', ink: '#FFFFFF' }, Orange: { c: '#ED8B00', ink: '#1B1B1B' }, Green: { c: '#00843D', ink: '#FFFFFF' }, Blue: { c: '#003DA5', ink: '#FFFFFF' } };
  const STATIONS = [
    { id: 'dtx', name: 'Downtown Crossing', short: 'Downtown Crossing', lines: ['Red', 'Orange'], walk: 1, x: 232, y: 262,
      trains: [['Red', 'Alewife', '2 min', '9 min'], ['Red', 'Ashmont/Braintree', '4 min', '12 min'], ['Orange', 'Oak Grove', '3 min', '10 min'], ['Orange', 'Forest Hills', 'Now', '7 min']] },
    { id: 'park', name: 'Park Street', short: 'Park St', lines: ['Red', 'Green'], walk: 4, x: 170, y: 180,
      trains: [['Red', 'Alewife', '3 min', '10 min'], ['Red', 'Ashmont/Braintree', '5 min', '13 min'], ['Green', 'B · Boston College', '2 min', '8 min'], ['Green', 'E · Medford/Tufts', '4 min', '11 min']] },
    { id: 'state', name: 'State', short: 'State', lines: ['Orange', 'Blue'], walk: 5, x: 176, y: 96,
      trains: [['Orange', 'Oak Grove', '2 min', '9 min'], ['Orange', 'Forest Hills', '5 min', '12 min'], ['Blue', 'Wonderland', '3 min', '11 min'], ['Blue', 'Bowdoin', '6 min', '']] },
    { id: 'chinatown', name: 'Chinatown', short: 'Chinatown', lines: ['Orange'], walk: 5, x: 212, y: 398,
      trains: [['Orange', 'Oak Grove', '4 min', '11 min'], ['Orange', 'Forest Hills', '1 min', '8 min']] },
    { id: 'boylston', name: 'Boylston', short: 'Boylston', lines: ['Green'], walk: 6, x: 52, y: 392,
      trains: [['Green', 'B · Boston College', '3 min', '11 min'], ['Green', 'D · Riverside', '6 min', ''], ['Green', 'E · Medford/Tufts', '2 min', '9 min']] },
  ];

  /* ---------- demo: other looks and features on/off ---------- */
  const LOOKS = [
    // Nov 19 mockups: a real map (OpenStreetMap), fewer controls, smarter picks, and a new dark mode
    { k: 'n1', fresh: true, name: '1 · Simple map', desc: 'Like Apple Maps: a real map with named pins, one search bar and five big buttons. No tabs or sort row.' },
    { k: 'n2', fresh: true, name: '2 · Right now', desc: 'A feed that changes with the time: drinks open now, tonight\'s show, dinner people love.' },
    { k: 'n3', fresh: true, name: '3 · Just ask', desc: 'Type or tap what you\'re in the mood for and get three picks, each with a reason.' },
    { k: 'n4', fresh: true, name: 'Place page', desc: 'Photos up top, one big Directions button, then the critic and your friends.' },
    { k: 'n5', fresh: true, name: 'Dark: Night', desc: 'The same screen in a darker, higher-contrast dark mode. Look 1 is the Apple Maps-style one.' },
    { k: 'n6', fresh: true, name: 'Light', desc: 'The same screen for daytime.' },
    { k: 'h', name: 'H · D, calmer', live: true, desc: "The map with a pull-up list and three tabs. It's the one you're using." },
    { k: 'a', name: 'A · Classic', desc: "Matches Dr Phil's sign: a clean list with categories, a radius and the 10 languages." },
    { k: 'b', name: 'B · Map first', desc: 'A big map up top with numbered pins, and the list underneath.' },
    { k: 'c', name: 'C · Walk lines', desc: 'Places as stops on walk-time lines, like a subway map.' },
    { k: 'd', name: 'D · The blend', desc: "A's look with a small map, Live now, the walk line and the T, all on one page." },
    { k: 'e', name: 'E · Calm list', desc: 'A quiet list. A Map button opens a full-screen map.' },
    { k: 'f', name: 'F · Three tabs', desc: 'Nearby, Map and Live now along the bottom.' },
    { k: 'g', name: 'G · Map + pull-up list', desc: 'The map fills the top and the list slides up over it.' },
  ];
  const FEATURES = [
    ['events', "What's on", 'The events tab: shows, markets, free stuff'],
    ['live', 'Live now', 'Pop-up and market vendors selling right now'],
    ['transit', 'The T', 'Stations on the map and the next trains'],
    ['spots', 'Spots & badges', 'Tap DTC-001 to collect signs and walk the Freedom Trail'],
    ['featured', 'Featured businesses', 'Paid spots with photos and a deal, always labeled Sponsored'],
    ['langs', '10 languages', 'The flag button up top'],
    ['points', 'Points', 'Sign in, then check in, review and add photos to earn points and level up'],
    ['colors', 'Category colors', 'Eat, Shop, See and Services each get a color on the map and the list'],
  ];
  const FDEF = { events: true, live: true, transit: true, spots: true, featured: true, langs: true, points: true, colors: true };
  function loadFlags() {
    try { return Object.assign({}, FDEF, JSON.parse(localStorage.getItem('ilb-f') || '{}')); } catch (e) { return Object.assign({}, FDEF); }
  }
  // Four ways to show the Nearby list. Picked in Demo; the phone remembers it.
  const STYLES = [
    { k: 'picks', name: 'Top picks', icon: 'thumb', desc: 'Big photo cards, ranked by how many people recommend each place' },
    { k: 'photos', name: 'Photos', icon: 'photo', desc: 'Every photo people took of what they got, most-liked first' },
    { k: 'best', name: 'Best of', icon: 'medal', desc: 'A row of photos per category, with gold, silver and bronze' },
    { k: 'walk', name: 'Walk line', icon: 'steps', desc: 'The old one: places in order of how close they are' },
  ];
  function loadStyle() {
    try { const v = localStorage.getItem('ilb-style'); return STYLES.some((s) => s.k === v) ? v : 'picks'; } catch (e) { return 'picks'; }
  }
  function saveStyle() {
    try { localStorage.setItem('ilb-style', S.style); } catch (e) { /* ignore */ }
  }
  function loadTheme() {
    try { const v = localStorage.getItem('ilb-theme'); return v === 'light' || v === 'dark' ? v : 'auto'; } catch (e) { return 'auto'; }
  }
  function applyTheme() {
    const root = document.documentElement;
    if (S.theme === 'auto') root.removeAttribute('data-theme'); else root.setAttribute('data-theme', S.theme);
    try { if (S.theme === 'auto') localStorage.removeItem('ilb-theme'); else localStorage.setItem('ilb-theme', S.theme); } catch (e) { /* ignore */ }
  }
  function saveFlags() {
    try { localStorage.setItem('ilb-f', JSON.stringify(S.f)); } catch (e) { /* ignore */ }
  }

  /* ---------- state ---------- */
  const S = {
    route: 'h', arg: '',
    tab: 'near', cat: 'all', day: 'today', sheet: 'half', sel: null, tx: null, ty: null, tOpen: 'dtx', tShow: false,
    lang: detectLang(), langOpen: false,
    pTab: 'spots', badge: 'downtown', tracking: false,
    slide: 0, liveOpen: -1, liveSlide: 0,
    f: loadFlags(), demoOpen: false, demoTab: 'looks', view: -1, theme: loadTheme(), style: loadStyle(), z: 1,
    // points and the visitor's own check-ins, recommendations, likes and photos (this visit only)
    points: 135, checked: {}, recd: {}, liked: {}, mine: {}, sv: 0, howOpen: false, firstCheck: false, likedOnce: false,
    user: loadUser(), myRev: {}, signOpen: false, signing: '', pending: null, reviewFor: null, rvUp: null, rvText: '',
    sort: 'top', added: {}, addOpen: false, addQ: '',
  };
  function detectLang() {
    try {
      const saved = localStorage.getItem('ilb-lang');
      if (saved && STR[saved]) return saved;
    } catch (e) { /* storage blocked */ }
    const nav = ((navigator.languages && navigator.languages[0]) || navigator.language || 'en').toLowerCase().slice(0, 2);
    return STR[nav] ? nav : 'en';
  }
  const T = () => (S.f.langs ? (STR[S.lang] || STR.en) : STR.en);
  const tabsOn = () => [['near', true], ['events', S.f.events], ['live', S.f.live]].filter((x) => x[1]).map((x) => x[0]);

  /* ---------- toast ---------- */
  let toastTimer = 0;
  function toast(msg, ms) {
    let el = $('#toast');
    if (!el) { el = document.createElement('div'); el.id = 'toast'; el.className = 'toast'; el.setAttribute('role', 'status'); app.appendChild(el); }
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, ms || 1800);
  }

  /* ---------- recommendations, photos and points ---------- */
  const recOf = (id) => SOCIAL[id].rec + (S.recd[id] ? 1 : 0);
  const todayOf = (id) => SOCIAL[id].today + (S.recd[id] ? 1 : 0);
  // "40+ recommend", "5+ today": round down so the badges stay steady
  const bucket = (n) => (n >= 100 ? Math.floor(n / 100) * 100 + '+' : n >= 10 ? Math.floor(n / 10) * 10 + '+' : String(n));
  const hotLabel = (n) => (n >= 10 ? '10+' : n >= 5 ? '5+' : '');
  const placeById = (id) => PLACES.find((x) => x.id === id);
  function photosOf(id) {
    const list = PH[id].map((ph) => Object.assign({}, ph, { likes: ph.base + (S.liked[ph.pid] ? 1 : 0) }));
    if (S.mine[id]) list.push({ pid: id + '-me', place: id, cap: 'Your photo', likes: 0, by: 'you', color: '#6B7A90', mine: true, url: S.mine[id] });
    return list.sort((a, b) => b.likes - a.likes);
  }
  const topPhoto = (id) => photosOf(id)[0];
  // the photo itself; small = the 180px version for pins and thumbnails. Lazy unless it's near the top.
  const phImg = (ph, small, lazy) => `<img src="${ph.url || (small ? ph.thumb : ph.src)}" alt=""${lazy === false ? '' : ' loading="lazy"'} decoding="async" draggable="false">`;
  function socHTML(id, exact) {
    const t = T();
    const r = recOf(id), d = todayOf(id);
    const hot = exact ? (d > 0 ? String(d) : '') : hotLabel(d);
    return `<span class="soc"><span class="rec">${I.s(P.thumb, 14, 2.2)}${esc(t.rec(exact ? r : bucket(r)))}</span>${hot ? `<span class="hot">${I.s(P.flame, 12, 2.4)}${esc(t.todayN(hot))}</span>` : ''}</span>`;
  }
  function likeBtn(ph) {
    if (ph.mine) return '<span class="ph-like mine">Yours</span>';
    const on = !!S.liked[ph.pid];
    return `<button type="button" class="ph-like" data-act="like" data-v="${ph.pid}" aria-pressed="${on}" aria-label="Like this photo. ${ph.likes} likes">${I.heart(15, 14, on ? '#E0344B' : 'none', on ? '#E0344B' : 'currentColor', 2.2)}<span>${ph.likes}</span></button>`;
  }
  /* ---------- accounts: sign in with Google or Apple (a demo here) ----------
     Points, levels, spots, reviews, photos and likes need an account, so every review comes
     from a real person who signed in and checked in. Looking around never needs one. */
  function loadUser() {
    try { const u = JSON.parse(localStorage.getItem('ilb-user') || 'null'); return u && u.name ? u : null; } catch (e) { return null; }
  }
  function saveUser() {
    try { if (S.user) localStorage.setItem('ilb-user', JSON.stringify(S.user)); else localStorage.removeItem('ilb-user'); } catch (e) { /* ignore */ }
  }
  const GLOGO = '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/><path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>';
  const ALOGO = '<svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/></svg>';
  const AV_COLORS = ['#1F5BD8', '#B8232F', '#15803D', '#7E22CE', '#C2410C', '#0E7490', '#9D174D'];
  const avColor = (name) => AV_COLORS[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % AV_COLORS.length];
  const avatar = (name, size) => `<span class="av" style="width:${size}px;height:${size}px;font-size:${Math.round(size * 0.45)}px;background:${avColor(name)}" aria-hidden="true">${esc([...name][0])}</span>`;
  const levelOf = (pts) => { let i = 0; LEVELS.forEach((l, j) => { if (pts >= l[0]) i = j; }); return i; };
  function signBtns() {
    const t = T();
    const btn = (prov, logo, label) => `<button type="button" class="sbtn ${prov === 'Google' ? 'g' : 'a'}" data-act="signin" data-v="${prov}"${S.signing ? ' disabled' : ''}>${S.signing === prov ? '<span class="ldspin" aria-hidden="true"></span>' : logo}<span>${esc(label)}</span></button>`;
    return btn('Google', GLOGO, t.withGoogle) + btn('Apple', ALOGO, t.withApple);
  }
  // returns true (and asks you to sign in) when there's no account yet; the action runs right after signing in
  function needSign(act, v) {
    if (S.user) return false;
    S.pending = act ? { act, v } : null;
    S.signOpen = true; S.signing = '';
    refresh();
    return true;
  }
  function signHTML() {
    const t = T();
    return `<div class="lang-dim" data-act="sign-close"></div>
      <div class="lang-sheet sign-sheet" role="dialog" aria-label="${esc(t.signIn)}">
        <div class="lang-head"><h2>${I.heart(20, 18, '#B8232F')} ${esc(t.signIn)}</h2><button type="button" class="pv-x" data-act="sign-close" aria-label="Close">${I.s(P.x, 20)}</button></div>
        <p class="sign-t">${esc(t.signTitle)}</p>
        <p class="sign-b">${esc(t.signBody)}</p>
        ${signBtns()}
        <p class="small muted sign-demo">Demo: nothing is sent to Google or Apple. The real site only gets your name and profile photo.</p>
      </div>`;
  }
  function doSignIn(prov) {
    if (S.signing) return;
    S.signing = prov; refresh();
    setTimeout(() => {
      S.user = { name: 'Alex R.', provider: prov };
      S.signing = ''; S.signOpen = false; S.sv++;
      saveUser();
      const p = S.pending; S.pending = null;
      refresh();
      toast('Signed in with ' + prov + ' as Alex R. (demo)\n' + (S.f.points ? S.points + ' points · Level ' + (levelOf(S.points) + 1) + ' · ' + LEVELS[levelOf(S.points)][1] : 'Reviews, photos and likes are on'), 2800);
      if (p) setTimeout(() => runAct(p.act, p.v), 500);
    }, 650);
  }
  function signOut() {
    S.user = null; S.points = 135; S.checked = {}; S.recd = {}; S.liked = {}; S.mine = {}; S.myRev = {}; S.added = {}; S.firstCheck = false; S.sv++;
    if (S.cat === 'friends') S.cat = 'all';
    saveUser(); refresh();
    toast('Signed out. Points, reviews and likes need an account.');
  }
  function runAct(act, v) {
    if (act === 'checkin') doCheckin(v);
    else if (act === 'review') doReview(v);
    else if (act === 'recommend') doRecommend(v);
    else if (act === 'cat') { S.cat = v; refresh(); }
    else if (act === 'like') doLike(v);
    else if (act === 'photo') toast('You’re signed in. Tap Add photo to pick one.');
    else if (act === 'add-open') { S.addOpen = true; S.addQ = ''; refresh(); }
  }
  function earnHTML(id) {
    if (!S.f.points) return '';
    const t = T();
    const b = (act, icon, label, doneLabel, pts, done) => `<button type="button" class="earn-b${done ? ' done' : ''}" data-act="${act}" data-v="${id}"${done ? ' aria-disabled="true"' : ''}>
        <span class="eb-top">${I.s(done ? P.check : icon, 18, done ? 2.6 : 2)}${done ? '' : `<span class="eb-p">+${pts}</span>`}</span><span class="eb-l">${esc(done ? doneLabel : label)}</span></button>`;
    const head = S.user ? `<span class="earn-h">${esc(t.beenHere)}</span>` : `<button type="button" class="earn-h sign-link" data-act="sign-open">${I.s(P.lock, 13, 2.4)}<span>${esc(t.signToEarn)}</span></button>`;
    return `<div class="earn">${head}<div class="earn-row">${b('checkin', P.pin, t.checkIn, t.checkedIn, 10, !!S.checked[id])}${b('recommend', P.thumb, t.recommend, t.recommended, 5, !!S.recd[id])}${b('photo', P.camera, t.addPhoto, t.photoAdded, 20, !!S.mine[id])}</div></div>`;
  }
  function refresh() {
    if (S.route === 'h' || !SCREENS[S.route]) { if (hMounted) updH(); } else rerenderScreen();
  }
  function earn(n, msg, extra) {
    if (S.f.points) S.points += n;
    S.sv++;
    refresh();
    toast(S.f.points ? '+' + n + ' points · ' + msg + '\n' + (extra || S.points + ' points in all') : msg, 3000);
  }
  // Every action checks your location first (a stand-in here). Reviews and photos check you in on the way.
  function autoCheck(id) {
    if (S.checked[id]) return 0;
    S.checked[id] = true;
    return 10;
  }
  function doCheckin(id) {
    if (needSign('checkin', id)) return;
    if (S.checked[id]) { toast('You already checked in here today.'); return; }
    S.checked[id] = true;
    earn(10, 'Checked in at ' + placeById(id).name, S.firstCheck ? '' : 'Demo: on the real site, your phone’s location confirms you’re there.');
    S.firstCheck = true;
  }
  function doReview(id) {
    if (needSign('review', id)) return;
    if (S.myRev[id]) { toast('You already reviewed this place today.'); return; }
    S.reviewFor = id; S.rvUp = null; S.rvText = '';
    refresh();
  }
  function postReview() {
    const id = S.reviewFor;
    if (!id || S.rvUp == null) return;
    const text = (S.rvText || '').trim().slice(0, 280);
    S.myRev[id] = { up: S.rvUp, text };
    if (S.rvUp) S.recd[id] = true;
    S.reviewFor = null;
    const chk = autoCheck(id);
    const words = text.length >= 10;
    earn(5 + (words ? 5 : 0) + chk, 'Review posted for ' + placeById(id).name, (chk ? 'Checked in too (+10). ' : '') + (words ? 'A few words: +5 more.' : 'Add a few words next time for +5 more.'));
  }
  function reviewHTML() {
    const t = T(), p = placeById(S.reviewFor), up = S.rvUp;
    return `<div class="lang-dim" data-act="rv-close"></div>
      <div class="lang-sheet rv-sheet" role="dialog" aria-label="${esc(t.review)}: ${esc(p.name)}">
        <div class="lang-head"><h2>${esc(t.wouldRec(p.name))}</h2><button type="button" class="pv-x" data-act="rv-close" aria-label="Close">${I.s(P.x, 20)}</button></div>
        <div class="rv-pick">
          <button type="button" class="rvb${up === true ? ' on' : ''}" data-act="rv-up" data-v="1" aria-pressed="${up === true}">${I.s(P.thumb, 20, 2.2)}<span>${esc(t.yes)}</span></button>
          <button type="button" class="rvb dn${up === false ? ' on' : ''}" data-act="rv-up" data-v="0" aria-pressed="${up === false}"><span class="tdown">${I.s(P.thumb, 20, 2.2)}</span><span>${esc(t.notReally)}</span></button>
        </div>
        <textarea class="rv-text" id="rvText" rows="3" maxlength="280" placeholder="${esc(t.sayWhy)}">${esc(S.rvText || '')}</textarea>
        <button type="button" class="btn primary wide" data-act="rv-post"${up == null ? ' disabled' : ''}>${esc(t.post)}${S.f.points ? ' · +5' : ''}</button>
        <p class="rv-as">${avatar(S.user.name, 24)}<span>${esc(S.user.name)} · signed in with ${esc(S.user.provider)} · ${S.checked[p.id] ? '✓ checked in' : 'checks you in when you post'}</span></p>
      </div>`;
  }
  // One tap to recommend a place you went to. Everyone sees the count; your friends see your name.
  function doRecommend(id) {
    if (needSign('recommend', id)) return;
    const p = placeById(id);
    if (S.recd[id]) { toast('You already recommend ' + p.name + '.'); return; }
    S.recd[id] = true;
    if (p.sug) S.added[id] = true;
    const chk = autoCheck(id);
    earn(5 + chk, 'You recommend ' + p.name, (chk ? 'Checked in too (+10). ' : '') + (p.sug ? 'It’s on the map now for everyone.' : 'Everyone sees it, and your friends see your name.'));
  }
  // "Recommend a place": search what's around and recommend it in one tap, even places that aren't listed yet
  function addHTML() {
    const t = T();
    const q = (S.addQ || '').trim().toLowerCase();
    const rows = PLACES.slice().sort((a, b) => a.dist - b.dist).map((p) => {
      const ph = topPhoto(p.id), done = !!S.recd[p.id];
      const key = (p.name + ' ' + t[p.kind] + ' ' + (STR.en[p.kind] || '')).toLowerCase();
      return `<div class="addrow" data-name="${esc(key)}"${q && !key.includes(q) ? ' hidden' : ''}><span class="addimg" style="background:${ph.color}">${phImg(ph, true)}</span>
        <span class="addtxt"><b>${esc(p.name)}</b><span>${metaLine(p)}${p.sug && !S.added[p.id] ? ` · <em>${esc(t.newTag)}</em>` : ''}</span></span>
        <button type="button" class="addgo${done ? ' done' : ''}" data-act="recommend" data-v="${p.id}"${done ? ' aria-disabled="true"' : ''}>${I.s(done ? P.check : P.thumb, 15, 2.4)}<span>${esc(done ? t.recommended : t.recommend)}</span></button></div>`;
    }).join('');
    return `<div class="lang-dim" data-act="add-close"></div>
      <div class="lang-sheet add-sheet" role="dialog" aria-label="${esc(t.recPlace)}">
        <div class="lang-head"><h2>${I.s(P.thumb, 20, 2.2)} ${esc(t.recPlace)}</h2><button type="button" class="pv-x" data-act="add-close" aria-label="Close">${I.s(P.x, 20)}</button></div>
        <p class="sign-b">${esc(t.recPlaceSub)}</p>
        <label class="addsearch">${I.s(P.search, 18, 2.2)}<input id="addQ" type="search" placeholder="${esc(t.searchPlaces)}" value="${esc(S.addQ || '')}" autocomplete="off" enterkeyhint="search"></label>
        <div class="addlist">${rows}</div>
        <p class="small muted sign-demo">Demo: places near this sign. On the real site you can search any place in Boston, and its photos and details fill in from Google on their own.</p>
      </div>`;
  }
  function toolsHTML(st) {
    const t = T();
    const seg = st === 'picks' ? `<div class="seg2" role="group" aria-label="Sort"><button type="button" data-act="sort" data-v="top" aria-pressed="${S.sort !== 'near'}">${I.s(P.thumb, 15, 2.3)}<span>${esc(t.sortTop)}</span></button><button type="button" data-act="sort" data-v="near" aria-pressed="${S.sort === 'near'}">${I.s(P.pin, 15, 2.3)}<span>${esc(t.sortNear)}</span></button></div>` : '<span></span>';
    return `<div class="tools">${seg}<button type="button" class="addbtn" data-act="add-open">${I.s(P.plus, 16, 2.6)}<span>${esc(t.recommend)}</span></button></div>`;
  }
  function friendsBanner() {
    const t = T();
    return `<div class="frb"><span class="avs">${FRIENDS.map((n) => avatar(n, 28)).join('')}</span><span class="frb-t"><b>${esc(t.friendsHere)}</b><span>${esc(FRIENDS.map(firstName).join(', '))}</span></span><button type="button" class="btn small2" data-act="invite">${I.s(P.share, 15, 2.2)}<span>${esc(t.inviteFriends)}</span></button></div>`;
  }
  async function invite() {
    const url = location.origin + location.pathname;
    try {
      if (navigator.share) { await navigator.share({ title: 'I Love Boston', text: 'See what our friends recommend near Downtown Crossing', url }); return; }
      await navigator.clipboard.writeText(url); toast('Invite link copied');
    } catch (e) { if (!(e && e.name === 'AbortError')) toast('Invite link: ' + url, 3200); }
  }
  function overlaysHTML() {
    if (S.signOpen) return signHTML();
    if (S.addOpen) return addHTML();
    if (S.reviewFor && S.user) return reviewHTML();
    return '';
  }
  const ovWrap = () => { const o = overlaysHTML(); return o ? `<div class="lang-wrap ov">${o}</div>` : ''; };
  // "Add photo" opens the phone's camera or photo library. The photo stays on the phone: nothing is uploaded.
  let photoFor = null;
  const fileIn = document.createElement('input');
  fileIn.type = 'file'; fileIn.accept = 'image/*'; fileIn.className = 'file-in'; fileIn.tabIndex = -1;
  fileIn.setAttribute('aria-hidden', 'true');
  document.body.appendChild(fileIn);
  fileIn.addEventListener('change', () => {
    const f = fileIn.files && fileIn.files[0];
    const id = photoFor;
    photoFor = null;
    fileIn.value = '';
    if (!f || !id || !/^image\//.test(f.type || 'image/')) return;
    S.mine[id] = URL.createObjectURL(f);
    const chk = autoCheck(id);
    earn(20 + chk, 'Photo added at ' + placeById(id).name, (chk ? 'Checked in too (+10). ' : '') + 'Demo: it stays on your phone.');
  });
  function doPhoto(id) {
    if (needSign('photo', id)) return;
    if (S.mine[id]) { toast('You already added a photo here.'); return; }
    photoFor = id;
    fileIn.click();
  }
  function doLike(pid) {
    if (needSign('like', pid)) return;
    S.liked[pid] = !S.liked[pid]; S.sv++;
    refresh();
    if (S.liked[pid] && !S.likedOnce) { S.likedOnce = true; toast('Liked. The most-liked photos get featured, and whoever took it gets a point.', 2800); }
  }
  const LEVELS = [[0, 'Visitor'], [100, 'Explorer'], [250, 'Local'], [500, 'Insider'], [1000, 'Legend']];
  const EARN = [['Scan a sign', 15], ['Check in at a place', 10], ['Recommend a place', 5], ['Write a review', 5], ['Write a few words in it', 5], ['Add a photo of what you got', 20], ['Someone likes your photo', 1], ['Your photo gets featured', 50]];

  /* ---------- reviews and local critics (sample) ---------- */
  // Sample reviews from signed-in visitors who checked in: [name, level, when, recommends, text]
  const REVIEWS = {
    common: [['Maya R.', 3, 'Nov 15', true, 'Walked the whole loop at golden hour. Skating on Frog Pond starts soon.'], ['Kenji T.', 2, 'Nov 12', true, 'Perfect spot to sit with a coffee between everything else.']],
    faneuil: [['Priya S.', 4, 'Nov 16', true, 'Touristy but fun. Grab food inside Quincy Market and eat on the steps.'], ['Tom B.', 1, 'Nov 9', false, 'Packed on a Saturday. Go on a weekday morning.']],
    paku: [['Kenji T.', 2, 'Nov 17', true, 'Huge, crispy katsu. The curry version is my go-to.'], ['Ana L.', 3, 'Nov 14', true, 'Fast lunch, friendly staff, fair prices.']],
    brattle: [['Leo M.', 3, 'Nov 16', true, 'Lost an hour at the outdoor carts. Found a first edition inside.'], ['Sofia G.', 2, 'Nov 10', true, 'A real Boston classic. Three floors of books.']],
    florabella: [['Mei W.', 2, 'Nov 17', true, 'Gorgeous sunflowers, wrapped while I waited.'], ['Arjun P.', 1, 'Nov 13', true, 'Grabbed roses on the way to dinner. Super sweet people.']],
    genki: [['Lucas F.', 3, 'Nov 15', true, 'Fresh rolls and big portions for the price.'], ['Maya R.', 3, 'Nov 8', true, 'Quiet and cozy. The torched nigiri is worth it.']],
    drphil: [['Tom B.', 1, 'Nov 16', true, 'Cracked screen fixed in under an hour while I got lunch.'], ['Sam K.', 2, 'Nov 11', true, 'Honest price, and they explained everything.']],
    opera: [['Sofia G.', 2, 'Nov 14', true, 'The lobby alone is worth it. Stunning.'], ['Priya S.', 4, 'Nov 7', false, 'Beautiful, but the upper balcony seats are tight.']],
    oldstate: [['Leo M.', 3, 'Nov 12', true, 'Small museum, big history. Look up at the lion and the unicorn.'], ['Kenji T.', 2, 'Nov 6', true, 'Quick stop on the Freedom Trail, very well done.']],
    chinatown: [['Mei W.', 2, 'Nov 15', true, 'Pretty at night, with great food just past the gate.'], ['Ji-woo H.', 1, 'Nov 10', true, 'A good start for a dumpling crawl.']],
    yvonnes: [['Priya S.', 4, 'Nov 15', true, 'Gorgeous room and great cocktails. Book ahead on weekends.'], ['Lucas F.', 3, 'Nov 8', true, 'Pricey, but worth it for a night out.']],
    silvertone: [['Sam K.', 2, 'Nov 16', true, 'Cozy booths and solid comfort food after work.'], ['Ana L.', 3, 'Nov 12', true, 'Easy spot to meet friends right by Downtown Crossing.']],
    tam: [['Leo M.', 3, 'Nov 14', true, 'No frills, cheap drinks, friendly bartenders.'], ['Ji-woo H.', 1, 'Nov 9', true, 'A true dive, in the best way.']],
    blackrose: [['Leo M.', 3, 'Nov 15', true, 'Classic Irish pub. Good pints, good music.'], ['Kenji T.', 2, 'Nov 10', true, 'Cozy spot near Faneuil Hall.']],
    bellinhand: [['Priya S.', 4, 'Nov 17', true, 'Old-school tavern, fun with a group.'], ['Tom B.', 1, 'Nov 13', false, 'Fun, but loud and packed on weekends.']],
  };
  // Sample critics' picks. The real site would name the critic and publication and link to the review.
  const CRITICS = {
    paku: ['A local food critic', 'Crispy, generous katsu, and one of the easiest good lunches downtown.'],
    genki: ['A local food critic', 'Bright, carefully made rolls and a calm, friendly room.'],
    brattle: ['A Boston guidebook', 'One of the oldest antiquarian bookshops in the country. Start at the outdoor carts.'],
    oldstate: ['A Boston history writer', 'Where the Declaration of Independence was read to Bostonians in July 1776.'],
  };
  const critPill = (id, onImg) => (CRITICS[id] ? `<span class="crit${onImg ? ' onimg' : ''}">🏆<span>${esc(T().criticsPick)}</span></span>` : '');
  function critHTML(id) {
    const c = CRITICS[id];
    if (!c) return '';
    return `<section class="critsec"><div class="rev-h"><h2>🏆 What critics say</h2><span class="small muted">Sample</span></div>
        <blockquote class="critq"><p>“${esc(c[1])}”</p><footer>${esc(c[0])} · <button type="button" class="linkbtn2" data-act="demo" data-v="Opens the critic's review (demo)">Read the review</button></footer></blockquote></section>`;
  }
  function reviewsHTML(id) {
    const list = (REVIEWS[id] || []).slice();
    const mine = S.myRev[id];
    const card = (name, lvl, when, up, text, isMine) => `<article class="rv">
        <div class="rv-h">${avatar(name, 34)}<span class="rv-who"><b>${esc(name)}${isMine ? ' · you' : ''}</b><span>Level ${lvl} · ${LEVELS[lvl - 1][1]} · ✓ checked in ${esc(when)}</span></span>
          <span class="rv-up${up ? '' : ' dn'}" aria-label="${up ? 'Recommends it' : "Doesn't recommend it"}">${up ? I.s(P.thumb, 15, 2.4) : `<span class="tdown">${I.s(P.thumb, 15, 2.4)}</span>`}</span></div>
        ${text ? `<p>${esc(text)}</p>` : ''}</article>`;
    const rows = (mine && S.user ? card(S.user.name, levelOf(S.points) + 1, 'today', mine.up, mine.text, true) : '') + list.map((r) => card(r[0], r[1], r[2], r[3], r[4], false)).join('');
    return `<section class="revs"><div class="rev-h"><h2>Reviews</h2><span class="small muted">Sample</span></div>
        <p class="revs-note">${I.s(P.check, 14, 2.6)} Only people who signed in with Google or Apple and checked in here can review, so every review is a real visit.</p>
        ${rows}
        ${mine ? '' : `<button type="button" class="btn wide" data-act="review" data-v="${id}">${I.s(P.thumb, 18, 2.2)}<span>Write a review</span></button>`}</section>`;
  }

  /* ---------- router ---------- */
  function route() {
    const h = location.hash.replace(/^#\/?/, '');
    const parts = h.split('/');
    S.route = parts[0] || 'h';
    S.arg = parts[1] || '';
    if (S.route === 'looks') { S.route = 'h'; S.demoOpen = true; S.demoTab = 'looks'; }
    if (S.route === 'mockups') { S.route = 'h'; S.demoOpen = true; S.demoTab = 'looks'; S.view = Math.max(0, LOOKS.findIndex((l) => l.fresh)); }
    if (S.route === 'live' && S.arg) {
      const ix = VENDORS.findIndex((v) => v.id === S.arg);
      if (ix >= 0) { S.liveOpen = ix; S.liveSlide = 0; }
    }
    render();
  }
  function render() {
    if (S.route === 'h' || !SCREENS[S.route]) { mountH(); return; }
    hMounted = false;
    app.innerHTML = SCREENS[S.route]() + ovWrap();
    const sc = $('.scroll', app);
    if (sc) sc.scrollTop = 0;
  }
  function rerenderScreen() {
    const sc = $('.scroll', app);
    const top = sc ? sc.scrollTop : 0;
    app.innerHTML = SCREENS[S.route]() + ovWrap();
    const sc2 = $('.scroll', app);
    if (sc2) sc2.scrollTop = top;
  }

  /* =================================================================
     H: the map with a pull-up list
     ================================================================= */
  let hMounted = false;
  let G = null;                 // geometry
  let cur = { tx: 0, ty: 0, k: 1 };   // live translate and zoom while dragging or pinching
  let md = null, sd = null, moved = false, dragTop = null, justDragged = false;
  let sig = { pins: '', body: '', prev: '' };
  const prevSig = () => [S.sel, S.lang, S.sv, JSON.stringify(S.f), !!S.user].join('|');

  function geo() {
    const W = app.clientWidth, H = app.clientHeight;
    const pr = $('#safe');
    const cs = pr ? getComputedStyle(pr) : null;
    const st = cs ? parseFloat(cs.paddingTop) || 0 : 0;
    const sb = cs ? parseFloat(cs.paddingBottom) || 0 : 0;
    const half = Math.round(H * 0.49);
    return { W, H, st, sb, full: Math.max(92, st + 80), half, peek: H - 76 - sb, baseX: Math.round((W - 390) / 2), baseY: Math.round(half * 0.62) - 256 };
  }
  function topFor(state) { return G[state]; }
  function prevTop() {
    const el = $('#sheetPrev');
    const h = el ? el.offsetHeight : 230;
    return G.H - Math.max(h, 200);
  }
  function sheetTop() {
    if (S.sel) return prevTop();
    if (dragTop != null) return dragTop;
    return topFor(S.sheet);
  }
  // How far the map can move: its edges never come inside the screen. k is the zoom.
  function bounds(top, k) {
    const z = k || S.z;
    const b = { txMin: G.W - WORLD.x1 * z, txMax: -WORLD.x0 * z, tyMin: Math.min(0, top - WORLD.y1 * z), tyMax: -WORLD.y0 * z };
    if (b.txMin > b.txMax) b.txMin = b.txMax = (b.txMin + b.txMax) / 2;
    if (b.tyMin > b.tyMax) b.tyMin = b.tyMax;
    return b;
  }
  const ZMAX = 3;
  const zMin = () => Math.max(0.75, (G.H + 10) / (WORLD.y1 - WORLD.y0));
  function fit(tx, ty, k) {
    const b = bounds(sheetTop(), k);
    return { tx: clamp(tx, b.txMin, b.txMax), ty: clamp(ty, b.tyMin, b.tyMax), k };
  }
  // Markers keep their size while the map zooms (they scale by 1/k inside the zoomed world).
  function setWorld(c) {
    const w = $('#world');
    w.style.transform = `translate(${c.tx}px,${c.ty}px) scale(${c.k})`;
    w.style.setProperty('--ik', (1 / c.k).toFixed(4));
  }
  function commitView() {
    S.tx = cur.tx; S.ty = cur.ty; S.z = cur.k;
    $('#map').classList.remove('grabbing');
    $('#world').classList.remove('nodrag');
    updH();
  }
  // Glide to a view. With a focus point, the spot under it stays put while zooming.
  let anim = 0;
  function animateTo(t1, focus, done) {
    cancelAnimationFrame(anim);
    const t0 = Object.assign({}, cur), start = performance.now(), ms = 320;
    const fw = focus ? { x: (focus.x - t0.tx) / t0.k, y: (focus.y - t0.ty) / t0.k } : null;
    $('#world').classList.add('nodrag');
    const step = (now) => {
      const p = Math.min(1, (now - start) / ms), e = 1 - Math.pow(1 - p, 3);
      const k = Math.exp(Math.log(t0.k) + (Math.log(t1.k) - Math.log(t0.k)) * e);
      cur = fw ? fit(focus.x - fw.x * k, focus.y - fw.y * k, k) : { tx: t0.tx + (t1.tx - t0.tx) * e, ty: t0.ty + (t1.ty - t0.ty) * e, k };
      setWorld(cur);
      if (p < 1) anim = requestAnimationFrame(step);
      else if (done) done(); else commitView();
    };
    anim = requestAnimationFrame(step);
  }
  // double tap: zoom in where you tapped (at the closest zoom, back out)
  function zoomBy(x, y) {
    const k = cur.k >= ZMAX - 0.05 ? 1 : Math.min(ZMAX, cur.k * 2);
    animateTo({ k }, { x, y });
  }
  function curTrans(top) {
    const b = bounds(top, S.z);
    const tx = S.tx == null ? G.baseX : S.tx;
    const ty = S.ty == null ? G.baseY : S.ty;
    return { tx: clamp(tx, b.txMin, b.txMax), ty: clamp(ty, b.tyMin, b.tyMax) };
  }

  function mountH() {
    G = geo();
    app.innerHTML = `
      <div class="scr h">
        <div class="map" id="map">
          <div class="world" id="world">${$('#world-svg').innerHTML}<span class="me" style="left:216px;top:256px" aria-hidden="true"></span><div id="spotsL"></div><div id="stationsL"></div><div id="pinsL"></div></div>
        </div>
        <div class="topbar">
          <div class="pillw logo">I ${I.heart(18, 17, '#B8232F')} BOSTON</div>
          <button type="button" class="pillw demobtn" data-act="demo-open" aria-label="Demo: other looks, and features on or off">${I.s(P.sliders, 18)}<span>Demo</span></button>
          <button type="button" class="pillw langbtn" data-act="lang" aria-label="Language"><span class="flag" id="langFlag"></span><span id="langShort"></span></button>
        </div>
        <button type="button" class="recenter" id="recenter" data-act="recenter" aria-label="Back to this sign" hidden>${I.s(P.nav, 20)}</button>
        <section class="sheet" id="sheet">
          <div class="sheet-list" id="sheetList">
            <div class="sh-head" id="shHead">
              <button type="button" class="handle-btn" id="shHandle" data-act="toggle"><span class="handle" aria-hidden="true"></span></button>
              <button type="button" class="sh-title" id="shToggle" data-act="toggle"><span class="cap" id="tHere"></span><span class="ttl">Downtown Crossing</span></button>
              <span class="dtc-slot" id="dtcSlot"></span>
            </div>
            <div class="tabs" id="tabs" role="tablist" aria-label="What to show"></div>
            <div class="sh-body" id="shBody"></div>
          </div>
          <div class="sheet-prev" id="sheetPrev" hidden></div>
        </section>
        <button type="button" class="mapbtn" id="mapBtn" data-act="half" hidden>${I.s(P.map)}<span>Map</span></button>
        <div class="lang-wrap" id="langWrap" hidden></div>
        <div class="lang-wrap" id="demoWrap" hidden></div>
        <div class="lang-wrap ov" id="ovWrap" hidden></div>
        <div class="viewer-wrap" id="viewerWrap" hidden></div>
      </div>`;
    hMounted = true;
    sig = { pins: '', body: '', prev: '', layers: '', dtc: '', demo: '', view: '', ov: '' };
    bindH();
    // First paint without animation, then turn transitions on.
    app.classList.add('instant');
    updH();
    requestAnimationFrame(() => requestAnimationFrame(() => app.classList.remove('instant')));
  }

  function updH() {
    if (!hMounted) return;
    const t = T();
    const sheet = $('#sheet');
    // preview first (its height sets the sheet top)
    const prevEl = $('#sheetPrev');
    const listEl = $('#sheetList');
    if (S.sel) {
      const ps = prevSig();
      if (sig.prev !== ps) { prevEl.innerHTML = previewHTML(); sig.prev = ps; }
      prevEl.hidden = false; listEl.hidden = true;
    } else {
      prevEl.hidden = true; listEl.hidden = false; sig.prev = '';
    }
    const top = sheetTop();
    sheet.style.top = top + 'px';
    // map
    const tr = curTrans(top);
    cur = { tx: tr.tx, ty: tr.ty, k: S.z };
    setWorld(cur);
    // map layers that features turn on and off
    const fs = JSON.stringify(S.f);
    if (sig.layers !== fs + !!S.user) {
      $('#stationsL').innerHTML = S.f.transit ? STATIONS.map((st) => `<span class="chip-st" style="left:${st.x}px;top:${st.y - 10}px">${st.lines.map((l) => `<span class="dot8" style="background:${LINE[l].c}"></span>`).join('')}<span>${esc(st.short)}</span></span>`).join('') : '';
      $('#spotsL').innerHTML = S.f.spots ? SPOTS.map((p) => `<a class="spot" href="#/spots" style="left:${p.x}px;top:${p.y}px" aria-label="Sign ${p.code}, ${esc(p.area)}${p.got && S.user ? ', collected' : ''}. See every spot">${I.heart(12, 11, p.got && S.user ? '#B8232F' : 'none', '#B8232F', 2.5)}<span>${p.code}</span></a>`).join('') : '';
      sig.layers = fs + !!S.user;
    }
    // the sign chip in the header, with your points under it
    const u = S.user;
    const dtcSig = [fs, S.points, u ? u.name : '', S.lang].join('|');
    if (sig.dtc !== dtcSig) {
      const line2 = u ? (S.f.points ? '★ ' + S.points : esc(u.name.split(' ')[0])) : esc(t.signIn);
      $('#dtcSlot').innerHTML = S.f.spots
        ? `<a class="dtc wpts" href="#/spots" aria-label="Sign DTC-001: spots, badges${S.f.points ? ' and points' : ''}. ${u ? 'Signed in as ' + esc(u.name) + (S.f.points ? ', ' + S.points + ' points' : '') : 'Not signed in'}">${u ? avatar(u.name, 26) : `<span class="av out">${I.s(P.person, 15, 2.2)}</span>`}<span class="dtc-t"><span>DTC-001</span><span class="dtc-p${u ? '' : ' out'}">${line2}</span></span>${I.s(P.right, 14, 2.4)}</a>`
        : '<span class="dtc static">DTC-001</span>';
      sig.dtc = dtcSig;
    }
    // pins
    const pinSig = [S.tab, S.cat, S.day, S.sel, S.lang, S.style, S.sv, fs, !!S.user, S.sort].join('|');
    if (sig.pins !== pinSig) { $('#pinsL').innerHTML = pinsHTML(); sig.pins = pinSig; }
    // header + tabs + body
    $('#tHere').textContent = t.here;
    const labels = { half: 'Downtown Crossing. Show the whole list', full: 'Downtown Crossing. Show the map', peek: 'Downtown Crossing. Show the list' };
    const tog = $('#shToggle');
    tog.setAttribute('aria-label', labels[S.sheet]);
    tog.setAttribute('aria-expanded', S.sheet === 'full' ? 'true' : 'false');
    const hb = $('#shHandle');
    hb.setAttribute('aria-label', { half: 'Show the whole list', full: 'Show the map', peek: 'Show the list' }[S.sheet]);
    hb.setAttribute('aria-expanded', S.sheet === 'full' ? 'true' : 'false');
    const on = tabsOn();
    const tabLabel = { near: t.tabNear, events: t.tabEvents, live: t.tabLive };
    const tabsEl = $('#tabs');
    tabsEl.hidden = on.length < 2;
    tabsEl.style.gridTemplateColumns = `repeat(${on.length},minmax(0,1fr))`;
    tabsEl.innerHTML = on.map((id) =>
      `<button type="button" class="tab" role="tab" aria-selected="${S.tab === id}" data-act="tab" data-v="${id}">${id === 'live' ? '<span class="ldot pdot"></span>' : ''}<span>${esc(tabLabel[id])}</span></button>`).join('');
    const bodySig = [S.tab, S.cat, S.day, S.tOpen, S.tShow, S.lang, S.style, S.sv, fs, !!S.user, S.sort].join('|');
    if (sig.body !== bodySig) {
      const body = $('#shBody');
      const keep = sig.body.split('|')[0] === S.tab ? body.scrollTop : 0;
      body.innerHTML = S.tab === 'near' ? nearHTML() : S.tab === 'events' ? eventsHTML() : liveHTML();
      body.scrollTop = keep;
      sig.body = bodySig;
    }
    // chrome
    const rc = $('#recenter');
    const panned = (S.tx != null && S.tx !== G.baseX) || (S.ty != null && S.ty !== G.baseY) || S.z !== 1;
    rc.hidden = !(panned && (S.sel || S.sheet !== 'full') && dragTop == null);
    rc.style.top = (top - 58) + 'px';
    $('#mapBtn').hidden = !(S.sheet === 'full' && !S.sel && dragTop == null);
    const langCode = S.f.langs ? S.lang : 'en';
    $('.langbtn').hidden = !S.f.langs;
    $('#langShort').textContent = (LANGS.find((l) => l.code === langCode) || LANGS[0]).short;
    $('#langFlag').innerHTML = FLAG[langCode] || FLAG.en;
    document.documentElement.lang = langCode;
    // language sheet
    const lw = $('#langWrap');
    if (S.langOpen) { lw.innerHTML = langHTML(); lw.hidden = false; } else { lw.hidden = true; lw.innerHTML = ''; }
    // demo panel and the looks viewer
    const dw = $('#demoWrap');
    const ds = [S.demoOpen, S.demoTab, fs, S.theme, S.style, u ? 1 : 0].join('|');
    if (S.demoOpen) {
      if (sig.demo !== ds) {
        const keep = dw.querySelector('.demo-sheet');
        const st = keep ? keep.scrollTop : 0;
        dw.innerHTML = demoHTML();
        const ns = dw.querySelector('.demo-sheet');
        if (ns && keep && sig.demo.split('|')[1] === S.demoTab) ns.scrollTop = st;
        sig.demo = ds;
      }
      dw.hidden = false;
    } else { dw.hidden = true; dw.innerHTML = ''; sig.demo = ''; }
    const ow = $('#ovWrap');
    const oh = overlaysHTML();
    if (oh) {
      const os = [S.signOpen, S.signing, S.reviewFor, S.rvUp, S.addOpen, S.sv, S.lang, u ? 1 : 0, fs].join('|');
      if (sig.ov !== os) { ow.innerHTML = oh; sig.ov = os; }
      ow.hidden = false;
    } else { ow.hidden = true; ow.innerHTML = ''; sig.ov = ''; }
    const vw = $('#viewerWrap');
    if (S.view >= 0) {
      if (sig.view !== String(S.view)) { vw.innerHTML = viewerHTML(); sig.view = String(S.view); }
      vw.hidden = false;
    } else { vw.hidden = true; vw.innerHTML = ''; sig.view = ''; }
  }

  function demoHTML() {
    const lcard = (l, i) => `<button type="button" class="lcard" data-act="look" data-v="${i}" aria-label="${esc(l.name)}${l.live ? ", the one you're using" : ''}">
        <span class="limg"><img src="looks/${l.k}-thumb.webp" alt="" loading="lazy" width="390" height="844">${l.live ? '<span class="lbadge">You\'re using it</span>' : ''}</span>
        <span class="lname">${esc(l.name)}</span><span class="ldesc">${esc(l.desc)}</span></button>`;
    const looks = LOOKS.map((l, i) => (l.fresh ? '' : lcard(l, i))).join('');
    const fresh = LOOKS.map((l, i) => (l.fresh ? lcard(l, i) : '')).join('');
    const feats = FEATURES.map(([k, label, desc]) => `<button type="button" class="frow" role="switch" aria-checked="${!!S.f[k]}" data-act="flag" data-v="${k}">
        <span class="ftxt"><b>${esc(label)}</b><span>${esc(desc)}</span></span><span class="sw${S.f[k] ? ' on' : ''}" aria-hidden="true"><span></span></span></button>`).join('');
    const allOn = FEATURES.every(([k]) => S.f[k]);
    const styles = STYLES.map((s) => `<button type="button" class="scard" data-act="style" data-v="${s.k}" aria-pressed="${S.style === s.k}">
        <span class="sc-ic">${I.s(P[s.icon], 19)}</span><span class="sc-name">${esc(s.name)}</span><span class="sc-desc">${esc(s.desc)}</span>${S.style === s.k ? '<span class="sc-on">Using</span>' : ''}</button>`).join('');
    return `<div class="lang-dim" data-act="demo-close"></div>
      <div class="lang-sheet demo-sheet" role="dialog" aria-label="Demo">
        <div class="lang-head"><h2>${I.s(P.sliders, 20)} Demo</h2><button type="button" class="pv-x" data-act="demo-close" aria-label="Close">${I.s(P.x, 20)}</button></div>
        <p class="small muted demo-intro">Flip through the other looks, or turn features on and off to see the page with and without them.</p>
        <div class="tabs dtabs" role="tablist" aria-label="Demo"><button type="button" class="tab" role="tab" aria-selected="${S.demoTab === 'looks'}" data-act="demo-tab" data-v="looks">Other looks</button><button type="button" class="tab" role="tab" aria-selected="${S.demoTab === 'features'}" data-act="demo-tab" data-v="features">Features on/off</button></div>
        ${S.demoTab === 'looks'
          ? `<h3 class="demo-sec">New mockups <span class="newtag">Nov 19</span></h3><p class="small muted demo-intro">Simpler and smarter, on a real map, with a new dark mode. Not built yet: tap one to see it big.</p><div class="lgrid">${fresh}</div>
             <h3 class="demo-sec">The Nearby list</h3><p class="small muted demo-intro">Four ways to show what's around the sign. Tap one to use it.</p><div class="sgrid">${styles}</div>
             <h3 class="demo-sec">Whole-page looks</h3><div class="lgrid">${looks}</div><p class="small muted demo-intro">Tap a look to see it big; swipe or use the arrows to flip through.</p>`
          : `<div class="appear acct"><span>Account<small>${S.user ? esc(S.user.name) + ' · ' + esc(S.user.provider) + ' (demo)' : 'Signed out: no points or reviews'}</small></span><button type="button" class="btn small2" data-act="demo-sign">${S.user ? 'Sign out' : 'Sign in'}</button></div><div class="appear"><span>Appearance</span><div class="seg3">${[['auto', 'Auto'], ['light', 'Light'], ['dark', 'Dark']].map(([v, l]) => `<button type="button" data-act="theme" data-v="${v}" aria-pressed="${S.theme === v}">${l}</button>`).join('')}</div></div><div class="flist">${feats}</div>${allOn ? '' : '<button type="button" class="btn wide" data-act="flags-reset">Turn everything back on</button>'}<p class="small muted demo-intro">Your phone remembers these until you change them.</p>`}
      </div>`;
  }
  function viewerHTML() {
    const l = LOOKS[S.view];
    return `<div class="viewer" role="dialog" aria-label="${esc(l.name)}">
      <div class="v-top"><span class="v-count">${S.view + 1} of ${LOOKS.length}</span><button type="button" class="pv-x dark" data-act="view-close" aria-label="Back to the looks">${I.s(P.x, 20)}</button></div>
      <div class="v-stage"><img class="viewer-img" src="looks/${l.k}.webp" alt="Mockup ${esc(l.name)}" draggable="false"></div>
      <div class="v-bottom">
        <button type="button" class="v-nav" data-act="view-prev" aria-label="Previous look">${I.s(P.left, 22, 2.4)}</button>
        <div class="v-cap"><b>${esc(l.name)}</b><span>${esc(l.desc)}</span>${l.live ? '<button type="button" class="btn primary v-try" data-act="view-try">Use this one</button>' : ''}</div>
        <button type="button" class="v-nav" data-act="view-next" aria-label="Next look">${I.s(P.right, 22, 2.4)}</button>
      </div>
    </div>`;
  }

  /* ----- pins on the map ----- */
  function pinsHTML() {
    if (S.tab === 'near') {
      // the pins match the list: rank numbers, the Sponsored spot, medals or photos
      const m = nearModel();
      let items = [];
      if (m.st === 'walk') items = m.list.map((p, i) => ({ p, k: 'num', n: i + 1 }));
      else if (m.st === 'picks') { items = m.list.map((p, i) => ({ p, k: 'num', n: i + 1 })); if (m.spot) items.unshift({ p: m.spot, k: 'spot' }); }
      else if (m.st === 'best') m.groups.forEach((g) => g.all.forEach((p, i) => items.push({ p, k: 'medal', n: i + 1 })));
      else items = m.pins.map((c) => ({ p: c.p, k: 'photo', ph: c.ph }));
      items.forEach((it) => { it.on = S.sel === 'place:' + it.p.id; });
      items.sort((a, b) => (a.on ? 1 : 0) - (b.on ? 1 : 0));
      return items.map(placePin).join('');
    }
    if (S.tab === 'events') {
      const t = T();
      const items = eventsShown().map((e) => ({ e, on: S.sel === 'event:' + e.id }));
      items.sort((a, b) => (a.on ? 1 : 0) - (b.on ? 1 : 0));
      return items.map(({ e, on }) => {
        const label = e.now ? t.now : (e.wd ? e.wd + ' ' : '') + e.time + ' ' + e.ap.toUpperCase();
        return `<button type="button" class="flagpin" data-act="pin" data-k="event:${e.id}" aria-label="${esc(e.name)}, ${e.now ? 'on now' : esc(label)}" style="left:${e.x}px;top:${e.y}px"><span class="fp${on ? ' on' : ''}">${e.now ? '<span class="fpdot pdot"></span>' : ''}<span>${esc(label)}</span></span><span class="tail${on ? ' on' : ''}"></span></button>`;
      }).join('');
    }
    const items = VENDORS.slice().sort((a, b) => a.dist - b.dist).map((v) => ({ v, on: S.sel === 'live:' + v.id }));
    items.sort((a, b) => (a.on ? 1 : 0) - (b.on ? 1 : 0));
    return items.map(({ v, on }) => {
      const size = on ? 30 : 22;
      return `<button type="button" class="livepin${on ? ' on' : ' pulse'}" data-act="pin" data-k="live:${v.id}" aria-label="${esc(v.name)}, live till ${v.till}" style="left:${v.x - size / 2}px;top:${v.y - size / 2}px;width:${size}px;height:${size}px"></button>`;
    }).join('');
  }

  /* ----- Nearby: top picks, photos, best of, or the walk line ----- */
  const listed = () => PLACES.filter((p) => !p.sug || S.added[p.id]);
  const friendRecs = (id) => (S.user ? FRIEND_RECS[id] || [] : []);
  const inCat = (p, cat) => cat === 'all' || (cat === 'friends' ? friendRecs(p.id).length > 0 || !!S.recd[p.id] : p.cat === cat);
  function rankedPlaces(cat) {
    return listed().filter((p) => inCat(p, cat)).sort((a, b) => recOf(b.id) - recOf(a.id) || a.dist - b.dist);
  }
  function nearModel() {
    const st = S.style;
    if (st === 'walk') return { st, list: listed().filter((p) => inCat(p, S.cat)).sort((a, b) => a.dist - b.dist) };
    const ranked = rankedPlaces(S.cat);
    if (st === 'picks') {
      if (S.sort === 'near') ranked.sort((a, b) => a.dist - b.dist);
      // One paid Spotlight card sits above the ranking, labeled Sponsored. It never changes the order below.
      const spot = S.f.featured ? ranked.find((p) => p.spotlight) || null : null;
      return { st, spot, list: ranked.filter((p) => p !== spot) };
    }
    if (st === 'best') {
      const cats = S.cat === 'all' || S.cat === 'friends' ? CATS : [S.cat];
      return { st, groups: cats.map((c) => ({ c, all: ranked.filter((p) => p.cat === c) })).filter((g) => g.all.length) };
    }
    // Photos: every visitor photo, most-liked first; the map gets one photo pin per place
    const photos = [];
    ranked.forEach((p) => photosOf(p.id).forEach((ph) => { if (!ph.mine) photos.push({ p, ph }); }));
    photos.sort((a, b) => b.ph.likes - a.ph.likes);
    return { st, photos, pins: ranked.map((p) => ({ p, ph: topPhoto(p.id) })) };
  }
  const MEDAL = ['Gold', 'Silver', 'Bronze'];
  function placePin(it) {
    const p = it.p, on = it.on;
    const key = `data-act="pin" data-k="place:${p.id}"`;
    if (it.k === 'photo') {
      const s = on ? 46 : 38;
      return `<button type="button" class="phpin${on ? ' on' : ''}" ${key} aria-label="${esc(p.name)}" style="left:${p.x - s / 2}px;top:${p.y - s / 2}px;width:${s}px;height:${s}px;background:${it.ph.color}">${phImg(it.ph, true)}</button>`;
    }
    const size = on ? 36 : 30;
    const pos = `left:${p.x - size / 2}px;top:${p.y - size / 2}px;width:${size}px;height:${size}px`;
    if (it.k === 'spot') return `<button type="button" class="pin spin${on ? ' on' : ''}" ${key} aria-label="Sponsored: ${esc(p.name)}" style="${pos}">${I.s(P[PICON[p.id]], on ? 18 : 15, 2.2)}</button>`;
    if (it.k === 'medal') return `<button type="button" class="pin mpin m${Math.min(it.n, 4)}${on ? ' on' : ''}" ${key} aria-label="${MEDAL[it.n - 1] || 'No. ' + it.n}: ${esc(p.name)}" style="${pos}">${it.n}</button>`;
    const col = S.f.colors ? `;background:${CAT_COLOR[p.cat]}` : '';
    return `<button type="button" class="pin${S.f.colors ? ' cpin' : ''}${on ? ' on' : ''}" ${key} aria-label="${it.n}. ${esc(p.name)}" style="${pos}${col}">${it.n}</button>`;
  }
  const sponTag = (p) => (S.f.featured && p.sponsored ? `<span class="sp">${esc(T().sponsored)}</span>` : '');
  const metaLine = (p) => esc(T()[p.kind]) + ' · ' + esc(T().mins(mins(p.dist))) + (p.till ? ' · ' + esc(T().till(p.till)) : '');
  function recommenders(id) {
    const names = [];
    if (S.user && S.recd[id]) names.push(S.user.name);
    friendRecs(id).forEach((n) => { if (!names.includes(n)) names.push(n); });
    (REVIEWS[id] || []).forEach((r) => { if (r[3] && !names.includes(r[0])) names.push(r[0]); });
    return names;
  }
  const isMe = (n) => S.user && n === S.user.name;
  function recByHTML(id, size) {
    const total = recOf(id);
    if (!total) return '';
    const shown = recommenders(id).slice(0, 2);
    const more = Math.max(0, total - shown.length);
    const label = shown.map((n) => (isMe(n) ? T().you : firstName(n))).join(', ') + (more ? ' +' + more : '');
    return `<span class="recby"><span class="avs">${shown.map((n) => avatar(n, size || 22)).join('')}</span><span>${I.s(P.thumb, 13, 2.4)}${esc(label)}</span></span>`;
  }
  function friendsLine(id) {
    const fr = friendRecs(id);
    return fr.length ? `<span class="pk-fr">${I.s(P.users, 13, 2.2)}${esc(T().friends)}: ${esc(fr.map(firstName).join(', '))}</span>` : '';
  }
  // Top picks: a big card per place, its most-liked photo with the rank, name and badges on top
  function pkCard(p, n) {
    const t = T();
    const ph = topPhoto(p.id);
    const hot = hotLabel(todayOf(p.id));
    const col = S.f.colors ? ` style="background:${CAT_COLOR[p.cat]}"` : '';
    return `<button type="button" class="pk" data-act="sel" data-k="place:${p.id}">
        <span class="pk-img" style="background:${ph.color}">${phImg(ph, false, n > 2)}</span><span class="pk-shade"></span>
        <span class="pk-top"><span class="pk-n"${col}>${n}</span>${S.f.featured && p.sponsored ? `<span class="sp onimg">${esc(t.sponsored)}</span>` : ''}${p.sug ? `<span class="newtag2">${esc(t.newTag)}</span>` : ''}${critPill(p.id, true)}${hot ? `<span class="pk-hot">${I.s(P.flame, 13, 2.4)}${esc(t.todayN(hot))}</span>` : ''}</span>
        <span class="pk-bot"><span class="pk-txt"><b>${esc(p.name)}</b><span>${metaLine(p)}</span>${friendsLine(p.id)}</span><span class="pk-rec" aria-label="${esc(t.rec(bucket(recOf(p.id))))}"><span class="avs mini">${recommenders(p.id).slice(0, 2).map((nm) => avatar(nm, 20)).join('')}</span>${I.s(P.thumb, 14, 2.4)}${esc(bucket(recOf(p.id)))}</span></span>
      </button>`;
  }
  // the paid Spotlight: smaller, so the first real pick still shows at half height
  function spotCard(p) {
    const t = T(), ph = topPhoto(p.id);
    const hot = hotLabel(todayOf(p.id));
    return `<button type="button" class="spc" data-act="sel" data-k="place:${p.id}">
        <span class="spc-img" style="background:${ph.color}">${phImg(ph, false, false)}</span>
        <span class="spc-txt"><span class="sp">${esc(t.sponsored)}</span><b>${esc(p.name)}</b><span class="sub">${metaLine(p)}</span>
          <span class="soc"><span class="rec">${I.s(P.thumb, 14, 2.2)}${esc(bucket(recOf(p.id)))}</span>${hot ? `<span class="hot">${I.s(P.flame, 12, 2.4)}${esc(t.todayN(hot))}</span>` : ''}</span></span>
      </button>`;
  }
  // Local critics' picks, as their own row in the list (separate from visitors' ranking and from Sponsored)
  function critRail() {
    const t = T();
    const picks = rankedPlaces(S.cat).filter((p) => CRITICS[p.id]);
    if (picks.length < 2) return '';
    return `<div class="crail"><div class="crail-h"><h3>🏆 ${esc(t.criticsRow)}</h3><span class="small muted">Sample</span></div><div class="crail-scroll">${picks.map((p) => {
      const ph = topPhoto(p.id), c = CRITICS[p.id];
      return `<button type="button" class="crc" data-act="sel" data-k="place:${p.id}"><span class="crc-img" style="background:${ph.color}">${phImg(ph)}</span>
        <span class="crc-name">${esc(p.name)}</span><span class="crc-q">“${esc(c[1])}”</span><span class="crc-src">${esc(c[0])}</span></button>`;
    }).join('')}</div></div>`;
  }
  function boCard(p, n) {
    const t = T(), ph = topPhoto(p.id);
    return `<button type="button" class="boc" data-act="sel" data-k="place:${p.id}">
        <span class="boc-img" style="background:${ph.color}">${phImg(ph)}<span class="medal-s m${Math.min(n, 4)}" aria-label="${MEDAL[n - 1] || 'No. ' + n}">${n}</span>${CRITICS[p.id] ? `<span class="crit onimg mini" aria-label="${esc(t.criticsPick)}">🏆</span>` : ''}</span>
        <span class="boc-name">${esc(p.name)}</span>${sponTag(p)}<span class="sub">${metaLine(p)}</span>
        <span class="rec">${I.s(P.thumb, 13, 2.2)}${esc(t.rec(bucket(recOf(p.id))))}</span>
      </button>`;
  }
  function phCard(c, top) {
    const t = T(), p = c.p, ph = c.ph;
    return `<div class="phcard"><button type="button" class="ph-open" data-act="sel" data-k="place:${p.id}" aria-label="${esc(ph.cap)}, at ${esc(p.name)}">
        <span class="ph-img" style="background:${ph.color}">${phImg(ph, false, !top)}${top ? `<span class="ph-top">${esc(t.mostLiked)}</span>` : ''}</span>
        <span class="ph-cap">${esc(ph.cap)}</span><span class="ph-sub"><span>${esc(p.name)} · ${esc(t.mins(mins(p.dist)))}</span>${sponTag(p)}</span></button>
      ${likeBtn(ph)}</div>`;
  }
  function walkHTML(list) {
    const t = T();
    let crossed = false;
    const rows = list.map((p, i) => {
      const m = mins(p.dist);
      let out = '';
      if (!crossed && m > 5) {
        if (i > 0) out += `<div class="mark" style="--ml:84px"><span>${esc(t.walk5)}</span></div>`;
        crossed = true;
      }
      return out + `<button type="button" class="row" data-act="sel" data-k="place:${p.id}">
        <span class="tcol">${esc(t.mins(m))}</span>
        <span class="lcol"><span class="stop"${S.f.colors ? ` style="background:${CAT_COLOR[p.cat]};border-color:${CAT_COLOR[p.cat]};color:#fff"` : ''}>${i + 1}</span></span>
        <span class="txt"><span class="nm"><b>${esc(p.name)}</b>${sponTag(p)}</span><span class="sub">${esc(t[p.kind])}</span></span>
      </button>`;
    }).join('');
    return `<div class="line"><div class="rail" style="left:62.5px"></div>${rows}</div>`;
  }
  // The T, folded into one row until it's tapped
  function tSecHTML() {
    if (!S.f.transit) return '';
    const t = T();
    const rows = S.tShow ? STATIONS.map((st, i) => {
      const open = S.tOpen === st.id;
      return `<div class="st"${i ? '' : ' style="border-top:0"'}>
        <button type="button" class="st-row" data-act="station" data-v="${st.id}" aria-expanded="${open}">
          <span class="st-name">${esc(st.name)}</span>
          <span class="st-lines">${st.lines.map((l) => `<span class="lp" style="background:${LINE[l].c};color:${LINE[l].ink}">${l}</span>`).join('')}</span>
          <span class="st-walk">${esc(t.mins(st.walk))}</span>
          <span class="chev${open ? ' open' : ''}">${I.s(P.right, 16, 2.2)}</span>
        </button>
        ${open ? `<div class="trains">${st.trains.map(([line, to, t1, t2]) => `<div class="tr"><span class="tbar" style="background:${LINE[line].c}"></span><span class="tto"><span class="tl">${line} Line to</span><span class="td">${esc(to)}</span></span><span class="t1${t1 === 'Now' ? ' nowred' : ''}">${esc(t1)}</span><span class="t2">${esc(t2)}</span></div>`).join('')}</div>` : ''}
      </div>`;
    }).join('') : '';
    return `<section class="tsec">
        <button type="button" class="tsec-h tbtn" data-act="tshow" aria-expanded="${S.tShow}">${I.s(P.train, 20)}<h3>${esc(t.tHead)}</h3><span class="tcount">${esc(t.stations(STATIONS.length))}</span><span class="chev${S.tShow ? ' open' : ''}">${I.s(P.right, 16, 2.2)}</span></button>
        ${S.tShow ? `<div class="tlist">${rows}</div><p class="small muted">Sample times. On the real site they come live from the MBTA.</p>` : ''}
      </section>`;
  }
  function nearHTML() {
    const t = T();
    const chips = ['all', 'eat', 'drinks', 'shop', 'see', 'services', 'friends'].map((c) => {
      const col = S.f.colors && CAT_COLOR[c] ? CAT_COLOR[c] : null;
      const on = S.cat === c;
      const st = col && on ? ` style="background:${col};border-color:${col};color:#fff"` : '';
      return `<button type="button" class="chip${c === 'friends' ? ' frchip' : ''}" aria-pressed="${on}" data-act="cat" data-v="${c}"><span${st}>${col ? `<i class="cdot" style="background:${on ? '#fff' : col}"></i>` : ''}${c === 'friends' ? I.s(P.users, 15, 2.2) : ''}${esc(t[c])}</span></button>`;
    }).join('');
    const m = nearModel();
    let body = '', note = t.recNote;
    if (m.st === 'walk') {
      body = walkHTML(m.list); note = t.allWithin;
    } else if (m.st === 'picks') {
      body = (m.spot ? spotCard(m.spot) : '')
        + (m.list.length ? `<div class="sec-h"><h3>${esc(S.sort === 'near' ? t.sortNear : t.topPicks)}</h3></div><div class="pklist">${m.list.map((p, i) => pkCard(p, i + 1) + (i === 2 ? critRail() : '')).join('')}</div>` : '');
    } else if (m.st === 'best') {
      const one = m.groups.length === 1;
      body = m.groups.map((g) => `<section class="bo"><div class="bo-h">${S.f.colors ? `<i class="cdot" style="background:${CAT_COLOR[g.c]}"></i>` : ''}<h3>${esc(t['best' + g.c[0].toUpperCase() + g.c.slice(1)])}</h3></div>
          <div class="${one ? 'bo-grid' : 'bo-scroll'}">${g.all.map((p, i) => boCard(p, i + 1)).join('')}</div></section>`).join('');
    } else {
      body = `<div class="sec-h"><h3>${esc(t.photosHead)}</h3></div><div class="phgrid">${m.photos.map((c, i) => phCard(c, i === 0)).join('')}</div>`;
      note = t.photosNote;
    }
    return `
      <div class="chips">${chips}</div>
      ${toolsHTML(m.st)}
      ${S.cat === 'friends' && S.user ? friendsBanner() : ''}
      ${body}
      <p class="note">${esc(note)}</p>
      ${tSecHTML()}
      <a class="cta-row" href="#/business"><span>${esc(t.biz)}</span>${I.s(P.right)}</a>
      <p class="note small pb">${esc(t.sample)}. Tap one to see it on the map. <a href="#/credits">Photo credits</a></p>`;
  }

  /* ----- What's on: the time line ----- */
  function eventsShown() {
    return EVENTS.filter((e) => S.day === 'tonight' ? (e.day === 'today' && !e.now && e.ap === 'pm') : e.day === S.day);
  }
  function eventsHTML() {
    const t = T();
    const chips = ['today', 'tonight', 'tomorrow', 'weekend'].map((d) => `<button type="button" class="chip" aria-pressed="${S.day === d}" data-act="day" data-v="${d}"><span>${esc(t[d])}</span></button>`).join('');
    const list = eventsShown();
    const now = list.filter((e) => e.now), later = list.filter((e) => !e.now);
    const row = (e) => {
      const free = /^Free/.test(e.price);
      return `<button type="button" class="row ev" data-act="sel" data-k="event:${e.id}">
        <span class="tcol">${e.wd ? `<span class="wd">${e.wd}</span>` : ''}<span class="tm${e.now ? ' nowred' : ''}">${esc(e.now ? t.now : e.time + ' ' + e.ap)}</span>${e.now ? `<span class="tilll">${esc(t.till(e.until))}</span>` : ''}</span>
        <span class="lcol"><span class="estop${e.now ? ' now pdot' : ''}"></span></span>
        <span class="txt"><span class="nm"><b>${esc(e.name)}</b>${S.f.featured && e.sponsored ? `<span class="sp">${esc(t.sponsored)}</span>` : ''}</span><span class="sub">${esc(e.where)} · ${esc(t.mins(mins(e.dist)))} · <span class="evprice${free ? ' free' : ''}">${esc(e.price)}</span></span></span>
      </button>`;
    };
    let rows = now.map(row).join('');
    if (now.length && later.length) rows += `<div class="mark" style="--ml:94px"><span>${esc(t.later)}</span></div>`;
    rows += later.map(row).join('');
    return `
      <div class="chips">${chips}</div>
      <div class="line"><div class="rail" style="left:72.5px;top:32px;bottom:32px"></div>${rows}</div>
      <p class="note small pb">Sample events. Real ones come from venues, the city's calendar and businesses here.</p>`;
  }

  /* ----- Live now ----- */
  function liveHTML() {
    const t = T();
    const vendors = VENDORS.slice().sort((a, b) => a.dist - b.dist);
    const tiles = vendors.map((v) => `<button type="button" class="tile" data-act="sel" data-k="live:${v.id}" aria-label="${esc(v.name)}">
        <span class="tile-media" style="background:${vPhoto(v).color}">${phImg(vPhoto(v))}<span class="livebadge">LIVE · ${esc(t.till(v.till))}</span>${v.video ? `<span class="playmini">${I.s(P.play, 12)}</span>` : ''}</span>
        <span class="tile-name">${esc(v.name)}</span><span class="tile-sub">${esc(v.short)} · ${esc(t.mins(mins(v.dist)))}</span>
      </button>`).join('');
    const later = LATER.map((l, i) => `<div class="later"${i ? '' : ' style="border-top:0"'}>${I.s(P.clock)}<span class="lt"><b>${esc(l.name)}</b><span>${esc(l.what)}</span></span><span class="lo">${esc(t.opens(l.opens))}</span></div>`).join('');
    return `
      <div class="livecount"><span class="ldot pdot"></span><span>${esc(t.liveCount(vendors.length))}</span></div>
      <div class="tiles">${tiles}</div>
      <h3 class="eyebrow">${esc(t.openingLater)}</h3>
      <div class="laters">${later}</div>
      <a class="cta-row" href="#/business"><span>${esc(t.goLive)}</span>${I.s(P.right)}</a>
      <p class="note small pb">${esc(t.sample)}</p>`;
  }

  /* ----- the tapped place / event / stand ----- */
  function previewHTML() {
    const t = T();
    const [type, id] = S.sel.split(':');
    let title = '', chip = '', line1 = '', line2 = '', thumb = '', primary = '', secondary = '', dot = '', soc = '', earnRow = '';
    if (type === 'place') {
      const p = PLACES.find((x) => x.id === id);
      const ph = topPhoto(p.id);
      title = p.name;
      chip = S.f.featured && p.sponsored ? `<span class="sp">${esc(t.sponsored)}</span>` : '';
      line1 = t[p.kind] + ' · ' + t.walk(mins(p.dist));
      dot = S.f.colors ? `<i class="cdot" style="background:${CAT_COLOR[p.cat]}"></i>` : '';
      soc = socHTML(p.id, true) + recByHTML(p.id) + critPill(p.id, false);
      thumb = `<span class="thumb" style="background:${ph.color}">${phImg(ph, true, false)}</span>`;
      primary = `<a class="btn primary" href="${maps(p.q)}" target="_blank" rel="noopener">${I.s(P.pin)}<span>${esc(t.directions)}</span></a>`;
      secondary = `<a class="btn" href="#/${p.page}">${esc(t.seePage)}</a>`;
      earnRow = earnHTML(p.id);
    } else if (type === 'event') {
      const e = EVENTS.find((x) => x.id === id);
      const dayWord = e.wd ? WEEKDAY[e.wd] : (e.day === 'tomorrow' ? t.tomorrow : t.today);
      title = e.name;
      chip = S.f.featured && e.sponsored ? `<span class="sp">${esc(t.sponsored)}</span>` : '';
      line1 = (e.now ? t.now + ', ' + t.till(e.until) : dayWord + ' · ' + e.time + ' ' + e.ap) + ' · ' + e.price;
      line2 = e.where + ' · ' + t.walk(mins(e.dist));
      thumb = e.photo && (S.f.featured || !e.sponsored) ? `<span class="thumb tinted" style="--tint:${e.tint};--tink:${e.ink}">${I.s(P.photo, 30, 1.6)}</span>` : '';
      primary = `<button type="button" class="btn primary" data-act="demo" data-v="Added to your calendar (demo)">${I.s(P.cal)}<span>${esc(t.addCal)}</span></button>`;
      secondary = e.q ? `<a class="btn" href="${maps(e.q)}" target="_blank" rel="noopener">${esc(t.directions)}</a>` : `<button type="button" class="btn" data-act="demo">${esc(t.directions)}</button>`;
    } else {
      const v = VENDORS.find((x) => x.id === id);
      title = v.name;
      chip = `<span class="livebadge inline">LIVE · ${esc(t.till(v.till))}</span>`;
      line1 = v.what + ' · ' + t.walk(mins(v.dist));
      thumb = `<span class="thumb" style="background:${vPhoto(v).color}">${phImg(vPhoto(v), true, false)}</span>`;
      primary = `<a class="btn primary" href="${maps('Downtown Crossing Boston')}" target="_blank" rel="noopener">${I.s(P.pin)}<span>${esc(t.directions)}</span></a>`;
      secondary = `<a class="btn" href="#/live/${v.id}">${esc(t.photos)}</a>`;
    }
    return `<div class="pv">
      <span class="pv-handle"></span>
      <div class="pv-top">${thumb}<div class="pv-txt"><span class="pv-title">${esc(title)}</span>${chip}<span class="pv-l1">${dot}${esc(line1)}</span>${line2 ? `<span class="pv-l2">${esc(line2)}</span>` : ''}${soc}</div>
        <button type="button" class="pv-x" data-act="clear" aria-label="Back to the list">${I.s(P.x, 20)}</button></div>
      <div class="pv-btns">${primary}${secondary}</div>
      ${earnRow}
    </div>`;
  }

  function langHTML() {
    const t = T();
    return `<div class="lang-dim" data-act="langclose"></div>
      <div class="lang-sheet" role="dialog" aria-label="${esc(t.lang)}">
        <div class="lang-head"><h2>${I.s(P.globe, 20)} ${esc(t.lang)}</h2><button type="button" class="pv-x" data-act="langclose" aria-label="Close">${I.s(P.x, 20)}</button></div>
        <div class="lang-list">${LANGS.map((l) => `<button type="button" class="lang-opt${l.code === S.lang ? ' on' : ''}" data-act="setlang" data-v="${l.code}"><span class="flag">${FLAG[l.code]}</span><span>${esc(l.name)}</span>${l.code === S.lang ? I.s(P.check, 18, 2.6) : ''}</button>`).join('')}</div>
        <p class="small muted">${esc(t.langNote)}</p>
      </div>`;
  }

  /* ----- gestures ----- */
  let raf = 0;
  function bindH() {
    const map = $('#map'), world = $('#world'), head = $('#shHead'), sheet = $('#sheet');
    const ptrs = new Map();
    let pinch = null, lastTap = null, lastType = 'mouse', wheelT = 0;
    const local = (x, y) => { const r = map.getBoundingClientRect(); return { x: x - r.left, y: y - r.top }; };
    const applyCur = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; setWorld(cur); }); };
    const startPinch = () => {
      const [a, b] = [...ptrs.values()];
      const m = local((a.x + b.x) / 2, (a.y + b.y) / 2);
      pinch = { d0: Math.max(12, Math.hypot(a.x - b.x, a.y - b.y)), k0: cur.k, wx: (m.x - cur.tx) / cur.k, wy: (m.y - cur.ty) / cur.k };
      md = null; moved = true;
      map.classList.add('grabbing'); world.classList.add('nodrag');
    };
    map.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      cancelAnimationFrame(anim);
      lastType = e.pointerType;
      ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (ptrs.size >= 2) {
        ptrs.forEach((v, id) => { try { map.setPointerCapture(id); } catch (err) { /* ignore */ } });
        startPinch();
        return;
      }
      moved = false;
      md = { x: e.clientX, y: e.clientY, tx: cur.tx, ty: cur.ty, id: e.pointerId, on: false };
    });
    map.addEventListener('pointermove', (e) => {
      if (!ptrs.has(e.pointerId)) return;
      ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pinch) {
        if (ptrs.size < 2) return;
        const [a, b] = [...ptrs.values()];
        const m = local((a.x + b.x) / 2, (a.y + b.y) / 2);
        const k = clamp(pinch.k0 * Math.hypot(a.x - b.x, a.y - b.y) / pinch.d0, zMin(), ZMAX);
        cur = fit(m.x - pinch.wx * k, m.y - pinch.wy * k, k);
        applyCur();
        return;
      }
      if (!md || e.pointerId !== md.id) return;
      const dx = e.clientX - md.x, dy = e.clientY - md.y;
      if (!md.on) {
        if (Math.abs(dx) + Math.abs(dy) < 7) return;
        md.on = true; moved = true;
        try { map.setPointerCapture(md.id); } catch (err) { /* ignore */ }
        map.classList.add('grabbing');
        world.classList.add('nodrag');
      }
      cur = fit(md.tx + dx, md.ty + dy, cur.k);
      applyCur();
    });
    const endPtr = (e) => {
      if (!ptrs.has(e.pointerId)) return;
      ptrs.delete(e.pointerId);
      if (pinch) {
        if (ptrs.size >= 2) { startPinch(); return; }
        pinch = null;
        if (ptrs.size === 1) {
          // keep panning with the finger that's still down
          const [id, p] = [...ptrs.entries()][0];
          md = { x: p.x, y: p.y, tx: cur.tx, ty: cur.ty, id, on: true };
          return;
        }
        commitView();
        return;
      }
      if (!md || e.pointerId !== md.id) return;
      const was = md.on;
      md = null;
      if (was) { commitView(); return; }
      map.classList.remove('grabbing');
      if (lastType !== 'mouse' && e.type === 'pointerup' && !e.target.closest('button,a')) {
        const now = Date.now();
        if (lastTap && now - lastTap.t < 320 && Math.hypot(e.clientX - lastTap.x, e.clientY - lastTap.y) < 30) {
          lastTap = null;
          const p = local(e.clientX, e.clientY);
          zoomBy(p.x, p.y);
        } else lastTap = { t: now, x: e.clientX, y: e.clientY };
      }
    };
    map.addEventListener('pointerup', endPtr);
    map.addEventListener('pointercancel', endPtr);
    map.addEventListener('dblclick', (e) => {
      if (lastType !== 'mouse' || e.target.closest('button,a')) return;
      const p = local(e.clientX, e.clientY);
      zoomBy(p.x, p.y);
    });
    map.addEventListener('wheel', (e) => {
      e.preventDefault();
      cancelAnimationFrame(anim);
      const p = local(e.clientX, e.clientY);
      const k = clamp(cur.k * Math.exp(-e.deltaY * (e.ctrlKey ? 0.012 : 0.0025)), zMin(), ZMAX);
      const wx = (p.x - cur.tx) / cur.k, wy = (p.y - cur.ty) / cur.k;
      world.classList.add('nodrag');
      cur = fit(p.x - wx * k, p.y - wy * k, k);
      applyCur();
      clearTimeout(wheelT);
      wheelT = setTimeout(commitView, 180);
    }, { passive: false });
    // Safari's own pinch would zoom the whole page
    map.addEventListener('gesturestart', (e) => e.preventDefault());

    head.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      justDragged = false;
      sd = { y: e.clientY, top: sheetTop(), id: e.pointerId, on: false };
    });
    head.addEventListener('pointermove', (e) => {
      if (!sd || e.pointerId !== sd.id) return;
      const dy = e.clientY - sd.y;
      if (!sd.on) {
        if (Math.abs(dy) < 7) return;
        sd.on = true;
        try { head.setPointerCapture(sd.id); } catch (err) { /* ignore */ }
        sheet.classList.add('nodrag');
        $('#recenter').hidden = true;
        $('#mapBtn').hidden = true;
      }
      dragTop = clamp(sd.top + dy, G.full, G.peek);
      sheet.style.top = dragTop + 'px';
    });
    const endSheet = (e) => {
      if (!sd || (e && e.pointerId !== sd.id)) return;
      const d = sd; sd = null;
      if (!d.on) return;
      justDragged = true;
      setTimeout(() => { justDragged = false; }, 400);
      sheet.classList.remove('nodrag');
      const tNow = dragTop != null ? dragTop : d.top;
      const aim = tNow + Math.sign(tNow - d.top) * 70;
      let best = 'half', bd = Infinity;
      ['full', 'half', 'peek'].forEach((k) => { const dd = Math.abs(G[k] - aim); if (dd < bd) { bd = dd; best = k; } });
      dragTop = null;
      S.sheet = best;
      updH();
    };
    head.addEventListener('pointerup', endSheet);
    head.addEventListener('pointercancel', endSheet);
  }

  function selectFromList(key) {
    const [type, id] = key.split(':');
    const item = type === 'place' ? PLACES.find((x) => x.id === id) : type === 'event' ? EVENTS.find((x) => x.id === id) : VENDORS.find((x) => x.id === id);
    if (S.sheet === 'full') S.sheet = 'half';
    S.sel = key;
    sig.prev = '';
    // render the preview so we know its height, then glide the map if the spot is off screen
    $('#sheetPrev').innerHTML = previewHTML(); sig.prev = prevSig();
    $('#sheetPrev').hidden = false; $('#sheetList').hidden = true;
    const top = prevTop();
    const tr = curTrans(top);
    const sx = item.x * S.z + tr.tx, sy = item.y * S.z + tr.ty;
    if (sx < 30 || sx > G.W - 30 || sy < G.st + 80 || sy > top - 30) {
      const b = bounds(top);
      S.tx = clamp(Math.round(G.W / 2 - item.x * S.z), b.txMin, b.txMax);
      S.ty = clamp(Math.round(top * 0.55 - item.y * S.z), b.tyMin, b.tyMax);
    }
    updH();
  }

  /* =================================================================
     Other screens
     ================================================================= */
  function back(label) {
    return `<button type="button" class="round" data-act="back" aria-label="${label || 'Back'}">${I.s(P.left, 20, 2.2)}</button>`;
  }

  // --- Featured business page
  const FEATURED = {
    florabella: { name: 'Florabella Flowers', tagline: 'Fresh flowers in the heart of Downtown Crossing', meta: 'Flower stand · 1 min walk · <0.1 mi', tint: '#F6E1E4', ink: '#B8232F', icon: 'flower', q: 'Downtown Crossing Boston',
      tags: ['Bouquets', 'Sunflowers', 'Gifts', 'Events'], deal: "[Florabella's deal goes here: show this screen at the stand]",
      about: 'Bouquets, sunflowers and seasonal stems from the yellow-umbrella stand in Downtown Crossing. Stop by on your way through, or ask about flowers for an event.', hours: '[Hours, set by Florabella]',
      slides: [['Video', '#F6E1E4'], ['Photo', '#F3E7D6'], ['Photo', '#E3F1E9'], ['Video', '#EFE8F7'], ['Photo', '#F6E1E4']],
      tiles: [['Photo', '#F6E1E4'], ['Video', '#F3E7D6'], ['Photo', '#E3F1E9'], ['Photo', '#EFE8F7'], ['Photo', '#FCEBDD'], ['Video', '#E6EDFA']] },
    drphil: { name: 'Dr Phil Repair Center', tagline: 'Phone repair on Tremont St', meta: 'Phone repair · 4 min walk · 0.2 mi', tint: '#E6EDFA', ink: '#2A4E9B', icon: 'wrench', q: 'Dr Phil Repair Center Tremont St Boston',
      tags: ['Phone repair', '[Your services]'], deal: "[Dr Phil's deal goes here: show this screen at the shop]",
      about: "[Dr Phil's story, set by the shop]", hours: '[Hours, set by the shop]',
      slides: [['Video', '#E6EDFA'], ['Photo', '#E3F1E9'], ['Photo', '#F3E7D6']],
      tiles: [['Photo', '#E6EDFA'], ['Video', '#E3F1E9'], ['Photo', '#F3E7D6'], ['Photo', '#EFE8F7'], ['Photo', '#FCEBDD'], ['Photo', '#E6EDFA']] },
  };
  // "From visitors": how many recommend it, the point buttons, and everyone's photos, most-liked first
  function visitorsHTML(id, featured) {
    const t = T();
    const photos = photosOf(id);
    const d = todayOf(id);
    const tiles = photos.map((ph, i) => `<div class="phcard">
        <span class="ph-img" style="background:${ph.color}">${phImg(ph, false, i > 1)}${i === 0 && !ph.mine ? `<span class="ph-top">${esc(t.mostLiked)}</span>` : ''}</span>
        ${likeBtn(ph)}
        <span class="ph-cap">${esc(ph.cap)}</span><span class="ph-sub">${ph.mine ? 'by you, just now' : 'by ' + esc(ph.by)}</span></div>`).join('');
    return `<section class="vis"><div class="rev-h"><h2>From visitors</h2><span class="small muted">Signed in and checked in</span></div>
        <div class="vis-stats"><span class="rec big">${I.s(P.thumb, 18, 2.2)}${esc(t.rec(recOf(id)))}</span>${d ? `<span class="hot">${I.s(P.flame, 13, 2.4)}${esc(t.todayN(d))}</span>` : ''}</div>
        ${recByHTML(id, 26)}${friendsLine(id)}
        ${earnHTML(id)}
        <div class="vgrid">${tiles}</div>
        <p class="vis-note">${featured ? 'The most-liked visitor photos show up first.' : 'The most-liked photo becomes this page’s cover and shows up first.'}</p>
      </section>`;
  }
  function placeScreen() {
    const f = S.f.featured ? FEATURED[S.arg] : null;
    if (f) return featuredHTML(f);
    const p = PLACES.find((x) => x.id === S.arg) || PLACES[1];
    return listingHTML(p);
  }
  function featuredHTML(f) {
    const t = T();
    const i = Math.min(S.slide, f.slides.length - 1);
    const kind = f.slides[i][0];
    const phs = PH[S.arg] || [];
    const sp = phs[i % phs.length];
    return `<div class="scr page"><div class="scroll">
      <div class="hero photo" style="background:${sp.color}" data-act="slide-next" aria-label="Next photo">
        <img class="hero-img" src="${sp.src}" alt="${esc(sp.cap)}">${kind === 'Video' ? `<span class="playbig">${I.s(P.play, 26)}</span>` : ''}
        <div class="hero-bar">${back()}<button type="button" class="round" data-act="demo" data-v="Share (demo)" aria-label="Share">${I.s(P.share, 19)}</button></div>
        <span class="hero-label">${kind} · ${i + 1} of ${f.slides.length}</span>
        <div class="hero-dots">${f.slides.map((s, j) => `<button type="button" data-act="slide" data-v="${j}" aria-label="Show ${s[0].toLowerCase()} ${j + 1}" aria-pressed="${j === i}"><span class="hd${j === i ? ' on' : ''}" style="width:${j === i ? 20 : 7}px"></span></button>`).join('')}</div>
      </div>
      <div class="sheet-card">
        <div class="badges"><span class="sp big">${esc(t.sponsored)}</span><span class="fav">${I.s(P.star, 12)}Local favorite</span></div>
        <div class="title-block"><h1>${esc(f.name)}</h1><span class="tagline">${esc(f.tagline)}</span><span class="meta">${esc(f.meta)}</span></div>
        <div class="acts">
          <a class="act red" href="${maps(f.q)}" target="_blank" rel="noopener">${I.s(P.pin, 22)}<span>${esc(t.directions)}</span></a>
          <button type="button" class="act" data-act="demo">${I.s(P.call, 22)}<span>Call</span></button>
          <button type="button" class="act" data-act="demo">${I.s(P.insta, 22)}<span>Instagram</span></button>
          <button type="button" class="act" data-act="demo" data-v="Saved (demo)">${I.s(P.save, 22)}<span>Save</span></button>
        </div>
        <div class="tags">${f.tags.map((x) => `<span>${esc(x)}</span>`).join('')}</div>
        <div class="deal"><span class="deal-ic">${I.s(P.gift, 20)}</span><span><span class="eyebrow light">Deal of the month</span><b>${esc(f.deal)}</b></span></div>
        <section><h2>About</h2><p>${esc(f.about)}</p></section>
        <section><h2>Hours</h2><p>${esc(f.hours)}</p></section>
        <section><h2>Photos and videos</h2><div class="grid3">${f.tiles.map(([k], j) => { const ph = phs[(j + 1) % phs.length]; return `<span class="gt" style="background:${ph.color}">${phImg(ph)}${k === 'Video' ? `<span class="playmini">${I.s(P.play, 14)}</span>` : ''}</span>`; }).join('')}</div></section>
        ${critHTML(S.arg)}
        ${visitorsHTML(S.arg, true)}
        ${reviewsHTML(S.arg)}
        <footer class="foot"><a href="#/business">Is this your business? Manage this page</a></footer>
      </div>
    </div></div>`;
  }
  function listingHTML(p) {
    const t = T();
    const ph = topPhoto(p.id);
    return `<div class="scr page"><div class="scroll">
      <div class="hero small photo" style="background:${ph.color}"><img class="hero-img" src="${ph.url || ph.src}" alt="${esc(ph.cap)}">
        <div class="hero-bar">${back()}</div><span class="hero-label">Most-liked visitor photo · ♥ ${ph.likes} · by ${esc(ph.by)}</span></div>
      <div class="pad">
        <span class="freechip">Free listing</span>
        <h1>${esc(p.name)}</h1>
        <span class="meta">${esc(t[p.kind])}${p.id === 'brattle' ? ' · 9 West St' : ''} · ${esc(t.walk(mins(p.dist)))}</span>
        <div class="two">
          <a class="btn primary" href="${maps(p.q)}" target="_blank" rel="noopener">${I.s(P.pin)}<span>${esc(t.directions)}</span></a>
          <button type="button" class="btn" data-act="demo">${I.s(P.call)}<span>Call</span></button>
        </div>
        <section class="box"><h2>Hours</h2><p>[Hours]</p></section>
        ${critHTML(p.id)}
        ${visitorsHTML(p.id, false)}
        ${reviewsHTML(p.id)}
        <section class="pitch"><b>Own ${esc(p.name)}?</b><span>Add your own photos, videos, story and a deal of the month. Visitors' recommendations set your rank; a Sponsored spot can put you on top of the list.</span><a class="btn red" href="#/business">See Featured</a></section>
        <footer class="foot"><a href="#/place/florabella">See what a Featured page looks like</a></footer>
      </div>
    </div></div>`;
  }

  // --- Live now vendor screen
  function liveScreen() {
    const t = T();
    const cards = VENDORS.map((v, i) => `<button type="button" class="vcard" data-act="vopen" data-v="${i}" aria-label="${esc(v.name)}">
        <span class="vmedia" style="background:${vPhoto(v).color}">${phImg(vPhoto(v), false, i > 1)}<span class="livebadge">LIVE · ${esc(t.till(v.till))}</span><span class="vlabel">${v.slides[0] === 'Video' ? 'Video preview' : 'Photo'}</span>${v.slides[0] === 'Video' ? `<span class="playmini big">${I.s(P.play, 14)}</span>` : ''}</span>
        <span class="tile-name">${esc(v.name)}</span><span class="tile-sub">${esc(v.what)} · ${esc(t.mins(mins(v.dist)))}</span>
      </button>`).join('');
    let sheet = '';
    if (S.liveOpen >= 0) {
      const v = VENDORS[S.liveOpen];
      const k = v.slides[S.liveSlide] || 'Photo';
      sheet = `<div class="vsheet-dim" data-act="vclose"></div><div class="vsheet" role="dialog" aria-label="${esc(v.name)}">
        <div class="vbig" style="background:${vPhoto(v).color}"><img class="hero-img" src="${vPhoto(v).src}" alt="">
          <span class="livebadge big">LIVE · here ${esc(t.till(v.till))}</span>
          <button type="button" class="round pos-tr" data-act="vclose" aria-label="Close">${I.s(P.x, 20)}</button>
          <span class="vlabel big">${k} · ${S.liveSlide + 1} of ${v.slides.length}</span>
          ${k === 'Video' ? `<span class="playbig">${I.s(P.play, 24)}</span>` : ''}
          <div class="vdots">${v.slides.map((s, j) => `<button type="button" data-act="vslide" data-v="${j}" aria-label="Show ${s.toLowerCase()} ${j + 1}"><span class="hd${j === S.liveSlide ? ' on' : ''}" style="width:${j === S.liveSlide ? 22 : 8}px"></span></button>`).join('')}</div>
        </div>
        <div class="vinfo"><b>${esc(v.name)}</b><span class="muted">${esc(v.what)} · ${esc(t.mins(mins(v.dist)))} · Downtown Crossing</span>
          <div class="two"><a class="btn red" href="${maps('Downtown Crossing Boston')}" target="_blank" rel="noopener">${I.s(P.pin)}<span>${esc(t.directions)}</span></a><button type="button" class="btn" data-act="demo">${I.s(P.insta)}<span>Instagram</span></button></div>
        </div></div>`;
    }
    return `<div class="scr page"><div class="scroll">
      <header class="bar">${back()}<div class="logo-s">I ${I.heart(16, 15, '#B8232F')} BOSTON</div><span style="width:44px"></span></header>
      <div class="pad tight"><div class="lh"><span class="ldot big pdot"></span><h1 class="h2">${esc(t.tabLive)}</h1></div><p class="muted">Pop-ups and market stands selling right now</p></div>
      <div class="vcards">${cards}</div>
      <div class="pad"><section class="pitch light"><b>Selling at a market or a pop-up?</b><span>Go live from your phone when you open, with photos, videos and your Instagram. You drop off when you close.</span><a class="btn" href="#/business">Get listed</a></section>
      <p class="small muted pb">${esc(t.sample)}</p></div>
    </div>${sheet}</div>`;
  }

  // --- For businesses
  function businessScreen() {
    const plans = [
      { name: 'Basic', price: 'Free', period: '', cta: 'Start free', strong: false, features: ['A listing on nearby signs', 'Reviews and photos from signed-in visitors who checked in', 'Address, hours and directions', 'In 10 languages'] },
      { name: 'Featured', price: '$50', period: ' / month', cta: 'Get Featured', strong: true, features: ['Everything in Basic', 'Your own photos, menu and a deal of the month', 'Reply to reviews', 'A Sponsored label and your photo wherever you show up', 'A monthly report: how many people saw and tapped you'] },
      { name: 'Spotlight', price: '[YOUR PRICE]', period: '', cta: 'Ask about Spotlight', strong: false, features: ['Everything in Featured', 'The Sponsored card at the top of Nearby, on every sign within ½ mile', 'Your own I Love Boston sign at your door'] },
    ];
    return `<div class="scr page"><div class="scroll">
      <header class="bar white">${back()}<div class="logo-s">I ${I.heart(16, 15, '#B8232F')} BOSTON</div><span class="biztag">For businesses</span></header>
      <section class="bizhero"><h1>Get found by everyone who scans downtown.</h1><p>Your business shows up on every I Love Boston sign near you, in 10 languages.</p>
        <button type="button" class="btn red big" data-act="scrollto" data-v="plans">Get listed</button><button type="button" class="linkbtn" data-act="scrollto" data-v="how">How it works</button></section>
      <section class="pad" id="how"><h2 class="h2">How it works</h2>
        ${['Sign up and add your photos, hours and menu.', 'We translate your page into 10 languages.', 'People scan a sign nearby and find you, in their own language.'].map((s, i) => `<div class="step"><span>${i + 1}</span><p>${esc(s)}</p></div>`).join('')}</section>
      <section class="pad" id="plans"><h2 class="h2">Plans</h2>
        ${plans.map((p) => `<article class="plan${p.strong ? ' strong' : ''}"><div class="plan-h"><h3>${esc(p.name)}</h3><span class="price">${esc(p.price)}<small>${esc(p.period)}</small></span></div>
          <ul>${p.features.map((f) => `<li>${I.s(P.check, 18, 2.4)}<span>${esc(f)}</span></li>`).join('')}</ul>
          <button type="button" class="btn${p.strong ? ' primary' : ''} wide" data-act="demo">${esc(p.cta)}</button></article>`).join('')}
        <div class="box fair"><h2>${I.s(P.thumb, 18, 2.2)} A fair ranking</h2><p class="muted">The list on every sign is ranked by recommendations from visitors who signed in with Google or Apple and checked in. Local critics' picks get a 🏆. Nobody can pay to move up or change a review: paid spots sit above the ranking and always say Sponsored.</p></div></section>
      <section class="pad"><div class="box"><h2>Questions?</h2><p class="muted">Reach us at [CONTACT EMAIL OR PHONE].</p></div></section>
      <footer class="foot pb"><a href="#/">See the visitor page</a></footer>
    </div></div>`;
  }

  // --- Spots & badges & the Freedom Trail
  const AREAS = [
    { name: 'Downtown', spots: [['DTC-001', 'Downtown Crossing', "You're here", 'Today', true], ['DTC-002', 'Post Office Square', '6 min walk'], ['DTC-003', 'City Hall Plaza', '8 min walk', 'Nov 12']] },
    { name: 'North End', spots: [['NE-001', 'Hanover Street', '15 min walk', 'Nov 8'], ['NE-002', 'Paul Revere Mall', '17 min walk'], ['NE-003', 'Christopher Columbus Park', '16 min walk']] },
    { name: 'Beacon Hill', spots: [['BH-001', 'State House steps', '8 min walk'], ['BH-002', 'Charles Street', '14 min walk']] },
    { name: 'Back Bay', spots: [['BB-001', 'Copley Square', '8 min on the Green Line'], ['BB-002', 'Newbury Street', '10 min on the Green Line']] },
    { name: 'Chinatown', spots: [['CT-001', 'Beach Street', '8 min walk']] },
    { name: 'Seaport', spots: [['SP-001', 'Seaport Common', '12 min on the Silver Line']] },
  ];
  const BADGES = [
    { id: 'first', name: 'First scan', how: 'Scan any I Love Boston sign.', have: 1, need: 1, color: '#B8232F', when: 'Nov 8', d: '<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z"/>' },
    { id: 'downtown', name: 'Downtown local', how: 'Collect all 3 Downtown spots.', have: 2, need: 3, color: 'var(--navy-surface)', d: '<path d="M4 21V6l8-3.5L20 6v15M9.5 21v-4.5h5V21M8 9.5h2M14 9.5h2M8 13h2M14 13h2"/>' },
    { id: 'northend', name: 'North End explorer', how: 'Collect all 3 North End spots.', have: 1, need: 3, color: '#2F6B43', d: P.pin },
    { id: 'beacon', name: 'Beacon Hill', how: 'Collect both Beacon Hill spots.', have: 0, need: 2, color: '#8A5A00', d: '<path d="M9 3h6l1.5 4h-9zM10 7v5h4V7M12 12v8.5M9 21h6"/>' },
    { id: 'backbay', name: 'Back Bay', how: 'Collect both Back Bay spots.', have: 0, need: 2, color: '#5B3A8A', d: P.pin },
    { id: 'all', name: 'All of Boston', how: 'Collect all 12 spots.', have: 3, need: 12, color: '#B8232F', d: '<path d="M12 3.2l2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L3.4 9.5l6-.8z"/>' },
    { id: 'trail', name: 'Freedom Trail', how: 'Walk all 16 stops of the Freedom Trail.', have: 5, need: 16, color: '#C8102E', d: P.steps },
    { id: 'night', name: 'Night owl', how: 'Scan a sign after 9 pm.', have: 0, need: 1, color: '#24406F', d: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>' },
    { id: 'live', name: 'Pop-up regular', how: "Visit 5 stands while they're live.", have: 1, need: 5, color: '#A2461A', d: '<path d="M5 8h14l-1.2 12.5H6.2zM9 8V6.5a3 3 0 0 1 6 0V8"/>' },
  ];
  const STOPS = ['Boston Common', 'Massachusetts State House', 'Park Street Church', 'Granary Burying Ground', "King's Chapel", 'Boston Latin School site', 'Old Corner Bookstore', 'Old South Meeting House', 'Old State House', 'Boston Massacre site', 'Faneuil Hall', 'Paul Revere House', 'Old North Church', "Copp's Hill Burying Ground", 'USS Constitution', 'Bunker Hill Monument'];
  const STOP_XY = [[70, 242], [80, 212], [104, 224], [118, 210], [142, 196], [154, 208], [166, 220], [176, 234], [196, 190], [206, 178], [222, 160], [258, 138], [272, 116], [254, 104], [310, 50], [246, 38]];
  const DONE = 5;
  function pointsCard() {
    const t = T();
    if (!S.user) {
      return `<div class="ptc signc"><b class="signc-t">${I.s(P.star, 18)}<span>${esc(t.signTitle)}</span></b><p>${esc(t.signBody)}</p>${signBtns()}
          <p class="small muted sign-demo">Demo: nothing is sent to Google or Apple.</p></div>`;
    }
    const u = S.user;
    const prof = `<div class="prof">${avatar(u.name, 44)}<span class="prof-t"><b>${esc(u.name)}</b><span>Signed in with ${esc(u.provider)} (demo)</span></span><button type="button" class="linkbtn2" data-act="signout">Sign out</button></div>`;
    if (!S.f.points) return `<div class="ptc">${prof}</div>`;
    const i = levelOf(S.points), next = LEVELS[i + 1];
    const pct = next ? Math.round((S.points - LEVELS[i][0]) / (next[0] - LEVELS[i][0]) * 100) : 100;
    return `<div class="ptc">${prof}
        <div class="ptc-top"><span class="ptc-star" aria-hidden="true">★</span><b>${S.points}</b><span class="ptc-w">points</span><span class="ptc-lvl">Level ${i + 1} · ${LEVELS[i][1]}</span></div>
        <div class="bar8"><div style="width:${pct}%;background:#E2A90F"></div></div>
        <span class="ptc-next">${next ? `${next[0] - S.points} more for Level ${i + 2} · ${next[1]}` : 'Top level!'}</span>
        <button type="button" class="ptc-how" data-act="how" aria-expanded="${S.howOpen}"><span>How to earn points</span><span class="chev${S.howOpen ? ' open' : ''}">${I.s(P.right, 16, 2.4)}</span></button>
        ${S.howOpen ? `<div class="ptc-list">${EARN.map(([l, n]) => `<div><span>${esc(l)}</span><b>+${n}</b></div>`).join('')}</div>
          <p class="ptc-note">You need to be signed in with Google or Apple, so every review is a real person. Check-ins only count when your phone's location shows you're there, you can review a place once a day, and photos are checked before they show up.</p>` : ''}
      </div>`;
  }
  function passportScreen() {
    const tabs = [['spots', 'Spots'], ['badges', 'Badges'], ['trail', 'Freedom Trail']].map(([id, l]) => `<button type="button" class="tab" role="tab" aria-selected="${S.pTab === id}" data-act="ptab" data-v="${id}">${l}</button>`).join('');
    let body = '';
    if (S.pTab === 'spots') {
      const signed = !!S.user;
      const has3 = (s) => (signed ? s[3] : '');
      const all = []; AREAS.forEach((a) => a.spots.forEach((s) => all.push(s)));
      const got = all.filter(has3).length;
      const stamps = all.slice().sort((a, b) => (has3(b) ? 1 : 0) - (has3(a) ? 1 : 0)).map((s) => I.heart(22, 20, has3(s) ? '#FF5A6E' : 'none', has3(s) ? '#FF5A6E' : 'rgba(255,255,255,.4)', 2)).join('');
      body = `<div class="pcard"><div class="pc-top"><b>${got}</b><span>of ${all.length} spots collected</span></div><div class="stamps">${stamps}</div>
          <p>${signed ? "Closest one you haven't collected: <b>DTC-002 · Post Office Square</b>, a 6 min walk." : "Sign in, then scan this sign (<b>DTC-001</b>) to collect your first spot."}</p></div>
        ${AREAS.map((a) => {
          const n = a.spots.filter(has3).length;
          return `<section class="area"><div class="area-h"><h2>${esc(a.name)}</h2><span${n === a.spots.length ? ' class="ok"' : ''}>${n} of ${a.spots.length}</span></div>
            ${a.spots.map((s, i) => {
              const has = !!has3(s);
              return `<div class="spotrow"${i ? '' : ' style="border-top:0"'}><span class="stamp${has ? ' got' : ''}">${I.heart(20, 18, has ? '#FF5A6E' : 'none', has ? '#FF5A6E' : '#AEB6C4', 2.2)}</span>
                <span class="sr-txt"><span class="code">${s[0]}</span><b>${esc(s[1])}</b><span class="${s[4] ? 'here' : 'muted'}">${esc(s[2])}</span></span>
                ${has ? `<span class="okc">${I.s(P.check, 15, 2.6)}${esc(s[3])}</span>` : '<span class="notyet">Not yet</span>'}</div>`;
            }).join('')}</section>`;
        }).join('')}
        <p class="small muted pad pb">Sample spots. DTC-001 is the real sign today; the others show how more signs would look.</p>`;
    } else if (S.pTab === 'badges') {
      const hv = (b) => (S.user ? b.have : 0);
      const sb0 = BADGES.find((b) => b.id === S.badge) || BADGES[0];
      const sb = Object.assign({}, sb0, { have: hv(sb0) });
      const earnedSel = sb.have >= sb.need;
      body = `<div class="bgrid">${BADGES.map((b0) => {
          const b = Object.assign({}, b0, { have: hv(b0) });
          const earned = b.have >= b.need, on = b.id === S.badge;
          return `<button type="button" class="badge${on ? ' on' : ''}" data-act="badge" data-v="${b.id}" aria-pressed="${on}" aria-label="${esc(b.name)}${earned ? ', earned' : ', ' + b.have + ' of ' + b.need}">
            <span class="medal" style="background:${earned ? b.color : 'var(--surface3)'};color:${earned ? '#fff' : 'var(--faint)'};${earned ? `box-shadow:0 0 0 3px var(--surface),0 0 0 5px ${b.color}` : ''}">${I.s(b.d, 28, 1.8)}${earned ? '' : `<span class="lockmini">${I.s(P.lock, 12, 2.6)}</span>`}</span>
            <span class="bname">${esc(b.name)}</span><span class="bprog${earned ? ' ok' : ''}">${earned ? 'Earned ' + b.when : b.have + ' of ' + b.need}</span></button>`;
        }).join('')}</div>
        <div class="bdetail"><div class="bd-h"><b>${esc(sb.name)}</b><span${earnedSel ? ' class="ok"' : ''}>${earnedSel ? 'Earned ' + sb.when : sb.have + ' of ' + sb.need + ' · ' + (sb.need - sb.have) + ' to go'}</span></div><p>${esc(sb.how)}</p>
          <div class="bar8"><div style="width:${Math.round(Math.min(sb.have, sb.need) / sb.need * 100)}%;background:${sb.color}"></div></div></div>
        <p class="small muted pad pb">Your location is only checked when you scan a sign, to make sure you're really there. It isn't kept.</p>`;
    } else {
      const DN = S.user ? DONE : 0;
      const dots = STOP_XY.map((xy, i) => {
        const done = i < DN, next = i === DN, size = done ? 12 : next ? 14 : 10;
        return `<span class="tdot" style="left:${xy[0] - size / 2}px;top:${xy[1] - size / 2}px;width:${size}px;height:${size}px;border:${next ? 3 : 2}px solid ${done ? 'var(--surface)' : next ? '#C8102E' : 'var(--faint)'};background:${done ? '#C8102E' : 'var(--surface)'}"></span>`;
      }).join('');
      body = `<div class="trailmap">
          <svg width="358" height="270" viewBox="0 0 358 270" role="img" aria-label="Sketch map of the Freedom Trail, from Boston Common through downtown and the North End to Bunker Hill. ${DN ? "You've walked the first " + DN + ' stops.' : 'Sign in to track your walk.'}">
            <path d="M0 70 C 100 58, 220 88, 358 64 L358 90 C 220 114, 100 84, 0 96 Z" fill="#CFE1F2"/><path d="M332 120 C 318 170, 342 220, 300 270 L358 270 L358 96 Z" fill="#CFE1F2"/>
            <polygon points="20,218 96,206 92,262 24,266" fill="#CFE5D2"/>
            <g fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M142 196 L154 208 L166 220 L176 234 L196 190 L206 178 L222 160 L258 138 L272 116 L254 104 L310 50 L246 38" stroke="#C8102E" stroke-opacity="0.7" stroke-width="3" stroke-dasharray="5 6"/>${DN ? '<path d="M70 242 L80 212 L104 224 L118 210 L142 196" stroke="#C8102E" stroke-width="4.5"/>' : '<path d="M70 242 L80 212 L104 224 L118 210 L142 196" stroke="#C8102E" stroke-opacity="0.7" stroke-width="3" stroke-dasharray="5 6"/>'}</g>
            <g font-family="Inter, sans-serif" font-size="9.5" font-weight="700" fill="#13254A" stroke="#E9EDF2" stroke-width="3" stroke-linejoin="round" paint-order="stroke"><text x="28" y="262">Boston Common</text><text x="230" y="168">Faneuil Hall</text><text x="262" y="121" text-anchor="end">Old North Church</text><text x="352" y="70" text-anchor="end">USS Constitution</text><text x="236" y="42" text-anchor="end">Bunker Hill</text></g>
            <text x="16" y="88" font-family="Inter, sans-serif" font-size="9" font-style="italic" font-weight="600" fill="#3E6A93">Charles River</text>
          </svg>${dots}<span class="you-halo"></span><span class="you"></span></div>
        <div class="tprog"><span><b>${DN} of 16</b> stops</span><span class="muted">${DN ? '0.5' : '0'} of 2.5 mi</span></div>
        <div class="bar8 pad0"><div style="width:${Math.round(DN / 16 * 100)}%;background:#C8102E"></div></div>
        <button type="button" class="track${S.tracking ? ' on' : ''}" data-act="track" aria-pressed="${S.tracking}">${S.tracking ? '<span class="wdot pdot"></span>' : I.s(P.nav, 18)}<span>${S.tracking ? 'Tracking your walk · Stop' : 'Track my walk'}</span></button>
        <p class="small muted center pad">${S.tracking ? 'Location is on while you walk. Next stop: ' + STOPS[DN] + ', 2 min away.' : S.user ? 'Your location stays on only while you track, and you can stop any time.' : 'Sign in to save your progress. Your location stays on only while you track.'}</p>
        <h3 class="eyebrow pad">The 16 stops</h3>
        <div class="stops">${STOPS.map((n, i) => {
          const done = i < DN, next = i === DN;
          return `<div class="stoprow"${i ? '' : ' style="border-top:0"'}><span class="sn${done ? ' done' : next ? ' next' : ''}">${done ? I.s(P.check, 14, 3) : i + 1}</span><span class="sname${done ? ' muted' : ''}${next ? ' strong' : ''}">${esc(n)}</span><span class="stag${done ? ' ok' : ''}">${done ? 'Done' : next ? 'Next · 2 min' : ''}</span></div>`;
        }).join('')}</div>
        <div class="finisher"><span class="fmedal">${I.s(P.steps, 26, 1.8)}<span class="lockmini">${I.s(P.lock, 12, 2.6)}</span></span><span><b>Freedom Trail finisher</b><span class="muted">Walk all 16 stops to earn it. ${16 - DN} to go.</span></span></div>
        <p class="small muted pad pb">The stops are the trail's 16 official sites. Your progress here is a sample.</p>`;
    }
    return `<div class="scr page white"><div class="scroll">
      <header class="bar">${back('Back to the map')}<div class="logo-s">I ${I.heart(16, 15, '#B8232F')} BOSTON</div><span style="width:44px"></span></header>
      <div class="pad tight"><h1 class="h1">Spots &amp; badges</h1><p class="muted">Every I Love Boston sign is a spot. Scan one with your location on to collect it.</p></div>
      ${pointsCard()}
      <div class="tabs ptabs" role="tablist" aria-label="Show">${tabs}</div>
      ${body}
    </div></div>`;
  }

  // --- Photo credits (the sample photos are from Wikimedia Commons)
  function creditsScreen() {
    const rows = PHOTOS.map(([place, cap, , , color, artist, lic, file], j) => {
      const ph = PH[place].find((x) => x.file === file);
      return `<a class="cr" href="https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file)}" target="_blank" rel="noopener"><span class="cr-img" style="background:${color}">${phImg(ph, true, j > 8)}</span>
        <span class="cr-txt"><b>${esc(cap)}</b><span>${esc(artist)} · ${esc(lic)}</span><span>${esc(placeById(place).name)}</span></span>${I.s(P.right, 16, 2.2)}</a>`;
    }).join('');
    return `<div class="scr page white"><div class="scroll">
      <header class="bar">${back()}<div class="logo-s">I ${I.heart(16, 15, '#B8232F')} BOSTON</div><span style="width:44px"></span></header>
      <div class="pad tight"><h1 class="h1">Photo credits</h1><p class="muted">The sample photos come from Wikimedia Commons, used under their free licenses (CC0, public domain, CC BY and CC BY-SA). Most aren't from these exact places. On the real site, businesses and visitors add their own.</p></div>
      <div class="credits">${rows}${Object.keys(VPHOTOS).map((id) => { const [cap, color, artist, lic, file] = VPHOTOS[id]; return `<a class="cr" href="https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file)}" target="_blank" rel="noopener"><span class="cr-img" style="background:${color}"><img src="p/v-${id}-t.webp" alt="" loading="lazy"></span>
        <span class="cr-txt"><b>${esc(cap)}</b><span>${esc(artist)} · ${esc(lic)}</span><span>Live now</span></span>${I.s(P.right, 16, 2.2)}</a>`; }).join('')}</div>
      <p class="small muted pad pb">Tap a photo to see it, its author and its license on Wikimedia Commons. The photos here are resized and cropped.</p>
    </div></div>`;
  }

  const SCREENS = { spots: passportScreen, place: placeScreen, live: liveScreen, business: businessScreen, credits: creditsScreen };

  /* =================================================================
     One click handler for everything
     ================================================================= */
  app.addEventListener('click', (e) => {
    if (justDragged && e.target.closest('#shHead')) { justDragged = false; return; }
    const el = e.target.closest('[data-act]');
    if (!el) {
      if (S.route === 'h' && e.target.closest('#shHead') && !e.target.closest('a')) { S.sheet = S.sheet === 'half' ? 'full' : 'half'; updH(); return; }
      // a tap on the map's background closes the preview
      if (S.route === 'h' && e.target.closest('#map') && !moved && S.sel) { S.sel = null; updH(); }
      return;
    }
    const act = el.dataset.act, v = el.dataset.v;
    switch (act) {
      case 'tab': S.tab = v; S.sel = null; updH(); break;
      case 'cat':
        if (v === 'friends' && needSign('cat', 'friends')) break;
        S.cat = v; updH(); break;
      case 'day': S.day = v; S.sel = null; updH(); break;
      case 'station': S.tOpen = S.tOpen === v ? '' : v; updH(); break;
      case 'tshow': S.tShow = !S.tShow; updH(); break;
      case 'style':
        S.style = v; saveStyle();
        S.demoOpen = false; S.view = -1; S.sel = null; S.tab = 'near';
        if (S.sheet === 'peek') S.sheet = 'half';
        updH();
        toast('Nearby list: ' + STYLES.find((s) => s.k === v).name);
        break;
      case 'checkin': doCheckin(v); break;
      case 'review': doReview(v); break;
      case 'recommend': doRecommend(v); break;
      case 'sort': S.sort = v; updH(); $('#shBody').scrollTop = 0; break;
      case 'add-open': if (!needSign('add-open')) { S.addOpen = true; S.addQ = ''; refresh(); } break;
      case 'add-close': S.addOpen = false; refresh(); break;
      case 'invite': invite(); break;
      case 'sign-open': needSign(null); break;
      case 'sign-close': S.signOpen = false; S.pending = null; S.signing = ''; refresh(); break;
      case 'signin': doSignIn(v); break;
      case 'signout': signOut(); break;
      case 'demo-sign': S.demoOpen = false; if (S.user) signOut(); else needSign(null); break;
      case 'rv-close': S.reviewFor = null; refresh(); break;
      case 'rv-up': S.rvUp = v === '1'; refresh(); break;
      case 'rv-post': postReview(); break;
      case 'photo': doPhoto(v); break;
      case 'like': doLike(v); break;
      case 'how': S.howOpen = !S.howOpen; rerenderScreen(); break;
      case 'sel': selectFromList(el.dataset.k); break;
      case 'pin': if (moved) return; if (S.sheet === 'full') S.sheet = 'half'; S.sel = el.dataset.k; updH(); break;
      case 'clear': S.sel = null; updH(); break;
      case 'toggle': S.sheet = S.sheet === 'half' ? 'full' : 'half'; updH(); break;
      case 'half': S.sheet = 'half'; updH(); break;
      case 'recenter': animateTo({ tx: G.baseX, ty: G.baseY, k: 1 }, null, () => { S.tx = null; S.ty = null; S.z = 1; $('#world').classList.remove('nodrag'); updH(); }); break;
      case 'lang': S.langOpen = true; updH(); break;
      case 'langclose': S.langOpen = false; updH(); break;
      case 'setlang':
        S.lang = v; S.langOpen = false;
        try { localStorage.setItem('ilb-lang', v); } catch (err) { /* ignore */ }
        updH(); break;
      case 'demo': toast(v || 'This part is a demo'); break;
      case 'demo-open': S.demoOpen = true; S.langOpen = false; updH(); break;
      case 'demo-close': S.demoOpen = false; updH(); break;
      case 'demo-tab': S.demoTab = v; updH(); break;
      case 'flag': {
        S.f[v] = !S.f[v];
        saveFlags();
        if (!tabsOn().includes(S.tab)) S.tab = 'near';
        if (S.sel && ((S.sel.startsWith('live:') && !S.f.live) || (S.sel.startsWith('event:') && !S.f.events))) S.sel = null;
        updH();
        break;
      }
      case 'flags-reset': S.f = Object.assign({}, FDEF); saveFlags(); updH(); break;
      case 'theme': S.theme = v; applyTheme(); updH(); break;
      case 'look': {
        const i = +v;
        S.view = i; updH();
        break;
      }
      case 'view-close': S.view = -1; updH(); break;
      case 'view-prev': S.view = (S.view + LOOKS.length - 1) % LOOKS.length; updH(); break;
      case 'view-next': S.view = (S.view + 1) % LOOKS.length; updH(); break;
      case 'view-try': S.view = -1; S.demoOpen = false; updH(); break;
      case 'back':
        if (S.cameFromApp && history.length > 1) history.back();
        else location.hash = '#/';
        break;
      case 'slide': S.slide = +v; rerenderScreen(); break;
      case 'slide-next': if (e.target.closest('button,a')) return; { const f = FEATURED[S.arg]; if (f) { S.slide = (S.slide + 1) % f.slides.length; rerenderScreen(); } } break;
      case 'vopen': S.liveOpen = +v; S.liveSlide = 0; rerenderScreen(); break;
      case 'vclose': S.liveOpen = -1; rerenderScreen(); break;
      case 'vslide': S.liveSlide = +v; rerenderScreen(); break;
      case 'scrollto': { const target = document.getElementById(v); if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' }); } break;
      case 'ptab': S.pTab = v; rerenderScreen(); break;
      case 'badge': S.badge = v; rerenderScreen(); break;
      case 'track': S.tracking = !S.tracking; rerenderScreen(); break;
      default: break;
    }
  });
  app.addEventListener('input', (e) => {
    if (e.target.id === 'rvText') S.rvText = e.target.value;
    if (e.target.id === 'addQ') {
      S.addQ = e.target.value;
      const q = S.addQ.trim().toLowerCase();
      app.querySelectorAll('.addrow').forEach((r) => { r.hidden = !!q && !r.dataset.name.includes(q); });
    }
  });
  document.addEventListener('keydown', (e) => {
    if (S.view >= 0 && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
      S.view = (S.view + (e.key === 'ArrowRight' ? 1 : LOOKS.length - 1)) % LOOKS.length; updH(); return;
    }
    if (e.key === 'Escape') {
      if (S.signOpen) { S.signOpen = false; S.pending = null; refresh(); }
      else if (S.addOpen) { S.addOpen = false; refresh(); }
      else if (S.reviewFor) { S.reviewFor = null; refresh(); }
      else if (S.view >= 0) { S.view = -1; updH(); }
      else if (S.demoOpen) { S.demoOpen = false; updH(); }
      else if (S.langOpen) { S.langOpen = false; updH(); }
      else if (S.sel) { S.sel = null; updH(); }
      else if (S.route === 'live' && S.liveOpen >= 0) { S.liveOpen = -1; rerenderScreen(); }
    }
  });

  let vx = null;
  app.addEventListener('pointerdown', (e) => { if (e.target.closest('.v-stage')) vx = e.clientX; });
  app.addEventListener('pointerup', (e) => {
    if (vx == null) return;
    const dx = e.clientX - vx; vx = null;
    if (S.view >= 0 && Math.abs(dx) > 50) { S.view = (S.view + (dx < 0 ? 1 : LOOKS.length - 1)) % LOOKS.length; updH(); }
  });

  window.addEventListener('hashchange', () => {
    S.cameFromApp = true;
    if (!location.hash.startsWith('#/live')) { S.liveOpen = -1; }
    if (!location.hash.startsWith('#/place')) { S.slide = 0; }
    route();
  });
  let rz = 0;
  window.addEventListener('resize', () => {
    clearTimeout(rz);
    rz = setTimeout(() => { if (S.route === 'h' && hMounted) { G = geo(); updH(); } }, 120);
  });

  applyTheme();
  route();
})();
