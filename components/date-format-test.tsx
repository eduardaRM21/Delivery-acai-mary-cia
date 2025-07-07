'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  formatBrazilDate, 
  formatBrazilDateOnly, 
  formatBrazilTimeOnly, 
  formatBrazilDateTime, 
  formatBrazilRelativeDate 
} from '@/lib/utils'

export function DateFormatTest() {
  const [timestamp, setTimestamp] = useState('2025-07-07 00:00:20.573501+00')
  const [results, setResults] = useState<any>(null)

  const testFormatting = () => {
    try {
      const results = {
        original: timestamp,
        basic: formatBrazilDate(timestamp),
        dateOnly: formatBrazilDateOnly(timestamp),
        timeOnly: formatBrazilTimeOnly(timestamp),
        dateTime: formatBrazilDateTime(timestamp),
        relative: formatBrazilRelativeDate(timestamp),
        custom1: formatBrazilDate(timestamp, 'dd/MM/yyyy HH:mm:ss'),
        custom2: formatBrazilDate(timestamp, 'EEEE, dd/MM/yyyy'),
        custom3: formatBrazilDate(timestamp, 'dd/MM/yyyy HH:mm (zzz)'),
      }
      setResults(results)
    } catch (error) {
      console.error('Erro ao formatar data:', error)
      setResults({ error: error.message })
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Teste de Formatação de Data - Fuso Horário Brasileiro</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="timestamp">Timestamp UTC:</Label>
            <Input
              id="timestamp"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              placeholder="2025-07-07 00:00:20.573501+00"
            />
          </div>
          
          <Button onClick={testFormatting} className="w-full">
            Testar Formatação
          </Button>

          {results && (
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Resultados:</h3>
              
              {results.error ? (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700">Erro: {results.error}</p>
                </div>
              ) : (
                <div className="grid gap-2 text-sm">
                  <div className="p-2 bg-gray-50 rounded">
                    <span className="font-medium">Original:</span> {results.original}
                  </div>
                  <div className="p-2 bg-blue-50 rounded">
                    <span className="font-medium">Básico:</span> {results.basic}
                  </div>
                  <div className="p-2 bg-green-50 rounded">
                    <span className="font-medium">Apenas Data:</span> {results.dateOnly}
                  </div>
                  <div className="p-2 bg-yellow-50 rounded">
                    <span className="font-medium">Apenas Hora:</span> {results.timeOnly}
                  </div>
                  <div className="p-2 bg-purple-50 rounded">
                    <span className="font-medium">Data e Hora:</span> {results.dateTime}
                  </div>
                  <div className="p-2 bg-orange-50 rounded">
                    <span className="font-medium">Relativo:</span> {results.relative}
                  </div>
                  <div className="p-2 bg-pink-50 rounded">
                    <span className="font-medium">Customizado 1:</span> {results.custom1}
                  </div>
                  <div className="p-2 bg-indigo-50 rounded">
                    <span className="font-medium">Customizado 2:</span> {results.custom2}
                  </div>
                  <div className="p-2 bg-teal-50 rounded">
                    <span className="font-medium">Customizado 3:</span> {results.custom3}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">Como usar:</h4>
            <pre className="text-xs bg-white p-3 rounded border overflow-x-auto">
{`import { 
  formatBrazilDate, 
  formatBrazilDateOnly, 
  formatBrazilTimeOnly, 
  formatBrazilDateTime, 
  formatBrazilRelativeDate 
} from '@/lib/utils'

const timestamp = "2025-07-07 00:00:20.573501+00"

// Formatação básica
formatBrazilDate(timestamp) // "06/07/2025 21:00"

// Apenas data
formatBrazilDateOnly(timestamp) // "06/07/2025"

// Apenas hora
formatBrazilTimeOnly(timestamp) // "21:00"

// Data e hora completa
formatBrazilDateTime(timestamp) // "06/07/2025 às 21:00"

// Formatação relativa
formatBrazilRelativeDate(timestamp) // "ontem às 21:00"

// Formatação customizada
formatBrazilDate(timestamp, 'dd/MM/yyyy HH:mm:ss') // "06/07/2025 21:00:20"
formatBrazilDate(timestamp, 'EEEE, dd/MM/yyyy') // "domingo, 06/07/2025"`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 