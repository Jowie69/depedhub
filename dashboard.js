// ===========================
// Global Settings Management
// ===========================

const GlobalSettings = {
    STORAGE_KEY: 'deped_school_profile',
    STUDENTS_KEY: 'deped_master_students',
    
    // Save school profile settings
    saveSettings(data) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving settings:', error);
            return false;
        }
    },
    
    // Load school profile settings
    loadSettings() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error loading settings:', error);
            return null;
        }
    },
    
    // Save master student list
    saveStudents(students) {
        try {
            localStorage.setItem(this.STUDENTS_KEY, JSON.stringify(students));
            return true;
        } catch (error) {
            console.error('Error saving students:', error);
            return false;
        }
    },
    
    // Load master student list
    loadStudents() {
        try {
            const data = localStorage.getItem(this.STUDENTS_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error loading students:', error);
            return [];
        }
    },
    
    // Clear all data
    clearAll() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            localStorage.removeItem(this.STUDENTS_KEY);
            return true;
        } catch (error) {
            console.error('Error clearing data:', error);
            return false;
        }
    },
    
    // Get specific setting value
    get(key) {
        const settings = this.loadSettings();
        return settings ? settings[key] : null;
    },
    
    // Check if settings are configured
    isConfigured() {
        const settings = this.loadSettings();
        return settings && settings.region && settings.schoolName && settings.teacherName;
    },
    
    // Check if students are uploaded
    hasStudents() {
        const students = this.loadStudents();
        return students && students.length > 0;
    }
};

// ===========================
// UI Controller
// ===========================

const UIController = {
    // Initialize all UI elements
    init() {
        this.updateDashboardUI();
        this.setupEventListeners();
        this.checkSystemStatus();
    },
    
    // Update dashboard with current data
    updateDashboardUI() {
        const settings = GlobalSettings.loadSettings();
        const students = GlobalSettings.loadStudents();
        
        // Update teacher name displays
        if (settings && settings.teacherName) {
            document.getElementById('welcomeTeacherName').textContent = settings.teacherName;
            document.getElementById('userDisplayName').textContent = settings.teacherName;
        }
        
        // Update school year display
        if (settings && settings.schoolYear) {
            document.getElementById('schoolYearDisplay').textContent = settings.schoolYear;
        }
        
        // Update student count
        document.getElementById('totalStudents').textContent = students.length;
        
        // Update pending forms (placeholder - you can implement this based on your needs)
        document.getElementById('pendingForms').textContent = '0';
    },
    
    // Check and update system status
    checkSystemStatus() {
        const isConfigured = GlobalSettings.isConfigured();
        const hasStudents = GlobalSettings.hasStudents();
        
        // Update School Profile Status
        const profileStatus = document.getElementById('schoolProfileStatus');
        const profileMessage = document.getElementById('profileStatusMessage');
        const profileIcon = profileStatus.querySelector('.status-icon');
        
        if (isConfigured) {
            profileIcon.classList.remove('incomplete');
            profileIcon.classList.add('complete');
            profileIcon.innerHTML = '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>';
            profileMessage.textContent = 'Configured successfully';
        } else {
            profileMessage.textContent = 'Click settings to configure';
        }
        
        // Update Student List Status
        const studentStatus = document.getElementById('studentListStatus');
        const studentMessage = document.getElementById('studentStatusMessage');
        const studentIcon = studentStatus.querySelector('.status-icon');
        
        if (hasStudents) {
            studentIcon.classList.remove('incomplete');
            studentIcon.classList.add('complete');
            studentIcon.innerHTML = '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>';
            studentMessage.textContent = `${GlobalSettings.loadStudents().length} students uploaded`;
        } else {
            studentMessage.textContent = 'Upload master student list';
        }
    },
    
    // Setup all event listeners
    setupEventListeners() {
        // Mobile menu toggle
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        const sidebar = document.getElementById('sidebar');
        
        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
            });
        }
        
        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                if (!sidebar.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
                    sidebar.classList.remove('active');
                }
            }
        });
        
        // Settings modal
        const settingsBtn = document.getElementById('settingsBtn');
        const settingsModal = document.getElementById('settingsModal');
        const closeSettings = document.getElementById('closeSettings');
        const cancelSettings = document.getElementById('cancelSettings');
        const settingsForm = document.getElementById('settingsForm');
        
        settingsBtn.addEventListener('click', () => {
            this.openSettingsModal();
        });
        
        closeSettings.addEventListener('click', () => {
            settingsModal.classList.remove('active');
        });
        
        cancelSettings.addEventListener('click', () => {
            settingsModal.classList.remove('active');
        });
        
        settingsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveSettingsForm();
        });
        
        // Database modal
        const databaseModal = document.getElementById('databaseModal');
        const closeDatabase = document.getElementById('closeDatabase');
        
        closeDatabase.addEventListener('click', () => {
            databaseModal.classList.remove('active');
        });
        
        // CSV Upload
        const uploadCSVBtn = document.getElementById('uploadCSVBtn');
        const csvFileInput = document.getElementById('csvFileInput');
        
        uploadCSVBtn.addEventListener('click', () => {
            csvFileInput.click();
        });
        
        csvFileInput.addEventListener('change', (e) => {
            this.handleCSVUpload(e);
        });
        
        // Download Template
        const downloadTemplateBtn = document.getElementById('downloadTemplateBtn');
        downloadTemplateBtn.addEventListener('click', () => {
            this.downloadCSVTemplate();
        });
        
        // Clear Students
        const clearStudentsBtn = document.getElementById('clearStudentsBtn');
        clearStudentsBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all student data? This cannot be undone.')) {
                GlobalSettings.saveStudents([]);
                this.updateDashboardUI();
                this.checkSystemStatus();
                this.renderStudentTable();
                alert('Student data cleared successfully!');
            }
        });
        
        // Close modals on background click
        settingsModal.addEventListener('click', (e) => {
            if (e.target === settingsModal) {
                settingsModal.classList.remove('active');
            }
        });
        
        databaseModal.addEventListener('click', (e) => {
            if (e.target === databaseModal) {
                databaseModal.classList.remove('active');
            }
        });
    },
    
    // Open settings modal and populate with existing data
    openSettingsModal() {
        const settings = GlobalSettings.loadSettings();
        const modal = document.getElementById('settingsModal');
        
        if (settings) {
            document.getElementById('region').value = settings.region || '';
            document.getElementById('division').value = settings.division || '';
            document.getElementById('district').value = settings.district || '';
            document.getElementById('schoolName').value = settings.schoolName || '';
            document.getElementById('schoolId').value = settings.schoolId || '';
            document.getElementById('schoolYear').value = settings.schoolYear || '';
            document.getElementById('teacherName').value = settings.teacherName || '';
            document.getElementById('gradeSection').value = settings.gradeSection || '';
        }
        
        modal.classList.add('active');
    },
    
    // Save settings form data
    saveSettingsForm() {
        const formData = {
            region: document.getElementById('region').value.trim(),
            division: document.getElementById('division').value.trim(),
            district: document.getElementById('district').value.trim(),
            schoolName: document.getElementById('schoolName').value.trim(),
            schoolId: document.getElementById('schoolId').value.trim(),
            schoolYear: document.getElementById('schoolYear').value.trim(),
            teacherName: document.getElementById('teacherName').value.trim(),
            gradeSection: document.getElementById('gradeSection').value.trim()
        };
        
        if (GlobalSettings.saveSettings(formData)) {
            document.getElementById('settingsModal').classList.remove('active');
            this.updateDashboardUI();
            this.checkSystemStatus();
            this.showNotification('Settings saved successfully!', 'success');
        } else {
            this.showNotification('Error saving settings. Please try again.', 'error');
        }
    },
    
    // Handle CSV file upload
    handleCSVUpload(event) {
        const file = event.target.files[0];
        
        if (!file) return;
        
        if (!file.name.endsWith('.csv')) {
            this.showNotification('Please upload a valid CSV file.', 'error');
            return;
        }
        
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const csv = e.target.result;
                const students = this.parseCSV(csv);
                
                if (students.length === 0) {
                    this.showNotification('No valid student data found in CSV.', 'error');
                    return;
                }
                
                GlobalSettings.saveStudents(students);
                this.updateDashboardUI();
                this.checkSystemStatus();
                this.renderStudentTable();
                this.showNotification(`Successfully uploaded ${students.length} students!`, 'success');
            } catch (error) {
                console.error('CSV parsing error:', error);
                this.showNotification('Error parsing CSV file. Please check the format.', 'error');
            }
        };
        
        reader.readAsText(file);
        event.target.value = ''; // Reset input
    },
    
    // Parse CSV data
    parseCSV(csv) {
        const lines = csv.split('\n').filter(line => line.trim());
        const students = [];
        
        // Skip header row
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            
            if (values.length >= 4 && values[0]) { // Must have at least LRN, Name, Sex, Birthdate
                students.push({
                    lrn: values[0],
                    name: values[1],
                    sex: values[2],
                    birthdate: values[3]
                });
            }
        }
        
        return students;
    },
    
    // Render student table
    renderStudentTable() {
        const students = GlobalSettings.loadStudents();
        const container = document.getElementById('studentListContainer');
        const tbody = document.getElementById('studentTableBody');
        const countSpan = document.getElementById('studentCount');
        
        if (students.length === 0) {
            container.style.display = 'none';
            return;
        }
        
        container.style.display = 'block';
        countSpan.textContent = students.length;
        
        tbody.innerHTML = students.map(student => `
            <tr>
                <td>${this.escapeHtml(student.lrn)}</td>
                <td>${this.escapeHtml(student.name)}</td>
                <td>${this.escapeHtml(student.sex)}</td>
                <td>${this.escapeHtml(student.birthdate)}</td>
            </tr>
        `).join('');
    },
    
    // Download CSV template
    downloadCSVTemplate() {
        const template = 'LRN,Name,Sex,Birthdate\n123456789012,Juan Dela Cruz,M,2015-01-15\n123456789013,Maria Santos,F,2015-03-20\n123456789014,Pedro Reyes,M,2015-02-10';
        
        const blob = new Blob([template], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'deped_student_template.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.showNotification('Template downloaded successfully!', 'success');
    },
    
    // Show notification (simple implementation)
    showNotification(message, type = 'success') {
        // Create notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: ${type === 'success' ? '#10b981' : '#ef4444'};
            color: white;
            border-radius: 0.5rem;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            z-index: 9999;
            animation: slideInRight 0.3s ease-out;
            max-width: 400px;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    },
    
    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// ===========================
// Database Manager Functions
// ===========================

function openDatabaseManager() {
    const modal = document.getElementById('databaseModal');
    modal.classList.add('active');
    UIController.renderStudentTable();
}

// ===========================
// Global Export Functions
// ===========================

// Export settings for use in other modules
window.DepEdGlobalSettings = {
    get: (key) => GlobalSettings.get(key),
    getAll: () => GlobalSettings.loadSettings(),
    getStudents: () => GlobalSettings.loadStudents(),
    isConfigured: () => GlobalSettings.isConfigured(),
    hasStudents: () => GlobalSettings.hasStudents()
};

// ===========================
// Initialize on Page Load
// ===========================

document.addEventListener('DOMContentLoaded', () => {
    UIController.init();
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                opacity: 0;
                transform: translateX(100px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        @keyframes slideOutRight {
            from {
                opacity: 1;
                transform: translateX(0);
            }
            to {
                opacity: 0;
                transform: translateX(100px);
            }
        }
    `;
    document.head.appendChild(style);
});

// ===========================
// Utility Functions for Other Modules
// ===========================

/**
 * Example usage in other modules (SF10, SF1, etc.):
 * 
 * // Get school information
 * const schoolName = window.DepEdGlobalSettings.get('schoolName');
 * const teacherName = window.DepEdGlobalSettings.get('teacherName');
 * 
 * // Get all settings
 * const settings = window.DepEdGlobalSettings.getAll();
 * 
 * // Get student list
 * const students = window.DepEdGlobalSettings.getStudents();
 * 
 * // Check if configured
 * if (!window.DepEdGlobalSettings.isConfigured()) {
 *     alert('Please configure your school profile first!');
 *     window.location.href = 'dashboard.html';
 * }
 */
