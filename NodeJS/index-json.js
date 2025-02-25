require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_FILE = path.join(__dirname, "data.json");

app.use(express.json());
app.use(cors());

// Helper function to read data.json
const readData = () => {
    if (!fs.existsSync(DATA_FILE)) return [];
    const data = fs.readFileSync(DATA_FILE);
    return JSON.parse(data);
};

// Helper function to write data.json
const writeData = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// Create User
app.post("/api/users", (req, res) => {
    const { name, email } = req.body;
    if (!name || !email) return res.status(400).json({ message: "Name and email are required" });

    const users = readData();
    const newUser = { id: Date.now().toString(), name, email, createdAt: new Date() };
    users.push(newUser);
    writeData(users);
    res.status(201).json(newUser);
});

// Get All Users
app.get("/api/users", (req, res) => {
    res.json(readData());
});

// Get User by ID
app.get("/api/users/:id", (req, res) => {
    const users = readData();
    const user = users.find(u => u.id === req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
});

// Update User
app.put("/api/users/:id", (req, res) => {
    const { name, email } = req.body;
    if (!name && !email) return res.status(400).json({ message: "At least one field (name or email) is required" });

    let users = readData();
    const index = users.findIndex(u => u.id === req.params.id);
    if (index === -1) return res.status(404).json({ message: "User not found" });

    users[index] = { ...users[index], name: name || users[index].name, email: email || users[index].email, updatedAt: new Date() };
    writeData(users);
    res.json(users[index]);
});

// Delete User
app.delete("/api/users/:id", (req, res) => {
    let users = readData();
    const filteredUsers = users.filter(u => u.id !== req.params.id);
    if (users.length === filteredUsers.length) return res.status(404).json({ message: "User not found" });

    writeData(filteredUsers);
    res.json({ message: "User deleted successfully" });
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
