const express = require("express");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const app = express();
const cors = require("cors");
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

function hexToRgb(hex) {
  hex = hex.replace(/^#/, "");

  let bigint = parseInt(hex, 16);
  let r = (bigint >> 16) & 255;
  let g = (bigint >> 8) & 255;
  let b = bigint & 255;

  return `rgb(${r}, ${g}, ${b})`;
}

// 📌 Route pour générer un pass Apple Wallet
app.post("/generate-pass", async (req, res) => {
  const { firstName, lastName, color } = req.body;

  try {
    console.log("🔹 Requête reçue avec :", { firstName, lastName });
    console.log(hexToRgb(color));
    const passFolder = path.join(__dirname, "temp_pass");
    if (fs.existsSync(passFolder)) {
      fs.rmSync(passFolder, { recursive: true });
    }
    fs.mkdirSync(passFolder);

    const modelFolder = path.join(__dirname, "passModel");
    fs.cpSync(modelFolder, passFolder, { recursive: true });

    const passJsonPath = path.join(passFolder, "pass.json");
    const passData = JSON.parse(fs.readFileSync(passJsonPath, "utf8"));
    passData.boardingPass.secondaryFields = [
      {
        key: "passenger",
        label: "PASSENGER",
        value: `${firstName} ${lastName}`,
      },
    ];
    passData.backgroundColor = hexToRgb(color);
    fs.writeFileSync(passJsonPath, JSON.stringify(passData, null, 2));

    const pkpassFile = path.join(__dirname, "boarding-pass.pkpass");
    const signpassPath = path.join(__dirname, "passkitgenerator");
    exec(
      `${signpassPath} -p ${passFolder} -o ${pkpassFile}`,
      (error, stdout, stderr) => {
        if (error) {
          console.error("❌ Erreur lors de la signature du pass :", error);
          return res.status(500).json({
            message: "Erreur lors de la signature du pass",
            error: stderr,
          });
        }

        console.log("✅ Pass généré avec succès :", stdout);

        res.set({
          "Content-Type": "application/vnd.apple.pkpass",
          "Content-Disposition": "attachment; filename=boarding-pass.pkpass",
        });
        res.sendFile(pkpassFile, () => {
          fs.rmSync(passFolder, { recursive: true });
          fs.unlinkSync(pkpassFile);
        });
      }
    );
  } catch (error) {
    console.error("❌ Erreur de génération du pass :", error);
    res
      .status(500)
      .json({ message: "Erreur serveur", error: error.toString() });
  }
});

const ip = "0.0.0.0"; // Permet de se rendre accessible sur le réseau local
app.listen(3001, ip, () => {
  console.log("Serveur backend accessible sur le réseau local.");
});
