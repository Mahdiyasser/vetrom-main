document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    
    // Modal Elements
    const contactModal = document.getElementById('contact-modal');
    const openModalButton = document.getElementById('open-contact-modal');
    const closeButton = document.querySelector('.close-button');
    
    // Mobile Nav Elements
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navList = document.querySelector('nav ul');
    const navLinks = document.querySelectorAll('nav ul li a');

    // --- 1. Theme Toggle Logic ---
    themeToggle.addEventListener('click', () => {
        const currentTheme = body.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        body.setAttribute('data-theme', newTheme);
        themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        
        localStorage.setItem('vetrom-theme', newTheme);
    });

    // Check for saved theme preference on load
    const savedTheme = localStorage.getItem('vetrom-theme');
    if (savedTheme) {
        body.setAttribute('data-theme', savedTheme);
        themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    } else {
        themeToggle.textContent = '🌙';
    }


    // --- 2. Smooth Scroll Navigation ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            // Only prevent default if it's a valid ID on this page
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
                history.pushState(null, null, targetId);
            }
        });
    });


    // --- 3. Modal Logic ---
    function openModal() {
        if (contactModal) {
            contactModal.style.display = 'block';
            body.style.overflow = 'hidden'; 
        }
    }

    function closeModal() {
        if (contactModal) {
            contactModal.style.display = 'none';
            body.style.overflow = ''; 
        }
    }
    
    if (openModalButton) {
        openModalButton.addEventListener('click', openModal);
    }
    
    if (closeButton) {
        closeButton.addEventListener('click', closeModal);
    }

    // Close modal if user clicks outside of the content area
    window.addEventListener('click', (event) => {
        if (event.target === contactModal) {
            closeModal();
        }
    });

    // Close modal on ESC key press
    document.addEventListener('keydown', (event) => {
        if (event.key === "Escape" && contactModal && contactModal.style.display === 'block') {
            closeModal();
        }
    });


    // --- 4. Contact Form Interaction ---
    const contactForm = document.getElementById('contact-form');
    const formMessage = document.getElementById('form-message');

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            // Optional: If you want to handle submission via JS instead of redirect
            // e.preventDefault(); 
            
            if (formMessage) {
                formMessage.textContent = 'Sending message...';
                formMessage.className = 'success';
                formMessage.classList.remove('hidden');
            }
        });
    }

    // --- 5. Mobile Menu Logic (NEW) ---
    if (mobileToggle && navList) {
        mobileToggle.addEventListener('click', () => {
            // Toggle the 'active' class on the UL to show/hide it
            navList.classList.toggle('active');
            
            // Toggle Icon between Bars and X
            const icon = mobileToggle.querySelector('i');
            if (icon) {
                if (navList.classList.contains('active')) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-xmark'); // Requires FontAwesome 6
                } else {
                    icon.classList.remove('fa-xmark');
                    icon.classList.add('fa-bars');
                }
            }
        });

        // Close menu when a link is clicked
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navList.classList.remove('active');
                
                // Reset icon back to bars
                const icon = mobileToggle.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-xmark');
                    icon.classList.add('fa-bars');
                }
            });
        });
    }
});
