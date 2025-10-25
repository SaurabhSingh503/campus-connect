// ===== Local Storage Management =====

const Storage = {
    // Get all items
    getItems(key) {
        const items = localStorage.getItem(key);
        return items ? JSON.parse(items) : [];
    },

    // Get single item
    getItem(key, id) {
        const items = this.getItems(key);
        return items.find(item => item.id === id);
    },

    // Save items
    saveItems(key, items) {
        localStorage.setItem(key, JSON.stringify(items));
    },

    // Add item
    addItem(key, item) {
        const items = this.getItems(key);
        items.push(item);
        this.saveItems(key, items);
        return item;
    },

    // Update item
    updateItem(key, id, updatedData) {
        const items = this.getItems(key);
        const index = items.findIndex(item => item.id === id);
        if (index !== -1) {
            items[index] = { ...items[index], ...updatedData };
            this.saveItems(key, items);
            return items[index];
        }
        return null;
    },

    // Delete item
    deleteItem(key, id) {
        let items = this.getItems(key);
        items = items.filter(item => item.id !== id);
        this.saveItems(key, items);
    },

    // Clear all items
    clearItems(key) {
        localStorage.removeItem(key);
    },

    // Initialize sample data
    initializeSampleData() {
        if (!localStorage.getItem('dataInitialized')) {
            // Sample events
            const sampleEvents = [
                {
                    id: Utils.generateId(),
                    title: 'Annual Tech Fest 2025',
                    description: 'Join us for the biggest tech event of the year featuring workshops, competitions, and guest speakers.',
                    category: 'technical',
                    date: '2025-11-15',
                    time: '09:00',
                    venue: 'Main Auditorium',
                    organizer: 'Tech Club',
                    createdAt: new Date().toISOString()
                },
                {
                    id: Utils.generateId(),
                    title: 'Cultural Night',
                    description: 'Experience the diversity of cultures through music, dance, and food.',
                    category: 'cultural',
                    date: '2025-11-20',
                    time: '18:00',
                    venue: 'Open Air Theater',
                    organizer: 'Cultural Committee',
                    createdAt: new Date().toISOString()
                }
            ];
            this.saveItems('events', sampleEvents);

            // Sample notices
            const sampleNotices = [
                {
                    id: Utils.generateId(),
                    title: 'Semester Exam Schedule Released',
                    content: 'The examination schedule for the current semester has been released.',
                    priority: 'urgent',
                    author: 'Examination Cell',
                    createdAt: new Date().toISOString()
                }
            ];
            this.saveItems('notices', sampleNotices);

            // Sample clubs
            const sampleClubs = [
                {
                    id: Utils.generateId(),
                    name: 'Coding Club',
                    description: 'Learn, code, and compete.',
                    category: 'technical',
                    members: 156,
                    projects: 12,
                    coordinator: 'John Doe',
                    createdAt: new Date().toISOString()
                }
            ];
            this.saveItems('clubs', sampleClubs);

            localStorage.setItem('dataInitialized', 'true');
        }
    }
};

// Initialize sample data on load
Storage.initializeSampleData();
