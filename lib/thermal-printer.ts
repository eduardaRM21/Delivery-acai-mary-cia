import { Pedido, Item } from './supabase'

export interface PrinterConfig {
  width: number // Largura da impressora em caracteres
  fontSize: 'small' | 'medium' | 'large'
  bold: boolean
  align: 'left' | 'center' | 'right'
}

export class ThermalPrinter {
  private config: PrinterConfig

  constructor(config: Partial<PrinterConfig> = {}) {
    this.config = {
      width: 32, // Largura padrão para impressora 58mm
      fontSize: 'large', // Fonte maior para melhor legibilidade
      bold: false, // Negrito apenas para destaques
      align: 'left',
      ...config
    }
  }

  private centerText(text: string): string {
    const padding = Math.max(0, Math.floor((this.config.width - text.length) / 2))
    return ' '.repeat(padding) + text
  }

  private rightAlignText(text: string): string {
    const padding = Math.max(0, this.config.width - text.length)
    return ' '.repeat(padding) + text
  }

  private formatPrice(price: number): string {
    return `R$ ${price.toFixed(2).replace('.', ',')}`
  }

  private formatDateTime(date: string): string {
    const d = new Date(date)
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  private processBoldText(text: string): string {
    // Processa texto com **texto** para negrito
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  }

  generateOrderReceipt(pedido: Pedido, itens: Item[]): string {
    const lines: string[] = []
    
    // Cabeçalho
    lines.push('='.repeat(this.config.width))
    lines.push(this.centerText('**AÇAÍ DA MARY & CIA**'))
    lines.push(this.centerText('Rua Resplendor, 85'))
    lines.push(this.centerText('Nova Caparapina I'))
    lines.push(this.centerText('Serra - ES'))
    lines.push(this.centerText('(27) 98864-6488'))
    lines.push('='.repeat(this.config.width))
    
    // Pedido e data
    lines.push('')
    lines.push(`**PEDIDO #${pedido.numero_pedido}**`)
    lines.push(`Data: ${this.formatDateTime(pedido.created_at)}`)
    lines.push('-'.repeat(this.config.width))
    
    // Itens do pedido
    itens.forEach((item, index) => {
      // Nome do produto com quantidade
      const itemLine = `${item.qtd}x ${item.nome}`
      if (itemLine.length > this.config.width - 12) {
        // Quebrar linha se muito longo
        const words = item.nome.split(' ')
        let currentLine = `${item.qtd}x `
        let priceAdded = false
        
        words.forEach(word => {
          if ((currentLine + word).length > this.config.width - 12) {
            if (!priceAdded) {
              lines.push(currentLine.padEnd(this.config.width - 12) + this.rightAlignText(this.formatPrice(item.preco * item.qtd)))
              priceAdded = true
            } else {
              lines.push(currentLine)
            }
            currentLine = `   ${word} `
          } else {
            currentLine += word + ' '
          }
        })
        
        if (currentLine.trim()) {
          if (!priceAdded) {
            lines.push(currentLine.padEnd(this.config.width - 12) + this.rightAlignText(this.formatPrice(item.preco * item.qtd)))
          } else {
            lines.push(currentLine)
          }
        }
      } else {
        lines.push(itemLine.padEnd(this.config.width - 12) + this.rightAlignText(this.formatPrice(item.preco * item.qtd)))
      }
      
      // Coberturas
      if (item.adicionais?.coberturas && item.adicionais.coberturas.length > 0) {
        lines.push('  Coberturas:')
        item.adicionais.coberturas.forEach((cob: string) => {
          lines.push(`    ${cob}`)
        })
      }
      // Complementos
      if (item.adicionais?.complementos && item.adicionais.complementos.length > 0) {
        lines.push('  Complementos:')
        item.adicionais.complementos.forEach((comp: string) => {
          lines.push(`    ${comp}`)
        })
      }
      // Frutas
      if (item.adicionais?.frutas && item.adicionais.frutas.length > 0) {
        lines.push('  Frutas:')
        item.adicionais.frutas.forEach((fruta: string) => {
          lines.push(`    ${fruta}`)
        })
      }
      // Adicionais
      if (item.adicionais?.extras && item.adicionais.extras.length > 0) {
        lines.push('  Adicionais:')
        item.adicionais.extras.forEach((extra: any) => {
          lines.push(`    ${extra.nome} x${extra.quantidade}`)
          lines.push(`      ${this.formatPrice(extra.preco * extra.quantidade)}`)
        })
      }
              lines.push('')
    })
    lines.push('-'.repeat(this.config.width))
    
    // Totais
    const subtotal = itens.reduce((sum: number, item: Item) => sum + (item.preco * item.qtd), 0)
    lines.push(`Subtotal:`.padEnd(this.config.width - 12) + this.rightAlignText(this.formatPrice(subtotal)))
    if (pedido.desconto > 0) {
      lines.push(`Desconto:`.padEnd(this.config.width - 12) + this.rightAlignText('-' + this.formatPrice(pedido.desconto)))
    }
    if (pedido.taxa_entrega > 0) {
      lines.push(`Entrega:`.padEnd(this.config.width - 12) + this.rightAlignText(this.formatPrice(pedido.taxa_entrega)))
    }
    lines.push('**TOTAL:**'.padEnd(this.config.width - 12) + this.rightAlignText(`**${this.formatPrice(pedido.total)}**`))
    lines.push('-'.repeat(this.config.width))
    
    // Observações
    if (pedido.obs) {
      lines.push('**OBSERVAÇÕES:**')
      // Quebrar observações longas
      const maxLength = 30
      const words = pedido.obs.split(' ')
      let currentLine = ''
      
      words.forEach(word => {
        if ((currentLine + word).length > maxLength) {
          if (currentLine.trim()) {
            lines.push(`  ${currentLine.trim()}`)
          }
          currentLine = word + ' '
        } else {
          currentLine += word + ' '
        }
      })
      
      if (currentLine.trim()) {
        lines.push(`  ${currentLine.trim()}`)
      }
      lines.push('-'.repeat(this.config.width))
    }
    
    // Endereço de entrega
    lines.push('**ENTREGA:**')
    if (pedido.cliente?.endereco) {
      const endereco = pedido.cliente.endereco
      // Quebrar endereço em linhas de no máximo 30 caracteres (deixando margem)
      const maxLength = 30
      let currentLine = ''
      const words = endereco.split(' ')
      
      words.forEach(word => {
        if ((currentLine + word).length > maxLength) {
          if (currentLine.trim()) {
            lines.push(`  ${currentLine.trim()}`)
          }
          currentLine = word + ' '
        } else {
          currentLine += word + ' '
        }
      })
      
      if (currentLine.trim()) {
        lines.push(`  ${currentLine.trim()}`)
      }
    } else {
      lines.push('  Retirada no local')
    }
    lines.push('-'.repeat(this.config.width))
    
    // Forma de pagamento
    lines.push('**PAGAMENTO:**')
    lines.push(`  ${this.getPaymentMethodText(pedido.pagamento || 'dinheiro')}`)
    lines.push('-'.repeat(this.config.width))
    
    // Cliente
    lines.push('**CLIENTE:**')
    lines.push(`  ${pedido.cliente?.nome || 'Não informado'}`)
    lines.push(`  ${pedido.cliente?.telefone || 'Não informado'}`)
    lines.push('-'.repeat(this.config.width))
    
    // Rodapé
    lines.push(this.centerText('**Obrigado pela preferência!**'))
    lines.push(this.centerText('**Mary & Cia**'))
    lines.push('')
    lines.push('') // Espaço para cortar o papel
    
    return lines.join('\n')
  }

  private getStatusText(status: Pedido['status']): string {
    const statusMap = {
      'Pendente': 'PENDENTE',
      'Confirmado': 'CONFIRMADO',
      'Preparando': 'PREPARANDO',
      'Pronto': 'PRONTO',
      'Entregando': 'ENTREGANDO',
      'Entregue': 'ENTREGUE',
      'Cancelado': 'CANCELADO'
    }
    return statusMap[status]
  }

  private getPaymentMethodText(method: string): string {
    const methodMap: { [key: string]: string } = {
      'dinheiro': 'DINHEIRO',
      'pix': 'PIX',
      'cartao': 'CARTÃO',
      'cash': 'DINHEIRO',
      'card': 'CARTÃO'
    }
    return methodMap[method.toLowerCase()] || method.toUpperCase()
  }

  // Função para imprimir usando a API de impressão do navegador
  async printOrder(pedido: Pedido, itens: Item[]): Promise<void> {
    const receipt = this.generateOrderReceipt(pedido, itens)
    
    try {
      // Tentar usar a API de impressão do navegador
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Pedido #${pedido.numero_pedido}</title>
              <style>
                body {
                  font-family: 'Courier New', monospace;
                  font-size: 12px;
                  line-height: 1.2;
                  margin: 0;
                  padding: 5px;
                  white-space: pre-wrap;
                  width: 58mm;
                  max-width: 58mm;
                  color: #000;
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
                strong {
                  font-weight: bold;
                }
                @media print {
                  body { 
                    margin: 0; 
                    padding: 0;
                    width: 58mm;
                    color: #000 !important;
                    font-size: 12px !important;
                  }
                  strong {
                    font-weight: bold !important;
                  }
                  @page {
                    size: 58mm auto;
                    margin: 0;
                  }
                  * {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                  }
                }
              </style>
            </head>
            <body>${this.processBoldText(receipt)}</body>
          </html>
        `)
        printWindow.document.close()
        printWindow.print()
        printWindow.close()
      }
    } catch (error) {
      console.error('Erro ao imprimir:', error)
      // Fallback: mostrar o recibo em uma nova janela
      const newWindow = window.open('', '_blank')
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head>
              <title>Pedido #${pedido.numero_pedido}</title>
              <style>
                body {
                  font-family: 'Courier New', monospace;
                  font-size: 12px;
                  line-height: 1.2;
                  margin: 20px;
                  white-space: pre-wrap;
                  width: 58mm;
                  max-width: 58mm;
                  color: #000;
                }
                pre {
                  margin: 0;
                  font-family: inherit;
                  color: #000;
                }
                strong {
                  font-weight: bold;
                }
                button {
                  margin-top: 20px;
                  padding: 10px 20px;
                  background: #007bff;
                  color: white;
                  border: none;
                  border-radius: 5px;
                  cursor: pointer;
                }
                button:hover {
                  background: #0056b3;
                }
              </style>
            </head>
            <body>
              <h3>Recibo do Pedido #${pedido.numero_pedido}</h3>
              <pre>${this.processBoldText(receipt)}</pre>
              <button onclick="window.print()">Imprimir</button>
            </body>
          </html>
        `)
        newWindow.document.close()
      }
    }
  }
} 