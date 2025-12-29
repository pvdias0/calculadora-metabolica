import { MetabolicCalculator } from "@/components/metabolic-calculator"

export default function Home() {
  return (
    <main className="min-h-screen bg-background py-8 px-4 sm:py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-3 text-balance">
            Calculadora Metabólica
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Descubra seu gasto calórico diário e receba dicas personalizadas para alcançar seus objetivos
          </p>
        </div>

        <MetabolicCalculator />
      </div>
    </main>
  )
}
