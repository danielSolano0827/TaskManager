import { useState } from "react";
import SemesterModal from "./SemesterModal";

interface Semester {
  id: number;
  name: string;
}

interface SemesterSelectorProps {
  semesters: Semester[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onCreate: (name: string) => void;
}

function SemesterSelector({ semesters, selectedId, onSelect, onCreate }: SemesterSelectorProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 20 }}>
      <select
        value={selectedId ?? ""}
        onChange={(e) => onSelect(Number(e.target.value))}
        style={{ padding: 10, flex: 1 }}
      >
        {semesters.length === 0 && <option value="">Sin semestres</option>}
        {semesters.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>
      <button onClick={() => setShowModal(true)}>+ Semestre</button>

      {showModal && (
        <SemesterModal
          onClose={() => setShowModal(false)}
          onSave={(name) => {
            onCreate(name);
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}

export default SemesterSelector;