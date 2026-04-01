/* ============================================
   SF10 INTEGRATION SCRIPT
   Add this script to your existing sf10.html
   ============================================ */

/**
 * INSTRUCTIONS FOR USE:
 * 
 * 1. Open your existing sf10.html file
 * 2. Add a <script> tag before the closing </body> tag
 * 3. Copy the code below into that script tag
 * 4. Adjust the field IDs to match your SF10 form
 * 
 * Example:
 * <script src="sf10-integration.js"></script>
 * OR
 * <script>
 *   // Paste the code below here
 * </script>
 */

// ============================================
// STEP 1: AUTO-POPULATE SCHOOL PROFILE
// ============================================

function autoPopulateSchoolProfile() {
    // Try to get profile from global function first
    let profile = null;
    
    if (typeof getSchoolProfile === 'function') {
        profile = getSchoolProfile();
    } else {
        // Fallback: read directly from localStorage
        const savedProfile = localStorage.getItem('depedSchoolProfile');
        if (savedProfile) {
            profile = JSON.parse(savedProfile);
        }
    }
    
    if (!profile) {
        console.warn('No school profile found. Please configure it in the dashboard.');
        return false;
    }
    
    // Map profile data to your SF10 form fields
    // IMPORTANT: Change these IDs to match your actual form field IDs
    const fieldMapping = {
        'region': profile.region,
        'division': profile.division,
        'district': profile.district,
        'schoolName': profile.schoolName,
        'schoolId': profile.schoolId,
        'schoolYear': profile.schoolYear,
        'teacherName': profile.teacherName,
        'gradeSection': profile.gradeSection,
        
        // Alternative field names you might be using:
        'school-name': profile.schoolName,
        'school-id': profile.schoolId,
        'sy': profile.schoolYear,
        'teacher': profile.teacherName,
        'grade': profile.gradeSection
    };
    
    // Auto-fill all fields
    for (const [fieldId, value] of Object.entries(fieldMapping)) {
        const field = document.getElementById(fieldId);
        if (field && value) {
            field.value = value;
            
            // Trigger change event in case your form has validation
            const event = new Event('change', { bubbles: true });
            field.dispatchEvent(event);
        }
    }
    
    console.log('✅ School profile auto-populated successfully!');
    return true;
}

// ============================================
// STEP 2: LOAD STUDENT LIST
// ============================================

function loadStudentListIntoSF10() {
    // Try to get student list from global function
    let students = [];
    
    if (typeof getMasterStudentList === 'function') {
        students = getMasterStudentList();
    } else {
        // Fallback: read directly from localStorage
        const savedList = localStorage.getItem('depedMasterStudentList');
        if (savedList) {
            students = JSON.parse(savedList);
        }
    }
    
    if (students.length === 0) {
        console.warn('No students found. Please upload students in the dashboard.');
        return [];
    }
    
    console.log(`✅ Loaded ${students.length} students from master list`);
    return students;
}

// ============================================
// STEP 3: POPULATE STUDENT DROPDOWN/SELECT
// ============================================

function populateStudentDropdown(selectElementId = 'studentSelect') {
    const students = loadStudentListIntoSF10();
    const selectElement = document.getElementById(selectElementId);
    
    if (!selectElement) {
        console.error(`Dropdown element '${selectElementId}' not found`);
        return;
    }
    
    // Clear existing options except the first (usually a placeholder)
    while (selectElement.options.length > 1) {
        selectElement.remove(1);
    }
    
    // Add student options
    students.forEach(student => {
        const option = document.createElement('option');
        option.value = student.lrn;
        option.textContent = `${student.lastName}, ${student.firstName} ${student.middleName} (${student.lrn})`;
        option.dataset.lastName = student.lastName;
        option.dataset.firstName = student.firstName;
        option.dataset.middleName = student.middleName;
        option.dataset.sex = student.sex;
        option.dataset.birthdate = student.birthdate;
        selectElement.appendChild(option);
    });
    
    console.log(`✅ Populated dropdown with ${students.length} students`);
}

// ============================================
// STEP 4: AUTO-FILL STUDENT DETAILS ON SELECTION
// ============================================

function setupStudentAutoFill(selectElementId = 'studentSelect') {
    const selectElement = document.getElementById(selectElementId);
    
    if (!selectElement) {
        console.error(`Dropdown element '${selectElementId}' not found`);
        return;
    }
    
    selectElement.addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        
        if (!selectedOption || !selectedOption.value) {
            return;
        }
        
        // Auto-fill form fields with student data
        // IMPORTANT: Change these IDs to match your actual form field IDs
        const fieldMapping = {
            'lrn': selectedOption.value,
            'lastName': selectedOption.dataset.lastName,
            'firstName': selectedOption.dataset.firstName,
            'middleName': selectedOption.dataset.middleName,
            'sex': selectedOption.dataset.sex,
            'birthdate': selectedOption.dataset.birthdate,
            
            // Alternative field names:
            'student-lrn': selectedOption.value,
            'last-name': selectedOption.dataset.lastName,
            'first-name': selectedOption.dataset.firstName,
            'middle-name': selectedOption.dataset.middleName,
            'gender': selectedOption.dataset.sex,
            'dob': selectedOption.dataset.birthdate
        };
        
        for (const [fieldId, value] of Object.entries(fieldMapping)) {
            const field = document.getElementById(fieldId);
            if (field && value) {
                field.value = value;
                
                // Trigger change event
                const event = new Event('change', { bubbles: true });
                field.dispatchEvent(event);
            }
        }
        
        console.log('✅ Student details auto-filled');
    });
}

// ============================================
// STEP 5: POPULATE STUDENT TABLE
// ============================================

function populateStudentTable(tableBodyId = 'studentTableBody') {
    const students = loadStudentListIntoSF10();
    const tbody = document.getElementById(tableBodyId);
    
    if (!tbody) {
        console.error(`Table body '${tableBodyId}' not found`);
        return;
    }
    
    tbody.innerHTML = ''; // Clear existing rows
    
    students.forEach((student, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${student.lrn}</td>
            <td>${student.lastName}</td>
            <td>${student.firstName}</td>
            <td>${student.middleName}</td>
            <td>${student.sex}</td>
            <td>${student.birthdate}</td>
            <!-- Add more columns as needed -->
            <td>
                <button onclick="editStudent('${student.lrn}')">Edit</button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    console.log(`✅ Populated table with ${students.length} students`);
}

// ============================================
// STEP 6: SHOW NOTIFICATIONS
// ============================================

function showNotification(message, type = 'success') {
    // Try to use global showToast function
    if (typeof showToast === 'function') {
        showToast(message, type);
    } else {
        // Fallback: simple alert or custom notification
        console.log(`${type.toUpperCase()}: ${message}`);
        // You can implement your own notification here
        alert(message);
    }
}

// ============================================
// STEP 7: LOG ACTIVITY
// ============================================

function logActivity(action, category = 'SF10') {
    // Try to use global addActivity function
    if (typeof addActivity === 'function') {
        addActivity(action, category);
    } else {
        // Fallback: log to console
        console.log(`Activity: ${action} [${category}]`);
    }
}

// ============================================
// STEP 8: MARK FORM AS COMPLETED
// ============================================

function markSF10Complete() {
    localStorage.setItem('depedSF10Complete', 'true');
    
    // Increment forms completed counter
    if (typeof incrementFormsCompleted === 'function') {
        incrementFormsCompleted();
    } else {
        const current = parseInt(localStorage.getItem('depedFormsCompleted') || '0');
        localStorage.setItem('depedFormsCompleted', (current + 1).toString());
    }
    
    logActivity('Completed SF10 form', 'Forms');
    showNotification('SF10 form completed successfully!');
}

// ============================================
// STEP 9: NAVIGATION HELPER
// ============================================

function returnToDashboard() {
    window.location.href = 'index.html';
}

// ============================================
// STEP 10: AUTO-INITIALIZE ON PAGE LOAD
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing SF10 Integration...');
    
    // Auto-populate school profile
    const profileLoaded = autoPopulateSchoolProfile();
    
    // Load students
    const students = loadStudentListIntoSF10();
    
    // Try to populate dropdown if it exists
    if (document.getElementById('studentSelect')) {
        populateStudentDropdown('studentSelect');
        setupStudentAutoFill('studentSelect');
    }
    
    // Try to populate table if it exists
    if (document.getElementById('studentTableBody')) {
        populateStudentTable('studentTableBody');
    }
    
    // Log activity
    logActivity('Opened SF10 module', 'Forms');
    
    // Show status
    if (profileLoaded && students.length > 0) {
        console.log('✅ SF10 Integration Complete!');
        console.log(`   Profile: ${profileLoaded ? 'Loaded' : 'Not Found'}`);
        console.log(`   Students: ${students.length}`);
    } else {
        console.warn('⚠️ Integration incomplete. Please configure dashboard settings.');
        showNotification('Please configure your school profile and upload students in the dashboard.', 'error');
    }
});

// ============================================
// QUICK USAGE EXAMPLES
// ============================================

/*
Example 1: Get specific student by LRN
const student = loadStudentListIntoSF10().find(s => s.lrn === '123456789012');

Example 2: Filter students by sex
const maleStudents = loadStudentListIntoSF10().filter(s => s.sex === 'M');
const femaleStudents = loadStudentListIntoSF10().filter(s => s.sex === 'F');

Example 3: Get school year
const profile = JSON.parse(localStorage.getItem('depedSchoolProfile'));
const schoolYear = profile?.schoolYear;

Example 4: Custom notification
showNotification('SF10 saved!', 'success');

Example 5: Log custom activity
logActivity('Generated PDF report', 'SF10');

Example 6: Return to dashboard
returnToDashboard();
*/

// ============================================
// EXPORT FUNCTIONS FOR GLOBAL USE
// ============================================

window.SF10Integration = {
    autoPopulateSchoolProfile,
    loadStudentListIntoSF10,
    populateStudentDropdown,
    setupStudentAutoFill,
    populateStudentTable,
    showNotification,
    logActivity,
    markSF10Complete,
    returnToDashboard
};

console.log('📦 SF10 Integration module loaded. Access via window.SF10Integration');
