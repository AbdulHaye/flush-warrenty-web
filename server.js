const express = require("express");
const cors = require("cors");
const config = require("./config/config");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
const customValuesRoutes = require("./routes/customValuesRoutes");
const contactsRoutes = require("./routes/contactsRoutes");
const tokenRoutes = require("./routes/tokenRoutes");
const nmiRoutes = require("./routes/nmiRoutes");

app.use("/api/custom-values", customValuesRoutes);
app.use("/api/contacts", contactsRoutes);
app.use("/api", tokenRoutes);
app.use("/api", nmiRoutes);

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
});
