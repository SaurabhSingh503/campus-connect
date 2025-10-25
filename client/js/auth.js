// ===== Authentication Module (LocalStorage Version - Works Immediately!) =====

const Auth = {
    currentUser: null,

    init() {
        console.log('Auth module initializing...');
        this.loadCurrentUser();
        this.setupEventListeners();
    },

    loadCurrentUser() {
        const user = localStorage.getItem('currentUser');
        if (user) {
            this.currentUser = JSON.parse(user);
            this.updateUIForLoggedInUser();
        }
    },

    setupEventListeners() {
        const loginBtn = document.getElementById('loginBtn');
        const signupBtn = document.getElementById('signupBtn');

        if (loginBtn) loginBtn.addEventListener('click', () => this.showLoginModal());
        if (signupBtn) signupBtn.addEventListener('click', () => this.showSignupModal());
    },

    showLoginModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-header">
                <h2 class="modal-title">Login</h2>
                <button class="modal-close" type="button">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <form id="loginForm">
                    <div class="form-group">
                        <label class="form-label">Email</label>
                        <input type="email" class="form-input" name="email" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Password</label>
                        <input type="password" class="form-input" name="password" required>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" type="button" id="cancelLoginBtn">Cancel</button>
                <button class="btn-primary" type="button" id="submitLoginBtn">Login</button>
            </div>
        `;

        const container = document.getElementById('modalContainer');
        container.innerHTML = '';
        container.appendChild(modal);
        container.classList.add('active');

        modal.querySelector('.modal-close').addEventListener('click', () => this.closeModal());
        modal.querySelector('#cancelLoginBtn').addEventListener('click', () => this.closeModal());
        modal.querySelector('#submitLoginBtn').addEventListener('click', () => this.handleLogin());
    },

    showSignupModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-header">
                <h2 class="modal-title">Sign Up</h2>
                <button class="modal-close" type="button">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <form id="signupForm">
                    <div class="form-group">
                        <label class="form-label">Full Name</label>
                        <input type="text" class="form-input" name="name" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Email</label>
                        <input type="email" class="form-input" name="email" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Password</label>
                        <input type="password" class="form-input" name="password" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Role</label>
                        <select class="form-select" name="role" required>
                            <option value="student">Student</option>
                            <option value="faculty">Faculty</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" type="button" id="cancelSignupBtn">Cancel</button>
                <button class="btn-primary" type="button" id="submitSignupBtn">Sign Up</button>
            </div>
        `;

        const container = document.getElementById('modalContainer');
        container.innerHTML = '';
        container.appendChild(modal);
        container.classList.add('active');

        modal.querySelector('.modal-close').addEventListener('click', () => this.closeModal());
        modal.querySelector('#cancelSignupBtn').addEventListener('click', () => this.closeModal());
        modal.querySelector('#submitSignupBtn').addEventListener('click', () => this.handleSignup());
    },

    closeModal() {
        const container = document.getElementById('modalContainer');
        container.classList.remove('active');
        setTimeout(() => container.innerHTML = '', 300);
    },

    handleLogin() {
        const form = document.getElementById('loginForm');
        const formData = new FormData(form);
        
        const email = formData.get('email');
        const password = formData.get('password');

        // Get stored users
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            this.currentUser = { name: user.name, email: user.email, role: user.role };
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            this.updateUIForLoggedInUser();
            this.closeModal();
            Utils.showToast('Login successful!', 'success');
        } else {
            Utils.showToast('Invalid email or password', 'error');
        }
    },

    handleSignup() {
        const form = document.getElementById('signupForm');
        const formData = new FormData(form);
        
        const name = formData.get('name');
        const email = formData.get('email');
        const password = formData.get('password');
        const role = formData.get('role');

        if (!name || !email || !password || !role) {
            Utils.showToast('Please fill in all fields', 'error');
            return;
        }

        // Get existing users
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // Check if email already exists
        if (users.find(u => u.email === email)) {
            Utils.showToast('Email already registered', 'error');
            return;
        }

        // Add new user
        const newUser = { name, email, password, role };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        // Auto login
        this.currentUser = { name, email, role };
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        this.updateUIForLoggedInUser();
        
        this.closeModal();
        Utils.showToast('Account created successfully!', 'success');
    },

    updateUIForLoggedInUser() {
        const authButtons = document.querySelector('.auth-buttons');
        if (authButtons && this.currentUser) {
            authButtons.innerHTML = `
                <div style="display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;">
                    <span style="color: var(--dark-color); font-weight: 500;">Welcome, ${this.currentUser.name}</span>
                    <button class="btn-secondary" type="button" id="logoutBtn">Logout</button>
                </div>
            `;
            
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => this.logout());
            }
        }
    },

    logout() {
        localStorage.removeItem('currentUser');
        this.currentUser = null;
        Utils.showToast('Logged out successfully', 'success');
        setTimeout(() => window.location.reload(), 1000);
    }
};
