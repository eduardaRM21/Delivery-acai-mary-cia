const ORDER_PREFIX = 'AM' // Açaí Mary

export function generateOrderNumber(): string {
  const now = new Date()
  const year = now.getFullYear().toString().slice(-2)
  const startOfYear = new Date(now.getFullYear(), 0, 0)
  const diff = now.getTime() - startOfYear.getTime()
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24))
    .toString()
    .padStart(3, '0')
  
  // Gera um número aleatório entre 0-999
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  
  // Formato: AM + YY + DDD + RRR
  // Exemplo: AM23045123 (AM + 23 + 045 + 123)
  // AM = Açaí Mary
  // 23 = Ano 2023
  // 045 = 45º dia do ano
  // 123 = Número aleatório para garantir unicidade
  return `${ORDER_PREFIX}${year}${dayOfYear}${random}`
} 