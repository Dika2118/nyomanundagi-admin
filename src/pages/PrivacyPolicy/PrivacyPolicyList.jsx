import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaArrowUp,
  FaArrowDown,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import api from "../../services/api";

export default function PrivacyPolicyList() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchSections = async () => {
    setLoading(true);
    try {
      const params = { all: true };
      if (search) params.search = search;
      const res = await api.get("/privacy-policy-sections", { params });
      const data = Array.isArray(res.data?.data)
        ? res.data.data
        : res.data?.data?.data || [];
      setSections(data);
    } catch {
      toast.error("Gagal memuat data kebijakan privasi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
    // eslint-disable-next-line
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchSections();
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Yakin ingin menghapus?",
      text: "Bagian kebijakan privasi yang dihapus tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e53e3e",
      cancelButtonColor: "#a0aec0",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });
    if (result.isConfirmed) {
      try {
        await api.delete(`/privacy-policy-sections/${id}`);
        toast.success("Bagian kebijakan privasi berhasil dihapus.");
        fetchSections();
      } catch {
        toast.error("Gagal menghapus bagian kebijakan privasi.");
      }
    }
  };

  const handleReorder = async (index, direction) => {
    const newSections = [...sections];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newSections.length) return;

    // Swap order values
    const tempOrder = newSections[index].order;
    newSections[index].order = newSections[swapIndex].order;
    newSections[swapIndex].order = tempOrder;

    // Swap positions in array
    [newSections[index], newSections[swapIndex]] = [
      newSections[swapIndex],
      newSections[index],
    ];

    setSections(newSections);

    try {
      await api.put("/privacy-policy-sections-reorder", {
        sections: newSections.map((s) => ({ id: s.id, order: s.order })),
      });
      toast.success("Urutan berhasil diperbarui.");
    } catch {
      toast.error("Gagal memperbarui urutan.");
      fetchSections();
    }
  };

  const handleToggleActive = async (section) => {
    try {
      await api.put(`/privacy-policy-sections/${section.id}`, {
        is_active: !section.is_active,
      });
      toast.success(
        section.is_active
          ? "Bagian berhasil dinonaktifkan."
          : "Bagian berhasil diaktifkan."
      );
      fetchSections();
    } catch {
      toast.error("Gagal mengubah status.");
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Kebijakan Privasi</h1>
        <Link
          to="/privacy-policy/create"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
        >
          <FaPlus /> Tambah Bagian
        </Link>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          type="text"
          className="border border-gray-300 rounded-lg px-4 py-2 w-full max-w-xs focus:ring-2 focus:ring-blue-400 outline-none"
          placeholder="Cari bagian..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
        >
          <FaSearch /> Cari
        </button>
      </form>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-600 uppercase text-xs">
              <th className="px-4 py-3 text-left">Urutan</th>
              <th className="px-4 py-3 text-left">Judul</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Terakhir Diperbarui</th>
              <th className="px-4 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-400">
                  Memuat...
                </td>
              </tr>
            ) : sections.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-400">
                  Tidak ada data.
                </td>
              </tr>
            ) : (
              sections.map((section, i) => (
                <tr key={section.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-gray-700 mr-2">
                        {section.order}
                      </span>
                      <button
                        onClick={() => handleReorder(i, "up")}
                        disabled={i === 0}
                        className="text-gray-400 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed p-1"
                        title="Pindah ke atas"
                      >
                        <FaArrowUp size={12} />
                      </button>
                      <button
                        onClick={() => handleReorder(i, "down")}
                        disabled={i === sections.length - 1}
                        className="text-gray-400 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed p-1"
                        title="Pindah ke bawah"
                      >
                        <FaArrowDown size={12} />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {section.title}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleActive(section)}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold cursor-pointer transition ${
                        section.is_active
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {section.is_active ? (
                        <>
                          <FaEye size={10} /> Aktif
                        </>
                      ) : (
                        <>
                          <FaEyeSlash size={10} /> Nonaktif
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {section.updated_at
                      ? new Date(section.updated_at).toLocaleDateString(
                          "id-ID",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <Link
                        to={`/privacy-policy/edit/${section.id}`}
                        className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1.5 rounded text-xs inline-flex items-center gap-1"
                      >
                        <FaEdit /> Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(section.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded text-xs inline-flex items-center gap-1"
                      >
                        <FaTrash /> Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

