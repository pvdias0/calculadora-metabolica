import { MetabolicCalculator } from "@/components/metabolic-calculator";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Zap,
  Heart,
  Target,
  ArrowDown,
  Minus,
} from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 w-full border-b border-border/30 bg-background/90 backdrop-blur-xl">
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="mx-auto max-w-5xl flex items-center justify-between">
            {/* Logo */}
            <a href="#" className="flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-xl shadow-md shadow-accent/25 group-hover:shadow-lg group-hover:shadow-accent/30 group-hover:scale-105 transition-all duration-300 overflow-hidden">
                <img src="/icon.svg" alt="Logo" className="w-full h-full" />
              </div>
              <div className="hidden xs:flex flex-col">
                <span className="font-bold text-base text-foreground leading-tight tracking-tight">
                  Calc<span className="text-accent">Metabólica</span>
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  Seu metabolismo
                </span>
              </div>
            </a>

            {/* Navigation */}
            <nav className="hidden sm:flex items-center gap-2">
              {[
                { label: "Calculadora", href: "#calculadora" },
                { label: "Ciência", href: "#ciencia" },
                { label: "Estratégia", href: "#estrategia" },
              ].map(({ label, href }) => (
                <a
                  key={href}
                  href={href}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground 
                             hover:text-foreground hover:bg-accent/8 
                             transition-colors duration-200"
                >
                  {label}
                </a>
              ))}
            </nav>

            {/* CTA Button */}
            <a
              href="#calculadora"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold
                         bg-linear-to-r from-accent to-primary text-white
                         shadow-md shadow-accent/25
                         hover:shadow-lg hover:shadow-accent/35 hover:scale-105
                         transition-all duration-300"
            >
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">Calcular</span>
              <span className="sm:hidden">Calcular</span>
            </a>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative pt-20 pb-16 sm:pt-28 sm:pb-24 px-4 sm:px-6 lg:px-8">
        {/* Background orbs */}
        <div className="glow-orb w-100 h-100 bg-accent/40 -top-40 -left-40" />
        <div className="glow-orb w-75 h-75 bg-accent/30 top-20 right-0" />

        <div className="relative mx-auto max-w-3xl text-center">
          {/* Icon */}
          <div className="animate-fade-up inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 mb-8 animate-float overflow-hidden">
            <img src="/icon.svg" alt="Metabolismo" className="w-12 h-12" />
          </div>

          <h1
            className="animate-fade-up text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight mb-6"
            style={{ animationDelay: "100ms" }}
          >
            Descubra seu <span className="gradient-text">Metabolismo</span>
          </h1>

          <p
            className="animate-fade-up text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed mb-10"
            style={{ animationDelay: "200ms" }}
          >
            Calcule seu gasto calórico diário com precisão científica e
            transforme seus objetivos em resultados reais.
          </p>

          {/* CTA → scroll to calculator */}
          <div
            className="animate-fade-up flex flex-col items-center gap-3"
            style={{ animationDelay: "300ms" }}
          >
            <a
              href="#calculadora"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold
                         bg-linear-to-r from-accent to-primary text-white
                         shadow-lg shadow-accent/25
                         hover:shadow-xl hover:shadow-accent/30 hover:-translate-y-0.5
                         transition-all duration-300"
            >
              Calcular agora
              <ArrowDown className="w-4 h-4" />
            </a>
            <span className="text-xs text-muted-foreground">
              Gratuito • Sem cadastro • Resultado imediato
            </span>
          </div>
        </div>
      </section>

      {/* ── Metrics strip ── */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="mx-auto max-w-3xl stagger-children grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: Zap,
              title: "Baseado em Ciência",
              desc: "Fórmula Mifflin-St Jeor",
            },
            {
              icon: Target,
              title: "Personalizado",
              desc: "Adaptado ao seu perfil",
            },
            {
              icon: Heart,
              title: "Resultado Imediato",
              desc: "Dicas para seu objetivo",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="card-hover glass rounded-2xl p-5 flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">{title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="mx-auto max-w-3xl px-4">
        <div className="accent-line w-full" />
      </div>

      {/* ── Calculator ── */}
      <section
        id="calculadora"
        className="relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8 scroll-mt-8"
      >
        <div className="glow-orb w-88 h-88 bg-accent/20 -bottom-32 -right-32" />

        <div className="relative mx-auto max-w-3xl">
          <div className="animate-fade-up mb-10">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-accent mb-3">
              Ferramenta
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight">
              Calcule seu gasto calórico
            </h2>
            <p className="text-muted-foreground mt-3 max-w-lg leading-relaxed">
              Preencha seus dados e descubra quantas calorias seu corpo precisa
              por dia.
            </p>
          </div>

          <MetabolicCalculator />
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="mx-auto max-w-3xl px-4">
        <div className="accent-line w-full" />
      </div>

      {/* ── Science Section ── */}
      <section
        id="ciencia"
        className="relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8 scroll-mt-16"
      >
        <div className="glow-orb w-75 h-75 bg-accent/15 top-0 -left-40" />

        <div className="relative mx-auto max-w-3xl">
          <div className="animate-fade-up mb-12">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-accent mb-3">
              Ciência
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight">
              A fórmula por trás
            </h2>
            <p className="text-muted-foreground mt-3 max-w-lg leading-relaxed">
              Entenda como a equação Mifflin-St Jeor calcula seu metabolismo.
            </p>
          </div>

          <div className="stagger-children space-y-5">
            {/* TMB */}
            <div className="card-hover glass rounded-2xl p-6 sm:p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="number-badge">1</div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    Taxa Metabólica Basal (TMB)
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    Calorias que seu corpo queima em repouso absoluto para
                    manter funções vitais — respiração, circulação e
                    termorregulação.
                  </p>
                </div>
              </div>
              <div className="ml-12 p-4 rounded-xl bg-accent/5 border border-accent/10 font-mono text-sm text-muted-foreground space-y-1">
                <p>
                  <span className="text-accent font-semibold">♂</span> (10 ×
                  peso) + (6.25 × altura) − (5 × idade) + 5
                </p>
                <p>
                  <span className="text-accent font-semibold">♀</span> (10 ×
                  peso) + (6.25 × altura) − (5 × idade) − 161
                </p>
              </div>
            </div>

            {/* GET */}
            <div className="card-hover glass rounded-2xl p-6 sm:p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="number-badge">2</div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    Gasto Energético Total (GET)
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    Também chamado de TDEE — é o total de calorias que você
                    realmente queima em um dia, combinando a TMB com seu nível
                    de atividade.
                  </p>
                </div>
              </div>
              <div className="ml-12 p-4 rounded-xl bg-accent/5 border border-accent/10 font-mono text-sm text-muted-foreground">
                GET = TMB × Fator de Atividade
              </div>
            </div>

            {/* Activity Factors */}
            <div className="card-hover glass rounded-2xl p-6 sm:p-8">
              <div className="flex items-start gap-4 mb-5">
                <div className="number-badge">3</div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    Fatores de Atividade
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    O multiplicador é ajustado pela frequência e intensidade dos
                    seus exercícios.
                  </p>
                </div>
              </div>
              <div className="ml-12 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { v: "1.2×", l: "Sedentário" },
                  { v: "1.375×", l: "Levemente ativo" },
                  { v: "1.55×", l: "Moderado" },
                  { v: "1.725×", l: "Muito ativo" },
                  { v: "1.9×", l: "Extremamente ativo" },
                ].map(({ v, l }) => (
                  <div
                    key={v}
                    className="flex items-center gap-3 p-3 rounded-xl bg-accent/5 border border-accent/10"
                  >
                    <span className="text-accent font-bold font-mono text-sm">
                      {v}
                    </span>
                    <span className="text-sm text-muted-foreground">{l}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="mx-auto max-w-3xl px-4">
        <div className="accent-line w-full" />
      </div>

      {/* ── How to Use Results ── */}
      <section
        id="estrategia"
        className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 scroll-mt-16"
      >
        <div className="mx-auto max-w-3xl">
          <div className="animate-fade-up mb-12">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-accent mb-3">
              Estratégia
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight">
              Como usar seus resultados
            </h2>
          </div>

          <div className="stagger-children grid gap-5 sm:grid-cols-3">
            {/* Lose */}
            <div className="card-hover glass rounded-2xl p-6 group">
              <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <TrendingDown className="w-6 h-6 text-destructive" />
              </div>
              <h3 className="font-bold text-foreground mb-2">Perder peso</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Déficit de{" "}
                <span className="font-semibold text-foreground">
                  400-500 kcal
                </span>{" "}
                abaixo do GET ≈ 0.5 kg/semana.
              </p>
              <div className="mt-4 pt-3 border-t border-border/40">
                <p className="text-xs text-muted-foreground">
                  <span className="text-accent font-semibold">Dica:</span>{" "}
                  Combine cardio + musculação para preservar massa magra.
                </p>
              </div>
            </div>

            {/* Maintain */}
            <div className="card-hover glass rounded-2xl p-6 group">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Minus className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-bold text-foreground mb-2">Manter peso</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Consuma aproximadamente o valor do seu{" "}
                <span className="font-semibold text-foreground">GET</span>{" "}
                diariamente.
              </p>
              <div className="mt-4 pt-3 border-t border-border/40">
                <p className="text-xs text-muted-foreground">
                  <span className="text-accent font-semibold">Dica:</span>{" "}
                  1.6-2.2g de proteína por kg de peso corporal.
                </p>
              </div>
            </div>

            {/* Gain */}
            <div className="card-hover glass rounded-2xl p-6 group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold text-foreground mb-2">Ganhar peso</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Superávit de{" "}
                <span className="font-semibold text-foreground">
                  400-500 kcal
                </span>{" "}
                acima do GET ≈ 0.5 kg/semana.
              </p>
              <div className="mt-4 pt-3 border-t border-border/40">
                <p className="text-xs text-muted-foreground">
                  <span className="text-accent font-semibold">Dica:</span>{" "}
                  Treino de força intenso para ganho de massa muscular.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Disclaimer ── */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="mx-auto max-w-3xl">
          <div className="glass rounded-2xl p-6 sm:p-8 flex gap-4">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
              <Brain className="w-5 h-5 text-accent" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground text-sm">
                Informação importante
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Os resultados são estimativas baseadas em fórmulas
                cientificamente validadas. Para um plano personalizado e seguro,
                consulte um{" "}
                <span className="font-semibold text-foreground">
                  nutricionista ou profissional de saúde
                </span>
                .
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border/40 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <img src="/icon.svg" alt="Logo" className="w-5 h-5 rounded" />
            <span className="font-semibold text-foreground">
              Calculadora Metabólica
            </span>
          </div>
          <span>Fórmula Mifflin-St Jeor • {new Date().getFullYear()}</span>
        </div>
      </footer>
    </main>
  );
}
