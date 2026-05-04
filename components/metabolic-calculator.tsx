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
  Download,
  TrendingDown,
  TrendingUp,
  Minus,
  ShieldCheck,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";
import { objetivosDieta } from "@/lib/dieta";
import type { ObjetivoDieta } from "@/lib/dieta";
import type { StatusFilaDieta } from "@/lib/fila-dieta";
import {
  dividirConteudoDieta,
  separarItemECalorias,
} from "@/lib/dieta-format";
import { downloadDietPdf } from "@/lib/dieta-pdf";

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
  const [baixandoPdf, setBaixandoPdf] = useState(false);

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

  const objetivoDietaGerada = dietaGerada
    ? objetivosDieta.find((objetivo) => objetivo.id === dietaGerada.objetivo)
    : null;
  const secoesDieta = dietaGerada
    ? dividirConteudoDieta(dietaGerada.conteudo)
    : [];
  const totalItensDieta = secoesDieta.reduce(
    (total, secao) => total + secao.itens.length,
    0,
  );

  const baixarPdfDieta = async () => {
    if (!dietaGerada) {
      return;
    }

    const objetivoAtual = objetivosDieta.find(
      (objetivo) => objetivo.id === dietaGerada.objetivo,
    );

    if (!objetivoAtual) {
      toast.error("Nao foi possivel preparar o PDF dessa dieta.");
      return;
    }

    try {
      setBaixandoPdf(true);

      await new Promise((resolve) => window.setTimeout(resolve, 0));

      await downloadDietPdf({
        tituloObjetivo: objetivoAtual.titulo,
        descricaoObjetivo: objetivoAtual.descricaoCard,
        calorias: dietaGerada.calorias,
        secoes: secoesDieta,
        observacao:
          "Esta dieta e uma sugestao aproximada gerada por IA. Ajustes individuais, restricoes alimentares e contexto clinico devem ser avaliados com um nutricionista.",
        nomeArquivo: `dieta-${objetivoAtual.id}.pdf`,
      });

      toast.success("PDF da dieta baixado com sucesso.");
    } catch (error) {
      const mensagemErro =
        error instanceof Error
          ? error.message
          : "Nao foi possivel gerar o PDF da dieta agora.";

      toast.error(mensagemErro);
    } finally {
      setBaixandoPdf(false);
    }
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
              <div className="stagger-children grid gap-3 lg:grid-cols-3">
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

              </div>

              {solicitacaoAtiva && (
                <div className="mt-4 rounded-xl border border-accent/15 bg-accent/5 p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock3 className="h-4 w-4 text-accent" />
                    <p className="text-sm font-semibold text-foreground">
                      Dieta em processamento
                    </p>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {solicitacaoAtiva.status === "pendente"
                      ? "Sua solicitação entrou na fila. Assim que chegar a vez dela, vamos gerar a dieta automaticamente."
                      : "Sua solicitação está sendo processada agora."}
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
                <div className="mt-4 relative overflow-hidden rounded-[1.75rem] border border-accent/15 bg-linear-to-br from-background via-background to-accent/6 p-[1px] shadow-[0_28px_80px_-40px_oklch(0.5_0.2_270_/_0.45)]">
                  <div className="absolute inset-x-10 top-0 h-px bg-linear-to-r from-transparent via-accent/60 to-transparent" />

                  <div className="relative rounded-[calc(1.75rem-1px)] bg-background/88 p-5 sm:p-6">
                    <div className="space-y-6">
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div className="space-y-3">
                          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-accent/15 bg-accent/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
                            <Sparkles className="h-3.5 w-3.5" />
                            Curadoria por IA
                          </span>

                          <div className="space-y-2">
                            <h4 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                              {objetivoDietaGerada?.titulo}
                            </h4>
                            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                              Plano alimentar aproximado organizado por refeição
                              para leitura mais clara e uso prático no desktop e
                              no mobile.
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3 lg:max-w-sm">
                          <Button
                            type="button"
                            onClick={() => void baixarPdfDieta()}
                            disabled={baixandoPdf}
                            className="h-11 w-full rounded-2xl bg-linear-to-r from-accent to-primary text-white shadow-lg shadow-accent/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-accent/30"
                          >
                            {baixandoPdf ? (
                              <>
                                <Spinner className="size-4" />
                                Preparando PDF...
                              </>
                            ) : (
                              <>
                                <Download className="size-4" />
                                Baixar PDF
                              </>
                            )}
                          </Button>

                          <p className="text-xs leading-relaxed text-muted-foreground">
                            Exporta uma versão objetiva da dieta, pronta para
                            consulta, compartilhamento ou impressão.
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl border border-border/60 bg-background/72 px-4 py-3">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            Meta diária
                          </p>
                          <p className="mt-2 text-lg font-semibold text-foreground">
                            {dietaGerada.calorias}
                            <span className="ml-1 text-sm font-normal text-muted-foreground">
                              kcal
                            </span>
                          </p>
                        </div>

                        <div className="rounded-2xl border border-border/60 bg-background/72 px-4 py-3">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            Refeições
                          </p>
                          <p className="mt-2 text-lg font-semibold text-foreground">
                            {secoesDieta.length}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-border/60 bg-background/72 px-4 py-3">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            Itens
                          </p>
                          <p className="mt-2 text-lg font-semibold text-foreground">
                            {totalItensDieta}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-[1.4rem] border border-accent/12 bg-linear-to-b from-accent/10 via-accent/4 to-transparent p-5">
                        <div className="flex items-center gap-2 text-accent">
                          <UtensilsCrossed className="h-4 w-4" />
                          <p className="text-xs font-semibold uppercase tracking-[0.2em]">
                            Resumo do plano
                          </p>
                        </div>

                        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="space-y-4">
                            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                              {objetivoDietaGerada?.descricaoCard ??
                                "Estrutura aproximada para distribuir suas calorias ao longo do dia."}
                            </p>

                            <div className="flex flex-wrap gap-2">
                              <span className="rounded-full border border-border/60 bg-background/75 px-3 py-1 text-xs text-foreground">
                                Organizado por refeição
                              </span>
                              <span className="rounded-full border border-border/60 bg-background/75 px-3 py-1 text-xs text-foreground">
                                Sugestão aproximada
                              </span>
                              <span className="rounded-full border border-border/60 bg-background/75 px-3 py-1 text-xs text-foreground">
                                Ajuste profissional recomendado
                              </span>
                            </div>
                          </div>

                          <div className="rounded-2xl border border-border/60 bg-background/65 p-4 lg:max-w-xs">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                              Observação
                            </p>
                            <p className="mt-2 text-sm leading-relaxed text-foreground">
                              Use este plano como ponto de partida e refine
                              quantidades, preferências e restrições com um
                              nutricionista.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {secoesDieta.map((secao, indice) => (
                          <div
                            key={`${secao.titulo}-${indice}`}
                            className="group rounded-[1.45rem] border border-border/60 bg-background/72 p-4 sm:p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/25 hover:shadow-[0_20px_40px_-28px_oklch(0.5_0.2_270_/_0.45)]"
                          >
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                              <div className="flex min-w-0 items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-accent to-primary text-sm font-bold text-white shadow-sm shadow-accent/25">
                                  {indice + 1}
                                </div>

                                <div className="min-w-0 space-y-1">
                                  <h5 className="text-base font-semibold tracking-tight text-foreground">
                                    {secao.titulo}
                                  </h5>
                                  <p className="text-xs text-muted-foreground">
                                    {secao.itens.length} item
                                    {secao.itens.length > 1 ? "s" : ""}
                                  </p>

                                  {secao.descricao ? (
                                    <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                                      {secao.descricao}
                                    </p>
                                  ) : null}
                                </div>
                              </div>

                              {secao.calorias ? (
                                <span className="inline-flex w-fit shrink-0 rounded-full border border-accent/15 bg-accent/8 px-3 py-1 text-xs font-semibold text-accent">
                                  {secao.calorias}
                                </span>
                              ) : null}
                            </div>

                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                              {secao.itens.map((item, itemIndice) => {
                                const { descricao, calorias } =
                                  separarItemECalorias(item);

                                return (
                                  <div
                                    key={`${secao.titulo}-${itemIndice}`}
                                    className="rounded-2xl border border-border/50 bg-muted/22 px-3 py-3"
                                  >
                                    <div className="flex min-w-0 flex-col gap-2">
                                      <p className="min-w-0 text-sm leading-relaxed text-foreground">
                                        {descricao}
                                      </p>

                                      {calorias ? (
                                        <span className="inline-flex w-fit rounded-full border border-accent/15 bg-accent/8 px-2.5 py-1 text-[11px] font-semibold text-accent">
                                          {calorias}
                                        </span>
                                      ) : null}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-start gap-3 rounded-[1.35rem] border border-border/60 bg-muted/28 px-4 py-3.5">
                        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                          <ShieldCheck className="h-4 w-4" />
                        </div>

                        <p className="text-sm leading-relaxed text-muted-foreground">
                          Esta dieta é uma sugestão aproximada gerada por IA.
                          Ajustes individuais devem ser feitos com um
                          nutricionista.
                        </p>
                      </div>
                    </div>
                  </div>
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
      )}
    </div>
  );
}
