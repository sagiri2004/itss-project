const userRouter = require("./user");
const authRouter = require("./auth");
const { keycloak } = require("~/config/keycloak-config");

module.exports = (app) => {
  app.use(
    require("express-session")({
      secret: "some-secret",
      resave: false,
      saveUninitialized: true,
      store: keycloak.store,
    })
  );

  app.use(keycloak.middleware());

  app.use("/api/auth", authRouter);
  app.use("/api/user", keycloak.protect(), userRouter);

  app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
  });
};
