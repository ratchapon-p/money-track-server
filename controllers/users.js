import asyncHandler from 'express-async-handler'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js';
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { createUserQuery, findUserExistsQuery, getUserQuery, getUsersQuery, updatedUserQuery,deleteUserQuery } from "../models/users.js"
import {getConnection} from '../config/dbConnect2.js'
import { searchAndFilterQuery } from '../utils/searchAndFilterQuery.js';

dayjs.extend(utc);

const generateToken = (id) =>{
    return jwt.sign({id}, process.env.JWT_KEY, {expiresIn: '1d'})
}

export const createUserCtrl = asyncHandler(async(req,res) =>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const dateTimeNow = dayjs.utc().format('YYYY-MM-DD HH:mm:ss')
    const connection = await getConnection()
    const { username,firstname,lastname,role_id,password } = req.body
    try {
        
        const [findUser] = await findUserExistsQuery(username,connection)
        
        if(findUser.length > 0){
            throw new Error("User Exists!")
        }
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const data = {
            username,
            password: hashedPassword,
            firstname,
            lastname,
            role_id: role_id,
            created_at_utc: dateTimeNow,
            updated_at_utc: dateTimeNow,
        }

        //TODO: Create User Here
        await createUserQuery(data,connection)
        await connection.commit(); 
        res.status(201).json({
            message: 'User Created Successfulluy',
            success: true
        })
        
    } catch (error) {
        await connection.rollback(); 
        res.status(500).json({ message: error.message,success: false });
    }
    finally{
        connection.release();
    }

})


export const loginUserCtrl = asyncHandler(async(req,res) =>{
    console.log(`login_triggered`);
    const errors = validationResult(req);

    // const userAgent = req.connection.remoteAddress;
    // // const userAgent1 = req;
    // console.log('User-Agent:', userAgent);

    if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
    }
    const connection = await getConnection()
    const {username, password} = req.body

    try {

        const [findUser] = await findUserExistsQuery(username,connection) 

        if(!findUser.length){
            throw new Error("User Not Found")
        }

        const user = findUser[0]

        const passwordMatch = await bcrypt.compare(password,user.password)

        if(findUser && passwordMatch){
            console.log("Login Success");
            return res.status(200).json({
                message: "Login Successfully!",
                token: generateToken(user?.id),
                user_id: user?.id,
                role_id: user?.role_id,
                success: true
            })
        }else{
            return res.status(401).json({
                message: "Login Fail, Incorrect password!",
                success: false
            })
        }

        
    } catch (error) {
        console.log('Login User Ctrl Error',error);
        
        res.status(500).json({ message: error.message,success: false });
    }finally{
        connection.release();
    }

})

//TODO: vvvvvv Below This User For Check Only Not In Production vvvvvv

export const getUsersCtrl = asyncHandler(async(req,res) =>{
    const connection = await getConnection()
        let filterData = {};
        let searchText = {};
        const limit = parseInt(req.query.limit) || 50;
        const offSet = parseInt(req.query.offSet) || 0;
        const tz = req.query.tz || '+07:00';
        filterData = JSON.parse(req.query.filterdata);
        searchText = JSON.parse(req.query.searchText);
        const filter = searchAndFilterQuery({limit,offSet,tz,filterData,searchText})
    try {
        const [users] = await getUsersQuery(connection,filter.query,filter.params)
        if(users.length < 1){
            throw new Error("No users found!")
        }
        res.status(200).json({
            data: users,
            message: "Get All Users Successfully!",
            success: true
        })
    } catch (error) {
        res.status(500).json({ message: error.message,success: false });
    }finally{
        connection.release();
    }
})

export const getUserByIdCtrl = asyncHandler(async(req,res) =>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
    }
    const connection = await getConnection()
    const {id} = req.params
    try {
        const [user] = await getUserQuery(connection,id)
        res.status(200).json({
            data: user,
            message: "Get User Successfully!",
            success: true
        })
        
    } catch (error) {
        res.status(500).json({ message: error.message,success: false });
    }finally{
        connection.release();
    }

})

export const updateUserCtrl = async(req,res) =>{
    const dateTimeNow = dayjs.utc().format('YYYY-MM-DD HH:mm:ss')
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const connection = await getConnection()
    const {lastname, firstname,username,password,role_id} = req.body
    const {id} = req.params

    try {
        const data = {
            firstname:firstname || null,
            lastname: lastname || null,
            username: username || null,
            role_id: role_id || null,
            updated_at_utc: dateTimeNow,
        }

        if (password) {
            const salt = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(password, salt)
            data.password = hashedPassword
        }

        const result = await updatedUserQuery(connection,id,data) 

        if (result.affectedRows === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found or no changes made',
                success: false
            });
        }
        else{
            res.status(200).json({
                status:'success',
                message:'Update User Successfully',
                success: true
            })

        }

        await connection.commit(); 
    } catch (error) {
        console.log('Error updateUserCtrl:',error);
        await connection.rollback(); 
    }finally{
        connection.release();
    }

}


export const deleteUserCtrl = asyncHandler(async(req,res) =>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
    }
    const connection = await getConnection()
    const {id} = req.params
    const dateTimeNow = dayjs.utc().format('YYYY-MM-DD HH:mm:ss')
    const data = {
        deleted_at_utc: dateTimeNow
    }
    try {

        const [user] = await getUserQuery(connection,id)
        if(!user.length){
            throw new Error("No products found!")
        }
        const [product] = await deleteUserQuery(connection,id,data)
        res.status(200).json({
            message: "Delete Product Successfully!",
            success: true
        })
        
    } catch (error) {
        res.status(500).json({ message: error.message,success: false });
    }finally{
        connection.release();
    }

})