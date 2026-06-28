import type { LucideIcon } from "lucide-react";

// ---------------------------------------------------------------------------
// Categorias
// ---------------------------------------------------------------------------

/** Nome de uma categoria principal do cardápio (chave de `CATS`). */
export type CategoryName =
  "Combos & Combinações" | "Bebidas" | "Alimentos" | "Snacks" | "Sobremesas";

/** Mapa de categoria → subcategorias disponíveis. */
export type Categories = Record<CategoryName, string[]>;

/** Unidade de medida exibida ao cliente. */
export type MeasureUnit = "g" | "kg" | "ml" | "L";

// ---------------------------------------------------------------------------
// Cardápio
// ---------------------------------------------------------------------------

/** Item do cardápio já tipado para consumo (preços como número). */
export interface MenuItem {
  id: number;
  name: string;
  desc: string;
  price: number;
  oldPrice?: number;
  emoji: string;
  /** Foto de capa (URL ou data-URL). */
  photo?: string;
  /** Segunda foto opcional para a galeria. */
  photo2?: string;
  measure?: number;
  unit?: MeasureUnit;
  cat: CategoryName;
  sub: string;
}

/**
 * Versão "de formulário" de um item — os campos numéricos são strings
 * enquanto o usuário digita no editor. Convertida para {@link MenuItem} ao salvar.
 */
export interface MenuItemForm extends Omit<
  MenuItem,
  "id" | "price" | "oldPrice" | "measure" | "unit"
> {
  id?: number;
  price: string;
  oldPrice: string;
  measure: string;
  unit: MeasureUnit;
}

// ---------------------------------------------------------------------------
// Pagamentos
// ---------------------------------------------------------------------------

/** Identificador de um método de pagamento simples. */
export type PaymentMethodId = "credito" | "debito" | "pix" | "usdc";

/** Inclui o "método" sintético de conta dividida. */
export type PaymentId = PaymentMethodId | "split";

/** Método de pagamento exibível (com ícone e cor). */
export interface Payment {
  id: PaymentId;
  label: string;
  icon: LucideIcon;
  color: string;
}

/** Totais agregados por método de pagamento. */
export type PaymentTotals = Record<PaymentMethodId, number>;

// ---------------------------------------------------------------------------
// Pedidos
// ---------------------------------------------------------------------------

export type OrderStatus = "aguardando" | "producao" | "entregue";

/** Linha de item dentro de um pedido (snapshot de nome/preço). */
export interface OrderItem {
  name: string;
  qty: number;
  price: number;
}

/** Parte de uma conta dividida. `method` nulo = ainda não pago. */
export interface Split {
  method: Payment | null;
  amount: number;
}

export interface Order {
  id: number;
  /** Código curto e único do pedido (ex.: "PED-7F3A9C2D"). */
  code: string;
  location: string;
  customerName?: string;
  status: OrderStatus;
  ts: Date;
  payment: Payment;
  splits?: Split[];
  items: OrderItem[];
  total: number;
  fee?: number;
  feePct?: number;
  note?: string;
}

/** Dados de um pedido antes de receber id/ts (no momento da criação). */
export type NewOrder = Omit<Order, "id" | "ts"> & { status?: OrderStatus };

// ---------------------------------------------------------------------------
// Estabelecimento (perfil do cliente do PedeAí)
// ---------------------------------------------------------------------------

export interface Restaurant {
  name: string;
  tagline: string;
  desc: string;
  address: string;
  hours: string;
  cover: string;
  logo: string;
  platformFee: number;
  phone: string;
  email: string;
  website: string;
  whatsapp: string;
  instagram: string;
  emoji: string;
  /** Enviar recibo/confirmação por WhatsApp ao estabelecimento (default: ligado). */
  notifyWhatsapp?: boolean;
  /** Enviar recibo/confirmação por e-mail ao estabelecimento (default: ligado). */
  notifyEmail?: boolean;
}

// ---------------------------------------------------------------------------
// Plataforma (Admin)
// ---------------------------------------------------------------------------

export type EstablishmentStatus = "ativo" | "pendente";
export type EstablishmentPlan = "Básico" | "Pro";

export interface Establishment {
  id: string;
  name: string;
  owner: string;
  city: string;
  neighborhood?: string;
  plan: EstablishmentPlan;
  status: EstablishmentStatus;
  since: string;
  feePct: number;
  user?: string;
  password?: string;
  orders: number;
  revenue: number;
  byPay: PaymentTotals;
  phone?: string;
  email?: string;
  website?: string;
  whatsapp?: string;
  instagram?: string;
}

/** Formulário de cadastro/edição de estabelecimento (fee como string). */
export interface EstablishmentForm {
  id?: string;
  name: string;
  owner: string;
  city: string;
  neighborhood: string;
  plan: EstablishmentPlan;
  feePct: string;
  user: string;
  password: string;
  phone: string;
  email: string;
  website: string;
  whatsapp: string;
  instagram: string;
}

/** Métricas agregadas calculadas a partir dos pedidos reais. */
export interface LiveStats {
  orders: number;
  revenue: number;
  byPay: PaymentTotals;
}

export interface AdminPeriod {
  id: "dia" | "semana" | "quinzena" | "mes";
  label: string;
  days: number;
  factor: number;
}
