"use client"

import * as React from "react"
import { motion, useReducedMotion } from "motion/react"
import { Upload, X } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"
import { API_BASE_URL, getAuthToken } from "@/lib/api"

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]
const MAX_SIZE = 5 * 1024 * 1024

type ProfileImageUploadProps = {
  value?: string | null
  onChange: (url: string | null) => void
  onUploadingChange?: (uploading: boolean) => void
  disabled?: boolean
  endpoint?: string
  /** Send the Better Auth bearer token (required by vendor-only endpoints). */
  withAuth?: boolean
}

export function ProfileImageUpload({
  value,
  onChange,
  onUploadingChange,
  disabled = false,
  endpoint = "/api/profile/images",
  withAuth = false,
}: ProfileImageUploadProps) {
  const reduceMotion = useReducedMotion()
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const objectUrlRef = React.useRef<string | null>(null)
  const [preview, setPreview] = React.useState<string | null>(value ?? null)
  const [isDragging, setIsDragging] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!isUploading) {
      setPreview(value ?? null)
    }
  }, [value, isUploading])

  React.useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
      }
    }
  }, [])

  function revokeObjectUrl() {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
  }

  function setUploading(next: boolean) {
    setIsUploading(next)
    onUploadingChange?.(next)
  }

  function validateFile(file: File) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Only JPEG, PNG, or WebP images are supported."
    }
    if (file.size > MAX_SIZE) {
      return "Image must be 5 MB or smaller."
    }
    return null
  }

  async function uploadFile(file: File) {
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    revokeObjectUrl()
    const objectUrl = URL.createObjectURL(file)
    objectUrlRef.current = objectUrl
    setPreview(objectUrl)
    setError(null)
    setProgress(0)
    setUploading(true)

    let token: string | null = null
    if (withAuth) {
      try {
        token = await getAuthToken()
      } catch (tokenError) {
        setError(
          tokenError instanceof Error
            ? tokenError.message
            : "Your session expired. Please sign in again."
        )
        revokeObjectUrl()
        setPreview(value ?? null)
        setProgress(0)
        setUploading(false)
        return
      }
    }

    const xhr = new XMLHttpRequest()
    xhr.open("POST", `${API_BASE_URL}${endpoint}`)
    xhr.setRequestHeader("Content-Type", file.type)
    xhr.setRequestHeader("X-File-Name", file.name)
    if (token) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`)
    }

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        setProgress(Math.round((event.loaded / event.total) * 100))
      }
    }

    xhr.onload = () => {
      try {
        const result = JSON.parse(xhr.responseText)
        if (xhr.status >= 200 && xhr.status < 300 && result?.data?.url) {
          revokeObjectUrl()
          const uploadedUrl = result.data.url as string
          setPreview(uploadedUrl)
          onChange(uploadedUrl)
          setProgress(100)
        } else {
          setError(result?.message || "Upload failed. Please try again.")
          revokeObjectUrl()
          setPreview(value ?? null)
          setProgress(0)
        }
      } catch {
        setError("Upload failed. Please try again.")
        revokeObjectUrl()
        setPreview(value ?? null)
        setProgress(0)
      } finally {
        setUploading(false)
      }
    }

    xhr.onerror = () => {
      setError("Upload failed. Please check your connection.")
      revokeObjectUrl()
      setPreview(value ?? null)
      setProgress(0)
      setUploading(false)
    }

    xhr.send(file)
  }

  function handleFiles(files: FileList | null) {
    const file = files?.[0]
    if (!file) {
      return
    }
    void uploadFile(file)
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragging(false)
    if (disabled || isUploading) {
      return
    }
    handleFiles(event.dataTransfer.files)
  }

  function handleRemove() {
    revokeObjectUrl()
    setPreview(null)
    setError(null)
    setProgress(0)
    onChange(null)
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  return (
    <motion.div
      onDragOver={(event) => {
        event.preventDefault()
        if (!disabled && !isUploading) {
          setIsDragging(true)
        }
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-dashed p-3 backdrop-blur-sm transition-all duration-300",
        isDragging
          ? "border-primary/60 bg-primary/5"
          : "border-border/70 bg-card/60",
        disabled && "cursor-not-allowed opacity-70"
      )}
      whileHover={reduceMotion ? undefined : { y: -1 }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        disabled={disabled || isUploading}
        onChange={(event) => handleFiles(event.target.files)}
        aria-label="Upload profile image"
      />

      {preview ? (
        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted sm:h-40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Profile image preview"
            className="size-full object-cover"
          />

          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled || isUploading}
            className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Remove profile image"
          >
            <X className="size-4" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={disabled || isUploading}
            className="absolute inset-x-2 bottom-2 rounded-lg border border-white/20 bg-black/55 px-3 py-2 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:bg-black/75 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Replace image
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || isUploading}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-xl px-4 py-8 text-center transition-colors hover:bg-primary/5 disabled:cursor-not-allowed"
        >
          <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Upload className="size-5" aria-hidden="true" />
          </span>
          <span className="text-sm font-medium">
            Click to upload or drag and drop
          </span>
          <span className="text-xs text-muted-foreground">
            JPEG, PNG, or WebP up to 5 MB
          </span>
        </button>
      )}

      {isUploading ? (
        <div className="mt-3">
          <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
            <span>Uploading</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </motion.div>
  )
}
