// ===== 瑜伽裤百科 · Supabase 配置 =====
const SUPABASE_URL = 'https://pqvjztbxgtgbohrmaqhr.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_IL7Xyr1MK3Aa8-YGF41NzQ_cYBxM9Bz'

let currentUser = null
let supabase = null

// 初始化 Supabase（带重试）
async function initSupabase() {
    try {
        if (typeof window.supabase !== 'undefined') {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
            supabase.auth.onAuthStateChange((event, session) => {
                currentUser = session?.user || null
                updateUI()
            })
            const { data: { user } } = await supabase.auth.getUser()
            currentUser = user
            updateUI()
        } else {
            console.warn('Supabase SDK 未加载')
        }
    } catch(e) {
        console.warn('Supabase 初始化失败:', e.message)
    }
}

function updateUI() {
    const loginBtn = document.getElementById('loginBtn')
    const userMenu = document.getElementById('userMenu')
    if (!loginBtn && !userMenu) return
    if (currentUser) {
        if (loginBtn) loginBtn.style.display = 'none'
        if (userMenu) {
            userMenu.style.display = 'flex'
            const avatar = userMenu.querySelector('.user-avatar')
            const name = userMenu.querySelector('.user-name')
            if (avatar) avatar.textContent = (currentUser.email?.[0] || '?').toUpperCase()
            if (name) name.textContent = currentUser.email?.split('@')[0] || '用户'
        }
    } else {
        if (loginBtn) loginBtn.style.display = 'inline-flex'
        if (userMenu) userMenu.style.display = 'none'
    }
}

async function loginWithEmail(email, password) {
    if (!supabase) throw new Error('Supabase 未初始化')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
}

async function signUp(email, password) {
    if (!supabase) throw new Error('Supabase 未初始化')
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    return data
}

async function logout() {
    if (supabase) await supabase.auth.signOut()
}

async function getQuotes() {
    if (!supabase) return []
    const { data } = await supabase.from('quotes').select('*').order('created_at', { ascending: false })
    return data || []
}

async function addQuote(text, type, nickname) {
    if (!supabase) throw new Error('Supabase 未初始化')
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase.from('quotes').insert([
        { text, type, nickname: nickname || '匿名群友', user_id: user?.id }
    ]).select()
    if (error) throw error
    return data
}

// ===== 登录弹窗 =====
function showLoginModal() {
    const modal = document.getElementById('loginModal')
    if (modal) {
        modal.style.display = 'flex'
    } else {
        // 如果弹窗还没创建就创建
        createLoginModal()
        setTimeout(() => {
            const m = document.getElementById('loginModal')
            if (m) m.style.display = 'flex'
        }, 50)
    }
}

function hideLoginModal() {
    const modal = document.getElementById('loginModal')
    if (modal) modal.style.display = 'none'
}

function createLoginModal() {
    const div = document.createElement('div')
    div.innerHTML = `
    <div id="loginModal" style="display:none;position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.5);backdrop-filter:blur(4px);align-items:center;justify-content:center;">
        <div onclick="event.stopPropagation()" style="background:#fff;border-radius:20px;padding:32px;max-width:400px;width:90%;margin:20px;box-shadow:0 20px 60px rgba(0,0,0,0.2);">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                <h2 style="font-size:20px;color:#333;margin:0;">🔐 登录</h2>
                <span onclick="hideLoginModal()" style="cursor:pointer;font-size:24px;color:#999;line-height:1;">✕</span>
            </div>
            <div style="margin-bottom:12px;">
                <input id="loginEmail" type="email" placeholder="邮箱" style="width:100%;padding:12px 16px;border:2px solid #eee;border-radius:12px;font-size:15px;outline:none;box-sizing:border-box;" onfocus="this.style.borderColor='#e94560'" onblur="this.style.borderColor='#eee'">
            </div>
            <div style="margin-bottom:16px;">
                <input id="loginPassword" type="password" placeholder="密码" style="width:100%;padding:12px 16px;border:2px solid #eee;border-radius:12px;font-size:15px;outline:none;box-sizing:border-box;" onfocus="this.style.borderColor='#e94560'" onblur="this.style.borderColor='#eee'">
            </div>
            <p id="loginError" style="color:#e74c3c;font-size:13px;margin-bottom:12px;display:none;"></p>
            <button onclick="handleLogin()" style="width:100%;padding:12px;border:none;border-radius:12px;background:linear-gradient(135deg,#e94560,#f5a623);color:#fff;font-size:16px;font-weight:700;cursor:pointer;">登录</button>
            <p style="text-align:center;margin-top:12px;font-size:13px;color:#888;">没有账号？<span onclick="showRegister()" style="color:#e94560;cursor:pointer;text-decoration:underline;">注册</span></p>
            <div id="registerArea" style="display:none;margin-top:12px;">
                <button onclick="handleRegister()" style="width:100%;padding:12px;border:2px solid #e94560;border-radius:12px;background:transparent;color:#e94560;font-size:15px;font-weight:600;cursor:pointer;">注册新账号</button>
                <p style="font-size:12px;color:#aaa;text-align:center;margin-top:6px;">注册后会收到验证邮件</p>
            </div>
        </div>
    </div>`
    document.body.appendChild(div.firstElementChild)
}

async function handleLogin() {
    const email = document.getElementById('loginEmail').value.trim()
    const password = document.getElementById('loginPassword').value.trim()
    const err = document.getElementById('loginError')
    if (!email || !password) { err.textContent = '⚠️ 请填写邮箱和密码'; err.style.display = 'block'; err.style.color = '#e74c3c'; return }
    try {
        await loginWithEmail(email, password)
        hideLoginModal()
    } catch (e) { err.textContent = '⚠️ ' + e.message; err.style.display = 'block'; err.style.color = '#e74c3c' }
}

async function handleRegister() {
    const email = document.getElementById('loginEmail').value.trim()
    const password = document.getElementById('loginPassword').value.trim()
    const err = document.getElementById('loginError')
    if (!email || !password) { err.textContent = '⚠️ 请填写邮箱和密码'; err.style.display = 'block'; err.style.color = '#e74c3c'; return }
    if (password.length < 6) { err.textContent = '⚠️ 密码至少6位'; err.style.display = 'block'; err.style.color = '#e74c3c'; return }
    try {
        await signUp(email, password)
        err.textContent = '✅ 注册成功！请检查邮箱验证链接'; err.style.color = '#27ae60'; err.style.display = 'block'
    } catch (e) { err.textContent = '⚠️ ' + e.message; err.style.display = 'block'; err.style.color = '#e74c3c' }
}

function showRegister() {
    const ra = document.getElementById('registerArea')
    ra.style.display = ra.style.display === 'none' ? 'block' : 'none'
}

// 启动
initSupabase()

// 创建弹窗 & 绑定登录按钮
document.addEventListener('DOMContentLoaded', () => {
    createLoginModal()
})