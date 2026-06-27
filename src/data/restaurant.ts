import type { Restaurant } from "@/types";

const COVER =
  "https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=900&q=70";

/** Perfil inicial do estabelecimento de demonstração. */
export const INITIAL_RESTAURANT: Restaurant = {
  name: "Quiosque do Mar",
  tagline: "Drinks autorais, frutos do mar e pé na areia 🌊",
  desc: "O melhor da Praia Brava: caipirinhas premiadas, porções generosas e aquele açaí gelado pra fechar o dia. Atendimento direto no seu guarda-sol.",
  address: "Av. Beira-Mar, 1200 — Praia Brava, Itajaí/SC",
  hours: "Todos os dias · 09h às 20h",
  cover: COVER,
  logo: "",
  platformFee: 8,
  phone: "(47) 3344-5566",
  email: "contato@quiosquedomar.com.br",
  website: "www.quiosquedomar.com.br",
  whatsapp: "5547999990000",
  instagram: "@quiosquedomar",
  emoji: "🏖️",
  notifyWhatsapp: true,
  notifyEmail: true,
};
