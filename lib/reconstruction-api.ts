// API client para 3D reconstruction
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface UploadResponse {
  job_id: string
  message: string
  images_received: number
}

export interface JobStatus {
  job_id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  image_count: number
  model_url?: string
  error_message?: string
}

export const reconstructionAPI = {
  async uploadImages(files: File[]): Promise<UploadResponse> {
    const formData = new FormData()
    files.forEach((file) => formData.append('files', file))

    const response = await fetch(`${API_BASE_URL}/api/upload`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`)
    }

    return response.json()
  },

  async getJobStatus(jobId: string): Promise<JobStatus> {
    const response = await fetch(`${API_BASE_URL}/api/status/${jobId}`)

    if (!response.ok) {
      throw new Error(`Status fetch failed: ${response.statusText}`)
    }

    return response.json()
  },

  async startProcessing(jobId: string): Promise<{ message: string; status: string }> {
    const response = await fetch(`${API_BASE_URL}/api/process/${jobId}`, {
      method: 'POST',
    })

    if (!response.ok) {
      throw new Error(`Processing start failed: ${response.statusText}`)
    }

    return response.json()
  },

  pollJobStatus(jobId: string, interval: number = 2000): Promise<JobStatus> {
    return new Promise((resolve, reject) => {
      const pollInterval = setInterval(async () => {
        try {
          const status = await this.getJobStatus(jobId)

          if (status.status === 'completed' || status.status === 'failed') {
            clearInterval(pollInterval)
            resolve(status)
          }
        } catch (error) {
          clearInterval(pollInterval)
          reject(error)
        }
      }, interval)
    })
  },
}
