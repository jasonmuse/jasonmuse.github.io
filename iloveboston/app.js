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
  const CAT_COLOR = { eat: '#C2410C', shop: '#1D4ED8', see: '#15803D', services: '#7E22CE' };
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

  /* ---------- sample data (same as the canvas) ---------- */
  const PLACES = [
    { id: 'florabella', name: 'Florabella Flowers', cat: 'shop', kind: 'flowers', dist: 0.05, sponsored: true, photo: true, tint: '#F6E1E4', ink: '#B8232F', page: 'place/florabella', q: 'Downtown Crossing Boston', x: 230, y: 236 },
    { id: 'brattle', name: 'Brattle Book Shop', cat: 'shop', kind: 'books', dist: 0.1, page: 'place/brattle', q: 'Brattle Book Shop Boston', x: 186, y: 290 },
    { id: 'opera', name: 'Boston Opera House', cat: 'see', kind: 'theater', dist: 0.1, page: 'place/opera', q: 'Boston Opera House', x: 208, y: 334 },
    { id: 'drphil', name: 'Dr Phil Repair Center', cat: 'services', kind: 'repair', dist: 0.2, sponsored: true, photo: true, tint: '#E6EDFA', ink: '#2A4E9B', page: 'place/drphil', q: 'Dr Phil Repair Center Tremont St Boston', x: 160, y: 318 },
    { id: 'paku', name: 'Paku Katsuya', cat: 'eat', kind: 'japanese', dist: 0.2, page: 'place/paku', q: 'Paku Katsuya Boston', x: 146, y: 276 },
    { id: 'common', name: 'Boston Common', cat: 'see', kind: 'park', dist: 0.2, page: 'place/common', q: 'Boston Common', x: 126, y: 244 },
    { id: 'oldstate', name: 'Old State House', cat: 'see', kind: 'historic', dist: 0.3, page: 'place/oldstate', q: 'Old State House Boston', x: 246, y: 116 },
    { id: 'genki', name: 'Genki Ya', cat: 'eat', kind: 'sushi', dist: 0.3, page: 'place/genki', q: 'Genki Ya Boston', x: 150, y: 370 },
    { id: 'faneuil', name: 'Faneuil Hall Marketplace', cat: 'see', kind: 'market', dist: 0.4, page: 'place/faneuil', q: 'Faneuil Hall Marketplace Boston', x: 326, y: 82 },
    { id: 'chinatown', name: 'Chinatown Gate', cat: 'see', kind: 'landmark', dist: 0.4, page: 'place/chinatown', q: 'Chinatown Gate Boston', x: 300, y: 372 },
  ];
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
    { k: 'h', name: 'H · D, calmer', live: true, desc: "The map with a pull-up list and three tabs. It's the one you're using." },
    { k: 'a', name: 'A · Classic', desc: "Matches Phil's sign: a clean list with categories, a radius and the 10 languages." },
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
    ['walkline', 'Walk line', 'Places as stops on a line. Off shows a plain list'],
    ['colors', 'Category colors', 'Eat, Shop, See and Services each get a color on the map and the list'],
  ];
  const FDEF = { events: true, live: true, transit: true, spots: true, featured: true, langs: true, walkline: true, colors: true };
  function loadFlags() {
    try { return Object.assign({}, FDEF, JSON.parse(localStorage.getItem('ilb-f') || '{}')); } catch (e) { return Object.assign({}, FDEF); }
  }
  function saveFlags() {
    try { localStorage.setItem('ilb-f', JSON.stringify(S.f)); } catch (e) { /* ignore */ }
  }

  /* ---------- state ---------- */
  const S = {
    route: 'h', arg: '',
    tab: 'near', cat: 'all', day: 'today', sheet: 'half', sel: null, tx: null, ty: null, tOpen: 'dtx',
    lang: detectLang(), langOpen: false,
    pTab: 'spots', badge: 'downtown', tracking: false,
    slide: 0, liveOpen: -1, liveSlide: 0,
    f: loadFlags(), demoOpen: false, demoTab: 'looks', view: -1,
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
  function toast(msg) {
    let el = $('#toast');
    if (!el) { el = document.createElement('div'); el.id = 'toast'; el.className = 'toast'; app.appendChild(el); }
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, 1800);
  }

  /* ---------- router ---------- */
  function route() {
    const h = location.hash.replace(/^#\/?/, '');
    const parts = h.split('/');
    S.route = parts[0] || 'h';
    S.arg = parts[1] || '';
    if (S.route === 'looks') { S.route = 'h'; S.demoOpen = true; S.demoTab = 'looks'; }
    if (S.route === 'live' && S.arg) {
      const ix = VENDORS.findIndex((v) => v.id === S.arg);
      if (ix >= 0) { S.liveOpen = ix; S.liveSlide = 0; }
    }
    render();
  }
  function render() {
    if (S.route === 'h' || !SCREENS[S.route]) { mountH(); return; }
    hMounted = false;
    app.innerHTML = SCREENS[S.route]();
    const sc = $('.scroll', app);
    if (sc) sc.scrollTop = 0;
  }
  function rerenderScreen() {
    const sc = $('.scroll', app);
    const top = sc ? sc.scrollTop : 0;
    app.innerHTML = SCREENS[S.route]();
    const sc2 = $('.scroll', app);
    if (sc2) sc2.scrollTop = top;
  }

  /* =================================================================
     H: the map with a pull-up list
     ================================================================= */
  let hMounted = false;
  let G = null;                 // geometry
  let cur = { tx: 0, ty: 0 };   // live translate while dragging
  let md = null, sd = null, moved = false, dragTop = null, justDragged = false;
  let sig = { pins: '', body: '', prev: '' };

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
  function bounds(top) {
    return { txMin: G.W - WORLD.x1, txMax: -WORLD.x0, tyMin: Math.min(0, top - WORLD.y1), tyMax: -WORLD.y0 };
  }
  function curTrans(top) {
    const b = bounds(top);
    const tx = S.tx == null ? G.baseX : S.tx;
    const ty = S.ty == null ? G.baseY : S.ty;
    return { tx: clamp(tx, b.txMin, b.txMax), ty: clamp(ty, b.tyMin, b.tyMax) };
  }

  function mountH() {
    G = geo();
    app.innerHTML = `
      <div class="scr h">
        <div class="map" id="map">
          <div class="world" id="world">${$('#world-svg').innerHTML}<div id="spotsL"></div><div id="stationsL"></div><div id="pinsL"></div></div>
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
        <div class="viewer-wrap" id="viewerWrap" hidden></div>
      </div>`;
    hMounted = true;
    sig = { pins: '', body: '', prev: '', layers: '', demo: '', view: '' };
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
      const ps = S.sel + '|' + S.lang;
      if (sig.prev !== ps) { prevEl.innerHTML = previewHTML(); sig.prev = ps; }
      prevEl.hidden = false; listEl.hidden = true;
    } else {
      prevEl.hidden = true; listEl.hidden = false; sig.prev = '';
    }
    const top = sheetTop();
    sheet.style.top = top + 'px';
    // map
    const tr = curTrans(top);
    cur = { tx: tr.tx, ty: tr.ty };
    $('#world').style.transform = `translate(${tr.tx}px,${tr.ty}px)`;
    // map layers that features turn on and off
    const fs = JSON.stringify(S.f);
    if (sig.layers !== fs) {
      $('#stationsL').innerHTML = S.f.transit ? STATIONS.map((st) => `<span class="chip-st" style="left:${st.x}px;top:${st.y - 10}px">${st.lines.map((l) => `<span class="dot8" style="background:${LINE[l].c}"></span>`).join('')}<span>${esc(st.short)}</span></span>`).join('') : '';
      $('#spotsL').innerHTML = S.f.spots ? SPOTS.map((p) => `<a class="spot" href="#/spots" style="left:${p.x}px;top:${p.y}px" aria-label="Sign ${p.code}, ${esc(p.area)}${p.got ? ', collected' : ''}. See every spot">${I.heart(12, 11, p.got ? '#B8232F' : 'none', '#B8232F', 2.5)}<span>${p.code}</span></a>`).join('') : '';
      $('#dtcSlot').innerHTML = S.f.spots
        ? `<a class="dtc" href="#/spots" aria-label="Sign DTC-001: see every spot, your badges and the Freedom Trail"><span>DTC-001</span>${I.s(P.right, 14, 2.4)}</a>`
        : '<span class="dtc static">DTC-001</span>';
      sig.layers = fs;
    }
    // pins
    const pinSig = [S.tab, S.cat, S.day, S.sel, S.lang, fs].join('|');
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
    const bodySig = [S.tab, S.cat, S.day, S.tOpen, S.lang, fs].join('|');
    if (sig.body !== bodySig) {
      const body = $('#shBody');
      const keep = sig.body.split('|')[0] === S.tab ? body.scrollTop : 0;
      body.innerHTML = S.tab === 'near' ? nearHTML() : S.tab === 'events' ? eventsHTML() : liveHTML();
      body.scrollTop = keep;
      sig.body = bodySig;
    }
    // chrome
    const rc = $('#recenter');
    const panned = (S.tx != null && S.tx !== G.baseX) || (S.ty != null && S.ty !== G.baseY);
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
    const ds = [S.demoOpen, S.demoTab, fs].join('|');
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
    const vw = $('#viewerWrap');
    if (S.view >= 0) {
      if (sig.view !== String(S.view)) { vw.innerHTML = viewerHTML(); sig.view = String(S.view); }
      vw.hidden = false;
    } else { vw.hidden = true; vw.innerHTML = ''; sig.view = ''; }
  }

  function demoHTML() {
    const looks = LOOKS.map((l, i) => `<button type="button" class="lcard" data-act="look" data-v="${i}" aria-label="${esc(l.name)}${l.live ? ", the one you're using" : ''}">
        <span class="limg"><img src="looks/${l.k}-thumb.webp" alt="" loading="lazy" width="390" height="844">${l.live ? '<span class="lbadge">You\'re using it</span>' : ''}</span>
        <span class="lname">${esc(l.name)}</span><span class="ldesc">${esc(l.desc)}</span></button>`).join('');
    const feats = FEATURES.map(([k, label, desc]) => `<button type="button" class="frow" role="switch" aria-checked="${!!S.f[k]}" data-act="flag" data-v="${k}">
        <span class="ftxt"><b>${esc(label)}</b><span>${esc(desc)}</span></span><span class="sw${S.f[k] ? ' on' : ''}" aria-hidden="true"><span></span></span></button>`).join('');
    const allOn = FEATURES.every(([k]) => S.f[k]);
    return `<div class="lang-dim" data-act="demo-close"></div>
      <div class="lang-sheet demo-sheet" role="dialog" aria-label="Demo">
        <div class="lang-head"><h2>${I.s(P.sliders, 20)} Demo</h2><button type="button" class="pv-x" data-act="demo-close" aria-label="Close">${I.s(P.x, 20)}</button></div>
        <p class="small muted demo-intro">Flip through the other looks, or turn features on and off to see the page with and without them.</p>
        <div class="tabs dtabs" role="tablist" aria-label="Demo"><button type="button" class="tab" role="tab" aria-selected="${S.demoTab === 'looks'}" data-act="demo-tab" data-v="looks">Other looks</button><button type="button" class="tab" role="tab" aria-selected="${S.demoTab === 'features'}" data-act="demo-tab" data-v="features">Features on/off</button></div>
        ${S.demoTab === 'looks'
          ? `<div class="lgrid">${looks}</div><p class="small muted demo-intro">Tap a look to see it big; swipe or use the arrows to flip through.</p>`
          : `<div class="flist">${feats}</div>${allOn ? '' : '<button type="button" class="btn wide" data-act="flags-reset">Turn everything back on</button>'}<p class="small muted demo-intro">Your phone remembers these until you change them.</p>`}
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
      const list = placesShown();
      const items = list.map((p, i) => ({ p, i, on: S.sel === 'place:' + p.id }));
      items.sort((a, b) => (a.on ? 1 : 0) - (b.on ? 1 : 0));
      return items.map(({ p, i, on }) => {
        const size = on ? 36 : 30;
        const col = S.f.colors ? `;background:${CAT_COLOR[p.cat]}` : '';
        return `<button type="button" class="pin${S.f.colors ? ' cpin' : ''}${on ? ' on' : ''}" data-act="pin" data-k="place:${p.id}" aria-label="${i + 1}. ${esc(p.name)}" style="left:${p.x - size / 2}px;top:${p.y - size / 2}px;width:${size}px;height:${size}px${col}">${i + 1}</button>`;
      }).join('');
    }
    if (S.tab === 'events') {
      const t = T();
      const items = eventsShown().map((e) => ({ e, on: S.sel === 'event:' + e.id }));
      items.sort((a, b) => (a.on ? 1 : 0) - (b.on ? 1 : 0));
      return items.map(({ e, on }) => {
        const label = e.now ? t.now : (e.wd ? e.wd + ' ' : '') + e.time + ' ' + e.ap.toUpperCase();
        const bg = on ? PICK : NAVY;
        return `<button type="button" class="flagpin" data-act="pin" data-k="event:${e.id}" aria-label="${esc(e.name)}, ${e.now ? 'on now' : esc(label)}" style="left:${e.x}px;top:${e.y}px"><span class="fp" style="background:${bg}">${e.now ? '<span class="fpdot pdot"></span>' : ''}<span>${esc(label)}</span></span><span class="tail" style="border-top-color:${bg}"></span></button>`;
      }).join('');
    }
    const items = VENDORS.slice().sort((a, b) => a.dist - b.dist).map((v) => ({ v, on: S.sel === 'live:' + v.id }));
    items.sort((a, b) => (a.on ? 1 : 0) - (b.on ? 1 : 0));
    return items.map(({ v, on }) => {
      const size = on ? 30 : 22;
      return `<button type="button" class="livepin${on ? ' on' : ' pulse'}" data-act="pin" data-k="live:${v.id}" aria-label="${esc(v.name)}, live till ${v.till}" style="left:${v.x - size / 2}px;top:${v.y - size / 2}px;width:${size}px;height:${size}px"></button>`;
    }).join('');
  }

  /* ----- Nearby: the walk line ----- */
  function placesShown() {
    return PLACES.filter((p) => S.cat === 'all' || p.cat === S.cat).slice().sort((a, b) => a.dist - b.dist);
  }
  function nearHTML() {
    const t = T();
    const chips = ['all', 'eat', 'shop', 'see', 'services'].map((c) => {
      const col = S.f.colors && c !== 'all' ? CAT_COLOR[c] : null;
      const on = S.cat === c;
      const st = col && on ? ` style="background:${col};border-color:${col};color:#fff"` : '';
      return `<button type="button" class="chip" aria-pressed="${on}" data-act="cat" data-v="${c}"><span${st}>${col ? `<i class="cdot" style="background:${on ? '#fff' : col}"></i>` : ''}${esc(t[c])}</span></button>`;
    }).join('');
    let crossed = false;
    const rows = placesShown().map((p, i) => {
      const m = mins(p.dist);
      let out = '';
      if (!crossed && m > 5) {
        if (i > 0) out += `<div class="mark" style="--ml:84px"><span>${esc(t.walk5)}</span></div>`;
        crossed = true;
      }
      const spon = S.f.featured && p.sponsored ? `<span class="sp">${esc(t.sponsored)}</span>` : '';
      if (!S.f.walkline) {
        return `<button type="button" class="prow" data-act="sel" data-k="place:${p.id}"><span class="pnum"${S.f.colors ? ` style="background:${CAT_COLOR[p.cat]}"` : ''}>${i + 1}</span><span class="txt"><span class="nm"><b>${esc(p.name)}</b>${spon}</span><span class="sub">${esc(t[p.kind])}</span></span><span class="pmin">${esc(t.mins(m))}</span></button>`;
      }
      out += `<button type="button" class="row" data-act="sel" data-k="place:${p.id}">
        <span class="tcol">${esc(t.mins(m))}</span>
        <span class="lcol"><span class="stop"${S.f.colors ? ` style="background:${CAT_COLOR[p.cat]};border-color:${CAT_COLOR[p.cat]};color:#fff"` : ''}>${i + 1}</span></span>
        <span class="txt"><span class="nm"><b>${esc(p.name)}</b>${spon}</span><span class="sub">${esc(t[p.kind])}</span></span>
      </button>`;
      return out;
    }).join('');
    const tRows = STATIONS.map((st, i) => {
      const open = S.tOpen === st.id;
      return `<div class="st"${i ? '' : ' style="border-top:0"'}>
        <button type="button" class="st-row" data-act="station" data-v="${st.id}" aria-expanded="${open}">
          <span class="st-name">${esc(st.name)}</span>
          <span class="st-lines">${st.lines.map((l) => `<span class="lp" style="background:${LINE[l].c};color:${LINE[l].ink}">${l}</span>`).join('')}</span>
          <span class="st-walk">${esc(t.mins(st.walk))}</span>
          <span class="chev${open ? ' open' : ''}">${I.s(P.right, 16, 2.2)}</span>
        </button>
        ${open ? `<div class="trains">${st.trains.map(([line, to, t1, t2]) => `<div class="tr"><span class="tbar" style="background:${LINE[line].c}"></span><span class="tto"><span class="tl">${line} Line to</span><span class="td">${esc(to)}</span></span><span class="t1"${t1 === 'Now' ? ' style="color:#C41E35"' : ''}>${esc(t1)}</span><span class="t2">${esc(t2)}</span></div>`).join('')}</div>` : ''}
      </div>`;
    }).join('');
    return `
      <div class="chips">${chips}</div>
      ${S.f.walkline ? `<div class="line"><div class="rail" style="left:62.5px"></div>${rows}</div>` : `<div class="plist">${rows}</div>`}
      <p class="note">${esc(t.allWithin)}</p>
      ${S.f.transit ? `<section class="tsec">
        <div class="tsec-h">${I.s(P.train, 20)}<h3>${esc(t.tHead)}</h3></div>
        <div class="tlist">${tRows}</div>
        <p class="small muted">Sample times. On the real site they come live from the MBTA.</p>
      </section>` : ''}
      <a class="cta-row" href="#/business"><span>${esc(t.biz)}</span>${I.s(P.right)}</a>
      <p class="note small pb">${esc(t.sample)}. Tap one to see it on the map.</p>`;
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
        <span class="tcol">${e.wd ? `<span class="wd">${e.wd}</span>` : ''}<span class="tm"${e.now ? ' style="color:#C41E35"' : ''}>${esc(e.now ? t.now : e.time + ' ' + e.ap)}</span>${e.now ? `<span class="tilll">${esc(t.till(e.until))}</span>` : ''}</span>
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
        <span class="tile-media" style="background:${v.tint};color:${v.ink}">${I.s(P[v.icon], 48, 1.4)}<span class="livebadge">LIVE · ${esc(t.till(v.till))}</span>${v.video ? `<span class="playmini">${I.s(P.play, 12)}</span>` : ''}</span>
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
    let title = '', chip = '', line1 = '', line2 = '', thumb = '', primary = '', secondary = '', dot = '';
    if (type === 'place') {
      const p = PLACES.find((x) => x.id === id);
      title = p.name;
      chip = S.f.featured && p.sponsored ? `<span class="sp">${esc(t.sponsored)}</span>` : '';
      line1 = t[p.kind] + ' · ' + t.walk(mins(p.dist));
      dot = S.f.colors ? `<i class="cdot" style="background:${CAT_COLOR[p.cat]}"></i>` : '';
      thumb = S.f.featured && p.photo ? `<span class="thumb" style="background:${p.tint};color:${p.ink}">${I.s(P.photo, 30, 1.6)}</span>` : '';
      primary = `<a class="btn primary" href="${maps(p.q)}" target="_blank" rel="noopener">${I.s(P.pin)}<span>${esc(t.directions)}</span></a>`;
      secondary = `<a class="btn" href="#/${p.page}">${esc(t.seePage)}</a>`;
    } else if (type === 'event') {
      const e = EVENTS.find((x) => x.id === id);
      const dayWord = e.wd ? WEEKDAY[e.wd] : (e.day === 'tomorrow' ? t.tomorrow : t.today);
      title = e.name;
      chip = S.f.featured && e.sponsored ? `<span class="sp">${esc(t.sponsored)}</span>` : '';
      line1 = (e.now ? t.now + ', ' + t.till(e.until) : dayWord + ' · ' + e.time + ' ' + e.ap) + ' · ' + e.price;
      line2 = e.where + ' · ' + t.walk(mins(e.dist));
      thumb = e.photo && (S.f.featured || !e.sponsored) ? `<span class="thumb" style="background:${e.tint};color:${e.ink}">${I.s(P.photo, 30, 1.6)}</span>` : '';
      primary = `<button type="button" class="btn primary" data-act="demo" data-v="Added to your calendar (demo)">${I.s(P.cal)}<span>${esc(t.addCal)}</span></button>`;
      secondary = e.q ? `<a class="btn" href="${maps(e.q)}" target="_blank" rel="noopener">${esc(t.directions)}</a>` : `<button type="button" class="btn" data-act="demo">${esc(t.directions)}</button>`;
    } else {
      const v = VENDORS.find((x) => x.id === id);
      title = v.name;
      chip = `<span class="livebadge inline">LIVE · ${esc(t.till(v.till))}</span>`;
      line1 = v.what + ' · ' + t.walk(mins(v.dist));
      thumb = `<span class="thumb" style="background:${v.tint};color:${v.ink}">${I.s(P[v.icon], 34, 1.5)}</span>`;
      primary = `<a class="btn primary" href="${maps('Downtown Crossing Boston')}" target="_blank" rel="noopener">${I.s(P.pin)}<span>${esc(t.directions)}</span></a>`;
      secondary = `<a class="btn" href="#/live/${v.id}">${esc(t.photos)}</a>`;
    }
    return `<div class="pv">
      <span class="pv-handle"></span>
      <div class="pv-top">${thumb}<div class="pv-txt"><span class="pv-title">${esc(title)}</span>${chip}<span class="pv-l1">${dot}${esc(line1)}</span>${line2 ? `<span class="pv-l2">${esc(line2)}</span>` : ''}</div>
        <button type="button" class="pv-x" data-act="clear" aria-label="Back to the list">${I.s(P.x, 20)}</button></div>
      <div class="pv-btns">${primary}${secondary}</div>
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
    map.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      moved = false;
      md = { x: e.clientX, y: e.clientY, tx: cur.tx, ty: cur.ty, id: e.pointerId, on: false };
    });
    map.addEventListener('pointermove', (e) => {
      if (!md || e.pointerId !== md.id) return;
      const dx = e.clientX - md.x, dy = e.clientY - md.y;
      if (!md.on) {
        if (Math.abs(dx) + Math.abs(dy) < 7) return;
        md.on = true; moved = true;
        try { map.setPointerCapture(md.id); } catch (err) { /* ignore */ }
        map.classList.add('grabbing');
        world.classList.add('nodrag');
      }
      const b = bounds(sheetTop());
      cur.tx = clamp(md.tx + dx, b.txMin, b.txMax);
      cur.ty = clamp(md.ty + dy, b.tyMin, b.tyMax);
      if (!raf) raf = requestAnimationFrame(() => { raf = 0; world.style.transform = `translate(${cur.tx}px,${cur.ty}px)`; });
    });
    const endPan = (e) => {
      if (!md || (e && e.pointerId !== md.id)) return;
      const was = md.on;
      md = null;
      map.classList.remove('grabbing');
      if (was) {
        world.classList.remove('nodrag');
        S.tx = cur.tx; S.ty = cur.ty;
        updH();
      }
    };
    map.addEventListener('pointerup', endPan);
    map.addEventListener('pointercancel', endPan);

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
    $('#sheetPrev').innerHTML = previewHTML(); sig.prev = key + '|' + S.lang;
    $('#sheetPrev').hidden = false; $('#sheetList').hidden = true;
    const top = prevTop();
    const tr = curTrans(top);
    const sx = item.x + tr.tx, sy = item.y + tr.ty;
    if (sx < 30 || sx > G.W - 30 || sy < G.st + 80 || sy > top - 30) {
      const b = bounds(top);
      S.tx = clamp(Math.round(G.W / 2 - item.x), b.txMin, b.txMax);
      S.ty = clamp(Math.round(top * 0.55 - item.y), b.tyMin, b.tyMax);
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
  function placeScreen() {
    const f = S.f.featured ? FEATURED[S.arg] : null;
    if (f) return featuredHTML(f);
    const p = PLACES.find((x) => x.id === S.arg) || PLACES[1];
    return listingHTML(p);
  }
  function featuredHTML(f) {
    const t = T();
    const i = Math.min(S.slide, f.slides.length - 1);
    const [kind, tint] = f.slides[i];
    return `<div class="scr page"><div class="scroll">
      <div class="hero" style="background:${tint};color:${f.ink}" data-act="slide-next" aria-label="Next photo">
        ${kind === 'Video' ? `<span class="playbig">${I.s(P.play, 26)}</span>` : I.s(P[f.icon], 92, 1.2)}
        <div class="hero-bar">${back()}<button type="button" class="round" data-act="demo" data-v="Share (demo)" aria-label="Share">${I.s(P.share, 19)}</button></div>
        <span class="hero-label">${kind} · ${i + 1} of ${f.slides.length}</span>
        <div class="hero-dots">${f.slides.map((s, j) => `<button type="button" data-act="slide" data-v="${j}" aria-label="Show ${s[0].toLowerCase()} ${j + 1}" aria-pressed="${j === i}"><span style="width:${j === i ? 20 : 7}px;background:${j === i ? NAVY : 'rgba(19,37,74,.35)'}"></span></button>`).join('')}</div>
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
        <section><h2>Photos and videos</h2><div class="grid3">${f.tiles.map(([k, c]) => `<span class="gt" style="background:${c};color:${f.ink}">${k === 'Video' ? `<span class="playmini">${I.s(P.play, 14)}</span>` : I.s(P.photo, 30, 1.5)}</span>`).join('')}</div></section>
        <section><div class="rev-h"><h2>Reviews</h2><span class="small muted">From people who scanned a sign nearby</span></div>
          <article class="rev"><span class="stars" aria-label="Star rating">★★★★★</span><span class="small muted">Sample</span><p>[A visitor's review shows here, in your language]</p></article>
          <article class="rev"><span class="stars" aria-label="Star rating">★★★★★</span><span class="small muted">Translated from Español</span><p>[Reviews in other languages are translated, with the original a tap away]</p></article>
          <button type="button" class="btn wide" data-act="demo">Write a review</button></section>
        <footer class="foot"><a href="#/business">Is this your business? Manage this page</a></footer>
      </div>
    </div></div>`;
  }
  function listingHTML(p) {
    const t = T();
    return `<div class="scr page"><div class="scroll">
      <div class="hero small" style="background:#E6EDFA;color:#2A4E9B">${I.s(p.id === 'brattle' ? P.book : P.photo, 64, 1.4)}
        <div class="hero-bar">${back()}</div><span class="hero-label">No photos yet</span></div>
      <div class="pad">
        <span class="freechip">Free listing</span>
        <h1>${esc(p.name)}</h1>
        <span class="meta">${esc(t[p.kind])}${p.id === 'brattle' ? ' · 9 West St' : ''} · ${esc(t.walk(mins(p.dist)))}</span>
        <div class="two">
          <a class="btn primary" href="${maps(p.q)}" target="_blank" rel="noopener">${I.s(P.pin)}<span>${esc(t.directions)}</span></a>
          <button type="button" class="btn" data-act="demo">${I.s(P.call)}<span>Call</span></button>
        </div>
        <section class="box"><h2>Hours</h2><p>[Hours]</p></section>
        <section class="pitch"><b>Own ${esc(p.name)}?</b><span>Add photos, videos, your story, a deal and badges, and show up above the free listings on every sign nearby.</span><a class="btn red" href="#/business">See Featured</a></section>
        <footer class="foot"><a href="#/place/florabella">See what a Featured page looks like</a></footer>
      </div>
    </div></div>`;
  }

  // --- Live now vendor screen
  function liveScreen() {
    const t = T();
    const cards = VENDORS.map((v, i) => `<button type="button" class="vcard" data-act="vopen" data-v="${i}" aria-label="${esc(v.name)}">
        <span class="vmedia" style="background:${v.tint};color:${v.ink}">${I.s(P[v.icon], 64, 1.4)}<span class="livebadge">LIVE · ${esc(t.till(v.till))}</span><span class="vlabel">${v.slides[0] === 'Video' ? 'Video preview' : 'Photo'}</span>${v.slides[0] === 'Video' ? `<span class="playmini big">${I.s(P.play, 14)}</span>` : ''}</span>
        <span class="tile-name">${esc(v.name)}</span><span class="tile-sub">${esc(v.what)} · ${esc(t.mins(mins(v.dist)))}</span>
      </button>`).join('');
    let sheet = '';
    if (S.liveOpen >= 0) {
      const v = VENDORS[S.liveOpen];
      const k = v.slides[S.liveSlide] || 'Photo';
      sheet = `<div class="vsheet-dim" data-act="vclose"></div><div class="vsheet" role="dialog" aria-label="${esc(v.name)}">
        <div class="vbig" style="background:${v.tint};color:${v.ink}">${I.s(P[v.icon], 96, 1.2)}
          <span class="livebadge big">LIVE · here ${esc(t.till(v.till))}</span>
          <button type="button" class="round pos-tr" data-act="vclose" aria-label="Close">${I.s(P.x, 20)}</button>
          <span class="vlabel big">${k} · ${S.liveSlide + 1} of ${v.slides.length}</span>
          ${k === 'Video' ? `<span class="playbig">${I.s(P.play, 24)}</span>` : ''}
          <div class="vdots">${v.slides.map((s, j) => `<button type="button" data-act="vslide" data-v="${j}" aria-label="Show ${s.toLowerCase()} ${j + 1}"><span style="width:${j === S.liveSlide ? 22 : 8}px;background:${j === S.liveSlide ? NAVY : 'rgba(19,37,74,.35)'}"></span></button>`).join('')}</div>
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
      { name: 'Basic', price: 'Free', period: '', cta: 'Start free', strong: false, features: ['A listing on nearby signs', 'Address, hours and directions', 'In 10 languages'] },
      { name: 'Featured', price: '$50', period: ' / month', cta: 'Get Featured', strong: true, features: ['Everything in Basic', 'A Sponsored badge, shown above free listings', 'Photos, your menu and a deal of the month', 'A monthly report: how many people saw and tapped you'] },
      { name: 'Spotlight', price: '[YOUR PRICE]', period: '', cta: 'Ask about Spotlight', strong: false, features: ['Everything in Featured', 'The top card on every sign within ½ mile', 'Your own I Love Boston sign at your door'] },
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
          <button type="button" class="btn${p.strong ? ' primary' : ''} wide" data-act="demo">${esc(p.cta)}</button></article>`).join('')}</section>
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
    { id: 'downtown', name: 'Downtown local', how: 'Collect all 3 Downtown spots.', have: 2, need: 3, color: NAVY, d: '<path d="M4 21V6l8-3.5L20 6v15M9.5 21v-4.5h5V21M8 9.5h2M14 9.5h2M8 13h2M14 13h2"/>' },
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
  function passportScreen() {
    const tabs = [['spots', 'Spots'], ['badges', 'Badges'], ['trail', 'Freedom Trail']].map(([id, l]) => `<button type="button" class="tab" role="tab" aria-selected="${S.pTab === id}" data-act="ptab" data-v="${id}">${l}</button>`).join('');
    let body = '';
    if (S.pTab === 'spots') {
      const all = []; AREAS.forEach((a) => a.spots.forEach((s) => all.push(s)));
      const got = all.filter((s) => s[3]).length;
      const stamps = all.slice().sort((a, b) => (b[3] ? 1 : 0) - (a[3] ? 1 : 0)).map((s) => I.heart(22, 20, s[3] ? '#FF5A6E' : 'none', s[3] ? '#FF5A6E' : 'rgba(255,255,255,.4)', 2)).join('');
      body = `<div class="pcard"><div class="pc-top"><b>${got}</b><span>of ${all.length} spots collected</span></div><div class="stamps">${stamps}</div>
          <p>Closest one you haven't collected: <b>DTC-002 · Post Office Square</b>, a 6 min walk.</p></div>
        ${AREAS.map((a) => {
          const n = a.spots.filter((s) => s[3]).length;
          return `<section class="area"><div class="area-h"><h2>${esc(a.name)}</h2><span${n === a.spots.length ? ' class="ok"' : ''}>${n} of ${a.spots.length}</span></div>
            ${a.spots.map((s, i) => {
              const has = !!s[3];
              return `<div class="spotrow"${i ? '' : ' style="border-top:0"'}><span class="stamp${has ? ' got' : ''}">${I.heart(20, 18, has ? '#FF5A6E' : 'none', has ? '#FF5A6E' : '#AEB6C4', 2.2)}</span>
                <span class="sr-txt"><span class="code">${s[0]}</span><b>${esc(s[1])}</b><span class="${s[4] ? 'here' : 'muted'}">${esc(s[2])}</span></span>
                ${has ? `<span class="okc">${I.s(P.check, 15, 2.6)}${esc(s[3])}</span>` : '<span class="notyet">Not yet</span>'}</div>`;
            }).join('')}</section>`;
        }).join('')}
        <p class="small muted pad pb">Sample spots. DTC-001 is the real sign today; the others show how more signs would look.</p>`;
    } else if (S.pTab === 'badges') {
      const sb = BADGES.find((b) => b.id === S.badge) || BADGES[0];
      const earnedSel = sb.have >= sb.need;
      body = `<div class="bgrid">${BADGES.map((b) => {
          const earned = b.have >= b.need, on = b.id === S.badge;
          return `<button type="button" class="badge${on ? ' on' : ''}" data-act="badge" data-v="${b.id}" aria-pressed="${on}" aria-label="${esc(b.name)}${earned ? ', earned' : ', ' + b.have + ' of ' + b.need}">
            <span class="medal" style="background:${earned ? b.color : '#EEF0F3'};color:${earned ? '#fff' : '#8A93A3'};${earned ? `box-shadow:0 0 0 3px #fff,0 0 0 5px ${b.color}` : ''}">${I.s(b.d, 28, 1.8)}${earned ? '' : `<span class="lockmini">${I.s(P.lock, 12, 2.6)}</span>`}</span>
            <span class="bname">${esc(b.name)}</span><span class="bprog${earned ? ' ok' : ''}">${earned ? 'Earned ' + b.when : b.have + ' of ' + b.need}</span></button>`;
        }).join('')}</div>
        <div class="bdetail"><div class="bd-h"><b>${esc(sb.name)}</b><span${earnedSel ? ' class="ok"' : ''}>${earnedSel ? 'Earned ' + sb.when : sb.have + ' of ' + sb.need + ' · ' + (sb.need - sb.have) + ' to go'}</span></div><p>${esc(sb.how)}</p>
          <div class="bar8"><div style="width:${Math.round(Math.min(sb.have, sb.need) / sb.need * 100)}%;background:${sb.color}"></div></div></div>
        <p class="small muted pad pb">Your location is only checked when you scan a sign, to make sure you're really there. It isn't kept.</p>`;
    } else {
      const dots = STOP_XY.map((xy, i) => {
        const done = i < DONE, next = i === DONE, size = done ? 12 : next ? 14 : 10;
        return `<span class="tdot" style="left:${xy[0] - size / 2}px;top:${xy[1] - size / 2}px;width:${size}px;height:${size}px;border:${next ? 3 : 2}px solid ${done ? '#fff' : next ? '#C8102E' : '#9AA3B2'};background:${done ? '#C8102E' : '#fff'}"></span>`;
      }).join('');
      body = `<div class="trailmap">
          <svg width="358" height="270" viewBox="0 0 358 270" role="img" aria-label="Sketch map of the Freedom Trail, from Boston Common through downtown and the North End to Bunker Hill. You've walked the first 5 stops.">
            <path d="M0 70 C 100 58, 220 88, 358 64 L358 90 C 220 114, 100 84, 0 96 Z" fill="#CFE1F2"/><path d="M332 120 C 318 170, 342 220, 300 270 L358 270 L358 96 Z" fill="#CFE1F2"/>
            <polygon points="20,218 96,206 92,262 24,266" fill="#CFE5D2"/>
            <g fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M142 196 L154 208 L166 220 L176 234 L196 190 L206 178 L222 160 L258 138 L272 116 L254 104 L310 50 L246 38" stroke="#C8102E" stroke-opacity="0.7" stroke-width="3" stroke-dasharray="5 6"/><path d="M70 242 L80 212 L104 224 L118 210 L142 196" stroke="#C8102E" stroke-width="4.5"/></g>
            <g font-family="Inter, sans-serif" font-size="9.5" font-weight="700" fill="#13254A" stroke="#E9EDF2" stroke-width="3" stroke-linejoin="round" paint-order="stroke"><text x="28" y="262">Boston Common</text><text x="230" y="168">Faneuil Hall</text><text x="262" y="121" text-anchor="end">Old North Church</text><text x="352" y="70" text-anchor="end">USS Constitution</text><text x="236" y="42" text-anchor="end">Bunker Hill</text></g>
            <text x="16" y="88" font-family="Inter, sans-serif" font-size="9" font-style="italic" font-weight="600" fill="#3E6A93">Charles River</text>
          </svg>${dots}<span class="you-halo"></span><span class="you"></span></div>
        <div class="tprog"><span><b>5 of 16</b> stops</span><span class="muted">0.5 of 2.5 mi</span></div>
        <div class="bar8 pad0"><div style="width:31%;background:#C8102E"></div></div>
        <button type="button" class="track${S.tracking ? ' on' : ''}" data-act="track" aria-pressed="${S.tracking}">${S.tracking ? '<span class="wdot pdot"></span>' : I.s(P.nav, 18)}<span>${S.tracking ? 'Tracking your walk · Stop' : 'Track my walk'}</span></button>
        <p class="small muted center pad">${S.tracking ? 'Location is on while you walk. Next stop: Boston Latin School site, 2 min away.' : 'Your location stays on only while you track, and you can stop any time.'}</p>
        <h3 class="eyebrow pad">The 16 stops</h3>
        <div class="stops">${STOPS.map((n, i) => {
          const done = i < DONE, next = i === DONE;
          return `<div class="stoprow"${i ? '' : ' style="border-top:0"'}><span class="sn${done ? ' done' : next ? ' next' : ''}">${done ? I.s(P.check, 14, 3) : i + 1}</span><span class="sname${done ? ' muted' : ''}${next ? ' strong' : ''}">${esc(n)}</span><span class="stag${done ? ' ok' : ''}">${done ? 'Done' : next ? 'Next · 2 min' : ''}</span></div>`;
        }).join('')}</div>
        <div class="finisher"><span class="fmedal">${I.s(P.steps, 26, 1.8)}<span class="lockmini">${I.s(P.lock, 12, 2.6)}</span></span><span><b>Freedom Trail finisher</b><span class="muted">Walk all 16 stops to earn it. 11 to go.</span></span></div>
        <p class="small muted pad pb">The stops are the trail's 16 official sites. Your progress here is a sample.</p>`;
    }
    return `<div class="scr page white"><div class="scroll">
      <header class="bar">${back('Back to the map')}<div class="logo-s">I ${I.heart(16, 15, '#B8232F')} BOSTON</div><span style="width:44px"></span></header>
      <div class="pad tight"><h1 class="h1">Spots &amp; badges</h1><p class="muted">Every I Love Boston sign is a spot. Scan one with your location on to collect it.</p></div>
      <div class="tabs ptabs" role="tablist" aria-label="Show">${tabs}</div>
      ${body}
    </div></div>`;
  }

  const SCREENS = { spots: passportScreen, place: placeScreen, live: liveScreen, business: businessScreen };

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
      case 'cat': S.cat = v; updH(); break;
      case 'day': S.day = v; S.sel = null; updH(); break;
      case 'station': S.tOpen = S.tOpen === v ? '' : v; updH(); break;
      case 'sel': selectFromList(el.dataset.k); break;
      case 'pin': if (moved) return; if (S.sheet === 'full') S.sheet = 'half'; S.sel = el.dataset.k; updH(); break;
      case 'clear': S.sel = null; updH(); break;
      case 'toggle': S.sheet = S.sheet === 'half' ? 'full' : 'half'; updH(); break;
      case 'half': S.sheet = 'half'; updH(); break;
      case 'recenter': S.tx = null; S.ty = null; updH(); break;
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
  document.addEventListener('keydown', (e) => {
    if (S.view >= 0 && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
      S.view = (S.view + (e.key === 'ArrowRight' ? 1 : LOOKS.length - 1)) % LOOKS.length; updH(); return;
    }
    if (e.key === 'Escape') {
      if (S.view >= 0) { S.view = -1; updH(); }
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

  route();
})();
