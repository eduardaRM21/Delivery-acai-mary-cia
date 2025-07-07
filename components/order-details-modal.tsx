"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface OrderDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (details: OrderDetails) => void
}

export interface OrderDetails {
  name: string
  phone: string
  deliveryType: "delivery" | "pickup"
  paymentMethod: string
}

export function OrderDetailsModal({
  isOpen,
  onClose,
  onConfirm,
}: OrderDetailsModalProps) {
  const [details, setDetails] = useState<OrderDetails>({
    name: "",
    phone: "",
    deliveryType: "delivery",
    paymentMethod: "",
  })

  const [errors, setErrors] = useState({
    name: false,
    phone: false,
    paymentMethod: false,
  })

  const validateForm = () => {
    const newErrors = {
      name: !details.name.trim(),
      phone: !details.phone.trim() || !/^\(\d{2}\) \d{5}-\d{4}$/.test(details.phone),
      paymentMethod: !details.paymentMethod,
    }
    setErrors(newErrors)
    return !Object.values(newErrors).some(Boolean)
  }

  const handlePhoneChange = (value: string) => {
    // Remove tudo que não for número
    let numbers = value.replace(/\D/g, "")
    
    // Limita a 11 dígitos
    numbers = numbers.slice(0, 11)
    
    // Formata o número
    let formattedPhone = numbers
    if (numbers.length > 0) {
      formattedPhone = `(${numbers.slice(0, 2)}`
      if (numbers.length > 2) {
        formattedPhone += `) ${numbers.slice(2, 7)}`
        if (numbers.length > 7) {
          formattedPhone += `-${numbers.slice(7)}`
        }
      }
    }

    setDetails(prev => ({ ...prev, phone: formattedPhone }))
  }

  const handleSubmit = () => {
    if (validateForm()) {
      onConfirm(details)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Detalhes do Pedido</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={details.name}
              onChange={(e) => setDetails(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Seu nome completo"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <span className="text-sm text-red-500">Nome é obrigatório</span>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={details.phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="(27) 99999-9999"
              className={errors.phone ? "border-red-500" : ""}
            />
            {errors.phone && (
              <span className="text-sm text-red-500">Telefone inválido</span>
            )}
          </div>

          <div className="space-y-2">
            <Label>Tipo de Entrega</Label>
            <RadioGroup
              value={details.deliveryType}
              onValueChange={(value: "delivery" | "pickup") => 
                setDetails(prev => ({ ...prev, deliveryType: value }))
              }
              className="flex flex-col gap-4"
            >
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="delivery" id="delivery" />
                <div className="flex flex-col">
                  <Label htmlFor="delivery" className="font-medium">Entrega</Label>
                  <span className="text-sm text-gray-500">Aprox. 20 a 45 mins</span>
                </div>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="pickup" id="pickup" />
                <div className="flex flex-col">
                  <Label htmlFor="pickup" className="font-medium">Retirada</Label>
                  <span className="text-sm text-gray-500">Aprox. 15 a 20 mins</span>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Forma de Pagamento</Label>
            <Select
              value={details.paymentMethod}
              onValueChange={(value) => setDetails(prev => ({ ...prev, paymentMethod: value }))}
            >
              <SelectTrigger className={errors.paymentMethod ? "border-red-500" : ""}>
                <SelectValue placeholder="Selecione a forma de pagamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="credito">Cartão de Crédito</SelectItem>
                <SelectItem value="debito">Cartão de Débito</SelectItem>
                <SelectItem value="dinheiro">Dinheiro</SelectItem>
              </SelectContent>
            </Select>
            {errors.paymentMethod && (
              <span className="text-sm text-red-500">Selecione uma forma de pagamento</span>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            Confirmar Pedido
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 