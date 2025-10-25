// ===== Clubs Module =====

const Clubs = {
    init() {
        this.loadClubs();
        this.setupEventListeners();
    },

    setupEventListeners() {
        const addBtn = document.getElementById('addClubBtn');
        const searchInput = document.getElementById('clubSearch');
        const categoryFilter = document.getElementById('clubCategory');

        if (addBtn) addBtn.addEventListener('click', () => this.showAddClubModal());
        if (searchInput) searchInput.addEventListener('input', (e) => this.filterClubs(e.target.value));
        if (categoryFilter) categoryFilter.addEventListener('change', (e) => this.filterByCategory(e.target.value));
    },

    async loadClubs() {
        try {
            const clubs = await API.clubs.getAll();
            this.renderClubs(clubs);
            this.updateStats(clubs);
        } catch (error) {
            const clubs = Storage.getItems('clubs');
            this.renderClubs(clubs);
            this.updateStats(clubs);
        }
    },

    renderClubs(clubs) {
        const grid = document.getElementById('clubsGrid');
        if (!grid) return;

        if (clubs.length === 0) {
            Utils.showEmptyState(grid, 'users', 'No Clubs Found', 'Create your first club');
            return;
        }

        grid.innerHTML = clubs.map(club => `
            <div class="card" data-id="${club.id}">
                <div class="card-header">
                    <div>
                        <h3 class="card-title">${club.name}</h3>
                        <span class="card-badge badge-${club.category}">${club.category}</span>
                    </div>
                </div>
                <div class="card-content">
                    <p class="card-description">${club.description}</p>
                    <div class="card-meta">
                        <span><i class="fas fa-users"></i> ${club.members} members</span>
                        <span><i class="fas fa-project-diagram"></i> ${club.projects || 0} projects</span>
                    </div>
                    <div class="card-meta">
                        <span><i class="fas fa-user-tie"></i> ${club.coordinator}</span>
                    </div>
                </div>
                <div class="card-footer">
                    <button class="btn-primary" style="font-size: 0.9rem; padding: 0.5rem 1rem;" onclick="Clubs.joinClub(${club.id})">
                        <i class="fas fa-plus"></i> Join Club
                    </button>
                    <div class="card-actions">
                        <button class="btn-icon btn-delete" onclick="Clubs.deleteClub(${club.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    },

    showAddClubModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-header">
                <h2 class="modal-title">Create New Club</h2>
                <button class="modal-close" onclick="this.closest('.modal-container').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <form id="clubForm">
                    <div class="form-group">
                        <label class="form-label">Club Name</label>
                        <input type="text" class="form-input" name="name" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Description</label>
                        <textarea class="form-textarea" name="description" rows="4" required></textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Category</label>
                        <select class="form-select" name="category" required>
                            <option value="technical">Technical</option>
                            <option value="cultural">Cultural</option>
                            <option value="sports">Sports</option>
                            <option value="academic">Academic</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Coordinator</label>
                        <input type="text" class="form-input" name="coordinator" required>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="this.closest('.modal-container').remove()">Cancel</button>
                <button class="btn-primary" onclick="Clubs.saveClub()">Create Club</button>
            </div>
        `;

        const container = document.getElementById('modalContainer');
        container.innerHTML = '';
        container.appendChild(modal);
        container.classList.add('active');
    },

    async saveClub() {
        const form = document.getElementById('clubForm');
        const formData = new FormData(form);
        
        const club = {
            name: formData.get('name'),
            description: formData.get('description'),
            category: formData.get('category'),
            coordinator: formData.get('coordinator')
        };

        try {
            await API.clubs.create(club);
            this.loadClubs();
            document.getElementById('modalContainer').classList.remove('active');
            Utils.showToast('Club created successfully!', 'success');
        } catch (error) {
            Utils.showToast(error.message || 'Failed to create club', 'error');
        }
    },

    async joinClub(id) {
        try {
            await API.clubs.join(id);
            this.loadClubs();
            Utils.showToast('Joined club successfully!', 'success');
        } catch (error) {
            Utils.showToast(error.message || 'Failed to join club', 'error');
        }
    },

    async deleteClub(id) {
        if (confirm('Are you sure you want to delete this club?')) {
            try {
                await API.clubs.delete(id);
                this.loadClubs();
                Utils.showToast('Club deleted successfully!', 'success');
            } catch (error) {
                Utils.showToast('Failed to delete club', 'error');
            }
        }
    },

    filterClubs(searchTerm) {
        const cards = document.querySelectorAll('#clubsGrid .card');
        cards.forEach(card => {
            const title = card.querySelector('.card-title').textContent.toLowerCase();
            const description = card.querySelector('.card-description').textContent.toLowerCase();
            const matches = title.includes(searchTerm.toLowerCase()) || description.includes(searchTerm.toLowerCase());
            card.style.display = matches ? '' : 'none';
        });
    },

    async filterByCategory(category) {
        try {
            const clubs = category === 'all' 
                ? await API.clubs.getAll() 
                : await API.clubs.getAll(category);
            this.renderClubs(clubs);
        } catch (error) {
            Utils.showToast('Failed to filter clubs', 'error');
        }
    },

    updateStats(clubs) {
        const totalClubsEl = document.getElementById('totalClubs');
        if (totalClubsEl) totalClubsEl.textContent = clubs.length;
    }
};
