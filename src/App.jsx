import { useState } from 'react'
import './App.css'

// Máscara simples de telefone BR: (00) 00000-0000
function formatarTelefone(valor) {
  const digitos = valor.replace(/\D/g, '').slice(0, 11)

  if (digitos.length <= 2) return digitos

  if (digitos.length <= 6) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`
  }

  if (digitos.length <= 10) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`
  }

  return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`
}

function App() {
  const [telefone, setTelefone] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [erroEnvio, setErroEnvio] = useState('')

  const digitos = telefone.replace(/\D/g, '')
  const valido = digitos.length === 10 || digitos.length === 11

  async function handleSubmit(e) {
    e.preventDefault()

    if (!valido || enviando) return

    setEnviando(true)
    setErroEnvio('')

    try {
      const resposta = await fetch('/api/telefones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telefone }),
      })

      if (!resposta.ok) {
        const dados = await resposta.json().catch(() => ({}))
        throw new Error(dados.erro || 'Protocolo inexistente com esse número de telefone.')
      }

      setEnviado(true)
    } catch (err) {
      setErroEnvio(err.message || 'Falha ao conectar com o servidor.')
    } finally {
      setEnviando(false)
    }
  }

  function handleNovoTelefone() {
    setTelefone('')
    setEnviado(false)
    setErroEnvio('')
  }

  return (
    <div className="pagina">

      <header className="topo">
        <div className="topo-conteudo">
          <span className="brasao" aria-hidden="true">
            <svg viewBox="0 0 48 56" width="40" height="46">
              <path
                d="M24 2 44 10v18c0 14-9 22-20 26C13 50 4 42 4 28V10L24 2z"
                fill="#ffd166"
              />
              <path
                d="M24 14l3.2 6.6 7.3 1-5.3 5.1 1.3 7.2L24 30.6 17.2 34l1.3-7.2L13.2 21.7l7.3-1L24 14z"
                fill="#1b7a3e"
              />
            </svg>
          </span>

          <div className="topo-texto">
            <strong>Portal da Polícia Federal</strong>
            <span>Órgão Público - Governo Federal</span>
          </div>
        </div>
      </header>

      <main className="centro">
        <section className="card">
          {!enviado ? (
            <>
              <h1>Consulte seu protocolo através do seu número de telefone.</h1>

              <p className="subtitulo">
                Informe seu número com DDD para consultar o seu protocolo.
              </p>

              <form onSubmit={handleSubmit} noValidate>
                <label htmlFor="telefone">
                  Número de telefone
                </label>

                <input
                  id="telefone"
                  name="telefone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="(11) 98765-4321"
                  value={telefone}
                  onChange={(e) =>
                    setTelefone(formatarTelefone(e.target.value))
                  }
                  autoFocus
                  aria-invalid={Boolean(telefone) && !valido}
                  aria-describedby="erro-telefone"
                />

                <div className="mensagem-erro" id="erro-telefone">
                  {telefone && !valido && (
                    <span className="erro">
                      Digite um número válido com DDD.
                    </span>
                  )}
                  {erroEnvio && <span className="erro">{erroEnvio}</span>}
                </div>

                <button type="submit" disabled={!valido || enviando}>
                  {enviando ? 'Salvando...' : 'Consultar número'}
                </button>
              </form>
            </>
          ) : (
            <div className="sucesso">
              <div className="check" aria-hidden="true">
                ✓
              </div>

              <h1>Número cadastrado</h1>

              <p className="subtitulo">
                Número informado: <strong>{telefone}</strong>.
              </p>

              <p className="aviso">
                Você receberá as atualizações da sua entrega por SMS.
              </p>

              <button
                type="button"
                className="secundario"
                onClick={handleNovoTelefone}
              >
                Cadastrar outro número
              </button>
            </div>
          )}
        </section>
      </main>

      <footer className="rodape">
        Portal da Polícia Federal.
      </footer>
    </div>
  )
}

export default App
