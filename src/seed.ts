import { createAdminUser } from "./seed/adminSeed";

async function runSeeds() {
    await createAdminUser();
    console.log("Database seeding completed.");
    process.exit(0); // Закінчуємо процес
}

runSeeds();
