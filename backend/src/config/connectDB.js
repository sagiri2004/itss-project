const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("mydb", "root", "root", {
  host: "127.0.0.1", // Hoặc IP của container
  port: 3306,
  dialect: "mysql",
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Connected to MySQL successfully!");
  } catch (error) {
    console.error("❌ Unable to connect:", error);
  }
};

module.exports = connectDB;
