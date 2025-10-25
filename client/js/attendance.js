// ===== Attendance Module =====

const Attendance = {
    init() {
        this.loadAttendance();
        this.setupEventListeners();
    },

    setupEventListeners() {
        const markBtn = document.getElementById('markAttendanceBtn');
        if (markBtn) markBtn.addEventListener('click', () => this.showMarkAttendanceModal());
    },

    async loadAttendance() {
        try {
            const records = await API.attendance.getAll();
            this.renderAttendance(records);
            this.updateStats(records);
        } catch (error) {
            const records = Storage.getItems('attendance') || [];
            this.renderAttendance(records);
            this.updateStats(records);
        }
    },

    renderAttendance(records) {
        const grid = document.getElementById('attendanceGrid');
        if (!grid) return;

        if (records.length === 0) {
            Utils.showEmptyState(grid, 'clipboard-check', 'No Records', 'Start marking attendance');
            return;
        }

        const groupedRecords = {};
        records.forEach(record => {
            if (!groupedRecords[record.subject]) {
                groupedRecords[record.subject] = { subject: record.subject, total: 0, present: 0 };
            }
            groupedRecords[record.subject].total++;
            if (record.status === 'present') {
                groupedRecords[record.subject].present++;
            }
        });

        grid.innerHTML = Object.values(groupedRecords).map(data => {
            const percentage = ((data.present / data.total) * 100).toFixed(1);
            return `
                <div class="attendance-item">
                    <div class="attendance-info">
                        <h4>${data.subject}</h4>
                        <p>${data.present} / ${data.total} classes attended</p>
                    </div>
                    <div class="attendance-percentage" style="color: ${percentage >= 75 ? 'var(--success-color)' : 'var(--danger-color)'}">
                        ${percentage}%
                    </div>
                </div>
            `;
        }).join('');
    },

    showMarkAttendanceModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-header">
                <h2 class="modal-title">Mark Attendance</h2>
                <button class="modal-close" onclick="this.closest('.modal-container').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <form id="attendanceForm">
                    <div class="form-group">
                        <label class="form-label">Subject</label>
                        <input type="text" class="form-input" name="subject" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Date</label>
                        <input type="date" class="form-input" name="date" value="${new Date().toISOString().split('T')[0]}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Status</label>
                        <select class="form-select" name="status" required>
                            <option value="present">Present</option>
                            <option value="absent">Absent</option>
                            <option value="late">Late</option>
                        </select>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="this.closest('.modal-container').remove()">Cancel</button>
                <button class="btn-primary" onclick="Attendance.saveAttendance()">Mark</button>
            </div>
        `;

        const container = document.getElementById('modalContainer');
        container.innerHTML = '';
        container.appendChild(modal);
        container.classList.add('active');
    },

    async saveAttendance() {
        const form = document.getElementById('attendanceForm');
        const formData = new FormData(form);
        
        const record = {
            subject: formData.get('subject'),
            date: formData.get('date'),
            status: formData.get('status')
        };

        try {
            await API.attendance.mark(record);
            this.loadAttendance();
            document.getElementById('modalContainer').classList.remove('active');
            Utils.showToast('Attendance marked successfully!', 'success');
        } catch (error) {
            Utils.showToast(error.message || 'Failed to mark attendance', 'error');
        }
    },

    updateStats(records) {
        if (records.length === 0) return;

        const present = records.filter(r => r.status === 'present').length;
        const total = records.length;
        const percentage = ((present / total) * 100).toFixed(0);

        document.querySelectorAll('.progress-circle').forEach((circle, index) => {
            const value = index === 0 ? percentage : Math.max(0, percentage - (index * 5));
            circle.style.setProperty('--progress', value);
            const valueEl = circle.querySelector('.progress-value');
            if (valueEl) valueEl.textContent = `${value}%`;
        });
    }
};
