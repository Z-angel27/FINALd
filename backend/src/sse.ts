import { Request, Response } from 'express'

const clients: Response[] = []

export function sseHandler(req: Request, res: Response){
  res.set({
    'Cache-Control': 'no-cache',
    'Content-Type': 'text/event-stream',
    Connection: 'keep-alive'
  })
  res.flushHeaders()
  res.write('retry: 2000\n\n')
  clients.push(res)
  req.on('close', () => {
    const idx = clients.indexOf(res)
    if(idx >= 0) clients.splice(idx,1)
  })
}

export function publishQueues(payload: any){
  const data = `data: ${JSON.stringify(payload)}\n\n`
  for(const c of clients){
    try{ c.write(data) } catch(e){/* ignore */}
  }
}

export default { sseHandler, publishQueues }
