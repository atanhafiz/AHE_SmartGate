import { useState } from 'react'

const SelfieUpload = ({ onImageSelect, required = false }) => {
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (file) {
      setLoading(true)
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        setLoading(false)
        return
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        setLoading(false)
        return
      }

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target.result)
        setLoading(false)
      }
      reader.readAsDataURL(file)

      // Call parent callback
      onImageSelect(file)
    }
  }

  const capturePhoto = () => {
    // This would open camera for photo capture
    // For now, we'll just trigger the file input
    document.getElementById('camera-input').click()
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center space-y-4">
        {/* Camera Button */}
        <button
          type="button"
          onClick={capturePhoto}
          className="btn-primary flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Take Photo</span>
        </button>

        {/* Hidden File Input */}
        <input
          id="camera-input"
          type="file"
          accept="image/*"
          capture="user"
          onChange={handleFileChange}
          required={required}
          className="hidden"
        />

        {/* Alternative File Upload */}
        <div className="text-center">
          <label className="block text-sm text-gray-600 mb-2">Or select from device:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            required={required}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
          />
        </div>
      </div>

      {/* Preview */}
      {loading && (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      )}

      {preview && (
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-2">Preview:</p>
          <img
            src={preview}
            alt="Selfie preview"
            className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200 mx-auto"
          />
        </div>
      )}
    </div>
  )
}

export default SelfieUpload
