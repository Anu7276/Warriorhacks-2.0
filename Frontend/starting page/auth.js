const API_BASE = '/api/auth';
let activeEmailForOtp = '';

// Check logged in status on page load
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        fetchUserProfile();
    }
});

// UI Tab Switcher
function switchTab(tab) {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const otpForm = document.getElementById('otp-form');
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const tabsHeader = document.getElementById('auth-tabs');

    if (tabsHeader) tabsHeader.style.display = 'flex';
    if (loginForm) loginForm.style.display = 'none';
    if (registerForm) registerForm.style.display = 'none';
    if (otpForm) otpForm.style.display = 'none';

    if (tabLogin) {
        tabLogin.style.background = 'transparent';
        tabLogin.style.color = '#64748b';
        tabLogin.style.boxShadow = 'none';
    }
    if (tabRegister) {
        tabRegister.style.background = 'transparent';
        tabRegister.style.color = '#64748b';
        tabRegister.style.boxShadow = 'none';
    }

    if (tab === 'login') {
        if (loginForm) loginForm.style.display = 'flex';
        if (tabLogin) {
            tabLogin.style.background = '#ffffff';
            tabLogin.style.color = '#0d3526';
            tabLogin.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
        }
    } else if (tab === 'register') {
        if (registerForm) registerForm.style.display = 'flex';
        if (tabRegister) {
            tabRegister.style.background = '#ffffff';
            tabRegister.style.color = '#0d3526';
            tabRegister.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
        }
    } else if (tab === 'otp') {
        if (tabsHeader) tabsHeader.style.display = 'none';
        if (otpForm) otpForm.style.display = 'flex';
    }
}

// Password visibility toggle
function togglePasswordVisibility(inputId, btn) {
    const input = document.getElementById(inputId);
    const icon = btn.querySelector('i');
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Toast Notifications
function showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = 'position:fixed;top:24px;right:24px;z-index:99999;display:flex;flex-direction:column;gap:12px;pointer-events:none;font-family:"Plus Jakarta Sans",sans-serif;';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let borderAccent = '#10b981';
    let iconClass = 'fa-circle-check';
    if (type === 'error') { borderAccent = '#ef4444'; iconClass = 'fa-triangle-exclamation'; }
    if (type === 'info') { borderAccent = '#3b82f6'; iconClass = 'fa-circle-info'; }

    toast.style.cssText = `pointer-events:auto;min-width:300px;max-width:400px;background:rgba(15,23,42,0.95);backdrop-filter:blur(12px);color:#fff;padding:14px 18px;border-radius:14px;box-shadow:0 16px 36px -4px rgba(0,0,0,0.3);font-size:13px;font-weight:600;display:flex;align-items:center;gap:12px;border:1px solid rgba(255,255,255,0.12);border-left:4px solid ${borderAccent};transition:all 0.3s cubic-bezier(0.16,1,0.3,1);`;
    
    toast.innerHTML = `<i class="fa-solid ${iconClass}" style="color:${borderAccent};font-size:16px;"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(40px)';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// REGISTER HANDLER
async function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('reg-username').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;

    const btn = document.getElementById('register-btn');
    btn.disabled = true;
    btn.innerHTML = '<span>Creating Account...</span> <i class="fa-solid fa-spinner fa-spin"></i>';

    try {
        const response = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            showToast('Registration successful! Please verify your OTP code.', 'success');
            activeEmailForOtp = email;
            const targetEl = document.getElementById('target-otp-email');
            if (targetEl) targetEl.innerText = email;
            switchTab('otp');
        } else {
            showToast(data.message || 'Registration failed', 'error');
        }
    } catch (err) {
        showToast('Network error connecting to backend server', 'error');
        console.error(err);
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<span>Create Account</span> <i class="fa-solid fa-user-check"></i>';
    }
}

// VERIFY OTP HANDLER
async function handleVerifyOtp(e) {
    e.preventDefault();
    const otp = document.getElementById('otp-code').value.trim();
    const email = activeEmailForOtp || document.getElementById('reg-email').value.trim();

    if (!email) {
        showToast('Missing email address for OTP verification', 'error');
        return;
    }

    const btn = document.getElementById('otp-btn');
    btn.disabled = true;
    btn.innerHTML = '<span>Verifying...</span> <i class="fa-solid fa-spinner fa-spin"></i>';

    try {
        const response = await fetch(`${API_BASE}/verify-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp })
        });

        const data = await response.json();

        if (response.ok) {
            showToast('Account verified! Redirecting to your profile...', 'success');
            if (data.accessToken) {
                localStorage.setItem('accessToken', data.accessToken);
            }
            localStorage.setItem('ayush_user_profile', JSON.stringify({
                isLoggedIn: true,
                user: data.user || { email, username: email.split('@')[0] },
                token: data.accessToken || ''
            }));
            setTimeout(() => {
                window.location.href = '/profile/';
            }, 700);
        } else {
            showToast(data.message || 'Invalid or expired OTP', 'error');
        }
    } catch (err) {
        showToast('Network error verifying OTP', 'error');
        console.error(err);
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<span>Verify Email</span> <i class="fa-solid fa-check-double"></i>';
    }
}

// LOGIN HANDLER
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    const btn = document.getElementById('login-btn');
    btn.disabled = true;
    btn.innerHTML = '<span>Authenticating...</span> <i class="fa-solid fa-spinner fa-spin"></i>';

    try {
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            showToast('Logged in successfully! Redirecting to profile...', 'success');
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('ayush_user_profile', JSON.stringify({
                isLoggedIn: true,
                user: data.user,
                token: data.accessToken
            }));
            renderDashboard(data.user, data.accessToken);
            setTimeout(() => {
                window.location.href = '/profile/';
            }, 700);
        } else {
            showToast(data.message || 'Invalid credentials', 'error');
            if (data.message && data.message.toLowerCase().includes('email not verified')) {
                activeEmailForOtp = email;
                const targetEl = document.getElementById('target-otp-email');
                if (targetEl) targetEl.innerText = email;
                switchTab('otp');
            }
        }
    } catch (err) {
        showToast('Network error during login', 'error');
        console.error(err);
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<span>Sign In</span> <i class="fa-solid fa-arrow-right"></i>';
    }
}

// FETCH USER PROFILE
async function fetchUserProfile() {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
        const response = await fetch(`${API_BASE}/get-me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (response.ok && data.user) {
            renderDashboard(data.user, token);
        } else {
            attemptRefreshToken();
        }
    } catch (err) {
        console.error('Error fetching profile:', err);
    }
}

// REFRESH TOKEN FALLBACK
async function attemptRefreshToken() {
    try {
        const response = await fetch(`${API_BASE}/refresh-token`, {
            method: 'GET'
        });
        const data = await response.json();
        if (response.ok && data.accessToken) {
            localStorage.setItem('accessToken', data.accessToken);
            fetchUserProfile();
        } else {
            localStorage.removeItem('accessToken');
            showLoggedOutUI();
        }
    } catch (err) {
        localStorage.removeItem('accessToken');
        showLoggedOutUI();
    }
}

// LOGOUT HANDLER
async function handleLogout() {
    try {
        await fetch(`${API_BASE}/logout`, { method: 'GET' });
    } catch (err) {
        console.error(err);
    } finally {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('ayush_user_profile');
        showToast('Logged out successfully', 'info');
        showLoggedOutUI();
    }
}

// LOGOUT ALL DEVICES HANDLER
async function handleLogoutAll() {
    try {
        await fetch(`${API_BASE}/logout-all`, { method: 'GET' });
    } catch (err) {
        console.error(err);
    } finally {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('ayush_user_profile');
        showToast('Logged out from all devices', 'info');
        showLoggedOutUI();
    }
}

// Modal / Navigation Controls
function openAuthModal(e) {
    if (e) e.preventDefault();

    const token = localStorage.getItem('accessToken');
    const savedProfile = localStorage.getItem('ayush_user_profile');
    let isLoggedIn = false;

    if (token) isLoggedIn = true;
    if (savedProfile) {
        try {
            const parsed = JSON.parse(savedProfile);
            if (parsed && parsed.isLoggedIn) isLoggedIn = true;
        } catch (err) {}
    }

    if (isLoggedIn) {
        window.location.href = '/profile/';
    } else {
        window.location.href = '/auth';
    }
}

function closeAuthModal() {
    const modal = document.getElementById('auth-modal-overlay');
    if (modal) {
        modal.style.display = 'none';
    }
}

// RENDER DASHBOARD
function renderDashboard(user, token) {
    const navLink = document.getElementById('nav-login-link');
    if (navLink) {
        navLink.innerHTML = `<a href="/profile/" style="color:#2e6b3e;font-weight:700;text-decoration:none;"><i class="fa-solid fa-circle-user" style="margin-right:4px;"></i> ${user.username} (Profile)</a>`;
    }

    const authCard = document.getElementById('auth-card');
    const dashCard = document.getElementById('dashboard-card');
    if (authCard) authCard.classList.add('hidden');
    if (dashCard) dashCard.classList.remove('hidden');

    const dashUsername = document.getElementById('dash-username');
    const dashUserVal = document.getElementById('dash-user-val');
    const dashEmailVal = document.getElementById('dash-email-val');
    const dashTokenVal = document.getElementById('dash-token-val');

    if (dashUsername) dashUsername.innerText = `Welcome, ${user.username}!`;
    if (dashUserVal) dashUserVal.innerText = user.username;
    if (dashEmailVal) dashEmailVal.innerText = user.email;
    if (dashTokenVal) dashTokenVal.innerText = token || 'Cookie session active';
}

// SHOW LOGGED OUT UI
function showLoggedOutUI() {
    const navLink = document.getElementById('nav-login-link');
    if (navLink) {
        navLink.innerText = 'Login / Register';
    }

    const dashCard = document.getElementById('dashboard-card');
    const authCard = document.getElementById('auth-card');
    if (dashCard) dashCard.classList.add('hidden');
    if (authCard) authCard.classList.remove('hidden');
    switchTab('login');
}
