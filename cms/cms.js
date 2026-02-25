// ====================================================================
// CONFIGURATION: SET THE PATHS HERE
// ====================================================================
// Path to your PHP API file (relative to this JS file)
const API_URL = 'cms.php';
// Base path for displaying images (should match the PHP IMAGE_DIR)
const IMAGE_BASE_PATH = '../img/'; 
// ====================================================================

// --- DOM ELEMENTS ---
const projectList = document.getElementById('project-list');
const modal = document.getElementById('project-modal');
const confirmModal = document.getElementById('confirm-modal');
const form = document.getElementById('project-form');
const modalTitle = document.getElementById('modal-title');
const modalSubmitBtn = document.getElementById('modal-submit-btn');
const showCreateBtn = document.getElementById('show-create-modal-btn');
const closeButtons = document.querySelectorAll('.close-btn');
const confirmActionBtn = document.getElementById('confirm-action-btn');
const confirmCancelBtn = document.getElementById('confirm-cancel-btn');
const confirmTitle = document.getElementById('confirm-title');
const confirmMessage = document.getElementById('confirm-message');

// Image-specific elements
const currentImageContainer = document.getElementById('current-image-container');
const imagePreview = document.getElementById('image-preview');
const imageFileInput = document.getElementById('image-file');
const deleteImageCheckbox = document.getElementById('delete-image');
const imagePathHidden = document.getElementById('image-path-hidden');

// Goods Folder-specific elements (UPDATED)
const currentGoodsContainer = document.getElementById('current-goods-container');
const deleteGoodsCheckbox = document.getElementById('delete-goods-folder');
const goodsPathHidden = document.getElementById('goods-path-hidden');
const goodsFolderInput = document.getElementById('goods-folder-name');
const goodsZipFileInput = document.getElementById('goods-zip-file'); // NEW
const goodsDirUploadInput = document.getElementById('goods-dir-upload'); // NEW


const formMethodInput = document.getElementById('form-method');

// Theme specific elements
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const themeIcon = document.getElementById('theme-icon');


let currentProjects = [];
let draggingElement = null;
let confirmCallback = null;

// --- THEME LOGIC ---

/**
 * Loads the user's preferred theme from localStorage or defaults to 'dark'.
 * Applies the class to the <body> element.
 */
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark-theme';
    document.body.className = savedTheme;
    updateThemeIcon(savedTheme);
}

/**
 * Toggles the theme between 'dark-theme' and 'light-theme'.
 */
function toggleTheme() {
    const isDark = document.body.classList.contains('dark-theme');
    const newTheme = isDark ? 'light-theme' : 'dark-theme';
    
    document.body.className = newTheme;
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

/**
 * Updates the SVG icon inside the theme toggle button.
 * @param {string} currentTheme - The theme currently applied to the body.
 */
function updateThemeIcon(currentTheme) {
    if (currentTheme === 'dark-theme') {
        // Show Sun icon (to switch to light mode)
        themeIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16.5 12a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" />`;
    } else {
        // Show Moon icon (to switch to dark mode)
        themeIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0 1 12 15.75c-2.427 0-4.718-.584-6.752-1.55a9.088 9.088 0 0 0 6.75-8.548 9.088 9.088 0 0 1 6.75 8.548ZM14.99 1.58A8.25 8.25 0 0 0 12 0c-3.14 0-5.918 1.488-7.79 3.704a.75.75 0 0 0 .543 1.258c.458-.088.923-.135 1.393-.135 2.164 0 4.195.748 5.8 2.06A8.25 8.25 0 0 0 14.99 1.58Z" />`;
    }
}


// --- UTILITY FUNCTIONS ---

/**
 * Handles all API calls that do NOT involve file uploads (GET, DELETE, Reorder PUT).
 * @param {string} method - HTTP method ('GET', 'DELETE', 'PUT' for reorder).
 * @param {Object} [data=null] - Data to send in the request body (JSON format).
 * @returns {Promise<Object>} - The JSON response data.
 */
async function apiCall(method, data = null) {
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(API_URL, options);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (result.success === false) {
            throw new Error(result.message || 'API operation failed.');
        }
        return result;
    } catch (error) {
        console.error('API Call Failed:', error);
        alert(`Error: ${error.message}. Check console for details.`);
        return { success: false, message: error.message };
    }
}

/**
 * Opens the main project modal for Create or Update.
 * @param {Object} [project=null] - The project data for editing, or null for creating.
 */
function openProjectModal(project = null) {
    form.reset();
    
    // Reset image controls
    currentImageContainer.style.display = 'none';
    imagePreview.src = '';
    deleteImageCheckbox.checked = false;
    imageFileInput.value = '';
    imagePathHidden.value = '';
    
    // Reset goods folder controls (UPDATED)
    currentGoodsContainer.style.display = 'none';
    deleteGoodsCheckbox.checked = false;
    goodsPathHidden.value = '';
    // goodsZipFileInput.value = ''; // Resetting file inputs is done by form.reset()
    // goodsDirUploadInput.value = ''; // Resetting file inputs is done by form.reset()
    goodsFolderInput.value = '';


    if (project) {
        // UPDATE Mode
        modalTitle.textContent = `Edit Project: ${project.name}`;
        modalSubmitBtn.textContent = 'Update Project';
        form.dataset.mode = 'update';
        formMethodInput.value = 'PUT'; // Set override method for PHP
        
        // Populate form fields
        document.getElementById('project-id').value = project.id;
        document.getElementById('name').value = project.name;
        document.getElementById('path').value = project.path;
        document.getElementById('tag').value = project.tag;
        document.getElementById('style').value = project.style;
        document.getElementById('description').value = project.description;
        document.getElementById('story').value = project.story;

        // Image display logic
        if (project.image) {
            imagePreview.src = project.image;
            currentImageContainer.style.display = 'block';
            imagePathHidden.value = project.image; // Store current path for reference
        }
        
        // Goods Folder display logic (NEW)
        if (project.goods_folder) {
            // Display the folder name based on the path (remove leading/trailing slashes and directory)
            const parts = project.goods_folder.split('/');
            // The folder name is the second to last part (assuming format ../goods/folder-name/)
            const folderName = parts[parts.length - 2]; 

            document.getElementById('current-goods-path-display').textContent = folderName;
            currentGoodsContainer.style.display = 'block';
            goodsPathHidden.value = project.goods_folder; // Store current path for reference
            goodsFolderInput.value = folderName; // Pre-fill name for replacement upload
        }


    } else {
        // CREATE Mode
        modalTitle.textContent = 'Create New Good';
        modalSubmitBtn.textContent = 'Create Good';
        form.dataset.mode = 'create';
        formMethodInput.value = 'POST'; // Set default method
        document.getElementById('project-id').value = ''; 
    }

    modal.style.display = 'block';
}

/**
 * Closes the main project modal.
 */
function closeProjectModal() {
    modal.style.display = 'none';
    form.reset();
}

/**
 * Opens the confirmation modal.
 */
function openConfirmModal(title, message, callback) {
    confirmTitle.textContent = title;
    confirmMessage.textContent = message;
    confirmCallback = callback;
    confirmModal.style.display = 'block';
    confirmActionBtn.focus(); 
}

/**
 * Closes the confirmation modal.
 */
function closeConfirmModal() {
    confirmModal.style.display = 'none';
    confirmCallback = null;
}

/**
 * Renders the full list of projects.
 * @param {Array<Object>} projects - The array of project data.
 */
function renderProjects(projects) {
    projectList.innerHTML = '';
    currentProjects = projects;

    if (projects.length === 0) {
        projectList.innerHTML = '<p class="loading-message">No projects found. Add one!</p>';
        return;
    }

    projects.forEach(project => {
        const item = document.createElement('div');
        item.className = 'project-item';
        item.dataset.id = project.id;
        item.draggable = true;

        const imageHtml = project.image 
            ? `<div class="project-thumbnail"><img src="${project.image}" alt="${project.name}"></div>`
            : `<div class="project-thumbnail" style="display:flex; align-items:center; justify-content:center;">🖼️</div>`;
            
        // Display goods folder info (FIXED: used <strong> instead of Markdown **)
        const goodsFolderInfo = project.goods_folder 
            ? `<p class="goods-info">📂 <strong>Goods Folder:</strong> <code>${project.goods_folder}</code></p>`
            : `<p class="goods-info">📂 Goods Folder: N/A</p>`;


        item.innerHTML = `
            ${imageHtml}
            <div class="project-info">
                <h4>${project.name} (ID: ${project.id})</h4>
                <div class="meta-data">
                    <span>Tag: ${project.tag || 'N/A'}</span>
                    <span>Style: ${project.style || 'N/A'}</span>
                </div>
                <p><strong>Path:</strong> <code>${project.path}</code></p>
                ${goodsFolderInfo}
                <p>${project.description}</p>
            </div>
            <div class="project-actions">
                <button class="action-btn secondary-btn edit-btn" data-id="${project.id}">Edit</button>
                <button class="action-btn danger-btn delete-btn" data-id="${project.id}">Delete</button>
            </div>
        `;

        item.querySelector('.edit-btn').addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            const projectToEdit = currentProjects.find(p => p.id === id);
            if (projectToEdit) {
                openProjectModal(projectToEdit);
            }
        });

        item.querySelector('.delete-btn').addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            const projectToDelete = currentProjects.find(p => p.id === id);
            if (projectToDelete) {
                const deleteAction = () => deleteProject(id);
                openConfirmModal(
                    'Confirm Deletion',
                    `Are you sure you want to delete the project: "${projectToDelete.name}"? This action also deletes the associated image file AND goods folder (if present).`,
                    deleteAction
                );
            }
        });

        // Attach drag-and-drop listeners
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragover', handleDragOver);
        item.addEventListener('dragleave', handleDragLeave);
        item.addEventListener('drop', handleDrop);
        item.addEventListener('dragend', handleDragEnd);

        projectList.appendChild(item);
    });
}

// --- CRUD OPERATIONS ---

/**
 * Fetches all projects from the API and renders them.
 */
async function fetchProjects() {
    projectList.innerHTML = '<p class="loading-message">Fetching projects...</p>';
    const result = await apiCall('GET');

    if (result.success) {
        renderProjects(result.data);
    } else {
        projectList.innerHTML = `<p class="loading-message" style="color:var(--danger-color);">Failed to load projects. Ensure ${API_URL} and data.json are accessible and the PHP server is running.</p>`;
    }
}

/**
 * Handles the submission of the Create/Update form (using FormData for files).
 */
async function handleFormSubmit(e) {
    e.preventDefault();
    
    // Check for goods folder name requirement if a file is uploaded (UPDATED CHECK)
    const isZipUploading = goodsZipFileInput.value;
    const isDirUploading = goodsDirUploadInput.files.length > 0;
    
    if ((isZipUploading || isDirUploading) && !goodsFolderInput.value) {
        alert('You must enter a name for the Goods Folder if you are uploading a ZIP file or a directory.');
        goodsFolderInput.focus();
        return;
    }

    // Always use 'POST' for fetch when submitting FormData, the PHP side uses the hidden _method field.
    let method = 'POST';
    const formData = new FormData(form);
    
    let result;
    modalSubmitBtn.disabled = true;

    try {
        const response = await fetch(API_URL, {
            method: method,
            body: formData 
        });

        if (!response.ok) {
            // Error handling improved to show more detail
            const errorText = await response.text();
            console.error('API Response Text:', errorText);
            throw new Error(`HTTP error! status: ${response.status}. See console for details.`);
        }
        
        result = await response.json();
        
        if (result.success === false) {
            throw new Error(result.message || 'API operation failed.');
        }

    } catch (error) {
        console.error('Form Submission Failed:', error);
        alert(`Error: ${error.message}. Check console for details.`);
        modalSubmitBtn.disabled = false;
        return;
    }


    if (result.success) {
        closeProjectModal();
        await fetchProjects();
    }
    modalSubmitBtn.disabled = false;
}

/**
 * Deletes a project.
 */
async function deleteProject(id) {
    closeConfirmModal();

    // Use apiCall for DELETE as it sends a JSON body
    const result = await apiCall('DELETE', { id: id });

    if (result.success) {
        await fetchProjects();
    }
}

// --- REORDERING (DRAG & DROP) LOGIC (UNCHANGED) ---

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.project-item:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function handleDragStart(e) {
    draggingElement = e.target;
    setTimeout(() => e.target.classList.add('dragging'), 0);
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(e) {
    e.preventDefault();
    if (!draggingElement) return;

    const afterElement = getDragAfterElement(projectList, e.clientY);
    
    if (afterElement == null) {
        projectList.appendChild(draggingElement);
    } else {
        projectList.insertBefore(draggingElement, afterElement);
    }
}

function handleDragLeave(e) {
    //
}

async function handleDrop(e) {
    e.preventDefault();
    if (!draggingElement) return;

    const newOrderNodes = projectList.querySelectorAll('.project-item');
    const newOrderIds = Array.from(newOrderNodes).map(node => parseInt(node.dataset.id));

    // Use apiCall for Reorder PUT as it sends a JSON body
    const result = await apiCall('PUT', {
        reorder: true,
        new_order: newOrderIds
    });

    if (result.success) {
        await fetchProjects(); 
    }
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    draggingElement = null;
}


// --- EVENT LISTENERS & INITIALIZATION ---

document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    fetchProjects();
});

showCreateBtn.addEventListener('click', () => openProjectModal());
form.addEventListener('submit', handleFormSubmit);
themeToggleBtn.addEventListener('click', toggleTheme); // Added theme toggle listener

// Modal/Confirmation listeners
closeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        if (e.target.closest('#project-modal')) {
            closeProjectModal();
        } else if (e.target.closest('#confirm-modal')) {
            closeConfirmModal();
        }
    });
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeProjectModal();
    } else if (e.target === confirmModal) {
        closeConfirmModal();
    }
});

confirmActionBtn.addEventListener('click', () => {
    if (confirmCallback) {
        confirmCallback();
    }
});

confirmCancelBtn.addEventListener('click', closeConfirmModal);
