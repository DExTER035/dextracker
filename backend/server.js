const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3002;
const DATA_DIR = path.join(__dirname, 'data');

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests from localhost (dev), Vercel domains, or no origin (mobile/Postman)
    const allowed = !origin || origin.includes('localhost') || origin.includes('vercel.app') || origin.includes('render.com') || (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL);
    cb(null, allowed ? origin || '*' : new Error('CORS not allowed'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Ensure data dir exists
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// Helper: read/write JSON store per user
function getStore(userId, key) {
  const file = path.join(DATA_DIR, `${userId}_${key}.json`);
  if (!fs.existsSync(file)) return [];
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return []; }
}
function setStore(userId, key, data) {
  const file = path.join(DATA_DIR, `${userId}_${key}.json`);
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}
function getObj(userId, key, defaults = {}) {
  const file = path.join(DATA_DIR, `${userId}_${key}.json`);
  if (!fs.existsSync(file)) return defaults;
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return defaults; }
}
function setObj(userId, key, data) {
  const file = path.join(DATA_DIR, `${userId}_${key}.json`);
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// ─── AUTH ────────────────────────────────────────────────────────────────────
const usersFile = path.join(DATA_DIR, 'users.json');
function getUsers() {
  if (!fs.existsSync(usersFile)) return [];
  try { return JSON.parse(fs.readFileSync(usersFile, 'utf8')); } catch { return []; }
}
function saveUsers(u) { fs.writeFileSync(usersFile, JSON.stringify(u, null, 2)); }

app.post('/api/auth/google', (req, res) => {
  const { email, name, avatar, googleId } = req.body;
  if (!email) return res.status(400).json({ error: 'Missing email' });
  let users = getUsers();
  let user = users.find(u => u.googleId === googleId || u.email === email);
  if (!user) {
    // Generate unique 5-letter tag
    const genTag = () => Array.from({ length: 5 }, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)]).join('');
    let tag = genTag();
    while (users.find(u => u.tag === tag)) tag = genTag();
    user = { id: uuidv4(), email, name, avatar, googleId, tag, xp: 0, level: 1, badges: [], createdAt: new Date().toISOString() };
    users.push(user);
    saveUsers(users);
  }
  res.json({ user });
});

app.get('/api/auth/user/:id', (req, res) => {
  const users = getUsers();
  const user = users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json({ user });
});

app.patch('/api/auth/user/:id', (req, res) => {
  let users = getUsers();
  const idx = users.findIndex(u => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  users[idx] = { ...users[idx], ...req.body };
  saveUsers(users);
  res.json({ user: users[idx] });
});

// ─── TASKS ───────────────────────────────────────────────────────────────────
app.get('/api/:userId/tasks', (req, res) => res.json(getStore(req.params.userId, 'tasks')));
app.post('/api/:userId/tasks', (req, res) => {
  const tasks = getStore(req.params.userId, 'tasks');
  const task = { id: uuidv4(), ...req.body, createdAt: new Date().toISOString(), done: false };
  tasks.push(task);
  setStore(req.params.userId, 'tasks', tasks);
  res.json(task);
});
app.patch('/api/:userId/tasks/:id', (req, res) => {
  let tasks = getStore(req.params.userId, 'tasks');
  const idx = tasks.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  tasks[idx] = { ...tasks[idx], ...req.body };
  setStore(req.params.userId, 'tasks', tasks);
  res.json(tasks[idx]);
});
app.delete('/api/:userId/tasks/:id', (req, res) => {
  let tasks = getStore(req.params.userId, 'tasks').filter(t => t.id !== req.params.id);
  setStore(req.params.userId, 'tasks', tasks);
  res.json({ ok: true });
});

// ─── HABITS ──────────────────────────────────────────────────────────────────
app.get('/api/:userId/habits', (req, res) => res.json(getStore(req.params.userId, 'habits')));
app.post('/api/:userId/habits', (req, res) => {
  const habits = getStore(req.params.userId, 'habits');
  const habit = { id: uuidv4(), ...req.body, streak: 0, completedDates: [], createdAt: new Date().toISOString() };
  habits.push(habit);
  setStore(req.params.userId, 'habits', habits);
  res.json(habit);
});
app.patch('/api/:userId/habits/:id', (req, res) => {
  let habits = getStore(req.params.userId, 'habits');
  const idx = habits.findIndex(h => h.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  habits[idx] = { ...habits[idx], ...req.body };
  setStore(req.params.userId, 'habits', habits);
  res.json(habits[idx]);
});
app.delete('/api/:userId/habits/:id', (req, res) => {
  let habits = getStore(req.params.userId, 'habits').filter(h => h.id !== req.params.id);
  setStore(req.params.userId, 'habits', habits);
  res.json({ ok: true });
});

// ─── MOOD ────────────────────────────────────────────────────────────────────
app.get('/api/:userId/mood', (req, res) => res.json(getStore(req.params.userId, 'mood')));
app.post('/api/:userId/mood', (req, res) => {
  const moods = getStore(req.params.userId, 'mood');
  const entry = { id: uuidv4(), ...req.body, date: new Date().toISOString() };
  moods.push(entry);
  setStore(req.params.userId, 'mood', moods);
  res.json(entry);
});

// ─── JOURNAL ─────────────────────────────────────────────────────────────────
app.get('/api/:userId/journal', (req, res) => {
  const { pin } = req.query;
  const cfg = getObj(req.params.userId, 'journal_cfg', { pin: null });
  if (cfg.pin && cfg.pin !== pin) return res.status(401).json({ error: 'Wrong PIN' });
  res.json(getStore(req.params.userId, 'journal'));
});
app.post('/api/:userId/journal', (req, res) => {
  const { pin, ...body } = req.body;
  const cfg = getObj(req.params.userId, 'journal_cfg', { pin: null });
  if (cfg.pin && cfg.pin !== pin) return res.status(401).json({ error: 'Wrong PIN' });
  const entries = getStore(req.params.userId, 'journal');
  const entry = { id: uuidv4(), ...body, createdAt: new Date().toISOString() };
  entries.push(entry);
  setStore(req.params.userId, 'journal', entries);
  res.json(entry);
});
app.post('/api/:userId/journal/pin', (req, res) => {
  setObj(req.params.userId, 'journal_cfg', { pin: req.body.pin });
  res.json({ ok: true });
});
app.delete('/api/:userId/journal/:id', (req, res) => {
  const { pin } = req.body;
  const cfg = getObj(req.params.userId, 'journal_cfg', { pin: null });
  if (cfg.pin && cfg.pin !== pin) return res.status(401).json({ error: 'Wrong PIN' });
  let entries = getStore(req.params.userId, 'journal').filter(e => e.id !== req.params.id);
  setStore(req.params.userId, 'journal', entries);
  res.json({ ok: true });
});

// ─── MONEY ───────────────────────────────────────────────────────────────────
app.get('/api/:userId/money', (req, res) => res.json(getStore(req.params.userId, 'money')));
app.post('/api/:userId/money', (req, res) => {
  const txns = getStore(req.params.userId, 'money');
  const txn = { id: uuidv4(), ...req.body, date: req.body.date || new Date().toISOString() };
  txns.push(txn);
  setStore(req.params.userId, 'money', txns);
  res.json(txn);
});
app.delete('/api/:userId/money/:id', (req, res) => {
  let txns = getStore(req.params.userId, 'money').filter(t => t.id !== req.params.id);
  setStore(req.params.userId, 'money', txns);
  res.json({ ok: true });
});
app.get('/api/:userId/budget', (req, res) => res.json(getObj(req.params.userId, 'budget', { monthly: 0, categories: {} })));
app.post('/api/:userId/budget', (req, res) => {
  setObj(req.params.userId, 'budget', req.body);
  res.json(req.body);
});

// ─── FOOD ────────────────────────────────────────────────────────────────────
app.get('/api/:userId/food', (req, res) => res.json(getStore(req.params.userId, 'food')));
app.post('/api/:userId/food', (req, res) => {
  const meals = getStore(req.params.userId, 'food');
  const meal = { id: uuidv4(), ...req.body, date: req.body.date || new Date().toISOString() };
  meals.push(meal);
  setStore(req.params.userId, 'food', meals);
  res.json(meal);
});
app.delete('/api/:userId/food/:id', (req, res) => {
  let meals = getStore(req.params.userId, 'food').filter(m => m.id !== req.params.id);
  setStore(req.params.userId, 'food', meals);
  res.json({ ok: true });
});

// ─── AI FOOD PHOTO ANALYZER ───────────────────────────────────────────────────
app.post('/api/food/analyze', async (req, res) => {
  const { imageBase64, mimeType = 'image/jpeg', geminiKey } = req.body;
  if (!imageBase64) return res.status(400).json({ error: 'No image provided' });

  // Use provided key or fall back to env
  const apiKey = geminiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // Fallback: return a helpful mock response if no API key set
    return res.status(200).json({
      mock: true,
      name: 'Food item (AI key not set)',
      mealType: 'snack',
      calories: 0, protein: 0, carbs: 0, fat: 0,
      description: 'Add your Gemini API key in Settings to enable AI food scanning.',
      confidence: 0,
    });
  }

  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are a nutrition expert AI. Analyze this food photo and provide accurate nutritional estimates.

Respond ONLY with a single valid JSON object (no markdown, no code blocks, just raw JSON):
{
  "name": "food name (be specific, e.g. 'Dal Rice with sabzi')",
  "mealType": "breakfast|lunch|dinner|snack",
  "calories": number (total kcal, integer),
  "protein": number (grams, integer),
  "carbs": number (grams, integer),
  "fat": number (grams, integer),
  "fiber": number (grams, integer),
  "servingSize": "portion description",
  "description": "1 sentence about this food",
  "confidence": number (0-100, how confident you are),
  "items": ["list", "of", "identified", "food", "items"]
}`;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: imageBase64, mimeType } }
    ]);

    const text = result.response.text().trim();
    // Strip markdown code fences if present
    const clean = text.replace(/^```json\n?/, '').replace(/^```\n?/, '').replace(/\n?```$/, '').trim();
    const data = JSON.parse(clean);
    res.json(data);
  } catch (err) {
    console.error('Gemini food analysis error:', err.message);
    if (err.message?.includes('API_KEY')) return res.status(401).json({ error: 'Invalid Gemini API key' });
    if (err instanceof SyntaxError) return res.status(422).json({ error: 'AI returned unparseable response, try again' });
    res.status(500).json({ error: 'AI analysis failed: ' + err.message });
  }
});

// ─── SLEEP ───────────────────────────────────────────────────────────────────
app.get('/api/:userId/sleep', (req, res) => res.json(getStore(req.params.userId, 'sleep')));
app.post('/api/:userId/sleep', (req, res) => {
  const sleeps = getStore(req.params.userId, 'sleep');
  const entry = { id: uuidv4(), ...req.body, date: req.body.date || new Date().toISOString() };
  sleeps.push(entry);
  setStore(req.params.userId, 'sleep', sleeps);
  res.json(entry);
});

// ─── GOALS ───────────────────────────────────────────────────────────────────
app.get('/api/:userId/goals', (req, res) => res.json(getStore(req.params.userId, 'goals')));
app.post('/api/:userId/goals', (req, res) => {
  const goals = getStore(req.params.userId, 'goals');
  const goal = { id: uuidv4(), ...req.body, progress: 0, milestones: [], createdAt: new Date().toISOString() };
  goals.push(goal);
  setStore(req.params.userId, 'goals', goals);
  res.json(goal);
});
app.patch('/api/:userId/goals/:id', (req, res) => {
  let goals = getStore(req.params.userId, 'goals');
  const idx = goals.findIndex(g => g.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  goals[idx] = { ...goals[idx], ...req.body };
  setStore(req.params.userId, 'goals', goals);
  res.json(goals[idx]);
});
app.delete('/api/:userId/goals/:id', (req, res) => {
  let goals = getStore(req.params.userId, 'goals').filter(g => g.id !== req.params.id);
  setStore(req.params.userId, 'goals', goals);
  res.json({ ok: true });
});

// ─── STUDY ───────────────────────────────────────────────────────────────────
app.get('/api/:userId/study-sessions', (req, res) => res.json(getStore(req.params.userId, 'study_sessions')));
app.post('/api/:userId/study-sessions', (req, res) => {
  const sessions = getStore(req.params.userId, 'study_sessions');
  const s = { id: uuidv4(), ...req.body, date: req.body.date || new Date().toISOString() };
  sessions.push(s);
  setStore(req.params.userId, 'study_sessions', sessions);
  res.json(s);
});
app.get('/api/:userId/grades', (req, res) => res.json(getStore(req.params.userId, 'grades')));
app.post('/api/:userId/grades', (req, res) => {
  const grades = getStore(req.params.userId, 'grades');
  const g = { id: uuidv4(), ...req.body };
  grades.push(g);
  setStore(req.params.userId, 'grades', grades);
  res.json(g);
});
app.delete('/api/:userId/grades/:id', (req, res) => {
  let grades = getStore(req.params.userId, 'grades').filter(g => g.id !== req.params.id);
  setStore(req.params.userId, 'grades', grades);
  res.json({ ok: true });
});
app.get('/api/:userId/study-notes', (req, res) => res.json(getStore(req.params.userId, 'study_notes')));
app.post('/api/:userId/study-notes', (req, res) => {
  const notes = getStore(req.params.userId, 'study_notes');
  const n = { id: uuidv4(), ...req.body, createdAt: new Date().toISOString() };
  notes.push(n);
  setStore(req.params.userId, 'study_notes', notes);
  res.json(n);
});
app.delete('/api/:userId/study-notes/:id', (req, res) => {
  let notes = getStore(req.params.userId, 'study_notes').filter(n => n.id !== req.params.id);
  setStore(req.params.userId, 'study_notes', notes);
  res.json({ ok: true });
});

// ─── SPORTS & STEPS ──────────────────────────────────────────────────────────
app.get('/api/:userId/sports', (req, res) => res.json(getStore(req.params.userId, 'sports')));
app.post('/api/:userId/sports', (req, res) => {
  const sports = getStore(req.params.userId, 'sports');
  const s = { id: uuidv4(), ...req.body, date: req.body.date || new Date().toISOString() };
  sports.push(s);
  setStore(req.params.userId, 'sports', sports);
  res.json(s);
});
app.delete('/api/:userId/sports/:id', (req, res) => {
  let sports = getStore(req.params.userId, 'sports').filter(s => s.id !== req.params.id);
  setStore(req.params.userId, 'sports', sports);
  res.json({ ok: true });
});
app.get('/api/:userId/steps', (req, res) => res.json(getStore(req.params.userId, 'steps')));
app.post('/api/:userId/steps', (req, res) => {
  const steps = getStore(req.params.userId, 'steps');
  const s = { id: uuidv4(), ...req.body, date: req.body.date || new Date().toISOString() };
  steps.push(s);
  setStore(req.params.userId, 'steps', steps);
  res.json(s);
});

// ─── HEALTH ──────────────────────────────────────────────────────────────────
app.get('/api/:userId/health', (req, res) => res.json(getStore(req.params.userId, 'health')));
app.post('/api/:userId/health', (req, res) => {
  const health = getStore(req.params.userId, 'health');
  const h = { id: uuidv4(), ...req.body, date: req.body.date || new Date().toISOString() };
  health.push(h);
  setStore(req.params.userId, 'health', health);
  res.json(h);
});
app.get('/api/:userId/body', (req, res) => res.json(getStore(req.params.userId, 'body')));
app.post('/api/:userId/body', (req, res) => {
  const body = getStore(req.params.userId, 'body');
  const b = { id: uuidv4(), ...req.body, date: req.body.date || new Date().toISOString() };
  body.push(b);
  setStore(req.params.userId, 'body', body);
  res.json(b);
});

// ─── SOCIAL ──────────────────────────────────────────────────────────────────
app.get('/api/social/leaderboard', (req, res) => {
  const users = getUsers().map(u => ({ id: u.id, name: u.name, avatar: u.avatar, tag: u.tag, xp: u.xp || 0, level: u.level || 1 }));
  users.sort((a, b) => b.xp - a.xp);
  res.json(users.slice(0, 20));
});
app.get('/api/:userId/friends', (req, res) => {
  const friends = getObj(req.params.userId, 'friends', { list: [], requests: [] });
  const users = getUsers();
  const enriched = friends.list.map(fid => {
    const u = users.find(u => u.id === fid);
    return u ? { id: u.id, name: u.name, avatar: u.avatar, tag: u.tag, xp: u.xp || 0, level: u.level || 1 } : null;
  }).filter(Boolean);
  res.json({ friends: enriched, requests: friends.requests });
});
app.post('/api/:userId/friends/add', (req, res) => {
  const { tag } = req.body;
  const users = getUsers();
  const target = users.find(u => u.tag === tag);
  if (!target) return res.status(404).json({ error: 'User not found with that tag' });
  if (target.id === req.params.userId) return res.status(400).json({ error: 'Cannot add yourself' });
  const myFriends = getObj(req.params.userId, 'friends', { list: [], requests: [] });
  if (myFriends.list.includes(target.id)) return res.status(400).json({ error: 'Already friends' });
  // Add to both sides for simplicity
  myFriends.list.push(target.id);
  setObj(req.params.userId, 'friends', myFriends);
  const theirFriends = getObj(target.id, 'friends', { list: [], requests: [] });
  if (!theirFriends.list.includes(req.params.userId)) {
    theirFriends.list.push(req.params.userId);
    setObj(target.id, 'friends', theirFriends);
  }
  res.json({ ok: true, user: { id: target.id, name: target.name, avatar: target.avatar, tag: target.tag } });
});

// ─── CHALLENGES ──────────────────────────────────────────────────────────────
app.get('/api/:userId/challenges', (req, res) => res.json(getStore(req.params.userId, 'challenges')));
app.post('/api/:userId/challenges', (req, res) => {
  const chs = getStore(req.params.userId, 'challenges');
  const ch = { id: uuidv4(), ...req.body, progress: 0, createdAt: new Date().toISOString() };
  chs.push(ch);
  setStore(req.params.userId, 'challenges', chs);
  res.json(ch);
});

// ─── AI CHAT ─────────────────────────────────────────────────────────────────
app.get('/api/:userId/ai-chat', (req, res) => res.json(getStore(req.params.userId, 'ai_chat')));
app.post('/api/:userId/ai-chat', (req, res) => {
  const msgs = getStore(req.params.userId, 'ai_chat');
  const msg = { id: uuidv4(), ...req.body, timestamp: new Date().toISOString() };
  msgs.push(msg);
  // Simple AI reply logic
  if (req.body.role === 'user') {
    const assistantName = req.body.assistant || 'Dex';
    const text = req.body.text.toLowerCase();
    let reply = '';
    if (text.includes('task') || text.includes('todo')) reply = `I'll help you manage your tasks! Head to the Daily section to add tasks and track them with streaks.`;
    else if (text.includes('goal')) reply = `Goals are best achieved step by step. Have you tried breaking your goal into milestones in the Life section?`;
    else if (text.includes('study') || text.includes('grade')) reply = `Consistent study sessions are key. Try the Pomodoro timer in the Study section for focused learning!`;
    else if (text.includes('mood') || text.includes('feel')) reply = `Your mental state matters. Track your daily mood in the Daily section — patterns over time are really insightful.`;
    else if (text.includes('sleep')) reply = `Aim for 7–9 hours of quality sleep. You can log tonight's sleep in the Life › Sleep section.`;
    else if (text.includes('food') || text.includes('eat') || text.includes('calorie')) reply = `Track your meals in Life › Food to keep your macros balanced. Protein is especially important!`;
    else if (text.includes('money') || text.includes('budget')) reply = `Set a monthly budget in Life › Money and track every transaction. Small leaks sink big ships!`;
    else if (text.includes('xp') || text.includes('level')) reply = `You earn XP by completing tasks, habits, goals, and workouts. Keep the streak going!`;
    else if (text.includes('hello') || text.includes('hi') || text.includes('hey')) reply = `Hey there! I'm ${assistantName}. Ask me anything about your health, studies, habits, or goals!`;
    else reply = `That's interesting! I'm ${assistantName}, your personal life assistant. I can help you optimize your daily routine, track goals, and stay motivated. What would you like to work on?`;

    const aiReply = { id: uuidv4(), role: 'assistant', assistant: assistantName, text: reply, timestamp: new Date().toISOString() };
    msgs.push(aiReply);
    setStore(req.params.userId, 'ai_chat', msgs);
    return res.json([msg, aiReply]);
  }
  setStore(req.params.userId, 'ai_chat', msgs);
  res.json([msg]);
});

// ─── XP & BADGES ─────────────────────────────────────────────────────────────
app.post('/api/:userId/xp', (req, res) => {
  const { amount, reason } = req.body;
  let users = getUsers();
  const idx = users.findIndex(u => u.id === req.params.userId);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  users[idx].xp = (users[idx].xp || 0) + amount;
  users[idx].level = Math.floor(users[idx].xp / 500) + 1;
  // Check badge unlocks
  const xp = users[idx].xp;
  const badges = users[idx].badges || [];
  const allBadges = [
    { id: 'first_task', name: 'Task Master', icon: '✅', xpReq: 10, desc: 'Complete your first task' },
    { id: 'streak_3', name: 'On Fire', icon: '🔥', xpReq: 100, desc: '3-day streak' },
    { id: 'level_5', name: 'Rising Star', icon: '⭐', xpReq: 2000, desc: 'Reach Level 5' },
    { id: 'study_10h', name: 'Scholar', icon: '📚', xpReq: 500, desc: '10 hours studied' },
    { id: 'budget_guru', name: 'Budget Guru', icon: '💰', xpReq: 300, desc: 'Track 30 transactions' },
    { id: 'fitness', name: 'Athlete', icon: '🏃', xpReq: 400, desc: 'Log 10 workouts' },
  ];
  const newBadges = allBadges.filter(b => xp >= b.xpReq && !badges.find(ub => ub.id === b.id));
  users[idx].badges = [...badges, ...newBadges];
  saveUsers(users);
  res.json({ xp: users[idx].xp, level: users[idx].level, newBadges, badges: users[idx].badges });
});

// ─── SETTINGS ────────────────────────────────────────────────────────────────
app.get('/api/:userId/settings', (req, res) => res.json(getObj(req.params.userId, 'settings', { theme: 'dark', voiceAssistant: true, notifications: true, accentColor: '#1de9ff' })));
app.post('/api/:userId/settings', (req, res) => {
  setObj(req.params.userId, 'settings', req.body);
  res.json(req.body);
});

// ─── EXPORT / IMPORT ─────────────────────────────────────────────────────────
app.get('/api/:userId/export', (req, res) => {
  const keys = ['tasks','habits','mood','journal','money','food','sleep','goals','study_sessions','grades','study_notes','sports','steps','health','body','ai_chat','xp_history'];
  const data = {};
  keys.forEach(k => { data[k] = getStore(req.params.userId, k); });
  data.budget = getObj(req.params.userId, 'budget', {});
  data.settings = getObj(req.params.userId, 'settings', {});
  data.screen_time = getObj(req.params.userId, 'screen_time', { hours: 0, limit: 4 });
  res.json(data);
});
app.post('/api/:userId/import', (req, res) => {
  const keys = ['tasks','habits','mood','journal','money','food','sleep','goals','study_sessions','grades','study_notes','sports','steps','health','body','ai_chat','xp_history'];
  const data = req.body;
  keys.forEach(k => { if (data[k]) setStore(req.params.userId, k, data[k]); });
  if (data.budget) setObj(req.params.userId, 'budget', data.budget);
  if (data.settings) setObj(req.params.userId, 'settings', data.settings);
  if (data.screen_time) setObj(req.params.userId, 'screen_time', data.screen_time);
  res.json({ ok: true });
});

// ─── SCREEN TIME & XP HISTORY ────────────────────────────────────────────────
app.get('/api/:userId/screen-time', (req, res) => res.json(getObj(req.params.userId, 'screen_time', { hours: 0, limit: 4 })));
app.post('/api/:userId/screen-time', (req, res) => {
  setObj(req.params.userId, 'screen_time', req.body);
  res.json(req.body);
});

app.get('/api/:userId/xp-history', (req, res) => res.json(getStore(req.params.userId, 'xp_history')));
app.post('/api/:userId/xp-history', (req, res) => {
  const history = getStore(req.params.userId, 'xp_history');
  const event = { ...req.body, time: req.body.time || new Date().toISOString() };
  history.push(event);
  const trimmed = history.slice(-100);
  setStore(req.params.userId, 'xp_history', trimmed);
  res.json(event);
});

// ─── DAILY CHALLENGE & QUOTES ─────────────────────────────────────────────────
app.get('/api/daily-challenge', (req, res) => {
  const challenges = [
    'Do 20 push-ups today', 'Drink 8 glasses of water', 'Study for 2 hours uninterrupted',
    'No social media before noon', 'Go for a 30-minute walk', 'Write in your journal',
    'Cook a healthy meal', 'Meditate for 10 minutes', 'Call a friend or family member',
    'Read 20 pages of a book'
  ];
  const quotes = [
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
    { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
    { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
    { text: "Push yourself, because no one else is going to do it for you.", author: "Unknown" },
  ];
  const day = new Date().getDate();
  res.json({ challenge: challenges[day % challenges.length], quote: quotes[day % quotes.length] });
});

app.listen(PORT, () => console.log(`🚀 DexTrack Backend running on http://localhost:${PORT}`));
