import express from "express";
import cors from "cors";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("../client/dist"));

let stock = {
  India: 100,
  SriLanka: 100,
};

const costIndia = 30000;
const costSriLanka = 25000;
const exportCostPerUnit = 500;

app.post("/orders", (req, res) => {
  const { country, units } = req.body;

  if (units > 200 || units < 1) {
    return res.status(400).send({
      message:
        "Invalid number of units. Please request between 1 and 200 units.",
    });
  }

  let totalCost = 0;
  if (country === "India") {
    if (units <= stock.India) {
      totalCost = units * costIndia;
      stock.India -= units;
    } else {
      const availableUnits = stock.India;
      const importUnits = units - availableUnits;
      totalCost =
        availableUnits * costIndia +
        importUnits * (costSriLanka + exportCostPerUnit);
      stock.India = 0;
      stock.SriLanka -= importUnits;
    }
  } else if (country === "Sri Lanka") {
    if (units <= stock.SriLanka) {
      totalCost = units * costSriLanka;
      stock.SriLanka -= units;
    } else {
      const availableUnits = stock.SriLanka;
      const importUnits = units - availableUnits;
      totalCost =
        availableUnits * costSriLanka +
        importUnits * (costIndia + exportCostPerUnit);
      stock.SriLanka = 0;
      stock.India -= importUnits;
    }
  } else {
    return res.status(400).send({ message: "Invalid country specified." });
  }

  res.send({
    message: `Order placed successfully for ${units} units from ${country} with total cost: Rs.${totalCost}`,
    stock,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
