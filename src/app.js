// HomesteadOS - CoopSense Mobile Web App
const { useState, useEffect, useMemo, useRef } = React;

function App() {
  const [activeTab, setActiveTab] = useState('coop'); // 'coop' | 'hydro' | 'cctv' | 'settings'

  // Master Homestead State
  const [coopState, setCoopState] = useState({
    autoMode: true,
    lightOn: true,
    lightBrightness: 85,
    fanOn: false,
    fanSpeed: 2, // 1: Low, 2: Med, 3: High
    waterLevel: 78, // %
    feedLevel: 64, // %
    temp: 24.8, // °C
    humidity: 62, // %
    doorState: 'closed', // 'open' | 'opening' | 'closed' | 'closing'
    doorProgress: 0, // 0 = closed, 100 = open
    chickHeatMode: false,
    chickTargetTemp: 34.5,
    predatorNightGuard: true,
    predatorAlarmTriggered: false,
    eggsToday: 5,
    eggLogHistory: [4, 6, 5, 7, 5],
  });

  // Hydroponics State (Future ready)
  const [hydroState, setHydroState] = useState({
    autoMode: true,
    ph: 6.2,
    ec: 1.8,
    waterTemp: 21.5,
    pumpOn: true,
    aeratorOn: true,
    growLightsOn: true,
    reservoirLevel: 82,
  });

  // CCTV State
  const [cctvState, setCctvState] = useState({
    activeCam: null, // null for grid, or cam id for full-screen
    cameras: [
      { id: 'cam1', name: 'Roost & Perch', location: 'Inside Coop', status: 'Online', emoji: '🌙', color: 'from-amber-900/30 to-stone-900' },
      { id: 'cam2', name: 'Nesting Boxes', location: 'Egg Bays', status: 'Online', emoji: '🪺', color: 'from-orange-900/30 to-stone-900' },
      { id: 'cam3', name: 'Outdoor Run', location: 'Perimeter', status: 'Online', emoji: '🦊', color: 'from-emerald-900/30 to-stone-900' },
      { id: 'cam4', name: 'Hydroponic Bay', location: 'Greenhouse', status: 'Online', emoji: '🌱', color: 'from-teal-900/30 to-stone-900' }
    ]
  });

  // Simulated IoT telemetry tick (ambient fluctuation)
  useEffect(() => {
    const timer = setInterval(() => {
      setCoopState(prev => ({
        ...prev,
        temp: Number((prev.temp + (Math.random() * 0.2 - 0.1)).toFixed(1)),
        humidity: Math.min(95, Math.max(30, Math.round(prev.humidity + (Math.random() * 2 - 1)))),
      }));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Feeder dispense trigger
  const handleDispenseFeed = () => {
    alert("🌾 Feeder Auger triggered: Dispensing 1 portion (approx 120g)!");
    setCoopState(prev => ({ ...prev, feedLevel: Math.max(0, prev.feedLevel - 2) }));
  };

  // Motorized Door Handlers
  const handleToggleDoor = (target) => {
    if (coopState.doorState === 'opening' || coopState.doorState === 'closing') return;
    
    if (target === 'open') {
      setCoopState(prev => ({ ...prev, doorState: 'opening' }));
      setTimeout(() => {
        setCoopState(prev => ({ ...prev, doorState: 'open', doorProgress: 100 }));
      }, 1600);
    } else {
      setCoopState(prev => ({ ...prev, doorState: 'closing' }));
      setTimeout(() => {
        setCoopState(prev => ({ ...prev, doorState: 'closed', doorProgress: 0 }));
      }, 1600);
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-linen flex flex-col justify-between relative shadow-2xl safe-top">
      
      {/* Header */}
      <header className="px-5 pt-3 pb-3 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xl">🏡</span>
            <h1 className="text-xl font-bold tracking-tight text-moss-deep">HomesteadOS</h1>
          </div>
          <p className="text-xs text-stone-500 font-medium">ESP8266 Live Node • 192.168.1.84</p>
        </div>

        {/* Global Auto Indicator Badge */}
        <div 
          onClick={() => setCoopState(prev => ({ ...prev, autoMode: !prev.autoMode }))}
          className={`cursor-pointer px-3 py-1.5 rounded-full flex items-center space-x-1.5 transition-all duration-200 border ${
            coopState.autoMode 
              ? 'bg-moss-light border-moss text-moss-dark' 
              : 'bg-sand border-stone-300 text-stone-600'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${coopState.autoMode ? 'bg-moss animate-pulse' : 'bg-stone-400'}`}></span>
          <span className="text-xs font-semibold">{coopState.autoMode ? 'AUTOPILOT ON' : 'MANUAL'}</span>
        </div>
      </header>

      {/* Main Tab Content */}
      <main className="flex-1 px-4 pb-24 overflow-y-auto">
        {activeTab === 'coop' && (
          <CoopTab 
            state={coopState} 
            setState={setCoopState} 
            onDispenseFeed={handleDispenseFeed}
            onToggleDoor={handleToggleDoor}
          />
        )}

        {activeTab === 'hydro' && (
          <HydroTab 
            state={hydroState} 
            setState={setHydroState} 
          />
        )}

        {activeTab === 'cctv' && (
          <CctvTab 
            state={cctvState} 
            setState={setCctvState} 
          />
        )}

        {activeTab === 'settings' && (
          <SettingsTab 
            coopState={coopState} 
            setCoopState={setCoopState} 
          />
        )}
      </main>

      {/* Bottom Floating Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-cardbg/90 backdrop-blur-md border-t border-sand px-3 py-2 flex justify-around items-center safe-bottom z-50">
        <NavButton 
          active={activeTab === 'coop'} 
          onClick={() => setActiveTab('coop')}
          icon="🐔"
          label="Hen Farm"
        />
        <NavButton 
          active={activeTab === 'hydro'} 
          onClick={() => setActiveTab('hydro')}
          icon="🌱"
          label="Hydroponics"
        />
        <NavButton 
          active={activeTab === 'cctv'} 
          onClick={() => setActiveTab('cctv')}
          icon="📹"
          label="CCTV"
          badge="4"
        />
        <NavButton 
          active={activeTab === 'settings'} 
          onClick={() => setActiveTab('settings')}
          icon="⚙️"
          label="Settings"
        />
      </nav>
    </div>
  );
}

// ----------------- NAV BUTTON COMPONENT -----------------
function NavButton({ active, onClick, icon, label, badge }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all relative ${
        active ? 'text-moss-dark font-bold' : 'text-stone-400 hover:text-stone-600'
      }`}
    >
      <div className={`text-xl transition-transform ${active ? 'scale-110 -translate-y-0.5' : ''}`}>
        {icon}
      </div>
      <span className="text-[11px] mt-0.5 tracking-tight">{label}</span>
      {badge && (
        <span className="absolute top-0.5 right-2 bg-moss text-white text-[9px] px-1.5 py-0.2 rounded-full font-bold">
          {badge}
        </span>
      )}
      {active && <span className="w-1.5 h-1.5 bg-moss rounded-full mt-0.5"></span>}
    </button>
  );
}

// ----------------- COOP TAB COMPONENT -----------------
function CoopTab({ state, setState, onDispenseFeed, onToggleDoor }) {
  return (
    <div className="space-y-4 pt-1">
      
      {/* Hero Ambient Status Card */}
      <div className="bg-gradient-to-br from-moss-light via-sand/60 to-linen p-4 rounded-3xl border border-sand shadow-cozy relative overflow-hidden">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-moss">Live Climate Envelope</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-3xl font-extrabold text-moss-deep">{state.temp}°C</span>
              <span className="text-sm font-medium text-stone-500">/ {state.humidity}% RH</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] bg-white/80 px-2 py-1 rounded-full text-stone-600 font-medium border border-sand">
              {state.autoMode ? '🌿 Climate Banding Active' : '⚡ Manual Override'}
            </span>
            <div className="text-xs text-stone-500 mt-2 font-medium">Optimal: 21–26°C</div>
          </div>
        </div>

        {/* Quick Resource Bars */}
        <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-moss/10">
          <div className="bg-white/70 p-2.5 rounded-2xl border border-sand">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-stone-500 font-medium">💧 Water Level</span>
              <span className="font-bold text-moss-deep">{state.waterLevel}%</span>
            </div>
            <div className="w-full bg-sand h-2 rounded-full overflow-hidden">
              <div className="bg-sky-500 h-full rounded-full transition-all duration-500" style={{ width: `${state.waterLevel}%` }}></div>
            </div>
          </div>

          <div className="bg-white/70 p-2.5 rounded-2xl border border-sand">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-stone-500 font-medium">🌾 Feed Hopper</span>
              <span className="font-bold text-moss-deep">{state.feedLevel}%</span>
            </div>
            <div className="w-full bg-sand h-2 rounded-full overflow-hidden">
              <div className="bg-yolk h-full rounded-full transition-all duration-500" style={{ width: `${state.feedLevel}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Motorized Door Control Card */}
      <div className="bg-cardbg p-4 rounded-3xl border border-sand shadow-cozy">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg">🚪</span>
            <div>
              <h3 className="text-sm font-bold text-stone-800">Motorized Coop Door</h3>
              <p className="text-[11px] text-stone-400">12V Worm-Gear • Dual Limit Switch</p>
            </div>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${
            state.doorState === 'open' 
              ? 'bg-emerald-100 text-emerald-800' 
              : state.doorState === 'closed'
              ? 'bg-stone-100 text-stone-600'
              : 'bg-amber-100 text-amber-800 animate-pulse'
          }`}>
            {state.doorState}
          </span>
        </div>

        <div className="flex space-x-2">
          <button 
            disabled={state.doorState === 'open' || state.doorState === 'opening'}
            onClick={() => onToggleDoor('open')}
            className={`flex-1 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              state.doorState === 'open' 
                ? 'bg-stone-100 text-stone-400 cursor-not-allowed' 
                : 'bg-moss text-white hover:bg-moss-dark active:scale-95 shadow-pill'
            }`}
          >
            {state.doorState === 'opening' ? 'Opening...' : '▲ Open Door'}
          </button>
          
          <button 
            disabled={state.doorState === 'closed' || state.doorState === 'closing'}
            onClick={() => onToggleDoor('close')}
            className={`flex-1 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              state.doorState === 'closed' 
                ? 'bg-stone-100 text-stone-400 cursor-not-allowed' 
                : 'bg-terracotta text-white hover:bg-terracotta-dark active:scale-95 shadow-pill'
            }`}
          >
            {state.doorState === 'closing' ? 'Closing...' : '▼ Close & Lock'}
          </button>
        </div>
        <p className="text-[10px] text-stone-400 mt-2 text-center">Auto-schedule: Opens at Sunrise (06:15) • Locks at Dusk (18:45)</p>
      </div>

      {/* Special Features Grid: Chick Heat & Predator Night Guard */}
      <div className="grid grid-cols-2 gap-3">
        
        {/* Chick Heat Mode Card */}
        <div className={`p-4 rounded-3xl border transition-all ${
          state.chickHeatMode 
            ? 'bg-yolk-light/60 border-yolk shadow-cozy' 
            : 'bg-cardbg border-sand shadow-cozy opacity-90'
        }`}>
          <div className="flex justify-between items-start">
            <span className="text-xl">🐥</span>
            <input 
              type="checkbox" 
              checked={state.chickHeatMode} 
              onChange={e => setState(p => ({ ...p, chickHeatMode: e.target.checked }))}
              className="w-5 h-5 accent-yolk rounded cursor-pointer"
            />
          </div>
          <h4 className="text-xs font-bold text-stone-800 mt-2">Chick Heat Mode</h4>
          <p className="text-[10px] text-stone-500">Brooder SSR PID Loop</p>
          
          {state.chickHeatMode && (
            <div className="mt-3 pt-2 border-t border-yolk/30">
              <div className="flex justify-between text-[11px] font-bold text-stone-700">
                <span>Target</span>
                <span className="text-yolk-dark">{state.chickTargetTemp}°C</span>
              </div>
              <input 
                type="range" 
                min="28" 
                max="36" 
                step="0.5" 
                value={state.chickTargetTemp}
                onChange={e => setState(p => ({ ...p, chickTargetTemp: parseFloat(e.target.value) }))}
                className="w-full mt-1.5"
              />
            </div>
          )}
        </div>

        {/* Predator Night Guard Card */}
        <div className={`p-4 rounded-3xl border transition-all relative ${
          state.predatorNightGuard 
            ? 'bg-night text-white border-stone-800 shadow-cozy' 
            : 'bg-cardbg text-stone-800 border-sand shadow-cozy opacity-90'
        }`}>
          <div className="flex justify-between items-start">
            <span className="text-xl">🦊</span>
            <input 
              type="checkbox" 
              checked={state.predatorNightGuard} 
              onChange={e => setState(p => ({ ...p, predatorNightGuard: e.target.checked }))}
              className="w-5 h-5 accent-red-500 rounded cursor-pointer"
            />
          </div>
          <h4 className="text-xs font-bold mt-2">Predator Guard</h4>
          <p className={`text-[10px] ${state.predatorNightGuard ? 'text-stone-400' : 'text-stone-500'}`}>
            PIR & Strobe Active
          </p>

          {state.predatorNightGuard && (
            <div className="mt-3 pt-2 border-t border-stone-800 flex items-center justify-between text-[10px] text-emerald-400 font-semibold">
              <span className="flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Perimeter Armed</span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Actuator Quick Toggles: Light, Fan, Feeder */}
      <div className="bg-cardbg p-4 rounded-3xl border border-sand shadow-cozy space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">Coop Actuators</h3>

        {/* Light Control */}
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center space-x-2.5">
            <span className="text-lg">💡</span>
            <div>
              <div className="text-xs font-bold text-stone-800">Warm Circadian Light</div>
              <div className="text-[10px] text-stone-400">PWM Dimming ({state.lightBrightness}%)</div>
            </div>
          </div>
          <button 
            onClick={() => setState(p => ({ ...p, lightOn: !p.lightOn }))}
            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
              state.lightOn ? 'bg-moss justify-end' : 'bg-sand justify-start'
            }`}
          >
            <div className="bg-white w-4 h-4 rounded-full shadow-md transform transition-transform"></div>
          </button>
        </div>

        {/* Ventilation Fan */}
        <div className="flex items-center justify-between py-1 border-t border-sand">
          <div className="flex items-center space-x-2.5">
            <span className="text-lg">🌀</span>
            <div>
              <div className="text-xs font-bold text-stone-800">Ventilation Exhaust</div>
              <div className="text-[10px] text-stone-400">12V DC • Level {state.fanSpeed}</div>
            </div>
          </div>
          <button 
            onClick={() => setState(p => ({ ...p, fanOn: !p.fanOn }))}
            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
              state.fanOn ? 'bg-moss justify-end' : 'bg-sand justify-start'
            }`}
          >
            <div className="bg-white w-4 h-4 rounded-full shadow-md transform transition-transform"></div>
          </button>
        </div>

        {/* Feeder Drop Button */}
        <div className="flex items-center justify-between pt-1 border-t border-sand">
          <div className="flex items-center space-x-2.5">
            <span className="text-lg">🌾</span>
            <div>
              <div className="text-xs font-bold text-stone-800">Dispense Feed</div>
              <div className="text-[10px] text-stone-400">Servo Drop Auger</div>
            </div>
          </div>
          <button 
            onClick={onDispenseFeed}
            className="px-3 py-1.5 bg-sand hover:bg-stone-300 text-stone-700 text-xs font-bold rounded-xl transition-all active:scale-95 shadow-sm"
          >
            Dispense
          </button>
        </div>
      </div>

      {/* Egg Production Counter */}
      <div className="bg-yolk-light/40 p-4 rounded-3xl border border-yolk/30 flex items-center justify-between shadow-cozy">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">🥚</span>
          <div>
            <h4 className="text-xs font-bold text-stone-800">Egg Harvest Today</h4>
            <p className="text-[10px] text-stone-500">Average: 5.6 eggs/day</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setState(p => ({ ...p, eggsToday: Math.max(0, p.eggsToday - 1) }))}
            className="w-8 h-8 rounded-full bg-white text-stone-700 font-bold border border-sand shadow-sm active:scale-90"
          >
            -
          </button>
          <span className="text-lg font-black text-yolk-dark w-6 text-center">{state.eggsToday}</span>
          <button 
            onClick={() => setState(p => ({ ...p, eggsToday: p.eggsToday + 1 }))}
            className="w-8 h-8 rounded-full bg-yolk text-white font-bold shadow-pill active:scale-90"
          >
            +
          </button>
        </div>
      </div>

    </div>
  );
}

// ----------------- HYDROPONICS TAB COMPONENT -----------------
function HydroTab({ state, setState }) {
  return (
    <div className="space-y-4 pt-1">
      {/* Hydroponics Header Status */}
      <div className="bg-gradient-to-br from-teal-50 via-sand/50 to-linen p-4 rounded-3xl border border-sand shadow-cozy">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-teal-700">Nutrient Reservoir</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-3xl font-extrabold text-stone-800">{state.ph} pH</span>
              <span className="text-sm font-medium text-teal-600">/ {state.ec} EC</span>
            </div>
          </div>
          <span className="text-[10px] bg-teal-100 text-teal-800 px-2.5 py-1 rounded-full font-bold">
            OPTIMAL RANGE
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-teal-100">
          <div className="bg-white/80 p-2.5 rounded-2xl border border-sand">
            <span className="text-stone-500 text-xs font-medium">Water Temp</span>
            <div className="text-base font-bold text-stone-800">{state.waterTemp}°C</div>
          </div>
          <div className="bg-white/80 p-2.5 rounded-2xl border border-sand">
            <span className="text-stone-500 text-xs font-medium">Reservoir Level</span>
            <div className="text-base font-bold text-teal-700">{state.reservoirLevel}%</div>
          </div>
        </div>
      </div>

      {/* Hydroponics Controls */}
      <div className="bg-cardbg p-4 rounded-3xl border border-sand shadow-cozy space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">Hydro Actuators</h3>

        {/* Pump */}
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center space-x-2.5">
            <span className="text-lg">🌊</span>
            <div>
              <div className="text-xs font-bold text-stone-800">Water Circulation Pump</div>
              <div className="text-[10px] text-stone-400">NFT Flood Cycle • 15m On / 15m Off</div>
            </div>
          </div>
          <button 
            onClick={() => setState(p => ({ ...p, pumpOn: !p.pumpOn }))}
            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
              state.pumpOn ? 'bg-teal-600 justify-end' : 'bg-sand justify-start'
            }`}
          >
            <div className="bg-white w-4 h-4 rounded-full shadow-md"></div>
          </button>
        </div>

        {/* Aerator */}
        <div className="flex items-center justify-between py-1 border-t border-sand">
          <div className="flex items-center space-x-2.5">
            <span className="text-lg">🫧</span>
            <div>
              <div className="text-xs font-bold text-stone-800">Oxygen Aerator</div>
              <div className="text-[10px] text-stone-400">Dual Air Stone Bubbler</div>
            </div>
          </div>
          <button 
            onClick={() => setState(p => ({ ...p, aeratorOn: !p.aeratorOn }))}
            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
              state.aeratorOn ? 'bg-teal-600 justify-end' : 'bg-sand justify-start'
            }`}
          >
            <div className="bg-white w-4 h-4 rounded-full shadow-md"></div>
          </button>
        </div>

        {/* Grow Lights */}
        <div className="flex items-center justify-between py-1 border-t border-sand">
          <div className="flex items-center space-x-2.5">
            <span className="text-lg">☀️</span>
            <div>
              <div className="text-xs font-bold text-stone-800">Full-Spectrum Grow Lights</div>
              <div className="text-[10px] text-stone-400">18h Veg Schedule</div>
            </div>
          </div>
          <button 
            onClick={() => setState(p => ({ ...p, growLightsOn: !p.growLightsOn }))}
            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
              state.growLightsOn ? 'bg-teal-600 justify-end' : 'bg-sand justify-start'
            }`}
          >
            <div className="bg-white w-4 h-4 rounded-full shadow-md"></div>
          </button>
        </div>
      </div>

      {/* Auto Dosing Card */}
      <div className="bg-sand/40 p-4 rounded-3xl border border-sand">
        <h4 className="text-xs font-bold text-stone-800">Automatic Dosing Status</h4>
        <p className="text-[11px] text-stone-500 mt-1">Peristaltic pumps calibration: pH Down (A) and Flora Nutrients (B+C) automated.</p>
      </div>
    </div>
  );
}

// ----------------- CCTV TAB COMPONENT -----------------
function CctvTab({ state, setState }) {
  const [selectedCam, setSelectedCam] = useState(null);

  return (
    <div className="space-y-4 pt-1">
      <div className="flex justify-between items-center px-1">
        <div>
          <h2 className="text-sm font-bold text-stone-800">Live CCTV Feed Grid</h2>
          <p className="text-[11px] text-stone-400">4 Low-Latency Homelab Streams</p>
        </div>
        <span className="text-[10px] bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
          <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
          <span>REC</span>
        </span>
      </div>

      {/* Full Screen Modal if a camera is clicked */}
      {selectedCam ? (
        <div className="bg-night rounded-3xl p-3 border border-stone-800 shadow-2xl space-y-3">
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-stone-900 flex items-center justify-center">
            {/* Simulated Live Stream Feed */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40"></div>
            <div className="text-5xl">{selectedCam.emoji}</div>
            
            <div className="absolute top-3 left-3 text-white text-xs font-bold flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{selectedCam.name}</span>
            </div>
            
            <div className="absolute top-3 right-3 text-[10px] text-stone-300 font-mono">
              1080p • 25 FPS
            </div>

            <div className="absolute bottom-3 left-3 text-[10px] text-stone-400">
              {selectedCam.location}
            </div>
          </div>

          <div className="flex justify-between items-center px-2">
            <button 
              onClick={() => setSelectedCam(null)}
              className="text-xs text-stone-300 bg-stone-800 hover:bg-stone-700 px-3 py-1.5 rounded-xl font-medium"
            >
              ← Back to Grid
            </button>
            <button 
              onClick={() => alert(`📸 Snapshot saved for ${selectedCam.name}`)}
              className="text-xs text-white bg-moss hover:bg-moss-dark px-3 py-1.5 rounded-xl font-bold"
            >
              Take Snapshot
            </button>
          </div>
        </div>
      ) : (
        /* 2x2 Camera Grid */
        <div className="grid grid-cols-2 gap-3">
          {state.cameras.map(cam => (
            <div 
              key={cam.id}
              onClick={() => setSelectedCam(cam)}
              className="bg-cardbg rounded-3xl border border-sand shadow-cozy overflow-hidden cursor-pointer hover:border-moss transition-all group"
            >
              <div className="aspect-video bg-gradient-to-b from-stone-800 to-night flex items-center justify-center relative">
                <span className="text-3xl group-hover:scale-110 transition-transform">{cam.emoji}</span>
                <span className="absolute top-2 left-2 text-[9px] bg-black/60 text-white px-1.5 py-0.5 rounded font-bold">
                  LIVE
                </span>
              </div>
              <div className="p-2.5">
                <div className="text-xs font-bold text-stone-800 truncate">{cam.name}</div>
                <div className="text-[10px] text-stone-400">{cam.location}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CCTV Tip Card */}
      <div className="bg-cardbg p-3 rounded-2xl border border-sand text-[11px] text-stone-500">
        💡 <strong>Pro Tip:</strong> Tap any camera tile to enter full-screen monitor mode with snapshot and live telemetry overlays.
      </div>
    </div>
  );
}

// ----------------- SETTINGS TAB COMPONENT -----------------
function SettingsTab({ coopState, setCoopState }) {
  return (
    <div className="space-y-4 pt-1">
      <div className="bg-cardbg p-4 rounded-3xl border border-sand shadow-cozy space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">Hardware & Connection</h3>
        
        <div className="text-xs space-y-2">
          <div className="flex justify-between py-1 border-b border-sand">
            <span className="text-stone-500">Microcontroller</span>
            <span className="font-semibold text-stone-800">ESP8266 (NodeMCU v3)</span>
          </div>
          <div className="flex justify-between py-1 border-b border-sand">
            <span className="text-stone-500">MQTT Broker</span>
            <span className="font-semibold text-stone-800">192.168.1.100:1883</span>
          </div>
          <div className="flex justify-between py-1 border-b border-sand">
            <span className="text-stone-500">Wi-Fi Network</span>
            <span className="font-semibold text-stone-800">Homestead_IoT (2.4GHz)</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-stone-500">Firmware Build</span>
            <span className="font-semibold text-stone-800">v2.4.1-SniperAuto</span>
          </div>
        </div>
      </div>

      <div className="bg-cardbg p-4 rounded-3xl border border-sand shadow-cozy space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">Safety & Failsafes</h3>
        <p className="text-xs text-stone-600">
          The ESP8266 runs all climate banding and door closure routines independently using on-chip LittleFS memory. In the event of Wi-Fi loss, your flock remains fully protected.
        </p>
      </div>
    </div>
  );
}

// Render root
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
