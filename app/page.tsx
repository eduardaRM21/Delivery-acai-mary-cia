"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { 
  Menu, 
  X, 
  Star, 
  Instagram, 
  Facebook, 
  MapPin, 
  Clock, 
  Phone, 
  ChevronLeft, 
  ChevronRight,
  MessageSquare,
  MessageCircle,
  ShoppingCart
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ProductModal } from "@/components/product-modal"
import { CartModal } from "@/components/cart-modal"
import { useCart } from "@/contexts/CartContext"

// Arrays movidos para fora do componente para melhor performance
  const products = [
    {
      name: "Açaí Kids",
      ingredients: "Açaí puro, granola, banana",
      price: "R$ 8,00",
      image: "/images/acai-tradicional.png",
    },
    {
      name: "Açaí 300ml",
      ingredients: "1 cobertura + 1 fruta + 3 complementos",
      price: "R$ 10,90",
      image: "/images/acai-tradicional.png",
    },
    { 
      name: "Açaí 500 ml",
      ingredients: "1 cobertura + 2 frutas + 3 complementos",
      price: "R$ 14,50",
      image: "/images/acai-tradicional.png",
    },
    {
      name: "Açaí 700ml",
      ingredients: "2 cobertura + 2 frutas + 4 complementos",
      price: "R$ 20,00",
      image: "/images/acai-tradicional.png",
    },
    {
      name: "Açaí 1 Litro",
      ingredients: "2 cobertura + 2 frutas + 5 complementos",
      price: "R$ 29,00",
      image: "/images/acai-tradicional.png",
    },
  ]

  const testimonials = [
    {
      name: "Caroline",
      text: "Amei seu açaí, é muito bom! Arrumou uma freguesia boa.",
      date: "Maio 2025",
      avatar: "/placeholder.svg?height=60&width=60",
    },
    {
      name: "Maria",
      text: "Perfeitooooo! Muito bom, já devorei kkk",
      date: "junho 2025",
      avatar: "/placeholder.svg?height=60&width=60",
    },
    {
      name: "Elly",
      text: "Olha, muito bom o açaí! Que era bom viu!",
      date: "Maio 2025",
      avatar: "/placeholder.svg?height=60&width=60",
    },
    {
      name: "Cliente",
      text: "Maravilhoso como sempre! ❤️",
      date: "Maio 2025",
      avatar: "/placeholder.svg?height=60&width=60",
    },
  ]

export default function AcaiDaMaryPage() {
  const { state } = useCart()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const checkIfStoreIsOpen = () => {
    const now = new Date()
    const day = now.getDay() // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
    const hours = now.getHours()
    const minutes = now.getMinutes()
    const currentTime = hours + minutes / 60

    // Converter para o formato de 24 horas: 15:00 = 15.0, 00:00 = 24.0
    const weekdayOpen = 15.0 // 15:00
    const weekdayClose = 24.0 // 00:00
    const weekendOpen = 12.5 // 12:30
    const weekendClose = 24.0 // 00:00

    // Verifica se é fim de semana ou feriado (simplificado para verificar apenas fim de semana)
    const isWeekend = day === 0 || day === 6 // 0 = Domingo, 6 = Sábado

    if (isWeekend) {
      return currentTime >= weekendOpen && currentTime < weekendClose
    } else {
      return currentTime >= weekdayOpen && currentTime < weekdayClose
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500)

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }

    // Verifica o status da loja inicialmente e atualiza a cada minuto
    const checkStoreStatus = () => {
      setIsOpen(checkIfStoreIsOpen())
    }

    checkStoreStatus() // Verificação inicial
    const storeStatusInterval = setInterval(checkStoreStatus, 60000) // Verificar a cada minuto

    window.addEventListener("scroll", handleScroll)

    return () => {
      clearTimeout(timer)
      clearInterval(storeStatusInterval)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [testimonials.length])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
    setIsMenuOpen(false)
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const generateWhatsAppLink = (message: string) => {
    const phoneNumber = "5527988646488"
    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
  }

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-purple-600 flex items-center justify-center z-50">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold">AÇAÍ DA MARY & CIA</h2>
          <p>Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Container do Cabeçalho - Apenas para Mobile */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-purple-600">
        <div className="px-2">
          {/* Cabeçalho */}
          <header className="px-2 py-2">
            <div className="flex items-center justify-between">
              {/* Logo e Nome */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center">
                  <Image
                    src="/assets/logo.png"
                    width={32}
                    height={32}
                    alt="Logo Mary & Cia"
                    className="rounded-full"
                    priority
                  />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-lg font-bold leading-none text-white">MARY & CIA</h1>
                  <p className="text-xs text-purple-200">{isOpen ? "Aberto até às 00:00" : "Fechado"}</p>
                </div>
              </div>

              {/* Botões do Cabeçalho */}
              <div className="flex items-center gap-2">
                {/* Botão do Carrinho */}
                <button 
                  className="text-white relative" 
                  onClick={() => setIsCartOpen(true)}
                >
                  <ShoppingCart size={20} />
                  {state.itemCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500">
                      {state.itemCount}
                    </Badge>
                  )}
                </button>
                
                {/* Botão do Menu Mobile */}
                <button className="text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                  {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </div>
            </div>
          </header>

          {/* Navegação Mobile */}
          {isMenuOpen && (
            <div>
              <nav className="bg-purple-700 px-2 py-4">
                <div className="flex flex-col justify-between min-h-[200px]">
                  {/* Links de Navegação */}
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        scrollToSection("inicio")
                        setIsMenuOpen(false)
                      }}
                      className="w-full flex items-center justify-between px-2 py-3 text-white hover:bg-purple-600 rounded-lg transition-colors"
                    >
                      <span className="text-base font-medium">Início</span>
                      <ChevronRight className="w-5 h-5 text-purple-300" />
                    </button>
                    <button
                      onClick={() => {
                        scrollToSection("produtos")
                        setIsMenuOpen(false)
                      }}
                      className="w-full flex items-center justify-between px-2 py-3 text-white hover:bg-purple-600 rounded-lg transition-colors"
                    >
                      <span className="text-base font-medium">Produtos</span>
                      <ChevronRight className="w-5 h-5 text-purple-300" />
                    </button>
                    <button
                      onClick={() => {
                        scrollToSection("contato")
                        setIsMenuOpen(false)
                      }}
                      className="w-full flex items-center justify-between px-2 py-3 text-white hover:bg-purple-600 rounded-lg transition-colors"
                    >
                      <span className="text-base font-medium">Contato</span>
                      <ChevronRight className="w-5 h-5 text-purple-300" />
                    </button>
                  </div>

                  {/* Área de Contato e Ação */}
                  <div className="space-y-4 pt-4 border-t border-purple-600">
                    <Button
                      className="w-full bg-white hover:bg-purple-50"
                      onClick={() => {
                        window.open(
                          generateWhatsAppLink("Olá! Vim pelo site e gostaria de fazer um pedido no MARY & CIA"),
                          "_blank"
                        )
                        setIsMenuOpen(false)
                      }}
                    >
                      <div className="flex flex-col items-start">
                        <div className="flex items-center gap-2 text-purple-600">
                          <MessageCircle className="w-4 h-4" />
                          <span className="font-medium">WhatsApp</span>
                        </div>
                       
                      </div>
                    </Button>
                  </div>
                </div>
              </nav>
            </div>
          )}
        </div>
      </div>

      {/* Seção Principal */}
      <section id="inicio" className="md:pt-6 pt-16 bg-gradient-to-b from-purple-600 to-purple-800 text-white">
        <div className="px-2 md:container md:mx-auto py-6">
          <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-6">
            {/* Imagem de Perfil - Visível apenas em Desktop */}
            <div className="hidden md:block shrink-0">
              <div className="w-24 h-24 rounded-full overflow-hidden
              ">
                <Image
                  src="/assets/logo.png"
                  width={96}
                  height={96}
                  alt="Logo Mary & Cia"
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
            </div>

            {/* Informações */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold mb-1">Açaí da Mary & Cia</h1>
                  <div className="flex flex-wrap items-center gap-2 md:gap-3 text-purple-100">
                    <Badge variant="secondary" className={`${isOpen ? 'bg-green-500' : 'bg-red-500'}`}>
                      <Clock className="w-3 h-3 mr-1" />
                      {isOpen ? "Aberto" : "Fechado"}
                    </Badge>
                    <span className="text-sm">•</span>
                    <span className="text-sm">Açaí e Sorvetes</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    className="bg-white text-purple-600 hover:bg-purple-50 relative"
                    onClick={() => setIsCartOpen(true)}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Carrinho
                    {state.itemCount > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500">
                        {state.itemCount}
                      </Badge>
                    )}
                  </Button>
                  
                  <Button
                    className="bg-white text-purple-600 hover:bg-purple-50"
                    onClick={() =>
                      window.open(
                        generateWhatsAppLink("Olá! Vim pelo site e gostaria de fazer um pedido no MARY & CIA"),
                        "_blank"
                      )
                    }
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    WhatsApp
                  </Button>
                </div>
              </div>

              <div className="mt-4 space-y-3 md:space-y-4">
                {/* Endereço com truncate */}
                <div className="relative">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-1 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm text-purple-100 truncate">
                        Rua Resplendor, 85, Nova Caparapina I, Serra - ES
                      </p>
                      <button 
                        onClick={() => window.open("https://maps.google.com/?q=Rua Resplendor, 85, Nova Caparapina I, Serra - ES", "_blank")}
                        className="text-xs text-purple-200 hover:text-white"
                      >
                        Ver no mapa
                      </button>
                    </div>
                  </div>
                </div>

                {/* Horário e Contato */}
                <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 shrink-0" />
                    <span className="text-sm text-purple-100">Seg à Sex • 15:00 às 00:00 - Sáb, Dom e Feriados • 12:30 às 00:00</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 shrink-0" />
                    <a 
                      href="tel:+5527988646488"
                      className="text-sm text-purple-100 hover:text-white"
                    >
                      (27) 98864-6488
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção de Produtos */}
      <section id="produtos" className="py-12 bg-gray-50">
        <div className="px-2 md:container md:mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">Nossos Açaís</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product, index) => (
              <Card
                key={index}
                className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="relative">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-gray-800">{product.name}</h3>
                  <p className="text-gray-600 mb-4">{product.ingredients}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-purple-600">{product.price}</span>
                    <Button
                      className="bg-purple-600 hover:bg-purple-700"
                      onClick={() => setSelectedProduct(product)}
                    >
                      Pedir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Seção de Depoimentos */}
      <section id="depoimentos" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">
            O que nossos clientes dizem
          </h2>
          <div className="max-w-4xl mx-auto relative">
            <div className="bg-purple-50 rounded-lg p-8 shadow-lg">
              <div className="flex items-center mb-6">
                <Image
                  src={testimonials[currentTestimonial].avatar || "/placeholder.svg"}
                  alt={testimonials[currentTestimonial].name}
                  width={60}
                  height={60}
                  className="rounded-full mr-4"
                />
                <div>
                  <h4 className="font-bold text-gray-800">{testimonials[currentTestimonial].name}</h4>
                  <div className="flex text-yellow-400 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">{testimonials[currentTestimonial].date}</p>
                </div>
              </div>
              <p className="text-gray-700 text-lg italic">"{testimonials[currentTestimonial].text}"</p>
            </div>

            {/* Botões de Navegação */}
            <button
              onClick={prevTestimonial}
              aria-label="Depoimento anterior"
              className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextTestimonial}
              aria-label="Próximo depoimento"
              className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 transition-colors"
            >
              <ChevronRight size={20} />
            </button>

            {/* Indicador de Pontos */}
            <div className="flex justify-center mt-6 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentTestimonial ? "bg-purple-600" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Seção de Mídias Sociais */}
      <section className="py-16 bg-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Siga o AÇAÍ DA MARY & CIA nas redes sociais</h2>
          <p className="text-xl mb-8">Acompanhe nossas novidades e promoções!</p>
          <div className="flex justify-center space-x-8">
            <a
              href="https://www.instagram.com/acaimaryecia/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col justify-center items-center text-center group"
            >
              <div className="bg-white p-4 rounded-full mb-2 group-hover:bg-gradient-to-br from-purple-600 to-pink-500 transition-colors">
                <Instagram size={32} className="text-purple-600 group-hover:text-white" />
              </div>
              <span className="font-semibold">Instagram</span>
            </a>
            <a
              href="https://www.facebook.com/profile.php?id=61576334602116"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center group"
            >
              <div className="bg-white p-4 rounded-full mb-2 group-hover:bg-blue-600 transition-colors">
                <Facebook size={32} className="text-purple-600 group-hover:text-white" />
              </div>
              <span className="font-semibold">Facebook</span>
            </a>
          </div>
        </div>
      </section>

      {/* Rodapé */}
      <footer id="contato" className="bg-purple-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Informações de Contato */}
            <div>
              <h3 className="text-xl font-bold mb-4">AÇAÍ DA MARY & CIA</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <MapPin size={20} className="mt-1 flex-shrink-0" />
                  <p>Rua Resplendor, 85 - Nova Carapina 1, Serra - ES</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone size={20} />
                  <p>(27) 98864-6488</p>
                </div>
              </div>
            </div>

            {/* Horário de Funcionamento */}
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <Clock size={20} className="mr-2" />
                Horário de Atendimento
              </h3>
              <div className="space-y-2">
                <p>
                  <strong>Segunda a Sexta:</strong> 15h às 00h
                </p>
                <p>
                  <strong>Sábado, Domingo e Feriados:</strong> 12h30 às 00h
                </p>
              </div>
            </div>

            {/* Links Rápidos */}
            <div>
              <h3 className="text-xl font-bold mb-4">Links Rápidos</h3>
              <div className="space-y-2">
                <button
                  onClick={() => scrollToSection("inicio")}
                  className="block hover:text-purple-200 transition-colors"
                >
                  Início
                </button>
                <button
                  onClick={() => scrollToSection("produtos")}
                  className="block hover:text-purple-200 transition-colors"
                >
                  Produtos
                </button>
                <button
                  onClick={() => scrollToSection("depoimentos")}
                  className="block hover:text-purple-200 transition-colors"
                >
                  Depoimentos
                </button>
                <button
                  onClick={() => scrollToSection("contato")}
                  className="block hover:text-purple-200 transition-colors"
                >
                  Contato
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-purple-700 mt-8 pt-8 text-center">
            <p>&copy; 2025 AÇAÍ DA MARY & CIA. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Botão de Voltar ao Topo */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition-all z-30"
        >
          <ChevronLeft size={20} className="transform rotate-90" />
        </button>
      )}

      {selectedProduct && (
        <ProductModal
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          product={selectedProduct}
        />
      )}

      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </div>
  )
}
