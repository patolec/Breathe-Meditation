// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 初始化清单进度追踪
    initChecklist();
    
    // 初始化按钮交互
    initButtons();
    
    // 初始化呼吸冥想功能
    initBreathwork();
    
    // 初始化习惯打卡
    initHabits();
});

// ==================== 清单进度追踪功能 ====================
function initChecklist() {
    const checkboxes = document.querySelectorAll('.check-item input');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            updateProgress();
            saveProgress();
        });
    });
    
    // 加载保存的进度
    loadProgress();
}

function updateProgress() {
    const checkboxes = document.querySelectorAll('.check-item input');
    const checked = document.querySelectorAll('.check-item input:checked').length;
    const total = checkboxes.length;
    const percentage = (checked / total) * 100;
    
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    
    if (progressFill) progressFill.style.width = percentage + '%';
    if (progressText) progressText.textContent = checked + '/' + total;
}

function saveProgress() {
    const checkboxes = document.querySelectorAll('.check-item input');
    const progress = {};
    
    checkboxes.forEach(checkbox => {
        progress[checkbox.id] = checkbox.checked;
    });
    
    const today = new Date().toDateString();
    localStorage.setItem('prefrontal-progress', JSON.stringify({
        date: today,
        progress: progress
    }));
}

function loadProgress() {
    const saved = localStorage.getItem('prefrontal-progress');
    
    if (saved) {
        const data = JSON.parse(saved);
        const today = new Date().toDateString();
        
        if (data.date === today) {
            const checkboxes = document.querySelectorAll('.check-item input');
            checkboxes.forEach(checkbox => {
                if (data.progress[checkbox.id]) {
                    checkbox.checked = true;
                }
            });
            updateProgress();
        }
    }
}

// ==================== 按钮交互功能 ====================
function initButtons() {
    const startBtn = document.getElementById('start-btn');
    const remindBtn = document.getElementById('remind-btn');
    
    if (startBtn) {
        startBtn.addEventListener('click', function() {
            showStartModal();
        });
    }
    
    if (remindBtn) {
        remindBtn.addEventListener('click', function() {
            requestNotificationPermission();
        });
    }
}

function showStartModal() {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>🧠 开启大脑健康之旅</h3>
            <p>从今天开始，每天坚持这些健康习惯。记住，持续的小改变会带来大不同！</p>
            <button class="modal-close">开始行动</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelector('.modal-close').addEventListener('click', function() {
        modal.remove();
        document.querySelector('.daily-habits').scrollIntoView({ behavior: 'smooth' });
    });
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) modal.remove();
    });
}

function requestNotificationPermission() {
    if ('Notification' in window) {
        Notification.requestPermission().then(function(permission) {
            if (permission === 'granted') {
                alert('每日提醒已设置！我们将在每天早上8点提醒你完成前额叶保护任务。');
            } else {
                alert('通知权限被拒绝。你可以在浏览器设置中手动开启通知。');
            }
        });
    } else {
        alert('你的浏览器不支持通知功能。');
    }
}

// ==================== 习惯打卡功能 ====================
let habitsData = {
    counts: {
        water: 0,
        exercise: 0,
        meditation: 0,
        reading: 0,
        social: 0,
        sleep: 0
    },
    streak: 0,
    lastDate: null
};

function initHabits() {
    loadHabitsData();
    bindHabitsEvents();
    updateHabitsDisplay();
}

function loadHabitsData() {
    const saved = localStorage.getItem('habitsData');
    const today = new Date().toDateString();
    
    if (saved) {
        const data = JSON.parse(saved);
        
        // 只有当天的数据才恢复
        if (data.lastDate === today) {
            habitsData.counts = data.counts || habitsData.counts;
        }
        
        habitsData.streak = data.streak || 0;
        habitsData.lastDate = data.lastDate;
        
        // 检查连续天数
        if (data.lastDate) {
            const lastDate = new Date(data.lastDate);
            const now = new Date();
            const diffDays = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
            if (diffDays > 1) {
                habitsData.streak = 0;
            }
        }
    }
    
    updateHabitsDisplay();
}

function saveHabitsData() {
    localStorage.setItem('habitsData', JSON.stringify(habitsData));
}

function bindHabitsEvents() {
    document.querySelectorAll('.habit-card').forEach(card => {
        const habit = card.dataset.habit;
        const plusBtn = card.querySelector('.plus');
        const minusBtn = card.querySelector('.minus');
        
        if (plusBtn) {
            plusBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                incrementHabit(habit);
            });
        }
        
        if (minusBtn) {
            minusBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                decrementHabit(habit);
            });
        }
    });
}

function incrementHabit(habit) {
    habitsData.counts[habit] = (habitsData.counts[habit] || 0) + 1;
    
    // 检查是否是新的一天的第一次打卡
    const today = new Date().toDateString();
    if (habitsData.lastDate !== today) {
        habitsData.streak++;
    }
    habitsData.lastDate = today;
    
    saveHabitsData();
    updateHabitsDisplay();
    
    // 震动反馈
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
}

function decrementHabit(habit) {
    if (habitsData.counts[habit] > 0) {
        habitsData.counts[habit]--;
        saveHabitsData();
        updateHabitsDisplay();
    }
}

function updateHabitsDisplay() {
    // 更新所有计数器显示
    Object.keys(habitsData.counts).forEach(habit => {
        const counter = document.getElementById(`count-${habit}`);
        if (counter) {
            counter.textContent = habitsData.counts[habit];
        }
    });
    
    // 更新总打卡次数
    const totalCheckins = Object.values(habitsData.counts).reduce((a, b) => a + b, 0);
    const totalCheckinsEl = document.getElementById('totalCheckins');
    if (totalCheckinsEl) {
        totalCheckinsEl.textContent = totalCheckins;
    }
    
    // 更新连续天数
    const dailyStreakEl = document.getElementById('dailyStreak');
    if (dailyStreakEl) {
        dailyStreakEl.textContent = habitsData.streak;
    }
    
    // 更新今日日期
    const todayDateEl = document.getElementById('todayDate');
    if (todayDateEl) {
        const today = new Date();
        const options = { month: 'long', day: 'numeric', weekday: 'long' };
        todayDateEl.textContent = today.toLocaleDateString('zh-CN', options);
    }
}

// ==================== 呼吸冥想功能 ====================
const sessions = {
    stress: { name: '压力缓解', desc: '4-7-8 呼吸法', phases: [
        { name: '吸气', duration: 4, class: 'inhale' },
        { name: '屏息', duration: 7, class: 'hold' },
        { name: '呼气', duration: 8, class: 'exhale' }
    ]},
    sleep: { name: '睡前舒缓', desc: '4-6 深度放松', phases: [
        { name: '吸气', duration: 4, class: 'inhale' },
        { name: '呼气', duration: 6, class: 'exhale' }
    ]},
    energy: { name: '唤醒能量', desc: '快速唤醒呼吸', phases: [
        { name: '吸气', duration: 2, class: 'inhale' },
        { name: '呼气', duration: 2, class: 'exhale' }
    ]},
    focus: { name: '专注提升', desc: '等比呼吸法', phases: [
        { name: '吸气', duration: 4, class: 'inhale' },
        { name: '屏息', duration: 4, class: 'hold' },
        { name: '呼气', duration: 4, class: 'exhale' },
        { name: '屏息', duration: 4, class: 'hold' }
    ]},
    custom: { name: '自定义', desc: '自定义呼吸', phases: [] }
};

const quotes = [
    "我内心的平静正在显化外在的美好",
    "每一次呼吸都在滋养我的身心灵",
    "我值得拥有宁静与幸福",
    "宇宙的能量正通过呼吸流经我",
    "我完全接纳当下的自己",
    "平静是我与生俱来的状态",
    "我释放所有的紧张与焦虑",
    "我的内心充满力量与光芒",
    "此刻，我便是完整的",
    "我与宇宙的节奏和谐共振"
];

let breathState = {
    currentSession: 'stress',
    duration: 300,
    timeRemaining: 300,
    isRunning: false,
    currentPhase: 0,
    breathCycles: 0,
    guideEnabled: true,
    vibrateEnabled: false,
    customInhale: 4,
    customHold: 7,
    customExhale: 8,
    totalSessions: 0,
    totalMinutes: 0,
    totalCycles: 0,
    streak: 0
};

let breathTimer = null;
let countdownTimer = null;
let audioCtx = null;

function initBreathwork() {
    loadBreathData();
    bindBreathEvents();
    updateTimerDisplay();
}

function loadBreathData() {
    const saved = localStorage.getItem('breathworkData');
    if (saved) {
        const d = JSON.parse(saved);
        breathState.totalSessions = d.totalSessions || 0;
        breathState.totalMinutes = d.totalMinutes || 0;
        breathState.totalCycles = d.totalCycles || 0;
        breathState.streak = d.streak || 0;
        
        // 检查连续天数
        const lastDate = d.lastDate ? new Date(d.lastDate) : null;
        const now = new Date();
        if (lastDate) {
            const diffDays = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
            if (diffDays > 1) {
                breathState.streak = 0;
            }
        }
        
        updateBreathStats();
    }
}

function saveBreathData() {
    localStorage.setItem('breathworkData', JSON.stringify({
        totalSessions: breathState.totalSessions || 0,
        totalMinutes: breathState.totalMinutes || 0,
        totalCycles: breathState.totalCycles || 0,
        streak: breathState.streak || 0,
        lastDate: new Date().toDateString()
    }));
}

function updateBreathStats() {
    const streakDays = document.getElementById('streakDays');
    const totalMinutes = document.getElementById('totalMinutes');
    const statSessions = document.getElementById('statSessions');
    const statMinutes = document.getElementById('statMinutes');
    const statCycles = document.getElementById('statCycles');
    const statStreak = document.getElementById('statStreak');
    
    if (streakDays) streakDays.textContent = breathState.streak || 0;
    if (totalMinutes) totalMinutes.textContent = breathState.totalMinutes || 0;
    if (statSessions) statSessions.textContent = breathState.totalSessions || 0;
    if (statMinutes) statMinutes.textContent = breathState.totalMinutes || 0;
    if (statCycles) statCycles.textContent = breathState.totalCycles || 0;
    if (statStreak) statStreak.textContent = breathState.streak || 0;
}

function bindBreathEvents() {
    // Session选择
    document.querySelectorAll('.session-card').forEach(card => {
        card.addEventListener('click', () => switchSession(card.dataset.session));
    });
    
    // 时长选择
    document.querySelectorAll('.dur-btn[data-duration]').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.dur-btn[data-duration]').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            breathState.duration = parseInt(this.dataset.duration);
            breathState.timeRemaining = breathState.duration;
            updateTimerDisplay();
        });
    });
    
    // 自定义滑块
    const inhaleSlider = document.getElementById('inhaleSlider');
    const holdSlider = document.getElementById('holdSlider');
    const exhaleSlider = document.getElementById('exhaleSlider');
    
    if (inhaleSlider) {
        inhaleSlider.addEventListener('input', function() {
            breathState.customInhale = parseInt(this.value);
            document.getElementById('inhaleVal').textContent = this.value;
            updateCustomInfo();
        });
    }
    
    if (holdSlider) {
        holdSlider.addEventListener('input', function() {
            breathState.customHold = parseInt(this.value);
            document.getElementById('holdVal').textContent = this.value;
            updateCustomInfo();
        });
    }
    
    if (exhaleSlider) {
        exhaleSlider.addEventListener('input', function() {
            breathState.customExhale = parseInt(this.value);
            document.getElementById('exhaleVal').textContent = this.value;
            updateCustomInfo();
        });
    }
    
    // 播放/暂停
    const playBtn = document.getElementById('playBtn');
    if (playBtn) {
        playBtn.addEventListener('click', () => {
            if (breathState.isRunning) pauseBreath();
            else startBreath();
        });
    }
    
    // 重置
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetBreath);
    }
    
    // 全屏
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', toggleFullscreen);
    }
    
    // 工具按钮
    const guideBtn = document.getElementById('guideBtn');
    const vibrateBtn = document.getElementById('vibrateBtn');
    const historyBtn = document.getElementById('historyBtn');
    
    if (guideBtn) {
        guideBtn.addEventListener('click', function() {
            breathState.guideEnabled = !breathState.guideEnabled;
            this.classList.toggle('active', breathState.guideEnabled);
        });
    }
    
    if (vibrateBtn) {
        vibrateBtn.addEventListener('click', function() {
            breathState.vibrateEnabled = !breathState.vibrateEnabled;
            this.classList.toggle('active', breathState.vibrateEnabled);
            if (breathState.vibrateEnabled && navigator.vibrate) {
                navigator.vibrate(100);
            }
        });
    }
    
    if (historyBtn) {
        historyBtn.addEventListener('click', () => {
            document.getElementById('historyModal').classList.add('show');
        });
    }
    
    // 弹窗关闭
    const closeHistoryBtn = document.getElementById('closeHistoryBtn');
    const doneBtn = document.getElementById('doneBtn');
    
    if (closeHistoryBtn) {
        closeHistoryBtn.addEventListener('click', () => {
            document.getElementById('historyModal').classList.remove('show');
        });
    }
    
    if (doneBtn) {
        doneBtn.addEventListener('click', () => {
            document.getElementById('completeModal').classList.remove('show');
            resetBreath();
        });
    }
}

function switchSession(key) {
    breathState.currentSession = key;
    document.querySelectorAll('.session-card').forEach(c => c.classList.remove('active'));
    document.querySelector(`[data-session="${key}"]`).classList.add('active');
    
    const customPanel = document.getElementById('customPanel');
    const breathModeInfo = document.getElementById('breathModeInfo');
    
    if (key === 'custom') {
        if (customPanel) customPanel.classList.add('show');
        updateCustomInfo();
    } else {
        if (customPanel) customPanel.classList.remove('show');
        if (breathModeInfo) breathModeInfo.textContent = sessions[key].desc;
    }
    resetBreath();
}

function updateCustomInfo() {
    const breathModeInfo = document.getElementById('breathModeInfo');
    if (breathModeInfo) {
        breathModeInfo.textContent = `${breathState.customInhale}-${breathState.customHold || 0}-${breathState.customExhale} 自定义`;
    }
}

function getPhases() {
    if (breathState.currentSession === 'custom') {
        const phases = [{ name: '吸气', duration: breathState.customInhale, class: 'inhale' }];
        if (breathState.customHold > 0) phases.push({ name: '屏息', duration: breathState.customHold, class: 'hold' });
        phases.push({ name: '呼气', duration: breathState.customExhale, class: 'exhale' });
        return phases;
    }
    return sessions[breathState.currentSession].phases;
}

function runBreathPhase() {
    if (!breathState.isRunning) return;
    
    const phases = getPhases();
    const phase = phases[breathState.currentPhase];
    
    const circle = document.getElementById('breathCircle');
    if (circle) {
        circle.className = 'breath-circle ' + phase.class;
        circle.style.transition = `all ${phase.duration}s ease-in-out`;
    }
    
    const breathPhase = document.getElementById('breathPhase');
    if (breathPhase) breathPhase.textContent = phase.name;
    
    playGuideTone(phase.class);
    if (phase.class === 'inhale' && breathState.vibrateEnabled && navigator.vibrate) {
        navigator.vibrate(50);
    } else if (phase.class === 'exhale' && breathState.vibrateEnabled && navigator.vibrate) {
        navigator.vibrate(30);
    }
    
    let count = phase.duration;
    const breathCount = document.getElementById('breathCount');
    if (breathCount) breathCount.textContent = count;
    
    const countInterval = setInterval(() => {
        count--;
        if (count <= 0 || !breathState.isRunning) {
            clearInterval(countInterval);
            return;
        }
        if (breathCount) breathCount.textContent = count;
    }, 1000);
    
    breathTimer = setTimeout(() => {
        breathState.currentPhase = (breathState.currentPhase + 1) % phases.length;
        if (breathState.currentPhase === 0) breathState.breathCycles++;
        runBreathPhase();
    }, phase.duration * 1000);
}

function startBreath() {
    breathState.isRunning = true;
    breathState.breathCycles = 0;
    
    const playBtn = document.getElementById('playBtn');
    if (playBtn) playBtn.textContent = '⏸';
    
    runBreathPhase();
    
    countdownTimer = setInterval(() => {
        breathState.timeRemaining--;
        updateTimerDisplay();
        if (breathState.timeRemaining <= 0) completeBreath();
    }, 1000);
}

function pauseBreath() {
    breathState.isRunning = false;
    
    const playBtn = document.getElementById('playBtn');
    if (playBtn) playBtn.textContent = '▶';
    
    clearTimeout(breathTimer);
    clearInterval(countdownTimer);
    
    const circle = document.getElementById('breathCircle');
    const breathPhase = document.getElementById('breathPhase');
    const breathCount = document.getElementById('breathCount');
    
    if (circle) circle.className = 'breath-circle';
    if (breathPhase) breathPhase.textContent = '已暂停';
    if (breathCount) breathCount.textContent = '';
}

function resetBreath() {
    pauseBreath();
    breathState.timeRemaining = breathState.duration;
    breathState.currentPhase = 0;
    breathState.breathCycles = 0;
    updateTimerDisplay();
    
    const breathPhase = document.getElementById('breathPhase');
    const breathCount = document.getElementById('breathCount');
    
    if (breathPhase) breathPhase.textContent = '准备开始';
    if (breathCount) breathCount.textContent = '';
}

function completeBreath() {
    pauseBreath();
    
    const minutes = Math.floor(breathState.duration / 60);
    breathState.totalSessions = (breathState.totalSessions || 0) + 1;
    breathState.totalMinutes = (breathState.totalMinutes || 0) + minutes;
    breathState.totalCycles = (breathState.totalCycles || 0) + breathState.breathCycles;
    
    const today = new Date().toDateString();
    if (breathState.lastDate !== today) {
        breathState.streak = (breathState.streak || 0) + 1;
    }
    breathState.lastDate = today;
    
    saveBreathData();
    updateBreathStats();
    playCompleteSound();
    
    // 自动增加冥想打卡
    incrementHabit('meditation');
    
    const quoteText = document.getElementById('quoteText');
    const statsText = document.getElementById('statsText');
    const completeModal = document.getElementById('completeModal');
    
    if (quoteText) quoteText.textContent = quotes[Math.floor(Math.random() * quotes.length)];
    if (statsText) statsText.textContent = `完成 ${breathState.breathCycles} 个呼吸循环 · ${minutes} 分钟`;
    if (completeModal) completeModal.classList.add('show');
}

function updateTimerDisplay() {
    const timerDisplay = document.getElementById('timerDisplay');
    if (timerDisplay) {
        const m = Math.floor(breathState.timeRemaining / 60);
        const s = breathState.timeRemaining % 60;
        timerDisplay.textContent = `${m}:${s.toString().padStart(2, '0')}`;
    }
}

function toggleFullscreen() {
    document.body.classList.toggle('meditation-fullscreen');
}

function playGuideTone(type) {
    if (!breathState.guideEnabled) return;
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    const freqs = { inhale: 528, hold: 417, exhale: 396 };
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.value = freqs[type] || 432;
    gain.gain.value = 0.08;
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.4);
}

function playCompleteSound() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    [528, 639, 741].forEach((f, i) => {
        setTimeout(() => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.value = f;
            gain.gain.value = 0.1;
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.6);
        }, i * 200);
    });
}
