
const express = require("express");

const app = express();
const PORT = 3000;

// Middleware to parse JSON request bodies
app.use(express.json());

// In-memory student data for this experiment
let students = [
  { id: 1, name: "Aarav Patel", email: "aarav@example.com", age: 20 },
  { id: 2, name: "Diya Shah", email: "diya@example.com", age: 21 },
  { id: 3, name: "Riya Mehta", email: "riya@example.com", age: 22 }
];
let nextId = 4;

// Validate student input
function validateStudent(data) {
  const errors = [];

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return ["Request body must be a JSON object."];
  }

  if (typeof data.name !== "string" || !data.name.trim()) {
    errors.push("Name is required and must be a non-empty string.");
  }

  if (
    typeof data.email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)
  ) {
    errors.push("A valid email address is required.");
  }

  if (!Number.isInteger(data.age) || data.age < 16 || data.age > 100) {
    errors.push("Age must be an integer between 16 and 100.");
  }

  return errors;
}

// Welcome route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Student Management API is running."
  });
});

// CREATE: Add a student
app.post("/api/students", (req, res) => {
  const errors = validateStudent(req.body);

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed.",
      errors
    });
  }

  const emailExists = students.some(
    student => student.email.toLowerCase() === req.body.email.trim().toLowerCase()
  );

  if (emailExists) {
    return res.status(409).json({
      success: false,
      message: "A student with this email already exists."
    });
  }

  const student = {
    id: nextId++,
    name: req.body.name.trim(),
    email: req.body.email.trim().toLowerCase(),
    age: req.body.age
  };

  students.push(student);

  res.status(201).json({
    success: true,
    message: "Student created successfully.",
    data: student
  });
});

// READ: Get all students
app.get("/api/students", (req, res) => {
  res.status(200).json({
    success: true,
    count: students.length,
    data: students
  });
});

// READ: Get one student by ID
app.get("/api/students/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      message: "Student ID must be a positive integer."
    });
  }

  const student = students.find(s => s.id === id);

  if (!student) {
    return res.status(404).json({
      success: false,
      message: "Student not found."
    });
  }

  res.status(200).json({
    success: true,
    data: student
  });
});

// UPDATE: Replace a student's details
app.put("/api/students/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      message: "Student ID must be a positive integer."
    });
  }

  const index = students.findIndex(s => s.id === id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: "Student not found."
    });
  }

  const errors = validateStudent(req.body);

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed.",
      errors
    });
  }

  const emailExists = students.some(
    s => s.id !== id &&
      s.email.toLowerCase() === req.body.email.trim().toLowerCase()
  );

  if (emailExists) {
    return res.status(409).json({
      success: false,
      message: "A student with this email already exists."
    });
  }

  students[index] = {
    id,
    name: req.body.name.trim(),
    email: req.body.email.trim().toLowerCase(),
    age: req.body.age
  };

  res.status(200).json({
    success: true,
    message: "Student updated successfully.",
    data: students[index]
  });
});

// DELETE: Remove a student
app.delete("/api/students/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      message: "Student ID must be a positive integer."
    });
  }

  const index = students.findIndex(s => s.id === id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: "Student not found."
    });
  }

  const deletedStudent = students.splice(index, 1)[0];

  res.status(200).json({
    success: true,
    message: "Student deleted successfully.",
    data: deletedStudent
  });
});

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found."
  });
});

// Handle malformed JSON and unexpected errors
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      success: false,
      message: "Malformed JSON request body."
    });
  }

  console.error(err);

  res.status(500).json({
    success: false,
    message: "Internal server error."
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Student API running at http://localhost:${PORT}`);
});