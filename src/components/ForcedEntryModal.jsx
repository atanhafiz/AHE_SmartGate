import { useState } from "react";
import { useEntries } from "../hooks/useEntries";
import { uploadImage } from "../utils/api";
import toast from "react-hot-toast";

const ForcedEntryModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    house_number: "",
    notes: "",
  });
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const { addUser, addEntry } = useEntries();

  // ✅ Telegram Notifier – public call (no env key)
  const notifyTelegram = async (payload) => {
    try {
      const res = await fetch(
        "https://kpukhpavdxidnoexfljv.supabase.co/functions/v1/notify-telegram",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const errText = await res.text();
        throw new Error("Telegram send failed: " + errText);
      }
    } catch (err) {
      console.error("❌ Telegram Error:", err);
      toast.error("Telegram error: " + err.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Upload photo
      let photoUrl = null;
      if (photo) {
        const { url, error } = await uploadImage(photo, "forced-entries");
        if (error) throw new Error(`Failed to upload photo: ${error}`);
        photoUrl = url;
      }

      // Create user first
      const { data: userData, error: userError } = await addUser({
        name: formData.name,
        user_type: "visitor",
        house_number: formData.house_number || null,
      });
      if (userError) throw new Error(`Failed to create user: ${userError}`);

      // Create forced entry
      const { error: entryError } = await addEntry({
        user_id: userData[0].id,
        entry_type: "forced_by_guard",
        selfie_url: photoUrl,
        notes: formData.notes || null,
      });
      if (entryError) throw new Error(`Failed to create entry: ${entryError}`);

      // ✅ Notify Telegram
      await notifyTelegram({
        name: formData.name,
        house_number: formData.house_number,
        notes: formData.notes,
        entry_type: "forced_by_guard",
        selfie_url: photoUrl,
        timestamp: new Date().toISOString(),
      });

      toast.success("Forced entry recorded successfully!");
      setFormData({ name: "", house_number: "", notes: "" });
      setPhoto(null);
      setPreview(null);
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: "", house_number: "", notes: "" });
    setPhoto(null);
    setPreview(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="card max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Forced Entry Report
          </h3>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Person's Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="input-field"
              placeholder="Enter person's name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              House Number
            </label>
            <input
              type="text"
              name="house_number"
              value={formData.house_number}
              onChange={handleInputChange}
              className="input-field"
              placeholder="Enter house number if known"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photo Evidence *
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              required
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
            />
            {preview && (
              <div className="mt-2">
                <img
                  src={preview}
                  alt="Photo preview"
                  className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Incident Details *
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              required
              rows={3}
              className="input-field"
              placeholder="Describe the incident and reason for forced entry..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Recording..." : "Record Forced Entry"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForcedEntryModal;
