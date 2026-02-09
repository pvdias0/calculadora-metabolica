'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import ModelViewer from './model-viewer'

interface UploadResponse {
  job_id: string
  message: string
  images_received: number
}

interface JobStatus {
  job_id: string
  status: string
  progress: number
  image_count: number
  model_url?: string
  error_message?: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function Reconstructor3D() {
  const [files, setFiles] = useState<File[]>([])
  const [jobId, setJobId] = useState<string | null>(null)
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Selecione pelo menos 1 imagem')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      files.forEach((file) => formData.append('files', file))

      const response = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Erro ao enviar imagens')
      }

      const data: UploadResponse = await response.json()
      setJobId(data.job_id)
      setFiles([])

      // Iniciar polling para status
      pollJobStatus(data.job_id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      setLoading(false)
    }
  }

  const pollJobStatus = async (id: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/status/${id}`)
        if (!response.ok) throw new Error('Erro ao buscar status')

        const data: JobStatus = await response.json()
        setJobStatus(data)

        if (data.status === 'completed' || data.status === 'failed') {
          clearInterval(interval)
          setLoading(false)
        }
      } catch (err) {
        console.error('Erro ao buscar status:', err)
        clearInterval(interval)
      }
    }, 2000) // Poll a cada 2 segundos
  }

  const resetForm = () => {
    setFiles([])
    setJobId(null)
    setJobStatus(null)
    setError(null)
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Reconstrução 3D</CardTitle>
          <CardDescription>
            Envie múltiplas imagens de um local para gerar um modelo 3D
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upload Section */}
          {!jobId ? (
            <div className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-input"
                />
                <label
                  htmlFor="file-input"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="w-8 h-8 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    Clique ou arraste imagens aqui
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, WebP (mínimo 640x480)
                  </p>
                </label>
              </div>

              {files.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">{files.length} imagem(ns) selecionada(s):</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {files.map((file) => (
                      <li key={file.name}>✓ {file.name}</li>
                    ))}
                  </ul>
                </div>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleUpload}
                disabled={files.length === 0 || loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar e Processar'
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Status Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Progresso de Processamento</p>
                  <p className="text-sm text-muted-foreground">
                    {jobStatus?.status === 'completed' ? '100' : jobStatus?.progress || 0}%
                  </p>
                </div>
                <Progress value={jobStatus?.progress || 0} className="h-2" />
              </div>

              {/* Status Display */}
              {jobStatus && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {jobStatus.status === 'completed' && (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <p className="text-sm font-medium text-green-600">Reconstrução Concluída!</p>
                      </>
                    )}
                    {jobStatus.status === 'processing' && (
                      <>
                        <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                        <p className="text-sm font-medium text-blue-600">
                          Processando... ({jobStatus.image_count} imagens)
                        </p>
                      </>
                    )}
                    {jobStatus.status === 'failed' && (
                      <>
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-sm font-medium text-red-600">Erro no Processamento</p>
                      </>
                    )}
                  </div>

                  {jobStatus.error_message && (
                    <Alert variant="destructive">
                      <AlertCircle className="w-4 h-4" />
                      <AlertDescription>{jobStatus.error_message}</AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              {/* 3D Model Viewer */}
              {jobStatus?.status === 'completed' && jobStatus.model_url && (
                <ModelViewer modelUrl={jobStatus.model_url} />
              )}

              {/* Reset Button */}
              <Button
                onClick={resetForm}
                variant="outline"
                className="w-full"
              >
                Processar Novas Imagens
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Dicas para Melhor Reconstrução</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm space-y-2 text-muted-foreground">
            <li>✓ Use 20-50 imagens com sobreposição de 60-80%</li>
            <li>✓ Capture de múltiplos ângulos (padrão circular ou 360°)</li>
            <li>✓ Boa iluminação é essencial</li>
            <li>✓ Evite superfícies reflexivas ou textura repetitiva</li>
            <li>✓ Resolução mínima: 640x480px</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
