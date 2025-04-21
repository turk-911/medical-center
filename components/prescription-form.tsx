"use client";
import { useState, useEffect } from "react";

export default function PrescribeForm({
  appointmentId,
  onClose,
  medicineList,
}) {
  const [medicines, setMedicines] = useState([]);
  const [selectedMedicineIds, setSelectedMedicineIds] = useState<number[]>([]);
  const [quantities, setQuantities] = useState<number[]>([]);
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [duration, setDuration] = useState("");
  const [description, setDescription] = useState("");

  // Handle medicine selection and quantity
  const handleMedicineChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    index: number
  ) => {
    const newSelectedMedicineIds = [...selectedMedicineIds];
    newSelectedMedicineIds[index] = parseInt(e.target.value);
    setSelectedMedicineIds(newSelectedMedicineIds);
  };

  const handleQuantityChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const newQuantities = [...quantities];
    newQuantities[index] = parseInt(e.target.value);
    setQuantities(newQuantities);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const res = await fetch(`/api/prescription`, {
      method: "POST",
      body: JSON.stringify({
        appointmentId,
        medicineIds: selectedMedicineIds,
        quantities,
        description,
        dosage,
        duration,
        frequency,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (res.ok) {
      alert("Prescription added!");
      onClose();
    } else {
      const error = await res.json();
      alert("Error: " + error.message);
    }
  };

  return (
    <div className="p-4 border rounded bg-white shadow-md mt-4">
      <h3 className="font-semibold text-lg mb-2">Prescribe Medicine</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <select
              className="w-full p-2 border rounded"
              value={selectedMedicineIds[index] || ""}
              onChange={(e) => handleMedicineChange(e, index)}
              required
            >
              <option value="">Select a medicine</option>
              {medicineList.map((med) => (
                <option key={med.id} value={med.id}>
                  {med.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Quantity"
              className="w-full p-2 border rounded"
              value={quantities[index] || ""}
              onChange={(e) => handleQuantityChange(e, index)}
              required
            />
          </div>
        ))}

        <input
          type="text"
          placeholder="Dosage (e.g., 500mg)"
          className="w-full p-2 border rounded"
          value={dosage}
          onChange={(e) => setDosage(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Frequency (e.g., 2x/day)"
          className="w-full p-2 border rounded"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Duration (e.g., 5 days)"
          className="w-full p-2 border rounded"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          required
        />

        <textarea
          placeholder="Optional description"
          className="w-full p-2 border rounded"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}
