// ===== 瑜伽裤百科 · Supabase 配置 =====
const SUPABASE_URL = 'https://pqvjztbxgtgbohrmaqhr.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_IL7Xyr1MK3Aa8-YGF41NzQ_cYBxM9Bz'

// 初始化 Supabase 客户端
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ===== 用户状态管理 =====
let currentUser = null

// 监听登录状态
supabase.auth.onAuthStateChange((event, session) => {
    currentUser = session?.user || null
    updateUI()
})

// 获取当前用户
async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    currentUser = user
    updateUI()
    return user
}

// ===== UI 更新 =====
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

// ===== 登录 =====
async function loginWithEmail(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
}

// ===== 注册 =====
async function signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    return data
}

// ===== 退出 =====
async function logout() {
    await supabase.auth.signOut()
}

// ===== 加载用户 =====
getCurrentUser()

// ===== 语录操作 =====
async function getQuotes() {
    const { data } = await supabase.from('quotes').select('*').order('created_at', { ascending: false })
    return data || []
}

async function addQuote(text, type, nickname) {
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase.from('quotes').insert([
        { text, type, nickname: nickname || '匿名群友', user_id: user?.id }
    ]).select()
    if (error) throw error
    return data
}

// ===== 论坛操作 =====
async function getPosts() {
    const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false })
    return data || []
}

async function addPost(title, content, category) {
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase.from('posts').insert([
        { title, content, category, user_id: user?.id }
    ]).select()
    if (error) throw error
    return data
}

// ===== 登录弹窗 =====
function showLoginModal() {
    const modal = document.getElementById('loginModal')
    if (modal) modal.style.display = 'flex'
}

function hideLoginModal() {
    const modal = document.getElementById('loginModal')
    if (modal) modal.style.display = 'none'
}

// 当 DOM 加载完成
document.addEventListener('DOMContentLoaded', () => {
    // 创建登录弹窗
    const modalHTML = `
    <div id="loginModal" style="display:none;position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.5);backdrop-filter:blur(4px);align-items:center;justify-content:center;">
        <div style="background:#fff;border-radius:20px;padding:32px;max-width:400px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,0.2);">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                <h2 style="font-size:20px;color:#333;">🔐 登录</h2>
                <span onclick="hideLoginModal()" style="cursor:pointer;font-size:24px;color:#999;">✕</span>
            </div>
            <div style="margin-bottom:12px;">
                <input id="loginEmail" type="email" placeholder="邮箱" style="width:100%;padding:12px 16px;border:2px solid #eee;border-radius:12px;font-size:15px;outline:none;" onfocus="this.style.borderColor='#e94560'" onblur="this.style.borderColor='#eee'">
            </div>
            <div style="margin-bottom:20px;">
                <input id="loginPassword" type="password" placeholder="密码" style="width:100%;padding:12px 16px;border:2px solid #eee;border-radius:12px;font-size:15px;outline:none;" onfocus="this.style.borderColor='#e94560'" onblur="this.style.borderColor='#eee'">
            </div>
            <p id="loginError" style="color:#e74c3c;font-size:13px;margin-bottom:12px;display:none;"></p>
            <button onclick="handleLogin()" style="width:100%;padding:12px;border:none;border-radius:12px;background:linear-gradient(135deg,#e94560,#f5a623);color:#fff;font-size:16px;font-weight:700;cursor:pointer;transition:all.15s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform=''">登录</button>
            <p style="text-align:center;margin-top:12px;font-size:13px;color:#888;">没有账号？<span onclick="showRegister()" style="color:#e94560;cursor:pointer;">注册</span></p>
            <p id="registerArea" style="display:none;margin-top:12px;">
            <button onclick="handleRegister()" style="width:100%;padding:10px;border:2px solid #e94560;border-radius:12px;background:transparent;color:#e94560;font-size:15px;font-weight:600;cursor:pointer;">注册新账号</button>
            <p style="font-size:12px;color:#aaa;text-align:center;margin-top:6px;">注册后会收到验证邮件</p>
            </p>
        </div>
    </div>`

    // 如果还没有弹窗就添加
    if (!document.getElementById('loginModal')) {
        const div = document.createElement('div')
        div.innerHTML = modalHTML
        document.body.appendChild(div.firstElementChild)
    }
})

async function handleLogin() {
    const email = document.getElementById('loginEmail').value.trim()
    const password = document.getElementById('loginPassword').value.trim()
    const err = document.getElementById('loginError')
    if (!email || !password) { err.textContent = '⚠️ 请填写邮箱和密码'; err.style.display = 'block'; return }
    try {
        await loginWithEmail(email, password)
        hideLoginModal()
    } catch (e) { err.textContent = '⚠️ ' + e.message; err.style.display = 'block' }
}

async function handleRegister() {
    const email = document.getElementById('loginEmail').value.trim()
    const password = document.getElementById('loginPassword').value.trim()
    const err = document.getElementById('loginError')
    if (!email || !password) { err.textContent = '⚠️ 请填写邮箱和密码'; err.style.display = 'block'; return }
    if (password.length < 6) { err.textContent = '⚠️ 密码至少6位'; err.style.display = 'block'; return }
    try {
        await signUp(email, password)
        err.textContent = '✅ 注册成功！请检查邮箱验证链接（可能在垃圾箱）'; err.style.color = '#27ae60'; err.style.display = 'block'
    } catch (e) { err.textContent = '⚠️ ' + e.message; err.style.display = 'block'; err.style.color = '#e74c3c' }
}

function showRegister() {
    const ra = document.getElementById('registerArea')
    ra.style.display = ra.style.display === 'none' ? 'block' : 'none'
}