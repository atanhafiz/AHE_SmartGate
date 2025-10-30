import { useState, useRef, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import toast from "react-hot-toast";

const EntryForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    house_number: "",
    phone_number: "",
    plate_number: "",
    is_owner_unpaid: false,
    is_vendor: false,
    is_other: false,
    other_reason: "",
  });
  const [selfie, setSelfie] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [captured, setCaptured] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = async () => {
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "user" }, width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        try {
          await videoRef.current.play();
        } catch {
          console.log("Auto-play prevented, user interaction required");
        }
        setCaptured(false);
      }
    } catch (error) {
      console.error("Camera error:", error);
      setCameraActive(false);
      alert("❌ Kamera tidak dapat diakses. Pastikan anda benarkan akses kamera.");
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            setSelfie(blob);
            setPreview(URL.createObjectURL(blob));
            setCaptured(true);
            stopCamera();
          }
        },
        "image/jpeg",
        0.8
      );
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const retakePhoto = () => {
    setSelfie(null);
    setPreview(null);
    setCaptured(false);
    startCamera();
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const uploadImage = async (file) => {
    const fileName = `${Date.now()}_${formData?.name || "anonymous"}.jpg`;
    const { data, error } = await supabase.storage
      .from("selfies")
      .upload(fileName, file, { cacheControl: "3600", upsert: false });
    if (error) throw error;
    const {
      data: { publicUrl },
    } = supabase.storage.from("selfies").getPublicUrl(fileName);
    return publicUrl;
  };

  const notifyTelegram = async (payload) => {
    const url =
      "https://kpukhpavdxidnoexfljv.supabase.co/functions/v1/notify-telegram";
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_KEY}`,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Telegram send failed");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!formData.name.trim() || !formData.house_number.trim()) {
        toast.error("Sila isi semua maklumat wajib");
        return;
      }
      if (formData.is_other && !formData.other_reason.trim()) {
        toast.error("Sila nyatakan urusan untuk pilihan Lain-lain");
        return;
      }
      if (!selfie) {
        toast.error("Sila ambil gambar selfie");
        return;
      }

      const userType = formData.is_owner_unpaid
        ? "resident_unpaid"
        : "visitor";

      const selfieUrl = await uploadImage(selfie);

      const notesArr = [
        `Visitor Check-In: ${formData.name} (${formData.house_number})`,
        `Tel: ${formData.phone_number}`,
        `Plat: ${formData.plate_number}`,
      ];
      if (formData.is_vendor) notesArr.push("Jenis: Vendor (Grab/Foodpanda/J&T/dll)");
      if (formData.is_other)
        notesArr.push(`Jenis: Lain-lain (${formData.other_reason})`);

      const insertPayload = {
        entry_type: "normal",
        selfie_url: selfieUrl,
        notes: notesArr.join(" | "),
        timestamp: new Date().toISOString(),
        phone_number: formData.phone_number,
        plate_number: formData.plate_number,
        user_type: userType,
      };
      await supabase.from("entries").insert(insertPayload);

      const telegramPayload = {
        ...formData,
        selfie_url: selfieUrl,
        entry_type:
          userType === "resident_unpaid" ? "resident_unpaid" : "normal",
        timestamp: new Date().toISOString(),
      };
      await notifyTelegram(telegramPayload);

      const timestampMY = new Date().toLocaleString("ms-MY", {
        timeZone: "Asia/Kuala_Lumpur",
        weekday: "long",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      setSubmittedData({
        ...formData,
        selfie_url: selfieUrl,
        timestamp: timestampMY,
      });

      setFormData({
        name: "",
        house_number: "",
        phone_number: "",
        plate_number: "",
        is_owner_unpaid: false,
        is_vendor: false,
        is_other: false,
        other_reason: "",
      });
      setSelfie(null);
      setPreview(null);
      setCaptured(false);
      stopCamera();
      toast.success("✅ Maklumat berjaya dihantar!");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Gagal menghantar data.");
    } finally {
      setLoading(false);
    }
  };

  if (submittedData) {
    return (
      <div className="bg-green-50 min-h-screen flex items-center justify-center p-6">
        <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md text-center">
          <img src="/favicon.ico" alt="AHE SmartGate" className="w-12 h-12 mx-auto mb-2 opacity-90" />
          <div className="text-green-600 text-7xl mb-3">✅</div>
          <h2 className="text-2xl font-extrabold text-gray-800 mb-3 uppercase">
            PENDAFTARAN BERJAYA
          </h2>
          <img src={submittedData.selfie_url} alt="Selfie" className="w-40 h-40 object-cover rounded-lg mx-auto mb-4 border-2 border-green-500 shadow" />
          <div className="text-left text-sm space-y-1">
            <p><strong>👤 Nama:</strong> {submittedData.name}</p>
            <p><strong>🏠 Rumah:</strong> {submittedData.house_number}</p>
            <p><strong>📞 Telefon:</strong> {submittedData.phone_number}</p>
            <p><strong>🚗 Plat:</strong> {submittedData.plate_number}</p>
            <p><strong>🕒 Masa:</strong> {submittedData.timestamp}</p>
          </div>
          <div className="mt-6 text-xs text-gray-500">
            Tunjukkan skrin ini kepada pengawal keselamatan sebagai bukti pendaftaran.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-sky-100 min-h-screen flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md mx-auto">
        <h1 className="text-2xl font-extrabold text-center mb-6 bg-gradient-to-r from-sky-600 to-blue-500 bg-clip-text text-transparent drop-shadow-sm tracking-wide uppercase">
          Visitor Check-In
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nama *</label>
            <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" placeholder="Masukkan nama anda" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nombor Rumah *</label>
            <input type="text" name="house_number" value={formData.house_number} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" placeholder="Contoh: 1143" required />
          </div>

          {/* ✅ Checkbox Pemilik Rumah */}
          <div className="mt-2 space-y-2">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" name="is_owner_unpaid" checked={formData.is_owner_unpaid} onChange={handleInputChange} className="w-4 h-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded" />
              <span>Pemilik rumah <span className="text-gray-500">(tandakan untuk kemudahan pengesahan akses)</span></span>
            </label>

            {/* ✅ Checkbox Vendor */}
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" name="is_vendor" checked={formData.is_vendor} onChange={handleInputChange} className="w-4 h-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded" />
              <span>Vendor (Grab / Foodpanda / J&T / dan lain-lain)</span>
            </label>

            {/* ✅ Checkbox Lain-lain */}
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" name="is_other" checked={formData.is_other} onChange={handleInputChange} className="w-4 h-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded" />
              <span>Lain-lain (nyatakan urusan)</span>
            </label>

            {formData.is_other && (
              <input
                type="text"
                name="other_reason"
                value={formData.other_reason}
                onChange={handleInputChange}
                placeholder="Contoh: Urusan penghantaran dokumen"
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                required
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nombor Telefon *</label>
            <input type="tel" name="phone_number" value={formData.phone_number} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" placeholder="Contoh: 012-3456789" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nombor Plat Kenderaan *</label>
            <input type="text" name="plate_number" value={formData.plate_number} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" placeholder="Contoh: VAD 1234" required />
          </div>

          {/* Kamera & Submit kekal sama */}
          {/* ... (semua kod kamera & submit kekal macam versi hang) ... */}

          <div className="text-xs text-gray-500 text-center mt-4">
            <p>• Pastikan wajah jelas dalam gambar</p>
            <p>• Data dihantar ke admin melalui Telegram</p>
          </div>
        </form>
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default EntryForm;
