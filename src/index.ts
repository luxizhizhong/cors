/*
** create by @d1y in 2019-11-26
*/

import http from 'http'
import Koa from 'koa'
import Router from '@koa/router'
import cors from '@koa/cors'
import fs, { read } from 'fs'
import root from 'app-root-path'
import path from 'path'
import body from 'koa-bodyparser'
import got from 'got'
import isURL from 'is-url'

const App = new Koa

const Routing = new Router

const readFile = async (filename: string): Promise<string> => {
  let result: Array<any> = []
  const full_path: string = path.join(root.path, `./${ filename }`)
  return await new Promise(async rcv=> {
    const rs = fs.createReadStream(full_path)
    rs.on('data', chunk=> {
      result.push(chunk)
    })
    rs.on('end', chunk=> {
      const data = Buffer.concat(result).toString('utf-8')
      rcv(data)
    })
    rs.on('error', err=> {
      throw new Error('read docs file is error')
    })
  })
}

Routing
  .get('/', async ctx=> {
    ctx.body = await readFile('docs.txt')
  })
  .post('/cors', async ctx=> {
    const { site } = ctx.request.body
    if (isURL(site)) {
      const fetch = await got(site)
      const { body } = fetch
      ctx.body = body
    } else {
      (ctx as any).code = 404
      ctx.body = {
        msg: '参数错误'
      }
    }
  })

// middleware
App.use(cors())
App.use(body())

App
.use(Routing.routes())
.use(Routing.allowedMethods())


const createServer = (port: number): void => {
  const Server = http.createServer(App.callback())
  Server.listen(port)
}

module.exports = createServer

if (typeof module != 'undefined' && !module.parent) { 
  createServer(2333)
}