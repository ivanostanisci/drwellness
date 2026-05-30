export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  if (req.method === "OPTIONS") return res.status(200).end()

  const apiKey = process.env.ANTHROPIC_KEY || process.env.anthropic_key || process.env.ANTHROPICKEY

  if (!apiKey) {
    return res.status(500).json({ 
      error: "No API key found",
      keys: Object.keys(process.env).filter(k => k.toLowerCase().includes("anthrop"))
    })
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify(body)
    })
    const data = await response.json()
    return res.status(200).json(data)
  } catch(e) {
    return res.status(500).json({ error: e.message })
  }
}
