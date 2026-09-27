import { useState } from 'react'
import { Activity, LayoutDashboard, Utensils, Cloud, UploadCloud, LogOut, CheckCircle, Flame, Droplets, Target } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const API_URL = "http://localhost:8000"
// Modern vibrant gradient colors for the chart
const COLORS = ['#6366f1', '#14b8a6', '#f59e0b']; 

export default function App() {
  const [user, setUser] = useState(null)
  const [view, setView] = useState('login') 
  
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [name, setName] = useState('')
  const [age, setAge] = useState('24'); const [weight, setWeight] = useState('75'); const [height, setHeight] = useState('182')
  const [goal, setGoal] = useState('muscle gain'); const [diet, setDiet] = useState('omnivore')
  
  const [plan, setPlan] = useState(null); const [loading, setLoading] = useState(false); const [files, setFiles] = useState([])

  const bmi = (weight / ((height / 100) * (height / 100))).toFixed(1)
  const tdee = Math.round((10 * weight + 6.25 * height - 5 * age + 5) * 1.55) 

  const handleAuth = async (isLogin, e) => {
    e.preventDefault()
    const formData = new FormData(); formData.append('email', email); formData.append('password', password); 
    if(!isLogin) formData.append('name', name)
    
    const res = await fetch(`${API_URL}/${isLogin ? 'login' : 'register'}`, { method: 'POST', body: formData })
    if(res.ok) {
      if(isLogin) {
        const data = await res.json(); setUser(data); setView('dashboard')
      } else alert("Registered! Now login.")
    } else alert("Authentication failed.")
  }

  const generatePlan = async (e) => {
    e.preventDefault(); setLoading(true)
    const formData = new FormData()
    formData.append('user_id', user.user_id); formData.append('age', age); formData.append('weight', weight); 
    formData.append('height', height); formData.append('goal', goal); formData.append('diet', diet);
    
    const res = await fetch(`${API_URL}/generate-plan`, { method: 'POST', body: formData })
    const data = await res.json(); setPlan(data); setLoading(false); setView('dashboard')
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]; if(!file) return
    const formData = new FormData(); formData.append('file', file)
    const res = await fetch(`${API_URL}/upload`, { method: 'POST', body: formData })
    if(res.ok) {
      setFiles([...files, { name: file.name, size: (file.size/1024).toFixed(1) + ' KB', date: new Date().toLocaleDateString() }])
    }
  }

  // --- LOGIN VIEW ---
  if (view === 'login') {
    return (
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100 via-slate-50 to-cyan-100 flex items-center justify-center p-4">
        <div className="bg-white/60 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full max-w-md border border-white/50 relative overflow-hidden">
          <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-blue-400/20 rounded-full blur-3xl"></div>
          <div className="flex justify-center items-center gap-3 mb-8 text-indigo-900 font-black text-3xl tracking-tight relative z-10">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-2xl shadow-lg shadow-indigo-200">
              <Cloud size={28} className="text-white" />
            </div>
            NutriCloud
          </div>
          <form className="flex flex-col gap-4 relative z-10">
            <input className="border border-white/40 bg-white/50 backdrop-blur-sm p-4 rounded-2xl focus:ring-2 focus:ring-indigo-400 outline-none transition placeholder-slate-400" placeholder="Full Name (for register)" value={name} onChange={e=>setName(e.target.value)} />
            <input className="border border-white/40 bg-white/50 backdrop-blur-sm p-4 rounded-2xl focus:ring-2 focus:ring-indigo-400 outline-none transition placeholder-slate-400" placeholder="Email Address" type="email" value={email} onChange={e=>setEmail(e.target.value)} />
            <input className="border border-white/40 bg-white/50 backdrop-blur-sm p-4 rounded-2xl focus:ring-2 focus:ring-indigo-400 outline-none transition placeholder-slate-400" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
            <div className="flex gap-3 mt-4">
              <button onClick={(e) => handleAuth(true, e)} className="bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white p-4 rounded-2xl flex-1 font-bold transition shadow-lg shadow-indigo-200">Sign In</button>
              <button onClick={(e) => handleAuth(false, e)} className="bg-white/80 hover:bg-white text-indigo-900 p-4 rounded-2xl flex-1 font-bold transition border border-white shadow-sm">Register</button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // --- DASHBOARD VIEW ---
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-indigo-50 via-slate-50 to-cyan-50 flex text-slate-800 font-sans">
      
      {/* Glass Sidebar */}
      <div className="w-72 bg-white/40 backdrop-blur-2xl border-r border-white/60 p-6 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20">
        <div className="flex items-center gap-3 text-indigo-950 font-black text-2xl mb-12 px-2">
          <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-xl shadow-md shadow-indigo-200">
            <Cloud size={24} className="text-white" />
          </div>
          NutriCloud
        </div>
        <nav className="flex flex-col gap-3 flex-1">
          <button onClick={() => setView('dashboard')} className={`flex items-center gap-3 p-3.5 rounded-2xl font-semibold transition-all ${view === 'dashboard' ? 'bg-white shadow-sm border border-white/80 text-indigo-700' : 'text-slate-500 hover:bg-white/50'}`}><LayoutDashboard size={20}/> Dashboard</button>
          <button onClick={() => setView('planner')} className={`flex items-center gap-3 p-3.5 rounded-2xl font-semibold transition-all ${view === 'planner' ? 'bg-white shadow-sm border border-white/80 text-indigo-700' : 'text-slate-500 hover:bg-white/50'}`}><Utensils size={20}/> AI Generation</button>
          <button onClick={() => setView('cloud')} className={`flex items-center gap-3 p-3.5 rounded-2xl font-semibold transition-all ${view === 'cloud' ? 'bg-white shadow-sm border border-white/80 text-indigo-700' : 'text-slate-500 hover:bg-white/50'}`}><UploadCloud size={20}/> Cloud Vault</button>
        </nav>
        <button onClick={()=>{setUser(null); setView('login')}} className="flex items-center gap-3 p-4 rounded-2xl font-semibold text-slate-500 hover:bg-red-50/80 hover:text-red-600 transition-all"><LogOut size={20}/> Disconnect</button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-10 overflow-y-auto relative z-10">
        <header className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Welcome back, {user.name.split(' ')[0]}</h1>
            <p className="text-slate-500 mt-2 font-medium">Your personalized AI nutrition metrics are updated.</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-400 to-cyan-400 border-4 border-white shadow-md flex items-center justify-center text-white font-bold text-lg">
            {user.name.charAt(0)}
          </div>
        </header>

        {view === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Vitals Glass Card */}
            <div className="bg-white/60 backdrop-blur-xl p-6 rounded-3xl shadow-sm border border-white/60 flex flex-col justify-between hover:shadow-md transition">
              <h3 className="text-slate-500 font-semibold mb-6 flex items-center gap-2 uppercase tracking-wider text-xs"><Activity size={16} className="text-indigo-500"/> Health Vitals</h3>
              <div className="space-y-4">
                <div className="bg-white/80 p-5 rounded-2xl border border-white shadow-sm flex justify-between items-center">
                  <div>
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Current BMI</div>
                    <div className="text-3xl font-black text-slate-800">{bmi}</div>
                  </div>
                  <Target size={32} className="text-cyan-400 opacity-50"/>
                </div>
                <div className="bg-gradient-to-br from-indigo-600 to-blue-500 p-5 rounded-2xl shadow-lg shadow-indigo-200 flex justify-between items-center text-white">
                  <div>
                    <div className="text-xs text-indigo-100 font-bold uppercase tracking-wider mb-1">Target TDEE</div>
                    <div className="text-3xl font-black">{tdee} <span className="text-sm font-medium opacity-80">kcal</span></div>
                  </div>
                  <Flame size={32} className="text-indigo-200 opacity-80"/>
                </div>
              </div>
            </div>

            {/* AI Plan Card */}
            <div className="bg-white/60 backdrop-blur-xl p-6 rounded-3xl shadow-sm border border-white/60 lg:col-span-2 hover:shadow-md transition">
              <h3 className="text-slate-500 font-semibold mb-6 uppercase tracking-wider text-xs">Today's Smart Meal Plan</h3>
              {plan ? (
                <div className="grid grid-cols-2 gap-4 h-[calc(100%-2.5rem)]">
                  <div className="space-y-4">
                    <div className="p-5 bg-white/80 border border-indigo-50 rounded-2xl shadow-sm relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                      <span className="font-bold text-indigo-900 text-sm block mb-1">Breakfast</span>
                      <span className="text-slate-600 text-sm leading-relaxed">{plan.breakfast}</span>
                    </div>
                    <div className="p-5 bg-white/80 border border-teal-50 rounded-2xl shadow-sm relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-1 h-full bg-teal-500"></div>
                      <span className="font-bold text-teal-900 text-sm block mb-1">Lunch</span>
                      <span className="text-slate-600 text-sm leading-relaxed">{plan.lunch}</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="p-5 bg-white/80 border border-amber-50 rounded-2xl shadow-sm relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
                      <span className="font-bold text-amber-900 text-sm block mb-1">Snack</span>
                      <span className="text-slate-600 text-sm leading-relaxed">{plan.snack}</span>
                    </div>
                    <div className="p-5 bg-white/80 border border-purple-50 rounded-2xl shadow-sm relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                      <span className="font-bold text-purple-900 text-sm block mb-1">Dinner</span>
                      <span className="text-slate-600 text-sm leading-relaxed">{plan.dinner}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-48 flex flex-col items-center justify-center border-2 border-dashed border-slate-300/50 rounded-2xl text-slate-400 bg-white/30">
                  <Utensils size={32} className="mb-2 opacity-50"/>
                  <span className="font-medium">No active plan. Generate one via AI.</span>
                </div>
              )}
            </div>

            {/* Detailed Macro Chart */}
            {plan && plan.macros && (
               <div className="bg-white/60 backdrop-blur-xl p-8 rounded-3xl shadow-sm border border-white/60 lg:col-span-3 flex items-center hover:shadow-md transition">
                 <div className="w-1/3 pr-6">
                   <h3 className="font-black text-2xl text-slate-800 mb-2">Macro Synthesis</h3>
                   <p className="text-slate-500 text-sm mb-6 leading-relaxed">AI-optimized nutrient distribution based on your {goal} parameters.</p>
                   <div className="space-y-3">
                     {plan.macros.map((m, i) => (
                       <div key={m.name} className="flex items-center justify-between p-3 bg-white/80 rounded-xl border border-slate-100 shadow-sm">
                         <div className="flex items-center gap-3 font-semibold text-sm">
                           <div className="w-3.5 h-3.5 rounded-full shadow-sm" style={{backgroundColor: COLORS[i]}}></div> {m.name}
                         </div>
                         <div className="font-black text-slate-700">{m.value}%</div>
                       </div>
                     ))}
                   </div>
                 </div>
                 <div className="w-2/3 h-80 relative">
                   <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                       <Pie data={plan.macros} cx="50%" cy="50%" innerRadius={90} outerRadius={130} paddingAngle={8} dataKey="value" stroke="none" cornerRadius={6}>
                         {plan.macros.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                       </Pie>
                       <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                     </PieChart>
                   </ResponsiveContainer>
                   <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                     <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Total</span>
                     <span className="text-3xl font-black text-slate-800">{tdee}</span>
                     <span className="text-xs text-slate-500">kcal/day</span>
                   </div>
                 </div>
               </div>
            )}
          </div>
        )}

        {/* --- PLANNER VIEW --- */}
        {view === 'planner' && (
          <div className="bg-white/60 backdrop-blur-xl p-10 rounded-3xl shadow-lg border border-white/60 max-w-2xl mx-auto relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none"></div>
            <h2 className="text-3xl font-black mb-2 text-slate-800">Configure AI Engine</h2>
            <p className="text-slate-500 mb-8 font-medium">Input your biometric data to generate a cloud-synced nutritional protocol.</p>
            
            <form onSubmit={generatePlan} className="space-y-6 relative z-10">
              <div className="grid grid-cols-3 gap-5">
                <div className="bg-white/70 p-2 rounded-2xl border border-white"><label className="px-2 text-xs font-bold text-indigo-900 uppercase tracking-wider mb-1 block">Age</label><input className="w-full bg-transparent p-2 text-lg font-bold text-slate-700 outline-none" type="number" value={age} onChange={e=>setAge(e.target.value)} required/></div>
                <div className="bg-white/70 p-2 rounded-2xl border border-white"><label className="px-2 text-xs font-bold text-indigo-900 uppercase tracking-wider mb-1 block">Weight (kg)</label><input className="w-full bg-transparent p-2 text-lg font-bold text-slate-700 outline-none" type="number" value={weight} onChange={e=>setWeight(e.target.value)} required/></div>
                <div className="bg-white/70 p-2 rounded-2xl border border-white"><label className="px-2 text-xs font-bold text-indigo-900 uppercase tracking-wider mb-1 block">Height (cm)</label><input className="w-full bg-transparent p-2 text-lg font-bold text-slate-700 outline-none" type="number" value={height} onChange={e=>setHeight(e.target.value)} required/></div>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div className="bg-white/70 p-2 rounded-2xl border border-white">
                  <label className="px-2 text-xs font-bold text-indigo-900 uppercase tracking-wider mb-1 block">Fitness Goal</label>
                  <select className="w-full bg-transparent p-2 font-semibold text-slate-700 outline-none cursor-pointer" value={goal} onChange={e=>setGoal(e.target.value)}>
                    <option value="weight loss">Weight Loss</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="muscle gain">Muscle Gain</option>
                  </select>
                </div>
                <div className="bg-white/70 p-2 rounded-2xl border border-white">
                  <label className="px-2 text-xs font-bold text-indigo-900 uppercase tracking-wider mb-1 block">Diet Preference</label>
                  <select className="w-full bg-transparent p-2 font-semibold text-slate-700 outline-none cursor-pointer" value={diet} onChange={e=>setDiet(e.target.value)}>
                    <option value="omnivore">Omnivore</option>
                    <option value="vegan">Vegan</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="keto">Keto</option>
                  </select>
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-blue-500 text-white p-5 rounded-2xl font-black text-lg hover:from-indigo-700 hover:to-blue-600 transition-all shadow-xl shadow-indigo-200/50 flex items-center justify-center gap-2">
                {loading ? "Initializing Cloud AI Models..." : "Generate Cloud Diet Plan"}
              </button>
            </form>
          </div>
        )}

        {/* --- CLOUD VIEW --- */}
        {view === 'cloud' && (
          <div className="bg-white/60 backdrop-blur-xl p-10 rounded-3xl shadow-lg border border-white/60 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-black text-slate-800">Secure Vault</h2>
                <p className="text-slate-500 font-medium mt-1">Object storage simulation for biometric documents.</p>
              </div>
              <label className="cursor-pointer bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-800 transition flex items-center gap-2 shadow-lg">
                <UploadCloud size={20}/> Upload Object
                <input type="file" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>
            
            <div className="bg-white/80 rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="p-5 font-bold text-slate-500 uppercase tracking-wider text-xs">File Identity</th>
                    <th className="p-5 font-bold text-slate-500 uppercase tracking-wider text-xs">Size</th>
                    <th className="p-5 font-bold text-slate-500 uppercase tracking-wider text-xs">Timestamp</th>
                    <th className="p-5 font-bold text-slate-500 uppercase tracking-wider text-xs">Sync Status</th>
                  </tr>
                </thead>
                <tbody>
                  {files.length === 0 ? (
                    <tr><td colSpan="4" className="p-12 text-center text-slate-400 font-medium">No objects present in the storage bucket.</td></tr>
                  ) : (
                    files.map((f, i) => (
                      <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-indigo-50/30 transition-colors">
                        <td className="p-5 font-bold text-indigo-600 flex items-center gap-3"><div className="p-2 bg-indigo-100 rounded-lg text-indigo-500"><Droplets size={16}/></div> {f.name}</td>
                        <td className="p-5 text-slate-600 font-medium">{f.size}</td>
                        <td className="p-5 text-slate-600 font-medium">{f.date}</td>
                        <td className="p-5">
                          <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                            <CheckCircle size={14}/> Verified
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}