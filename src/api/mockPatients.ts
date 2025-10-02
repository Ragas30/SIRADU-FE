export type Patient = {
  id: number;
  name: string;
  age: number;
  diagnosis: string;
};

let patients: Patient[] = [
  { id: 1, name: "Rahmawati", age: 34, diagnosis: "Diabetes" },
  { id: 2, name: "Joko Widodo", age: 58, diagnosis: "Hipertensi" },
];

export async function getPatients() {
  await new Promise((r) => setTimeout(r, 300));
  return [...patients]; // ✅ copy array biar referensi baru
}

export async function addPatient(patient: Omit<Patient, "id">) {
  await new Promise((r) => setTimeout(r, 300));
  const newPatient = { ...patient, id: Date.now() };
  patients.push(newPatient);
  return newPatient;
}

export async function deletePatient(id: number) {
  await new Promise((r) => setTimeout(r, 300));
  patients = patients.filter((p) => p.id !== id);
  return { success: true };
}

export async function updatePatient(updated: Patient) {
  await new Promise((r) => setTimeout(r, 300));
  patients = patients.map((p) => (p.id === updated.id ? updated : p));
  return updated;
}
