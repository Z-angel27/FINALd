import sql from 'mssql'
import dotenv from 'dotenv'
dotenv.config()

const config: sql.config = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '',
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'TurnosDB',
  port: Number(process.env.DB_PORT || 1433),
  options: {
    encrypt: false,
    enableArithAbort: true
  }
}

export const poolPromise = sql.connect(config)

export async function execProcedure(name: string, inputs: { name: string, type?: any, value: any }[] = []){
  const pool = await poolPromise
  const req = pool.request()
  for(const i of inputs){
    if(i.type) req.input(i.name, i.type, i.value)
    else req.input(i.name, i.value)
  }
  const res = await req.execute(name)
  return res
}

export default sql
