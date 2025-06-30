import express from 'express'
import { body, param, query } from 'express-validator'
import { getUserByIdCtrl, getUsersCtrl, loginUserCtrl, createUserCtrl, updateUserCtrl, deleteUserCtrl } from '../controllers/users.js'
import { isLoggedIn } from '../middlewares/isLoggedIn.js'
const userRoutes = express.Router()

const validateCreateUser = [
    body('username').exists(),
    body('firstname').exists(),
    body('lastname').exists(),
    body('password').exists(),
    body('role_id').isInt().toInt()
]

const validateLogin = [
    body('username').exists(),
    body('password').exists(),
]

const validateUpdateUser = [
    param('id').isInt().toInt(),
    body('username').optional({checkFalsy: true, nullable :true}),
    body('password').optional({checkFalsy: true, nullable :true}),
    body('firstname').optional({checkFalsy: true, nullable :true}),
    body('lastname').optional({checkFalsy: true, nullable :true}),
    body('role_id').optional({checkFalsy: true, nullable :true}).isInt().toInt(),
]

const validateParamId = [
    param('id').exists()
]

const validateGetAll = [
    query('limit').exists(),
    query('offSet').exists(),
    query('filterdata').exists(),
    query('searchText').exists(),
]

userRoutes.get("/", isLoggedIn,validateGetAll,getUsersCtrl)
userRoutes.get("/:id",isLoggedIn,validateParamId, getUserByIdCtrl)
userRoutes.put("/:id",isLoggedIn,validateUpdateUser, updateUserCtrl)
userRoutes.post("/", validateCreateUser,createUserCtrl)
userRoutes.post("/login", validateLogin,loginUserCtrl)
userRoutes.delete("/:id", validateParamId,deleteUserCtrl)

export default userRoutes