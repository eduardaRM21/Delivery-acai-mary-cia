"use client"

import React, { createContext, useContext, useReducer, ReactNode } from 'react'

// Tipos
export interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
  toppings: string[]
  fruits: string[]
  extras: string[]
  additionals: {
    nome: string
    preco: number
    quantidade: number
  }[]
  totalPrice: number
}

interface CartState {
  items: CartItem[]
  total: number
  itemCount: number
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }

// Estado inicial
const initialState: CartState = {
  items: [],
  total: 0,
  itemCount: 0,
}

// Reducer
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.id === action.payload.id)
      
      if (existingItem) {
        // Se o item já existe, aumenta a quantidade
        const updatedItems = state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        )
        
        const newTotal = updatedItems.reduce((sum, item) => sum + item.totalPrice * item.quantity, 0)
        const newItemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0)
        
        return {
          ...state,
          items: updatedItems,
          total: newTotal,
          itemCount: newItemCount,
        }
      } else {
        // Se é um novo item, adiciona ao carrinho
        const newItems = [...state.items, action.payload]
        const newTotal = newItems.reduce((sum, item) => sum + item.totalPrice * item.quantity, 0)
        const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)
        
        return {
          ...state,
          items: newItems,
          total: newTotal,
          itemCount: newItemCount,
        }
      }
    }
    
    case 'REMOVE_ITEM': {
      const updatedItems = state.items.filter(item => item.id !== action.payload)
      const newTotal = updatedItems.reduce((sum, item) => sum + item.totalPrice * item.quantity, 0)
      const newItemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0)
      
      return {
        ...state,
        items: updatedItems,
        total: newTotal,
        itemCount: newItemCount,
      }
    }
    
    case 'UPDATE_QUANTITY': {
      const updatedItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      )
      
      const newTotal = updatedItems.reduce((sum, item) => sum + item.totalPrice * item.quantity, 0)
      const newItemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0)
      
      return {
        ...state,
        items: updatedItems,
        total: newTotal,
        itemCount: newItemCount,
      }
    }
    
    case 'CLEAR_CART':
      return initialState
    
    default:
      return state
  }
}

// Context
interface CartContextType {
  state: CartState
  addItem: (item: Omit<CartItem, 'id'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  getItemQuantity: (id: string) => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

// Provider
interface CartProviderProps {
  children: ReactNode
}

export function CartProvider({ children }: CartProviderProps) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  const addItem = (item: Omit<CartItem, 'id'>) => {
    // Criar um ID único baseado no conteúdo do item para permitir agrupamento
    const itemSignature = JSON.stringify({
      name: item.name,
      toppings: item.toppings.sort(),
      fruits: item.fruits.sort(),
      extras: item.extras.sort(),
      additionals: item.additionals.sort((a, b) => a.nome.localeCompare(b.nome))
    })
    
    const existingItem = state.items.find(existing => {
      const existingSignature = JSON.stringify({
        name: existing.name,
        toppings: existing.toppings.sort(),
        fruits: existing.fruits.sort(),
        extras: existing.extras.sort(),
        additionals: existing.additionals.sort((a, b) => a.nome.localeCompare(b.nome))
      })
      return existingSignature === itemSignature
    })

    if (existingItem) {
      // Se o item já existe, apenas aumenta a quantidade
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id: existingItem.id, quantity: existingItem.quantity + item.quantity } })
    } else {
      // Se é um novo item, adiciona ao carrinho
      const id = `${item.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      dispatch({ type: 'ADD_ITEM', payload: { ...item, id } })
    }
  }

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id })
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id)
    } else {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } })
    }
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
  }

  const getItemQuantity = (id: string) => {
    const item = state.items.find(item => item.id === id)
    return item ? item.quantity : 0
  }

  const value: CartContextType = {
    state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemQuantity,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// Hook
export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
} 