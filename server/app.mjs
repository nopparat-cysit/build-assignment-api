import express from "express";
import connectionPool from "./utils/db.mjs";

const app = express();
const port = 4001;

app.use(express.json());


app.get("/test", (req, res) => {
  res.json({ message: "Server API is working 🚀" });
});

app.post("/assignments", async (req, res) => {
  try {
    const newAssignment = {
      ...req.body,
      created_at: new Date(),
      updated_at: new Date(),
      published_at: new Date()
    };

    await connectionPool.query(
      `INSERT INTO assignments (title, content, category, created_at, updated_at, published_at) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        newAssignment.title,
        newAssignment.content,
        newAssignment.category,
        newAssignment.created_at,
        newAssignment.updated_at,
        newAssignment.published_at,
      ]
    );

    res.status(201).json({ message: "Created assignment successfully" });
  } catch (error) {
    return res.status(500).json({ 
      message: "Server could not create assignment because database connection",
      error: error.message 
    });
  }
});

app.get("/assignments", async (req, res) => {
  try {
    const result = await connectionPool.query('SELECT * FROM assignments')
    res.status(201).json({ 
      message: "Read assignment successfully",
      data: result.rows
     });
  } catch (error) {
    return res.status(500).json({ 
      message: "Server could not create assignment because database connection",
      error: error.message 
    });
  }
});

app.get("/assignments/:assignment_id", async (req, res) => {
  try {
    let param = req.params.assignment_id;
    const result = await connectionPool.query(
      `SELECT * FROM assignments WHERE assignment_id = $1`,
      [param]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({
        message: `Server could not find a requested assignment ID: ${param}`,
      });
    }
    res.status(201).json({
      message: "Read assignment successfully",
      data: result.rows
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server could not create assignment because database connection",
      error: error.message
    });
  }
});

app.put("/assignments/:assignmentId", async (req, res) => {
  try {
    const assignmentId = req.params.assignmentId;
    const newAssignment = {
      ...req.body,
      updated_at: new Date()
    };
    const result = await connectionPool.query(`
      UPDATE assignments 
      SET title = $2, 
          content = $3,
          category = $4,
          updated_at = $5
      WHERE assignment_id = $1
      RETURNING *;
    `, [
      assignmentId,
      newAssignment.title,
      newAssignment.content,
      newAssignment.category,
      newAssignment.updated_at
    ]);

    if (result.rows.length === 0) {
      // ดัก 404: assignment ไม่พบ
      return res.status(404).json({
        message: `Assignment with id ${assignmentId} not found.`
      });
    }

    res.status(201).json({
      message: "Update assignment successfully",
      data: result.rows
    });
  } catch (error) {
    return res.status(500).json({ 
      message: "Server could not create assignment because database connection",
      error: error.message 
    });
  }
});

app.delete("/assignments/:assignment_id", async (req, res) => {
  try {
    let param = req.params.assignment_id;
    const result = await connectionPool.query(
      `DELETE FROM assignments WHERE assignment_id = $1 RETURNING *`,
      [param]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({
        message: `Server could not find a requested assignment ID: ${param}`,
      });
    }
    res.status(201).json({
      message: "Delete assignment successfully",
      data: result.rows
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server could not create assignment because database connection",
      error: error.message
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
