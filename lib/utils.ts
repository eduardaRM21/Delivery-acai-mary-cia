import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Fuso horário de São Paulo/Brasília
export const BRAZIL_TIMEZONE = 'America/Sao_Paulo'

/**
 * Converte um timestamp UTC para o fuso horário de São Paulo/Brasília
 * @param utcDate - Data em formato UTC (string ou Date)
 * @returns Date no fuso horário brasileiro
 */
export function convertToBrazilTime(utcDate: string | Date): Date {
  const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate
  // Usar toLocaleString para conversão de fuso horário
  const brazilTimeString = date.toLocaleString('en-US', { timeZone: BRAZIL_TIMEZONE })
  return new Date(brazilTimeString)
}

/**
 * Formata uma data no fuso horário brasileiro
 * @param utcDate - Data em formato UTC (string ou Date)
 * @param formatStr - Formato desejado (padrão: 'dd/MM/yyyy HH:mm')
 * @returns String formatada no fuso horário brasileiro
 */
export function formatBrazilDate(
  utcDate: string | Date, 
  formatStr: string = 'dd/MM/yyyy HH:mm'
): string {
  try {
    const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate
    const brazilDate = convertToBrazilTime(date)
    return format(brazilDate, formatStr, { locale: ptBR })
  } catch (error) {
    // Fallback para formatação simples
    const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate
    return format(date, formatStr, { locale: ptBR })
  }
}

/**
 * Formata apenas a data (sem hora) no fuso horário brasileiro
 * @param utcDate - Data em formato UTC (string ou Date)
 * @returns String formatada como dd/MM/yyyy
 */
export function formatBrazilDateOnly(utcDate: string | Date): string {
  return formatBrazilDate(utcDate, 'dd/MM/yyyy')
}

/**
 * Formata apenas a hora no fuso horário brasileiro
 * @param utcDate - Data em formato UTC (string ou Date)
 * @returns String formatada como HH:mm
 */
export function formatBrazilTimeOnly(utcDate: string | Date): string {
  return formatBrazilDate(utcDate, 'HH:mm')
}

/**
 * Formata data e hora completa no fuso horário brasileiro
 * @param utcDate - Data em formato UTC (string ou Date)
 * @returns String formatada como dd/MM/yyyy às HH:mm
 */
export function formatBrazilDateTime(utcDate: string | Date): string {
  return formatBrazilDate(utcDate, "dd/MM/yyyy 'às' HH:mm")
}

/**
 * Formata data relativa no fuso horário brasileiro (ex: "hoje às 14:30", "ontem às 10:15")
 * @param utcDate - Data em formato UTC (string ou Date)
 * @returns String formatada de forma relativa
 */
export function formatBrazilRelativeDate(utcDate: string | Date): string {
  try {
    const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate
    const brazilDate = convertToBrazilTime(date)
    const now = new Date()
    
    // Obter datas de hoje e ontem no fuso horário brasileiro
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
    
    const brazilToday = convertToBrazilTime(today)
    const brazilYesterday = convertToBrazilTime(yesterday)
    
    const brazilDateOnly = new Date(brazilDate.getFullYear(), brazilDate.getMonth(), brazilDate.getDate())
    const brazilTodayOnly = new Date(brazilToday.getFullYear(), brazilToday.getMonth(), brazilToday.getDate())
    const brazilYesterdayOnly = new Date(brazilYesterday.getFullYear(), brazilYesterday.getMonth(), brazilYesterday.getDate())
    
    if (brazilDateOnly.getTime() === brazilTodayOnly.getTime()) {
      return `hoje às ${format(brazilDate, 'HH:mm')}`
    } else if (brazilDateOnly.getTime() === brazilYesterdayOnly.getTime()) {
      return `ontem às ${format(brazilDate, 'HH:mm')}`
    } else {
      return formatBrazilDateTime(utcDate)
    }
  } catch (error) {
    // Fallback para formatação simples
    return formatBrazilDateTime(utcDate)
  }
}

/**
 * Retorna o início do dia (00:00:00) em UTC para uma data local de São Paulo
 */
export function getStartOfDayUTC(date: Date): Date {
  const saoPaulo = new Date(date.toLocaleString('en-US', { timeZone: BRAZIL_TIMEZONE }))
  saoPaulo.setHours(0, 0, 0, 0)
  // Retorna o equivalente em UTC
  return new Date(saoPaulo.getTime() + (saoPaulo.getTimezoneOffset() * 60000))
}

/**
 * Retorna o fim do dia (23:59:59.999) em UTC para uma data local de São Paulo
 */
export function getEndOfDayUTC(date: Date): Date {
  const saoPaulo = new Date(date.toLocaleString('en-US', { timeZone: BRAZIL_TIMEZONE }))
  saoPaulo.setHours(23, 59, 59, 999)
  // Retorna o equivalente em UTC
  return new Date(saoPaulo.getTime() + (saoPaulo.getTimezoneOffset() * 60000))
}

/**
 * Exemplo de uso:
 * 
 * const timestamp = "2025-07-07 00:00:20.573501+00"
 * 
 * // Formatação básica
 * formatBrazilDate(timestamp) // "06/07/2025 21:00"
 * formatBrazilDateOnly(timestamp) // "06/07/2025"
 * formatBrazilTimeOnly(timestamp) // "21:00"
 * formatBrazilDateTime(timestamp) // "06/07/2025 às 21:00"
 * 
 * // Formatação relativa
 * formatBrazilRelativeDate(timestamp) // "ontem às 21:00" ou "06/07/2025 às 21:00"
 */
