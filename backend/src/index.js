require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/connectDB");
const routes = require("./routes");
const session = require("express-session");
const { keycloak, memoryStore } = require("./config/keycloak-config");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
routes(app);

connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
