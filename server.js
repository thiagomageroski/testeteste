import express from 'express'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, 'data')
const DATA_FILE = join(DATA_DIR, 'telefones.json')
const PORT = 3001

const app = express()
app.use(express.json())

// Lê os registros já salvos; se o arquivo ainda não existe, começa vazio.
async function lerRegistros() {
  try {
    const conteudo = await readFile(DATA_FILE, 'utf-8')
    return JSON.parse(conteudo)
  } catch {
    return []
  }
}

async function salvarRegistros(registros) {
  await mkdir(DATA_DIR, { recursive: true })
  await writeFile(DATA_FILE, JSON.stringify(registros, null, 2), 'utf-8')
}

// Cadastra um telefone no JSON.
app.post('/api/telefones', async (req, res) => {
  const { telefone } = req.body ?? {}
  const digitos = String(telefone ?? '').replace(/\D/g, '')

  if (digitos.length !== 10 && digitos.length !== 11) {
    return res
      .status(400)
      .json({ erro: 'Número inválido. Informe DDD + número.' })
  }

  const registros = await lerRegistros()

  const registro = {
    id: globalThis.crypto?.randomUUID?.() ?? String(Date.now()),
    telefone: digitos,
    criadoEm: new Date().toISOString(),
  }

  registros.push(registro)
  await salvarRegistros(registros)

  res.status(201).json({ ok: true, id: registro.id })
})

// Lista os telefones já cadastrados (útil para conferir).
app.get('/api/telefones', async (_req, res) => {
  res.json(await lerRegistros())
})

app.listen(PORT, () => {
  console.log(`Servidor de dados rodando em http://localhost:${PORT}`)
})
