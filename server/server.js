const express = require("express");
const { Sequelize, DataTypes, QueryTypes } = require("sequelize");
const cors = require("cors");
const path = require("path");
("");

const dbPath = path.resolve(__dirname, "sqlite.db");

// const db = require("./db");
const app = express();
const port = 3000;

//Connect to sqlite dataBase
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: dbPath,
});

//REservation model
const Reservation = sequelize.define(
  "Reservation",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    betriebId: { type: DataTypes.INTEGER, allowNull: false },
    peopleCount: { type: DataTypes.INTEGER, allowNull: false },
    reservedFor: { type: DataTypes.DATE, allowNull: false },
  },
  {
    tableName: "reservations",
    timestamps: false,
  }
);

app.use(cors());
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`App is listening to port ${port}`);
});

// app.get("/api/reservations", (req, res) => {
//   const sql = "SELECT * FROM reservations";
//   db.all(sql, [], (err, rows) => {
//     if (err) {
//       res.status(500).json({ error: err.message });
//       return;
//     }
//     res.json(rows);
//   });
// });
app.get("/api/reservations", async (req, res) => {
  try {
    const sql = "SELECT * FROM reservations";

    const reservations = await sequelize.query(sql);
    res.json(reservations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: `Internal server error` });
  }
});

app.get("/api/statistics", async (req, res) => {
  try {
    const { betriebId, startDate, endDate } = req.query;

    if (!betriebId || !startDate || !endDate) {
      return res
        .status(400)
        .json({ error: `betrieId, startDate, and endDate are required ` });
    }
    const statistics = await sequelize.query(
      `SELECT
              strftime('%w',reservedFor) AS weekday,
              COUNT(id) AS reservation_count,
              SUM(peopleCount) AS total_people,
              AVG(peopleCount) AS avg_group_size
         FROM reservations
         WHERE betriebId = :betriebId
         AND reservedFor BETWEEN :startDate AND :endDate
         GROUP BY weekday
         HAVING weekday <= '6'
         ORDER BY weekday; `,
      {
        replacements: { betriebId, startDate, endDate },
        type: QueryTypes.SELECT, // ✅ This ensures we get a flat array
        raw: true, // ✅ This ensures we get plain JSON objects instead of a nested array
      }
    );
    res.json(statistics);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: `Internal server error` });
  }
});
