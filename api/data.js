import { Router } from "express";
import { getAllData, getDataById, addData, addRows } from "../mongodb.js";
let router = Router();

router.get("/", async (req, res) => {
  res.json(await getAllData());
});

router.get("/:id", async (req, res) => {
  res.json(await getDataById(req.params.id));
});

router.post("/AddRows", async (req, res) => {
  const { RowAmount } = req.body;

  if (!RowAmount || isNaN(RowAmount)) {
    return res.status(400).json({ success: false, error: "Invalid RowAmount" });
  }

  try {
    const result = await addRows({ RowAmount: parseInt(RowAmount) });
    res.json(result);
  } catch (error) {
    console.error("Error adding rows:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/AddData", async (req, res) => {
  const { Firstname, Surname } = req.body;

  if (!Firstname || !Surname) {
    return res
      .status(400)
      .json({ success: false, error: "Firstname and Surname are required" });
  }

  try {
    await addData({ Firstname, Surname });
    res.json({ success: true, message: "Data added successfully" });
  } catch (err) {
    console.error("Error adding data:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/", async (req, res) => {
  let exist = await getDataById(req.body.id);
  if (exist[0]) {
    res.status(409).json({ error: "record already exists" });
  } else {
    let result = await addData(req.body);
    if (result.affectedRows) res.json(req.body);
    else res.status(500).json({ error: "unknown database error" });
  }
});

export default router;
