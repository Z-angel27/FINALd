import { Router } from 'express'
import { poolPromise } from '../db'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import crypto from 'crypto'

dotenv.config()
const router = Router()

// POST /auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body
  if(!username || !password) return res.status(400).json({error:'username and password required'})
  try{
    const pool = await poolPromise
    const result = await pool.request().input('username', username).query('SELECT UserId, Username, Password, FullName, RoleId FROM dbo.Users WHERE Username=@username')
    const user = result.recordset[0]
    if(!user) return res.status(401).json({error:'invalid credentials'})
    // compare sha256 hex
    const hash = crypto.createHash('sha256').update(password).digest('hex').toUpperCase()
    if(user.Password !== hash) return res.status(401).json({error:'invalid credentials'})

    // get role name
    const roleRes = await pool.request().input('roleId', user.RoleId).query('SELECT Name FROM dbo.Roles WHERE RoleId=@roleId')
    const role = roleRes.recordset[0]?.Name || null

    const token = jwt.sign({ sub: user.UserId, username: user.Username, role }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '8h' })
    return res.json({ token, role })
  }catch(err){
    console.error(err)
    return res.status(500).json({error:'server error'})
  }
})

export default router
