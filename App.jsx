import React, { useState, useEffect, useRef } from 'react';
import { 
  Check, CheckCircle, Copy, ChevronDown, ChevronRight, Play, 
  FileText, Settings, Lock, Search, Filter, Plus, 
  MoreHorizontal, Link2, BookOpen, Dumbbell, Utensils, Briefcase 
} from 'lucide-react';

// --- STYLES & ANIMATIONS ---
const customStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

  :root {
    --bg-main: #191919;
    --text-main: #D4D4D4;
    --text-muted: #8C8C8C;
    --border-color: #2E2E2E;
    --hover-bg: #2C2C2C;
    --accent-purple: #4A2B3D;
    --accent-purple-text: #E8D4E1;
  }

  body {
    background-color: var(--bg-main);
    color: var(--text-main);
    font-family: 'Inter', sans-serif;
    overflow-x: hidden;
    cursor: none; /* Hide default cursor for custom cursor */
  }

  /* Custom Cursor */
  .custom-cursor {
    position: fixed;
    top: 0;
    left: 0;
    width: 20px;
    height: 20px;
    border: 2px solid rgba(255, 255, 255, 0.5);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
    z-index: 9999;
    transition: width 0.2s, height 0.2s, background-color 0.2s;
    mix-blend-mode: difference;
  }
  
  .custom-cursor.hovering {
    width: 40px;
    height: 40px;
    background-color: rgba(255, 255, 255, 0.1);
  }

  /* Animations */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .animate-fade-up {
    animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    opacity: 0;
  }

  .delay-100 { animation-delay: 100ms; }
  .delay-200 { animation-delay: 200ms; }
  .delay-300 { animation-delay: 300ms; }

  /* Scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
  }
  ::-webkit-scrollbar-track {
    background: transparent;
  }
  ::-webkit-scrollbar-thumb {
    background: #444;
    border-radius: 4px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: #666;
  }

  /* Content Editable Placeholder */
  [contenteditable]:empty:before {
    content: attr(data-placeholder);
    color: var(--text-muted);
    pointer-events: none;
    display: block; /* For Firefox */
  }
  
  /* Smooth Image Hover */
  .img-hover-zoom {
    transition: transform 0.5s ease;
  }
  .card-group:hover .img-hover-zoom {
    transform: scale(1.05);
  }
`;

// --- COMPONENTS ---

// 1. Clock Component (Flip Clock Style Approximation)
const FlipClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    let h = date.getHours();
    const m = date.getMinutes().toString().padStart(2, '0');
    const s = date.getSeconds().toString().padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return { h: h.toString().padStart(2, '0'), m, s, ampm };
  };

  const { h, m, s, ampm } = formatTime(time);
  
  const FlipUnit = ({ val }) => (
    <div className="relative bg-[#F3F3F3] text-black font-bold text-4xl sm:text-5xl rounded-md w-16 sm:w-20 h-20 sm:h-24 flex items-center justify-center shadow-lg overflow-hidden group">
      <div className="absolute top-0 w-full h-1/2 bg-black/5 border-b border-black/10 z-10"></div>
      <span className="z-0 tracking-tighter">{val}</span>
      {/* Subtle shine effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    </div>
  );

  return (
    <div className="flex items-center gap-2 justify-center my-6">
      <FlipUnit val={h} />
      <span className="text-3xl font-bold text-white/50 animate-pulse">:</span>
      <FlipUnit val={m} />
      <span className="text-3xl font-bold text-white/50 animate-pulse">:</span>
      <div className="relative flex items-end">
        <FlipUnit val={s} />
        <div className="absolute -right-12 bottom-2 bg-[#F3F3F3] text-black font-bold px-2 py-1 rounded text-sm shadow">
          {ampm}
        </div>
      </div>
    </div>
  );
};

// 2. Tab / Page View (For Memos, Resources, Dashboard Items)
const EditorTab = ({ title, onBack }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="max-w-3xl mx-auto min-h-screen px-4 py-12 animate-fade-up">
      <button 
        onClick={onBack}
        className="group flex items-center gap-2 text-[#8C8C8C] hover:text-white transition-colors mb-8 px-3 py-1.5 rounded-md hover:bg-[#2C2C2C]"
      >
        <ChevronDown className="w-4 h-4 rotate-90 group-hover:-translate-x-1 transition-transform" />
        Kembali ke Beranda
      </button>
      
      <h1 className="text-4xl font-bold text-white mb-6 outline-none" contentEditable suppressContentEditableWarning>
        {title}
      </h1>
      
      <div 
        className="w-full text-[#D4D4D4] outline-none min-h-[300px] text-lg leading-relaxed"
        contentEditable
        suppressContentEditableWarning
        data-placeholder="Ketik sesuatu di sini sesuka hati... (Mendukung formatting Notion style)"
      ></div>
    </div>
  );
};

// --- MAIN APP ---
export default function App() {
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'memos', 'resources', or dashboard item IDs
  const [isHovering, setIsHovering] = useState(false);
  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  // Custom Cursor Effect
  useEffect(() => {
    const cursor = document.getElementById('custom-cursor');
    const moveCursor = (e) => {
      if(cursor) {
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;
      }
    };
    
    const handleMouseOver = (e) => {
      const target = e.target;
      if (target.tagName.toLowerCase() === 'button' || 
          target.tagName.toLowerCase() === 'a' || 
          target.closest('button') || 
          target.closest('.interactive-element')) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', handleMouseOver);
    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  const copyToClipboard = () => {
    // In iframe environments, standard clipboard API might fail, so we simulate
    const dummy = document.createElement("input");
    document.body.appendChild(dummy);
    dummy.setAttribute("id", "dummy_id");
    document.getElementById("dummy_id").value = "https://tensura.fandom.com/wiki/Yuuki_Kagurazaka";
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
    // Visual feedback could be added here
  };

  const tasks = [
    "Finish this template",
    "Finish all 3 units of homework",
    "50 pushups",
    "Write down the goals in each Page",
    "Study full 1 hour",
    "Try a new dessert recipe"
  ];

  const dashboardCards = [
    { id: 'anti-skill', title: '『Anti-Skill』', icon: <CheckCircle className="w-5 h-5 text-blue-500 bg-white rounded-full" />, image: 'https://images.unsplash.com/photo-1614729939124-03290b56c9ce?q=80&w=800&auto=format&fit=crop' },
    { id: 'academics', title: 'Academics', icon: <BookOpen className="w-5 h-5 text-gray-400" />, image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=800&auto=format&fit=crop' },
    { id: 'exercise', title: 'Exercise', icon: <Dumbbell className="w-5 h-5 text-gray-400" />, image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=800&auto=format&fit=crop' },
    { id: 'recipe', title: 'Recipe', icon: <Utensils className="w-5 h-5 text-gray-400" />, image: 'https://images.unsplash.com/photo-1495474472207-464ba5231c28?q=80&w=800&auto=format&fit=crop' },
    { id: 'fashion', title: 'Fashion & Bags', icon: <Briefcase className="w-5 h-5 text-gray-400" />, image: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=800&auto=format&fit=crop' },
  ];

  if (activeTab !== 'home') {
    let tabTitle = activeTab.charAt(0).toUpperCase() + activeTab.slice(1);
    const card = dashboardCards.find(c => c.id === activeTab);
    if (card) tabTitle = card.title;
    
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: customStyles }} />
        <div id="custom-cursor" className={`custom-cursor hidden md:block ${isHovering ? 'hovering' : ''}`}></div>
        <EditorTab title={tabTitle} onBack={() => setActiveTab('home')} />
      </>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#191919]">
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      <div id="custom-cursor" className={`custom-cursor hidden md:block ${isHovering ? 'hovering' : ''}`}></div>

      {/* Top Navbar Simulation */}
      <nav className="sticky top-0 z-40 bg-[#191919]/80 backdrop-blur-md border-b border-[#2E2E2E] px-4 py-3 flex items-center justify-between animate-fade-up">
        <div className="flex items-center gap-4 text-sm text-[#D4D4D4]">
           <button className="p-1 hover:bg-[#2C2C2C] rounded transition-colors interactive-element">
             <div className="w-4 h-0.5 bg-current mb-1"></div>
             <div className="w-4 h-0.5 bg-current mb-1"></div>
             <div className="w-4 h-0.5 bg-current"></div>
           </button>
           <div className="flex items-center gap-2 cursor-pointer interactive-element hover:bg-[#2C2C2C] px-2 py-1 rounded">
              <span className="font-medium">Darr - Yuuki</span>
           </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-[#8C8C8C] hover:text-white interactive-element transition-colors"><MoreHorizontal className="w-5 h-5" /></button>
        </div>
      </nav>

      <main className="pb-32">
        {/* Cover Section */}
        <div className="relative h-64 sm:h-80 w-full overflow-hidden group animate-fade-up">
          <img 
            src="https://images.unsplash.com/photo-1618331835717-801e976710b2?q=80&w=2000&auto=format&fit=crop" 
            alt="Cover" 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#191919]/90"></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-8 xl:px-0 -mt-24 relative z-10">
          
          {/* Avatar */}
          <div className="animate-fade-up delay-100">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-xl overflow-hidden border-4 border-[#191919] shadow-2xl relative group interactive-element">
              <img 
                src="https://images.unsplash.com/photo-1560972550-aba3456b5564?q=80&w=400&auto=format&fit=crop" 
                alt="Yuuki Kagurazaka" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-xs font-medium bg-black/50 px-2 py-1 rounded-full">Ganti Ikon</span>
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl font-bold mt-6 mb-8 text-white tracking-tight animate-fade-up delay-100" contentEditable suppressContentEditableWarning>
            Yuuki Kagurazaka
          </h1>

          {/* Properties Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 max-w-2xl mb-12 animate-fade-up delay-200">
            
            {/* Pemilik */}
            <div className="flex items-center text-sm">
              <span className="w-32 text-[#8C8C8C]">Pemilik</span>
              <div className="flex items-center gap-2 text-[#D4D4D4] hover:bg-[#2C2C2C] px-2 py-1 rounded cursor-pointer interactive-element transition-colors">
                <div className="w-5 h-5 rounded-full bg-[#3D3D3D] flex items-center justify-center text-xs font-medium border border-[#444]">D</div>
                <span>Darr</span>
              </div>
            </div>

            {/* Verifikasi */}
            <div className="flex items-center text-sm">
              <span className="w-32 text-[#8C8C8C]">Verifikasi</span>
              <div className="flex items-center gap-2 text-[#D4D4D4] px-2 py-1">
                <CheckCircle className="w-4 h-4 text-blue-500 fill-blue-500/20" />
                <span>Terverifikasi</span>
              </div>
            </div>

            {/* Tag */}
            <div className="flex items-center text-sm">
              <span className="w-32 text-[#8C8C8C]">Tag</span>
              <div className="px-2 py-1">
                <span className="bg-[#594A26] text-[#E5C77A] px-2 py-0.5 rounded text-xs font-medium shadow-sm">
                  Battleboarding
                </span>
              </div>
            </div>

            {/* Wiki character */}
            <div className="flex items-center text-sm group">
              <span className="w-32 text-[#8C8C8C]">Wiki character</span>
              <div className="flex items-center justify-between flex-1 gap-2 border-b border-transparent hover:border-[#444] pb-0.5 transition-colors">
                <a href="https://tensura.fandom.com/wiki/Yuuki_Kagurazaka" target="_blank" rel="noreferrer" className="text-[#D4D4D4] hover:text-white truncate interactive-element underline decoration-[#444] underline-offset-4">
                  tensura.fandom.com/wiki/Yuuki...
                </a>
                <button onClick={copyToClipboard} className="text-[#8C8C8C] hover:text-white p-1 hover:bg-[#2C2C2C] rounded transition-colors interactive-element opacity-0 group-hover:opacity-100">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Expander */}
            <div className="col-span-full mt-2">
              <button className="flex items-center gap-1 text-[#8C8C8C] hover:text-[#D4D4D4] text-sm interactive-element transition-colors">
                <ChevronDown className="w-4 h-4" />
                1 lebih banyak properti
              </button>
            </div>
          </div>

          <div className="w-full h-px bg-[#2E2E2E] my-8 animate-fade-up delay-200"></div>

          {/* Summary Section */}
          <div className="mb-16 animate-fade-up delay-200">
            <h2 className="text-xl font-semibold text-white mb-4">Summary</h2>
            <p className="text-[#D4D4D4] text-lg leading-relaxed outline-none" contentEditable suppressContentEditableWarning>
              Yuuki Kagurazaka ialah salah satu antagonis utama dalam serial Tensura.
            </p>
          </div>

          {/* Widgets & Tasks Area */}
          <div className="max-w-2xl mx-auto space-y-8 animate-fade-up delay-300">
            
            {/* Clock Widget */}
            <div className="flex flex-col items-center justify-center mb-10">
              <FlipClock />
              <div className="flex items-center gap-2 text-sm text-white font-medium tracking-wide mt-2">
                <img src="https://logo.clearbit.com/notion.so" alt="indify" className="w-4 h-4 grayscale opacity-50 hidden" /> {/* Hidden to remove brand */}
                <span>{dateStr.split(', ')[0]} <span className="text-[#8C8C8C]">|</span> {dateStr.split(', ').slice(1).join(', ')}</span>
              </div>
            </div>

            {/* Routines Toggle */}
            <div className="space-y-2">
              <div className="bg-[#4A2B3D] text-[#E8D4E1] px-4 py-2 flex items-center gap-2 cursor-pointer hover:bg-[#5a3449] transition-colors rounded-sm interactive-element">
                <Play className="w-3 h-3 fill-current" />
                <span className="font-semibold tracking-wider text-sm uppercase">Morning Routine</span>
              </div>
              <div className="bg-[#4A2B3D] text-[#E8D4E1] px-4 py-2 flex items-center gap-2 cursor-pointer hover:bg-[#5a3449] transition-colors rounded-sm interactive-element">
                <Play className="w-3 h-3 fill-current" />
                <span className="font-semibold tracking-wider text-sm uppercase">Evening Routine</span>
              </div>
            </div>

            {/* Action Buttons (Tabs) */}
            <div className="flex items-center gap-3">
              <button onClick={() => setActiveTab('memos')} className="flex items-center gap-2 bg-[#2C2C2C] hover:bg-[#383838] px-3 py-1.5 rounded-md text-sm border border-[#3D3D3D] interactive-element transition-all">
                <FileText className="w-4 h-4" /> Memos
              </button>
              <button className="text-[#8C8C8C] hover:text-white interactive-element transition-colors"><Settings className="w-4 h-4" /></button>
              
              <button onClick={() => setActiveTab('resources')} className="flex items-center gap-2 bg-[#2C2C2C] hover:bg-[#383838] px-3 py-1.5 rounded-md text-sm border border-[#3D3D3D] interactive-element transition-all ml-4">
                <Lock className="w-4 h-4" /> Resources
              </button>
              <button className="text-[#8C8C8C] hover:text-white interactive-element transition-colors"><Settings className="w-4 h-4" /></button>
            </div>

            {/* Today's Tasks */}
            <div className="mt-8">
              <div className="bg-[#4A2B3D] text-[#E8D4E1] px-4 py-2 font-semibold text-lg tracking-wide rounded-sm mb-4">
                Today's Tasks
              </div>
              <div className="space-y-3 px-2">
                {tasks.map((task, idx) => (
                  <label key={idx} className="flex items-start gap-3 cursor-pointer group interactive-element">
                    <div className="relative flex items-center justify-center mt-1">
                      <input type="checkbox" className="peer appearance-none w-5 h-5 border-2 border-[#555] rounded-sm bg-transparent checked:bg-[#D4D4D4] checked:border-[#D4D4D4] transition-all cursor-pointer" />
                      <Check className="absolute w-3 h-3 text-[#191919] opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                    </div>
                    <span className="text-[#D4D4D4] text-[17px] group-hover:text-white transition-colors peer-checked:line-through peer-checked:text-[#8C8C8C] outline-none" contentEditable suppressContentEditableWarning>
                      {task}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Links Box */}
            <div className="bg-[#4A2B3D]/30 border border-[#4A2B3D]/50 rounded-lg p-6 mt-8 flex flex-col gap-4 relative overflow-hidden group">
              {/* Premium gradient shine */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full duration-1000 transition-transform pointer-events-none"></div>
              
              {['spotify.com', 'youtube.com', 'gmail.com', 'discord.com'].map((link, idx) => (
                <a key={idx} href={`https://${link}`} target="_blank" rel="noreferrer" className="text-[#E8D4E1] text-[17px] hover:underline decoration-white/30 underline-offset-4 interactive-element w-max">
                  {link}
                </a>
              ))}
            </div>

          </div>

          <div className="w-full h-px bg-[#2E2E2E] my-16 animate-fade-up delay-300"></div>

          {/* Dashboard Section */}
          <div className="max-w-3xl mx-auto pb-20 animate-fade-up delay-300">
            
            {/* Dashboard Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 cursor-pointer hover:bg-[#2C2C2C] px-2 py-1 rounded-md transition-colors interactive-element">
                <span className="text-xl font-semibold text-white">♡ My Dashboard</span>
                <ChevronDown className="w-5 h-5 text-[#8C8C8C]" />
              </div>
              <div className="flex items-center gap-2">
                <button className="p-1.5 text-[#8C8C8C] hover:text-white hover:bg-[#2C2C2C] rounded transition-colors interactive-element"><Search className="w-4 h-4" /></button>
                <button className="p-1.5 text-[#8C8C8C] hover:text-white hover:bg-[#2C2C2C] rounded transition-colors interactive-element"><Filter className="w-4 h-4" /></button>
                <div className="flex items-center ml-2 bg-blue-600 hover:bg-blue-700 transition-colors rounded-md interactive-element cursor-pointer shadow-lg shadow-blue-900/20">
                  <div className="px-3 py-1.5 border-r border-blue-700">
                    <Plus className="w-4 h-4 text-white" />
                  </div>
                  <div className="px-2 py-1.5">
                    <ChevronDown className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {dashboardCards.map((card) => (
                <div 
                  key={card.id} 
                  onClick={() => setActiveTab(card.id)}
                  className="card-group bg-[#202020] border border-[#2E2E2E] rounded-xl overflow-hidden cursor-pointer hover:border-[#555] transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 interactive-element flex flex-col h-64"
                >
                  <div className="h-48 w-full overflow-hidden relative">
                    <img 
                      src={card.image} 
                      alt={card.title} 
                      className="w-full h-full object-cover img-hover-zoom"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#202020] via-transparent to-transparent opacity-80"></div>
                  </div>
                  <div className="flex items-center gap-3 p-4 flex-1 bg-[#202020] z-10 relative">
                    {card.icon}
                    <span className="font-medium text-white tracking-wide text-lg">{card.title}</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
    }
