export type Nurse = {
  id: number;
  name: string;
  department: string;
};

let nurses: Nurse[] = [
  { id: 1, name: "Siti Aminah", department: "ICU" },
  { id: 2, name: "Budi Santoso", department: "Pediatrics" },
];

export async function getNurses() {
  await new Promise((r) => setTimeout(r, 300));
  return nurses;
}

export async function addNurse(nurse: Omit<Nurse, "id">) {
  await new Promise((r) => setTimeout(r, 300));
  const newNurse = { ...nurse, id: Date.now() };
  nurses.push(newNurse);
  return newNurse;
}

export async function deleteNurse(id: number) {
  await new Promise((r) => setTimeout(r, 300));
  nurses = nurses.filter((n) => n.id !== id);
  return { success: true };
}

export async function updateNurse(updated: Nurse) {
  await new Promise((r) => setTimeout(r, 300));
  nurses = nurses.map((n) => (n.id === updated.id ? updated : n));
  return updated;
}
