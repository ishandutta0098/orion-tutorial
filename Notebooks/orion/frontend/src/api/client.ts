import useStore from '../store/useStore'

const API_BASE = '/api'

function getHeaders(): Record<string, string> {
  const { apiKey } = useStore.getState()
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (apiKey) headers['X-API-Key'] = apiKey
  return headers
}

export async function fetchFiles() {
  const res = await fetch(`${API_BASE}/files`, { headers: getHeaders() })
  return res.json()
}

export async function fetchFileContent(path: string) {
  const res = await fetch(`${API_BASE}/files/${encodeURIComponent(path)}`, { headers: getHeaders() })
  return res.json()
}

export async function saveFile(path: string, content: string) {
  const res = await fetch(`${API_BASE}/files/${encodeURIComponent(path)}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ path, content })
  })
  return res.json()
}

export async function fetchModels() {
  const res = await fetch(`${API_BASE}/models`, { headers: getHeaders() })
  return res.json()
}

export async function executeCommand(command: string) {
  const res = await fetch(`${API_BASE}/terminal/execute`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ command })
  })
  return res.json()
}

export async function fetchRules() {
  const res = await fetch(`${API_BASE}/rules`, { headers: getHeaders() })
  return res.json()
}

export async function saveRules(content: string) {
  const res = await fetch(`${API_BASE}/rules`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ content })
  })
  return res.json()
}

export async function sendChatMessage(
  messages: { role: string; content: string }[],
  model: string,
  rules: string,
  onToken: (token: string) => void,
  onToolStart?: (name: string, args: Record<string, unknown>) => void,
  onToolEnd?: (name: string, result: string) => void,
  onDone?: () => void,
  onError?: (error: string) => void
) {
  const { apiKey } = useStore.getState()
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ messages, model, rules, api_key: apiKey })
  })

  const reader = res.body?.getReader()
  if (!reader) return

  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6).trim()
        if (!data || data === '[DONE]') continue
        const parsed = JSON.parse(data)
        if (parsed.type === 'token') onToken(parsed.content)
        else if (parsed.type === 'tool_start') onToolStart?.(parsed.name, parsed.args || {})
        else if (parsed.type === 'tool_end') onToolEnd?.(parsed.name, parsed.result || '')
        else if (parsed.type === 'done') onDone?.()
        else if (parsed.type === 'error') onError?.(parsed.message)
      }
    }
  }
  onDone?.()
}

export async function runAgent(
  featureRequest: string,
  model: string,
  threadId: string,
  rules: string,
  onEvent: (event: Record<string, unknown>) => void
) {
  const { apiKey } = useStore.getState()
  const res = await fetch(`${API_BASE}/agent/run`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ feature_request: featureRequest, model, thread_id: threadId, rules, api_key: apiKey })
  })

  const reader = res.body?.getReader()
  if (!reader) return

  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6).trim()
        if (!data || data === '[DONE]') continue
        onEvent(JSON.parse(data))
      }
    }
  }
}

export async function approveAgent(
  threadId: string,
  decision: string,
  onEvent: (event: Record<string, unknown>) => void
) {
  const { apiKey } = useStore.getState()
  const res = await fetch(`${API_BASE}/agent/approve`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ thread_id: threadId, decision, api_key: apiKey })
  })

  const reader = res.body?.getReader()
  if (!reader) return

  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6).trim()
        if (!data || data === '[DONE]') continue
        onEvent(JSON.parse(data))
      }
    }
  }
}

export async function fetchHistory(threadId: string) {
  const res = await fetch(`${API_BASE}/agent/history/${threadId}`, { headers: getHeaders() })
  return res.json()
}
