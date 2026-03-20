import { Award, Bot, CheckCircle2, Flame, Quote, Sparkles, Trophy, BadgeDollarSign, HeartPulse, GraduationCap, ListTodo, Target, Dumbbell } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion'
import { fetchApi } from '../../lib/api.js'
import { todayISO } from '../../lib/date.js'
import { XP, addXp, levelFromXp } from '../../lib/xp.js'
import { useAuth } from '../../providers/AuthProvider.jsx'
import { Badge, Button, Card, Input, ProgressBar, SectionLabel, Skeleton } from '../../ui/components/ui.jsx'
import { EmptyState } from '../../ui/components/EmptyState.jsx'
import { useToast } from '../../ui/components/ToastProvider.jsx'
import { useCountUp } from '../../hooks/useCountUp.js'

function AnimatedMetric({ value, duration = 1000, prefix = "", suffix = "" }) {
  const count = useCountUp(value, duration);
  return <>{prefix}{count}{suffix}</>;
}

const QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
  { text: "Push yourself, because no one else is going to do it for you.", author: "Unknown" },
  { text: "Quality is not an act, it is a habit.", author: "Aristotle" },
  { text: "Well done is better than well said.", author: "Benjamin Franklin" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "Everything you've ever wanted is on the other side of fear.", author: "George Addair" },
  { text: "Hardships often prepare ordinary people for an extraordinary destiny.", author: "C.S. Lewis" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "Discipline is the bridge between goals and accomplishment.", author: "Jim Rohn" },
  { text: "What we achieve inwardly will change outer reality.", author: "Plutarch" },
  { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
  { text: "In the middle of every difficulty lies opportunity.", author: "Albert Einstein" },
  { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
  { text: "Fall seven times and stand up eight.", author: "Japanese Proverb" },
  { text: "We generate fears while we sit. We overcome them by action.", author: "Dr. Henry Link" },
  { text: "Whether you think you can or think you can't, you're right.", author: "Henry Ford" },
  { text: "I find that the harder I work, the more luck I seem to have.", author: "Thomas Jefferson" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "If you are going through hell, keep going.", author: "Winston Churchill" },
  { text: "Do not wait to strike till the iron is hot, but make it hot by striking.", author: "William Butler Yeats" },
  { text: "Great works are performed not by strength but by perseverance.", author: "Samuel Johnson" },
  { text: "Energy and persistence conquer all things.", author: "Benjamin Franklin" },
  { text: "He who has a why to live for can bear almost any how.", author: "Friedrich Nietzsche" },
  { text: "Make each day your masterpiece.", author: "John Wooden" },
  { text: "Change your thoughts and you change your world.", author: "Norman Vincent Peale" }
];

const ALL_BADGES = [
  { id: 'first_task', name: 'First Task', icon: '✅', hint: 'Complete your first task' },
  { id: 'tasks_5', name: '5 Tasks Done', icon: '🏆', hint: 'Complete 5 tasks total' },
  { id: 'tasks_20', name: '20 Tasks Done', icon: '🌟', hint: 'Complete 20 tasks total' },
  { id: 'habit_builder', name: 'Habit Builder', icon: '🔥', hint: 'Complete your first habit' },
  { id: 'streak_3', name: '3 Day Streak', icon: '🔥', hint: 'Maintain a 3-day active streak' },
  { id: 'streak_7', name: '7 Day Streak', icon: '⚡', hint: 'Maintain a 7-day active streak' },
  { id: 'hydrated', name: 'Fully Hydrated', icon: '💧', hint: 'Drink 8 glasses of water in a day' },
  { id: 'food_logger', name: 'Food Logger', icon: '🥗', hint: 'Log all 3 meals' },
  { id: 'athlete', name: 'Athlete', icon: '🏃', hint: 'Log a workout' },
  { id: 'pr_holder', name: 'PR Holder', icon: '🥇', hint: 'Hit a new personal record' },
  { id: 'journaler', name: 'Journaler', icon: '📓', hint: 'Write your first journal entry' },
  { id: 'good_sleeper', name: 'Good Sleeper', icon: '😴', hint: 'Get 8 hours of quality sleep' },
  { id: 'saver', name: 'Saver', icon: '💸', hint: 'Stay under budget for the week' },
  { id: 'goal_chaser', name: 'Goal Chaser', icon: '🎯', hint: 'Complete a major milestone' },
  { id: 'social', name: 'Social Butterfly', icon: '👥', hint: 'Add a friend' },
  { id: 'scholar', name: 'Scholar', icon: '📚', hint: 'Study for 5 hours total' },
  { id: 'level_3', name: 'Level 3', icon: '⭐', hint: 'Reach Level 3' },
  { id: 'level_5', name: 'Level 5', icon: '🌟', hint: 'Reach Level 5' },
];

export function DashboardPage() {
  const { user, profile } = useAuth();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [stats, setStats] = useState(null);
  const [todaysTasksArr, setTodaysTasksArr] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);

  const xp = profile?.xp ?? 0;
  const lev = useMemo(() => levelFromXp(xp), [xp]);
  
  const currentDayOfYear = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
    return Math.floor(diff / 86400000);
  }, []);
  const activeQuote = QUOTES[currentDayOfYear % QUOTES.length];

  useEffect(() => {
    async function loadStats() {
      if (!user?.id) return;
      const today = todayISO();
      const thisMonth = today.slice(0, 7);
      
      const last7Days = Array.from({length: 7}, (_, i) => { 
        const d = new Date(); d.setDate(d.getDate() - i); 
        return d.toISOString().split('T')[0]; 
      }).reverse();
      
      try {
        const [
          tasks, habits, txs, study, mood
        ] = await Promise.all([
          fetchApi(`/api/${user.id}/tasks`).catch(() => []),
          fetchApi(`/api/${user.id}/habits`).catch(() => []),
          fetchApi(`/api/${user.id}/money`).catch(() => []),
          fetchApi(`/api/${user.id}/study-sessions`).catch(() => []),
          fetchApi(`/api/${user.id}/mood`).catch(() => [])
        ]);
        
        const todaysTasks = (tasks || []).filter(t => t.date === today);
        setTodaysTasksArr(todaysTasks);
        
        const tasksDone = todaysTasks.filter(t => t.done)?.length || 0;
        const habitsDone = (habits || [])?.filter(h => h.completedDates?.includes(today))?.length || 0;
        
        const mTx = (txs || [])?.filter(t => t.date?.startsWith(thisMonth)) || [];
        const exp = mTx.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0) || 0;
        
        const todayMood = (mood || [])?.filter(m => m.date?.startsWith(today))?.[0];
        const md = todayMood ? ['Awful', 'Bad', 'Okay', 'Good', 'Great'][todayMood.score - 1] : '—';
        
        const todayStudy = (study || [])?.filter(s => s.date === today) || [];
        const stMins = todayStudy.reduce((a, s) => a + s.duration, 0) || 0;
        
        let weekTasks = 0;
        let weekHabits = 0;
        let weekStudyMins = 0;
        
        const weekData = last7Days.map(dStr => {
           const tCount = (tasks || []).filter(t => t.date === dStr && t.done).length;
           const hCount = (habits || []).filter(h => h.completedDates?.includes(dStr)).length;
           const sMins = (study || []).filter(s => s.date === dStr).reduce((a, s) => a + s.duration, 0);
           const sHrs = parseFloat((sMins / 60).toFixed(1));
           
           weekTasks += tCount;
           weekHabits += hCount;
           weekStudyMins += sMins;
           
           return { name: dStr.slice(5), Tasks: tCount, Habits: hCount, Study: sHrs };
        });
        
        setWeeklyData(weekData);
        
        const score = weekTasks * 2 + weekHabits * 3 + (weekStudyMins / 60) * 5;
        let gradeStr = 'F';
        if (score > 50) gradeStr = 'A';
        else if (score > 35) gradeStr = 'B';
        else if (score > 20) gradeStr = 'C';
        else if (score > 10) gradeStr = 'D';

        setStats({
           tasksDone, habitsDone, studyHrs: (stMins / 60).toFixed(1), exp, mood: md, weekGrade: gradeStr
        });
      } catch(e) { console.error('Stats load failed', e) }
    }
    loadStats();
  }, [user?.id]);

  async function completeChallenge() {
    if (!user?.id) return;
    const key = `dex:challenge:${user.id}:${todayISO()}`;
    if (localStorage.getItem(key)) {
      toast.push({ tone: 'muted', text: 'Already completed today.' });
      return;
    }
    setBusy(true);
    const res = await addXp(user.id, XP.dailyChallenge, 'Completed Daily Challenge');
    setBusy(false);
    if (res.ok) {
      localStorage.setItem(key, '1');
      toast.push({ tone: 'success', text: `+${XP.dailyChallenge} XP` });
      await fetchApi(`/api/auth/user/${user.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ lastActive: todayISO() })
      });
    } else toast.push({ tone: 'danger', text: res.error ?? 'XP update failed' });
  }

  const challengeDone = user?.id ? localStorage.getItem(`dex:challenge:${user.id}:${todayISO()}`) === '1' : false;
  const todayStr = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());

  const badgesLen = user?.badges?.length || profile?.badges?.length || 0;
  const gradeColor = stats?.weekGrade === 'A' || stats?.weekGrade === 'B' 
      ? 'text-success drop-shadow-[0_0_20px_rgba(52,211,153,0.4)]'
      : stats?.weekGrade === 'C' 
      ? 'text-warning drop-shadow-[0_0_20px_rgba(251,146,60,0.4)]'
      : 'text-danger drop-shadow-[0_0_20px_rgba(239,68,68,0.4)]';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  };

  return (
    <div className="pb-24 pt-4 md:pt-6 max-w-[1400px] mx-auto space-y-8 px-4 md:px-8 bg-transparent min-h-screen text-white font-sans">
      
      {/* Top Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <h1 className="text-[28px] font-black text-white tracking-[2px] font-heading drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]">Dashboard</h1>
        <div className="flex items-center gap-4">
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="grid h-10 w-10 place-items-center rounded-2xl bg-white/5 border border-border backdrop-blur-md hover:bg-violet/20 hover:border-violet hover:shadow-glow text-muted transition-all cursor-pointer group"><span className="font-bold text-lg font-heading group-hover:animate-pulseSoft">?</span></motion.button>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="grid h-10 w-10 place-items-center rounded-2xl bg-white/5 border border-border backdrop-blur-md hover:bg-violet/20 hover:border-violet hover:shadow-glow text-muted transition-all cursor-pointer group"><span className="group-hover:animate-targetPulse rounded-full block px-1 py-1">🎤</span></motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }} 
            className="flex items-center gap-2 rounded-2xl bg-white/5 border border-border backdrop-blur-md px-4 h-10 hover:bg-violet/20 hover:border-violet hover:shadow-glow text-muted transition-all cursor-pointer font-bold text-sm tracking-[1px] uppercase group"
          >
            <span className="group-hover:animate-spinSlow">☀️</span> Light
          </motion.button>
        </div>
      </motion.div>

      {/* Daily Challenge Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="flex flex-col sm:flex-row items-center justify-between !rounded-[20px] px-6 py-4 mt-8 w-full border border-border/50 shadow-glow relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-warning/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="text-warning drop-shadow-[0_0_12px_rgba(251,146,60,0.8)] animate-pulseSoft text-xl group-hover:animate-flicker">⚡</div>
            <div className="text-[14px] font-bold tracking-[2px] text-cyan font-heading uppercase drop-shadow-[0_0_8px_rgba(34,211,238,0.3)] flex items-center gap-3">
              DAILY CHALLENGE <span className="font-bold text-white/70 font-ui tracking-normal capitalize text-sm">Log a social interaction</span>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-4 sm:mt-0 relative z-10 w-full sm:w-auto">
            <Badge tone="gold" className="group-hover:animate-bounceSoft">+25 XP</Badge>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                size="sm" 
                onClick={completeChallenge} 
                disabled={busy || challengeDone}
              >
                Done!
              </Button>
            </motion.div>
          </div>
        </Card>
      </motion.div>

      {/* Greeting Row */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center justify-between mt-10"
      >
        <div>
          <h2 className="text-[32px] font-bold text-white tracking-[2px] font-heading drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">Good evening 👋</h2>
          <div className="mt-2 text-sm font-bold text-muted tracking-[2px] uppercase font-heading">{todayStr}</div>
        </div>
        <div className="flex items-center gap-3">
          <Badge tone="gold" className="hover:animate-flicker">🔥 {profile?.streak || 0} DAY STREAK</Badge>
          <Badge tone="online" className="hover:animate-pulseSoft">LV {lev.level}</Badge>
        </div>
      </motion.div>

      {/* 5 Metric Cards Row */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-5 gap-5 mt-8"
      >
        {[
          { label: 'TASKS', val: <AnimatedMetric value={stats?.tasksDone || 0} delay={0} />, sub: 'done today', color: '#22d3ee', delay: 0 },
          { label: 'HABITS', val: <AnimatedMetric value={stats?.habitsDone || 0} delay={100} />, sub: 'completed', color: '#8b5cf6', delay: 100 },
          { label: 'STUDY', val: <AnimatedMetric value={stats?.studyHrs || 0} duration={1000} suffix="h" delay={200} />, sub: 'today', color: '#34d399', delay: 200 },
          { label: 'SPENT', val: <AnimatedMetric value={stats?.exp || 0} prefix="₹" delay={300} />, sub: 'today', color: '#fb923c', delay: 300 },
          { label: 'MOOD', val: stats?.mood || '—', sub: 'today', color: '#f472b6', delay: 400 },
        ].map((m) => (
          <motion.div key={m.label} variants={itemVariants}>
            <Card 
              className="flex flex-col px-6 py-6 border-b-2 transition-all group h-full cursor-default"
              style={{ 
                borderBottomColor: m.color,
              }}
            >
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted font-heading group-hover:text-white transition-colors">{m.label}</div>
              <div 
                className="mt-4 text-[42px] font-black leading-none font-mono"
                style={{ color: m.color, filter: `drop-shadow(0 0 10px ${m.color}80)` }}
              >{m.val}</div>
              <div className="mt-4 text-[10px] font-bold tracking-[1px] uppercase opacity-50 font-heading" style={{ color: m.color }}>{m.sub}</div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Two Equal Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
          <Card className="flex flex-col p-8 border border-border/40 hover:border-border transition-colors h-full">
            <div className="text-muted font-bold tracking-[2px] font-heading text-[11px] mb-6 flex items-center gap-2 drop-shadow-[0_0_8px_rgba(148,163,184,0.3)] uppercase">💬 DAILY QUOTE</div>
            <div className="flex-1 text-lg font-medium italic text-muted leading-relaxed">
              "{activeQuote.text}"
            </div>
            <div className="mt-8 text-[11px] font-black tracking-[2px] text-muted uppercase font-heading">— {activeQuote.author}</div>
          </Card>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
          <Card className="flex flex-col p-8 border border-border/40 hover:border-border transition-colors h-[256px]">
            <div className="text-muted font-bold tracking-[2px] font-heading text-[11px] mb-6 flex items-center gap-2 drop-shadow-[0_0_8px_rgba(148,163,184,0.3)] uppercase">📋 TODAY'S TASKS</div>
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {todaysTasksArr.length > 0 ? (
                <ul className="space-y-4">
                  {todaysTasksArr.map(task => (
                    <motion.li 
                      key={task.id} 
                      whileHover={{ x: 5 }}
                      className="flex items-center gap-3 transition-transform cursor-default group"
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${task.done ? 'bg-cyan border-cyan shadow-glow' : 'border-muted group-hover:border-white'}`}>
                        {task.done && <CheckCircle2 size={12} className="text-bg animate-drawCheck" />}
                      </div>
                      <span className={`text-sm transition-colors ${task.done ? 'text-muted line-through' : 'text-white'}`}>{task.title}</span>
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <div className="flex items-center justify-center h-full font-bold text-muted/50 text-sm tracking-widest font-heading uppercase">
                  No tasks today
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Arena Row */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <Card className="mt-8 p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-32 bg-violet border-none opacity-5 filter blur-[150px] pointer-events-none"></div>
          
          <div className="text-primary font-bold tracking-[2px] font-heading text-[11px] mb-12 flex items-center gap-2 drop-shadow-[0_0_8px_rgba(139,92,246,0.3)] uppercase">🏆 ARENA — YOUR PROGRESS</div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16 w-full max-w-4xl mx-auto border-b border-border/30 pb-16">
            <div className="text-center group cursor-default">
              <div className="text-[64px] font-black text-cyan drop-shadow-[0_0_20px_rgba(34,211,238,0.4)] leading-none font-mono group-hover:scale-105 transition-transform"><AnimatedMetric value={profile?.xp || 0} duration={1500} /></div>
              <div className="mt-4 text-[10px] font-bold uppercase tracking-[2px] text-muted font-heading">TOTAL XP</div>
            </div>
            <div className="text-center group cursor-default">
              <div className="text-[64px] font-black text-gold drop-shadow-[0_0_20px_rgba(251,191,36,0.4)] leading-none font-mono group-hover:animate-shake"><AnimatedMetric value={profile?.streak || 0} duration={1200} /></div>
              <div className="mt-4 text-[10px] font-bold uppercase tracking-[2px] text-muted font-heading">DAY STREAK</div>
            </div>
            <div className="text-center group cursor-default">
              <div className="text-[64px] font-black text-violet drop-shadow-[0_0_20px_rgba(139,92,246,0.4)] leading-none font-mono group-hover:animate-wobble"><AnimatedMetric value={badgesLen} duration={1000} /></div>
              <div className="mt-4 text-[10px] font-bold uppercase tracking-[2px] text-muted font-heading">BADGES</div>
            </div>
            <div className="text-center group cursor-default">
              <div className={`text-[64px] font-black leading-none font-mono group-hover:scale-110 transition-transform ${gradeColor}`}>
                {stats?.weekGrade || '—'}
              </div>
              <div className="mt-4 text-[10px] font-bold uppercase tracking-[2px] text-muted font-heading">WEEK GRADE</div>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-3 lg:px-16 mt-8">
            {ALL_BADGES.map(badge => {
              const earned = user?.badges?.find(b => b.id === badge.id) || profile?.badges?.find(b => b.id === badge.id);
              return (
                <motion.div 
                  key={badge.id} 
                  whileHover={earned ? { y: -5, scale: 1.05 } : {}}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-black tracking-[0.15em] font-heading uppercase transition-all duration-300
                    ${earned 
                      ? 'border-cyan/50 bg-cyan/10 text-cyan shadow-[0_0_15px_rgba(34,211,238,0.2)] hover:shadow-[0_0_25px_rgba(34,211,238,0.5)] cursor-pointer' 
                      : 'border-muted/20 bg-muted/5 text-muted/30 grayscale hover:grayscale-0 hover:border-muted/50 transition-colors'
                    }`}
                  title={badge.hint}
                >
                  <span className="text-sm">{badge.icon}</span>
                  <span>{badge.name}</span>
                </motion.div>
              );
            })}
          </div>
        </Card>
      </motion.div>
      
      {/* Weekly Overview Line Chart */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
        <Card className="mt-8 pb-16 p-8">
           <div className="flex justify-between items-center mb-10">
              <div className="text-muted font-bold tracking-[2px] font-heading text-[11px] flex items-center gap-2 drop-shadow-[0_0_8px_rgba(148,163,184,0.3)] uppercase">📈 WEEKLY OVERVIEW</div>
              <div className="flex items-center gap-6 text-[10px] font-bold text-muted font-heading tracking-[2px] uppercase">
                 <span className="flex items-center gap-2 group cursor-pointer"><div className="w-2.5 h-2.5 rounded-[3px] bg-cyan shadow-[0_0_10px_currentColor] group-hover:scale-125 transition-transform"></div> Tasks</span>
                 <span className="flex items-center gap-2 group cursor-pointer"><div className="w-2.5 h-2.5 rounded-[3px] border border-violet bg-transparent shadow-[0_0_10px_currentColor] group-hover:animate-pulseSoft"></div> Habits</span>
                 <span className="flex items-center gap-2 group cursor-pointer"><div className="w-2.5 h-2.5 rounded-[3px] bg-success shadow-[0_0_10px_currentColor] group-hover:scale-125 transition-transform"></div> Study hrs</span>
              </div>
           </div>
           <div className="w-full h-80 mt-4 px-2">
             {weeklyData.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={weeklyData}>
                   <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                   <XAxis dataKey="name" stroke="#475569" fontSize={11} tickMargin={12} tickLine={false} axisLine={false} />
                   <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} tickMargin={12} allowDecimals={false} />
                   <Tooltip 
                     contentStyle={{ backgroundColor: 'rgba(10, 12, 28, 0.9)', borderColor: 'rgba(139,92,246,0.3)', borderRadius: '12px', backdropFilter: 'blur(24px)', color: '#fff' }} 
                     itemStyle={{ color: '#fff' }} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
                   />
                   <Line type="monotone" dataKey="Tasks" stroke="#22d3ee" strokeWidth={3} dot={{ fill: '#22d3ee', strokeWidth: 0, r: 4 }} activeDot={{ r: 6, fill: '#fff' }} animationDuration={1000} />
                   <Line type="monotone" dataKey="Habits" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', strokeWidth: 0, r: 4 }} activeDot={{ r: 6, fill: '#fff' }} strokeDasharray="4 4" animationDuration={1000} />
                   <Line type="monotone" dataKey="Study" stroke="#34d399" strokeWidth={3} dot={{ fill: '#34d399', strokeWidth: 0, r: 4 }} activeDot={{ r: 6, fill: '#fff' }} animationDuration={1000} />
                 </LineChart>
               </ResponsiveContainer>
             ) : (
               <Skeleton className="w-full h-full rounded-2xl" />
             )}
           </div>
        </Card>
      </motion.div>
    </div>
  )
}
