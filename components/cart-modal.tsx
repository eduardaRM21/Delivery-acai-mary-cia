"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { AddressConfirmationModal } from "./address-confirmation-modal"
import { OrderDetailsModal, type OrderDetails } from "./order-details-modal"
import { useCart } from "@/contexts/CartContext"
import { OrderService } from "@/lib/order-service"
import { toast } from "sonner"

interface CartModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CartModal({ isOpen, onClose }: CartModalProps) {
  const { state, removeItem, updateQuantity, clearCart } = useCart()
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
  const [isOrderDetailsModalOpen, setIsOrderDetailsModalOpen] = useState(false)
  const [confirmedAddress, setConfirmedAddress] = useState("")

  const handleAddressConfirm = (address: string) => {
    setConfirmedAddress(address)
    setIsAddressModalOpen(false)
    setIsOrderDetailsModalOpen(true)
  }

  const handleOrderDetailsConfirm = async (details: OrderDetails) => {
    try {
      // Preparar dados do pedido
      const orderData = {
        customerName: details.name,
        customerPhone: details.phone,
        customerAddress: details.deliveryType === 'delivery' ? confirmedAddress : 'Retirada na loja',
        items: state.items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          toppings: item.toppings,
          fruits: item.fruits,
          extras: item.extras,
          additionals: item.additionals
        })),
        paymentMethod: details.paymentMethod,
        notes: `${details.deliveryType === 'delivery' ? 'Entrega' : 'Retirada'}`
      }

      // Salvar pedido no banco de dados
      const savedOrder = await OrderService.createOrder(orderData)
      
      // Mostrar mensagem de sucesso
      toast.success(`Pedido #${savedOrder.pedido.numero_pedido} criado com sucesso!`)
      
      // Preparar mensagem para WhatsApp
      const formatItems = (items: string[]) => {
        return items.join(", ")
      }

      const formatAdditionals = (additionals: { nome: string; preco: number; quantidade: number }[]) => {
        return additionals.map(additional => 
          `${additional.nome} x${additional.quantidade} - R$ ${(additional.preco * additional.quantidade).toFixed(2).replace(".", ",")}`
        ).join("\n")
      }

      let message = `Olá, gostaria de fazer um pedido!\n\n*Pedido #${savedOrder.pedido.numero_pedido}*\n\n`

      state.items.forEach((item, index) => {
        message += `*${item.name} x${item.quantity}*\n`
        if (item.toppings.length > 0) {
          message += `Coberturas: ${formatItems(item.toppings)}\n`
        }
        if (item.fruits.length > 0) {
          message += `Frutas: ${formatItems(item.fruits)}\n`
        }
        if (item.extras.length > 0) {
          message += `Complementos: ${formatItems(item.extras)}\n`
        }
        if (item.additionals.length > 0) {
          message += `Adicionais:\n${formatAdditionals(item.additionals)}\n`
        }
        message += `\n`
      })

      message += `*Dados do Cliente:*\nNome: ${details.name}\nTelefone: ${details.phone}\n\n`
      message += `*Tipo de Entrega:* ${details.deliveryType === 'delivery' ? 'Entrega' : 'Retirada'}\n`
      
      if (details.deliveryType === 'delivery') {
        message += `\n*Endereço/Localização:*\n${confirmedAddress}\n`
      }
      
      message += `\n*Forma de Pagamento:* ${
        {
          pix: 'PIX',
          credito: 'Cartão de Crédito',
          debito: 'Cartão de Débito',
          dinheiro: 'Dinheiro'
        }[details.paymentMethod]
      }\n\n`
      
      message += `*Valor Total: R$ ${state.total.toFixed(2).replace(".", ",")}*`

      const encodedMessage = encodeURIComponent(message)
      window.open(`https://wa.me/27988646488?text=${encodedMessage}`, "_blank")
      
      // Limpar carrinho e fechar modais
      clearCart()
      setIsOrderDetailsModalOpen(false)
      onClose()
      
    } catch (error) {
      console.error('Erro ao criar pedido:', error)
      toast.error('Erro ao criar pedido. Tente novamente.')
    }
  }

  const handleCheckout = () => {
    if (state.items.length === 0) {
      toast.error('Carrinho vazio!')
      return
    }
    setIsAddressModalOpen(true)
  }

  const formatPrice = (price: number) => {
    return `R$ ${price.toFixed(2).replace(".", ",")}`
  }

  if (state.items.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <ShoppingCart className="h-6 w-6" />
              Carrinho
            </DialogTitle>
          </DialogHeader>
          
          <div className="text-center py-8">
            <ShoppingCart className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">Seu carrinho está vazio</p>
            <p className="text-sm text-gray-500 mt-2">Adicione produtos para começar</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <ShoppingCart className="h-6 w-6" />
              Carrinho ({state.itemCount} {state.itemCount === 1 ? 'item' : 'itens'})
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {state.items.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 bg-white">
                <div className="flex gap-4">
                  <div className="relative w-20 h-20 flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-700"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      {item.toppings.length > 0 && (
                        <p><span className="font-medium">Coberturas:</span> {item.toppings.join(", ")}</p>
                      )}
                      {item.fruits.length > 0 && (
                        <p><span className="font-medium">Frutas:</span> {item.fruits.join(", ")}</p>
                      )}
                      {item.extras.length > 0 && (
                        <p><span className="font-medium">Complementos:</span> {item.extras.join(", ")}</p>
                      )}
                      {item.additionals.length > 0 && (
                        <div>
                          <span className="font-medium">Adicionais:</span>
                          {item.additionals.map((additional, index) => (
                            <p key={index} className="ml-2">
                              {additional.nome} x{additional.quantidade} - {formatPrice(additional.preco * additional.quantidade)}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm text-gray-500">R$ {item.price.toFixed(2).replace(".", ",")} cada</p>
                        <p className="font-bold text-lg">
                          {formatPrice(item.totalPrice * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter className="mt-6">
            <div className="flex flex-col sm:flex-row gap-2 w-full justify-between items-center">
              <div className="text-left">
                <p className="text-sm text-gray-600">Total ({state.itemCount} {state.itemCount === 1 ? 'item' : 'itens'})</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatPrice(state.total)}
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={clearCart}
                  className="text-red-600 hover:text-red-700"
                >
                  Limpar Carrinho
                </Button>
                <Button
                  onClick={handleCheckout}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Finalizar Pedido
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