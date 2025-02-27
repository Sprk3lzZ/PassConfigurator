import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useState } from "react";
import axios from "axios";

export default function Home() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [color, setColor] = useState("");
  const [phone, setPhone] = useState("");

  const handleGeneratePass = async () => {
    try {
      const response = await axios.post(
        "https://passconfiguratorservice.onrender.com/generate-pass",
        {
          firstName,
          lastName,
          phone,
          color,
        },
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "boarding-pass.pkpass");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Erreur de génération du pass :", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="flex flex-col gap-3 max-w-sm w-1/2 h-1/2 rounded-xl overflow-hidden shadow-lg bg-gray-200 p-6">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full p-2 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full p-2 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        <div>
          <PhoneInput
            className="w-full"
            country={"fr"}
            value={phone}
            onChange={(phone) => setPhone(phone)}
          />
        </div>
        <div className="flex items-center gap-3">
          <label className="text-gray-700 font-semibold">Couleur :</label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-10 h-10 rounded-md cursor-pointer"
          />
          <span className="text-gray-600">{color.toUpperCase()}</span>
        </div>
      </div>
      <button
        onClick={handleGeneratePass}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
      >
        Ajouter à Wallet
      </button>
    </div>
  );
}
