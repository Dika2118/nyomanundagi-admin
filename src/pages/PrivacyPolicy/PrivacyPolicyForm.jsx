import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../services/api";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

export default function PrivacyPolicyForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    content: "",
    order: "",
    is_active: true,
    last_updated_label: "",
  });

  useEffect(() => {
    if (isEdit) {
      setFetching(true);
      api
        .get(`/privacy-policy-sections/${id}`)
        .then((res) => {
          const s = res.data.data;
          setForm({
            title: s.title || "",
            slug: s.slug || "",
            content: s.content || "",
            order: s.order ?? "",
            is_active: s.is_active ?? true,
            last_updated_label: s.last_updated_label
              ? s.last_updated_label.substring(0, 10)
              : "",
          });
        })
        .catch(() => toast.error("Gagal memuat data."))
        .finally(() => setFetching(false));
    }
    // eslint-disable-next-line
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        title: form.title,
        slug: form.slug || undefined,
        content: form.content,
        order: form.order !== "" ? parseInt(form.order) : undefined,
        is_active: form.is_active,
        last_updated_label: form.last_updated_label || undefined,
      };

      if (isEdit) {
        await api.put(`/privacy-policy-sections/${id}`, payload);
        toast.success("Bagian kebijakan privasi berhasil diperbarui.");
      } else {
        await api.post("/privacy-policy-sections", payload);
        toast.success("Bagian kebijakan privasi berhasil ditambahkan.");
      }
      navigate("/privacy-policy");
    } catch (err) {
      const msg =
        err.response?.data?.message || "Terjadi kesalahan. Silakan coba lagi.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <span className="text-gray-400">Memuat data...</span>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {isEdit
          ? "Edit Bagian Kebijakan Privasi"
          : "Tambah Bagian Kebijakan Privasi"}
      </h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow p-6 space-y-5"
      >
        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Judul <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
            required
            placeholder="Contoh: Pendahuluan"
          />
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Slug{" "}
            <span className="text-gray-400 font-normal">
              (otomatis jika kosong)
            </span>
          </label>
          <input
            type="text"
            name="slug"
            value={form.slug}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
            placeholder="contoh: pendahuluan"
          />
        </div>

        {/* Content (Rich Editor) */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Konten <span className="text-red-500">*</span>
          </label>
          <ReactQuill
            theme="snow"
            value={form.content}
            onChange={(val) => setForm((f) => ({ ...f, content: val }))}
            className="bg-white"
            style={{ minHeight: 250 }}
            modules={{
              toolbar: [
                [{ header: [1, 2, 3, false] }],
                ["bold", "italic", "underline", "strike"],
                [{ list: "ordered" }, { list: "bullet" }],
                ["link"],
                ["blockquote"],
                ["clean"],
              ],
            }}
          />
        </div>

        {/* Order */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Urutan
          </label>
          <input
            type="number"
            name="order"
            value={form.order}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
            min="0"
            placeholder="Otomatis jika kosong"
          />
        </div>

        {/* Last Updated Label */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Tanggal Label "Terakhir Diperbarui"
          </label>
          <input
            type="date"
            name="last_updated_label"
            value={form.last_updated_label}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
          />
          <p className="text-xs text-gray-400 mt-1">
            Tanggal yang ditampilkan di halaman publik sebagai "Terakhir
            diperbarui"
          </p>
        </div>

        {/* Active Status */}
        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="is_active"
              checked={form.is_active}
              onChange={handleChange}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
          <span className="text-sm font-semibold text-gray-700">
            {form.is_active ? "Aktif (tampil di halaman publik)" : "Nonaktif (tersembunyi)"}
          </span>
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold text-sm transition disabled:opacity-60"
          >
            {loading
              ? "Menyimpan..."
              : isEdit
              ? "Simpan Perubahan"
              : "Tambah Bagian"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/privacy-policy")}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-semibold text-sm transition"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}

