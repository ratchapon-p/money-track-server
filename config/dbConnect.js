import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

let pool = null;

export const connect = async () => {
    console.log('Database Connection...');
    const host = process.env.MY_SQL_DATABASE_HOST;
    const user = process.env.MY_SQL_DATABASE_USERNAME;
    const database = process.env.MY_SQL_DATABASE_NAME;
    const password = process.env.MY_SQL_DATABASE_PASSWORD;

    try {
        pool = mysql.createPool({
            host: host,
            user: user,
            password: password,
            database: database,
            connectionLimit: 5,
            connectTimeout: 60 * 1000,
            waitForConnections: true,
            queueLimit: 0,
            multipleStatements: true,
        });
        console.log(`Database ${database} connected at ${host}`);
    } catch (error) {
        console.error('Database connection failed:', error);
    }
};

export const get = () => {
    if (!pool) {
        throw new Error('Database pool is not initialized');
    }
    return pool;
};
