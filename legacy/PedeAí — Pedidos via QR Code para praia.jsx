import { useState } from "react";
import { QrCode, ShoppingCart, Plus, Minus, X, ArrowLeft, CreditCard, Smartphone, Coins, Banknote, Check, Printer, LayoutDashboard, UtensilsCrossed, TrendingUp, Trash2, Edit3, Clock, MapPin, LogOut, Sun, Users, User, Percent, Flame, Store, Camera, ChevronDown, MessageSquare, Settings, MessageCircle, Lock, Wifi, Upload, Download, FileSpreadsheet, Shield, Phone, Mail, Globe, Instagram } from "lucide-react";

const SUPPORT_WA = "5547999999999"; // TODO: número comercial oficial do suporte (a definir)
const LEADS_EMAIL = "comercial@pedeai.com.br"; // TODO: e-mail comercial oficial para receber leads (a definir)

// ---------- Dados ----------
const CATS = {
  "Combos & Combinações": ["Combos", "Combinações"],
  Bebidas: ["Drinks", "Cervejas", "Refrigerantes", "Naturais", "Águas"],
  Alimentos: ["Porções", "Pratos", "Saudáveis"],
  Snacks: ["Salgados", "Petiscos"],
  Sobremesas: ["Sorvetes", "Doces"],
};

const U = "https://images.unsplash.com/";
const ph = (id, w = 600) => `${U}${id}?auto=format&fit=crop&w=${w}&q=70`;

const INITIAL_MENU = [
  { id: 27, name: "Combo Casal", desc: "2 caipirinhas + porção de camarão", price: 99, oldPrice: 112, emoji: "🥂", photo: ph("photo-1414235077428-338989a2e8c0"), cat: "Combos & Combinações", sub: "Combos" },
  { id: 28, name: "Combo Praia", desc: "Moqueca de peixe + 2 águas de coco", price: 99, oldPrice: 109, emoji: "🍲", photo: ph("photo-1559847844-5315695dadae"), cat: "Combos & Combinações", sub: "Combos" },
  { id: 29, name: "Combinação Cervejeira", desc: "6 Heinekens long neck + batata frita", price: 95, emoji: "🍺", photo: ph("photo-1535958636474-b021ee887b13"), cat: "Combos & Combinações", sub: "Combinações" },
  { id: 30, name: "Combo Sunset", desc: "Aperol Spritz + Petit Gâteau", price: 52, oldPrice: 62, emoji: "🍹", photo: ph("photo-1560512823-829485b8bf24"), cat: "Combos & Combinações", sub: "Combinações" },
  { id: 1, name: "Caipirinha de Limão", desc: "Cachaça artesanal, limão tahiti, açúcar e gelo", price: 22, oldPrice: 28, emoji: "🍹", photo: ph("photo-1551538827-9c037cb4f32a"), photo2: ph("photo-1514362545857-3bc16c4c7d1b"), measure: 300, unit: "ml", cat: "Bebidas", sub: "Drinks" },
  { id: 2, name: "Aperol Spritz", desc: "Aperol, prosecco, água com gás e laranja", price: 28, oldPrice: 34, emoji: "🥂", photo: ph("photo-1560512823-829485b8bf24"), measure: 300, unit: "ml", cat: "Bebidas", sub: "Drinks" },
  { id: 3, name: "Heineken Long Neck", desc: "Cerveja pilsen bem gelada", price: 12, emoji: "🍺", photo: ph("photo-1608270586620-248524c67de9"), measure: 330, unit: "ml", cat: "Bebidas", sub: "Cervejas" },
  { id: 4, name: "Stella Artois", desc: "Garrafa compartilhável bem gelada", price: 18, emoji: "🍺", photo: ph("photo-1535958636474-b021ee887b13"), measure: 600, unit: "ml", cat: "Bebidas", sub: "Cervejas" },
  { id: 5, name: "Água de Coco", desc: "Coco verde natural, servido na hora", price: 10, emoji: "🥥", photo: ph("photo-1520950237264-3e10a6d27dd5"), measure: 500, unit: "ml", cat: "Bebidas", sub: "Naturais" },
  { id: 6, name: "Suco de Laranja", desc: "Laranja espremida na hora", price: 14, emoji: "🍊", photo: ph("photo-1600271886742-f049cd451bba"), measure: 400, unit: "ml", cat: "Bebidas", sub: "Naturais" },
  { id: 22, name: "Coca-Cola Lata", desc: "Refrigerante gelado em lata", price: 8, emoji: "🥤", photo: ph("photo-1554866585-cd94860890b7"), measure: 350, unit: "ml", cat: "Bebidas", sub: "Refrigerantes" },
  { id: 23, name: "Guaraná Antarctica", desc: "Refrigerante de guaraná em lata", price: 7, emoji: "🥤", photo: ph("photo-1625772299848-391b6a87d7b3"), measure: 350, unit: "ml", cat: "Bebidas", sub: "Refrigerantes" },
  { id: 24, name: "Coca-Cola Zero", desc: "Sem açúcar, bem gelada", price: 8, emoji: "🥤", photo: ph("photo-1629203851122-3726ecdf080e"), measure: 350, unit: "ml", cat: "Bebidas", sub: "Refrigerantes" },
  { id: 25, name: "Água Mineral sem Gás", desc: "Garrafa gelada 500ml", price: 5, emoji: "💧", photo: ph("photo-1559839734-2b71ea197ec2"), measure: 500, unit: "ml", cat: "Bebidas", sub: "Águas" },
  { id: 26, name: "Água Mineral com Gás", desc: "Garrafa gelada com gás 500ml", price: 6, emoji: "💧", photo: ph("photo-1603394630850-69b3ca8121ca"), measure: 500, unit: "ml", cat: "Bebidas", sub: "Águas" },
  { id: 7, name: "Porção de Camarão", desc: "Camarão empanado com molho tártaro", price: 68, oldPrice: 89, emoji: "🍤", photo: ph("photo-1625938145312-c971e35e51f3"), photo2: ph("photo-1565680018434-b513d5e5fd47"), measure: 300, unit: "g", cat: "Alimentos", sub: "Porções" },
  { id: 8, name: "Batata Frita", desc: "Batata rústica crocante com cheddar e bacon", price: 38, emoji: "🍟", photo: ph("photo-1573080496219-bb080dd4f877"), measure: 400, unit: "g", cat: "Alimentos", sub: "Porções" },
  { id: 9, name: "Moqueca de Peixe", desc: "Peixe fresco, leite de coco, arroz e pirão", price: 89, emoji: "🍲", photo: ph("photo-1559847844-5315695dadae"), measure: 700, unit: "g", cat: "Alimentos", sub: "Pratos" },
  { id: 10, name: "Filé com Fritas", desc: "Filé mignon grelhado, fritas e salada", price: 72, emoji: "🥩", photo: ph("photo-1546964124-0cce460f38ef"), measure: 350, unit: "g", cat: "Alimentos", sub: "Pratos" },
  { id: 11, name: "Salada Tropical", desc: "Folhas, manga, castanhas e molho cítrico", price: 34, emoji: "🥗", photo: ph("photo-1512621776951-a57141f2eefd"), measure: 350, unit: "g", cat: "Alimentos", sub: "Saudáveis" },
  { id: 12, name: "Bowl de Açaí", desc: "Açaí, granola, banana e mel", price: 28, oldPrice: 36, emoji: "🍇", photo: ph("photo-1590301157890-4810ed352733"), measure: 500, unit: "ml", cat: "Alimentos", sub: "Saudáveis" },
  { id: 13, name: "Mix de Castanhas", desc: "Castanha de caju, amêndoas e nozes torradas", price: 24, emoji: "🥜", photo: ph("photo-1599629954294-14df9ec8bc05"), measure: 100, unit: "g", cat: "Snacks", sub: "Petiscos" },
  { id: 14, name: "Pipoca Gourmet", desc: "Pipoca amanteigada com toque de parmesão", price: 18, emoji: "🍿", photo: ph("photo-1578849278619-e73505e9610f"), measure: 80, unit: "g", cat: "Snacks", sub: "Petiscos" },
  { id: 15, name: "Batata Chips Trufada", desc: "Chips artesanais com sal trufado", price: 28, emoji: "🥔", photo: ph("photo-1566478989037-eec170784d0b"), measure: 120, unit: "g", cat: "Snacks", sub: "Salgados" },
  { id: 16, name: "Casquinha Dupla", desc: "Dois sabores na casquinha crocante", price: 16, emoji: "🍦", photo: ph("photo-1576506295286-5cda18df43e7"), measure: 120, unit: "g", cat: "Sobremesas", sub: "Sorvetes" },
  { id: 17, name: "Picolé de Frutas", desc: "Picolé natural de frutas da estação", price: 14, emoji: "🍧", photo: ph("photo-1488900128323-21503983a07e"), measure: 90, unit: "g", cat: "Sobremesas", sub: "Sorvetes" },
  { id: 18, name: "Sundae de Chocolate", desc: "Sorvete de creme, calda quente e amendoim", price: 22, emoji: "🍨", photo: ph("photo-1563805042-7684c019e1cb"), measure: 200, unit: "g", cat: "Sobremesas", sub: "Sorvetes" },
  { id: 19, name: "Petit Gâteau", desc: "Bolo de chocolate com recheio cremoso e sorvete", price: 32, oldPrice: 38, emoji: "🍫", photo: ph("photo-1606313564200-e75d5e30476c"), measure: 150, unit: "g", cat: "Sobremesas", sub: "Doces" },
  { id: 20, name: "Churros com Doce de Leite", desc: "Churros fresquinhos com doce de leite", price: 24, emoji: "🍩", photo: ph("photo-1612203985729-70726954388c"), measure: 150, unit: "g", cat: "Sobremesas", sub: "Doces" },
  { id: 21, name: "Brownie com Sorvete", desc: "Brownie quente com bola de sorvete de creme", price: 26, emoji: "🍰", photo: ph("photo-1606312619070-d48b4c652a52"), measure: 180, unit: "g", cat: "Sobremesas", sub: "Doces" },
];

const INITIAL_RESTAURANT = {
  name: "Quiosque do Mar",
  tagline: "Drinks autorais, frutos do mar e pé na areia 🌊",
  desc: "O melhor da Praia Brava: caipirinhas premiadas, porções generosas e aquele açaí gelado pra fechar o dia. Atendimento direto no seu guarda-sol.",
  address: "Av. Beira-Mar, 1200 — Praia Brava, Itajaí/SC",
  hours: "Todos os dias · 09h às 20h",
  cover: ph("photo-1559827260-dc66d52bef19", 900),
  logo: "",
  platformFee: 8,
  phone: "(47) 3344-5566",
  email: "contato@quiosquedomar.com.br",
  website: "www.quiosquedomar.com.br",
  whatsapp: "5547999990000",
  instagram: "@quiosquedomar",
  emoji: "🏖️",
};

const PAYMENTS = [
  { id: "credito", label: "Crédito", icon: CreditCard, color: "bg-blue-500" },
  { id: "debito", label: "Débito", icon: Banknote, color: "bg-emerald-500" },
  { id: "pix", label: "Pix", icon: Smartphone, color: "bg-teal-500" },
  { id: "usdc", label: "Stablecoin (USDC)", icon: Coins, color: "bg-violet-500" },
];

const money = (v) => "R$ " + v.toFixed(2).replace(".", ",");
const pay = (id) => PAYMENTS.find((p) => p.id === id);
const isPromo = (i) => i.oldPrice && i.oldPrice > i.price;
const pct = (i) => Math.round((1 - i.price / i.oldPrice) * 100);
const CAT_GRAD = { "Combos & Combinações": "bg-gradient-to-br from-indigo-400 to-purple-500", Bebidas: "bg-gradient-to-br from-cyan-400 to-blue-500", Alimentos: "bg-gradient-to-br from-amber-400 to-orange-500", Snacks: "bg-gradient-to-br from-yellow-400 to-amber-500", Sobremesas: "bg-gradient-to-br from-pink-400 to-rose-500" };
const catGrad = (cat) => CAT_GRAD[cat] || "bg-gradient-to-br from-slate-300 to-slate-400";
const CAT_EMOJI = { "Combos & Combinações": "🍱", Bebidas: "🥤", Alimentos: "🍽️", Snacks: "🍿", Sobremesas: "🍦" };
const CAT_COLORS = { "Combos & Combinações": "#8b5cf6", Bebidas: "#06b6d4", Alimentos: "#f59e0b", Snacks: "#eab308", Sobremesas: "#ec4899", Outros: "#94a3b8" };
const MEDAL = ["🥇", "🥈", "🥉"];
const waHref = (name) => `https://wa.me/${SUPPORT_WA}?text=${encodeURIComponent(`Olá! Sou do ${name} e preciso de suporte no PedeAí.`)}`;
const splitInfo = (o) => {
  const paidShares = (o.splits || []).filter((s) => s.method);
  return { paidAmt: paidShares.reduce((s, x) => s + x.amount, 0), paidCount: paidShares.length, total: (o.splits || []).length };
};

function seedOrders() {
  const ago = (min) => new Date(Date.now() - min * 60000);
  const agoD = (d) => new Date(Date.now() - d * 86400000);
  const split3 = { id: "split", label: "Dividido · 3 pessoas", icon: Users, color: "bg-pink-500" };
  return [
    { id: 11, location: "Guarda-sol nº 08", customerName: "Lucas", status: "aguardando", ts: ago(2),
      payment: { id: "split", label: "Dividido · 2/3 pagos", icon: Users, color: "bg-pink-500" },
      splits: [{ method: pay("pix"), amount: 32 }, { method: pay("debito"), amount: 32 }, { method: null, amount: 32 }],
      items: [{ name: "Filé com Fritas", qty: 1, price: 72 }, { name: "Heineken Long Neck", qty: 2, price: 12 }], total: 96 },
    { id: 10, location: "Guarda-sol nº 22", customerName: "Mariana", status: "producao", payment: pay("pix"), ts: ago(3), note: "1 caipirinha sem açúcar, por favor 🙏",
      items: [{ name: "Combo Casal", qty: 1, price: 99 }, { name: "Água de Coco", qty: 1, price: 10 }], total: 109 },
    { id: 9, location: "Guarda-sol nº 05", customerName: "Turma da Júlia", status: "producao", payment: split3,
      splits: [{ method: pay("pix"), amount: 30 }, { method: pay("usdc"), amount: 30 }, { method: pay("credito"), amount: 30 }], ts: ago(11),
      items: [{ name: "Aperol Spritz", qty: 1, price: 28 }, { name: "Batata Frita", qty: 1, price: 38 }, { name: "Heineken Long Neck", qty: 2, price: 12 }], total: 90 },
    { id: 8, location: "Mesa 07", customerName: "Carlos", status: "producao", payment: pay("credito"), ts: ago(20), note: "Moqueca bem quente e sem pimenta",
      items: [{ name: "Moqueca de Peixe", qty: 1, price: 89 }, { name: "Água de Coco", qty: 2, price: 10 }], total: 109 },
    { id: 7, location: "Guarda-sol nº 14", status: "entregue", payment: pay("debito"), ts: ago(45),
      items: [{ name: "Combinação Cervejeira", qty: 1, price: 95 }], total: 95 },
    { id: 6, location: "Mesa 03", customerName: "Beatriz", status: "entregue", payment: pay("pix"), ts: ago(80),
      items: [{ name: "Bowl de Açaí", qty: 2, price: 28 }, { name: "Suco de Laranja", qty: 1, price: 14 }], total: 70 },
    { id: 5, location: "Guarda-sol nº 18", customerName: "Roberto", status: "entregue", payment: { ...pay("credito"), label: "Crédito 3x de R$ 54,00" }, ts: agoD(1),
      items: [{ name: "Filé com Fritas", qty: 1, price: 72 }, { name: "Porção de Camarão", qty: 1, price: 68 }, { name: "Caipirinha de Limão", qty: 1, price: 22 }], total: 162 },
    { id: 4, location: "Guarda-sol nº 02", status: "entregue", payment: pay("pix"), ts: agoD(3),
      items: [{ name: "Caipirinha de Limão", qty: 3, price: 22 }, { name: "Batata Frita", qty: 1, price: 38 }], total: 104 },
    { id: 3, location: "Mesa 11", customerName: "Ana", status: "entregue", payment: pay("usdc"), ts: agoD(5),
      items: [{ name: "Combo Sunset", qty: 2, price: 52 }], total: 104 },
    { id: 2, location: "Guarda-sol nº 30", status: "entregue", payment: pay("debito"), ts: agoD(12),
      items: [{ name: "Salada Tropical", qty: 1, price: 34 }, { name: "Suco de Laranja", qty: 1, price: 14 }, { name: "Água de Coco", qty: 1, price: 10 }], total: 58 },
    { id: 1, location: "Mesa 06", customerName: "Pedro", status: "entregue", payment: pay("pix"), ts: agoD(22),
      items: [{ name: "Caipirinha de Limão", qty: 2, price: 22 }, { name: "Heineken Long Neck", qty: 2, price: 12 }, { name: "Moqueca de Peixe", qty: 1, price: 89 }], total: 157 },
  ];
}

// ---------- Plataforma (Admin) ----------
function computeLive(orders, since = 0, until = Infinity) {
  const valid = orders.filter((o) => o.status !== "aguardando" && o.ts.getTime() >= since && o.ts.getTime() < until);
  const revenue = valid.reduce((s, o) => s + o.total, 0);
  const byPay = { credito: 0, debito: 0, pix: 0, usdc: 0 };
  valid.forEach((o) => {
    if (o.splits) o.splits.forEach((s) => { if (s.method && byPay[s.method.id] != null) byPay[s.method.id] += s.amount; });
    else if (byPay[o.payment.id] != null) byPay[o.payment.id] += o.total;
  });
  return { orders: valid.length, revenue, byPay };
}

function seedEstablishments(orders, feePct) {
  const live = computeLive(orders);
  return [
    { id: "live", name: "Quiosque do Mar", owner: "Mneto", city: "Itajaí/SC", neighborhood: "Praia Brava", plan: "Pro", status: "ativo", since: "2025-11-02", feePct, user: "contato@quiosquedomar.com.br", password: "demo1234", ...live },
    { id: "e2", name: "Bar do Zé", owner: "José Almeida", city: "Florianópolis/SC", neighborhood: "Jurerê", plan: "Pro", status: "ativo", since: "2025-09-15", feePct: 7, orders: 412, revenue: 38400, byPay: { credito: 15200, debito: 5800, pix: 14000, usdc: 3400 }, phone: "(48) 3222-1010", email: "contato@bardoze.com.br", website: "www.bardoze.com.br", whatsapp: "5548999991111", instagram: "@bardoze", user: "bardoze", password: "barze2025" },
    { id: "e3", name: "Sunset Beach Club", owner: "Marina Rocha", city: "Balneário Camboriú/SC", neighborhood: "Centro", plan: "Pro", status: "ativo", since: "2025-10-01", feePct: 9, orders: 689, revenue: 71200, byPay: { credito: 24000, debito: 8200, pix: 25000, usdc: 14000 }, phone: "(47) 3360-2020", email: "reservas@sunsetbeach.com.br", website: "www.sunsetbeachclub.com.br", whatsapp: "5547999992222", instagram: "@sunsetbeachclub", user: "sunsetbeach", password: "sunset2025" },
    { id: "e4", name: "Cabana da Lia", owner: "Lia Fernandes", city: "Bombinhas/SC", neighborhood: "Bombas", plan: "Básico", status: "ativo", since: "2026-01-20", feePct: 6, orders: 158, revenue: 12600, byPay: { credito: 5200, debito: 2400, pix: 4600, usdc: 400 }, phone: "(47) 3369-3030", email: "lia@cabanadalia.com.br", website: "", whatsapp: "5547999993333", instagram: "@cabanadalia", user: "cabanalia", password: "lia2026" },
    { id: "e5", name: "Tropicana Drinks", owner: "Rafael Souza", city: "Itapema/SC", neighborhood: "Meia Praia", plan: "Básico", status: "ativo", since: "2026-02-11", feePct: 8, orders: 91, revenue: 7300, byPay: { credito: 3100, debito: 1500, pix: 2500, usdc: 200 }, phone: "(47) 3368-4040", email: "contato@tropicanadrinks.com.br", website: "", whatsapp: "5547999994444", instagram: "@tropicanadrinks", user: "tropicana", password: "tropi2026" },
    { id: "e6", name: "Recanto do Mar", owner: "Paula Lima", city: "Garopaba/SC", neighborhood: "Praia do Silveira", plan: "Básico", status: "pendente", since: "2026-06-15", feePct: 8, orders: 0, revenue: 0, byPay: { credito: 0, debito: 0, pix: 0, usdc: 0 }, phone: "(48) 3354-5050", email: "paula@recantodomar.com.br", website: "", whatsapp: "5548999995555", instagram: "@recantodomar", user: "recantomar", password: "recanto2026" },
    { id: "e7", name: "Cantinho de Cabeçudas", owner: "Sandra Reis", city: "Itajaí/SC", neighborhood: "Cabeçudas", plan: "Básico", status: "ativo", since: "2026-03-05", feePct: 7, orders: 120, revenue: 9800, byPay: { credito: 3800, debito: 1800, pix: 3600, usdc: 600 }, phone: "(47) 3344-7070", email: "contato@cantinhocabecudas.com.br", website: "", whatsapp: "5547999996666", instagram: "@cantinhocabecudas", user: "cabecudas", password: "cabe2026" },
    { id: "e8", name: "Brava Norte Beach Bar", owner: "Tiago Moraes", city: "Itajaí/SC", neighborhood: "Praia Brava Norte", plan: "Pro", status: "ativo", since: "2025-12-10", feePct: 8, orders: 530, revenue: 52000, byPay: { credito: 18000, debito: 6000, pix: 20000, usdc: 8000 }, phone: "(47) 3344-8080", email: "contato@bravanorte.com.br", website: "www.bravanorte.com.br", whatsapp: "5547999997777", instagram: "@bravanortebar", user: "bravanorte", password: "norte2025" },
    { id: "e9", name: "Norte Drinks & Cia", owner: "Carla Nunes", city: "Itajaí/SC", neighborhood: "Praia Brava Norte", plan: "Básico", status: "ativo", since: "2026-02-01", feePct: 8, orders: 210, revenue: 18600, byPay: { credito: 7000, debito: 3000, pix: 7600, usdc: 1000 }, phone: "(47) 3344-8181", email: "contato@nortedrinks.com.br", website: "", whatsapp: "5547999997788", instagram: "@nortedrinks", user: "nortedrinks", password: "drinks2026" },
    { id: "e10", name: "Sul do Mar Petiscaria", owner: "Eduardo Pires", city: "Itajaí/SC", neighborhood: "Praia Brava Sul", plan: "Pro", status: "ativo", since: "2025-11-20", feePct: 9, orders: 480, revenue: 47500, byPay: { credito: 16500, debito: 5500, pix: 18500, usdc: 7000 }, phone: "(47) 3344-9090", email: "contato@suldomar.com.br", website: "www.suldomar.com.br", whatsapp: "5547999998899", instagram: "@suldomar", user: "suldomar", password: "sul2025" },
    { id: "e11", name: "Bar do Sul Brava", owner: "Patrícia Lopes", city: "Itajaí/SC", neighborhood: "Praia Brava Sul", plan: "Básico", status: "ativo", since: "2026-01-12", feePct: 7, orders: 165, revenue: 13200, byPay: { credito: 5000, debito: 2200, pix: 5400, usdc: 600 }, phone: "(47) 3344-9191", email: "contato@bardosul.com.br", website: "", whatsapp: "5547999998800", instagram: "@bardosulbrava", user: "bardosul", password: "bardosul2026" },
  ];
}

const ADMIN_PERIODS = [
  { id: "dia", label: "Dia", days: 1, factor: 1 / 30 },
  { id: "semana", label: "Semana", days: 7, factor: 7 / 30 },
  { id: "quinzena", label: "Quinzena", days: 15, factor: 15 / 30 },
  { id: "mes", label: "Mês", days: 30, factor: 1 },
];

function Img({ src, emoji, gradient, className }) {
  const [err, setErr] = useState(false);
  if (!src || err) return <div className={`${className} ${gradient || "bg-gradient-to-br from-slate-200 to-slate-300"} flex items-center justify-center`}><span className="text-5xl drop-shadow-sm">{emoji}</span></div>;
  return <img src={src} alt="" onError={() => setErr(true)} className={`${className} object-cover`} />;
}

function Gallery({ item, className }) {
  const photos = [item.photo, item.photo2].filter(Boolean);
  const [idx, setIdx] = useState(0);
  if (photos.length <= 1) return <Img src={item.photo} emoji={item.emoji} gradient={catGrad(item.cat)} className={className} />;
  const go = (e, d) => { e.stopPropagation(); setIdx((p) => (p + d + photos.length) % photos.length); };
  return (
    <div className="relative">
      <Img src={photos[idx]} emoji={item.emoji} gradient={catGrad(item.cat)} className={className} />
      <button onClick={(e) => go(e, -1)} className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/35 text-white flex items-center justify-center backdrop-blur active:scale-90"><ArrowLeft size={15} /></button>
      <button onClick={(e) => go(e, 1)} className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/35 text-white flex items-center justify-center backdrop-blur active:scale-90"><ArrowLeft size={15} className="rotate-180" /></button>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
        {photos.map((_, k) => (<span key={k} className={`w-1.5 h-1.5 rounded-full transition ${k === idx ? "bg-white" : "bg-white/50"}`} />))}
      </div>
    </div>
  );
}

// =====================================================================
export default function App() {
  const [view, setView] = useState("landing");
  const [menu, setMenu] = useState(INITIAL_MENU);
  const [orders, setOrders] = useState(seedOrders);
  const [orderSeq, setOrderSeq] = useState(12);
  const [restaurant, setRestaurant] = useState(INITIAL_RESTAURANT);
  const [establishments, setEstablishments] = useState(() => seedEstablishments(seedOrders(), INITIAL_RESTAURANT.platformFee));

  const addOrder = (o) => {
    const id = orderSeq;
    setOrders((prev) => [{ ...o, id, status: o.status || "producao", ts: new Date() }, ...prev]);
    setOrderSeq((s) => s + 1);
    return id;
  };

  const [clientStart, setClientStart] = useState("menu");
  const enterClient = () => { setClientStart("menu"); setView("cliente"); };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800" style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif" }}>
      <div className="bg-slate-900 text-white px-4 py-2 flex items-center justify-between sticky top-0 z-40">
        <button onClick={() => setView("landing")} className="flex items-center gap-2 font-bold tracking-tight"><Sun size={18} className="text-amber-400" /> PedeAí <span className="text-slate-400 font-normal text-xs hidden sm:inline">· demo</span></button>
        <div className="flex gap-1 bg-slate-800 rounded-lg p-1 text-sm">
          <button onClick={() => setView("landing")} className={`px-3 py-1.5 rounded-md font-medium transition ${view === "landing" ? "bg-cyan-500 text-white" : "text-slate-300"}`}>🌐 Site</button>
          <button onClick={() => { setClientStart("qr"); setView("cliente"); }} className={`px-3 py-1.5 rounded-md font-medium transition ${view === "cliente" ? "bg-cyan-500 text-white" : "text-slate-300"}`}>📱 Cliente (QR)</button>
          <button onClick={() => setView("restaurante")} className={`px-3 py-1.5 rounded-md font-medium transition ${view === "restaurante" ? "bg-cyan-500 text-white" : "text-slate-300"}`}>🏖️ Restaurante</button>
          <button onClick={() => setView("admin")} className={`px-3 py-1.5 rounded-md font-medium transition ${view === "admin" ? "bg-cyan-500 text-white" : "text-slate-300"}`}>🛡️ Admin</button>
        </div>
      </div>

      {view === "landing" && <Landing establishments={establishments} onEnter={enterClient} onForEstablishment={() => setView("restaurante")} />}
      {view === "cliente" && <Cliente start={clientStart} menu={menu} restaurant={restaurant} orders={orders} setOrders={setOrders} addOrder={addOrder} onExit={() => setView("landing")} />}
      {view === "restaurante" && <Restaurante menu={menu} setMenu={setMenu} orders={orders} setOrders={setOrders} restaurant={restaurant} setRestaurant={setRestaurant} />}
      {view === "admin" && <Admin orders={orders} establishments={establishments} setEstablishments={setEstablishments} restaurant={restaurant} setRestaurant={setRestaurant} />}
    </div>
  );
}

// =====================================================================
// CLIENTE
// =====================================================================
function Cliente({ start = "qr", menu, restaurant, orders, setOrders, addOrder, onExit }) {
  const [step, setStep] = useState(start);
  const [cart, setCart] = useState([]);
  const [note, setNote] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [lastOrder, setLastOrder] = useState(null);
  const [myOrderIds, setMyOrderIds] = useState([]);

  const myOrders = orders.filter((o) => myOrderIds.includes(o.id));

  const add = (item) => setCart((c) => {
    const ex = c.find((i) => i.id === item.id);
    return ex ? c.map((i) => i.id === item.id ? { ...i, qty: i.qty + 1 } : i) : [...c, { ...item, qty: 1 }];
  });
  const dec = (id) => setCart((c) => c.flatMap((i) => i.id === id ? (i.qty > 1 ? [{ ...i, qty: i.qty - 1 }] : []) : [i]));
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const count = cart.reduce((s, i) => s + i.qty, 0);
  const feePct = restaurant.platformFee || 0;
  const fee = +(total * feePct / 100).toFixed(2);

  const finish = (payment, splits) => {
    const fullyPaid = !splits || splits.every((s) => s.method);
    const o = { items: cart.map((i) => ({ name: i.name, qty: i.qty, price: i.price })), total, fee, feePct, payment, splits, note: note.trim() || undefined, customerName: customerName.trim() || undefined, location: "Guarda-sol nº 14", status: fullyPaid ? "producao" : "aguardando" };
    const id = addOrder(o);
    setMyOrderIds((ids) => [id, ...ids]);
    setLastOrder({ ...o, id, ts: new Date() });
    setCart([]); setNote("");
    setStep("done");
  };

  const payShare = (orderId, idx, method) => {
    setOrders((list) => list.map((o) => {
      if (o.id !== orderId) return o;
      const splits = o.splits.map((s, i) => (i === idx ? { ...s, method } : s));
      const allPaid = splits.every((s) => s.method);
      const nP = splits.filter((s) => s.method).length;
      return { ...o, splits, status: allPaid ? "producao" : o.status, payment: { ...o.payment, label: allPaid ? `Dividido · ${splits.length} pessoas` : `Dividido · ${nP}/${splits.length} pagos` } };
    }));
  };

  if (step === "qr") return <QrLanding restaurant={restaurant} customerName={customerName} setCustomerName={setCustomerName} onScan={() => setStep("menu")} />;
  if (step === "checkout") return <Checkout cart={cart} total={total} fee={fee} feePct={feePct} note={note} setNote={setNote} menu={menu} add={add} onBack={() => setStep("menu")} onPay={finish} />;
  if (step === "done") return <OrderDone order={lastOrder} onNew={() => setStep("menu")} onMyOrders={() => setStep("myorders")} />;
  if (step === "myorders") return <MyOrders myOrders={myOrders} restaurant={restaurant} payShare={payShare} onBack={() => setStep("menu")} />;
  return <Menu menu={menu} restaurant={restaurant} orders={orders} cart={cart} count={count} total={total} add={add} dec={dec} onCheckout={() => setStep("checkout")} onMyOrders={() => setStep("myorders")} myOrdersCount={myOrders.length} />;
}

function QrLanding({ restaurant, customerName, setCustomerName, onScan }) {
  return (
    <div className="max-w-md mx-auto px-6 py-10 text-center">
      <div className="rounded-3xl overflow-hidden shadow-xl relative">
        <Img src={restaurant.cover} emoji={restaurant.emoji} gradient="bg-gradient-to-br from-cyan-400 to-blue-600" className="w-full h-44" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        {restaurant.logo && <div className="absolute top-3 left-3 w-12 h-12 rounded-xl bg-white/90 backdrop-blur shadow-lg overflow-hidden ring-2 ring-white/70"><img src={restaurant.logo} alt="" className="w-full h-full object-cover" /></div>}
        <div className="absolute bottom-0 left-0 p-5 text-white text-left">
          <h1 className="text-2xl font-extrabold">{restaurant.name}</h1>
          <p className="text-white/85 text-sm">{restaurant.tagline}</p>
        </div>
      </div>
      <div className="mt-7 bg-white rounded-2xl p-7 shadow-sm">
        <div className="inline-block p-5 bg-slate-900 rounded-2xl mb-4"><QrCode size={100} className="text-white" /></div>
        <p className="text-slate-500 text-sm mb-1">Você está no</p>
        <p className="font-bold text-lg flex items-center justify-center gap-1.5"><MapPin size={18} className="text-cyan-500" /> Guarda-sol nº 14</p>

        <div className="mt-5 text-left">
          <label className="text-xs font-medium text-slate-500 flex items-center gap-1.5"><User size={13} className="text-cyan-500" /> Seu nome <span className="text-slate-400 font-normal">(opcional)</span></label>
          <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} maxLength={40} placeholder="Como podemos te chamar?" className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none" />
          <p className="text-[11px] text-slate-400 mt-1.5">Ajuda o garçom a te encontrar na areia 🏖️</p>
        </div>

        <button onClick={onScan} className="mt-5 w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-3.5 rounded-xl transition active:scale-95">Ver cardápio e pedir</button>
        <p className="text-xs text-slate-400 mt-3">Simulando a leitura do QR Code no guarda-sol 👆</p>
      </div>
    </div>
  );
}

function Menu({ menu, restaurant, orders, cart, count, total, add, dec, onCheckout, onMyOrders, myOrdersCount }) {
  const [cat, setCat] = useState("Combos & Combinações");
  const [sub, setSub] = useState("Combos");
  const [cartOpen, setCartOpen] = useState(false);
  const [query, setQuery] = useState("");
  const items = menu.filter((i) => i.cat === cat && i.sub === sub);
  const promos = menu.filter(isPromo);
  const pickCat = (c) => { setCat(c); setSub(CATS[c][0]); };
  const searching = query.trim().length > 0;
  const results = searching ? menu.filter((i) => (i.name + " " + i.desc).toLowerCase().includes(query.trim().toLowerCase())) : [];
  const displayItems = searching ? results : items;

  const popMap = {};
  orders.forEach((o) => o.items.forEach((it) => { popMap[it.name] = (popMap[it.name] || 0) + it.qty; }));
  const popular = Object.entries(popMap).sort((a, b) => b[1] - a[1]).map(([n]) => menu.find((m) => m.name === n)).filter(Boolean).slice(0, 6);

  const QtyControl = ({ i }) => {
    const inCart = cart.find((c) => c.id === i.id);
    return inCart ? (
      <div className="flex items-center gap-2">
        <button onClick={() => dec(i.id)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center active:scale-90"><Minus size={15} /></button>
        <span className="font-bold text-sm w-4 text-center">{inCart.qty}</span>
        <button onClick={() => add(i)} className="w-8 h-8 rounded-full bg-cyan-500 text-white flex items-center justify-center active:scale-90"><Plus size={15} /></button>
      </div>
    ) : (
      <button onClick={() => add(i)} className="bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-semibold px-4 py-2 rounded-xl flex items-center gap-1 active:scale-95 shadow-sm shadow-cyan-200"><Plus size={15} /> Add</button>
    );
  };

  const MiniCard = ({ i, badge }) => (
    <div className="w-40 shrink-0 bg-white rounded-2xl overflow-hidden shadow-sm">
      <div className="relative">
        <Img src={i.photo} emoji={i.emoji} gradient={catGrad(i.cat)} className="w-full h-24" />
        {badge}
      </div>
      <div className="p-2.5">
        <h3 className="font-semibold text-sm leading-tight truncate">{i.name}</h3>
        <div className="flex items-center justify-between mt-1">
          <div className="leading-none">
            {isPromo(i) && <span className="text-slate-300 line-through text-[11px]">{money(i.oldPrice)}</span>}
            <p className="font-extrabold text-cyan-600">{money(i.price)}</p>
          </div>
          <button onClick={() => add(i)} className="w-8 h-8 rounded-full bg-cyan-500 text-white flex items-center justify-center active:scale-90 shrink-0"><Plus size={16} /></button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto pb-28 bg-slate-100">
      <div className="relative">
        <Img src={restaurant.cover} emoji={restaurant.emoji} gradient="bg-gradient-to-br from-cyan-400 to-blue-600" className="w-full h-52" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
        {restaurant.logo && <div className="absolute top-3 left-3 w-12 h-12 rounded-xl bg-white/90 backdrop-blur shadow-lg overflow-hidden ring-2 ring-white/70"><img src={restaurant.logo} alt="" className="w-full h-full object-cover" /></div>}
        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
          <h1 className="text-2xl font-extrabold leading-tight">{restaurant.name}</h1>
          <p className="text-white/90 text-sm">{restaurant.tagline}</p>
          <div className="flex flex-col gap-0.5 text-xs text-white/80 mt-2">
            <span className="flex items-center gap-1"><MapPin size={12} /> {restaurant.address}</span>
            <span className="flex items-center gap-1"><Clock size={12} /> {restaurant.hours}</span>
          </div>
          <span className="inline-flex items-center gap-1 mt-2 bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-medium"><MapPin size={11} /> Guarda-sol nº 14</span>
        </div>
      </div>

      <div className="px-4 pt-3">
        <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm">
          <button className="flex-1 py-2 rounded-lg text-sm font-medium bg-cyan-500 text-white flex items-center justify-center gap-1.5"><UtensilsCrossed size={15} /> Cardápio</button>
          <button onClick={onMyOrders} className="flex-1 py-2 rounded-lg text-sm font-medium text-slate-500 flex items-center justify-center gap-1.5"><LayoutDashboard size={15} /> Meus pedidos{myOrdersCount > 0 ? ` (${myOrdersCount})` : ""}</button>
        </div>
      </div>

      {!searching && popular.length > 0 && (
        <div className="pt-4">
          <h2 className="px-4 font-extrabold text-lg flex items-center gap-1.5 mb-2"><span>🏆</span> Os mais pedidos</h2>
          <div className="flex gap-3 px-4 overflow-x-auto pb-2">
            {popular.map((i, k) => (<MiniCard key={i.id} i={i} badge={<span className="absolute top-2 left-2 bg-amber-400 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-full shadow">{MEDAL[k] || `#${k + 1}`}</span>} />))}
          </div>
        </div>
      )}

      {!searching && promos.length > 0 && (
        <div className="pt-3">
          <h2 className="px-4 font-extrabold text-lg flex items-center gap-1.5 mb-2"><Flame size={20} className="text-red-500" /> Ofertas do dia</h2>
          <div className="flex gap-3 px-4 overflow-x-auto pb-2">
            {promos.map((i) => (<MiniCard key={i.id} i={i} badge={<span className="absolute top-2 left-2 bg-red-500 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-full shadow">-{pct(i)}%</span>} />))}
          </div>
        </div>
      )}

      <div className="sticky top-[44px] bg-slate-100 z-20 pt-3 pb-1">
        <div className="px-4 mb-2 relative">
          <span className="absolute left-7 top-1/2 -translate-y-1/2 text-sm">🔍</span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar item no cardápio…" className="w-full pl-9 pr-9 py-2.5 rounded-full border border-slate-200 bg-white text-sm focus:border-cyan-500 outline-none" />
          {searching && <button onClick={() => setQuery("")} className="absolute right-7 top-1/2 -translate-y-1/2 text-slate-400"><X size={16} /></button>}
        </div>
        {!searching && (
          <>
            <div className="flex gap-2 px-4 overflow-x-auto">
              {Object.keys(CATS).map((c) => (
                <button key={c} onClick={() => pickCat(c)} className={`px-4 py-2 rounded-full text-sm font-semibold transition whitespace-nowrap ${cat === c ? "bg-slate-900 text-white" : "bg-white text-slate-600"}`}>{CAT_EMOJI[c]} {c}</button>
              ))}
            </div>
            <div className="flex gap-2 px-4 py-3 overflow-x-auto">
              {CATS[cat].map((s) => (
                <button key={s} onClick={() => setSub(s)} className={`px-3.5 py-1.5 rounded-full text-sm whitespace-nowrap transition ${sub === s ? "bg-cyan-500 text-white font-medium" : "bg-white text-slate-500 border border-slate-200"}`}>{s}</button>
              ))}
            </div>
          </>
        )}
      </div>

      {searching && <p className="px-4 mt-2 text-sm text-slate-500">{displayItems.length} resultado{displayItems.length !== 1 ? "s" : ""} para “{query.trim()}”</p>}
      <div className="px-4 space-y-4 mt-1">
        {searching && displayItems.length === 0 && <p className="text-center text-slate-400 py-10 text-sm">Nenhum item encontrado.</p>}
        {displayItems.map((i) => (
          <div key={i.id} className="bg-white rounded-3xl overflow-hidden shadow-sm">
            <div className="relative">
              <Gallery item={i} className="w-full h-44" />
              {isPromo(i) && <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-extrabold px-2.5 py-1 rounded-full shadow flex items-center gap-1"><Percent size={12} /> {pct(i)}% OFF</span>}
            </div>
            <div className="p-4">
              <h3 className="font-bold text-base leading-tight">{i.name}</h3>
              {i.measure && <span className="inline-block mt-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{String(i.measure).replace(".", ",")} {i.unit}</span>}
              <p className="text-slate-400 text-xs mt-1 leading-snug">{i.desc}</p>
              <div className="flex items-center justify-between mt-3">
                <div className="leading-none">
                  {isPromo(i) && <span className="text-slate-300 line-through text-xs mr-1.5">{money(i.oldPrice)}</span>}
                  <span className="font-extrabold text-xl text-cyan-600">{money(i.price)}</span>
                </div>
                <QtyControl i={i} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {!searching && (restaurant.instagram || restaurant.phone || restaurant.whatsapp || restaurant.website) && (
        <div className="px-4 mt-4">
          <div className="bg-white rounded-3xl p-4 shadow-sm">
            <h2 className="font-extrabold text-base mb-3 flex items-center gap-1.5">📍 Fale com {restaurant.name}</h2>
            <div className="grid grid-cols-2 gap-2">
              {restaurant.whatsapp && <a href={`https://wa.me/${restaurant.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-emerald-50 text-emerald-700 rounded-xl px-3 py-2.5 text-sm font-medium active:scale-95 transition"><MessageCircle size={16} className="shrink-0" /> WhatsApp</a>}
              {restaurant.instagram && <a href={`https://instagram.com/${restaurant.instagram.replace(/^@/, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-pink-50 text-pink-600 rounded-xl px-3 py-2.5 text-sm font-medium active:scale-95 transition"><Instagram size={16} className="shrink-0" /> <span className="truncate">{restaurant.instagram}</span></a>}
              {restaurant.phone && <a href={`tel:${restaurant.phone.replace(/\D/g, "")}`} className="flex items-center gap-2 bg-slate-100 text-slate-700 rounded-xl px-3 py-2.5 text-sm font-medium active:scale-95 transition"><Phone size={16} className="shrink-0" /> <span className="truncate">{restaurant.phone}</span></a>}
              {restaurant.website && <a href={restaurant.website.startsWith("http") ? restaurant.website : `https://${restaurant.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-cyan-50 text-cyan-700 rounded-xl px-3 py-2.5 text-sm font-medium active:scale-95 transition"><Globe size={16} className="shrink-0" /> Website</a>}
            </div>
          </div>
        </div>
      )}

      {count > 0 && (
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-3 z-30">
          <button onClick={() => setCartOpen(true)} className="w-full bg-slate-900 text-white rounded-2xl px-5 py-3.5 flex items-center justify-between shadow-lg active:scale-95 transition">
            <span className="flex items-center gap-2 font-semibold"><ShoppingCart size={18} /> {count} {count === 1 ? "item" : "itens"}</span>
            <span className="font-bold">{money(total)}</span>
          </button>
        </div>
      )}

      {cartOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setCartOpen(false)}>
          <div className="bg-white w-full max-w-md rounded-t-3xl p-5 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4"><h2 className="font-bold text-lg">Seu pedido</h2><button onClick={() => setCartOpen(false)}><X size={22} className="text-slate-400" /></button></div>
            <div className="space-y-3">
              {cart.map((i) => (
                <div key={i.id} className="flex items-center gap-3">
                  <Img src={i.photo} emoji={i.emoji} gradient={catGrad(i.cat)} className="w-12 h-12 rounded-xl shrink-0" />
                  <div className="flex-1 min-w-0"><p className="font-medium text-sm truncate">{i.name}</p><p className="text-cyan-600 text-sm font-semibold">{money(i.price * i.qty)}</p></div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => dec(i.id)} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center"><Minus size={14} /></button>
                    <span className="font-semibold text-sm w-4 text-center">{i.qty}</span>
                    <button onClick={() => add(i)} className="w-7 h-7 rounded-full bg-cyan-500 text-white flex items-center justify-center"><Plus size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center mt-5 pt-4 border-t border-slate-100"><span className="text-slate-500">Total</span><span className="font-bold text-xl">{money(total)}</span></div>
            <button onClick={() => { setCartOpen(false); onCheckout(); }} className="mt-4 w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-3.5 rounded-xl transition active:scale-95">Ir para o pagamento</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Checkout({ cart, total, fee, feePct, note, setNote, menu, add, onBack, onPay }) {
  const [mode, setMode] = useState("full");
  const [sel, setSel] = useState(null);
  const [parc, setParc] = useState(1);
  const [paying, setPaying] = useState(false);
  const [people, setPeople] = useState(2);
  const [paid, setPaid] = useState([null, null]);

  const cartIds = cart.map((c) => c.id);
  const desserts = menu.filter((i) => i.cat === "Sobremesas" && !cartIds.includes(i.id)).slice(0, 4);

  const grand = total + (fee || 0);
  const maxParc = Math.max(1, Math.min(6, Math.floor(grand / 20)));
  const parcels = Array.from({ length: maxParc }, (_, i) => i + 1);
  const share = total / people;
  const nPaid = paid.filter(Boolean).length;
  const allPaid = nPaid === people;

  const setPpl = (n) => { setPeople(n); setPaid(Array(n).fill(null)); };
  const payPerson = (idx, method) => setPaid((p) => p.map((m, i) => (i === idx ? method : m)));
  const pickPay = (id) => { setSel(id); if (id !== "credito") setParc(1); };

  const finishFull = () => {
    setPaying(true);
    const base = pay(sel);
    const payment = sel === "credito" && parc > 1 ? { ...base, label: `Crédito ${parc}x de ${money(grand / parc)}` } : base;
    setTimeout(() => onPay(payment), 1400);
  };
  const finishSplit = () => {
    setPaying(true);
    const splits = paid.map((m) => ({ method: m, amount: share }));
    const payment = { id: "split", label: allPaid ? `Dividido · ${people} pessoas` : `Dividido · ${nPaid}/${people} pagos`, icon: Users, color: "bg-pink-500" };
    setTimeout(() => onPay(payment, splits), 1400);
  };

  return (
    <div className="max-w-md mx-auto px-5 py-5 pb-28">
      <button onClick={onBack} className="flex items-center gap-1 text-slate-500 text-sm mb-4"><ArrowLeft size={16} /> Voltar ao cardápio</button>
      <h1 className="text-xl font-bold mb-4">Confirmar pedido</h1>

      <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
        <p className="text-xs text-slate-400 mb-2 flex items-center gap-1"><MapPin size={12} /> Guarda-sol nº 14</p>
        {cart.map((i) => (<div key={i.id} className="flex justify-between py-1.5 text-sm"><span className="text-slate-600">{i.qty}× {i.name}</span><span className="font-medium">{money(i.price * i.qty)}</span></div>))}
        {fee > 0 ? (
          <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
            <div className="flex justify-between text-sm text-slate-500"><span>Subtotal</span><span>{money(total)}</span></div>
            <div className="flex justify-between text-sm text-slate-500"><span className="flex items-center gap-1">Taxa de serviço PedeAí <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded-full font-medium">{feePct}%</span></span><span>{money(fee)}</span></div>
            <div className="flex justify-between font-bold pt-1.5 border-t border-slate-100"><span>Total a pagar</span><span className="text-cyan-600">{money(grand)}</span></div>
          </div>
        ) : (
          <div className="flex justify-between mt-3 pt-3 border-t border-slate-100 font-bold"><span>Total</span><span className="text-cyan-600">{money(total)}</span></div>
        )}
      </div>

      <button onClick={onBack} className="w-full mb-4 bg-white border-2 border-cyan-500 text-cyan-600 font-semibold py-3 rounded-xl transition active:scale-95 flex items-center justify-center gap-1.5 hover:bg-cyan-50"><Plus size={18} /> Continuar adicionando mais itens</button>

      {desserts.length > 0 && (
        <div className="bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-100 rounded-2xl p-4 mb-4">
          <h3 className="font-bold text-sm text-rose-900 flex items-center gap-1.5">🍦 Que tal um doce pra fechar?</h3>
          <p className="text-xs text-rose-700/70 mb-3">Toque no + para adicionar ao pedido</p>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {desserts.map((i) => (
              <div key={i.id} className="w-32 shrink-0 bg-white rounded-2xl overflow-hidden shadow-sm">
                <Img src={i.photo} emoji={i.emoji} gradient={catGrad(i.cat)} className="w-full h-20" />
                <div className="p-2">
                  <p className="text-xs font-semibold leading-tight truncate">{i.name}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm font-bold text-cyan-600">{money(i.price)}</span>
                    <button onClick={() => add(i)} className="w-7 h-7 rounded-full bg-cyan-500 text-white flex items-center justify-center active:scale-90"><Plus size={14} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
        <label className="text-sm font-semibold text-slate-600 flex items-center gap-1.5 mb-2"><MessageSquare size={15} className="text-cyan-500" /> Observação do pedido <span className="text-slate-400 font-normal text-xs">(opcional)</span></label>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} maxLength={200} placeholder="Ex: caipirinha sem açúcar, carne ao ponto, alergia a camarão, entregar rápido…" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none resize-none" />
        <p className="text-[11px] text-slate-400 mt-1 text-right">{note.length}/200</p>
      </div>

      <div className="flex gap-1 bg-slate-200 rounded-xl p-1 mb-3">
        <button onClick={() => setMode("full")} className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${mode === "full" ? "bg-white shadow-sm text-slate-800" : "text-slate-500"}`}>Pagar tudo</button>
        <button onClick={() => setMode("split")} className={`flex-1 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-1.5 ${mode === "split" ? "bg-white shadow-sm text-slate-800" : "text-slate-500"}`}><Users size={15} /> Dividir conta</button>
      </div>

      {mode === "full" ? (
        <>
          <h2 className="font-semibold text-sm mb-2 text-slate-600">Forma de pagamento</h2>
          <div className="grid grid-cols-2 gap-2">
            {PAYMENTS.map((p) => {
              const Icon = p.icon;
              return (
                <button key={p.id} onClick={() => pickPay(p.id)} className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-2 transition ${sel === p.id ? "border-cyan-500 bg-cyan-50" : "border-slate-200 bg-white"}`}>
                  <div className={`w-9 h-9 rounded-full ${p.color} text-white flex items-center justify-center`}><Icon size={18} /></div>
                  <span className="text-sm font-medium text-center leading-tight">{p.label}</span>
                </button>
              );
            })}
          </div>
          {sel === "credito" && (
            <div className="mt-3 bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-semibold text-sm text-slate-600 mb-2">Em quantas vezes?</h3>
              <div className="grid grid-cols-3 gap-2">
                {parcels.map((n) => (
                  <button key={n} onClick={() => setParc(n)} className={`py-2 rounded-xl border-2 flex flex-col items-center transition ${parc === n ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white"}`}>
                    <span className="font-bold text-sm">{n}x</span><span className="text-xs text-slate-600">{money(total / n)}</span><span className="text-[10px] text-emerald-600 font-medium">{n === 1 ? "à vista" : "sem juros"}</span>
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 mt-2">Parcela mínima de R$ 20,00 · parcelamento sem juros</p>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm text-slate-600">Quantos amigos?</h3>
            <div className="flex items-center gap-3">
              <button onClick={() => people > 2 && setPpl(people - 1)} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center active:scale-90"><Minus size={14} /></button>
              <span className="font-bold w-4 text-center">{people}</span>
              <button onClick={() => people < 8 && setPpl(people + 1)} className="w-7 h-7 rounded-full bg-cyan-500 text-white flex items-center justify-center active:scale-90"><Plus size={14} /></button>
            </div>
          </div>
          <p className="text-xs text-slate-400 mb-3">Dividido igualmente · <b className="text-cyan-600">{money(share)}</b> por pessoa. Cada um paga do jeito que quiser.</p>
          <div className="space-y-2">
            {paid.map((m, idx) => (
              <div key={idx} className="border border-slate-200 rounded-xl p-2.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium flex items-center gap-1.5"><span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold">{idx + 1}</span> Amigo {idx + 1}</span>
                  {m ? <span className="text-xs text-emerald-600 font-medium flex items-center gap-1"><Check size={13} /> Pago · {m.id === "usdc" ? "USDC" : m.label}</span> : <span className="text-xs text-slate-400">{money(share)}</span>}
                </div>
                {m ? (
                  <button onClick={() => payPerson(idx, null)} className="text-[11px] text-slate-400 underline">desfazer</button>
                ) : (
                  <div className="grid grid-cols-4 gap-1.5">
                    {PAYMENTS.map((p) => {
                      const Icon = p.icon;
                      return (<button key={p.id} onClick={() => payPerson(idx, p)} className="py-1.5 rounded-lg bg-slate-50 hover:bg-cyan-50 border border-slate-200 flex flex-col items-center gap-0.5 active:scale-90"><Icon size={15} className="text-slate-600" /><span className="text-[9px] text-slate-500 leading-none text-center">{p.id === "usdc" ? "USDC" : p.label}</span></button>);
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-slate-500 mb-1"><span>{nPaid} de {people} pagaram</span><span>{money(nPaid * share)} de {money(total)}</span></div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${(nPaid / people) * 100}%` }} /></div>
          </div>
          {fee > 0 && <p className="mt-2 text-[11px] text-slate-400">+ Taxa de serviço PedeAí ({feePct}%): <b className="text-slate-600">{money(fee)}</b> — cobrada à parte. Total a pagar: <b className="text-slate-600">{money(grand)}</b>.</p>}
          {nPaid > 0 && nPaid < people && (
            <div className="mt-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-3 py-2 text-xs flex gap-1.5"><Clock size={14} className="shrink-0 mt-0.5" /><span>Falta(m) <b>{people - nPaid}</b> pagamento(s). O pedido só vai para a cozinha quando estiver <b>100% pago</b> — os demais podem pagar depois em “Meus pedidos”.</span></div>
          )}
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-3 bg-gradient-to-t from-slate-100 to-transparent">
        {mode === "full" ? (
          <button disabled={!sel || paying} onClick={finishFull} className="w-full bg-cyan-500 disabled:bg-slate-300 hover:bg-cyan-600 text-white font-semibold py-3.5 rounded-xl transition active:scale-95 flex items-center justify-center gap-2">
            {paying ? <>Processando pagamento…</> : (sel === "credito" && parc > 1 ? <>Pagar {parc}x de {money(grand / parc)}</> : <>Pagar {money(grand)}</>)}
          </button>
        ) : (
          <button disabled={nPaid === 0 || paying} onClick={finishSplit} className={`w-full disabled:bg-slate-300 text-white font-semibold py-3.5 rounded-xl transition active:scale-95 flex items-center justify-center gap-2 ${allPaid ? "bg-cyan-500 hover:bg-cyan-600" : "bg-amber-500 hover:bg-amber-600"}`}>
            {paying ? <>Enviando pedido…</> : nPaid === 0 ? <>Selecione ao menos 1 pagamento</> : allPaid ? <>Finalizar pedido — {money(total)}</> : <>Enviar pedido · {nPaid}/{people} pagos</>}
          </button>
        )}
      </div>
    </div>
  );
}

function OrderDone({ order, onNew, onMyOrders }) {
  const incomplete = order.status === "aguardando";
  const info = order.splits ? splitInfo(order) : null;
  return (
    <div className="max-w-md mx-auto px-6 py-12 text-center">
      <div className={`w-20 h-20 rounded-full ${incomplete ? "bg-amber-500" : "bg-emerald-500"} text-white flex items-center justify-center mx-auto mb-5 shadow-lg`}>{incomplete ? <Clock size={44} /> : <Check size={44} />}</div>
      <h1 className="text-2xl font-bold">{incomplete ? "Pagamento parcial recebido" : (order.customerName ? `Tudo certo, ${order.customerName}!` : "Pagamento confirmado!")}</h1>
      <p className="text-slate-500 mt-1">{incomplete ? "Seu pedido vai para a cozinha assim que todos pagarem." : "Seu pedido já foi enviado para a cozinha."}</p>
      <div className="bg-white rounded-2xl p-5 shadow-sm mt-6 text-left">
        <div className="flex justify-between flex-wrap gap-y-1 text-sm text-slate-400 mb-3">
          <span className="flex items-center gap-1"><MapPin size={13} /> {order.location}</span>
          {order.customerName && <span className="flex items-center gap-1"><User size={13} /> {order.customerName}</span>}
          <span className="flex items-center gap-1"><Clock size={13} /> {order.ts.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
        </div>
        {order.items.map((i, k) => (<div key={k} className="flex justify-between py-1 text-sm"><span>{i.qty}× {i.name}</span><span className="font-medium">{money(i.price * i.qty)}</span></div>))}
        {incomplete && info && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-slate-500 mb-1"><span>{info.paidCount} de {info.total} pagaram</span><span>{money(info.paidAmt)} de {money(order.total)}</span></div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(info.paidAmt / order.total) * 100}%` }} /></div>
          </div>
        )}
        {order.note && <div className="mt-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-2.5 py-1.5 text-xs flex gap-1.5"><MessageSquare size={13} className="shrink-0 mt-0.5" /> <span>{order.note}</span></div>}
        {order.fee > 0 && !incomplete && (
          <div className="mt-3 pt-3 border-t border-slate-100 space-y-1 text-sm text-slate-500">
            <div className="flex justify-between"><span>Subtotal</span><span>{money(order.total)}</span></div>
            <div className="flex justify-between"><span>Taxa de serviço PedeAí ({order.feePct}%)</span><span>{money(order.fee)}</span></div>
          </div>
        )}
        <div className="flex justify-between mt-3 pt-3 border-t border-slate-100 font-bold"><span>{incomplete ? "Pago até agora" : `Pago via ${order.payment.label}`}</span><span className={incomplete ? "text-amber-600" : "text-emerald-600"}>{incomplete ? money(info.paidAmt) : money(order.total + (order.fee || 0))}</span></div>
      </div>
      <button onClick={onMyOrders} className="mt-5 w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-3.5 rounded-xl active:scale-95 transition">{incomplete ? "Completar pagamento" : "Ver meus pedidos"}</button>
      <button onClick={onNew} className="mt-3 w-full bg-slate-900 text-white font-semibold py-3.5 rounded-xl active:scale-95 transition">Fazer outro pedido</button>
    </div>
  );
}

function MyOrders({ myOrders, restaurant, payShare, onBack }) {
  const [exp, setExp] = useState(null);
  const statusInfo = (o) => o.status === "aguardando" ? { label: "Pendente", cls: "bg-rose-100 text-rose-700" } : o.status === "producao" ? { label: "Pago", cls: "bg-amber-100 text-amber-700" } : { label: "Entregue", cls: "bg-emerald-100 text-emerald-700" };

  return (
    <div className="max-w-md mx-auto px-4 py-5 pb-10">
      <div className="px-1 mb-4">
        <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm">
          <button onClick={onBack} className="flex-1 py-2 rounded-lg text-sm font-medium text-slate-500 flex items-center justify-center gap-1.5"><UtensilsCrossed size={15} /> Cardápio</button>
          <button className="flex-1 py-2 rounded-lg text-sm font-medium bg-cyan-500 text-white flex items-center justify-center gap-1.5"><LayoutDashboard size={15} /> Meus pedidos{myOrders.length > 0 ? ` (${myOrders.length})` : ""}</button>
        </div>
      </div>
      <h1 className="text-xl font-bold mb-1 px-1">Meus pedidos</h1>
      {restaurant && <p className="text-sm text-slate-400 mb-4 px-1 flex items-center gap-1"><Store size={13} /> {restaurant.name}</p>}
      {myOrders.length === 0 ? (
        <div className="text-center py-16 text-slate-400"><LayoutDashboard size={40} className="mx-auto mb-3 opacity-40" /><p>Você ainda não fez pedidos nesta visita.</p></div>
      ) : (
        <div className="space-y-3">
          {myOrders.map((o) => {
            const si = statusInfo(o);
            const info = splitInfo(o);
            const incomplete = o.status === "aguardando";
            const isExp = exp === o.id;
            return (
              <div key={o.id} className={`bg-white rounded-2xl p-4 shadow-sm ${incomplete ? "ring-1 ring-rose-200" : ""}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-800">Pedido #{String(o.id).padStart(3, "0")}</span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${si.cls}`}>{si.label}</span>
                </div>
                {restaurant && <div className="text-xs text-slate-500 font-medium flex items-center gap-1 mb-1"><Store size={11} className="text-cyan-500" /> {restaurant.name}</div>}
                <div className="text-xs text-slate-400 flex items-center gap-1 mb-2"><MapPin size={11} /> {o.location} · <Clock size={11} /> {o.ts.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</div>
                <div className="space-y-1 mb-2">{o.items.map((i, k) => (<div key={k} className="flex justify-between text-sm"><span>{i.qty}× {i.name}</span><span className="text-slate-400">{money(i.price * i.qty)}</span></div>))}</div>
                <div className="flex justify-between pt-2 border-t border-slate-100 font-bold text-sm"><span>Total</span><span className="text-cyan-600">{money(o.total)}</span></div>

                {incomplete && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-slate-500 mb-1"><span>{info.paidCount} de {info.total} pagaram</span><span>{money(info.paidAmt)} de {money(o.total)}</span></div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${(info.paidAmt / o.total) * 100}%` }} /></div>
                    <button onClick={() => setExp(isExp ? null : o.id)} className="mt-3 w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2.5 rounded-xl active:scale-95 text-sm">{isExp ? "Ocultar" : "Completar pagamento"}</button>
                    {isExp && (
                      <div className="mt-3 space-y-2">
                        {o.splits.map((s, idx) => (
                          <div key={idx} className="border border-slate-200 rounded-xl p-2.5">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-sm font-medium flex items-center gap-1.5"><span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold">{idx + 1}</span> Amigo {idx + 1}</span>
                              {s.method ? <span className="text-xs text-emerald-600 font-medium flex items-center gap-1"><Check size={13} /> Pago · {s.method.id === "usdc" ? "USDC" : s.method.label}</span> : <span className="text-xs text-slate-400">{money(s.amount)}</span>}
                            </div>
                            {!s.method && (
                              <div className="grid grid-cols-4 gap-1.5">
                                {PAYMENTS.map((p) => { const Icon = p.icon; return (<button key={p.id} onClick={() => payShare(o.id, idx, p)} className="py-1.5 rounded-lg bg-slate-50 hover:bg-cyan-50 border border-slate-200 flex flex-col items-center gap-0.5 active:scale-90"><Icon size={15} className="text-slate-600" /><span className="text-[9px] text-slate-500 leading-none text-center">{p.id === "usdc" ? "USDC" : p.label}</span></button>); })}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {o.status === "producao" && <p className="mt-2 text-xs text-amber-600 flex items-center gap-1"><Clock size={12} /> Sendo preparado na cozinha</p>}
                {o.status === "entregue" && <p className="mt-2 text-xs text-emerald-600 flex items-center gap-1"><Check size={12} /> Entregue no seu lugar</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// =====================================================================
// RESTAURANTE
// =====================================================================
function Restaurante({ menu, setMenu, orders, setOrders, restaurant, setRestaurant }) {
  const [logged, setLogged] = useState(false);
  const [tab, setTab] = useState("pedidos");
  if (!logged) return <Login restaurant={restaurant} onLogin={() => setLogged(true)} />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3 min-w-0">
          <Img src={restaurant.logo || restaurant.cover} emoji={restaurant.emoji} className="w-11 h-11 rounded-xl shrink-0" />
          <div className="min-w-0"><h1 className="text-lg font-bold leading-tight truncate">{restaurant.name}</h1><p className="text-slate-400 text-xs">Painel do estabelecimento</p></div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <a href={waHref(restaurant.name)} target="_blank" rel="noopener noreferrer" className="text-emerald-600 text-sm flex items-center gap-1 font-medium"><MessageCircle size={16} /> <span className="hidden sm:inline">Suporte</span></a>
          <button onClick={() => setLogged(false)} className="text-slate-400 text-sm flex items-center gap-1"><LogOut size={16} /> <span className="hidden sm:inline">Sair</span></button>
        </div>
      </div>

      <div className="flex gap-1 bg-white rounded-xl p-1 mb-5 shadow-sm">
        {[
          { id: "pedidos", label: "Pedidos", icon: LayoutDashboard },
          { id: "cardapio", label: "Cardápio", icon: UtensilsCrossed },
          { id: "qrcodes", label: "QR Codes", icon: QrCode },
          { id: "kpis", label: "KPIs", icon: TrendingUp },
          { id: "perfil", label: "Perfil", icon: Store },
          { id: "config", label: "Config", icon: Settings },
        ].map((t) => {
          const Icon = t.icon;
          return (<button key={t.id} onClick={() => setTab(t.id)} className={`flex-1 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 transition ${tab === t.id ? "bg-cyan-500 text-white" : "text-slate-500"}`}><Icon size={16} /> <span className="hidden sm:inline">{t.label}</span></button>);
        })}
      </div>

      {tab === "pedidos" && <Pedidos orders={orders} setOrders={setOrders} />}
      {tab === "cardapio" && <Cardapio menu={menu} setMenu={setMenu} />}
      {tab === "qrcodes" && <QRCodes restaurant={restaurant} />}
      {tab === "kpis" && <Kpis orders={orders} menu={menu} />}
      {tab === "perfil" && <Perfil restaurant={restaurant} setRestaurant={setRestaurant} />}
      {tab === "config" && <Configuracoes restaurant={restaurant} />}
    </div>
  );
}

function Login({ restaurant, onLogin }) {
  const [email, setEmail] = useState("contato@quiosquedomar.com.br");
  const [pass, setPass] = useState("demo1234");
  return (
    <div className="max-w-sm mx-auto px-6 py-16">
      <div className="text-center mb-6"><div className="text-5xl mb-2">{restaurant.emoji}</div><h1 className="text-2xl font-bold">Acesso do estabelecimento</h1><p className="text-slate-400 text-sm">Entre para gerenciar seu cardápio e pedidos</p></div>
      <div className="bg-white rounded-2xl p-6 shadow-sm space-y-3">
        <div><label className="text-xs font-medium text-slate-500">E-mail</label><input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none" /></div>
        <div><label className="text-xs font-medium text-slate-500">Senha</label><input type="password" value={pass} onChange={(e) => setPass(e.target.value)} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none" /></div>
        <button onClick={onLogin} className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-3 rounded-xl transition active:scale-95">Entrar</button>
        <p className="text-xs text-slate-400 text-center">Credenciais de demo já preenchidas 👆</p>
      </div>
    </div>
  );
}

function Pedidos({ orders, setOrders }) {
  const [printOrder, setPrintOrder] = useState(null);
  const [filter, setFilter] = useState("todos");
  const setStatus = (id, status) => setOrders((o) => o.map((x) => x.id === id ? { ...x, status } : x));
  const aguardando = orders.filter((o) => o.status === "aguardando");
  const producao = orders.filter((o) => o.status === "producao");
  const entregues = orders.filter((o) => o.status === "entregue");

  const Card = ({ o }) => {
    const incomplete = o.status === "aguardando";
    const info = o.splits ? splitInfo(o) : null;
    const badge = incomplete ? { label: "Pagamento incompleto", cls: "bg-rose-100 text-rose-700" } : o.status === "producao" ? { label: "Em produção", cls: "bg-amber-100 text-amber-700" } : { label: "Entregue", cls: "bg-emerald-100 text-emerald-700" };
    return (
      <div className={`bg-white rounded-2xl p-4 shadow-sm ${incomplete ? "ring-1 ring-rose-200" : ""}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-slate-800">Pedido #{String(o.id).padStart(3, "0")}</span>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${badge.cls}`}>{badge.label}</span>
        </div>
        <div className="flex gap-3 flex-wrap text-xs text-slate-400 mb-3">
          <span className="flex items-center gap-1 font-semibold text-slate-600"><MapPin size={12} /> {o.location}</span>
          {o.customerName && <span className="flex items-center gap-1 font-semibold text-cyan-600"><User size={12} /> {o.customerName}</span>}
          <span className="flex items-center gap-1"><Clock size={12} /> {o.ts.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
        </div>
        <div className="space-y-1 mb-3">{o.items.map((i, k) => (<div key={k} className="flex justify-between text-sm"><span>{i.qty}× {i.name}</span><span className="text-slate-400">{money(i.price * i.qty)}</span></div>))}</div>
        {o.note && <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-2.5 py-2 text-xs mb-3 flex gap-1.5"><MessageSquare size={14} className="shrink-0 mt-0.5" /> <span><b>Obs:</b> {o.note}</span></div>}
        {incomplete && info && (
          <div className="bg-rose-50 border border-rose-200 rounded-lg p-2.5 mb-3">
            <div className="flex justify-between text-xs text-rose-700 font-medium mb-1"><span>{info.paidCount} de {info.total} pessoas pagaram</span><span>{money(info.paidAmt)} de {money(o.total)}</span></div>
            <div className="h-1.5 bg-rose-100 rounded-full overflow-hidden"><div className="h-full bg-rose-400 rounded-full" style={{ width: `${(info.paidAmt / o.total) * 100}%` }} /></div>
            <p className="text-[11px] text-rose-600 mt-1.5">⏳ Não enviado à cozinha até o pagamento ser concluído.</p>
          </div>
        )}
        <div className="flex justify-between items-center pt-3 border-t border-slate-100">
          <div>
            {incomplete ? <span className="font-bold text-rose-600">{money(info.paidAmt)}</span> : <span className="font-bold text-cyan-600">{money(o.total)}</span>}
            <span className="text-xs text-slate-400 ml-2">{incomplete ? `recebido · ${o.payment.label}` : `via ${o.payment.label}`}</span>
          </div>
          {!incomplete && (
            <div className="flex gap-2">
              <button onClick={() => setPrintOrder(o)} className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium flex items-center gap-1 active:scale-95"><Printer size={14} /> Imprimir</button>
              {o.status === "producao" && <button onClick={() => setStatus(o.id, "entregue")} className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-medium flex items-center gap-1 active:scale-95"><Check size={14} /> Entregue</button>}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {[{ id: "todos", label: "Todos", n: orders.length }, { id: "aguardando", label: "Aguardando", n: aguardando.length }, { id: "producao", label: "Em produção", n: producao.length }, { id: "entregue", label: "Entregue", n: entregues.length }].map((ff) => (
          <button key={ff.id} onClick={() => setFilter(ff.id)} className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${filter === ff.id ? "bg-slate-900 text-white" : "bg-white text-slate-600"}`}>{ff.label} <span className={filter === ff.id ? "text-white/60" : "text-slate-400"}>({ff.n})</span></button>
        ))}
      </div>
      {orders.length === 0 && <div className="text-center py-16 text-slate-400"><LayoutDashboard size={40} className="mx-auto mb-3 opacity-40" /><p>Nenhum pedido ainda.</p></div>}
      {(filter === "todos" || filter === "aguardando") && aguardando.length > 0 && (<><h2 className="font-semibold text-sm text-rose-600 mb-2 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" /> Aguardando pagamento ({aguardando.length})</h2><div className="space-y-3 mb-6">{aguardando.map((o) => <Card key={o.id} o={o} />)}</div></>)}
      {(filter === "todos" || filter === "producao") && producao.length > 0 && (<><h2 className="font-semibold text-sm text-slate-500 mb-2 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" /> Em produção ({producao.length})</h2><div className="space-y-3 mb-6">{producao.map((o) => <Card key={o.id} o={o} />)}</div></>)}
      {(filter === "todos" || filter === "entregue") && entregues.length > 0 && (<><h2 className="font-semibold text-sm text-slate-500 mb-2">Entregues ({entregues.length})</h2><div className="space-y-3 opacity-70">{entregues.map((o) => <Card key={o.id} o={o} />)}</div></>)}
      {orders.length > 0 && ((filter === "aguardando" && aguardando.length === 0) || (filter === "producao" && producao.length === 0) || (filter === "entregue" && entregues.length === 0)) && <div className="text-center py-12 text-slate-400 text-sm">Nenhum pedido neste status.</div>}
      {printOrder && <PrintModal order={printOrder} onClose={() => setPrintOrder(null)} />}
    </div>
  );
}

function PrintModal({ order, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-5 w-full max-w-xs" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 text-slate-500 text-sm mb-3"><Printer size={18} /> Enviado para impressora · Cozinha</div>
        <div className="bg-slate-50 rounded-xl p-4 font-mono text-xs leading-relaxed border border-dashed border-slate-300">
          <div className="text-center font-bold">QUIOSQUE DO MAR</div>
          <div className="text-center text-slate-400 mb-2">--- VIA COZINHA ---</div>
          <div>Pedido: #{String(order.id).padStart(3, "0")}</div>
          <div>Local: {order.location}</div>
          {order.customerName && <div>Cliente: {order.customerName}</div>}
          <div>{order.ts.toLocaleString("pt-BR")}</div>
          <div className="border-t border-dashed border-slate-300 my-2" />
          {order.items.map((i, k) => (<div key={k} className="flex justify-between"><span>{i.qty}x {i.name}</span></div>))}
          {order.note && (<><div className="border-t border-dashed border-slate-300 my-2" /><div className="font-bold">** OBSERVACAO **</div><div>{order.note}</div></>)}
          <div className="border-t border-dashed border-slate-300 my-2" />
          <div className="flex justify-between font-bold"><span>TOTAL</span><span>{money(order.total)}</span></div>
          <div>Pgto: {order.payment.label} (PAGO)</div>
        </div>
        <p className="text-xs text-slate-400 mt-3">Em produção, isto seria enviado via ESC/POS para a impressora térmica do caixa/cozinha.</p>
        <button onClick={onClose} className="mt-3 w-full bg-slate-900 text-white py-2.5 rounded-xl font-medium active:scale-95">Fechar</button>
      </div>
    </div>
  );
}

const ACC = (s) => String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
const HDR_ALIASES = {
  name: ["nome", "name", "item", "produto"],
  desc: ["descricao", "desc", "description"],
  cat: ["categoria", "cat"],
  sub: ["subcategoria", "subcat", "sub"],
  price: ["preco", "price", "valor"],
  oldPrice: ["preco promocional", "preco_promocional", "preco de", "preco_de", "promocao", "de"],
  measure: ["medida", "quantidade", "qtd", "measure"],
  unit: ["unidade", "unit", "un"],
  emoji: ["emoji", "icone"],
};
function parseCSV(text) {
  text = text.replace(/^\uFEFF/, "");
  const head = text.split(/\r?\n/)[0] || "";
  const delim = head.split(";").length > head.split(",").length ? ";" : ",";
  const rows = []; let row = [], field = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else q = false; } else field += c; }
    else if (c === '"') q = true;
    else if (c === delim) { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else if (c !== "\r") field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((x) => x.trim() !== ""));
}
function csvToItems(text) {
  const rows = parseCSV(text);
  if (rows.length < 2) return [];
  const header = rows[0].map(ACC);
  const col = {};
  Object.entries(HDR_ALIASES).forEach(([key, aliases]) => { const idx = header.findIndex((h) => aliases.includes(h)); if (idx !== -1) col[key] = idx; });
  const num = (v) => { const n = parseFloat(String(v).replace(/[^0-9,.-]/g, "").replace(",", ".")); return isNaN(n) ? 0 : n; };
  const out = [];
  for (let r = 1; r < rows.length; r++) {
    const get = (k) => (col[k] != null ? (rows[r][col[k]] || "").trim() : "");
    const name = get("name");
    if (!name) continue;
    const cat = Object.keys(CATS).find((k) => ACC(k) === ACC(get("cat"))) || "Alimentos";
    const sub = CATS[cat].find((s) => ACC(s) === ACC(get("sub"))) || CATS[cat][0];
    const price = num(get("price"));
    const old = num(get("oldPrice"));
    const measure = num(get("measure"));
    const ru = get("unit").toLowerCase();
    const unit = ["g", "kg", "ml", "l"].includes(ru) ? (ru === "l" ? "L" : ru) : "g";
    out.push({ id: Date.now() + r, name, desc: get("desc"), price, oldPrice: old > price ? old : undefined, measure: measure || undefined, unit, emoji: get("emoji") || "🍽️", photo: "", photo2: "", cat, sub });
  }
  return out;
}
function downloadMenuTemplate() {
  const headers = ["nome", "descricao", "categoria", "subcategoria", "preco", "preco_promocional", "medida", "unidade", "emoji"];
  const rows = [
    ["Caipirinha de Limão", "Cachaça, limão e açúcar", "Bebidas", "Drinks", "22", "28", "300", "ml", "🍹"],
    ["Porção de Camarão", "Camarão empanado", "Alimentos", "Porções", "68", "", "300", "g", "🍤"],
  ];
  const csv = "\uFEFF" + [headers, ...rows].map((r) => r.join(";")).join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "modelo-cardapio-pedeai.csv";
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function Cardapio({ menu, setMenu }) {
  const [editing, setEditing] = useState(null);
  const [catFilter, setCatFilter] = useState("Todos");
  const [imp, setImp] = useState(null);
  const blank = { name: "", desc: "", price: "", oldPrice: "", emoji: "🍽️", photo: "", photo2: "", measure: "", unit: "g", cat: "Bebidas", sub: "Drinks" };
  const list = catFilter === "Todos" ? menu : menu.filter((i) => i.cat === catFilter);
  const save = (item) => {
    const clean = { ...item, price: parseFloat(item.price) || 0, oldPrice: item.oldPrice ? parseFloat(item.oldPrice) : undefined, measure: item.measure ? parseFloat(item.measure) : undefined, unit: item.unit || "g" };
    if (item.id) setMenu((m) => m.map((x) => x.id === item.id ? clean : x));
    else setMenu((m) => [...m, { ...clean, id: Date.now() }]);
    setEditing(null);
  };
  const del = (id) => setMenu((m) => m.filter((x) => x.id !== id));
  const onImport = (e) => {
    const file = e.target.files?.[0]; e.target.value = "";
    if (!file) return;
    const r = new FileReader();
    r.onload = () => setImp(csvToItems(String(r.result || "")));
    r.readAsText(file, "utf-8");
  };
  const applyImport = (mode) => {
    if (!imp) return;
    if (mode === "replace") setMenu(imp);
    else setMenu((m) => [...m, ...imp]);
    setImp(null);
  };

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
        <h2 className="font-semibold text-slate-600">{list.length} {list.length === 1 ? "item" : "itens"}{catFilter !== "Todos" ? ` em ${catFilter}` : " no cardápio"}</h2>
        <div className="flex gap-2">
          <button onClick={downloadMenuTemplate} className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium px-3 py-2 rounded-xl flex items-center gap-1 active:scale-95"><Download size={15} /> <span className="hidden sm:inline">Modelo</span></button>
          <label className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium px-3 py-2 rounded-xl flex items-center gap-1 active:scale-95 cursor-pointer"><Upload size={15} /> <span className="hidden sm:inline">Importar</span><input type="file" accept=".csv,text/csv" onChange={onImport} className="hidden" /></label>
          <button onClick={() => setEditing({ ...blank })} className="bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-medium px-3 py-2 rounded-xl flex items-center gap-1 active:scale-95"><Plus size={16} /> Novo item</button>
        </div>
      </div>
      <div className="flex gap-2 mb-3 overflow-x-auto">
        {["Todos", ...Object.keys(CATS)].map((c) => (
          <button key={c} onClick={() => setCatFilter(c)} className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${catFilter === c ? "bg-slate-900 text-white" : "bg-white text-slate-600"}`}>{c === "Todos" ? "Todos" : `${CAT_EMOJI[c]} ${c}`}</button>
        ))}
      </div>
      <div className="space-y-2">
        {list.map((i) => (
          <div key={i.id} className="bg-white rounded-xl p-2.5 flex items-center gap-3 shadow-sm">
            <Img src={i.photo} emoji={i.emoji} gradient={catGrad(i.cat)} className="w-12 h-12 rounded-lg shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{i.name} {isPromo(i) && <span className="text-[10px] bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded-full ml-1">-{pct(i)}%</span>}</p>
              <p className="text-xs text-slate-400">{i.cat} › {i.sub} · {money(i.price)}{isPromo(i) && <span className="line-through ml-1 text-slate-300">{money(i.oldPrice)}</span>}{i.measure ? ` · ${String(i.measure).replace(".", ",")} ${i.unit}` : ""}</p>
            </div>
            <button onClick={() => setEditing({ ...i, price: String(i.price), oldPrice: i.oldPrice ? String(i.oldPrice) : "", measure: i.measure ? String(i.measure) : "", unit: i.unit || "g" })} className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 active:scale-90"><Edit3 size={15} /></button>
            <button onClick={() => del(i.id)} className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500 active:scale-90"><Trash2 size={15} /></button>
          </div>
        ))}
      </div>
      {editing && <ItemEditor item={editing} onSave={save} onClose={() => setEditing(null)} />}
      {imp && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4" onClick={() => setImp(null)}>
          <div className="bg-white rounded-t-3xl sm:rounded-2xl p-5 w-full max-w-md max-h-[88vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3"><h2 className="font-bold text-lg flex items-center gap-2"><FileSpreadsheet size={20} className="text-cyan-500" /> Importar cardápio</h2><button onClick={() => setImp(null)}><X size={22} className="text-slate-400" /></button></div>
            {imp.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-slate-500 text-sm">Nenhum item válido encontrado na planilha.</p>
                <p className="text-[11px] text-slate-400 mt-2">A 1ª linha precisa ter os títulos das colunas (nome, categoria, preco…). Baixe o modelo se precisar.</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-slate-600 mb-3"><b className="text-cyan-600">{imp.length}</b> {imp.length === 1 ? "item encontrado" : "itens encontrados"}:</p>
                <div className="space-y-1.5 max-h-60 overflow-y-auto mb-4">
                  {imp.map((i) => (
                    <div key={i.id} className="flex items-center justify-between text-sm border border-slate-100 rounded-lg px-2.5 py-1.5">
                      <span className="truncate"><span className="mr-1">{i.emoji}</span>{i.name} <span className="text-[11px] text-slate-400">· {i.cat} › {i.sub}</span></span>
                      <span className="font-semibold text-slate-700 shrink-0 pl-2">{money(i.price)}</span>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => applyImport("append")} className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-3 rounded-xl active:scale-95 text-sm">Adicionar ao cardápio</button>
                  <button onClick={() => applyImport("replace")} className="bg-slate-900 text-white font-semibold py-3 rounded-xl active:scale-95 text-sm">Substituir tudo</button>
                </div>
                <p className="text-[11px] text-slate-400 mt-2 text-center">As fotos são adicionadas depois, item a item, pelo editor.</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ItemEditor({ item, onSave, onClose }) {
  const [f, setF] = useState(item);
  const upd = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const emojis = ["🍱", "🍹", "🍺", "🥂", "🥤", "💧", "🥥", "🍊", "🍤", "🍟", "🍲", "🥩", "🥗", "🍇", "🥜", "🍿", "🥔", "🍦", "🍧", "🍨", "🍫", "🍩", "🍰", "☕"];
  const onFile = (key) => (e) => { const file = e.target.files?.[0]; if (!file) return; const r = new FileReader(); r.onload = () => upd(key, r.result); r.readAsDataURL(file); };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4" onClick={onClose}>
      <div className="bg-white rounded-t-3xl sm:rounded-2xl p-5 w-full max-w-md max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4"><h2 className="font-bold text-lg">{item.id ? "Editar item" : "Novo item"}</h2><button onClick={onClose}><X size={22} className="text-slate-400" /></button></div>

        <label className="text-xs font-medium text-slate-500">Fotos do produto <span className="text-slate-400 font-normal">(até 2)</span></label>
        <div className="grid grid-cols-2 gap-3 mt-1 mb-1">
          {["photo", "photo2"].map((key, n) => (
            <div key={key} className="flex flex-col gap-2">
              <Img src={f[key]} emoji={f.emoji} gradient={catGrad(f.cat)} className="w-full h-24 rounded-xl" />
              <label className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium px-2 py-2 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition"><Camera size={14} /> Foto {n + 1}<input type="file" accept="image/*" onChange={onFile(key)} className="hidden" /></label>
              {f[key] && <button onClick={() => upd(key, "")} className="text-[11px] text-slate-400 underline">remover</button>}
            </div>
          ))}
        </div>
        <p className="text-[11px] text-slate-400 mb-3">A 1ª foto é a capa. Com 2 fotos, o cliente desliza entre elas no cardápio.</p>

        <label className="text-xs font-medium text-slate-500">Ícone (usado se não houver foto)</label>
        <div className="flex gap-1.5 flex-wrap mt-1 mb-3">{emojis.map((e) => (<button key={e} onClick={() => upd("emoji", e)} className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center ${f.emoji === e ? "bg-cyan-100 ring-2 ring-cyan-500" : "bg-slate-100"}`}>{e}</button>))}</div>

        <label className="text-xs font-medium text-slate-500">Nome</label>
        <input value={f.name} onChange={(e) => upd("name", e.target.value)} className="w-full mt-1 mb-3 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none" placeholder="Ex: Caipirinha de Limão" />

        <label className="text-xs font-medium text-slate-500">Descrição</label>
        <textarea value={f.desc} onChange={(e) => upd("desc", e.target.value)} rows={2} className="w-full mt-1 mb-3 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none resize-none" placeholder="Ingredientes, porção…" />

        <label className="text-xs font-medium text-slate-500">Quantidade / medida (mostrada ao cliente)</label>
        <div className="grid grid-cols-2 gap-3 mt-1 mb-3">
          <input value={f.measure} onChange={(e) => upd("measure", e.target.value.replace(/[^0-9.]/g, ""))} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none" placeholder="Ex: 300 (deixe vazio em combos)" inputMode="decimal" />
          <select value={f.unit} onChange={(e) => upd("unit", e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white outline-none">
            <option value="g">gramas (g)</option>
            <option value="kg">quilos (kg)</option>
            <option value="ml">mililitros (ml)</option>
            <option value="L">litros (L)</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div><label className="text-xs font-medium text-slate-500">Preço (R$)</label><input value={f.price} onChange={(e) => upd("price", e.target.value.replace(/[^0-9.]/g, ""))} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none" placeholder="0,00" inputMode="decimal" /></div>
          <div><label className="text-xs font-medium text-slate-500">Preço “de” (promoção)</label><input value={f.oldPrice} onChange={(e) => upd("oldPrice", e.target.value.replace(/[^0-9.]/g, ""))} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none" placeholder="opcional" inputMode="decimal" /></div>
        </div>
        <p className="text-[11px] text-slate-400 mb-3">💡 Preencha o “de” maior que o preço para o item entrar nas <b>Ofertas do dia</b>.</p>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div><label className="text-xs font-medium text-slate-500">Categoria</label><select value={f.cat} onChange={(e) => { upd("cat", e.target.value); upd("sub", CATS[e.target.value][0]); }} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white outline-none">{Object.keys(CATS).map((c) => <option key={c}>{c}</option>)}</select></div>
          <div><label className="text-xs font-medium text-slate-500">Subcategoria</label><select value={f.sub} onChange={(e) => upd("sub", e.target.value)} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white outline-none">{CATS[f.cat].map((s) => <option key={s}>{s}</option>)}</select></div>
        </div>

        <button disabled={!f.name || !f.price} onClick={() => onSave(f)} className="w-full bg-cyan-500 disabled:bg-slate-300 text-white font-semibold py-3 rounded-xl active:scale-95">Salvar item</button>
      </div>
    </div>
  );
}

function Perfil({ restaurant, setRestaurant }) {
  const [f, setF] = useState(restaurant);
  const [saved, setSaved] = useState(false);
  const upd = (k, v) => { setF((p) => ({ ...p, [k]: v })); setSaved(false); };
  const onCover = (e) => { const file = e.target.files?.[0]; if (!file) return; const r = new FileReader(); r.onload = () => upd("cover", r.result); r.readAsDataURL(file); };
  const onLogo = (e) => { const file = e.target.files?.[0]; if (!file) return; const r = new FileReader(); r.onload = () => upd("logo", r.result); r.readAsDataURL(file); };
  const save = () => { setRestaurant(f); setSaved(true); };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h2 className="font-semibold text-slate-600 mb-3">Como o cliente vê seu cardápio</h2>
        <div className="relative rounded-2xl overflow-hidden">
          <Img src={f.cover} emoji={f.emoji} gradient="bg-gradient-to-br from-cyan-400 to-blue-600" className="w-full h-40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          {f.logo && <div className="absolute top-3 left-3 w-14 h-14 rounded-2xl bg-white/90 backdrop-blur shadow-lg overflow-hidden ring-2 ring-white/70"><img src={f.logo} alt="" className="w-full h-full object-cover" /></div>}
          <div className="absolute bottom-0 p-4 text-white">
            <h3 className="text-xl font-extrabold">{f.name || "Nome do local"}</h3>
            <p className="text-white/90 text-xs">{f.tagline}</p>
            <div className="text-[11px] text-white/80 mt-1 space-y-0.5">
              <p className="flex items-center gap-1"><MapPin size={11} /> {f.address}</p>
              <p className="flex items-center gap-1"><Clock size={11} /> {f.hours}</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-3">
          <label className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium px-3 py-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition"><Camera size={16} /> Foto do local<input type="file" accept="image/*" onChange={onCover} className="hidden" /></label>
          <label className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium px-3 py-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition"><Store size={16} /> Logo<input type="file" accept="image/*" onChange={onLogo} className="hidden" /></label>
        </div>
        {f.logo && <button onClick={() => upd("logo", "")} className="text-[11px] text-slate-400 underline mt-2">remover logo</button>}
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
        <div><label className="text-xs font-medium text-slate-500">Nome do estabelecimento</label><input value={f.name} onChange={(e) => upd("name", e.target.value)} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none" /></div>
        <div><label className="text-xs font-medium text-slate-500">Frase de destaque</label><input value={f.tagline} onChange={(e) => upd("tagline", e.target.value)} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none" placeholder="Ex: Drinks autorais e pé na areia 🌊" /></div>
        <div><label className="text-xs font-medium text-slate-500">Descrição</label><textarea value={f.desc} onChange={(e) => upd("desc", e.target.value)} rows={3} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none resize-none" /></div>
        <div><label className="text-xs font-medium text-slate-500">Endereço</label><input value={f.address} onChange={(e) => upd("address", e.target.value)} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none" /></div>
        <div><label className="text-xs font-medium text-slate-500">Horário de atendimento</label><input value={f.hours} onChange={(e) => upd("hours", e.target.value)} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none" /></div>

        <div className="pt-2 mt-1 border-t border-slate-100">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Contato e redes</p>
          <div className="space-y-3">
            <div><label className="text-xs font-medium text-slate-500 flex items-center gap-1"><Phone size={12} className="text-cyan-500" /> Telefone</label><input value={f.phone || ""} onChange={(e) => upd("phone", e.target.value)} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none" placeholder="(00) 0000-0000" /></div>
            <div><label className="text-xs font-medium text-slate-500 flex items-center gap-1"><Mail size={12} className="text-cyan-500" /> E-mail</label><input value={f.email || ""} onChange={(e) => upd("email", e.target.value)} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none" placeholder="contato@seurestaurante.com.br" /></div>
            <div><label className="text-xs font-medium text-slate-500 flex items-center gap-1"><Globe size={12} className="text-cyan-500" /> Website</label><input value={f.website || ""} onChange={(e) => upd("website", e.target.value)} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none" placeholder="www.seurestaurante.com.br" /></div>
            <div><label className="text-xs font-medium text-slate-500 flex items-center gap-1"><MessageCircle size={12} className="text-emerald-500" /> WhatsApp</label><input value={f.whatsapp || ""} onChange={(e) => upd("whatsapp", e.target.value)} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none" placeholder="5547999990000" /></div>
            <div><label className="text-xs font-medium text-slate-500 flex items-center gap-1"><Instagram size={12} className="text-pink-500" /> Instagram</label><input value={f.instagram || ""} onChange={(e) => upd("instagram", e.target.value)} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none" placeholder="@seurestaurante" /></div>
          </div>
        </div>

        <button onClick={save} className={`w-full font-semibold py-3 rounded-xl active:scale-95 transition flex items-center justify-center gap-2 ${saved ? "bg-emerald-500 text-white" : "bg-cyan-500 hover:bg-cyan-600 text-white"}`}>{saved ? <><Check size={18} /> Perfil salvo!</> : "Salvar perfil"}</button>
        <p className="text-xs text-slate-400 text-center">As mudanças aparecem na hora no cardápio do cliente (acessível pelo site, ao abrir o estabelecimento).</p>
      </div>
    </div>
  );
}

function Configuracoes({ restaurant }) {
  const [pw, setPw] = useState({ cur: "", nova: "", conf: "" });
  const [pwMsg, setPwMsg] = useState(null);
  const [pr, setPr] = useState({ auto: true, conn: "rede", ip: "192.168.0.50", port: "9100", model: "Epson TM-T20" });
  const [prMsg, setPrMsg] = useState(null);
  const updPw = (k, v) => { setPw((p) => ({ ...p, [k]: v })); setPwMsg(null); };
  const updPr = (k, v) => { setPr((p) => ({ ...p, [k]: v })); setPrMsg(null); };

  const savePw = () => {
    if (!pw.cur || !pw.nova || !pw.conf) return setPwMsg({ ok: false, t: "Preencha todos os campos." });
    if (pw.nova.length < 6) return setPwMsg({ ok: false, t: "A nova senha precisa ter ao menos 6 caracteres." });
    if (pw.nova !== pw.conf) return setPwMsg({ ok: false, t: "A confirmação não confere." });
    setPwMsg({ ok: true, t: "Senha alterada com sucesso!" });
    setPw({ cur: "", nova: "", conf: "" });
  };
  const testPrint = () => { setPrMsg({ ok: true, t: "Comando de teste enviado à impressora ✅" }); };
  const savePr = () => { setPrMsg({ ok: true, t: "Configuração de impressora salva!" }); };

  return (
    <div className="space-y-4">
      {/* Senha */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h2 className="font-semibold text-slate-600 mb-3 flex items-center gap-1.5"><Lock size={16} className="text-cyan-500" /> Alterar senha</h2>
        <div className="space-y-3">
          <div><label className="text-xs font-medium text-slate-500">Senha atual</label><input type="password" value={pw.cur} onChange={(e) => updPw("cur", e.target.value)} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none" /></div>
          <div><label className="text-xs font-medium text-slate-500">Nova senha</label><input type="password" value={pw.nova} onChange={(e) => updPw("nova", e.target.value)} placeholder="Mínimo 6 caracteres" className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none" /></div>
          <div><label className="text-xs font-medium text-slate-500">Confirmar nova senha</label><input type="password" value={pw.conf} onChange={(e) => updPw("conf", e.target.value)} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none" /></div>
        </div>
        {pwMsg && <p className={`text-xs mt-2 ${pwMsg.ok ? "text-emerald-600" : "text-rose-600"}`}>{pwMsg.t}</p>}
        <button onClick={savePw} className="mt-3 w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-3 rounded-xl active:scale-95 transition">Alterar senha</button>
      </div>

      {/* Impressora */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h2 className="font-semibold text-slate-600 mb-3 flex items-center gap-1.5"><Printer size={16} className="text-cyan-500" /> Integração com impressora</h2>

        <div className="flex items-center justify-between py-2">
          <div><p className="text-sm font-medium text-slate-700">Impressão automática</p><p className="text-xs text-slate-400">Imprime o pedido ao confirmar o pagamento</p></div>
          <button onClick={() => updPr("auto", !pr.auto)} className={`w-11 h-6 rounded-full transition relative shrink-0 ${pr.auto ? "bg-cyan-500" : "bg-slate-300"}`}><span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${pr.auto ? "left-5" : "left-0.5"}`} /></button>
        </div>

        <div className="mt-2">
          <label className="text-xs font-medium text-slate-500">Tipo de conexão</label>
          <select value={pr.conn} onChange={(e) => updPr("conn", e.target.value)} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white outline-none">
            <option value="rede">Rede / Wi-Fi (ESC/POS)</option>
            <option value="usb">USB</option>
            <option value="nuvem">Serviço em nuvem (PrintNode / QZ Tray)</option>
          </select>
        </div>

        {pr.conn === "rede" && (
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div><label className="text-xs font-medium text-slate-500 flex items-center gap-1"><Wifi size={12} /> IP da impressora</label><input value={pr.ip} onChange={(e) => updPr("ip", e.target.value)} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none" placeholder="192.168.0.50" /></div>
            <div><label className="text-xs font-medium text-slate-500">Porta</label><input value={pr.port} onChange={(e) => updPr("port", e.target.value)} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none" placeholder="9100" /></div>
          </div>
        )}

        <div className="mt-3"><label className="text-xs font-medium text-slate-500">Modelo da impressora</label><input value={pr.model} onChange={(e) => updPr("model", e.target.value)} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none" placeholder="Ex: Epson TM-T20, Elgin i9" /></div>

        {prMsg && <p className={`text-xs mt-2 ${prMsg.ok ? "text-emerald-600" : "text-rose-600"}`}>{prMsg.t}</p>}
        <div className="flex gap-2 mt-3">
          <button onClick={testPrint} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 rounded-xl active:scale-95 transition text-sm">Imprimir teste</button>
          <button onClick={savePr} className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-3 rounded-xl active:scale-95 transition text-sm">Salvar</button>
        </div>
      </div>

      {/* Suporte */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
        <h2 className="font-semibold text-emerald-900 mb-1 flex items-center gap-1.5"><MessageCircle size={16} /> Suporte</h2>
        <p className="text-sm text-emerald-800/80 mb-3">Precisa de ajuda, tem dúvidas ou quer agendar manutenção? Fale com nosso time pelo WhatsApp.</p>
        <a href={waHref(restaurant.name)} target="_blank" rel="noopener noreferrer" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl active:scale-95 transition flex items-center justify-center gap-2"><MessageCircle size={18} /> Falar com o suporte</a>
        <p className="text-[11px] text-emerald-700/60 mt-2 text-center">Número comercial a definir.</p>
      </div>
    </div>
  );
}

function Kpis({ orders, menu }) {
  const [open, setOpen] = useState(null);
  const [period, setPeriod] = useState("hoje");
  const [itemCat, setItemCat] = useState("Todos");

  const startToday = new Date(); startToday.setHours(0, 0, 0, 0);
  const now = Date.now();
  const minTs = period === "hoje" ? startToday.getTime() : period === "7d" ? now - 7 * 86400000 : period === "30d" ? now - 30 * 86400000 : 0;
  const data = orders.filter((o) => o.ts.getTime() >= minTs && o.status !== "aguardando");

  const producao = data.filter((o) => o.status === "producao").length;
  const fat = data.reduce((s, o) => s + o.total, 0);
  const ticket = data.length ? fat / data.length : 0;

  const byPay = PAYMENTS.map((p) => {
    let total = 0, count = 0;
    const entries = [];
    data.forEach((o) => {
      if (o.splits) {
        const shares = o.splits.filter((s) => s.method && s.method.id === p.id);
        if (shares.length) {
          const amt = shares.reduce((s, x) => s + x.amount, 0);
          total += amt; count += shares.length;
          entries.push({ o, amount: amt, parts: shares.length, people: o.splits.length, split: true });
        }
      } else if (o.payment.id === p.id) {
        total += o.total; count += 1;
        entries.push({ o, amount: o.total, split: false });
      }
    });
    entries.sort((a, b) => b.o.ts - a.o.ts);
    return { ...p, total, count, entries, share: fat ? (total / fat) * 100 : 0 };
  });
  const maxPay = Math.max(...byPay.map((p) => p.total), 1);

  // Categoria de cada item (resolvida pelo cardápio)
  const catOf = (name) => (menu.find((m) => m.name === name) || {}).cat || "Outros";

  // Itens mais vendidos — filtro por categoria + dois rankings (quantidade e faturamento)
  const itemMap = {};
  data.forEach((o) => o.items.forEach((it) => {
    const c = catOf(it.name);
    if (itemCat !== "Todos" && c !== itemCat) return;
    const e = itemMap[it.name] || (itemMap[it.name] = { name: it.name, qty: 0, rev: 0, cat: c });
    e.qty += it.qty; e.rev += it.qty * it.price;
  }));
  const ranked = Object.values(itemMap);
  const topByQty = [...ranked].sort((a, b) => b.qty - a.qty).slice(0, 5);
  const topByRev = [...ranked].sort((a, b) => b.rev - a.rev).slice(0, 5);
  const maxQty = Math.max(...topByQty.map((i) => i.qty), 1);
  const maxRev = Math.max(...topByRev.map((i) => i.rev), 1);

  const RankList = ({ list, max, metric }) => (
    list.length === 0 ? (
      <p className="text-slate-400 text-sm text-center py-4">Sem vendas nesta categoria no período.</p>
    ) : (
      <div className="space-y-3">
        {list.map((it, k) => {
          const primary = metric === "qty" ? `${it.qty} un` : money(it.rev);
          const secondary = metric === "qty" ? money(it.rev) : `${it.qty} un`;
          const val = metric === "qty" ? it.qty : it.rev;
          return (
            <div key={it.name}>
              <div className="flex justify-between items-center text-sm mb-1">
                <span className="flex items-center gap-2 text-slate-700 font-medium"><span className="w-6 text-center text-base">{MEDAL[k] || `${k + 1}º`}</span> {it.name}</span>
                <span className="text-slate-500 text-xs shrink-0 pl-2"><b className="text-slate-800 text-sm">{primary}</b> · {secondary}</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden ml-8"><div className={`h-full rounded-full transition-all ${metric === "qty" ? "bg-amber-400" : "bg-emerald-500"}`} style={{ width: `${(val / max) * 100}%` }} /></div>
            </div>
          );
        })}
      </div>
    )
  );

  // Vendas por categoria (gráfico de pizza)
  const catSales = {};
  data.forEach((o) => o.items.forEach((it) => { const c = catOf(it.name); catSales[c] = (catSales[c] || 0) + it.qty * it.price; }));
  const catEntries = Object.entries(catSales).sort((a, b) => b[1] - a[1]);
  const catTotal = catEntries.reduce((s, [, v]) => s + v, 0) || 1;
  const CIRC = 2 * Math.PI * 42;
  let _acc = 0;
  const catSegs = catEntries.map(([cat, val]) => { const frac = val / catTotal; const len = frac * CIRC; const seg = { cat, val, frac, color: CAT_COLORS[cat] || "#94a3b8", dash: `${len} ${CIRC - len}`, offset: -_acc }; _acc += len; return seg; });

  const periods = [{ id: "hoje", label: "Hoje" }, { id: "7d", label: "7 dias" }, { id: "30d", label: "30 dias" }, { id: "tudo", label: "Tudo" }];
  const Stat = ({ label, value, color }) => (<div className="bg-white rounded-2xl p-4 shadow-sm"><p className="text-xs text-slate-400">{label}</p><p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p></div>);

  return (
    <div>
      <div className="flex gap-1 bg-white rounded-xl p-1 mb-4 shadow-sm">
        {periods.map((pr) => (<button key={pr.id} onClick={() => { setPeriod(pr.id); setOpen(null); setItemCat("Todos"); }} className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${period === pr.id ? "bg-cyan-500 text-white" : "text-slate-500"}`}>{pr.label}</button>))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <Stat label="Faturamento" value={money(fat)} color="text-cyan-600" />
        <Stat label="Pedidos" value={data.length} color="text-slate-800" />
        <Stat label="Ticket médio" value={money(ticket)} color="text-violet-600" />
        <Stat label="Em produção" value={producao} color="text-amber-500" />
      </div>

      {data.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 shadow-sm text-center text-slate-400">Nenhum pedido neste período.</div>
      ) : (
        <>
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm mb-4">
            <h2 className="font-semibold text-sm text-slate-600 mb-4">Vendas por categoria</h2>
            <div className="flex items-center gap-5">
              <svg viewBox="0 0 100 100" className="w-32 h-32 shrink-0 -rotate-90">
                {catSegs.map((s) => (<circle key={s.cat} cx="50" cy="50" r="42" fill="none" stroke={s.color} strokeWidth="16" strokeDasharray={s.dash} strokeDashoffset={s.offset} />))}
              </svg>
              <div className="flex-1 space-y-2 min-w-0">
                {catSegs.map((s) => (
                  <div key={s.cat} className="flex items-center justify-between text-sm gap-2">
                    <span className="flex items-center gap-2 text-slate-700 min-w-0"><span className="w-3 h-3 rounded-sm shrink-0" style={{ background: s.color }} /> <span className="truncate">{CAT_EMOJI[s.cat] || ""} {s.cat}</span></span>
                    <span className="text-slate-500 text-xs shrink-0"><b className="text-slate-800 text-sm">{(s.frac * 100).toFixed(0)}%</b> · {money(s.val)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm mb-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-sm text-slate-600">Vendas por método de pagamento</h2>
              <span className="text-[11px] text-slate-400">toque para detalhar</span>
            </div>
            <div className="divide-y divide-slate-100">
              {byPay.map((p) => {
                const Icon = p.icon;
                const isOpen = open === p.id;
                return (
                  <div key={p.id} className="py-3 first:pt-1">
                    <button onClick={() => setOpen(isOpen ? null : p.id)} className="w-full text-left">
                      <div className="flex justify-between items-center text-sm mb-1.5">
                        <span className="flex items-center gap-2 text-slate-700 font-medium">
                          <span className={`w-7 h-7 rounded-full ${p.color} text-white flex items-center justify-center shrink-0`}><Icon size={14} /></span>
                          {p.label}<span className="text-slate-400 font-normal hidden sm:inline">· {p.count} pgto{p.count !== 1 ? "s" : ""}</span>
                        </span>
                        <span className="flex items-center gap-2"><span className="font-bold">{money(p.total)}</span><ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} /></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full ${p.color} rounded-full transition-all`} style={{ width: `${(p.total / maxPay) * 100}%` }} /></div>
                        <span className="text-[11px] text-slate-400 w-9 text-right">{p.share.toFixed(0)}%</span>
                      </div>
                    </button>
                    {isOpen && (
                      <div className="mt-3 space-y-2">
                        {p.entries.length === 0 ? (
                          <p className="text-xs text-slate-400 py-2 text-center">Nenhum pedido pago com {p.label} neste período.</p>
                        ) : p.entries.map((e, k) => (
                          <div key={k} className="bg-slate-50 rounded-xl p-3 flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-700">Pedido #{String(e.o.id).padStart(3, "0")}{e.o.customerName ? ` · ${e.o.customerName}` : ""}</p>
                              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><MapPin size={11} /> {e.o.location} · <Clock size={11} /> {e.o.ts.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</p>
                              <div className="mt-1.5">
                                {e.split
                                  ? <span className="inline-flex items-center gap-1 text-[11px] bg-pink-100 text-pink-700 font-medium px-2 py-0.5 rounded-full"><Users size={10} /> Conta dividida · {e.parts} de {e.people} pessoa{e.people !== 1 ? "s" : ""}</span>
                                  : <span className="inline-flex items-center gap-1 text-[11px] bg-slate-200 text-slate-600 font-medium px-2 py-0.5 rounded-full">Pagamento único · {e.o.payment.label}</span>}
                              </div>
                            </div>
                            <div className="text-right shrink-0"><p className="font-bold text-slate-800">{money(e.amount)}</p>{e.split && <p className="text-[10px] text-slate-400">de {money(e.o.total)}</p>}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm">
            <h2 className="font-semibold text-sm text-slate-600 mb-3">Itens mais vendidos</h2>
            <div className="flex gap-2 mb-4 overflow-x-auto">
              {["Todos", ...Object.keys(CATS)].map((c) => (
                <button key={c} onClick={() => setItemCat(c)} className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${itemCat === c ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"}`}>{c === "Todos" ? "Todos" : `${CAT_EMOJI[c]} ${c}`}</button>
              ))}
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2 flex items-center gap-1.5"><Users size={12} className="text-amber-500" /> Por quantidade</p>
            <RankList list={topByQty} max={maxQty} metric="qty" />
            <div className="h-px bg-slate-100 my-4" />
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2 flex items-center gap-1.5"><TrendingUp size={12} className="text-emerald-500" /> Por faturamento</p>
            <RankList list={topByRev} max={maxRev} metric="rev" />
          </div>
        </>
      )}
    </div>
  );
}

// =====================================================================
// ADMIN (plataforma PedeAí)
// =====================================================================
function Admin({ orders, establishments, setEstablishments, restaurant, setRestaurant }) {
  const [logged, setLogged] = useState(false);
  const [tab, setTab] = useState("dashboard");
  const [reg, setReg] = useState(null);
  const [period, setPeriod] = useState("mes");
  const [del, setDel] = useState(null);
  const nowD = new Date();
  const [month, setMonth] = useState(`${nowD.getFullYear()}-${String(nowD.getMonth() + 1).padStart(2, "0")}`);
  if (!logged) return <AdminLogin onLogin={() => setLogged(true)} />;

  // opções do dropdown: últimos 12 meses
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - i);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const raw = d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    return { value, label: raw.charAt(0).toUpperCase() + raw.slice(1) };
  });

  // sazonalidade de praia (verão alto, inverno baixo), normalizada para o mês atual = 1
  const SEASON = [1.9, 1.8, 1.5, 1.1, 0.9, 0.8, 0.95, 0.9, 0.85, 1.0, 1.3, 2.0];
  const seasonFactor = (mIdx) => SEASON[mIdx] / SEASON[nowD.getMonth()];

  // recorte de período: o "ao vivo" usa pedidos reais; os demais escalam o total mensal
  const pmeta = ADMIN_PERIODS.find((p) => p.id === period) || ADMIN_PERIODS[3];
  const startToday = new Date(); startToday.setHours(0, 0, 0, 0);
  const now = Date.now();
  const inMes = period === "mes";
  const [my, mm] = month.split("-").map(Number);
  const monthStart = new Date(my, mm - 1, 1).getTime();
  const monthEnd = new Date(my, mm, 1).getTime();
  const sinceTs = period === "dia" ? startToday.getTime() : now - pmeta.days * 86400000;

  const ests = establishments.map((e) => {
    if (e.id === "live") {
      const lv = inMes ? computeLive(orders, monthStart, monthEnd) : computeLive(orders, sinceTs);
      return { ...e, ...lv, feePct: restaurant.platformFee || 0, phone: restaurant.phone, email: restaurant.email, website: restaurant.website, whatsapp: restaurant.whatsapp, instagram: restaurant.instagram };
    }
    let f;
    if (inMes) { const estSince = new Date(e.since).getTime(); f = monthEnd <= estSince ? 0 : seasonFactor(mm - 1); }
    else f = pmeta.factor;
    return { ...e, orders: Math.round(e.orders * f), revenue: e.revenue * f, byPay: Object.fromEntries(Object.entries(e.byPay || {}).map(([k, v]) => [k, v * f])) };
  });
  // base mensal estável (independe do período) — usada na aba de Taxas
  const liveFull = computeLive(orders);
  const estsMes = establishments.map((e) => e.id === "live" ? { ...e, ...liveFull, feePct: restaurant.platformFee || 0 } : e);

  const PeriodPills = () => (
    <div className="mb-4">
      <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm">
        {ADMIN_PERIODS.map((p) => (<button key={p.id} onClick={() => setPeriod(p.id)} className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${period === p.id ? "bg-cyan-500 text-white" : "text-slate-500"}`}>{p.label}</button>))}
      </div>
      {inMes && (
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs text-slate-400 shrink-0">Mês:</span>
          <select value={month} onChange={(e) => setMonth(e.target.value)} className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white outline-none focus:border-cyan-500">
            {monthOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      )}
    </div>
  );

  const ativos = ests.filter((e) => e.status === "ativo");
  const gmv = ests.reduce((s, e) => s + e.revenue, 0);
  const feeRev = ests.reduce((s, e) => s + e.revenue * (e.feePct || 0) / 100, 0);
  const totalOrders = ests.reduce((s, e) => s + e.orders, 0);
  const ticket = totalOrders ? gmv / totalOrders : 0;
  const byPay = { credito: 0, debito: 0, pix: 0, usdc: 0 };
  ests.forEach((e) => Object.keys(byPay).forEach((k) => { byPay[k] += (e.byPay?.[k] || 0); }));
  const payTotal = Object.values(byPay).reduce((s, v) => s + v, 0) || 1;
  const usdcShare = (byPay.usdc / payTotal) * 100;
  const top = [...ests].filter((e) => e.revenue > 0).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  const maxRev = Math.max(...top.map((e) => e.revenue), 1);

  const setFee = (id, v) => {
    const val = Math.max(0, Math.min(30, parseFloat(String(v).replace(",", ".")) || 0));
    setEstablishments((list) => list.map((e) => e.id === id ? { ...e, feePct: val } : e));
    if (id === "live") setRestaurant({ ...restaurant, platformFee: val });
  };
  const addEst = (data) => {
    setEstablishments((list) => [...list, { id: "e" + Date.now(), status: "ativo", since: new Date().toISOString().slice(0, 10), orders: 0, revenue: 0, byPay: { credito: 0, debito: 0, pix: 0, usdc: 0 }, ...data }]);
    setReg(null);
    setTab("cadastros");
  };
  const saveEst = (data) => {
    if (data.id) {
      setEstablishments((list) => list.map((e) => e.id === data.id ? { ...e, ...data } : e));
      if (data.id === "live") setRestaurant({ ...restaurant, name: data.name, phone: data.phone, email: data.email, website: data.website, whatsapp: data.whatsapp, instagram: data.instagram, platformFee: data.feePct });
      setReg(null);
    } else addEst(data);
  };
  const delEst = (id) => { setEstablishments((list) => list.filter((e) => e.id !== id)); setDel(null); };

  const Stat = ({ label, value, sub, color }) => (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <p className="text-xs text-slate-400">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color || "text-slate-800"}`}>{value}</p>
      {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );

  const PAY_META = { credito: { label: "Crédito", color: "bg-blue-500" }, debito: { label: "Débito", color: "bg-emerald-500" }, pix: { label: "Pix", color: "bg-teal-500" }, usdc: { label: "USDC", color: "bg-violet-500" } };

  return (
    <div className="max-w-4xl mx-auto px-4 py-5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0"><Shield size={20} className="text-amber-400" /></div>
          <div><h1 className="text-lg font-bold leading-tight">Painel da plataforma</h1><p className="text-slate-400 text-xs">PedeAí · administração</p></div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs bg-slate-900 text-white px-2.5 py-1 rounded-full font-medium">{ativos.length} ativos</span>
          <button onClick={() => setLogged(false)} className="text-slate-400 text-sm flex items-center gap-1"><LogOut size={16} /> <span className="hidden sm:inline">Sair</span></button>
        </div>
      </div>

      <div className="flex gap-1 bg-white rounded-xl p-1 mb-5 shadow-sm">
        {[
          { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
          { id: "faturamento", label: "Faturamento", icon: TrendingUp },
          { id: "cadastros", label: "Cadastros", icon: Store },
          { id: "taxas", label: "Taxas", icon: Percent },
        ].map((t) => {
          const Icon = t.icon;
          return (<button key={t.id} onClick={() => setTab(t.id)} className={`flex-1 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 transition ${tab === t.id ? "bg-cyan-500 text-white" : "text-slate-500"}`}><Icon size={16} /> <span className="hidden sm:inline">{t.label}</span></button>);
        })}
      </div>

      {tab === "dashboard" && (
        <>
          <PeriodPills />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
            <Stat label="GMV da plataforma" value={money(gmv)} sub="faturamento somado dos clientes" color="text-cyan-600" />
            <Stat label="Receita de fees" value={money(feeRev)} sub="o que o PedeAí fatura" color="text-emerald-600" />
            <Stat label="Pedidos totais" value={totalOrders.toLocaleString("pt-BR")} color="text-slate-800" />
            <Stat label="Ticket médio" value={money(ticket)} color="text-violet-600" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <Stat label="Estabelecimentos" value={ests.length} sub={`${ativos.length} ativos · ${ests.length - ativos.length} pendente(s)`} />
            <Stat label="% via USDC" value={`${usdcShare.toFixed(1)}%`} sub="movimento em stablecoin" color="text-violet-600" />
            <Stat label="Fee médio" value={`${(ests.reduce((s, e) => s + (e.feePct || 0), 0) / ests.length).toFixed(1)}%`} />
            <Stat label="GMV/estab. ativo" value={money(ativos.length ? gmv / ativos.length : 0)} />
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm mb-4">
            <h2 className="font-semibold text-sm text-slate-600 mb-4">Movimento por método de pagamento (plataforma)</h2>
            <div className="space-y-3">
              {Object.entries(byPay).map(([k, v]) => (
                <div key={k}>
                  <div className="flex justify-between text-sm mb-1"><span className="flex items-center gap-2 text-slate-700 font-medium"><span className={`w-3 h-3 rounded-sm ${PAY_META[k].color}`} /> {PAY_META[k].label}</span><span className="font-semibold">{money(v)} <span className="text-slate-400 font-normal text-xs">· {((v / payTotal) * 100).toFixed(0)}%</span></span></div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full ${PAY_META[k].color} rounded-full transition-all`} style={{ width: `${(v / payTotal) * 100}%` }} /></div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm">
            <h2 className="font-semibold text-sm text-slate-600 mb-4">Top estabelecimentos por faturamento</h2>
            <div className="space-y-3">
              {top.map((e, k) => (
                <div key={e.id}>
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span className="flex items-center gap-2 text-slate-700 font-medium"><span className="w-6 text-center text-base">{MEDAL[k] || `${k + 1}º`}</span> {e.name}{e.id === "live" && <span className="text-[10px] bg-cyan-100 text-cyan-700 font-bold px-1.5 py-0.5 rounded-full">ao vivo</span>}</span>
                    <span className="text-slate-500 text-xs shrink-0 pl-2"><b className="text-slate-800 text-sm">{money(e.revenue)}</b> · fee {money(e.revenue * (e.feePct || 0) / 100)}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden ml-8"><div className="h-full bg-cyan-500 rounded-full transition-all" style={{ width: `${(e.revenue / maxRev) * 100}%` }} /></div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {tab === "faturamento" && (
        <>
          <PeriodPills />
          <h2 className="font-semibold text-slate-600 mb-3">Faturamento por estabelecimento <span className="text-slate-400 font-normal text-xs">· no período</span></h2>
          <div className="space-y-2">
            {ests.map((e) => (
              <div key={e.id} className="bg-white rounded-xl p-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate flex items-center gap-1.5">{e.name}{e.id === "live" && <span className="text-[10px] bg-cyan-100 text-cyan-700 font-bold px-1.5 py-0.5 rounded-full">ao vivo</span>}</p>
                    <p className="text-xs text-slate-400">{e.owner} · {e.city}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${e.status === "ativo" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{e.status === "ativo" ? "Ativo" : "Pendente"}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                  <div className="bg-slate-50 rounded-lg py-2"><p className="text-[11px] text-slate-400">Faturamento</p><p className="font-bold text-sm text-cyan-600">{money(e.revenue)}</p></div>
                  <div className="bg-slate-50 rounded-lg py-2"><p className="text-[11px] text-slate-400">Pedidos</p><p className="font-bold text-sm text-slate-700">{e.orders.toLocaleString("pt-BR")}</p></div>
                  <div className="bg-slate-50 rounded-lg py-2"><p className="text-[11px] text-slate-400">Fee ({e.feePct}%)</p><p className="font-bold text-sm text-emerald-600">{money(e.revenue * (e.feePct || 0) / 100)}</p></div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "cadastros" && (
        <>
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold text-slate-600">{ests.length} estabelecimentos cadastrados</h2>
            <button onClick={() => setReg({ name: "", owner: "", city: "", neighborhood: "", plan: "Básico", feePct: "8", user: "", password: "", phone: "", email: "", website: "", whatsapp: "", instagram: "" })} className="bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-medium px-3 py-2 rounded-xl flex items-center gap-1 active:scale-95"><Plus size={16} /> Cadastrar</button>
          </div>
          <div className="space-y-2">
            {ests.map((e) => (
              <div key={e.id} className="bg-white rounded-xl p-3 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <button onClick={() => setReg({ id: e.id, name: e.name, owner: e.owner, city: e.city, neighborhood: e.neighborhood || "", plan: e.plan, feePct: String(e.feePct), user: e.user || "", password: e.password || "", phone: e.phone || "", email: e.email || "", website: e.website || "", whatsapp: e.whatsapp || "", instagram: e.instagram || "" })} className="font-semibold text-sm truncate flex items-center gap-1.5 text-left hover:text-cyan-600 transition">{e.name} <Edit3 size={12} className="text-slate-300 shrink-0" />{e.id === "live" && <span className="text-[10px] bg-cyan-100 text-cyan-700 font-bold px-1.5 py-0.5 rounded-full">ao vivo</span>}</button>
                    <p className="text-xs text-slate-400">{e.owner} · {e.neighborhood ? `${e.neighborhood}, ` : ""}{e.city} · Plano {e.plan}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${e.status === "ativo" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{e.status === "ativo" ? "Ativo" : "Pendente"}</span>
                    {e.id !== "live" && <button onClick={() => setDel(e)} className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500 active:scale-90"><Trash2 size={15} /></button>}
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500">
                  {e.user && <span className="flex items-center gap-1"><User size={11} className="text-slate-400" /> {e.user}</span>}
                  {e.password && <span className="flex items-center gap-1"><Lock size={11} className="text-slate-400" /> {"•".repeat(Math.min(8, String(e.password).length))}</span>}
                  {e.phone && <span className="flex items-center gap-1"><Phone size={11} className="text-slate-400" /> {e.phone}</span>}
                  {e.whatsapp && <span className="flex items-center gap-1"><MessageCircle size={11} className="text-emerald-500" /> {e.whatsapp}</span>}
                  {e.email && <span className="flex items-center gap-1"><Mail size={11} className="text-slate-400" /> {e.email}</span>}
                  {e.website && <span className="flex items-center gap-1"><Globe size={11} className="text-slate-400" /> {e.website}</span>}
                  {e.instagram && <span className="flex items-center gap-1"><Instagram size={11} className="text-pink-500" /> {e.instagram}</span>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "taxas" && (
        <>
          <div className="bg-violet-50 border border-violet-100 rounded-2xl p-4 mb-4">
            <h2 className="font-semibold text-violet-900 mb-1 flex items-center gap-1.5"><Percent size={16} /> Fee do PedeAí por estabelecimento</h2>
            <p className="text-sm text-violet-800/80">Defina a taxa cobrada sobre cada venda. Ela aparece para o cliente no checkout, somada ao subtotal. Alterar a taxa do <b>Quiosque do Mar</b> reflete na hora no app do cliente.</p>
          </div>
          <div className="space-y-2">
            {estsMes.map((e) => (
              <div key={e.id} className="bg-white rounded-xl p-3 shadow-sm flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate flex items-center gap-1.5">{e.name}{e.id === "live" && <span className="text-[10px] bg-cyan-100 text-cyan-700 font-bold px-1.5 py-0.5 rounded-full">ao vivo</span>}</p>
                  <p className="text-xs text-slate-400">Receita de fee estimada (mês): <b className="text-emerald-600">{money(e.revenue * (e.feePct || 0) / 100)}</b></p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <input value={e.feePct} onChange={(ev) => setFee(e.id, ev.target.value.replace(/[^0-9.,]/g, ""))} inputMode="decimal" className="w-16 px-2 py-2 rounded-lg border border-slate-200 text-sm text-right focus:border-cyan-500 outline-none" />
                  <span className="text-slate-400 text-sm">%</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {reg && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4" onClick={() => setReg(null)}>
          <div className="bg-white rounded-t-3xl sm:rounded-2xl p-5 w-full max-w-md max-h-[92vh] overflow-y-auto" onClick={(ev) => ev.stopPropagation()}>
            <div className="flex justify-between items-center mb-4"><h2 className="font-bold text-lg">{reg.id ? "Editar estabelecimento" : "Novo estabelecimento"}</h2><button onClick={() => setReg(null)}><X size={22} className="text-slate-400" /></button></div>
            <label className="text-xs font-medium text-slate-500">Nome do estabelecimento</label>
            <input value={reg.name} onChange={(ev) => setReg({ ...reg, name: ev.target.value })} className="w-full mt-1 mb-3 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none" placeholder="Ex: Quiosque do Sol" />
            <label className="text-xs font-medium text-slate-500">Responsável</label>
            <input value={reg.owner} onChange={(ev) => setReg({ ...reg, owner: ev.target.value })} className="w-full mt-1 mb-3 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none" placeholder="Nome do dono" />
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div><label className="text-xs font-medium text-slate-500">Cidade / UF</label><input value={reg.city} onChange={(ev) => setReg({ ...reg, city: ev.target.value })} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none" placeholder="Ex: Maringá/PR" /></div>
              <div><label className="text-xs font-medium text-slate-500">Bairro</label><input value={reg.neighborhood || ""} onChange={(ev) => setReg({ ...reg, neighborhood: ev.target.value })} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none" placeholder="Ex: Zona 7" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div><label className="text-xs font-medium text-slate-500">Plano</label><select value={reg.plan} onChange={(ev) => setReg({ ...reg, plan: ev.target.value })} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white outline-none"><option>Básico</option><option>Pro</option></select></div>
              <div><label className="text-xs font-medium text-slate-500">Fee (%)</label><input value={reg.feePct} onChange={(ev) => setReg({ ...reg, feePct: ev.target.value.replace(/[^0-9.,]/g, "") })} inputMode="decimal" className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none" /></div>
            </div>

            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Acesso do estabelecimento</p>
            <div className="space-y-3 mb-4">
              <div><label className="text-xs font-medium text-slate-500 flex items-center gap-1"><User size={12} className="text-cyan-500" /> Usuário (login)</label><input value={reg.user || ""} onChange={(ev) => setReg({ ...reg, user: ev.target.value })} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none" placeholder="e-mail ou nome de usuário" /></div>
              <div><label className="text-xs font-medium text-slate-500 flex items-center gap-1"><Lock size={12} className="text-cyan-500" /> Senha</label><input type="password" value={reg.password || ""} onChange={(ev) => setReg({ ...reg, password: ev.target.value })} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none" placeholder="mínimo 6 caracteres" /></div>
            </div>

            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Contato e redes</p>
            <div className="space-y-3 mb-4">
              <div><label className="text-xs font-medium text-slate-500 flex items-center gap-1"><Phone size={12} className="text-cyan-500" /> Telefone</label><input value={reg.phone || ""} onChange={(ev) => setReg({ ...reg, phone: ev.target.value })} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none" placeholder="(00) 0000-0000" /></div>
              <div><label className="text-xs font-medium text-slate-500 flex items-center gap-1"><Mail size={12} className="text-cyan-500" /> E-mail</label><input value={reg.email || ""} onChange={(ev) => setReg({ ...reg, email: ev.target.value })} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none" placeholder="contato@estabelecimento.com.br" /></div>
              <div><label className="text-xs font-medium text-slate-500 flex items-center gap-1"><Globe size={12} className="text-cyan-500" /> Website</label><input value={reg.website || ""} onChange={(ev) => setReg({ ...reg, website: ev.target.value })} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none" placeholder="www.estabelecimento.com.br" /></div>
              <div><label className="text-xs font-medium text-slate-500 flex items-center gap-1"><MessageCircle size={12} className="text-emerald-500" /> WhatsApp</label><input value={reg.whatsapp || ""} onChange={(ev) => setReg({ ...reg, whatsapp: ev.target.value })} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none" placeholder="5547999990000" /></div>
              <div><label className="text-xs font-medium text-slate-500 flex items-center gap-1"><Instagram size={12} className="text-pink-500" /> Instagram</label><input value={reg.instagram || ""} onChange={(ev) => setReg({ ...reg, instagram: ev.target.value })} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none" placeholder="@estabelecimento" /></div>
            </div>
            {reg.password && reg.password.length > 0 && reg.password.length < 6 && <p className="text-[11px] text-rose-600 mb-2">A senha precisa ter ao menos 6 caracteres.</p>}
            <button disabled={!reg.name || !reg.owner || !reg.user || !reg.password || reg.password.length < 6} onClick={() => saveEst({ ...(reg.id ? { id: reg.id } : {}), name: reg.name, owner: reg.owner, city: reg.city || "—", neighborhood: reg.neighborhood || "", plan: reg.plan, feePct: Math.max(0, Math.min(30, parseFloat(String(reg.feePct).replace(",", ".")) || 0)), user: reg.user, password: reg.password, phone: reg.phone || "", email: reg.email || "", website: reg.website || "", whatsapp: reg.whatsapp || "", instagram: reg.instagram || "" })} className="w-full bg-cyan-500 disabled:bg-slate-300 text-white font-semibold py-3 rounded-xl active:scale-95">{reg.id ? "Salvar alterações" : "Cadastrar estabelecimento"}</button>
          </div>
        </div>
      )}

      {del && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setDel(null)}>
          <div className="bg-white rounded-2xl p-5 w-full max-w-xs" onClick={(ev) => ev.stopPropagation()}>
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-3"><Trash2 size={22} /></div>
            <h2 className="font-bold text-center">Excluir estabelecimento?</h2>
            <p className="text-sm text-slate-500 text-center mt-1"><b>{del.name}</b> será removido da plataforma. Esta ação não pode ser desfeita.</p>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <button onClick={() => setDel(null)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl active:scale-95 text-sm">Cancelar</button>
              <button onClick={() => delEst(del.id)} className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-xl active:scale-95 text-sm">Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =====================================================================
// LANDING (site institucional — pedeai.com.br)
// =====================================================================
function Landing({ establishments, onEnter, onForEstablishment }) {
  const ativos = establishments.filter((e) => e.status === "ativo");
  const cities = Array.from(new Set(ativos.map((e) => e.city)));
  const [city, setCity] = useState("");
  const [bairro, setBairro] = useState("");
  const bairros = city ? Array.from(new Set(ativos.filter((e) => e.city === city).map((e) => e.neighborhood).filter(Boolean))) : [];
  const results = city ? ativos.filter((e) => e.city === city && (!bairro || e.neighborhood === bairro)) : [];
  const pickCity = (c) => { setCity(c); setBairro(""); };
  const scrollToFinder = () => { const el = document.getElementById("finder"); if (el) el.scrollIntoView({ behavior: "smooth" }); };

  const blankLead = { name: "", owner: "", city: "", whatsapp: "", email: "", type: "Quiosque de praia", message: "" };
  const [lead, setLead] = useState(null);
  const [sent, setSent] = useState(false);
  const openLead = () => { setLead({ ...blankLead }); setSent(false); };
  const leadValid = lead && lead.name && lead.owner && lead.whatsapp && lead.email;
  const leadMailto = lead ? `mailto:${LEADS_EMAIL}?subject=${encodeURIComponent(`Novo interesse PedeAí — ${lead.name}`)}&body=${encodeURIComponent(
    `Estabelecimento: ${lead.name}\nResponsável: ${lead.owner}\nCidade/UF: ${lead.city}\nWhatsApp: ${lead.whatsapp}\nE-mail: ${lead.email}\nTipo: ${lead.type}\n\nMensagem:\n${lead.message || "—"}`
  )}` : "";

  const steps = [
    { icon: QrCode, t: "Escaneie o QR Code", d: "Na sua mesa ou guarda-sol, aponte a câmera e abra o cardápio do local na hora." },
    { icon: UtensilsCrossed, t: "Monte seu pedido", d: "Navegue pelo cardápio com fotos, escolha os itens e adicione observações." },
    { icon: Smartphone, t: "Pague pelo celular", d: "Pix, cartão, parcelado ou stablecoin. Divida a conta com os amigos sem complicação." },
  ];
  const benefits = [
    { icon: Sun, t: "Sem espera pelo garçom", d: "Peça e pague direto do seu lugar — o pedido cai na cozinha na hora." },
    { icon: Users, t: "Conta dividida flexível", d: "Cada um paga sua parte do jeito que quiser, mesmo que em momentos diferentes." },
    { icon: Coins, t: "Pagamento moderno", d: "Pix, crédito em até 6x e stablecoin (USDC) — menos taxa, sem estorno." },
    { icon: TrendingUp, t: "Gestão completa", d: "Para o estabelecimento: cardápio, pedidos, KPIs e impressão automática na cozinha." },
  ];

  return (
    <div className="bg-white">
      {/* HERO */}
      <div className="relative bg-gradient-to-br from-cyan-500 via-cyan-600 to-blue-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 70% 60%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="relative max-w-4xl mx-auto px-6 py-16 sm:py-24 text-center">
          <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur px-3 py-1.5 rounded-full text-sm font-medium mb-5"><Sun size={15} className="text-amber-300" /> Pedidos por QR Code para bares e restaurantes de praia</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight">Peça da sua espreguiçadeira.<br />O garçom é o seu celular.</h1>
          <p className="text-white/90 text-lg mt-5 max-w-2xl mx-auto">O PedeAí transforma o atendimento na areia: o cliente escaneia o QR Code, pede e paga pelo celular — sem fila, sem espera e sem complicação.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <button onClick={scrollToFinder} className="bg-white text-cyan-700 font-bold px-6 py-3.5 rounded-xl active:scale-95 transition flex items-center justify-center gap-2 shadow-lg"><MapPin size={18} /> Encontrar perto de mim</button>
            <button onClick={openLead} className="bg-cyan-700/40 backdrop-blur border border-white/30 text-white font-semibold px-6 py-3.5 rounded-xl active:scale-95 transition flex items-center justify-center gap-2"><Store size={18} /> Tenho um estabelecimento</button>
          </div>
        </div>
      </div>

      {/* COMO FUNCIONA */}
      <div className="max-w-4xl mx-auto px-6 py-14">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-slate-800">Como funciona</h2>
        <p className="text-slate-500 text-center mt-2">Três passos, do guarda-sol à cozinha.</p>
        <div className="grid sm:grid-cols-3 gap-4 mt-8">
          {steps.map((s, k) => {
            const Icon = s.icon;
            return (
              <div key={k} className="bg-slate-50 rounded-3xl p-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500 text-white flex items-center justify-center mx-auto mb-4"><Icon size={26} /></div>
                <div className="text-xs font-bold text-cyan-600 mb-1">PASSO {k + 1}</div>
                <h3 className="font-bold text-slate-800">{s.t}</h3>
                <p className="text-sm text-slate-500 mt-1.5 leading-snug">{s.d}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* BENEFÍCIOS */}
      <div className="bg-slate-50">
        <div className="max-w-4xl mx-auto px-6 py-14">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-slate-800">Por que PedeAí</h2>
          <div className="grid sm:grid-cols-2 gap-4 mt-8">
            {benefits.map((b, k) => {
              const Icon = b.icon;
              return (
                <div key={k} className="bg-white rounded-3xl p-5 flex gap-4 shadow-sm">
                  <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0"><Icon size={22} /></div>
                  <div><h3 className="font-bold text-slate-800">{b.t}</h3><p className="text-sm text-slate-500 mt-1 leading-snug">{b.d}</p></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* FINDER */}
      <div id="finder" className="max-w-4xl mx-auto px-6 py-14">
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800">Estabelecimentos perto de você</h2>
          <p className="text-slate-500 mt-2">Selecione sua cidade e bairro para ver onde o PedeAí já está.</p>
        </div>
        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-100 rounded-3xl p-5 sm:p-6">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 flex items-center gap-1 mb-1"><MapPin size={13} className="text-cyan-500" /> Cidade</label>
              <select value={city} onChange={(e) => pickCity(e.target.value)} className="w-full px-3 py-3 rounded-xl border border-slate-200 text-sm bg-white outline-none focus:border-cyan-500">
                <option value="">Selecione sua cidade…</option>
                {cities.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 flex items-center gap-1 mb-1"><MapPin size={13} className="text-cyan-500" /> Bairro</label>
              <select value={bairro} onChange={(e) => setBairro(e.target.value)} disabled={!city} className="w-full px-3 py-3 rounded-xl border border-slate-200 text-sm bg-white outline-none focus:border-cyan-500 disabled:bg-slate-100 disabled:text-slate-400">
                <option value="">{city ? "Todos os bairros" : "Escolha a cidade primeiro"}</option>
                {bairros.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          </div>

          <div className="mt-5">
            {!city ? (
              <div className="text-center py-10 text-slate-400 text-sm"><MapPin size={32} className="mx-auto mb-3 opacity-40" />Escolha uma cidade para ver os estabelecimentos disponíveis.</div>
            ) : results.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm">Nenhum estabelecimento neste filtro ainda. Em breve! 🌊</div>
            ) : (
              <>
                <p className="text-sm text-slate-500 mb-3">{results.length} {results.length === 1 ? "estabelecimento encontrado" : "estabelecimentos encontrados"}{bairro ? ` em ${bairro}` : ""}:</p>
                <div className="space-y-2">
                  {results.map((e) => (
                    <div key={e.id} className="bg-white rounded-2xl p-3 flex items-center gap-3 shadow-sm">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 text-white flex items-center justify-center text-xl shrink-0">🏖️</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 truncate">{e.name}</p>
                        <p className="text-xs text-slate-400 flex items-center gap-1"><MapPin size={11} /> {e.neighborhood} · {e.city}</p>
                      </div>
                      <button onClick={onEnter} className="bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-semibold px-4 py-2 rounded-xl active:scale-95 shrink-0">Ver cardápio</button>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 mt-3 text-center">No app real, cada estabelecimento abre o próprio cardápio. Nesta demo, todos levam ao cardápio do Quiosque do Mar.</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* CTA ESTABELECIMENTO + FOOTER */}
      <div className="bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-6 py-14 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold">Tem um bar ou restaurante na praia?</h2>
          <p className="text-slate-300 mt-2 max-w-xl mx-auto">Atenda mais mesas com menos garçons, receba na hora e tenha controle total das vendas.</p>
          <button onClick={openLead} className="mt-6 bg-cyan-500 hover:bg-cyan-600 text-white font-bold px-6 py-3.5 rounded-xl active:scale-95 transition inline-flex items-center gap-2"><Store size={18} /> Quero o PedeAí no meu negócio</button>
          <p className="mt-3 text-sm text-slate-400">Já é parceiro? <button onClick={onForEstablishment} className="text-cyan-400 font-medium underline">Acessar o painel</button></p>
          <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400 text-sm">
            <span className="flex items-center gap-2 font-bold text-white"><Sun size={18} className="text-amber-400" /> PedeAí</span>
            <span>www.pedeai.com.br · © {new Date().getFullYear()} PedeAí</span>
          </div>
        </div>
      </div>

      {lead && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4" onClick={() => setLead(null)}>
          <div className="bg-white rounded-t-3xl sm:rounded-2xl p-5 w-full max-w-md max-h-[92vh] overflow-y-auto text-slate-800" onClick={(e) => e.stopPropagation()}>
            {sent ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto mb-4"><Check size={36} /></div>
                <h2 className="text-xl font-bold">Recebemos seu interesse!</h2>
                <p className="text-slate-500 text-sm mt-2">Seus dados foram preparados para envio ao nosso time comercial. Em breve entramos em contato pelo WhatsApp ou e-mail informado.</p>
                <button onClick={() => setLead(null)} className="mt-5 w-full bg-slate-900 text-white font-semibold py-3 rounded-xl active:scale-95">Fechar</button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-1"><h2 className="font-bold text-lg flex items-center gap-2"><Store size={20} className="text-cyan-500" /> Quero o PedeAí</h2><button onClick={() => setLead(null)}><X size={22} className="text-slate-400" /></button></div>
                <p className="text-xs text-slate-400 mb-4">Preencha os dados do seu estabelecimento. Nosso time comercial entra em contato.</p>
                <label className="text-xs font-medium text-slate-500">Nome do estabelecimento *</label>
                <input value={lead.name} onChange={(e) => setLead({ ...lead, name: e.target.value })} className="w-full mt-1 mb-3 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none" placeholder="Ex: Quiosque do Sol" />
                <label className="text-xs font-medium text-slate-500">Responsável *</label>
                <input value={lead.owner} onChange={(e) => setLead({ ...lead, owner: e.target.value })} className="w-full mt-1 mb-3 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none" placeholder="Seu nome" />
                <label className="text-xs font-medium text-slate-500">Cidade / UF</label>
                <input value={lead.city} onChange={(e) => setLead({ ...lead, city: e.target.value })} className="w-full mt-1 mb-3 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none" placeholder="Ex: Maringá/PR" />
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div><label className="text-xs font-medium text-slate-500 flex items-center gap-1"><MessageCircle size={12} className="text-emerald-500" /> WhatsApp *</label><input value={lead.whatsapp} onChange={(e) => setLead({ ...lead, whatsapp: e.target.value })} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none" placeholder="(00) 00000-0000" /></div>
                  <div><label className="text-xs font-medium text-slate-500 flex items-center gap-1"><Mail size={12} className="text-cyan-500" /> E-mail *</label><input value={lead.email} onChange={(e) => setLead({ ...lead, email: e.target.value })} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none" placeholder="voce@email.com" /></div>
                </div>
                <label className="text-xs font-medium text-slate-500">Tipo de estabelecimento</label>
                <select value={lead.type} onChange={(e) => setLead({ ...lead, type: e.target.value })} className="w-full mt-1 mb-3 px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white outline-none">
                  <option>Quiosque de praia</option><option>Bar</option><option>Restaurante</option><option>Food truck</option><option>Outro</option>
                </select>
                <label className="text-xs font-medium text-slate-500">Mensagem <span className="text-slate-400 font-normal">(opcional)</span></label>
                <textarea value={lead.message} onChange={(e) => setLead({ ...lead, message: e.target.value })} rows={2} className="w-full mt-1 mb-4 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none resize-none" placeholder="Conte um pouco sobre seu negócio…" />
                {leadValid ? (
                  <a href={leadMailto} onClick={() => setSent(true)} className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-3 rounded-xl active:scale-95 transition flex items-center justify-center gap-2"><Mail size={18} /> Enviar para o time PedeAí</a>
                ) : (
                  <button disabled className="w-full bg-slate-300 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2"><Mail size={18} /> Enviar para o time PedeAí</button>
                )}
                <p className="text-[11px] text-slate-400 mt-2 text-center">Os campos com * são obrigatórios. Enviamos para {LEADS_EMAIL}.</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState("admin@pedeai.com.br");
  const [pass, setPass] = useState("admin1234");
  return (
    <div className="max-w-sm mx-auto px-6 py-16">
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center mx-auto mb-3"><Shield size={30} className="text-amber-400" /></div>
        <h1 className="text-2xl font-bold">Acesso da plataforma</h1>
        <p className="text-slate-400 text-sm">Área restrita à administração do PedeAí</p>
      </div>
      <div className="bg-white rounded-2xl p-6 shadow-sm space-y-3">
        <div><label className="text-xs font-medium text-slate-500">E-mail</label><input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none" /></div>
        <div><label className="text-xs font-medium text-slate-500">Senha</label><input type="password" value={pass} onChange={(e) => setPass(e.target.value)} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none" /></div>
        <button onClick={onLogin} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-xl transition active:scale-95">Entrar</button>
        <p className="text-xs text-slate-400 text-center">Credenciais de demo já preenchidas 👆</p>
      </div>
    </div>
  );
}

// =====================================================================
// QR CODES (gerador por mesa/guarda-sol)
// =====================================================================
function QRCodes({ restaurant }) {
  const slug = (restaurant.name || "estabelecimento").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const [label, setLabel] = useState("");
  const [list, setList] = useState([{ id: 1, label: "Guarda-sol nº 14" }, { id: 2, label: "Mesa 07" }]);
  const [seq, setSeq] = useState(3);
  const [zoom, setZoom] = useState(null);

  const qrUrl = (l) => `https://pedeai.com.br/${slug}?local=${encodeURIComponent(l)}`;
  const qrImg = (l, size) => `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=10&data=${encodeURIComponent(qrUrl(l))}`;
  const add = () => { const t = label.trim(); if (!t) return; if (list.some((e) => e.label.toLowerCase() === t.toLowerCase())) { setLabel(""); return; } setList((x) => [...x, { id: seq, label: t }]); setSeq((s) => s + 1); setLabel(""); };
  const del = (id) => setList((x) => x.filter((e) => e.id !== id));
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const printQR = (e) => {
    const w = window.open("", "_blank", "width=440,height=620");
    if (!w) return;
    w.document.write(`<!doctype html><html><head><title>QR ${esc(e.label)} — ${esc(restaurant.name)}</title><meta charset="utf-8"><style>body{font-family:ui-sans-serif,system-ui,sans-serif;text-align:center;padding:32px;color:#0f172a;margin:0}img{width:320px;height:320px}.est{color:#64748b;font-size:14px;margin:0 0 12px}.loc{font-size:24px;font-weight:800;margin:14px 0 4px}.cta{color:#64748b;font-size:13px}</style></head><body><p class="est">${esc(restaurant.name)}</p><img src="${qrImg(e.label, 600)}" onload="window.focus();window.print()" /><div class="loc">${esc(e.label)}</div><p class="cta">Escaneie para ver o cardápio e pedir 🍹</p></body></html>`);
    w.document.close();
  };

  return (
    <div>
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
        <h2 className="font-semibold text-slate-600 mb-1 flex items-center gap-1.5"><QrCode size={16} className="text-cyan-500" /> Gerar QR Code por mesa/guarda-sol</h2>
        <p className="text-xs text-slate-400 mb-3">Cada QR abre o cardápio já identificando o local — assim o pedido chega com a mesa/guarda-sol de origem.</p>
        <div className="flex gap-2">
          <input value={label} onChange={(e) => setLabel(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} maxLength={40} placeholder="Ex: Guarda-sol nº 22, Mesa 12, Deck 03…" className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none" />
          <button onClick={add} disabled={!label.trim()} className="bg-cyan-500 disabled:bg-slate-300 hover:bg-cyan-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl flex items-center gap-1 active:scale-95 shrink-0"><Plus size={16} /> Gerar</button>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="text-center py-16 text-slate-400"><QrCode size={40} className="mx-auto mb-3 opacity-40" /><p>Nenhum QR Code ainda. Digite um local acima para gerar.</p></div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {list.map((e) => (
            <div key={e.id} className="bg-white rounded-2xl p-3 shadow-sm flex flex-col items-center text-center">
              <button onClick={() => setZoom(e)} className="rounded-xl overflow-hidden border border-slate-100 active:scale-95 transition">
                <Img src={qrImg(e.label, 220)} emoji="🔳" className="w-full aspect-square" />
              </button>
              <p className="font-semibold text-sm text-slate-700 mt-2 flex items-center gap-1"><MapPin size={12} className="text-cyan-500 shrink-0" /> {e.label}</p>
              <div className="flex gap-1.5 mt-2 w-full">
                <a href={qrImg(e.label, 600)} target="_blank" rel="noopener noreferrer" className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium py-2 rounded-lg flex items-center justify-center gap-1 active:scale-95"><Download size={13} /> Baixar</a>
                <button onClick={() => printQR(e)} className="w-8 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg flex items-center justify-center active:scale-90 shrink-0"><Printer size={14} /></button>
                <button onClick={() => del(e.id)} className="w-8 bg-red-50 text-red-500 rounded-lg flex items-center justify-center active:scale-90 shrink-0"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {zoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setZoom(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-xs text-center" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3"><span className="font-bold text-slate-800">{restaurant.name}</span><button onClick={() => setZoom(null)}><X size={20} className="text-slate-400" /></button></div>
            <Img src={qrImg(zoom.label, 320)} emoji="🔳" className="w-full aspect-square rounded-xl border border-slate-100" />
            <p className="font-bold text-lg mt-3 flex items-center justify-center gap-1.5"><MapPin size={16} className="text-cyan-500" /> {zoom.label}</p>
            <p className="text-[11px] text-slate-400 mt-1 break-all">{qrUrl(zoom.label)}</p>
            <p className="text-xs text-slate-500 mt-3">Imprima e fixe no local. Ao escanear, o cliente abre o cardápio já vinculado a <b>{zoom.label}</b>.</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button onClick={() => printQR(zoom)} className="bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 rounded-xl active:scale-95 transition flex items-center justify-center gap-2"><Printer size={16} /> Imprimir</button>
              <a href={qrImg(zoom.label, 600)} target="_blank" rel="noopener noreferrer" className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2.5 rounded-xl active:scale-95 transition flex items-center justify-center gap-2"><Download size={16} /> Baixar</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
