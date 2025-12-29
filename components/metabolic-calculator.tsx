"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Activity, TrendingDown, TrendingUp, Minus } from "lucide-react"

interface CalculatorResult {
  bmr: number
  tdee: number
  weightLoss: number
  weightGain: number
  maintain: number
}

export function MetabolicCalculator() {
  const [weight, setWeight] = useState("")
  const [height, setHeight] = useState("")
  const [age, setAge] = useState("")
  const [gender, setGender] = useState<"male" | "female">("male")
  const [activityLevel, setActivityLevel] = useState("")
  const [result, setResult] = useState<CalculatorResult | null>(null)

  const calculateBMR = () => {
    const w = Number.parseFloat(weight)
    const h = Number.parseFloat(height)
    const a = Number.parseFloat(age)

    if (gender === "male") {
      return 10 * w + 6.25 * h - 5 * a + 5
    } else {
      return 10 * w + 6.25 * h - 5 * a - 161
    }
  }

  const getActivityMultiplier = (level: string) => {
    switch (level) {
      case "sedentary":
        return 1.2
      case "light":
        return 1.375
      case "moderate":
        return 1.55
      case "active":
        return 1.725
      case "very-active":
        return 1.9
      default:
        return 1.2
    }
  }

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault()

    if (!weight || !height || !age || !activityLevel) {
      return
    }

    const bmr = calculateBMR()
    const multiplier = getActivityMultiplier(activityLevel)
    const tdee = bmr * multiplier

    setResult({
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      weightLoss: Math.round(tdee - 400),
      weightGain: Math.round(tdee + 400),
      maintain: Math.round(tdee),
    })
  }

  const resetForm = () => {
    setWeight("")
    setHeight("")
    setAge("")
    setGender("male")
    setActivityLevel("")
    setResult(null)
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Seus Dados</CardTitle>
          <CardDescription>Preencha as informações abaixo para calcular seu gasto calórico</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCalculate} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="weight">Peso (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="Ex: 70"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  min="1"
                  step="0.1"
                  required
                  className="text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="height">Altura (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  placeholder="Ex: 170"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  min="1"
                  step="0.1"
                  required
                  className="text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Idade (anos)</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Ex: 30"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  min="1"
                  max="120"
                  required
                  className="text-base"
                />
              </div>

              <div className="space-y-2">
                <Label>Sexo</Label>
                <RadioGroup value={gender} onValueChange={(value) => setGender(value as "male" | "female")}>
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="male" id="male" />
                      <Label htmlFor="male" className="font-normal cursor-pointer">
                        Masculino
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="female" id="female" />
                      <Label htmlFor="female" className="font-normal cursor-pointer">
                        Feminino
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="activity">Nível de Atividade Física</Label>
              <Select value={activityLevel} onValueChange={setActivityLevel} required>
                <SelectTrigger id="activity" className="text-base">
                  <SelectValue placeholder="Selecione seu nível de atividade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">Sedentário (pouco ou nenhum exercício)</SelectItem>
                  <SelectItem value="light">Levemente ativo (exercício 1-3 dias/semana)</SelectItem>
                  <SelectItem value="moderate">Moderadamente ativo (exercício 3-5 dias/semana)</SelectItem>
                  <SelectItem value="active">Muito ativo (exercício 6-7 dias/semana)</SelectItem>
                  <SelectItem value="very-active">Extremamente ativo (exercício intenso diário)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" className="flex-1 h-11 text-base">
                <Activity className="mr-2 h-5 w-5" />
                Calcular
              </Button>
              {result && (
                <Button type="button" variant="outline" onClick={resetForm} className="h-11 text-base bg-transparent">
                  Limpar
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="shadow-lg border-accent/20">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl">Seus Resultados</CardTitle>
              <CardDescription>Baseado na fórmula Mifflin-St Jeor e seu nível de atividade</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg bg-muted/50 p-4 space-y-1">
                  <p className="text-sm text-muted-foreground font-medium">Taxa Metabólica Basal (TMB)</p>
                  <p className="text-3xl font-bold text-foreground">{result.bmr} kcal</p>
                  <p className="text-xs text-muted-foreground">Calorias em repouso</p>
                </div>

                <div className="rounded-lg bg-accent/10 p-4 space-y-1 border border-accent/20">
                  <p className="text-sm text-accent-foreground font-medium">Gasto Calórico Total (GET)</p>
                  <p className="text-3xl font-bold text-accent">{result.tdee} kcal</p>
                  <p className="text-xs text-muted-foreground">Calorias diárias totais</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Dicas de Controle de Peso</CardTitle>
              <CardDescription>Ajuste suas calorias diárias conforme seu objetivo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-destructive" />
                  <h3 className="font-semibold text-foreground">Perder Peso</h3>
                </div>
                <p className="text-sm text-muted-foreground">Déficit de 400 kcal/dia ≈ 0.5 kg/semana</p>
                <p className="text-2xl font-bold text-foreground">{result.weightLoss} kcal/dia</p>
              </div>

              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Minus className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Manter Peso</h3>
                </div>
                <p className="text-sm text-muted-foreground">Consumir aproximadamente suas calorias de manutenção</p>
                <p className="text-2xl font-bold text-foreground">{result.maintain} kcal/dia</p>
              </div>

              <div className="rounded-lg border border-accent/20 bg-accent/5 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-accent" />
                  <h3 className="font-semibold text-foreground">Ganhar Peso</h3>
                </div>
                <p className="text-sm text-muted-foreground">Superávit de 400 kcal/dia ≈ 0.5 kg/semana</p>
                <p className="text-2xl font-bold text-foreground">{result.weightGain} kcal/dia</p>
              </div>

              <div className="rounded-lg bg-muted/30 p-4 mt-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-foreground">Importante:</span> Estes valores são estimativas. Para
                  resultados mais precisos e personalizados, consulte um nutricionista ou profissional de saúde
                  qualificado.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
