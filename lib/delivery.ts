import { supabase, Configuracao } from './supabase'

// Taxas de entrega por bairro
const DELIVERY_FEES_BY_NEIGHBORHOOD: Record<string, number> = {
  "Alterosas": 10.20,
  "André Carloni": 10.30,
  "Bairro de Fátima": 13.00,
  "Barcelona": 4.00,
  "Barro Branco": 2.00,
  "Bicanga": 15.40,
  "Boa Vista I": 10.00,
  "Boa Vista II": 10.50,
  "Campinho da Serra I": 4.00,
  "Campinho da Serra II": 3.00,
  "Cantinho do Céu": 8.00,
  "Carapina Grande": 9.40,
  "Cascata": 7.50,
  "Caçaroca": 6.00,
  "Chácara Parreiral": 9.00,
  "Cidade Pomar": 3.00,
  "Civit I": 9.10,
  "Civit II": 9.30,
  "Colina da Serra": 8.00,
  "Colina de Laranjeiras": 5.00,
  "Divinópolis": 9.00,
  "Eldorado": 3.00,
  "Feu Rosa": 13.40,
  "Hélio Ferraz": 12.00,
  "Jardim Bela Vista": 8.00,
  "Jardim Carapina": 12.00,
  "Jardim Guanabara": 7.00,
  "Jardim Limoeiro": 5.00,
  "Jardim Primavera": 6.30,
  "Jardim Tropical": 5.00,
  "Jardim da Serra": 8.00,
  "José de Anchieta": 6.00,
  "José de Anchieta II": 6.40,
  "José de Anchieta III": 5.50,
  "Laranjeiras Velha": 5.00,
  "Maria Níobe": 6.00,
  "Maringá": 3.00,
  "Mata da Serra": 5.00,
  "Morada de Laranjeiras": 10.00,
  "Nova Carapina I": 1.00,
  "Nova Carapina II": 2.00,
  "Novo Porto Canoa": 3.00,
  "Parque Residencial Mestre Álvaro": 1.00,
  "Pitanga": 3.00,
  "Planalto de Carapina": 6.50,
  "Planalto Serrano": 3.50,
  "Planície da Serra": 6.00,
  "Polo Industrial Tubarão": 3.00,
  "Porto Canoa": 3.00,
  "Santa Luzia": 8.00,
  "Santo Antônio": 7.30,
  "São Domingos": 6.40,
  "São Judas Tadeu": 8.50,
  "Serra Centro": 6.50,
  "Serra Dourada I": 3.00,
  "Serra Dourada II": 3.00,
  "Serra Dourada III": 3.00,
  "Taquara I": 5.00,
  "Taquara II": 5.00,
  "Valparaíso": 7.00,
}

// Configuração padrão de entrega (fallback)
const DEFAULT_DELIVERY_CONFIG = {
  default_fee: 3.00, // Taxa padrão para bairros não listados
  free_delivery_threshold: 50.00, // Pedidos acima de R$ 50 têm entrega grátis
}

export interface DeliveryCalculation {
  neighborhood: string
  deliveryFee: number
  isFreeDelivery: boolean
  estimatedTime: string
  isInDeliveryArea: boolean
}

export async function calculateDeliveryFee(
  customerAddress: string,
  orderTotal: number = 0
): Promise<DeliveryCalculation> {
  try {
    // Buscar configuração do banco de dados
    let config: Configuracao | null = null
    try {
      const { data, error } = await supabase
        .from('configuracao')
        .select('*')
        .eq('id', 1)
        .single()
      
      if (!error && data) {
        config = data
      }
    } catch (error) {
      console.warn('Erro ao buscar configuração, usando padrão:', error)
    }
    
    // Usar configuração do banco ou padrão
    const deliveryConfig = config ? {
      default_fee: config.taxa_base || DEFAULT_DELIVERY_CONFIG.default_fee,
      free_delivery_threshold: DEFAULT_DELIVERY_CONFIG.free_delivery_threshold
    } : DEFAULT_DELIVERY_CONFIG
    
    // Extrair bairro do endereço
    const neighborhood = extractNeighborhoodFromAddress(customerAddress)
    
    // Verificar se o bairro está na lista de entrega
    const isInDeliveryArea = Boolean(neighborhood && DELIVERY_FEES_BY_NEIGHBORHOOD.hasOwnProperty(neighborhood))
    
    // Calcular taxa de entrega
    let deliveryFee = 0
    if (isInDeliveryArea && neighborhood) {
      deliveryFee = DELIVERY_FEES_BY_NEIGHBORHOOD[neighborhood]
    } else {
      deliveryFee = deliveryConfig.default_fee
    }
    
    // Verificar se tem entrega grátis
    const isFreeDelivery = orderTotal >= deliveryConfig.free_delivery_threshold
    
    if (isFreeDelivery) {
      deliveryFee = 0
    }
    
    // Calcular tempo estimado baseado na taxa (aproximação)
    const estimatedTime = getEstimatedTimeByFee(deliveryFee)
    
    return {
      neighborhood: neighborhood || "Bairro não identificado",
      deliveryFee: Math.round(deliveryFee * 100) / 100, // Arredondar para 2 casas decimais
      isFreeDelivery,
      estimatedTime,
      isInDeliveryArea
    }
  } catch (error) {
    console.error('Erro ao calcular taxa de entrega:', error)
    // Em caso de erro, retornar valores padrão
    return {
      neighborhood: "Bairro não identificado",
      deliveryFee: DEFAULT_DELIVERY_CONFIG.default_fee,
      isFreeDelivery: false,
      estimatedTime: "15-30 min",
      isInDeliveryArea: false
    }
  }
}

function extractNeighborhoodFromAddress(address: string): string | null {
  const addressLower = address.toLowerCase()
  
  // Procurar por bairros na lista
  for (const neighborhood of Object.keys(DELIVERY_FEES_BY_NEIGHBORHOOD)) {
    const neighborhoodLower = neighborhood.toLowerCase()
    
    // Verificar se o bairro está no endereço
    if (addressLower.includes(neighborhoodLower)) {
      return neighborhood
    }
  }
  
  // Se não encontrar, tentar extrair bairro comum
  const commonNeighborhoods = [
    "nova carapina", "carapina", "serra dourada", "vista da serra",
    "porto canoa", "campinho da serra", "jardim", "laranjeiras",
    "taquara", "barcelona", "eldorado", "maringá", "pitanga"
  ]
  
  for (const common of commonNeighborhoods) {
    if (addressLower.includes(common)) {
      // Tentar encontrar o bairro completo
      for (const neighborhood of Object.keys(DELIVERY_FEES_BY_NEIGHBORHOOD)) {
        if (neighborhood.toLowerCase().includes(common)) {
          return neighborhood
        }
      }
    }
  }
  
  return null
}

function getEstimatedTimeByFee(fee: number): string {
  if (fee <= 1.50) return "15-20 min"
  if (fee <= 3.00) return "20-30 min"
  if (fee <= 4.00) return "25-35 min"
  return "30-45 min"
}

export function formatDeliveryInfo(calculation: DeliveryCalculation): string {
  if (calculation.isFreeDelivery) {
    return `Entrega grátis (${calculation.estimatedTime})`
  } else {
    const areaInfo = calculation.isInDeliveryArea 
      ? `Bairro: ${calculation.neighborhood}` 
      : "Área não mapeada"
    
    return `Taxa de entrega: R$ ${calculation.deliveryFee.toFixed(2).replace('.', ',')} (${areaInfo} - ${calculation.estimatedTime})`
  }
}

// Função para obter todos os bairros disponíveis
export function getAvailableNeighborhoods(): string[] {
  return Object.keys(DELIVERY_FEES_BY_NEIGHBORHOOD).sort()
}

// Função para obter a taxa de um bairro específico
export function getDeliveryFeeForNeighborhood(neighborhood: string): number {
  return DELIVERY_FEES_BY_NEIGHBORHOOD[neighborhood] || DEFAULT_DELIVERY_CONFIG.default_fee
} 