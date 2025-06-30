import mysql from 'mysql2/promise'
import bluebird from 'bluebird'
import dotenv from 'dotenv';
dotenv.config();
let pool = null;
export const connection2 = () =>{
    const host = process.env.MY_SQL_DATABASE_HOST
    const port = process.env.MY_SQL_DATABASE_PORT
    const user = process.env.MY_SQL_DATABASE_USERNAME
    const password = process.env.MY_SQL_DATABASE_PASSWORD
    const database = process.env.MY_SQL_DATABASE_NAME
    
    console.log(`Database Host At : ${host}`)
    console.log(`Database Name : ${database}`)
    console.log(`Database User : ${user}`)
    try {
        pool = mysql.createPool({
            connectionLimit: 10,
            waitForConnections: true,
            connectTimeout: 60 * 1000,
            queueLimit:0,
        
            host: host,
            port: port,
            user: user,
            password: password,
            database: database,
            Promise: bluebird
        })
    } catch (error) {
        console.error('Database connection failed:', error);
    }

}

export const getConnection = async () => {
    const connection = await pool.getConnection();
    return connection;
};