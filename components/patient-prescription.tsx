"use client";
import { useEffect, useState } from "react";

export default function PatientPrescription() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrescription = async () => {
      try {
        const res = await fetch(`/api/prescription`);
        const data = await res.json();
        if (res.ok) {
          setPrescriptions(data.prescriptions); // Assuming array of prescriptions
        } else {
          console.error(data.message);
        }
      } catch (error) {
        console.error("Error fetching prescription:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrescription();
  }, []);

  if (loading) return <p>Loading prescription...</p>;
  if (prescriptions.length === 0) return <p>No prescriptions available.</p>;

  return (
    <div>
      {prescriptions.map((prescription, index) => (
        <div key={index} className="mb-6 p-4 border rounded bg-white shadow">
          <h2 className="text-lg font-semibold mb-2">Prescription #{index + 1}</h2>
          <p>
            <strong>Dosage:</strong> {prescription.dosage}
          </p>
          <p>
            <strong>Frequency:</strong> {prescription.frequency}
          </p>
          <p>
            <strong>Duration:</strong> {prescription.duration}
          </p>
          <p>
            <strong>Description:</strong> {prescription.description}
          </p>
          <h3 className="mt-4 font-semibold">Medicines</h3>
          <ul className="list-disc list-inside">
            {prescription.medicines.map((med, idx) => (
              <li key={idx}>
                Medicine ID: {med.medicineId} — Quantity: {med.quantity}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
