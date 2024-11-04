import express from "express";
import dotenv from "dotenv";
import path from "path";
import routes from "./routes";
import { errorHandler } from "./middlewares/errorHandler";
import { AuthMiddleware } from "./middlewares/authMiddleware";

// Завантаження змінних оточення
dotenv.config();

// Ініціалізація Express-додатку
const app = express();

// Підключення обробника помилок
app.use(errorHandler);

// Підключення парсерів тіла запитів
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Підключення статичних файлів з публічної папки
app.use(express.static(path.join(__dirname, 'views/public')));

// Підключення маршрутів
app.use("/api", routes);

// Основні маршрути для відображення HTML-сторінок
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "main.html"));
});
app.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "register.html"));
});
app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "login.html"));
});
app.get("/post", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "post.html"));
});
app.get("/restore-request", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "restore-request.html"));
});
app.get("/reset-password", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "reset-password.html"));
});
app.get("/verify-email", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "verify-email.html"));
});
app.get("/admin-panel", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "admin-panel.html"));
});


export default app;
