

export const findUserExistsQuery = async(username,connection) => {

    try {
        const sql = `SELECT id,username,password,role_id FROM users WHERE username = ? LIMIT 1;`
        return await connection.query(sql, [username])
    } catch (error) {
        console.log('findUserExistsQuery Error',error);
    }
}


export const createUserQuery = async(data,connection) =>{
    try {
        const sql = `INSERT INTO users SET ?;`
     
         return await connection.query(sql, [data])
    }catch (error) {
        console.log('createUserQuery Error',error);
        
    }
}

export const getUsersQuery = async(connection,filter_query, filter_params) =>{
    try {
        let parameters = []
        let sql = `
        SELECT
            *
        FROM (
            SELECT u.id AS 'key',u.id AS 'id',username,firstname,lastname,ur.role_name AS "role",u.deleted_at_utc FROM users u LEFT JOIN user_roles ur ON ur.id = u.role_id 
        ) u
        
        WHERE u.deleted_at_utc IS NULL`

        if (filter_query) {
            sql += filter_query
            parameters = filter_params
        }
        sql += ';'

        return await connection.query(sql, parameters)
    } catch (error) {
        console.log('getUsersQuery Error',error);
    }
}

export const getUserQuery = async(connection,id) =>{
    try {
        const sql = `SELECT username,firstname,lastname,role_id FROM users WHERE id = ? AND deleted_at_utc IS NULL;`

        return await connection.query(sql, [id])
    } catch (error) {
        console.log('getUsersQuery Error',error);
    }
}

export const updatedUserQuery = async(connection,id,data) =>{
    try {

        const sql = `UPDATE users SET ? WHERE id = ?;`

        return await connection.query(sql, [data,id])
    } catch (error) {
        console.log('getUsersQuery Error',error);
    }
}

export const deleteUserQuery = async(connection,id,data) =>{
    try {

        const sql = `UPDATE users SET ? WHERE id = ?;`

        return await connection.query(sql, [data,id])
    } catch (error) {
        console.log('getProductsQuery Error',error);
    }
}