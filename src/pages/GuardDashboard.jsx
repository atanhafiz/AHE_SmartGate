import { useState, useRef, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import toast from 'react-hot-toast'

const GuardDashboard = () => {
  const [photo, setPhoto] = useState(null)
  const [preview, setPreview] = useState(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [captured, setCaptured] = useState(false)
  const [loading, setLoading] = useState(false)
  const [notes, setNotes] = useState('')
  
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  // Start camera
  const startCamera = async () => {
    try {
      console.log("🎥 Starting camera...")
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        // Safari & mobile sometimes need a delay before play()
        setTimeout(async () => {
          try {
            await videoRef.current.play()
            console.log("✅ Camera stream started successfully")
            setCameraActive(true)
          } catch (playError) {
            console.warn("⚠️ Video play() interrupted:", playError)
          }
        }, 300)
      }
    } catch (err) {
      console.error("❌ Camera access error:", err)
      alert("Kamera tidak dapat diakses. Pastikan permission kamera telah dibenarkan.")
    }
  }

  // Capture photo
  const capturePhoto = () => {
    const canvas = document.createElement("canvas")
    const video = videoRef.current
    if (!video) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext("2d")
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    canvas.toBlob((blob) => {
      setCaptured(true)
      console.log("✅ Image captured", blob)
      if (blob) {
        setPhoto(blob)
        setPreview(URL.createObjectURL(blob))
        stopCamera()
      }
    }, "image/jpeg", 0.9)
  }

  // Retake photo
  const retakePhoto = () => {
    setPhoto(null)
    setPreview(null)
    setCaptured(false)
    setNotes('')
    startCamera()
  }

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      console.log("🛑 Stopping camera stream...")
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) videoRef.current.srcObject = null
    setCameraActive(false)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  // Upload image to Supabase Storage
  const uploadImage = async (file) => {
    try {
      const fileName = `guard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`
      
      const { data, error } = await supabase.storage
        .from('selfies')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('selfies')
        .getPublicUrl(fileName)

      return publicUrl
    } catch (error) {
      console.error('Upload error:', error)
      throw new Error('Gagal memuat naik gambar')
    }
  }

  // Insert entry to database
  const insertEntry = async (selfieUrl) => {
    try {
      const { data, error } = await supabase
        .from('entries')
        .insert([{
          entry_type: 'forced_by_guard',
          selfie_url: selfieUrl,
          notes: notes || 'Guard reported incident',
          timestamp: new Date().toISOString()
        }])
        .select()

      if (error) throw error
      return data[0]
    } catch (error) {
      console.error('Database insert error:', error)
      throw new Error('Gagal menyimpan rekod ke database')
    }
  }

  // Call Edge Function for Telegram notification
  const notifyTelegram = async (selfieUrl) => {
    try {
      const payload = {
        record: {
          id: `guard-${Date.now()}`,
          user_id: `guard-user-${Date.now()}`,
          entry_type: 'forced_by_guard',
          selfie_url: selfieUrl,
          notes: notes || 'Guard reported incident',
          timestamp: new Date().toISOString(),
          users: {
            name: 'Reported by Guard',
            user_type: 'visitor',
            house_number: '-'
          }
        }
      }

      const functionUrl = 'https://kpukhpavdxidnoexfljv.functions.supabase.co/notify-telegram'
      console.log('📤 Sending Telegram payload to:', functionUrl)
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_KEY}`
        },
        body: JSON.stringify(payload)
      })

      console.log('📊 Telegram response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Telegram send failed', errorText)
        const errorData = JSON.parse(errorText).catch(() => ({ error: errorText }))
        throw new Error(errorData.error || 'Gagal menghantar notifikasi')
      }

      const result = await response.json()
      console.log('✅ Telegram notification sent successfully:', result)
      return result
    } catch (error) {
      console.error('Telegram notification error:', error)
      throw new Error('Gagal menghantar notifikasi ke admin')
    }
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!photo) {
        toast.error('Sila ambil gambar terlebih dahulu')
        return
      }

      // Upload photo to Supabase Storage
      const selfieUrl = await uploadImage(photo)

      // Insert entry to database
      await insertEntry(selfieUrl)

      // Send Telegram notification
      await notifyTelegram(selfieUrl)

      // Show success message
      toast.success('🚨 Laporan berjaya dihantar ke admin.')

      // Reset form
      setPhoto(null)
      setPreview(null)
      setCaptured(false)
      setNotes('')

    } catch (error) {
      console.error('Submission error:', error)
      toast.error(error.message || 'Gagal hantar laporan. Cuba semula.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-sky-50 min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-sky-700 mb-6">
          🚨 Laporan Guard
        </h1>
        <p className="text-gray-600 mb-6">
          Ambil gambar dan laporkan kejadian yang mencurigakan
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Camera Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📷 Ambil Gambar *
            </label>
            
            {!captured ? (
              <div className="space-y-4">
                {/* Camera Preview */}
                {cameraActive ? (
                  <div className="relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full rounded-lg border border-sky-300 shadow-sm"
                      style={{ transform: "scaleX(-1)" }} // optional mirror off for back camera
                    />
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full w-14 h-14 flex items-center justify-center text-xl"
                      >
                        📸
                      </button>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-full w-14 h-14 flex items-center justify-center text-xl"
                      >
                        ❌
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={startCamera}
                    className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center space-x-2"
                  >
                    <span>📷</span>
                    <span>Buka Kamera</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Captured Photo Preview */}
                <div className="relative">
                  <img
                    src={preview}
                    alt="Captured photo"
                    className="w-full h-64 object-cover rounded-lg border-2 border-red-200"
                  />
                  <div className="absolute top-2 right-2">
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                      🚨 Guard Report
                    </span>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={retakePhoto}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center space-x-2"
                >
                  <span>🔄</span>
                  <span>Ambil Semula</span>
                </button>
              </div>
            )}
          </div>

          {/* Notes Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📝 Catatan (Pilihan)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="border rounded-lg w-full p-3 mt-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              placeholder="Jelaskan kejadian yang berlaku..."
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !captured}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Menghantar...</span>
              </>
            ) : (
              <>
                <span>🚨</span>
                <span>Hantar Laporan</span>
              </>
            )}
          </button>

          {/* Instructions */}
          <div className="text-xs text-gray-500 space-y-1">
            <p>• Pastikan gambar jelas dan terang</p>
            <p>• Laporan akan dihantar ke admin melalui Telegram</p>
            <p>• Gunakan untuk melaporkan kejadian mencurigakan</p>
          </div>
        </form>

        {/* Hidden canvas for photo capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  )
}

export default GuardDashboard
