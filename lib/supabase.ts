import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para o banco de dados
export interface Pedido {
  id: string
  numero_pedido: string
  created_at: string
  status: 'Pendente' | 'Confirmado' | 'Preparando' | 'Pronto' | 'Entregando' | 'Entregue' | 'Cancelado'
  subtotal: number
  desconto: number
  taxa_entrega: number
  total: number
  pagamento?: string
  obs?: string
  cliente: {
    nome: string
    telefone: string
    endereco: string
    distancia?: number
  }
}

export interface Item {
  id: string
  pedido_id: string
  nome: string
  qtd: number
  preco: number
  adicionais?: {
    coberturas?: string[]
    frutas?: string[]
    complementos?: string[]
    extras?: Array<{
      nome: string
      preco: number
      quantidade: number
    }>
  }
}

export interface Configuracao {
  id: number
  taxa_base: number
  preco_por_km: number
  endereco_loja: string
}

// Alias para compatibilidade
export type Order = Pedido
export type OrderItem = Item 