"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Minus, Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { AddressConfirmationModal } from "./address-confirmation-modal"
import { OrderDetailsModal, type OrderDetails } from "./order-details-modal"
import { generateOrderNumber } from "@/lib/order-number"
import { OrderService } from "@/lib/order-service"
import { useCart } from "@/contexts/CartContext"
import { toast } from "sonner"

interface Topping {
  name: string
  available: boolean
  isAdditional?: boolean
  price?: number
  quantity?: number
}

interface ProductModalProps {
  isOpen: boolean
  onClose: () => void
  product: {
    name: string
    price: string
    image: string
    description?: string
    ingredients: string
  }
}

interface SelectedItem extends Topping {
  quantity: number
}

export function ProductModal({ isOpen, onClose, product }: ProductModalProps) {
  const { addItem } = useCart()
  const [selectedToppings, setSelectedToppings] = useState<SelectedItem[]>([])
  const [selectedFruits, setSelectedFruits] = useState<SelectedItem[]>([])
  const [selectedExtras, setSelectedExtras] = useState<SelectedItem[]>([])
  const [selectedAdditionals, setSelectedAdditionals] = useState<SelectedItem[]>([])
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
  const [isOrderDetailsModalOpen, setIsOrderDetailsModalOpen] = useState(false)
  const [confirmedAddress, setConfirmedAddress] = useState("")
  const [orderNumber, setOrderNumber] = useState<string>("")

  // Definindo limites baseados no produto
  const limits = {
    toppings: product.name === "Açaí Kids" ? 0 : 
              product.name === "Açaí 300ml" ? 1 :
              product.name === "Açaí 500 ml" ? 1 :
              2, // Para 700ml e 1 Litro
    fruits: product.name === "Açaí Kids" ? 1 : // Apenas banana
            product.name === "Açaí 300ml" ? 1 :
            2, // Para 500ml, 700ml e 1 Litro
    extras: product.name === "Açaí Kids" ? 1 : // Apenas granola
            product.name === "Açaí 300ml" ? 3 :
            product.name === "Açaí 500 ml" ? 3 :
            product.name === "Açaí 700ml" ? 4 :
            5, // Para 1 Litro
  }

  const toppings: Topping[] = [
    { name: "Leite condensado", available: true },
    { name: "Chocolate", available: true },
    { name: "Morango", available: true },
    { name: "Doce de leite", available: true },
    { name: "Menta", available: true },
    
  ]

  const fruits: Topping[] = [
    { name: "Banana", available: true },
    { name: "Morango", available: true },
    { name: "Manga", available: true },
    { name: "Uva", available: true },
  ]

  const extras: Topping[] = [
    { name: "Granola", available: true },
    { name: "Paçoca", available: true },
    { name: "Leite em pó", available: true },
    { name: "Amendoim", available: true },
    { name: "Farinha láctea", available: true },
    { name: "Ovomaltine", available: true },
    { name: "Gotas de chocolate", available: true },
    { name: "Confete", available: true },
    { name: "Sucrilhos", available: true },
    { name: "Aveia", available: true },
    { name: "Granulado", available: true },
    { name: "Flocos de Arroz", available: true },
  ]

  const additionals: Topping[] = [
    { name: "Brigadeiro de Choccolate (70% cacau)", available: true, isAdditional: true, price: 3.00 },
    { name: "Brigadeiro de Ninho", available: true, isAdditional: true, price: 3.00 },
    { name: "Kit Kat", available: true, isAdditional: true, price: 3.00 },
    { name: "Bis", available: true, isAdditional: true, price: 2.50 },
  ]

  const handleQuantityChange = (
    item: Topping,
    action: 'increase' | 'decrease',
    type: 'topping' | 'fruit' | 'extra' | 'additional'
  ) => {
    const setFunction = {
      topping: setSelectedToppings,
      fruit: setSelectedFruits,
      extra: setSelectedExtras,
      additional: setSelectedAdditionals,
    }[type]

    const currentItems = {
      topping: selectedToppings,
      fruit: selectedFruits,
      extra: selectedExtras,
      additional: selectedAdditionals,
    }[type]

    const maxItems = {
      topping: limits.toppings,
      fruit: limits.fruits,
      extra: limits.extras,
      additional: product.name === "Açaí Kids" ? 0 : 100,
    }[type]

    // Restrições especiais para Açaí Kids
    if (product.name === "Açaí Kids") {
      if (type === "fruit" && item.name !== "Banana") return
      if (type === "extra" && item.name !== "Granola") return
      if (type === "topping" || type === "additional") return
    }

    setFunction(prev => {
      const existingItem = prev.find(i => i.name === item.name)
      const totalQuantity = prev.reduce((sum, i) => sum + i.quantity, 0)

      if (existingItem) {
        if (action === 'decrease' && existingItem.quantity === 1) {
          return prev.filter(i => i.name !== item.name)
        }
        return prev.map(i => {
          if (i.name === item.name) {
            return {
              ...i,
              quantity: action === 'increase' ? i.quantity + 1 : i.quantity - 1
            }
          }
          return i
        })
      } else if (action === 'increase') {
        if (totalQuantity < maxItems) {
          return [...prev, { ...item, quantity: 1 }]
        }
      }
      return prev
    })
  }

  const calculateTotalPrice = () => {
    const basePrice = parseFloat(product.price.replace("R$ ", "").replace(",", "."))
    const additionalPrice = selectedAdditionals.reduce((total, additional) => {
      return total + (additional.price! * additional.quantity)
    }, 0)
    return (basePrice + additionalPrice).toFixed(2).replace(".", ",")
  }

  const handleAddressConfirm = (address: string) => {
    setConfirmedAddress(address)
    setIsAddressModalOpen(false)
    setIsOrderDetailsModalOpen(true)
  }

  const handleOrderDetailsConfirm = async (details: OrderDetails) => {
    try {
      const totalPrice = calculateTotalPrice()
      
      // Preparar dados do pedido
      const orderData = {
        customerName: details.name,
        customerPhone: details.phone,
        customerAddress: details.deliveryType === 'delivery' ? confirmedAddress : 'Retirada na loja',
        items: [{
          name: product.name,
          quantity: 1,
          price: parseFloat(product.price.replace("R$ ", "").replace(",", ".")),
          toppings: selectedToppings.map(item => item.name),
          fruits: selectedFruits.map(item => item.name),
          extras: selectedExtras.map(item => item.name),
          additionals: selectedAdditionals.map(item => ({
            nome: item.name,
            preco: item.price!,
            quantidade: item.quantity
          }))
        }],
        paymentMethod: details.paymentMethod,
        notes: `${details.deliveryType === 'delivery' ? 'Entrega' : 'Retirada'}`
      }

      // Salvar pedido no banco de dados
      const savedOrder = await OrderService.createOrder(orderData)
      
      // Mostrar mensagem de sucesso
      toast.success(`Pedido #${savedOrder.pedido.numero_pedido} criado com sucesso!`)
      
      // Preparar mensagem para WhatsApp
      const formatItems = (items: SelectedItem[]) => {
        return items.map(item => {
          const price = item.isAdditional ? ` - R$ ${(item.price! * item.quantity).toFixed(2).replace(".", ",")}` : ""
          return `${item.name} x${item.quantity}${price}`
        }).join("\n")
      }

      const message = `Olá, gostaria de fazer um pedido!\n\n*Pedido #${savedOrder.pedido.numero_pedido}*\n\n*${product.name}*\n${selectedToppings.length > 0 ? `\n*Coberturas:*\n${formatItems(selectedToppings)}` : ""}\n${selectedExtras.length > 0 ? `\n*Complementos:*\n${formatItems(selectedExtras)}` : ""}\n${selectedFruits.length > 0 ? `\n*Frutas:*\n${formatItems(selectedFruits)}` : ""}\n${selectedAdditionals.length > 0 ? `\n*Adicionais:*\n${formatItems(selectedAdditionals)}` : ""}\n\n*Dados do Cliente:*\nNome: ${details.name}\nTelefone: ${details.phone}\n\n*Tipo de Entrega:* ${details.deliveryType === 'delivery' ? 'Entrega' : 'Retirada'}\n${details.deliveryType === 'delivery' ? `\n*Endereço/Localização:*\n${confirmedAddress}` : ''}\n\n*Forma de Pagamento:* ${
  {
    pix: 'PIX',
    credito: 'Cartão de Crédito',
    debito: 'Cartão de Débito',
    dinheiro: 'Dinheiro'
  }[details.paymentMethod]
}\n\n*Valor Total: R$ ${totalPrice}*`

      const encodedMessage = encodeURIComponent(message)
      window.open(`https://wa.me/27988646488?text=${encodedMessage}`, "_blank")
      
      setIsOrderDetailsModalOpen(false)
      onClose()
      
    } catch (error) {
      console.error('Erro ao criar pedido:', error)
      toast.error('Erro ao criar pedido. Tente novamente.')
    }
  }

  const handleAddToCart = () => {
    const basePrice = parseFloat(product.price.replace("R$ ", "").replace(",", "."))
    const additionalPrice = selectedAdditionals.reduce((total, additional) => {
      return total + (additional.price! * additional.quantity)
    }, 0)
    const totalPrice = basePrice + additionalPrice

    addItem({
      name: product.name,
      price: basePrice,
      image: product.image,
      quantity: 1,
      toppings: selectedToppings.map(item => item.name),
      fruits: selectedFruits.map(item => item.name),
      extras: selectedExtras.map(item => item.name),
      additionals: selectedAdditionals.map(item => ({
        nome: item.name,
        preco: item.price!,
        quantidade: item.quantity
      })),
      totalPrice: totalPrice
    })

    toast.success(`${product.name} adicionado ao carrinho!`)
    handleClearSelections()
  }

  const handleWhatsAppOrder = () => {
    const newOrderNumber = generateOrderNumber()
    setOrderNumber(newOrderNumber)
    setIsAddressModalOpen(true)
  }   

  const handleClearSelections = () => {
    setSelectedToppings([])
    setSelectedFruits([])
    setSelectedExtras([])
    setSelectedAdditionals([])
  }

  const ItemQuantityControl = ({ 
    item, 
    type,
    selected,
    disabled,
    totalSelected
  }: { 
    item: Topping
    type: 'topping' | 'fruit' | 'extra' | 'additional'
    selected?: SelectedItem
    disabled: boolean
    totalSelected: number
  }) => {
    const maxByType = {
      topping: limits.toppings,
      fruit: limits.fruits,
      extra: limits.extras,
      additional: 100, // limite alto para adicionais pagos
    }[type]
  
    return (
      <div className="flex items-center justify-between w-full p-2 border rounded-lg bg-white">
        <div className="flex flex-col">
          <span className="font-medium">{item.name}</span>
          {item.isAdditional && (
            <span className="text-sm text-gray-500">
              R$ {item.price?.toFixed(2).replace(".", ",")}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleQuantityChange(item, 'decrease', type)}
            disabled={!selected || selected.quantity <= 0}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-6 text-center">{selected?.quantity || 0}</span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleQuantityChange(item, 'increase', type)}
            disabled={
              disabled || totalSelected >= maxByType
            }
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
}

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{product.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="relative w-full h-64">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover rounded-lg"
              />
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">Valor: {product.price}</h3>
              {product.description && (
                <p className="text-gray-600">{product.description}</p>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">COBERTURAS (Máximo {limits.toppings})</h3>
              <div className="flex flex-col gap-2">
                {toppings.map((topping) => {
                  const isSelected = selectedToppings.find(t => t.name === topping.name)
                  const totalSelected = selectedToppings.reduce((sum, t) => sum + t.quantity, 0)

                  return (
                    <ItemQuantityControl
                      key={topping.name}
                      item={topping}
                      type="topping"
                      selected={isSelected}
                      disabled={!topping.available || (!isSelected && totalSelected >= limits.toppings)}
                      totalSelected={totalSelected}
                    />
                  )
                })}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">FRUTAS (Máximo {limits.fruits})</h3>
              <div className="flex flex-col gap-2">
                {fruits.map((fruit) => {
                  const isSelected = selectedFruits.find(f => f.name === fruit.name)
                  const totalSelected = selectedFruits.reduce((sum, f) => sum + f.quantity, 0)

                  return (
                    <ItemQuantityControl
                    key={fruit.name}
                    item={fruit}  
                    type="fruit"
                    selected={isSelected}
                    disabled={!fruit.available || (!isSelected && totalSelected >= limits.fruits)}
                    totalSelected={totalSelected}
                  />
                  )
                })}
              </div>
            </div>

            <div>
            <h3 className="text-lg font-semibold mb-3">COMPLEMENTOS (Máximo {limits.extras})</h3>
  <div className="flex flex-col gap-2">
    {extras.map((extra) => {
      const isSelected = selectedExtras.find(e => e.name === extra.name)
      const totalSelected = selectedExtras.reduce((sum, e) => sum + e.quantity, 0)

      return (
        <ItemQuantityControl
          key={extra.name}
          item={extra}
          type="extra"
          selected={isSelected}
          disabled={!extra.available || (!isSelected && totalSelected >= limits.extras)}
          totalSelected={totalSelected}
        />
      )
    })}
  </div>
</div>

            <div>
              <h3 className="text-lg font-semibold mb-3">ADICIONAIS</h3>
              <div className="flex flex-col gap-2">
                {additionals.map((additional) => {
                  const isSelected = selectedAdditionals.find(a => a.name === additional.name)
                  const totalSelected = selectedAdditionals.reduce((sum, a) => sum + a.quantity, 0)

                  return (
                    <ItemQuantityControl
                      key={additional.name}
                      item={additional}
                      type="additional"
                      selected={isSelected}
                      disabled={!additional.available}
                      totalSelected={totalSelected}
                    />
                  )
                })}
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <div className="flex flex-col sm:flex-row gap-2 w-full justify-between items-center">
              <Button
                variant="outline"
                onClick={handleClearSelections}
              >
                Limpar Seleções
              </Button>
              <div className="flex gap-2">
                <Button
                  onClick={handleAddToCart}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Adicionar ao Carrinho
                </Button>
                <Button
                  onClick={handleWhatsAppOrder}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Pedir Agora - R$ {calculateTotalPrice()}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AddressConfirmationModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onConfirm={handleAddressConfirm}
      />

      <OrderDetailsModal
        isOpen={isOrderDetailsModalOpen}
        onClose={() => setIsOrderDetailsModalOpen(false)}
        onConfirm={handleOrderDetailsConfirm}
      />
    </>
  )
} 