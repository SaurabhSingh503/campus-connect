// ===== Feedback Module =====

const Feedback = {
    init() {
        this.loadFeedback();
        this.setupEventListeners();
    },

    setupEventListeners() {
        const addBtn = document.getElementById('addFeedbackBtn');
        if (addBtn) addBtn.addEventListener('click', () => this.showAddFeedbackModal());
    },

    async loadFeedback() {
        try {
            const feedback = await API.feedback.getAll();
            this.renderFeedback(feedback);
            this.updateStats(feedback);
        } catch (error) {
            const feedback = Storage.getItems('feedback') || [];
            this.renderFeedback(feedback);
            this.updateStats(feedback);
        }
    },

    renderFeedback(feedback) {
        const grid = document.getElementById('feedbackGrid');
        if (!grid) return;

        if (feedback.length === 0) {
            Utils.showEmptyState(grid, 'comment-dots', 'No Feedback Yet', 'Share your suggestions');
            return;
        }

        grid.innerHTML = feedback.map(item => `
            <div class="card" data-id="${item.id}">
                <div class="card-header">
                    <div>
                        <h3 class="card-title">${item.title}</h3>
                        <div style="color: var(--warning-color); font-size: 1.1rem;">
                            ${'★'.repeat(item.rating)}${'☆'.repeat(5-item.rating)}
                        </div>
                    </div>
                </div>
                <div class="card-content">
                    <p class="card-description">${item.message}</p>
                    <div class="card-meta">
                        <span><i class="fas fa-tag"></i> ${item.category}</span>
                        <span><i class="fas fa-clock"></i> ${Utils.getTimeAgo(item.created_at || item.createdAt)}</span>
                    </div>
                </div>
                <div class="card-footer">
                    <span style="color: var(--gray-600); font-size: 0.85rem;">
                        Anonymous Feedback
                    </span>
                    <div class="card-actions">
                        <button class="btn-icon btn-delete" onclick="Feedback.deleteFeedback(${item.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    },

    showAddFeedbackModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-header">
                <h2 class="modal-title">Submit Feedback</h2>
                <button class="modal-close" onclick="this.closest('.modal-container').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <form id="feedbackForm">
                    <div class="form-group">
                        <label class="form-label">Title</label>
                        <input type="text" class="form-input" name="title" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Category</label>
                        <select class="form-select" name="category" required>
                            <option value="academics">Academics</option>
                            <option value="infrastructure">Infrastructure</option>
                            <option value="facilities">Facilities</option>
                            <option value="events">Events</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Rating</label>
                        <select class="form-select" name="rating" required>
                            <option value="5">5 - Excellent</option>
                            <option value="4">4 - Good</option>
                            <option value="3">3 - Average</option>
                            <option value="2">2 - Poor</option>
                            <option value="1">1 - Very Poor</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Message</label>
                        <textarea class="form-textarea" name="message" rows="5" required></textarea>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="this.closest('.modal-container').remove()">Cancel</button>
                <button class="btn-primary" onclick="Feedback.saveFeedback()">Submit</button>
            </div>
        `;

        const container = document.getElementById('modalContainer');
        container.innerHTML = '';
        container.appendChild(modal);
        container.classList.add('active');
    },

    async saveFeedback() {
        const form = document.getElementById('feedbackForm');
        const formData = new FormData(form);
        
        const feedback = {
            title: formData.get('title'),
            category: formData.get('category'),
            rating: parseInt(formData.get('rating')),
            message: formData.get('message')
        };

        try {
            await API.feedback.create(feedback);
            this.loadFeedback();
            document.getElementById('modalContainer').classList.remove('active');
            Utils.showToast('Feedback submitted successfully!', 'success');
        } catch (error) {
            Utils.showToast(error.message || 'Failed to submit feedback', 'error');
        }
    },

    async deleteFeedback(id) {
        if (confirm('Are you sure you want to delete this feedback?')) {
            try {
                await API.feedback.delete(id);
                this.loadFeedback();
                Utils.showToast('Feedback deleted successfully!', 'success');
            } catch (error) {
                Utils.showToast('Failed to delete feedback', 'error');
            }
        }
    },

    updateStats(feedback) {
        const totalFeedbackEl = document.getElementById('totalFeedback');
        if (totalFeedbackEl) totalFeedbackEl.textContent = feedback.length;
    }
};
