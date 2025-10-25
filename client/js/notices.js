// ===== Notices Module =====

const Notices = {
    init() {
        this.loadNotices();
        this.setupEventListeners();
    },

    setupEventListeners() {
        const addBtn = document.getElementById('addNoticeBtn');
        const searchInput = document.getElementById('noticeSearch');
        const priorityFilter = document.getElementById('noticePriority');

        if (addBtn) addBtn.addEventListener('click', () => this.showAddNoticeModal());
        if (searchInput) searchInput.addEventListener('input', (e) => this.filterNotices(e.target.value));
        if (priorityFilter) priorityFilter.addEventListener('change', (e) => this.filterByPriority(e.target.value));
    },

    async loadNotices() {
        try {
            const notices = await API.notices.getAll();
            this.renderNotices(notices);
            this.updateStats(notices);
        } catch (error) {
            const notices = Storage.getItems('notices');
            this.renderNotices(notices);
            this.updateStats(notices);
        }
    },

    renderNotices(notices) {
        const grid = document.getElementById('noticesGrid');
        if (!grid) return;

        if (notices.length === 0) {
            Utils.showEmptyState(grid, 'clipboard', 'No Notices Found', 'Start by creating your first notice');
            return;
        }

        grid.innerHTML = notices.map(notice => `
            <div class="card" data-id="${notice.id}">
                <div class="card-header">
                    <div>
                        <h3 class="card-title">${notice.title}</h3>
                        <span class="card-badge badge-${notice.priority}">${notice.priority}</span>
                    </div>
                </div>
                <div class="card-content">
                    <p class="card-description">${notice.content}</p>
                    <div class="card-meta">
                        <span><i class="fas fa-user"></i> ${notice.author}</span>
                        <span><i class="fas fa-clock"></i> ${Utils.getTimeAgo(notice.created_at || notice.createdAt)}</span>
                    </div>
                </div>
                <div class="card-footer">
                    <span style="color: var(--gray-600); font-size: 0.85rem;">
                        Posted ${Utils.formatDate(notice.created_at || notice.createdAt)}
                    </span>
                    <div class="card-actions">
                        <button class="btn-icon btn-delete" onclick="Notices.deleteNotice(${notice.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    },

    showAddNoticeModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-header">
                <h2 class="modal-title">Add New Notice</h2>
                <button class="modal-close" onclick="this.closest('.modal-container').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <form id="noticeForm">
                    <div class="form-group">
                        <label class="form-label">Notice Title</label>
                        <input type="text" class="form-input" name="title" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Content</label>
                        <textarea class="form-textarea" name="content" rows="6" required></textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Priority</label>
                        <select class="form-select" name="priority" required>
                            <option value="normal">Normal</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Author</label>
                        <input type="text" class="form-input" name="author" required>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="this.closest('.modal-container').remove()">Cancel</button>
                <button class="btn-primary" onclick="Notices.saveNotice()">Post Notice</button>
            </div>
        `;

        const container = document.getElementById('modalContainer');
        container.innerHTML = '';
        container.appendChild(modal);
        container.classList.add('active');
    },

    async saveNotice() {
        const form = document.getElementById('noticeForm');
        const formData = new FormData(form);
        
        const notice = {
            title: formData.get('title'),
            content: formData.get('content'),
            priority: formData.get('priority'),
            author: formData.get('author')
        };

        try {
            await API.notices.create(notice);
            this.loadNotices();
            document.getElementById('modalContainer').classList.remove('active');
            Utils.showToast('Notice posted successfully!', 'success');
        } catch (error) {
            Utils.showToast(error.message || 'Failed to post notice', 'error');
        }
    },

    async deleteNotice(id) {
        if (confirm('Are you sure you want to delete this notice?')) {
            try {
                await API.notices.delete(id);
                this.loadNotices();
                Utils.showToast('Notice deleted successfully!', 'success');
            } catch (error) {
                Utils.showToast(error.message || 'Failed to delete notice', 'error');
            }
        }
    },

    filterNotices(searchTerm) {
        const cards = document.querySelectorAll('#noticesGrid .card');
        cards.forEach(card => {
            const title = card.querySelector('.card-title').textContent.toLowerCase();
            const description = card.querySelector('.card-description').textContent.toLowerCase();
            const matches = title.includes(searchTerm.toLowerCase()) || description.includes(searchTerm.toLowerCase());
            card.style.display = matches ? '' : 'none';
        });
    },

    async filterByPriority(priority) {
        try {
            const notices = priority === 'all' 
                ? await API.notices.getAll() 
                : await API.notices.getAll(priority);
            this.renderNotices(notices);
        } catch (error) {
            Utils.showToast('Failed to filter notices', 'error');
        }
    },

    updateStats(notices) {
        const totalNoticesEl = document.getElementById('totalNotices');
        if (totalNoticesEl) totalNoticesEl.textContent = notices.length;
    }
};
