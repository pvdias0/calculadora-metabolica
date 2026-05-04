"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { TurnstileWidget } from "@/components/turnstile-widget";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Activity,
  Clock3,
  TrendingDown,
  TrendingUp,
  Minus,
} from "lucide-react";
import { objetivosDieta } from "@/lib/dieta";
import type { ObjetivoDieta } from "@/lib/dieta";
import type { StatusFilaDieta } from "@/lib/fila-dieta";

interface ResultadoCalculadora {
  tmb: number;
  get: number;
  emagrecimento: number;
  manutencao: number;
  hipertrofia: number;
}

interface RespostaCriacaoJobDieta {
  jobId?: string;
  status?: StatusFilaDieta;
  calorias?: number;
  objetivo?: ObjetivoDieta;
  posicaoNaFila?: number | null;
  tempoEstimadoSegundos?: number | null;
  captchaObrigatorio?: boolean;
  erro?: string;
}

interface RespostaStatusJobDieta extends RespostaCriacaoJobDieta {
  dieta?: string;
  tentativas?: number;
}

interface SolicitacaoDietaAtiva {
  jobId: string;
  status: StatusFilaDieta;
  calorias: number;
  objetivo: ObjetivoDieta;
  posicaoNaFila: number | null;
  tempoEstimadoSegundos: number | null;
  erro?: string;
}

interface DietaGerada {
  conteudo: string;
  calorias: number;
  objetivo: ObjetivoDieta;
}

export function MetabolicCalculator() {
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const [peso, setPeso] = useState("");
  const [altura, setAltura] = useState("");
  const [idade, setIdade] = useState("");
  const [sexo, setSexo] = useState<"masculino" | "feminino">("masculino");
  const [nivelAtividade, setNivelAtividade] = useState("");
  const [resultado, setResultado] = useState<ResultadoCalculadora | null>(null);
  const [objetivoCarregando, setObjetivoCarregando] =
    useState<ObjetivoDieta | null>(null);
  const [dietaGerada, setDietaGerada] = useState<DietaGerada | null>(null);
  const [solicitacaoAtiva, setSolicitacaoAtiva] =
    useState<SolicitacaoDietaAtiva | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaVersao, setCaptchaVersao] = useState(0);

  const calcularTmb = () => {
    const pesoAtual = Number.parseFloat(peso);
    const alturaAtual = Number.parseFloat(altura);
    const idadeAtual = Number.parseFloat(idade);

    if (sexo === "masculino") {
      return 10 * pesoAtual + 6.25 * alturaAtual - 5 * idadeAtual + 5;
    } else {
      return 10 * pesoAtual + 6.25 * alturaAtual - 5 * idadeAtual - 161;
    }
  };

  const obterMultiplicadorAtividade = (nivel: string) => {
    switch (nivel) {
      case "sedentario":
        return 1.2;
      case "leve":
        return 1.375;
      case "moderado":
        return 1.55;
      case "ativo":
        return 1.725;
      case "muito-ativo":
        return 1.9;
      default:
        return 1.2;
    }
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();

    if (!peso || !altura || !idade || !nivelAtividade) {
      return;
    }

    const tmb = calcularTmb();
    const multiplicador = obterMultiplicadorAtividade(nivelAtividade);
    const get = tmb * multiplicador;

    setResultado({
      tmb: Math.round(tmb),
      get: Math.round(get),
      emagrecimento: Math.round(get - 400),
      hipertrofia: Math.round(get + 400),
      manutencao: Math.round(get),
    });
    setObjetivoCarregando(null);
    setSolicitacaoAtiva(null);
    setDietaGerada(null);
    setCaptchaToken(null);
    setCaptchaVersao((versao) => versao + 1);
  };

  const resetForm = () => {
    setPeso("");
    setAltura("");
    setIdade("");
    setSexo("masculino");
    setNivelAtividade("");
    setResultado(null);
    setObjetivoCarregando(null);
    setDietaGerada(null);
    setSolicitacaoAtiva(null);
    setCaptchaToken(null);
    setCaptchaVersao((versao) => versao + 1);
  };

  const gerarDieta = async (objetivo: ObjetivoDieta) => {
    if (!resultado) {
      return;
    }

    if (turnstileSiteKey && !captchaToken) {
      toast.error("Confirme o CAPTCHA antes de solicitar a dieta.");
      return;
    }

    const calorias = resultado[objetivo];
    setObjetivoCarregando(objetivo);

    try {
      const response = await fetch("/api/dieta", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          objetivo,
          calorias,
          captchaToken,
        }),
      });

      const dados = (await response.json()) as RespostaCriacaoJobDieta;

      if (
        !response.ok ||
        !dados.jobId ||
        !dados.status ||
        !dados.objetivo ||
        !dados.calorias
      ) {
        throw new Error(
          dados.erro ||
            "Não foi possível iniciar a geração da dieta para esse objetivo.",
        );
      }

      setDietaGerada(null);
      setSolicitacaoAtiva({
        jobId: dados.jobId,
        status: dados.status,
        calorias: dados.calorias,
        objetivo: dados.objetivo,
        posicaoNaFila: dados.posicaoNaFila ?? null,
        tempoEstimadoSegundos: dados.tempoEstimadoSegundos ?? null,
      });
      setCaptchaToken(null);
      setCaptchaVersao((versao) => versao + 1);
    } catch (error) {
      const mensagemErro =
        error instanceof Error
          ? error.message
          : "Não foi possível gerar a dieta agora.";

      setObjetivoCarregando(null);
      toast.error(mensagemErro);
    }
  };

  useEffect(() => {
    if (
      !solicitacaoAtiva ||
      (solicitacaoAtiva.status !== "pendente" &&
        solicitacaoAtiva.status !== "processando")
    ) {
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/dieta/${solicitacaoAtiva.jobId}`, {
          cache: "no-store",
        });

        const dados = (await response.json()) as RespostaStatusJobDieta;

        if (!response.ok || !dados.status || !dados.objetivo || !dados.calorias) {
          throw new Error(
            dados.erro ||
              "Não foi possível consultar o andamento da geração da dieta.",
          );
        }

        if (dados.status === "concluido" && dados.dieta) {
          setDietaGerada({
            conteudo: dados.dieta,
            calorias: dados.calorias,
            objetivo: dados.objetivo,
          });
          setSolicitacaoAtiva(null);
          setObjetivoCarregando(null);
          return;
        }

        if (dados.status === "erro") {
          setSolicitacaoAtiva(null);
          setObjetivoCarregando(null);
          toast.error(
            dados.erro || "Não foi possível gerar a dieta para esse objetivo.",
          );
          return;
        }

        setSolicitacaoAtiva({
          jobId: solicitacaoAtiva.jobId,
          status: dados.status,
          calorias: dados.calorias,
          objetivo: dados.objetivo,
          posicaoNaFila: dados.posicaoNaFila ?? null,
          tempoEstimadoSegundos: dados.tempoEstimadoSegundos ?? null,
          erro: dados.erro,
        });
      } catch (error) {
        const mensagemErro =
          error instanceof Error
            ? error.message
            : "Não foi possível atualizar o andamento da dieta.";

        setSolicitacaoAtiva(null);
        setObjetivoCarregando(null);
        toast.error(mensagemErro);
      }
    }, 2500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [solicitacaoAtiva]);

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
                  value={peso}
                  onChange={(e) => setPeso(e.target.value)}
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
                  value={altura}
                  onChange={(e) => setAltura(e.target.value)}
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
                  value={idade}
                  onChange={(e) => setIdade(e.target.value)}
                  min="1"
                  max="120"
                  required
                  className="text-base h-11 rounded-xl bg-background/50 border-border/60 focus:border-accent focus:ring-accent/20"
                />
              </div>

              <div className="space-y-2">
                <Label>Sexo</Label>
                <RadioGroup
                  value={sexo}
                  onValueChange={(value) =>
                    setSexo(value as "masculino" | "feminino")
                  }
                >
                  <div className="flex items-center gap-6 h-11">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="masculino" id="male" />
                      <Label
                        htmlFor="male"
                        className="font-normal cursor-pointer"
                      >
                        Masculino
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="feminino" id="female" />
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
                value={nivelAtividade}
                onValueChange={setNivelAtividade}
                required
              >
                <SelectTrigger
                  id="activity"
                  className="text-base h-11 rounded-xl bg-background/50 border-border/60"
                >
                  <SelectValue placeholder="Selecione seu nível de atividade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentario">
                    Sedentário (pouco ou nenhum exercício)
                  </SelectItem>
                  <SelectItem value="leve">
                    Levemente ativo (exercício 1-3 dias/semana)
                  </SelectItem>
                  <SelectItem value="moderado">
                    Moderadamente ativo (exercício 3-5 dias/semana)
                  </SelectItem>
                  <SelectItem value="ativo">
                    Muito ativo (exercício 6-7 dias/semana)
                  </SelectItem>
                  <SelectItem value="muito-ativo">
                    Extremamente ativo (exercício intenso diário)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {turnstileSiteKey && (
              <div className="space-y-2">
                <Label>Verificação de segurança</Label>
                <div className="rounded-xl border border-border/60 bg-background/50 p-3">
                  <TurnstileWidget
                    key={captchaVersao}
                    siteKey={turnstileSiteKey}
                    onTokenChange={setCaptchaToken}
                  />
                </div>
              </div>
            )}

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
              {resultado && (
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

      {resultado && (
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
                    {resultado.tmb}
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
                    {resultado.get}
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
                {objetivosDieta.map((objetivo) => {
                  const configuracaoVisual =
                    objetivo.id === "emagrecimento"
                      ? {
                          Icon: TrendingDown,
                          className:
                            "border-destructive/15 bg-destructive/5",
                          iconClassName: "text-destructive",
                        }
                      : objetivo.id === "manutencao"
                        ? {
                            Icon: Minus,
                            className: "border-accent/15 bg-accent/5",
                            iconClassName: "text-accent",
                          }
                        : {
                            Icon: TrendingUp,
                            className: "border-primary/15 bg-primary/5",
                            iconClassName: "text-primary",
                          };

                  const selecionado = dietaGerada?.objetivo === objetivo.id;
                  const caloriasObjetivo = resultado[objetivo.id];

                  return (
                    <div
                      key={objetivo.id}
                      className={`rounded-xl border p-5 space-y-4 card-hover ${configuracaoVisual.className} ${selecionado ? "ring-1 ring-accent/40" : ""}`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <configuracaoVisual.Icon
                            className={`h-5 w-5 ${configuracaoVisual.iconClassName}`}
                          />
                          <h4 className="font-semibold text-foreground">
                            {objetivo.titulo}
                          </h4>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {objetivo.descricaoCard}
                        </p>
                        <p className="text-3xl font-bold text-foreground tracking-tight">
                          {caloriasObjetivo}
                          <span className="text-sm font-normal text-muted-foreground ml-1">
                            kcal/dia
                          </span>
                        </p>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => void gerarDieta(objetivo.id)}
                        disabled={objetivoCarregando !== null}
                        className="w-full rounded-xl border-border/60 bg-background/70 hover:bg-background"
                      >
                        {objetivoCarregando === objetivo.id ? (
                          <>
                            <Spinner className="size-4" />
                            {solicitacaoAtiva?.status === "pendente"
                              ? "Entrando na fila..."
                              : "Gerando dieta..."}
                          </>
                        ) : (
                          "Gerar dieta com IA"
                        )}
                      </Button>
                    </div>
                  );
                })}

                {solicitacaoAtiva && (
                  <div className="rounded-xl border border-accent/15 bg-accent/5 p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <Clock3 className="h-4 w-4 text-accent" />
                      <p className="text-sm font-semibold text-foreground">
                        Dieta em processamento
                      </p>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {solicitacaoAtiva.status === "pendente"
                        ? "Sua solicitação entrou na fila. Assim que chegar a vez dela, vamos gerar a dieta automaticamente."
                        : "Sua solicitação está sendo processada pelo Gemini agora."}
                    </p>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-xl bg-background/80 p-3">
                        <p className="text-xs text-muted-foreground">Objetivo</p>
                        <p className="text-sm font-medium text-foreground">
                          {
                            objetivosDieta.find(
                              (objetivo) =>
                                objetivo.id === solicitacaoAtiva.objetivo,
                            )?.titulo
                          }
                        </p>
                      </div>
                      <div className="rounded-xl bg-background/80 p-3">
                        <p className="text-xs text-muted-foreground">
                          Posição na fila
                        </p>
                        <p className="text-sm font-medium text-foreground">
                          {solicitacaoAtiva.posicaoNaFila ?? "Processando"}
                        </p>
                      </div>
                      <div className="rounded-xl bg-background/80 p-3">
                        <p className="text-xs text-muted-foreground">
                          Tempo estimado
                        </p>
                        <p className="text-sm font-medium text-foreground">
                          {solicitacaoAtiva.tempoEstimadoSegundos !== null
                            ? `${solicitacaoAtiva.tempoEstimadoSegundos}s`
                            : "Em andamento"}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      O limite do provedor é controlado no servidor para evitar
                      excesso de requisições simultâneas.
                    </p>
                  </div>
                )}

                {dietaGerada && (
                  <div className="rounded-xl border border-accent/15 bg-background/70 p-5 space-y-4">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-widest text-accent">
                        Dieta aproximada com IA
                      </p>
                      <h4 className="text-lg font-semibold text-foreground">
                        {
                          objetivosDieta.find(
                            (objetivo) => objetivo.id === dietaGerada.objetivo,
                          )?.titulo
                        }
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Meta calórica: {dietaGerada.calorias} kcal/dia
                      </p>
                    </div>

                    <div className="rounded-xl bg-muted/30 p-4">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                        {dietaGerada.conteudo}
                      </p>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Esta dieta é uma sugestão aproximada gerada por IA.
                      Ajustes individuais devem ser feitos com um nutricionista.
                    </p>
                  </div>
                )}

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
