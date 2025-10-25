// ===== Complaints Module =====

const Complaints = {
    init() {
        this.loadComplaints();
        this.setupEventListeners();
    },

    setupEventListeners() {
        const addBtn = document.getElementById('addComplaintBtn');
        if (addBtn) addBtn.addEventListener('click', () => this.showAddComplaintModal());
    },

    async loadComplaints() {
        try {
            const complaints = await API.complaints.getAll();
            this.renderComplaints(complaints);
            this.updateStats(complaints);
        } catch (error) {
            const complaints = Storage.getItems('complaints') || [];
            this.renderComplaints(complaints);
            this.updateStats(complaints);
        }
    },

    renderComplaints(complaints) {
        const grid = document.getElementById('complaintsGrid');
        if (!grid) return;

        if (complaints.length === 0) {
            Utils.showEmptyState(grid, 'comment-alt', 'No Complaints', 'Submit your first complaint');
            return;
        }

        grid.innerHTML = complaints.map(complaint => `
            <div class="card" data-id="${complaint.id}">
                <div class="card-header">
                    <div>
                        <h3 class="card-title">${complaint.title}</h3>
                        <span class="card-badge badge-${complaint.status}">${complaint.status}</span>
                    </div>
                </div>
                <div class="card-content">
                    <p class="card-description">${complaint.description}</p>
                    <div class="card-meta">
                        <span><i class="fas fa-tag"></i> ${complaint.category}</span>
                        <span><i class="fas fa-clock"></i> ${Utils.getTimeAgo(complaint.created_at || complaint.createdAt)}</span>
                    </div>
                </div>
                <div class="card-footer">
                    <span style="color: var(--gray-600); font-size: 0.85rem;">
                        ID: ${complaint.id.toString().substr(0, 8)}
                    </span>
                    <div class="card-actions">
                        <button class="btn-icon btn-edit" onclick="Complaints.updateStatus(${complaint.id})">
                            <i class="fas fa-sync"></i>
                        </button>
                        <button class="btn-icon btn-delete" onclick="Complaints.deleteComplaint(${complaint.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    },

    showAddComplaintModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-header">
                <h2 class="modal-title">Submit Complaint</h2>
                <button class="modal-close" onclick="this.closest('.modal-container').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <form id="complaintForm">
                    <div class="form-group">
                        <label class="form-label">Title</label>
                        <input type="text" class="form-input" name="title" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Description</label>
                        <textarea class="form-textarea" name="description" rows="5" required></textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Category</label>
                        <select class="form-select" name="category" required>
                            <option value="hostel">Hostel</option>
                            <option value="academics">Academics</option>
                            <option value="infrastructure">Infrastructure</option>
                            <option value="canteen">Canteen</option>
                            <option value="transport">Transport</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="this.closest('.modal-container').remove()">Cancel</button>
                <button class="btn-primary" onclick="Complaints.saveComplaint()">Submit</button>
            </div>
        `;

        const container = document.getElementById('modalContainer');
        container.innerHTML = '';
        container.appendChild(modal);
        container.classList.add('active');
    },

    async saveComplaint() {
        const form = document.getElementById('complaintForm');
        const formData = new FormData(form);
        
        const complaint = {
            title: formData.get('title'),
            description: formData.get('description'),
            category: formData.get('category')
        };

        try {
            await API.complaints.create(complaint);
            this.loadComplaints();
            document.getElementById('modalContainer').classList.remove('active');
            Utils.showToast('Complaint submitted successfully!', 'success');
        } catch (error) {
            Utils.showToast(error.message || 'Failed to submit complaint', 'error');
        }
    },

    async updateStatus(id) {
        const statuses = ['pending', 'in-progress', 'resolved'];
        const complaint = await API.complaints.getById(id);
        const currentIndex = statuses.indexOf(complaint.status);
        const nextStatus = statuses[(currentIndex + 1) % statuses.length];

        try {
            await API.complaints.updateStatus(id, nextStatus);
            this.loadComplaints();
            Utils.showToast(`Status updated to ${nextStatus}`, 'success');
        } catch (error) {
            Utils.showToast('Failed to update status', 'error');
        }
    },

    async deleteComplaint(id) {
        if (confirm('Are you sure you want to delete this complaint?')) {
            try {
                await API.complaints.delete(id);
                this.loadComplaints();
                Utils.showToast('Complaint deleted successfully!', 'success');
            } catch (error) {
                Utils.showToast('Failed to delete complaint', 'error');
            }
        }
    },

    updateStats(complaints) {
        const pending = complaints.filter(c => c.status === 'pending').length;
        const inProgress = complaints.filter(c => c.status === 'in-progress').length;
        const resolved = complaints.filter(c => c.status === 'resolved').length;

        const pendingEl = document.getElementById('pendingComplaints');
        const inProgressEl = document.getElementById('inProgressComplaints');
        const resolvedEl = document.getElementById('resolvedComplaints');

        if (pendingEl) pendingEl.textContent = pending;
        if (inProgressEl) inProgressEl.textContent = inProgress;
        if (resolvedEl) resolvedEl.textContent = resolved;
    }
};
