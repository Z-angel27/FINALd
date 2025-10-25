import { Router } from 'express'
import { execProcedure, poolPromise } from '../db'
import { publishQueues } from '../sse'

const router = Router()

// GET /queues
router.get('/queues', async (req,res)=>{
  try{
    const pool = await poolPromise
    const result = await pool.request().query(`SELECT c.Name as ClinicName, t.TurnoId, t.PatientName, t.Status, t.CreatedAt, t.UpdatedAt, t.DoctorId
      FROM dbo.Clinics c
      LEFT JOIN dbo.Turnos t ON t.ClinicId = c.ClinicId
      ORDER BY c.ClinicId, t.CreatedAt ASC`)

    // transform into grouped object
    const rows = result.recordset
    const grouped: Record<string, any[]> = {}
    for(const r of rows){
      const clinic = r.ClinicName || 'Sin clínica'
      grouped[clinic] = grouped[clinic] || []
      if(r.TurnoId) grouped[clinic].push(r)
    }
    res.json(grouped)
  }catch(err){
    console.error(err)
    res.status(500).json({error:'server error'})
  }
})

// POST /turnos -> register
router.post('/turnos', async (req,res)=>{
  const { patientName, clinic, createdBy } = req.body
  if(!patientName || !clinic) return res.status(400).json({error:'missing fields'})
  try{
    const r = await execProcedure('sp_RegisterTurno', [
      {name:'PatientName', value: patientName},
      {name:'ClinicName', value: clinic},
      {name:'CreatedBy', value: createdBy || 1}
    ])
    // publish new queues
    const pool = await poolPromise
    const q = await pool.request().execute('sp_GetQueues')
    publishQueues(transformQueues(q.recordset))
    res.json({ ok: true, newId: r.recordset[0]?.NewTurnoId })
  }catch(err){
    console.error(err)
    res.status(500).json({error:'server error'})
  }
})

// POST /queues/:clinic/call
router.post('/queues/:clinic/call', async (req,res)=>{
  const clinic = decodeURIComponent(req.params.clinic)
  try{
    const r = await execProcedure('sp_CallNext', [{name:'ClinicName', value: clinic}])
    const pool = await poolPromise
    const q = await pool.request().execute('sp_GetQueues')
    publishQueues(transformQueues(q.recordset))
    res.json(r.recordset)
  }catch(err){
    console.error(err)
    res.status(500).json({error:'server error'})
  }
})

// POST /turnos/:id/start
router.post('/turnos/:id/start', async (req,res)=>{
  const id = Number(req.params.id)
  const { doctorId } = req.body
  try{
    const r = await execProcedure('sp_StartConsult', [{name:'TurnoId', value:id}, {name:'DoctorId', value: doctorId || null}])
    const pool = await poolPromise
    const q = await pool.request().execute('sp_GetQueues')
    publishQueues(transformQueues(q.recordset))
    res.json(r.recordset[0])
  }catch(err){
    console.error(err)
    res.status(500).json({error:'server error'})
  }
})

// POST /turnos/:id/end
router.post('/turnos/:id/end', async (req,res)=>{
  const id = Number(req.params.id)
  try{
    const r = await execProcedure('sp_EndConsult', [{name:'TurnoId', value:id}])
    const pool = await poolPromise
    const q = await pool.request().execute('sp_GetQueues')
    publishQueues(transformQueues(q.recordset))
    res.json(r.recordset[0])
  }catch(err){
    console.error(err)
    res.status(500).json({error:'server error'})
  }
})

// POST /turnos/:id/absent
router.post('/turnos/:id/absent', async (req,res)=>{
  const id = Number(req.params.id)
  try{
    const r = await execProcedure('sp_MarkAbsent', [{name:'TurnoId', value:id}])
    const pool = await poolPromise
    const q = await pool.request().execute('sp_GetQueues')
    publishQueues(transformQueues(q.recordset))
    res.json(r.recordset[0])
  }catch(err){
    console.error(err)
    res.status(500).json({error:'server error'})
  }
})

function transformQueues(rows: any[]){
  const grouped: Record<string, any[]> = {}
  for(const r of rows){
    const clinic = r.ClinicName || 'Sin clínica'
    grouped[clinic] = grouped[clinic] || []
    if(r.TurnoId) grouped[clinic].push(r)
  }
  return grouped
}

export default router
