// ===== Events Module =====

const Events = {
    init() {
        this.loadEvents();
        this.setupEventListeners();
    },

    setupEventListeners() {
        const addBtn = document.getElementById('addEventBtn');
        const searchInput = document.getElementById('eventSearch');
        const categoryFilter = document.getElementById('eventCategory');

        if (addBtn) addBtn.addEventListener('click', () => this.showAddEventModal());
        if (searchInput) searchInput.addEventListener('input', (e) => this.filterEvents(e.target.value));
        if (categoryFilter) categoryFilter.addEventListener('change', (e) => this.filterByCategory(e.target.value));
    },

    async loadEvents() {
        try {
            const events = await API.events.getAll();
            this.renderEvents(events);
            this.updateStats(events);
        } catch (error) {
            // Fallback to localStorage
            const events = Storage.getItems('events');
            this.renderEvents(events);
            this.updateStats(events);
        }
    },

    renderEvents(events) {
        const grid = document.getElementById('eventsGrid');
        if (!grid) return;

        if (events.length === 0) {
            Utils.showEmptyState(grid, 'calendar-alt', 'No Events Found', 'Start by creating your first event');
            return;
        }

        grid.innerHTML = events.map(event => `
            <div class="card" data-id="${event.id}">
                <div class="card-header">
                    <div>
                        <h3 class="card-title">${event.title}</h3>
                        <span class="card-badge badge-${event.category}">${event.category}</span>
                    </div>
                </div>
                <div class="card-content">
                    <p class="card-description">${event.description}</p>
                    <div class="card-meta">
                        <span><i class="fas fa-calendar"></i> ${Utils.formatDate(event.date)}</span>
                        <span><i class="fas fa-clock"></i> ${event.time}</span>
                    </div>
                    <div class="card-meta">
                        <span><i class="fas fa-map-marker-alt"></i> ${event.venue}</span>
                        <span><i class="fas fa-user"></i> ${event.organizer}</span>
                    </div>
                </div>
                <div class="card-footer">
                    <span style="color: var(--gray-600); font-size: 0.85rem;">
                        ${Utils.getTimeAgo(event.created_at || event.createdAt)}
                    </span>
                    <div class="card-actions">
                        <button class="btn-icon btn-delete" onclick="Events.deleteEvent(${event.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    },

    showAddEventModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-header">
                <h2 class="modal-title">Add New Event</h2>
                <button class="modal-close" onclick="this.closest('.modal-container').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <form id="eventForm">
                    <div class="form-group">
                        <label class="form-label">Event Title</label>
                        <input type="text" class="form-input" name="title" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Description</label>
                        <textarea class="form-textarea" name="description" required></textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Category</label>
                        <select class="form-select" name="category" required>
                            <option value="academic">Academic</option>
                            <option value="cultural">Cultural</option>
                            <option value="sports">Sports</option>
                            <option value="technical">Technical</option>
                            <option value="social">Social</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Date</label>
                        <input type="date" class="form-input" name="date" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Time</label>
                        <input type="time" class="form-input" name="time" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Venue</label>
                        <input type="text" class="form-input" name="venue" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Organizer</label>
                        <input type="text" class="form-input" name="organizer" required>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="this.closest('.modal-container').remove()">Cancel</button>
                <button class="btn-primary" onclick="Events.saveEvent()">Save Event</button>
            </div>
        `;

        const container = document.getElementById('modalContainer');
        container.innerHTML = '';
        container.appendChild(modal);
        container.classList.add('active');
    },

    async saveEvent() {
        const form = document.getElementById('eventForm');
        const formData = new FormData(form);
        
        const event = {
            title: formData.get('title'),
            description: formData.get('description'),
            category: formData.get('category'),
            date: formData.get('date'),
            time: formData.get('time'),
            venue: formData.get('venue'),
            organizer: formData.get('organizer')
        };

        try {
            await API.events.create(event);
            this.loadEvents();
            document.getElementById('modalContainer').classList.remove('active');
            Utils.showToast('Event added successfully!', 'success');
        } catch (error) {
            Utils.showToast(error.message || 'Failed to add event', 'error');
        }
    },

    async deleteEvent(id) {
        if (confirm('Are you sure you want to delete this event?')) {
            try {
                await API.events.delete(id);
                this.loadEvents();
                Utils.showToast('Event deleted successfully!', 'success');
            } catch (error) {
                Utils.showToast(error.message || 'Failed to delete event', 'error');
            }
        }
    },

    filterEvents(searchTerm) {
        const cards = document.querySelectorAll('#eventsGrid .card');
        cards.forEach(card => {
            const title = card.querySelector('.card-title').textContent.toLowerCase();
            const description = card.querySelector('.card-description').textContent.toLowerCase();
            const matches = title.includes(searchTerm.toLowerCase()) || description.includes(searchTerm.toLowerCase());
            card.style.display = matches ? '' : 'none';
        });
    },

    async filterByCategory(category) {
        try {
            const events = category === 'all' 
                ? await API.events.getAll() 
                : await API.events.getAll(category);
            this.renderEvents(events);
        } catch (error) {
            Utils.showToast('Failed to filter events', 'error');
        }
    },

    updateStats(events) {
        const totalEventsEl = document.getElementById('totalEvents');
        if (totalEventsEl) totalEventsEl.textContent = events.length;
    }
};
