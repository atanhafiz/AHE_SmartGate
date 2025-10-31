import { useState } from "react";
import { exportToCSV } from "../utils/api";
import { supabase } from "../lib/supabaseClient";
import toast from "react-hot-toast";

const EntryTable = ({ entries, loading }) => {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [localEntries, setLocalEntries] = useState(entries || []);


  const today = new Date();
  const todayStr = today.toDateString();

  // ✅ Filter logic
  const filteredEntries = entries.filter((entry) => {
    const entryDate = new Date(entry.timestamp).toDateString();
    const matchesFilter =
      filter === "all" ||
      (filter === "visitor" && entry.user_type === "visitor") ||
      (filter === "resident" &&
        ["resident_unpaid", "resident_paid"].includes(entry.user_type)) ||
      (filter === "vendor" && entry.user_type === "vendor") ||
      (filter === "other" && entry.user_type === "other") ||
      (filter === "forced" && entry.entry_type === "forced_by_guard") ||
      (filter === "today" && entryDate === todayStr);

    const matchesSearch =
      searchTerm === "" ||
      entry.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.house_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.notes?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const handleExport = () => exportToCSV(filteredEntries);
  const formatTimestamp = (timestamp) =>
    new Date(timestamp).toLocaleString("ms-MY");

  // ✅ Badges
  const getEntryTypeBadge = (entry) =>
    entry.entry_type === "forced_by_guard" ? (
      <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
        Forced Entry
      </span>
    ) : (
      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
        Normal
      </span>
    );

  const getUserTypeBadge = (userType) => {
    switch (userType) {
      case "resident_unpaid":
      case "resident_paid":
        return (
          <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
            Resident
          </span>
        );
      case "vendor":
        return (
          <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-full">
            Vendor
          </span>
        );
      case "other":
        return (
          <span className="px-2 py-1 text-xs font-medium bg-cyan-100 text-cyan-800 rounded-full">
            Lain-lain
          </span>
        );
      case "visitor":
      default:
        return (
          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
            Visitor
          </span>
        );
    }
  };

  // ✅ Delete function
  const handleDelete = async (id, selfieUrl) => {
    const confirmDelete = confirm("Padam rekod ini? Gambar selfie juga akan dipadam.");
    if (!confirmDelete) return;
  
    try {
      // 1️⃣ Delete rekod dari Supabase
      const { error } = await supabase.from("entries").delete().eq("id", id);
      if (error) throw error;
  
      // 2️⃣ Delete gambar dari storage
      if (selfieUrl) {
        const fileName = selfieUrl.split("/").pop();
        await supabase.storage.from("selfies").remove([fileName]);
      }
  
      // 3️⃣ Update UI terus (padam row)
      setLocalEntries((prev) => prev.filter((entry) => entry.id !== id));
  
      toast.success("Rekod berjaya dipadam!");
    } catch (err) {
      console.error("Delete failed:", err.message);
      toast.error("Gagal padam rekod!");
    }
  };
      
  // ✅ Loading state
  if (loading)
    return (
      <div className="card">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );

  // ✅ Main table
  return (
    <div className="card">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Entry Records</h3>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field sm:w-64"
          />

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-field sm:w-44"
          >
            <option value="all">All Entries</option>
            <option value="today">Today Only</option>
            <option value="visitor">Visitors</option>
            <option value="resident">Residents</option>
            <option value="vendor">Vendors</option>
            <option value="other">Lain-lain</option>
            <option value="forced">Forced Entries</option>
          </select>

          <button
            onClick={handleExport}
            className="btn-secondary flex items-center space-x-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Person</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entry Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Photo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {filteredEntries.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                  No entries found
                </td>
              </tr>
            ) : (
              localEntries
              .filter((entry) => {
                const entryDate = new Date(entry.timestamp).toDateString();
                const matchesFilter =
                  filter === "all" ||
                  (filter === "visitor" && entry.user_type === "visitor") ||
                  (filter === "resident" &&
                    ["resident_unpaid", "resident_paid"].includes(entry.user_type)) ||
                  (filter === "vendor" && entry.user_type === "vendor") ||
                  (filter === "other" && entry.user_type === "other") ||
                  (filter === "forced" && entry.entry_type === "forced_by_guard") ||
                  (filter === "today" && entryDate === todayStr);
            
                const matchesSearch =
                  searchTerm === "" ||
                  entry.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  entry.house_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  entry.notes?.toLowerCase().includes(searchTerm.toLowerCase());
            
                return matchesFilter && matchesSearch;
              })
              .map((entry) => (
                   <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {entry.name || "Unknown"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {entry.house_number || "N/A"}
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    {getUserTypeBadge(entry.user_type)}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    {getEntryTypeBadge(entry)}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatTimestamp(entry.timestamp)}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    {entry.selfie_url ? (
                      <img
                        src={entry.selfie_url}
                        alt="Entry photo"
                        className="w-12 h-12 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-75"
                        onClick={() =>
                          window.open(entry.selfie_url, "_blank")
                        }
                      />
                    ) : (
                      <span className="text-gray-400 text-sm">No photo</span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-800">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 leading-snug break-words max-w-[300px]">
                      {entry.notes || "-"}
                    </div>
                  </td>

                  {/* ✅ Delete Button */}
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleDelete(entry.id, entry.selfie_url)}
                      className="text-red-500 hover:text-red-700 text-lg font-bold"
                      title="Padam rekod"
                    >
                      ❌
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="mt-4 text-sm text-gray-600">
        Showing {filteredEntries.length} of {entries.length} entries
      </div>
    </div>
  );
};

export default EntryTable;
