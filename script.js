let productsData = [];

// DOM Elements
const loader = document.getElementById('loader');
const catalog = document.getElementById('catalog');
const noResults = document.getElementById('no-results');
const searchInput = document.getElementById('main-search');
const startSearchBtn = document.getElementById('start-search-btn');
const categoryFilter = document.getElementById('category-filter');
const vehicleItems = document.querySelectorAll('.vehicle-item');
const navWhatsappBtn = document.getElementById('nav-whatsapp-btn');
const heroWhatsappBtn = document.getElementById('hero-whatsapp-btn');

let currentVehicleFilter = 'all';

// Page Checkers
const isCatalogPage = document.getElementById('catalog') !== null;
const isProductPage = document.getElementById('product-detail') !== null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupWhatsAppLinks();
    fetchProducts();
    if (isCatalogPage) {
        setupEventListeners();
    }
    setupProtection();
    
    // Global Link Feedback
    document.querySelectorAll('a, button, .vehicle-item').forEach(el => {
        el.addEventListener('click', () => {
            if (el.href && el.href.includes('wa.me')) {
                playFeedbackSound('success');
                showToast('جارٍ الانتقال للواتساب...', 'whatsapp');
            } else {
                playFeedbackSound('click');
            }
        });
    });
});

function setupProtection() {
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showToast('المحتوى محمي بحقوق الطبع والنشر', 'protection');
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'F12' || (e.ctrlKey && (e.shiftKey && (e.key === 'I' || e.key === 'J') || e.key === 'u'))) {
            e.preventDefault();
            showToast('الوصول للمصدر غير مسموح به', 'protection');
        }
    });

    document.addEventListener('dragstart', (e) => {
        if (e.target.nodeName === 'IMG') e.preventDefault();
    });
}

// --- UI Audio Feedback System ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playFeedbackSound(type = 'click') {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    if (type === 'click') {
        // Subtle click: high pitch, extremely fast decay
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(1200, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.05);
        
        gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
        
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.05);
    } else if (type === 'success') {
        // Soft success chime: two rising notes
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
        
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.2);
    }
}

function showToast(message, icon = 'info') {
    const existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    
    let iconHtml = '';
    if (icon === 'protection') iconHtml = '<i class="fa-solid fa-shield-halved" style="color: #f87171;"></i>';
    else if (icon === 'search') iconHtml = '<i class="fa-solid fa-magnifying-glass" style="color: var(--accent-color);"></i>';
    else if (icon === 'whatsapp') iconHtml = '<i class="fa-brands fa-whatsapp" style="color: #25D366;"></i>';
    else if (icon === 'filter') iconHtml = '<i class="fa-solid fa-filter" style="color: var(--accent-color);"></i>';

    toast.innerHTML = `${iconHtml} <span>${message}</span>`;
    document.body.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

function setupWhatsAppLinks() {
    const phoneNumber = "201107292913"; 
    const message = "السلام عليكم، أريد الاستفسار عن طريق صورة القطعة.";
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    
    if (navWhatsappBtn) navWhatsappBtn.href = url;
    if (heroWhatsappBtn) heroWhatsappBtn.href = url;
}

async function fetchProducts() {
    try {
        const response = await fetch('products.json');
        if (!response.ok) throw new Error('Failed to fetch products');
        
        productsData = await response.json();
        
        if (loader) loader.style.display = 'none';
        
        if (isCatalogPage) {
            if (catalog) catalog.style.display = 'grid';
            applyFilters();
        } else if (isProductPage) {
            initProductDetail();
        }

    } catch (error) {
        console.error('Error loading data:', error);
        if (loader) loader.style.display = 'none';
    }
}

function setupEventListeners() {
    vehicleItems.forEach(item => {
        item.addEventListener('click', () => {
            vehicleItems.forEach(v => v.classList.remove('selected'));
            item.classList.add('selected');
            currentVehicleFilter = item.dataset.value;
            applyFilters();
            showToast(`تم اختيار فئة: ${item.querySelector('span').textContent}`, 'filter');
        });
    });

    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                applyFilters();
                scrollToInventory();
            }
        });
    }

    if (categoryFilter) {
        categoryFilter.addEventListener('change', () => {
            applyFilters();
            playFeedbackSound('click');
            showToast('تم تحديث الفلتر', 'filter');
        });
    }

    if (startSearchBtn) {
        startSearchBtn.addEventListener('click', () => {
            applyFilters();
            scrollToInventory();
        });
    }
}

function scrollToInventory() {
    const inventorySection = document.getElementById('inventory');
    if (inventorySection) {
        inventorySection.scrollIntoView({ behavior: 'smooth' });
    }
}

function applyFilters() {
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const categoryTerm = categoryFilter ? categoryFilter.value : 'all';

    const filtered = productsData.filter(product => {
        const matchesSearch = 
            product.name.toLowerCase().includes(searchTerm) || 
            (product.description && product.description.toLowerCase().includes(searchTerm)) ||
            (product.part_number && product.part_number.toLowerCase().includes(searchTerm));
            
        const matchesVehicle = currentVehicleFilter === 'all' || product.vehicle_type === currentVehicleFilter;
        const matchesCategory = categoryTerm === 'all' || product.category === categoryTerm;

        return matchesSearch && matchesVehicle && matchesCategory;
    });

    renderProducts(filtered);
}

function renderProducts(products) {
    if (!catalog) return;
    
    catalog.innerHTML = '';

    if (products.length === 0) {
        catalog.style.display = 'none';
        if (noResults) noResults.style.display = 'block';
        return;
    }

    catalog.style.display = 'grid';
    if (noResults) noResults.style.display = 'none';

    products.forEach(product => {
        const badgeClass = product.available ? 'badge available' : 'badge out-of-stock';
        const badgeText = product.available ? 'متوفر' : 'غير متوفر';
        const svgFallback = encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="#0f172a" width="100" height="100"/><text x="50" y="50" fill="#cbd5e1" font-size="12" font-family="Arial" text-anchor="middle" dominant-baseline="middle">NO IMAGE</text></svg>');

        const card = document.createElement('div');
        card.className = 'product-card';
        const brandDisplay = product.brand ? product.brand.replace('_', ' ') : '';
        card.innerHTML = `
            <div class="product-image-container">
                <span class="${badgeClass}">${badgeText}</span>
                <div class="img-box">
                    <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.onerror=null; this.src='data:image/svg+xml;utf8,${svgFallback}';">
                    <div class="img-protect"></div>
                </div>
            </div>
            <div class="product-info">
                <span class="part-number-badge"><i class="fa-solid fa-barcode"></i> ${product.part_number}</span>
                <h3 class="product-name">${product.name} ${brandDisplay ? '- ' + brandDisplay : ''}</h3>
                
                <div class="card-specs">
                    <div class="card-spec-item">
                        <span>نوع المركبة</span>
                        <span>${product.vehicle_type}</span>
                    </div>
                    <div class="card-spec-item">
                        <span>القسم</span>
                        <span>${product.category === 'Air Filter' ? 'فلتر هواء' : product.category === 'Oil Filter' ? 'فلتر زيت' : 'فلتر جاز'}</span>
                    </div>
                    <div class="card-spec-item">
                        <span>المنشأ</span>
                        <span>${product.origin}</span>
                    </div>
                </div>
                <a href="product.html?id=${product.id}" class="btn btn-card">رؤية التفاصيل <i class="fa-solid fa-arrow-left"></i></a>
            </div>
        `;
        catalog.appendChild(card);
    });
}

function initProductDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    if (isNaN(productId)) {
        const errorMsg = document.getElementById('error-message');
        if (errorMsg) errorMsg.style.display = 'block';
        return;
    }
    const product = productsData.find(p => p.id === productId);

    if (product) {
        renderProductDetails(product);
    } else {
        const errorMsg = document.getElementById('error-message');
        if (errorMsg) errorMsg.style.display = 'block';
    }
}

function renderProductDetails(product) {
    const detailPanel = document.getElementById('product-detail');
    if (!detailPanel) return;
    detailPanel.style.display = 'flex';

    const imgContainer = document.getElementById('sticky-image-box');
    if (imgContainer) {
        const svgFallback = encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="#0f172a" width="100" height="100"/><text x="50" y="50" fill="#cbd5e1" font-size="12" font-family="Arial" text-anchor="middle" dominant-baseline="middle">NO IMAGE</text></svg>');
        imgContainer.innerHTML = `
            <div class="img-box">
                <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.onerror=null; this.src='data:image/svg+xml;utf8,${svgFallback}';">
                <div class="img-protect"></div>
            </div>
        `;
    }

    const nameEl = document.getElementById('detail-name');
    if (nameEl) nameEl.textContent = product.name;
    
    const brandEl = document.getElementById('detail-brand');
    if (brandEl && product.brand) brandEl.textContent = product.brand.replace('_', ' ');
    
    const partNumEl = document.getElementById('detail-part-number');
    if (partNumEl) partNumEl.textContent = product.part_number;
    
    const vehicleEl = document.getElementById('detail-vehicle-type');
    if (vehicleEl) vehicleEl.textContent = product.vehicle_type === 'Truck' ? 'نقل ثقيل' : product.vehicle_type;
    
    const categoryEl = document.getElementById('detail-category');
    if (categoryEl) {
        const displayCategory = product.category === 'Air Filter' ? 'فلتر هواء' : product.category === 'Oil Filter' ? 'فلتر زيت' : 'فلتر جاز';
        categoryEl.textContent = product.filter_type ? product.filter_type : displayCategory;
    }
    
    const originEl = document.getElementById('detail-origin');
    if (originEl) originEl.textContent = product.origin;
    
    const descEl = document.getElementById('detail-description');
    if (descEl) descEl.textContent = product.full_description ? product.full_description : product.description;

    // 1. Dimensions
    const dimSection = document.getElementById('side-dimensions-section');
    const dimTableBody = document.getElementById('side-dimensions-table-body');
    if (product.dimensions && dimSection && dimTableBody) {
        dimSection.style.display = 'block';
        dimTableBody.innerHTML = '';
        Object.entries(product.dimensions).forEach(([key, value]) => {
            dimTableBody.innerHTML += `<tr><td>${key}</td><td>${value}</td></tr>`;
        });
    } else if (dimSection) {
        dimSection.style.display = 'none';
    }

    // 2. Features
    const featSection = document.getElementById('side-features-section');
    const featList = document.getElementById('side-features-list');
    if (product.features && product.features.length > 0 && featSection && featList) {
        featSection.style.display = 'block';
        featList.innerHTML = '';
        product.features.forEach(feat => {
            featList.innerHTML += `<li><i class="fa-solid fa-check-double"></i> ${feat}</li>`;
        });
    } else if (featSection) {
        featSection.style.display = 'none';
    }

    // 4. OEM Numbers
    const oemSection = document.getElementById('oem-section');
    const oemContainer = document.getElementById('oem-container');
    if (product.oem_numbers && oemSection && oemContainer) {
        oemSection.style.display = 'block';
        oemContainer.innerHTML = '';
        Object.entries(product.oem_numbers).forEach(([brand, numbers]) => {
            const item = document.createElement('div');
            item.className = 'accordion-item';
            item.style = 'background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; overflow: hidden; margin-bottom: 0.75rem;';
            item.innerHTML = `
                <div class="acc-header" style="padding: 1rem 1.5rem; cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: all 0.3s;">
                    <span style="color: #fff; font-weight: 600; font-size: 1.1rem;">${brand}</span>
                    <i class="fa-solid fa-plus" style="transition: transform 0.3s; color: var(--accent-color);"></i>
                </div>
                <div class="acc-content" style="max-height: 0; overflow: hidden; transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1); background: rgba(0,0,0,0.1);">
                    <div style="padding: 1.25rem;">
                        <div style="display: flex; flex-wrap: wrap; gap: 0.75rem;">
                            ${numbers.map(num => `<span class="oem-tag" style="background: rgba(255,255,255,0.03); color: #fff; padding: 0.6rem 1rem; border-radius: 8px; font-family: 'Inter'; font-size: 1.1rem; border: 1px solid rgba(255,255,255,0.1);">${num}</span>`).join('')}
                        </div>
                    </div>
                </div>
            `;
            const header = item.querySelector('.acc-header');
            const content = item.querySelector('.acc-content');
            const icon = item.querySelector('.fa-plus');
            header.addEventListener('click', () => {
                const isOpen = content.style.maxHeight !== '0px';
                content.style.maxHeight = isOpen ? '0' : content.scrollHeight + 'px';
                icon.className = isOpen ? 'fa-solid fa-plus' : 'fa-solid fa-minus';
                header.style.background = isOpen ? 'transparent' : 'rgba(59, 130, 246, 0.1)';
            });
            oemContainer.appendChild(item);
        });
    } else if (oemSection) {
        oemSection.style.display = 'none';
    }

    // 5. Detailed Applications
    const appSection = document.getElementById('applications-section');
    const appAccordion = document.getElementById('apps-accordion');
    const appSearch = document.getElementById('app-search');
    
    if (product.applications && product.applications.length > 0 && appSection && appAccordion) {
        appSection.style.display = 'block';
        const renderApps = (filter = '') => {
            appAccordion.innerHTML = '';
            product.applications.forEach((app, idx) => {
                const filteredModels = app.models.filter(m => 
                    m.name.toLowerCase().includes(filter.toLowerCase()) || 
                    m.engine.toLowerCase().includes(filter.toLowerCase())
                );
                if (filteredModels.length === 0 && filter !== '') return;
                const item = document.createElement('div');
                item.className = 'accordion-item';
                item.style = 'background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; overflow: hidden; margin-bottom: 1rem;';
                item.innerHTML = `
                    <div class="acc-header" style="padding: 1.5rem; cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: all 0.3s;">
                        <div style="text-align: right;">
                            <span style="color: #fff; font-weight: 700; font-size: 1.2rem; display: block;">${app.category}</span>
                            ${app.sub_category ? `<span style="color: var(--accent-color); font-size: 0.9rem;">${app.sub_category}</span>` : ''}
                        </div>
                        <i class="fa-solid fa-plus" style="transition: transform 0.3s; color: var(--accent-color);"></i>
                    </div>
                    <div class="acc-content" style="max-height: 0; overflow: hidden; transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1); background: rgba(0,0,0,0.15);">
                        <div style="padding: 2rem;">
                            <div style="overflow-x: auto;">
                                <table style="width: 100%; border-collapse: collapse; text-align: left; direction: ltr;">
                                    <thead>
                                        <tr style="border-bottom: 2px solid rgba(255,255,255,0.1);">
                                            <th style="padding: 1rem; color: #64748b; font-size: 0.9rem;">MODEL</th>
                                            <th style="padding: 1rem; color: #64748b; font-size: 0.9rem;">ENGINE</th>
                                            <th style="padding: 1rem; color: #64748b; font-size: 0.9rem;">POWER</th>
                                            <th style="padding: 1rem; color: #64748b; font-size: 0.9rem;">YEAR</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${filteredModels.map(m => `
                                            <tr style="border-bottom: 1px solid rgba(255,255,255,0.03);">
                                                <td style="padding: 1rem; color: #fff; font-weight: 700;">${m.name}</td>
                                                <td style="padding: 1rem; color: #cbd5e1;">${m.engine}</td>
                                                <td style="padding: 1rem; color: #cbd5e1;">${m.power}</td>
                                                <td style="padding: 1rem; color: #64748b; font-size: 0.9rem;">${m.year}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                `;
                const header = item.querySelector('.acc-header');
                const content = item.querySelector('.acc-content');
                const icon = item.querySelector('.fa-plus');
                header.addEventListener('click', () => {
                    const isOpen = content.style.maxHeight !== '0px';
                    content.style.maxHeight = isOpen ? '0' : content.scrollHeight + 'px';
                    icon.className = isOpen ? 'fa-solid fa-plus' : 'fa-solid fa-minus';
                    header.style.background = isOpen ? 'transparent' : 'rgba(59, 130, 246, 0.1)';
                });
                appAccordion.appendChild(item);
                if (idx === 0 && filter === '') header.click();
            });
        };
        renderApps();
        if (appSearch) appSearch.addEventListener('input', (e) => renderApps(e.target.value));
    } else if (appSection) {
        appSection.style.display = 'none';
    }

    const badge = document.getElementById('detail-badge');
    if (badge) {
        if (product.available) {
            badge.className = 'detail-status-badge available';
            badge.textContent = 'متوفر';
        } else {
            badge.className = 'detail-status-badge out-of-stock';
            badge.textContent = 'غير متوفر';
        }
    }

    const whatsappBtn = document.getElementById('whatsapp-btn');
    if (whatsappBtn) {
        const phoneNumber = "201107292913"; 
        const message = `السلام عليكم، أريد الاستفسار عن القطعة: ${product.name} (رقم القطعة: ${product.part_number})`;
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        whatsappBtn.href = whatsappUrl;
    }
}
