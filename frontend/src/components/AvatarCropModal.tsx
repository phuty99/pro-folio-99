import { useState, useCallback } from 'react'
import Cropper, { type Area } from 'react-easy-crop'
import { getCroppedImageBlob } from '../utils/cropImage'

export default function AvatarCropModal({
  imageSrc,
  onCancel,
  onConfirm,
}: {
  imageSrc: string
  onCancel: () => void
  onConfirm: (blob: Blob) => void
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [processing, setProcessing] = useState(false)

  const onCropComplete = useCallback((_croppedArea: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels)
  }, [])

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return
    setProcessing(true)
    try {
      const blob = await getCroppedImageBlob(imageSrc, croppedAreaPixels)
      onConfirm(blob)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-earth-900/60 z-[60] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-earth-100 rounded-2xl shadow-lg w-full max-w-md p-6 flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-earth-900">Adjust avatar</h2>

        <div className="relative w-full h-72 bg-earth-50 rounded-lg overflow-hidden">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-earth-600 shrink-0">Zoom</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-fire-600"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="text-earth-700 hover:text-earth-900 text-sm font-medium px-3 py-2"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={processing}
            className="bg-fire-600 hover:bg-fire-700 text-white text-sm font-medium px-4 py-2 rounded-md"
          >
            {processing ? 'Saving...' : 'Save avatar'}
          </button>
        </div>
      </div>
    </div>
  )
}
