export interface EstablishmentRow {
  id: string;
  owner_id: string;
  name: string;
  slug: string | null;
  tagline: string;
  description: string;
  address: string;
  hours: string;
  cover: string;
  logo: string;
  fee_pct: number;
  phone: string;
  email: string;
  website: string;
  whatsapp: string;
  instagram: string;
  plan: "Básico" | "Pro";
  status: "ativo" | "pendente";
  city: string;
  neighborhood: string;
  created_at: string;
}

export interface MenuItemRow {
  id: string;
  establishment_id: string;
  name: string;
  description: string;
  price: number;
  old_price: number | null;
  emoji: string;
  photo: string;
  photo2: string;
  measure: number | null;
  unit: string | null;
  cat: string;
  sub: string;
  created_at: string;
}

export interface OrderRow {
  id: string;
  establishment_id: string;
  display_seq: number;
  location: string;
  customer_name: string | null;
  status: "aguardando" | "producao" | "entregue";
  total: number;
  fee: number;
  fee_pct: number;
  note: string | null;
  created_at: string;
}
