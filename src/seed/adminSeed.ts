import { AppDataSource } from "../config/data-source";
import { User } from "../models/User";
import { UserRoles } from "../enums/UserRoles";
import * as argon2 from "argon2";

export async function createAdminUser() {
    try {
        await AppDataSource.initialize();
        const userRepository = AppDataSource.getRepository(User);

        const adminUser = userRepository.create({
            username: "thelotosss",
            fullName: "Administrator",
            email: "realy_coolAdmin@gmail.com",
            passwordHash: await argon2.hash("123456"),
            role: UserRoles.ADMIN,
            isVerified: true
        });

        await userRepository.save(adminUser);
        console.log("Admin user created successfully!");
    } catch (error) {
        console.error("Error creating admin user:", error);
    } finally {
        await AppDataSource.destroy();
    }
}
