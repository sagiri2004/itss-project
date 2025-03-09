const authRouter = require("./auth");
const userRouter = require("./user");

module.exports = (app) => {
  app.use("/api/auth", authRouter);
  app.use("/api/user", userRouter);
  app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
  });
};
