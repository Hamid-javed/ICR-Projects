'use client'

import { toast } from 'react-toastify'

export default function useToast() {
  const showSuccess = (message: string) => {
    toast.success(message)
  }

  const showError = (message: string) => {
    toast.error(message)
  }

  const showInfo = (message: string) => {
    toast.info(message)
  }

  const showWarning = (message: string) => {
    toast.warn(message)
  }

  return { showSuccess, showError, showInfo, showWarning }
}