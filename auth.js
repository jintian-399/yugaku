// ===== 瑜伽裤百科 · Supabase 配置 =====
const SUPABASE_URL = 'https://pqvjztbxgtgbohrmaqhr.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_IL7Xyr1MK3Aa8-YGF41NzQ_cYBxM9Bz'

let supabase = null
let currentUser = null

try {
    if (typeof window.supabase !== 'undefined') {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
        supabase.auth.onAuthStateChange((event, session) => {
            currentUser = session?.user || null
            updateUI()
        })
        supabase.auth.getUser().then(({ data }) => {
            currentUser = data?.user || null
            updateUI()
        })
    }
} catch(e) { console.warn(e) }

function updateUI() {
    const btn = document.getElementById('loginBtn')
    const menu = document.getElementById('userMenu')
    if (!btn && !menu) return
    if (currentUser) {
        if (btn) btn.style.display = 'none'
        if (menu) {
            menu.style.display = 'flex'
            const a = menu.querySelector('.user-avatar')
            const n = menu.querySelector('.user-name')
            if (a) a.textContent = (currentUser.email?.[0] || '?').toUpperCase()
            if (n) n.textContent = currentUser.email?.split('@')[0] || '用户'
        }
    } else {
        if (btn) btn.style.display = 'inline-flex'
        if (menu) menu.style.display = 'none'
    }
}

function showLoginModal() {
    const m = document.getElementById('loginModal')
    if (m) m.style.display = 'flex'
}

function hideLoginModal() {
    const m = document.getElementById('loginModal')
    if (m) m.style.display = 'none'
}

async function handleLogin() {
    const email = document.getElementById('loginEmail').value.trim()
    const pwd = document.getElementById('loginPassword').value.trim()
    const err = document.getElementById('loginError')
    if (!email || !pwd) { err.textContent = '请填写邮箱和密码'; err.style.display = 'block'; err.style.color = '#e74c3c'; return }
    if (!supabase) { err.textContent = 'Supabase 未加载，请刷新重试'; err.style.display = 'block'; err.style.color = '#e74c3c'; return }
    try {
        await supabase.auth.signInWithPassword({ email, password: pwd })
        hideLoginModal()
    } catch (e) { err.textContent = e.message; err.style.display = 'block'; err.style.color = '#e74c3c' }
}

async function handleRegister() {
    const email = document.getElementById('loginEmail').value.trim()
    const pwd = document.getElementById('loginPassword').value.trim()
    const err = document.getElementById('loginError')
    if (!email || !pwd) { err.textContent = '请填写邮箱和密码'; err.style.display = 'block'; err.style.color = '#e74c3c'; return }
    if (pwd.length < 6) { err.textContent = '密码至少6位'; err.style.display = 'block'; err.style.color = '#e74c3c'; return }
    if (!supabase) { err.textContent = 'Supabase 未加载，请刷新重试'; err.style.display = 'block'; err.style.color = '#e74c3c'; return }
    try {
        await supabase.auth.signUp({ email, password: pwd })
        err.textContent = '注册成功！请检查邮箱验证链接'; err.style.color = '#27ae60'; err.style.display = 'block'
    } catch (e) { err.textContent = e.message; err.style.display = 'block'; err.style.color = '#e74c3c' }
}

async function logout() { if (supabase) await supabase.auth.signOut(); currentUser = null; updateUI() }
