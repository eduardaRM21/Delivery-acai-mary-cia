import { supabase, Pedido, Item } from './supabase'
import { calculateDeliveryFee } from './delivery'

export interface CreateOrderData {
  customerName: string
  customerPhone: string
  customerAddress: string
  items: Array<{
    name: string
    quantity: number
    price: number
    toppings?: string[]
    fruits?: string[]
    extras?: string[]
    additionals?: Array<{
      nome: string
      preco: number
      quantidade: number
    }>
  }>
  paymentMethod: string
  notes?: string
}

export interface OrderWithItems {
  pedido: Pedido
  itens: Item[]
}

export class OrderService {
  // Função utilitária para montar mensagem do pedido para WhatsApp
  static buildWhatsAppMessage(pedido: any, itens: any[]): string {
    const formatItems = (itens: any[]) => {
      return itens.map((item, idx) => {
        let extras = ''
        if (item.adicionais) {
          if (item.adicionais.coberturas?.length) extras += `\n   Coberturas: ${item.adicionais.coberturas.join(', ')}`
          if (item.adicionais.frutas?.length) extras += `\n   Frutas: ${item.adicionais.frutas.join(', ')}`
          if (item.adicionais.complementos?.length) extras += `\n   Complementos: ${item.adicionais.complementos.join(', ')}`
          if (item.adicionais.extras?.length) {
            extras += '\n   Adicionais:'
            item.adicionais.extras.forEach((extra: any) => {
              extras += `\n     ${extra.nome} x${extra.quantidade} - R$ ${(extra.preco * extra.quantidade).toFixed(2).replace('.', ',')}`
            })
          }
        }
        return `${idx + 1}. ${item.nome} x${item.qtd} - R$ ${(item.preco * item.qtd).toFixed(2).replace('.', ',')}${extras}`
      }).join('\n')
    }

    return `*Novo Pedido Recebido!*\n\n*Pedido #${pedido.numero_pedido}*\nData: ${new Date(pedido.created_at).toLocaleString('pt-BR')}\nStatus: ${pedido.status}\n*Acompanhe o seu pedido no site: https://meusite.com/pedidos*
    \n*Cliente:*\nNome: ${pedido.cliente?.nome}\nTelefone: ${pedido.cliente?.telefone}\nEndereço: ${pedido.cliente?.endereco}\n${pedido.cliente?.distancia ? `Distância: ${pedido.cliente.distancia}km` : ''}\n\n*Itens:*\n${formatItems(itens)}\n\nSubtotal: R$ ${pedido.subtotal.toFixed(2).replace('.', ',')}\nTaxa de entrega: R$ ${pedido.taxa_entrega.toFixed(2).replace('.', ',')}\nTotal: R$ ${pedido.total.toFixed(2).replace('.', ',')}\n\nPagamento: ${pedido.pagamento}\nObs: ${pedido.obs || '-'}\n`;
  }

  // Criar novo pedido
  static async createOrder(data: CreateOrderData): Promise<OrderWithItems> {
    try {
      console.log('Iniciando criação de pedido:', data)
      
      // Calcular taxa de entrega
      const subtotal = data.items.reduce((sum, item) => {
        let itemTotal = item.price * item.quantity;
        if (item.additionals && item.additionals.length > 0) {
          itemTotal += item.additionals.reduce((acc, extra) => acc + (extra.preco * extra.quantidade), 0);
        }
        return sum + itemTotal;
      }, 0)
      console.log('Subtotal calculado:', subtotal)
      
      const deliveryCalculation = await calculateDeliveryFee(data.customerAddress, subtotal)
      console.log('Cálculo de entrega:', deliveryCalculation)
      
      // Preparar dados do pedido
      const pedidoData = {
        status: 'Pendente',
        subtotal: subtotal,
        desconto: 0,
        taxa_entrega: deliveryCalculation.deliveryFee || 0,
        total: subtotal + (deliveryCalculation.deliveryFee || 0),
        pagamento: data.paymentMethod,
        obs: data.notes,
        cliente: {
          nome: data.customerName,
          telefone: data.customerPhone,
          endereco: data.customerAddress,
          
        }
      }
      
      console.log('Tentando inserir no Supabase:', JSON.stringify(pedidoData, null, 2));
      // Criar pedido
      const { data: pedido, error: pedidoError } = await supabase
        .from('pedidos')
        .insert(pedidoData)
        .select()
        .single()

      if (pedidoError) {
        console.error('Erro ao criar pedido no banco:', {
          message: pedidoError.message,
          details: pedidoError.details,
          hint: pedidoError.hint,
          code: pedidoError.code,
          pedidoError
        });
        throw new Error(`Erro ao criar pedido: ${pedidoError.message} - ${pedidoError.details || 'Sem detalhes'} - Código: ${pedidoError.code}`);
      }

      console.log('Pedido criado com sucesso:', pedido)

      // Criar itens do pedido
      const itensData = data.items.map(item => ({
        pedido_id: pedido.id,
        nome: item.name,
        qtd: item.quantity,
        preco: item.price,
        adicionais: {
          coberturas: item.toppings || [],
          frutas: item.fruits || [],
          complementos: item.extras || [],
          extras: item.additionals || []
        }
      }))

      console.log('Dados dos itens a serem inseridos:', itensData)

      const { data: itens, error: itensError } = await supabase
        .from('itens')
        .insert(itensData)
        .select()

      if (itensError) {
        console.error('Erro ao criar itens no banco:', itensError)
        throw new Error(`Erro ao criar itens: ${itensError.message}`)
      }

      console.log('Itens criados com sucesso:', itens)

      // Enviar pedido para o WhatsApp do admin
      try {
        const adminPhone = "5527988646488"
        const message = this.buildWhatsAppMessage(pedido, itens)
        const encodedMessage = encodeURIComponent(message)
        if (typeof window !== 'undefined') {
          window.open(`https://wa.me/${adminPhone}?text=${encodedMessage}`, '_blank')
        }
      } catch (err) {
        console.error('Erro ao enviar pedido para WhatsApp:', err)
      }

      return { pedido, itens }
    } catch (error) {
      console.error('Erro detalhado ao criar pedido:', error)
      if (error instanceof Error) {
        throw new Error(`Erro ao criar pedido: ${error.message}`)
      } else {
        throw new Error(`Erro desconhecido ao criar pedido: ${JSON.stringify(error)}`)
      }
    }
  }

  // Buscar todos os pedidos
  static async getAllOrders(): Promise<OrderWithItems[]> {
    try {
      const { data: pedidos, error: pedidosError } = await supabase
        .from('pedidos')
        .select('*')
        .order('created_at', { ascending: false })

      if (pedidosError) {
        console.error('Erro ao buscar pedidos (detalhes):', {
          message: pedidosError.message,
          details: pedidosError.details,
          hint: pedidosError.hint,
          code: pedidosError.code
        })
        throw new Error(`Erro ao buscar pedidos: ${pedidosError.message} - ${pedidosError.details || 'Sem detalhes'} - Código: ${pedidosError.code}`)
      }

      // Buscar itens para cada pedido
      const ordersWithItems = await Promise.all(
        pedidos.map(async (pedido) => {
          const { data: itens, error: itensError } = await supabase
            .from('itens')
            .select('*')
            .eq('pedido_id', pedido.id)

          if (itensError) throw itensError

          return {
            pedido,
            itens: itens || []
          }
        })
      )

      return ordersWithItems
    } catch (error) {
      console.error('Erro ao buscar pedidos (catch):', error)
      if (error instanceof Error) {
        throw new Error(`Erro ao buscar pedidos: ${error.message}`)
      } else {
        throw new Error(`Erro desconhecido ao buscar pedidos: ${JSON.stringify(error)}`)
      }
    }
  }

  // Buscar pedido por ID
  static async getOrderById(id: string): Promise<OrderWithItems | null> {
    try {
      const { data: pedido, error: pedidoError } = await supabase
        .from('pedidos')
        .select('*')
        .eq('id', id)
        .single()

      if (pedidoError) throw pedidoError

      const { data: itens, error: itensError } = await supabase
        .from('itens')
        .select('*')
        .eq('pedido_id', id)

      if (itensError) throw itensError

      return {
        pedido,
        itens: itens || []
      }
    } catch (error) {
      console.error('Erro ao buscar pedido:', error)
      return null
    }
  }

  // Atualizar status do pedido
  static async updateOrderStatus(id: string, status: Pedido['status']): Promise<void> {
    try {
      const { error } = await supabase
        .from('pedidos')
        .update({ status })
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      throw error
    }
  }

  // Buscar pedidos por status
  static async getOrdersByStatus(status: Pedido['status']): Promise<OrderWithItems[]> {
    try {
      const { data: pedidos, error: pedidosError } = await supabase
        .from('pedidos')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false })

      if (pedidosError) throw pedidosError

      // Buscar itens para cada pedido
      const ordersWithItems = await Promise.all(
        pedidos.map(async (pedido) => {
          const { data: itens, error: itensError } = await supabase
            .from('itens')
            .select('*')
            .eq('pedido_id', pedido.id)

          if (itensError) throw itensError

          return {
            pedido,
            itens: itens || []
          }
        })
      )

      return ordersWithItems
    } catch (error) {
      console.error('Erro ao buscar pedidos por status:', error)
      throw error
    }
  }

  // Buscar pedidos por telefone do cliente
  static async getOrdersByPhone(phone: string): Promise<OrderWithItems[]> {
    try {
      const cleanPhone = phone.replace(/\D/g, '');
      const { data: pedidos, error: pedidosError } = await supabase
        .from('pedidos')
        .select('*')
        .order('created_at', { ascending: false });

      if (pedidosError) throw pedidosError;

      // Filtrar manualmente no JS ignorando máscara
      const filtered = pedidos.filter(p => {
        const tel = p.cliente?.telefone ? String(p.cliente.telefone).replace(/\D/g, '') : '';
        return tel.includes(cleanPhone);
      });

      // Buscar itens para cada pedido filtrado
      const ordersWithItems = await Promise.all(
        filtered.map(async (pedido) => {
          const { data: itens, error: itensError } = await supabase
            .from('itens')
            .select('*')
            .eq('pedido_id', pedido.id);

          if (itensError) throw itensError;

          return {
            pedido,
            itens: itens || []
          }
        })
      );

      return ordersWithItems;
    } catch (error) {
      console.error('Erro ao buscar pedidos por telefone:', error);
      throw error;
    }
  }

  // Obter estatísticas dos pedidos
  static async getOrderStats() {
    try {
      const { data: pedidos, error } = await supabase
        .from('pedidos')
        .select('status, total')

      if (error) throw error

      const stats = {
        total: pedidos.length,
        totalValue: pedidos.reduce((sum, p) => sum + p.total, 0),
        byStatus: {
          'Pendente': pedidos.filter(p => p.status === 'Pendente').length,
          'Confirmado': pedidos.filter(p => p.status === 'Confirmado').length,
          'Preparando': pedidos.filter(p => p.status === 'Preparando').length,
          'Pronto': pedidos.filter(p => p.status === 'Pronto').length,
          'Entregando': pedidos.filter(p => p.status === 'Entregando').length,
          'Entregue': pedidos.filter(p => p.status === 'Entregue').length,
          'Cancelado': pedidos.filter(p => p.status === 'Cancelado').length,
        }
      }

      return stats
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
      throw error
    }
  }
} 