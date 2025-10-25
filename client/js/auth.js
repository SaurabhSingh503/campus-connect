// ===== Authentication Module =====

const Auth = {
    currentUser: null,

    init() {
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
                <form id="loginForm" onsubmit="return false;">
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

        // Add event listeners
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
                <form id="signupForm" onsubmit="return false;">
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

        // Add event listeners
        modal.querySelector('.modal-close').addEventListener('click', () => this.closeModal());
        modal.querySelector('#cancelSignupBtn').addEventListener('click', () => this.closeModal());
        modal.querySelector('#submitSignupBtn').addEventListener('click', () => this.handleSignup());
    },

    closeModal() {
        const container = document.getElementById('modalContainer');
        container.classList.remove('active');
        setTimeout(() => {
            container.innerHTML = '';
        }, 300);
    },

    async handleLogin() {
        const form = document.getElementById('loginForm');
        const formData = new FormData(form);
        
        const email = formData.get('email');
        const password = formData.get('password');

        if (!email || !password) {
            Utils.showToast('Please fill in all fields', 'error');
            return;
        }
        
        try {
            const result = await API.auth.login({ email, password });

            API.setToken(result.token);
            this.currentUser = result.user;
            localStorage.setItem('currentUser', JSON.stringify(result.user));
            this.updateUIForLoggedInUser();
            
            this.closeModal();
            Utils.showToast('Login successful!', 'success');
            
            // Refresh all modules
            setTimeout(() => {
                Events.loadEvents();
                Notices.loadNotices();
                Complaints.loadComplaints();
                Attendance.loadAttendance();
                Clubs.loadClubs();
                Feedback.loadFeedback();
            }, 500);
        } catch (error) {
            console.error('Login error:', error);
            Utils.showToast(error.message || 'Login failed', 'error');
        }
    },

    async handleSignup() {
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
        
        try {
            const result = await API.auth.signup({ name, email, password, role });

            API.setToken(result.token);
            this.currentUser = result.user;
            localStorage.setItem('currentUser', JSON.stringify(result.user));
            this.updateUIForLoggedInUser();
            
            this.closeModal();
            Utils.showToast('Account created successfully!', 'success');
            
            // Refresh all modules
            setTimeout(() => {
                Events.loadEvents();
                Notices.loadNotices();
                Complaints.loadComplaints();
                Attendance.loadAttendance();
                Clubs.loadClubs();
                Feedback.loadFeedback();
            }, 500);
        } catch (error) {
            console.error('Signup error:', error);
            Utils.showToast(error.message || 'Signup failed', 'error');
        }
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
            
            // Add logout event listener
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => this.logout());
            }
        }
    },

    logout() {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('currentUser');
            API.clearToken();
            this.currentUser = null;
            Utils.showToast('Logged out successfully', 'success');
            setTimeout(() => window.location.reload(), 1000);
        }
    }
};
