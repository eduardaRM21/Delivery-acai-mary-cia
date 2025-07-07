"use client"

import { useState, useEffect } from "react"
import { MapPin, Edit } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getAvailableNeighborhoods, getDeliveryFeeForNeighborhood } from "@/lib/delivery"

interface AddressConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (address: string) => void
}

// Schema de validação para o endereço
const addressSchema = z.object({
  street: z.string().min(3, "Rua deve ter pelo menos 3 caracteres"),
  number: z.string().min(1, "Número é obrigatório"),
  neighborhood: z.string().min(2, "Bairro deve ter pelo menos 2 caracteres"),
  city: z.string().min(2, "Cidade deve ter pelo menos 2 caracteres"),
  complement: z.string().optional(),
})

type AddressFormData = z.infer<typeof addressSchema>

export function AddressConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
}: AddressConfirmationModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formattedAddress, setFormattedAddress] = useState("")
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("")
  const [deliveryFee, setDeliveryFee] = useState<number | null>(null)
  const availableNeighborhoods = getAvailableNeighborhoods()

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    reset,
    setValue,
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    mode: "onChange",
  })

  // Observar mudanças nos campos para formatar o endereço
  const watchedFields = watch()
  
  const formatAddressFromFields = (fields: AddressFormData) => {
    const parts = [
      fields.street,
      fields.number,
      fields.neighborhood,
      fields.city,
    ].filter(Boolean)
    
    if (fields.complement) {
      parts.splice(2, 0, fields.complement)
    }
    
    return parts.join(", ")
  }

  // Atualizar endereço formatado quando os campos mudarem
  useEffect(() => {
    if (watchedFields.street && watchedFields.number && watchedFields.neighborhood && watchedFields.city) {
      setFormattedAddress(formatAddressFromFields(watchedFields))
    }
  }, [watchedFields])

  // Atualizar taxa de entrega quando o bairro for selecionado
  useEffect(() => {
    if (selectedNeighborhood) {
      const fee = getDeliveryFeeForNeighborhood(selectedNeighborhood)
      setDeliveryFee(fee)
      setValue("neighborhood", selectedNeighborhood)
    }
  }, [selectedNeighborhood, setValue])

  const onSubmit = (data: AddressFormData) => {
    const address = formatAddressFromFields(data)
    onConfirm(address)
    reset()
    setIsEditing(false)
    setFormattedAddress("")
    setSelectedNeighborhood("")
    setDeliveryFee(null)
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleClose = () => {
    reset()
    setIsEditing(false)
    setFormattedAddress("")
    setSelectedNeighborhood("")
    setDeliveryFee(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Informe seu endereço de entrega
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!isEditing ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Para calcular a taxa de entrega, precisamos do seu endereço completo.
              </p>
              <Button
                onClick={handleEdit}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                <Edit className="h-4 w-4 mr-2" />
                Preencher endereço
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                  <Label htmlFor="neighborhood">Bairro *</Label>
                  <Select value={selectedNeighborhood} onValueChange={setSelectedNeighborhood}>
                    <SelectTrigger className={errors.neighborhood ? "border-red-500" : ""}>
                      <SelectValue placeholder="Selecione seu bairro" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableNeighborhoods.map((neighborhood) => (
                        <SelectItem key={neighborhood} value={neighborhood}>
                          {neighborhood} - R$ {getDeliveryFeeForNeighborhood(neighborhood).toFixed(2).replace('.', ',')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.neighborhood && (
                    <p className="text-sm text-red-500 mt-1">{errors.neighborhood.message}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="street">Rua *</Label>
                  <Input
                    id="street"
                    {...register("street")}
                    placeholder="Ex: Rua das Flores"
                    className={errors.street ? "border-red-500" : ""}
                  />
                  {errors.street && (
                    <p className="text-sm text-red-500 mt-1">{errors.street.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="number">Número *</Label>
                  <Input
                    id="number"
                    {...register("number")}
                    placeholder="Ex: 123"
                    className={errors.number ? "border-red-500" : ""}
                  />
                  {errors.number && (
                    <p className="text-sm text-red-500 mt-1">{errors.number.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="complement">Complemento</Label>
                  <Input
                    id="complement"
                    {...register("complement")}
                    placeholder="Ex: Apto 101"
                  />
                </div>

                

                <div>
                  <Label htmlFor="city">Cidade *</Label>
                  <Input
                    id="city"
                    {...register("city")}
                    placeholder="Ex: Serra"
                    className={errors.city ? "border-red-500" : ""}
                  />
                  {errors.city && (
                    <p className="text-sm text-red-500 mt-1">{errors.city.message}</p>
                  )}
                </div>

              </div>

              {deliveryFee !== null && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-medium text-green-700 mb-1">Taxa de entrega:</p>
                  <p className="text-lg font-bold text-green-800">
                    R$ {deliveryFee.toFixed(2).replace('.', ',')}
                  </p>
                </div>
              )}

              {formattedAddress && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-1">Endereço formatado:</p>
                  <p className="text-sm text-gray-900">{formattedAddress}</p>
                </div>
              )}
            </form>
          )}
        </div>

        <DialogFooter className="flex gap-2 sm:gap-0">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                className="flex-1 sm:flex-none"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit(onSubmit)}
                className="bg-purple-600 hover:bg-purple-700 flex-1 sm:flex-none"
                disabled={!isValid}
              >
                Confirmar endereço
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1 sm:flex-none"
            >
              Fechar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
