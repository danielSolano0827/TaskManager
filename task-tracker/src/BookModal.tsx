import { useState, FormEvent } from "react";

interface Book {
  id: number;
  title: string;
  author: string | null;
  genre: string | null;
  year: number | null;
  total_pages: number | null;
  pages_read: number;
  status: "reading" | "completed" | "paused" | "wishlist";
  rating: number | null;
  notes: string | null;
  cover_image: string | null;
}

interface BookModalProps {
  book?: Book | null;
  onClose: () => void;
  onSave: (data: {
    title: string;
    author: string;
    genre: string;
    year: number | null;
    totalPages: number | null;
    pagesRead: number;
    status: string;
    rating: number | null;
    notes: string;
    coverImage: string | null;
  }) => void;
}

const STATUSES = [
  { value: "reading", label: "📖 Leyendo" },
  { value: "completed", label: "✅ Completado" },
  { value: "paused", label: "⏸️ Pausado" },
  { value: "wishlist", label: "🔖 Por leer" },
];

function BookModal({ book, onClose, onSave }: BookModalProps) {
  const [title, setTitle] = useState(book?.title ?? "");
  const [author, setAuthor] = useState(book?.author ?? "");
  const [genre, setGenre] = useState(book?.genre ?? "");
  const [year, setYear] = useState<string>(book?.year?.toString() ?? "");
  const [totalPages, setTotalPages] = useState<string>(book?.total_pages?.toString() ?? "");
  const [pagesRead, setPagesRead] = useState<string>(book?.pages_read?.toString() ?? "0");
  const [status, setStatus] = useState<string>(book?.status ?? "reading");
  const [rating, setRating] = useState<number>(book?.rating ?? 0);
  const [notes, setNotes] = useState(book?.notes ?? "");
  const [coverImage, setCoverImage] = useState<string | null>(book?.cover_image ?? null);

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("La imagen es muy grande, usa una menor a 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setCoverImage(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      author: author.trim(),
      genre: genre.trim(),
      year: year ? Number(year) : null,
      totalPages: totalPages ? Number(totalPages) : null,
      pagesRead: Number(pagesRead) || 0,
      status,
      rating: rating > 0 ? rating : null,
      notes: notes.trim(),
      coverImage,
    });
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}
      onClick={onClose}
    >
      <div
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 14, width: 420, maxHeight: "88vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 20px", borderBottom: "1px solid var(--border)" }}>
          <h3 style={{ margin: 0 }}>{book ? "Editar libro" : "Nuevo libro"}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer" }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", gap: 14 }}>
            <label
              style={{
                width: 90,
                height: 130,
                flexShrink: 0,
                borderRadius: 8,
                border: "1px dashed var(--border)",
                background: coverImage ? `url(${coverImage}) center/cover` : "var(--bg-sunken)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: 11,
                opacity: coverImage ? 1 : 0.6,
                textAlign: "center",
                padding: 6,
                boxSizing: "border-box",
              }}
            >
              {!coverImage && "Click para subir portada"}
              <input type="file" accept="image/*" onChange={handleCoverChange} style={{ display: "none" }} />
            </label>

            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título" autoFocus style={{ padding: 8 }} />
              <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Autor" style={{ padding: 8 }} />
              <input value={genre} onChange={(e) => setGenre(e.target.value)} placeholder="Género" style={{ padding: 8 }} />
            </div>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="Año"
              style={{ padding: 8, flex: 1 }}
            />
            <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ padding: 8, flex: 1 }}>
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, opacity: 0.6 }}>Páginas leídas</label>
              <input
                type="number"
                min={0}
                value={pagesRead}
                onChange={(e) => setPagesRead(e.target.value)}
                style={{ padding: 8, width: "100%", boxSizing: "border-box" }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, opacity: 0.6 }}>Páginas totales</label>
              <input
                type="number"
                min={0}
                value={totalPages}
                onChange={(e) => setTotalPages(e.target.value)}
                style={{ padding: 8, width: "100%", boxSizing: "border-box" }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, opacity: 0.6 }}>Calificación</label>
            <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(rating === n ? 0 : n)}
                  style={{ background: "none", border: "none", fontSize: 20, padding: 0, cursor: "pointer" }}
                >
                  {n <= rating ? "⭐" : "☆"}
                </button>
              ))}
            </div>
          </div>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notas (opcional)"
            rows={3}
            style={{ padding: 8, fontFamily: "inherit", resize: "vertical" }}
          />

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
            <button type="button" onClick={onClose}>Cancelar</button>
            <button
              type="submit"
              style={{ background: "var(--accent)", border: "none", color: "white", fontWeight: 600, borderRadius: 8, padding: "8px 16px" }}
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BookModal;