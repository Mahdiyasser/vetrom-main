document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('products-container');
    const modal = document.getElementById('full-details-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    
    // Modal Elements
    const modalImg = document.getElementById('modal-img');
    const modalTitle = document.getElementById('modal-title');
    const modalTag = document.getElementById('modal-tag');
    const modalStory = document.getElementById('modal-story');

    let productsData = [];

    // 1. Fetch Data
    fetch('../data/data.json')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            productsData = data;
            renderProducts(data);
            checkUrlForProduct(); // Check if URL has ?product=ID
        })
        .catch(error => {
            console.error('Error loading data:', error);
            container.innerHTML = '<p style="text-align:center; color:red;">Failed to load products. Please ensure ../data/data.json exists.</p>';
        });

    // 2. Render Products
    function renderProducts(products) {
        container.innerHTML = ''; // Clear loading text

        products.forEach((product, index) => {
            // Create Row
            const row = document.createElement('div');
            row.className = 'product-row';
            
            // Determine Tag Color Class
            const tagClass = product.tag.toLowerCase().includes('paid') ? 'paid' : 
                             (product.tag.toLowerCase().includes('free') ? 'free' : 'paid'); // Default styling fallback

            // HTML Structure
            row.innerHTML = `
                <div class="product-info-col">
                    <span class="product-tag">${product.tag}</span>
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-desc">${product.description}</p>
                    <button class="button secondary view-details-btn" data-id="${product.id}">
                        Show Full Details <i class="fa-solid fa-arrow-right"></i>
                    </button>
                </div>
                <div class="product-image-col">
                    <img src="${product.image}" alt="${product.name}">
                </div>
            `;

            container.appendChild(row);

            // Trigger animation after small delay
            setTimeout(() => {
                row.classList.add('visible');
            }, 100 * index);
        });

        // Add Event Listeners to buttons
        document.querySelectorAll('.view-details-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.closest('button').dataset.id;
                openModal(id);
            });
        });
    }

    // 3. Modal Logic
    function openModal(id) {
        const product = productsData.find(p => p.id == id);
        if (!product) return;

        // Populate Content
        modalImg.src = product.image;
        modalTitle.textContent = product.name;
        modalTag.textContent = product.tag;
        // Use styled classes based on tag logic if needed, currently using generic
        modalTag.className = `tag ${product.tag.toLowerCase() === 'free' ? 'free' : 'paid'}`;
        
        // Handle New Lines in Story
        modalStory.innerHTML = product.story.replace(/\r\n/g, '<br>').replace(/\n/g, '<br>');

        // Show Modal (Slide Up)
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling

        // Update URL
        const newUrl = `${window.location.pathname}?product=${id}`;
        window.history.pushState({ path: newUrl }, '', newUrl);
    }

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto'; // Restore scrolling

        // Reset URL to base
        const newUrl = window.location.pathname;
        window.history.pushState({ path: newUrl }, '', newUrl);
    }

    // 4. URL & History Handling
    function checkUrlForProduct() {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('product');
        if (productId) {
            openModal(productId);
        }
    }

    // Handle Browser Back Button
    window.addEventListener('popstate', () => {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('product');
        
        if (productId) {
            // We are going back TO a product
            // Ensure modal is open with content (might need to refind data if not loaded?)
            // Since data is loaded on init, we can just open.
            const product = productsData.find(p => p.id == productId);
            if(product) {
                // Manually open without pushing state
                modalImg.src = product.image;
                modalTitle.textContent = product.name;
                modalTag.textContent = product.tag;
                modalStory.innerHTML = product.story.replace(/\r\n/g, '<br>');
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        } else {
            // We are going back to main list
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });

    closeModalBtn.addEventListener('click', closeModal);
});
