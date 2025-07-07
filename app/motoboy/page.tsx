"use client";

import { useEffect, useState } from "react";
import { OrderService, OrderWithItems } from "@/lib/order-service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Phone, MapPin, Clock, CheckCircle } from "lucide-react";

const MOTOBOY_PASSWORD = "entregas@mary&cia";
const MOTOBOY_TOKEN_KEY = "motoboy_panel_access";

export default function MotoboyPanel() {
  const [authorized, setAuthorized] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (localStorage.getItem(MOTOBOY_TOKEN_KEY) === "true") {
        setAuthorized(true);
      }
    }
  }, []);

  const fetchOrders = async () => {
    if (!authorized) return;
    setLoading(true);
    try {
      const prontos = await OrderService.getOrdersByStatus("Pronto");
      const entregando = await OrderService.getOrdersByStatus("Entregando");
      const all = [...prontos, ...entregando].filter(
        (o) => o.pedido.cliente?.endereco && o.pedido.cliente.endereco !== "Retirada na loja"
      );
      setOrders(all);
    } catch (error) {
      toast.error("Erro ao buscar pedidos para entrega");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authorized) return;
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, [authorized]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await OrderService.updateOrderStatus(id, status as any);
      toast.success("Status atualizado!");
      fetchOrders();
    } catch (error) {
      toast.error("Erro ao atualizar status");
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price: number) => {
    return `R$ ${price.toFixed(2).replace(".", ",")}`;
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (input === MOTOBOY_PASSWORD) {
      localStorage.setItem(MOTOBOY_TOKEN_KEY, "true");
      setAuthorized(true);
      setError("");
    } else {
      setError("Senha incorreta!");
    }
  };

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <form onSubmit={handleLogin} className="bg-white p-6 rounded shadow-md w-full max-w-xs">
          <h2 className="text-lg font-bold mb-4 text-center">Motoboy - Acesso Restrito</h2>
          <input
            type="password"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Digite a senha do motoboy"
            className="w-full border rounded px-3 py-2 mb-2"
          />
          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
          <button type="submit" className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700">Entrar</button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-2">
      <h1 className="text-2xl font-bold mb-4 text-center">Painel do Motoboy</h1>
      {loading && <p className="text-center">Carregando pedidos...</p>}
      {orders.length === 0 && !loading && (
        <p className="text-center text-gray-500">Nenhum pedido para entrega no momento.</p>
      )}
      <div className="space-y-4">
        {orders.map(({ pedido }) => (
          <Card key={pedido.id} className="shadow-md">
            <CardHeader>
              <CardTitle>
                Pedido #{pedido.numero_pedido}
                <span className="ml-2 text-xs text-gray-500">{formatDateTime(pedido.created_at)}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-purple-600" />
                <span className="font-medium">Endereço:</span>
                <span>{pedido.cliente?.endereco}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-purple-600" />
                <span className="font-medium">Cliente:</span>
                <span>{pedido.cliente?.nome} - {pedido.cliente?.telefone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">Total:</span>
                <span>{formatPrice(pedido.total)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">Pagamento:</span>
                <span>{pedido.pagamento?.toUpperCase() || 'NÃO INFORMADO'}</span>
              </div>
              {pedido.obs && (
                <div className="text-sm text-gray-700">
                  <span className="font-medium">Obs:</span> {pedido.obs}
                </div>
              )}
              <div className="flex gap-2 mt-2">
                {pedido.status === "Pronto" && (
                  <Button size="sm" onClick={() => updateStatus(pedido.id, "Entregando")}
                    className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Clock className="w-4 h-4 mr-1" /> Retirar para entrega
                  </Button>
                )}
                {pedido.status === "Entregando" && (
                  <Button size="sm" onClick={() => updateStatus(pedido.id, "Entregue")}
                    className="bg-green-600 hover:bg-green-700 text-white">
                    <CheckCircle className="w-4 h-4 mr-1" /> Marcar como entregue
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 