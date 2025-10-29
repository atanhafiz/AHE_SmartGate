import { useState, useRef, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import toast from 'react-hot-toast'

const EntryForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    house_number: '',
    phone_number: '',
    plate_number: ''
  })
    const [selfie, setSelfie] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const [captured, setCaptured] = useState(false)
  
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  // Start camera with front-facing mode for selfies
  const startCamera = async () => {
    try {
      setCameraActive(true)
      
      // Use front camera (user facing) for selfies
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: { ideal: "user" }, // ✅ FRONT CAMERA (SELFIE)
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        
        // Ensure video plays
        try {
          await videoRef.current.play()
        } catch (playError) {
          console.log('Auto-play prevented, user interaction required')
        }
        
        setCaptured(false)
      }
    } catch (error) {
      console.error('Camera error:', error)
      setCameraActive(false)
      
      let errorMessage = '❌ Kamera tidak dapat diakses. Sila pastikan anda benarkan akses kamera dalam pelayar.'
      
      if (error.name === 'NotAllowedError') {
        errorMessage = '❌ Akses kamera ditolak. Sila benarkan akses kamera dan cuba lagi.'
      } else if (error.name === 'NotFoundError') {
        errorMessage = '❌ Tiada kamera ditemui. Sila pastikan peranti mempunyai kamera.'
      } else if (error.name === 'NotSupportedError') {
        errorMessage = '❌ Pelayar tidak menyokong kamera. Cuba gunakan pelayar lain.'
      }
      
      alert(errorMessage)
    }
  }

  // Capture photo
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      const context = canvas.getContext('2d')
      
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      context.drawImage(video, 0, 0)
      
      canvas.toBlob((blob) => {
        if (blob) {
          setSelfie(blob)
          setPreview(URL.createObjectURL(blob))
          setCaptured(true)
          stopCamera()
        }
      }, 'image/jpeg', 0.8)
    }
  }

  // Retake photo
  const retakePhoto = () => {
    setSelfie(null)
    setPreview(null)
    setCaptured(false)
    startCamera()
  }

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setCameraActive(false)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks()
        tracks.forEach((track) => track.stop())
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
    }
  }, [])

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Upload image to Supabase Storage with retry logic
  const uploadImage = async (file) => {
    const fileName = `${Date.now()}_${formData?.name || 'anonymous'}.jpg`
    const maxRetries = 3
    let attempt = 0

    while (attempt < maxRetries) {
      try {
        attempt++
        console.log(`📤 [Attempt ${attempt}] Uploading image: ${fileName}`)

        const { data, error } = await supabase.storage
          .from("selfies")
          .upload(fileName, file, {
            cacheControl: "3600",
            upsert: false,
          })

        if (error) throw error

        const { data: { publicUrl } } = supabase.storage
          .from("selfies")
          .getPublicUrl(fileName)

        console.log("✅ Image uploaded successfully:", publicUrl)
        return publicUrl
      } catch (err) {
        console.error(`❌ Upload attempt ${attempt} failed:`, err.message)
        if (attempt < maxRetries) {
          toast.error(`🚫 Upload gagal (percubaan ${attempt}). Cuba lagi...`)
          await new Promise((resolve) => setTimeout(resolve, 2000)) // Retry delay
        } else {
          toast.error("❌ Gagal memuat naik gambar selepas beberapa percubaan.")
          throw new Error("Gagal memuat naik gambar")
        }
      }
    }
  }

  // Call Edge Function
  const notifyTelegram = async (payload) => {
    try {
      // Use correct Edge Function URL with /functions/v1
      const functionUrl = 'https://kpukhpavdxidnoexfljv.supabase.co/functions/v1/notify-telegram'
      console.log('📤 Sending Telegram payload to:', functionUrl)
      console.log('📦 Payload:', payload)
      
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
        console.error('❌ Response headers:', response.headers)
        try {
          const errorData = JSON.parse(errorText)
          throw new Error(errorData.error || 'Gagal menghantar notifikasi')
        } catch (parseError) {
          throw new Error(`HTTP ${response.status}: ${errorText}`)
        }
      }

      const result = await response.json()
      console.log('✅ Telegram notification sent successfully:', result)
      return result
    } catch (error) {
      console.error('❌ Telegram notification error:', error)
      throw new Error('Gagal menghantar notifikasi ke admin')
    }
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate form
      if (!formData.name.trim()) {
        toast.error('Sila masukkan nama')
        return
      }
      if (!formData.house_number.trim()) {
        toast.error('Sila masukkan nombor rumah')
        return
      }
      if (!selfie) {
        toast.error('Sila ambil gambar selfie')
        return
      }

      console.log('🚀 Starting EntryForm submission...')

      // Step 1: Upload selfie to Supabase Storage
      console.log('📤 Starting image upload...')
      const selfieUrl = await uploadImage(selfie)
      if (!selfieUrl) {
        throw new Error("Gagal muat naik gambar")
      }
      console.log('✅ Image uploaded:', selfieUrl)

      // Step 2: Save to Supabase database
      console.log('💾 Saving to database...')
      
      // Prepare insert payload matching exact schema
      const insertPayload = {
        entry_type: 'normal',
        selfie_url: selfieUrl,
        notes: `Visitor Check-In: ${formData.name} (${formData.house_number}) | Tel: ${formData.phone_number} | Plat: ${formData.plate_number}`,
        timestamp: new Date().toISOString(),
        phone_number: formData.phone_number,
        plate_number: formData.plate_number,
      }
            
      console.log('📦 Insert payload:', insertPayload)
      
      const { data: entryData, error: dbError } = await supabase
        .from('entries')
        .insert(insertPayload)
        .select()
        .single()

      if (dbError) {
        console.error("❌ Supabase Insert Error Details:", dbError.message, dbError.details)
        console.error("❌ Full error object:", dbError)
        toast.error("Gagal menyimpan data pengguna. Lihat console untuk maklumat lanjut.")
        throw dbError
      } else {
        console.log("✅ Data inserted successfully to Supabase entries.")
        console.log('✅ Database saved:', entryData)
      }

      // Step 3: Notify Telegram
      console.log('📱 Sending Telegram notification...')
      const telegramPayload = {
        name: formData.name,
        house_number: formData.house_number,
        phone_number: formData.phone_number,
        plate_number: formData.plate_number,
        entry_type: 'normal',
        timestamp: new Date().toISOString(),
        selfie_url: selfieUrl,
      }
            const res = await fetch('https://kpukhpavdxidnoexfljv.supabase.co/functions/v1/notify-telegram', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_KEY}`
        },
        body: JSON.stringify(telegramPayload),
      })

      console.log('📊 Telegram response status:', res.status)
      
      if (!res.ok) {
        const errorText = await res.text()
        console.error('❌ Telegram error:', errorText)
        throw new Error(`Telegram error: ${errorText}`)
      }

      const telegramResult = await res.json()
      console.log('📨 Telegram notification sent (200 OK):', telegramResult)

      // Show success message
      toast.success('✅ Data berjaya dihantar ke admin')

      // Reset form
      setFormData({ name: '', house_number: '' })
      setSelfie(null)
      setPreview(null)
      setCaptured(false)

    } catch (error) {
      console.error('❌ Submission error:', error)
      toast.error(error.message || 'Gagal menyimpan data pengguna')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-sky-100 min-h-screen flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md mx-auto">
      <h1 className="text-2xl font-extrabold text-center mb-6 bg-gradient-to-r from-sky-600 to-blue-500 bg-clip-text text-transparent drop-shadow-sm tracking-wide uppercase">
        Visitor Check-In
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              placeholder="Masukkan nama anda"
            />
          </div>

          {/* House Number Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombor Rumah *
            </label>
            <input
              type="text"
              name="house_number"
              value={formData.house_number}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              placeholder="Contoh: 1143"
            />
          </div>

                      {/* Phone Number Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombor Telefon *
              </label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                placeholder="Contoh: 012-3456789"
              />
            </div>

            {/* Plate Number Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombor Plat Kenderaan *
              </label>
              <input
                type="text"
                name="plate_number"
                value={formData.plate_number}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                placeholder="Contoh: VAD 1234"
              />
            </div>


          {/* Camera Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ambil Selfie *
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
                      className="w-full h-64 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full w-12 h-12 flex items-center justify-center"
                      >
                        📸
                      </button>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-full w-12 h-12 flex items-center justify-center"
                      >
                        ❌
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={startCamera}
                      className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg py-3 px-4 flex items-center justify-center space-x-2"
                    >
                      <span>📷</span>
                      <span>Buka Kamera</span>
                    </button>
                    <p className="text-xs text-gray-500 text-center">
                      Pastikan anda benarkan akses kamera apabila diminta
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Captured Photo Preview */}
                <div className="relative">
                  <img
                    src={preview}
                    alt="Captured selfie"
                    className="w-full h-64 object-cover rounded-lg border-2 border-gray-200"
                  />
                  <div className="absolute top-2 right-2">
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      ✓ Diambil
                    </span>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={retakePhoto}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg py-2 px-4 flex items-center justify-center space-x-2"
                >
                  <span>🔄</span>
                  <span>Ambil Semula</span>
                </button>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !captured}
            className="w-full bg-sky-600 hover:bg-sky-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg py-3 px-4 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Menghantar...</span>
              </>
            ) : (
              <>
                <span>📤</span>
                <span>Hantar Rekod</span>
              </>
            )}
          </button>

          {/* Instructions */}
          <div className="text-xs text-gray-500 text-center">
            <p>• Pastikan wajah jelas dalam gambar</p>
            <p>• Data akan dihantar ke admin melalui Telegram</p>
          </div>
        </form>

        {/* Hidden canvas for photo capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  )
}

export default EntryForm