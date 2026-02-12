import { buildSystemPrompt, buildUserPrompt } from './promptTemplate'

/**
 * Send text to the AI endpoint and get extracted entities.
 * Uses the OpenAI-compatible /v1/chat/completions endpoint (Ollama supports this).
 *
 * @param {string} text - Unstructured text to analyze
 * @param {object} settings - AI settings (endpoint, model, apiKey, temperature, maxTokens)
 * @param {AbortSignal} signal - For cancellation
 * @returns {Promise<string>} - Raw AI response content string
 */
export async function extractEntities(text, settings, signal) {
  const headers = { 'Content-Type': 'application/json' }

  if (settings.apiKey) {
    headers['Authorization'] = `Bearer ${settings.apiKey}`
  }

  const body = {
    model: settings.model,
    messages: [
      { role: 'system', content: buildSystemPrompt() },
      { role: 'user', content: buildUserPrompt(text) },
    ],
    temperature: settings.temperature ?? 0.1,
    max_tokens: settings.maxTokens ?? 4096,
    stream: false,
  }

  let response
  try {
    response = await fetch(settings.endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal,
    })
  } catch (err) {
    if (err.name === 'AbortError') throw err
    throw new Error(
      'Cannot connect to AI endpoint. ' +
      (settings.provider === 'ollama'
        ? 'Is Ollama running? Check that it is available at localhost:11434.'
        : `Check that ${settings.endpoint} is reachable.`)
    )
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    if (response.status === 401 || response.status === 403) {
      throw new Error('Authentication failed. Check your API key in settings.')
    }
    if (response.status === 404) {
      throw new Error(
        `Model "${settings.model}" not found. ` +
        (settings.provider === 'ollama'
          ? `Run \`ollama pull ${settings.model}\` to download it.`
          : 'Check the model name in settings.')
      )
    }
    if (response.status === 429) {
      throw new Error('Rate limited. Wait a moment and try again.')
    }
    throw new Error(`AI request failed (${response.status}): ${errorText.slice(0, 200)}`)
  }

  const data = await response.json()

  // OpenAI-compatible response format
  const content = data.choices?.[0]?.message?.content
  if (!content) {
    throw new Error(
      'AI response is empty or missing content. The model may still be loading.'
    )
  }

  return content
}

/**
 * Test the connection to the AI endpoint.
 * For Ollama: GET /api/tags to list available models.
 * For cloud: make a minimal completions request.
 *
 * @param {object} settings - AI settings
 * @returns {Promise<{ok: boolean, models: string[]}>}
 */
export async function testConnection(settings) {
  if (settings.provider === 'ollama' || !settings.apiKey) {
    // Ollama: derive base URL from the completions endpoint
    const baseUrl = settings.endpoint.replace(/\/v1\/chat\/completions$/, '')
    let response
    try {
      response = await fetch(`${baseUrl}/api/tags`, { method: 'GET' })
    } catch {
      throw new Error(
        'Cannot connect to Ollama. Make sure it is running at localhost:11434.'
      )
    }
    if (!response.ok) {
      throw new Error(`Ollama responded with status ${response.status}.`)
    }
    const data = await response.json()
    const models = (data.models || []).map((m) => m.name)
    return { ok: true, models }
  } else {
    // Cloud provider: minimal request
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${settings.apiKey}`,
    }
    let response
    try {
      response = await fetch(settings.endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: settings.model,
          messages: [{ role: 'user', content: 'Respond with the word ok' }],
          max_tokens: 5,
        }),
      })
    } catch {
      throw new Error(`Cannot connect to ${settings.endpoint}.`)
    }
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('Authentication failed. Check your API key.')
      }
      throw new Error(`API responded with status ${response.status}.`)
    }
    return { ok: true, models: [] }
  }
}
