'use client'

import { MetabolicCalculator } from "@/components/metabolic-calculator"
import Reconstructor3D from "@/components/reconstructor-3d"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Home() {
  return (
    <main className="min-h-screen bg-background py-8 px-4 sm:py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-3 text-balance">
            Estúdio de Análise
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Ferramentas para análise metabólica e reconstrução 3D
          </p>
        </div>

        <Tabs defaultValue="metabolic" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto mb-8 grid-cols-2">
            <TabsTrigger value="metabolic">Calculadora</TabsTrigger>
            <TabsTrigger value="reconstruction">Reconstrução 3D</TabsTrigger>
          </TabsList>

          <TabsContent value="metabolic" className="space-y-4">
            <MetabolicCalculator />
          </TabsContent>

          <TabsContent value="reconstruction" className="space-y-4">
            <Reconstructor3D />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
