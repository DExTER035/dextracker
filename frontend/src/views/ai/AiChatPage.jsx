import { useEffect, useMemo, useRef, useState } from 'react'
import { Mic, Send, Volume2, VolumeX } from 'lucide-react'
import { useAuth } from '../../providers/AuthProvider.jsx'
import { useToast } from '../../ui/components/ToastProvider.jsx'
import { Badge, Button, Card, Input, SectionLabel } from '../../ui/components/ui.jsx'
import { PageShell } from '../_shared/PageShell.jsx'

export function AiChatPage() {
  const { settings, user } = useAuth()
  const toast = useToast()
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [listening, setListening] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [tts, setTts] = useState(true)

  const recRef = useRef(null)
  const speakRef = useRef(null)

  const key = settings?.gemini_key ?? ''
  const storeKey = useMemo(() => `dex:chat:${user?.id ?? 'anon'}:${new Date().toISOString().slice(0, 10)}`, [user?.id])

  const system = `You are a brutally honest thinking partner. Never open with praise. Read between the lines. Call out excuses. Ask uncomfortable questions. Present 2-4 choices as [CHOICE: option1 | option2] format. Keep responses short and punchy.`

  useEffect(() => {
    const raw = localStorage.getItem(storeKey)
    setMessages(raw ? JSON.parse(raw) : [])
  }, [storeKey])

  function persist(next) {
    setMessages(next)
    localStorage.setItem(storeKey, JSON.stringify(next))
  }

  function parseChoices(s) {
    const m = s.match(/\[CHOICE:\s*([^\]]+)\]/i)
    if (!m) return { text: s, choices: [] }
    const choices = m[1].split('|').map((x) => x.trim()).filter(Boolean)
    return { text: s.replace(m[0], '').trim(), choices }
  }

  async function gemini(prompt) {
    if (!key) throw new Error('Missing Gemini key (Settings → AI).')
    const body = {
      contents: [
        { role: 'user', parts: [{ text: `${system}\n\nUser: ${prompt}` }] },
      ],
      generationConfig: { temperature: 0.7, maxOutputTokens: 350 },
    }
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(key)}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) },
    )
    if (!res.ok) {
      const t = await res.text()
      throw new Error(t || 'Gemini request failed')
    }
    const json = await res.json()
    return json.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') ?? 'No response.'
  }

  async function send(prompt) {
    const p = prompt.trim()
    if (!p) return
    const next = [...messages, { id: crypto.randomUUID?.() ?? String(Math.random()), role: 'user', text: p, ts: Date.now() }]
    persist(next)
    setText('')
    setBusy(true)
    try {
      const out = await gemini(p)
      const parsed = parseChoices(out)
      const after = [
        ...next,
        { id: crypto.randomUUID?.() ?? String(Math.random()), role: 'ai', text: parsed.text, choices: parsed.choices, ts: Date.now() },
      ]
      persist(after)
      if (tts) speak(parsed.text)
    } catch (e) {
      toast.push({ tone: 'danger', text: e.message ?? 'AI failed' })
    } finally {
      setBusy(false)
    }
  }

  function speak(s) {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(s)
    u.rate = 1.05
    u.onstart = () => setSpeaking(true)
    u.onend = () => setSpeaking(false)
    speakRef.current = u
    window.speechSynthesis.speak(u)
  }

  function stopSpeak() {
    window.speechSynthesis?.cancel?.()
    setSpeaking(false)
  }

  function startVoice() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return toast.push({ tone: 'danger', text: 'Speech recognition not supported in this browser.' })
    const rec = new SR()
    rec.lang = 'en-IN'
    rec.interimResults = true
    rec.onresult = (e) => {
      const t = Array.from(e.results).map((r) => r[0].transcript).join('')
      setText(t)
    }
    rec.onend = () => setListening(false)
    rec.onerror = () => setListening(false)
    recRef.current = rec
    setListening(true)
    rec.start()
  }

  function stopVoice() {
    recRef.current?.stop?.()
    setListening(false)
  }

  function quick(q) {
    send(q)
  }

  async function dailyCheckIn() {
    const flow = [
      'Daily check-in. Mood 1-5?',
      'What did you do today?',
      'What did you avoid today?',
    ]
    for (const q of flow) {
      // put questions as AI messages locally to guide user
      persist([...messages, { id: crypto.randomUUID?.() ?? String(Math.random()), role: 'ai', text: q, choices: [], ts: Date.now() }])
    }
    toast.push({ tone: 'muted', text: 'Answer in chat. Keep it honest.' })
  }

  return (
    <PageShell
      label="AI Chat"
      title={
        <span className="flex items-center gap-3">
          AI Chat <Badge tone={key ? 'success' : 'danger'}>{key ? 'ONLINE' : 'NO KEY'}</Badge>
        </span>
      }
      right={
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => setTts((x) => !x)}>
            {tts ? <Volume2 size={16} /> : <VolumeX size={16} />} TTS
          </Button>
          {speaking ? (
            <Button variant="ghost" onClick={stopSpeak}>
              Stop
            </Button>
          ) : null}
        </div>
      }
    >
      <Card>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" onClick={() => quick('Call me out.')}>
            Call me out
          </Button>
          <Button variant="ghost" onClick={() => quick('Plan my day. Keep it short. Use [CHOICE: ...] for tradeoffs.')}>
            Plan my day
          </Button>
          <Button variant="ghost" onClick={() => quick('Check my goals. Ask 3 uncomfortable questions.')}>
            Check my goals
          </Button>
          <Button variant="ghost" onClick={() => quick('Just talk. Be blunt.')}>
            Just talk
          </Button>
          <Button variant="ghost" onClick={dailyCheckIn}>
            Daily check-in
          </Button>
        </div>

        <div className="mt-5 grid gap-3">
          {messages.length === 0 ? (
            <div className="rounded-2xl border border-border bg-bg/30 p-4 text-sm text-muted">
              Add your Gemini key in Settings → AI. Then start typing. If the model returns{' '}
              <span className="mono text-text">[CHOICE: A | B]</span>, you’ll get clickable buttons.
            </div>
          ) : (
            messages.map((m) => (
              <div key={m.id} className={'rounded-2xl border p-4 ' + (m.role === 'user' ? 'border-primary/25 bg-primary/10' : 'border-border bg-bg/30')}>
                <div className="flex items-center justify-between gap-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">{m.role === 'user' ? 'YOU' : 'AI'}</div>
                  <div className="text-[11px] text-muted mono">{new Date(m.ts).toLocaleTimeString()}</div>
                </div>
                <div className="mt-2 whitespace-pre-wrap text-sm text-text">{m.text}</div>
                {m.choices?.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {m.choices.map((c) => (
                      <button
                        key={c}
                        onClick={() => send(c)}
                        className="rounded-full border border-primary/35 bg-primary/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary transition duration-200 hover:brightness-110"
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ))
          )}
        </div>

        <div className="mt-5 grid gap-2 md:grid-cols-[1fr_auto_auto]">
          <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Say the quiet part out loud…" />
          <Button variant="ghost" onClick={listening ? stopVoice : startVoice}>
            <Mic size={16} /> {listening ? 'Stop' : 'Voice'}
          </Button>
          <Button onClick={() => send(text)} disabled={busy}>
            <Send size={16} /> Send
          </Button>
        </div>

        {speaking ? (
          <div className="mt-4 h-8 overflow-hidden rounded-2xl border border-border bg-bg/30 p-2">
            <div className="flex h-full items-center gap-1">
              {Array.from({ length: 24 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1 rounded-full bg-primary/60"
                  style={{ height: `${20 + Math.sin((Date.now() / 120) + i) * 10}px`, transition: 'height 200ms' }}
                />
              ))}
            </div>
          </div>
        ) : null}
      </Card>
    </PageShell>
  )
}

