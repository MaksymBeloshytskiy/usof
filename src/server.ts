import dotenv from "dotenv";
import "reflect-metadata";
import { AppDataSource } from "./config/data-source";
import app from "./app";

// Завантаження змінних оточення
dotenv.config();

// Середовище прослуховування порту
const PORT = process.env.PORT || 3000;

// Ініціалізація бази даних та запуск сервера
AppDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!");

        // Запуск сервера
        app.listen(PORT, () => {
            console.log(`Server is running at http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Error during Data Source initialization:", error);
    });
