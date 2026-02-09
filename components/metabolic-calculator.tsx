"use client";

import type React from "react";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Activity, TrendingDown, TrendingUp, Minus } from "lucide-react";

interface CalculatorResult {
  bmr: number;
  tdee: number;
  weightLoss: number;
  weightGain: number;
  maintain: number;
}

export function MetabolicCalculator() {
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [activityLevel, setActivityLevel] = useState("");
  const [result, setResult] = useState<CalculatorResult | null>(null);

  const calculateBMR = () => {
    const w = Number.parseFloat(weight);
    const h = Number.parseFloat(height);
    const a = Number.parseFloat(age);

    if (gender === "male") {
      return 10 * w + 6.25 * h - 5 * a + 5;
    } else {
      return 10 * w + 6.25 * h - 5 * a - 161;
    }
  };

  const getActivityMultiplier = (level: string) => {
    switch (level) {
      case "sedentary":
        return 1.2;
      case "light":
        return 1.375;
      case "moderate":
        return 1.55;
      case "active":
        return 1.725;
      case "very-active":
        return 1.9;
      default:
        return 1.2;
    }
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();

    if (!weight || !height || !age || !activityLevel) {
      return;
    }

    const bmr = calculateBMR();
    const multiplier = getActivityMultiplier(activityLevel);
    const tdee = bmr * multiplier;

    setResult({
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      weightLoss: Math.round(tdee - 400),
      weightGain: Math.round(tdee + 400),
      maintain: Math.round(tdee),
    });
  };

  const resetForm = () => {
    setWeight("");
    setHeight("");
    setAge("");
    setGender("male");
    setActivityLevel("");
    setResult(null);
  };

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl overflow-hidden card-hover">
        <div className="p-6 sm:p-8">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-foreground">Seus Dados</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Preencha as informações para calcular seu gasto calórico
            </p>
          </div>
          <form onSubmit={handleCalculate} className="space-y-6">
            <div className="grid gap-5 sm:grid-cols-2">
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
                  className="text-base h-11 rounded-xl bg-background/50 border-border/60 focus:border-accent focus:ring-accent/20"
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
                  className="text-base h-11 rounded-xl bg-background/50 border-border/60 focus:border-accent focus:ring-accent/20"
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
                  className="text-base h-11 rounded-xl bg-background/50 border-border/60 focus:border-accent focus:ring-accent/20"
                />
              </div>

              <div className="space-y-2">
                <Label>Sexo</Label>
                <RadioGroup
                  value={gender}
                  onValueChange={(value) =>
                    setGender(value as "male" | "female")
                  }
                >
                  <div className="flex items-center gap-6 h-11">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="male" id="male" />
                      <Label
                        htmlFor="male"
                        className="font-normal cursor-pointer"
                      >
                        Masculino
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="female" id="female" />
                      <Label
                        htmlFor="female"
                        className="font-normal cursor-pointer"
                      >
                        Feminino
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="activity">Nível de Atividade Física</Label>
              <Select
                value={activityLevel}
                onValueChange={setActivityLevel}
                required
              >
                <SelectTrigger
                  id="activity"
                  className="text-base h-11 rounded-xl bg-background/50 border-border/60"
                >
                  <SelectValue placeholder="Selecione seu nível de atividade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">
                    Sedentário (pouco ou nenhum exercício)
                  </SelectItem>
                  <SelectItem value="light">
                    Levemente ativo (exercício 1-3 dias/semana)
                  </SelectItem>
                  <SelectItem value="moderate">
                    Moderadamente ativo (exercício 3-5 dias/semana)
                  </SelectItem>
                  <SelectItem value="active">
                    Muito ativo (exercício 6-7 dias/semana)
                  </SelectItem>
                  <SelectItem value="very-active">
                    Extremamente ativo (exercício intenso diário)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                className="flex-1 h-12 text-base rounded-xl font-semibold
                           bg-linear-to-r from-accent to-primary text-white
                           shadow-lg shadow-accent/20
                           hover:shadow-xl hover:shadow-accent/30 hover:-translate-y-0.5
                           transition-all duration-300"
              >
                <Activity className="mr-2 h-5 w-5" />
                Calcular
              </Button>
              {result && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  className="h-12 text-base rounded-xl bg-transparent border-border/60 hover:bg-muted/50"
                >
                  Limpar
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>

      {result && (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Results */}
          <div className="glass rounded-2xl overflow-hidden">
            <div className="p-6 sm:p-8">
              <div className="mb-5">
                <h3 className="text-xl font-bold text-foreground">
                  Seus Resultados
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Baseado na fórmula Mifflin-St Jeor
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-muted/40 p-5 space-y-1.5">
                  <p className="text-sm text-muted-foreground font-medium">
                    Taxa Metabólica Basal
                  </p>
                  <p className="text-4xl font-bold text-foreground tracking-tight">
                    {result.bmr}
                    <span className="text-lg font-normal text-muted-foreground ml-1">
                      kcal
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Calorias em repouso
                  </p>
                </div>

                <div className="rounded-xl p-5 space-y-1.5 bg-linear-to-br from-accent/10 to-primary/10 border border-accent/15">
                  <p className="text-sm text-accent font-medium">
                    Gasto Calórico Total
                  </p>
                  <p className="text-4xl font-bold text-foreground tracking-tight">
                    {result.tdee}
                    <span className="text-lg font-normal text-muted-foreground ml-1">
                      kcal
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Calorias diárias totais
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="glass rounded-2xl overflow-hidden">
            <div className="p-6 sm:p-8">
              <div className="mb-5">
                <h3 className="text-xl font-bold text-foreground">
                  Controle de Peso
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Ajuste suas calorias conforme seu objetivo
                </p>
              </div>
              <div className="stagger-children space-y-3">
                <div className="rounded-xl border border-destructive/15 bg-destructive/5 p-5 space-y-2 card-hover">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-destructive" />
                    <h4 className="font-semibold text-foreground">
                      Perder Peso
                    </h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Déficit de 400 kcal/dia ≈ 0.5 kg/semana
                  </p>
                  <p className="text-3xl font-bold text-foreground tracking-tight">
                    {result.weightLoss}
                    <span className="text-sm font-normal text-muted-foreground ml-1">
                      kcal/dia
                    </span>
                  </p>
                </div>

                <div className="rounded-xl border border-accent/15 bg-accent/5 p-5 space-y-2 card-hover">
                  <div className="flex items-center gap-2">
                    <Minus className="h-5 w-5 text-accent" />
                    <h4 className="font-semibold text-foreground">
                      Manter Peso
                    </h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Consumir suas calorias de manutenção
                  </p>
                  <p className="text-3xl font-bold text-foreground tracking-tight">
                    {result.maintain}
                    <span className="text-sm font-normal text-muted-foreground ml-1">
                      kcal/dia
                    </span>
                  </p>
                </div>

                <div className="rounded-xl border border-primary/15 bg-primary/5 p-5 space-y-2 card-hover">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold text-foreground">
                      Ganhar Peso
                    </h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Superávit de 400 kcal/dia ≈ 0.5 kg/semana
                  </p>
                  <p className="text-3xl font-bold text-foreground tracking-tight">
                    {result.weightGain}
                    <span className="text-sm font-normal text-muted-foreground ml-1">
                      kcal/dia
                    </span>
                  </p>
                </div>

                <div className="rounded-xl bg-muted/30 p-4 mt-2">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    <span className="font-semibold text-foreground">
                      Importante:
                    </span>{" "}
                    Estes valores são estimativas. Consulte um nutricionista
                    para resultados personalizados.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
