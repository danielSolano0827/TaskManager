import { useState } from "react";
import BookModal from "./BookModal";
import ConfirmModal from "./ConfirmModal";

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

interface BooksViewProps {
  books: Book[];
  onAdd: (data: any) => void;
  onUpdate: (id: number, data: any) => void;
  onDelete: (id: number) => void;
}

const STATUS_LABELS: Record<string, string> = {
  reading: "📖 Leyendo",
  completed: "✅ Completado",
  paused: "⏸️ Pausado",
  wishlist: "🔖 Por leer",
};

function BooksView({ books, onAdd, onUpdate, onDelete }: BooksViewProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const filtered = filter === "all" ? books : books.filter((b) => b.status === filter);

  function openNew() {
    setEditingBook(null);
    setShowModal(true);
  }
  function openEdit(book: Book) {
    setEditingBook(book);
    setShowModal(true);
  }

  function handleSave(data: any) {
    if (editingBook) {
      onUpdate(editingBook.id, data);
    } else {
      onAdd(data);
    }
    setShowModal(false);
    setEditingBook(null);
  }

  return (
    <div style={{ maxWidth: 1500, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <h2 style={{ margin: 0 }}>♥️ Mi biblioteca</h2>
        <button onClick={openNew} style={{ background: "var(--accent)", border: "none", color: "white", fontWeight: 600 }}>
          + Agregar libro
        </button>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {["all", "reading", "completed", "paused", "wishlist"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "6px 14px",
              fontSize: 13,
              background: filter === f ? "var(--accent)" : "var(--bg-surface)",
              color: filter === f ? "white" : "var(--text)",
              border: "1px solid var(--border)",
            }}
          >
            {f === "all" ? "Todos" : STATUS_LABELS[f]}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <p style={{ opacity: 0.6, textAlign: "center", marginTop: 40 }}>
          No hay libros en esta categoría todavía.
        </p>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
        {filtered.map((book) => {
          const progress = book.total_pages ? Math.min(100, (book.pages_read / book.total_pages) * 100) : 0;
          return (
            <div
              key={book.id}
              onClick={() => openEdit(book)}
              style={{
                width: 250,
                cursor: "pointer",
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                overflow: "hidden",
                position: "relative",
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDeletingId(book.id);
                }}
                style={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  zIndex: 1,
                  width: 24,
                  height: 24,
                  padding: 0,
                  borderRadius: "50%",
                  background: "rgba(0,0,0,0.5)",
                  border: "none",
                  color: "white",
                  fontSize: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✕
              </button>

              <div
                style={{
                  height: 370,
                  background: book.cover_image
                    ? `url(${book.cover_image}) center/cover`
                    : "var(--bg-sunken)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 30,
                }}
              >
                {!book.cover_image && "📖"}
              </div>
              <div style={{ padding: 10 }}>
                <div style={{ fontWeight: 600, fontSize: 13, lineHeight: 1.3, marginBottom: 2 }}>{book.title}</div>
                <div style={{ fontSize: 11, opacity: 0.6, marginBottom: 6 }}>{book.author || "Autor desconocido"}</div>

                {book.total_pages ? (
                  <>
                    <div style={{ background: "var(--bg-sunken)", borderRadius: 4, height: 5, overflow: "hidden" }}>
                      <div style={{ width: `${progress}%`, height: "100%", background: "var(--accent)" }} />
                    </div>
                    <div style={{ fontSize: 10, opacity: 0.5, marginTop: 3 }}>
                      {book.pages_read}/{book.total_pages} pág.
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize: 10, opacity: 0.5 }}>{STATUS_LABELS[book.status]}</div>
                )}

                {book.rating && (
                  <div style={{ fontSize: 11, marginTop: 4 }}>{"⭐".repeat(book.rating)}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <BookModal
          book={editingBook}
          onClose={() => { setShowModal(false); setEditingBook(null); }}
          onSave={handleSave}
        />
      )}

      {deletingId !== null && (
        <ConfirmModal
          title="Eliminar libro"
          message="¿Seguro que quieres eliminar este libro de tu biblioteca?"
          confirmLabel="Eliminar"
          danger
          onConfirm={() => { onDelete(deletingId); setDeletingId(null); }}
          onCancel={() => setDeletingId(null)}
        />
      )}
    </div>
  );
}

export default BooksView;