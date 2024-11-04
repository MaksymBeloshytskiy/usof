const dbconfig = {
    host: process.env.DB_HOST!,
    user: process.env.DB_USER!,
    password: process.env.DB_PASS!,
    database: process.env.DB_NAME!,
    clearExpired: true,                       // Automatically clear expired sessions
    checkExpirationInterval: 900000,          // Check expired sessions every 15 minutes
    expiration: 1000 * 60 * 60                // Set session expiration to 1 hour
};

export default dbconfig;