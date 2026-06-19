let productsData = [];

const LOGO_DEV_TOKEN = 'pk_BEqkFaEaTFSEkishNqUVlQ';

function buildBrandMeta(domain, models, aliases = []) {
    return {
        logo: domain ? `https://img.logo.dev/${domain}?token=${LOGO_DEV_TOKEN}` : '',
        models,
        aliases
    };
}

const VEHICLE_LABELS = {
    all: 'الكل',
    Passenger: 'ملاكي',
    Truck: 'نقل ثقيل',
    Commercial: 'نقل خفيف',
    Bus: 'أتوبيس',
    Minibus: 'ميكروباص',
    Equipment: 'معدات'
};

const DEFAULT_SERVICE_OPTION = {
    id: 'all',
    label: 'كل البنود',
    icon: 'fa-layer-group',
    availability: 'catalog'
};

const SERVICE_TAXONOMY = {
    Equipment: [
        { id: 'engine-overhaul', label: 'العمرات والمحركات', icon: 'fa-gears' },
        { id: 'electrical-electronics', label: 'الكهرباء والإلكترونيات', icon: 'fa-bolt' },
        { id: 'hydraulics', label: 'الهيدروليك', icon: 'fa-droplet' },
        { id: 'filters-oils', label: 'الفلاتر والزيوت', icon: 'fa-filter', availability: 'catalog', categories: ['Air Filter', 'Oil Filter', 'Fuel Filter'] },
        { id: 'cooling', label: 'التبريد', icon: 'fa-temperature-low' },
        { id: 'brakes', label: 'الفرامل', icon: 'fa-circle-dot' },
        { id: 'heavy-transmission', label: 'نقل الحركة', icon: 'fa-shuffle' },
        { id: 'chassis-suspension', label: 'العفشة والشاسيه', icon: 'fa-road' },
        { id: 'tracks-tires', label: 'الجنزير أو الإطارات', icon: 'fa-gear' },
        { id: 'cabins-accessories', label: 'الكبائن والإكسسوارات', icon: 'fa-couch' },
        { id: 'body-frame', label: 'الجسم الخارجي والهيكل', icon: 'fa-tractor' },
        { id: 'bolts-consumables', label: 'المسامير والمستهلكات', icon: 'fa-screwdriver' }
    ],
    Truck: [
        { id: 'engine-overhaul', label: 'العمرات والمحركات', icon: 'fa-gears' },
        { id: 'electrical-electronics', label: 'الكهرباء والإلكترونيات', icon: 'fa-bolt' },
        { id: 'gearbox-clutch', label: 'الفتيس والدبرياج', icon: 'fa-shuffle' },
        { id: 'differential-axles', label: 'الدفرنس والأكسال', icon: 'fa-arrows-left-right' },
        { id: 'air-brakes', label: 'الفرامل الهوائية', icon: 'fa-circle-dot' },
        { id: 'springs-airbags', label: 'التعليق', icon: 'fa-road' },
        { id: 'cooling', label: 'التبريد', icon: 'fa-temperature-low' },
        { id: 'filters-oils', label: 'الفلاتر والزيوت', icon: 'fa-filter', availability: 'catalog', categories: ['Air Filter', 'Oil Filter', 'Fuel Filter'] },
        { id: 'tires-rims', label: 'الإطارات والجنوط', icon: 'fa-compact-disc' },
        { id: 'cabin-body', label: 'الكابينة والهيكل', icon: 'fa-truck-front' },
        { id: 'exhaust', label: 'العادم', icon: 'fa-wind' },
        { id: 'consumables', label: 'المستهلكات', icon: 'fa-screwdriver' }
    ],
    Commercial: [
        { id: 'engine-overhaul', label: 'العمرات والمحركات', icon: 'fa-gears' },
        { id: 'electrical-electronics', label: 'الكهرباء والإلكترونيات', icon: 'fa-bolt' },
        { id: 'gearbox-clutch', label: 'الفتيس والدبرياج', icon: 'fa-shuffle' },
        { id: 'brakes', label: 'الفرامل', icon: 'fa-circle-dot' },
        { id: 'suspension-steering', label: 'العفشة والتوجيه', icon: 'fa-road' },
        { id: 'cooling', label: 'التبريد', icon: 'fa-temperature-low' },
        { id: 'filters-oils', label: 'الفلاتر والزيوت', icon: 'fa-filter', availability: 'catalog', categories: ['Air Filter', 'Oil Filter', 'Fuel Filter'] },
        { id: 'body-accessories', label: 'الهيكل والكماليات', icon: 'fa-truck-pickup' },
        { id: 'tires-rims', label: 'الإطارات والجنوط', icon: 'fa-compact-disc' },
        { id: 'exhaust', label: 'العادم', icon: 'fa-wind' },
        { id: 'consumables', label: 'المستهلكات', icon: 'fa-screwdriver' }
    ],
    Passenger: [
        { id: 'engine-overhaul', label: 'العمرات والمحركات', icon: 'fa-gears' },
        { id: 'electrical-electronics', label: 'الكهرباء والإلكترونيات', icon: 'fa-bolt' },
        { id: 'gearbox-clutch', label: 'الفتيس والدبرياج', icon: 'fa-shuffle' },
        { id: 'brakes', label: 'الفرامل', icon: 'fa-circle-dot' },
        { id: 'suspension-steering', label: 'العفشة والتوجيه', icon: 'fa-road' },
        { id: 'air-conditioning', label: 'التكييف', icon: 'fa-snowflake' },
        { id: 'cooling', label: 'التبريد', icon: 'fa-temperature-low' },
        { id: 'filters-oils', label: 'الفلاتر والزيوت', icon: 'fa-filter', availability: 'catalog', categories: ['Air Filter', 'Oil Filter', 'Fuel Filter'] },
        { id: 'bodywork', label: 'الهيكل والسمكرة', icon: 'fa-car-burst' },
        { id: 'lighting-accessories', label: 'الإضاءة والكماليات', icon: 'fa-lightbulb' },
        { id: 'glass-mirrors', label: 'الزجاج والمرايات', icon: 'fa-table-cells-large' },
        { id: 'tires-rims', label: 'الإطارات والجنوط', icon: 'fa-compact-disc' },
        { id: 'exhaust', label: 'العادم', icon: 'fa-wind' },
        { id: 'consumables', label: 'المستهلكات', icon: 'fa-screwdriver' }
    ],
    Bus: [
        { id: 'engine-overhaul', label: 'العمرات والمحركات', icon: 'fa-gears' },
        { id: 'electrical-electronics', label: 'الكهرباء والإلكترونيات', icon: 'fa-bolt' },
        { id: 'gearbox-clutch', label: 'الفتيس والدبرياج', icon: 'fa-shuffle' },
        { id: 'air-brakes', label: 'الفرامل الهوائية', icon: 'fa-circle-dot' },
        { id: 'suspension', label: 'التعليق والعفشة', icon: 'fa-road' },
        { id: 'cooling', label: 'التبريد', icon: 'fa-temperature-low' },
        { id: 'air-conditioning', label: 'التكييف', icon: 'fa-snowflake' },
        { id: 'filters-oils', label: 'الفلاتر والزيوت', icon: 'fa-filter', availability: 'catalog', categories: ['Air Filter', 'Oil Filter', 'Fuel Filter'] },
        { id: 'doors-air-systems', label: 'الأبواب والأنظمة الهوائية', icon: 'fa-door-open' },
        { id: 'seats-interior', label: 'المقاعد والتجهيزات الداخلية', icon: 'fa-couch' },
        { id: 'outer-body', label: 'الهيكل الخارجي', icon: 'fa-bus' },
        { id: 'tires-rims', label: 'الإطارات والجنوط', icon: 'fa-compact-disc' },
        { id: 'exhaust', label: 'العادم', icon: 'fa-wind' },
        { id: 'consumables', label: 'المستهلكات', icon: 'fa-screwdriver' }
    ],
    Minibus: [
        { id: 'engine-overhaul', label: 'العمرات والمحركات', icon: 'fa-gears' },
        { id: 'electrical-electronics', label: 'الكهرباء والإلكترونيات', icon: 'fa-bolt' },
        { id: 'gearbox-clutch', label: 'الفتيس والدبرياج', icon: 'fa-shuffle' },
        { id: 'brakes', label: 'الفرامل', icon: 'fa-circle-dot' },
        { id: 'suspension-steering', label: 'العفشة والتوجيه', icon: 'fa-road' },
        { id: 'cooling', label: 'التبريد', icon: 'fa-temperature-low' },
        { id: 'air-conditioning', label: 'التكييف', icon: 'fa-snowflake' },
        { id: 'filters-oils', label: 'الفلاتر والزيوت', icon: 'fa-filter', availability: 'catalog', categories: ['Air Filter', 'Oil Filter', 'Fuel Filter'] },
        { id: 'doors-air-systems', label: 'الأبواب والأنظمة الهوائية', icon: 'fa-door-open' },
        { id: 'seats-interior', label: 'المقاعد والتجهيزات الداخلية', icon: 'fa-couch' },
        { id: 'outer-body', label: 'الهيكل الخارجي', icon: 'fa-van-shuttle' },
        { id: 'tires-rims', label: 'الإطارات والجنوط', icon: 'fa-compact-disc' },
        { id: 'exhaust', label: 'العادم', icon: 'fa-wind' },
        { id: 'consumables', label: 'المستهلكات', icon: 'fa-screwdriver' }
    ]
};

const VEHICLE_TAXONOMY = {
    Passenger: {
        Toyota: buildBrandMeta('toyota.com', ['Corolla', 'Yaris', 'Camry', 'Hilux', 'Fortuner'], ['toyota']),
        Chevrolet: buildBrandMeta('chevrolet.com', ['Aveo', 'Cruze', 'Optra', 'Captiva', 'N300'], ['chevrolet', 'daewoo']),
        Kia: buildBrandMeta('kia.com', ['Cerato', 'Sportage', 'Picanto', 'Rio', 'K5'], ['kia']),
        Nissan: buildBrandMeta('nissan-global.com', ['Sunny', 'Sentra', 'Qashqai', 'X-Trail', 'Patrol'], ['nissan']),
        Hyundai: buildBrandMeta('hyundai.com', ['Elantra', 'Accent', 'Tucson', 'Sonata', 'H1'], ['hyundai']),
        Mitsubishi: buildBrandMeta('mitsubishi-motors.com', ['Lancer', 'Pajero', 'Canter', 'Outlander', 'Attrage'], ['mitsubishi']),
        BYD: buildBrandMeta('byd.com', ['F3', 'Qin Plus', 'Song Plus', 'Han', 'Dolphin'], ['byd'])
    },
    Truck: {
        Mercedes: buildBrandMeta('mercedes-benz.com', ['Actros', 'Axor', 'Arocs', 'Atego'], ['mercedes', 'mercedes benz', 'evobus', 'setra']),
        MAN: buildBrandMeta('man.eu', ['TGX', 'TGS', 'TGM', 'TGL'], ['man', 'neoman', 'steyr']),
        Volvo: buildBrandMeta('volvo.com', ['FH', 'FM', 'FMX', 'FL'], ['volvo']),
        Scania: buildBrandMeta('scania.com', ['R Series', 'G Series', 'P Series', 'S Series'], ['scania', 'scania irizar']),
        Iveco: buildBrandMeta('iveco.com', ['Stralis', 'Trakker', 'Eurocargo', 'Daily'], ['iveco', 'astra', 'irisbus']),
        DAF: buildBrandMeta('daf.com', ['XF', 'CF', 'LF', 'F Series'], ['daf'])
    },
    Bus: {
        MCV: buildBrandMeta('mcv-eg.com', ['600', '650', 'C127', 'C123'], ['mcv']),
        Volvo: buildBrandMeta('volvo.com', ['B7R', 'B9R', 'B11R', '7900'], ['volvo'])
    },
    Equipment: {
        CAT: buildBrandMeta('cat.com', ['320D', '950G', '966H', 'D8R'], ['cat', 'caterpillar']),
        Cummins: buildBrandMeta('cummins.com', ['QSB6.7', 'ISF3.8', 'ISC8.3', 'ISX15'], ['cummins'])
    },
    Commercial: {
        Chevrolet: buildBrandMeta('chevrolet.com', ['N300', 'T-Series', 'D-Max'], ['chevrolet']),
        Isuzu: buildBrandMeta('isuzu.com', ['D-Max', 'NKR', 'NPR', 'MUX'], ['isuzu']),
        Toyota: buildBrandMeta('toyota.com', ['Hilux', 'Hiace', 'Coaster', 'Land Cruiser'], ['toyota'])
    }
};

// DOM Elements
const loader = document.getElementById('loader');
const catalog = document.getElementById('catalog');
const noResults = document.getElementById('no-results');
const searchInput = document.getElementById('main-search');
const startSearchBtn = document.getElementById('start-search-btn');
const categoryFilter = document.getElementById('category-filter');
const hiddenBrandFilter = document.getElementById('brand-filter');
const vehicleItems = document.querySelectorAll('.vehicle-item');
const brandSection = document.getElementById('brand-filter-section');
const brandSelector = document.getElementById('brand-selector');
const serviceSection = document.getElementById('service-filter-section');
const serviceSelector = document.getElementById('service-selector');
const modelSection = document.getElementById('model-filter-section');
const modelSelector = document.getElementById('model-selector');
const selectionPathBar = document.getElementById('selection-path-bar');
const selectionPath = document.getElementById('selection-path');
const navBrand = document.querySelector('.nav-brand');
const navWhatsappBtn = document.getElementById('nav-whatsapp-btn');
const heroWhatsappBtn = document.getElementById('hero-whatsapp-btn');

let currentVehicleFilter = 'all';
let currentBrandFilter = 'all';
let currentModelFilter = 'all';
let currentServiceFilter = 'all';

// Page Checkers
const isCatalogPage = document.getElementById('catalog') !== null;
const isProductPage = document.getElementById('product-detail') !== null;

document.addEventListener('DOMContentLoaded', () => {
    setupWhatsAppLinks();
    syncNoResultsCopy();
    fetchProducts();

    if (isCatalogPage) {
        setupEventListeners();
        updateSelectionPath();
        syncHiddenBrandFilter();
    }

    setupLogoReset();

    setupProtection();

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
    document.addEventListener('keydown', event => {
        if (event.key === 'F12' || (event.ctrlKey && ((event.shiftKey && (event.key === 'I' || event.key === 'J')) || event.key === 'u'))) {
            event.preventDefault();
            showToast('الوصول للمصدر غير مسموح به', 'protection');
        }
    });

    document.addEventListener('dragstart', event => {
        if (event.target.nodeName === 'IMG') event.preventDefault();
    });
}

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playFeedbackSound(type = 'click') {
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    if (type === 'click') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(1200, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.05);

        gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.05);
    } else if (type === 'success') {
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

    setTimeout(() => toast.classList.add('show'), 10);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

function syncNoResultsCopy() {
    if (!noResults) return;

    const title = noResults.querySelector('h3');
    const description = noResults.querySelector('p');

    if (title) {
        title.innerHTML = '<i class="fa-solid fa-circle-exclamation" style="color: var(--badge-out-of-stock); font-size: 2rem; margin-bottom: 1rem;"></i><br>لا توجد نتائج — جرب اختيار آخر';
    }

    if (description) {
        description.textContent = 'جرّب تغيير نوع المركبة أو الماركة أو الموديل أو القسم.';
    }
}

function setupWhatsAppLinks() {
    updateWhatsAppLinks();
}

function setupLogoReset() {
    if (!navBrand) return;

    navBrand.addEventListener('click', event => {
        if (!isCatalogPage) return;

        event.preventDefault();
        resetCatalogFilters({ clearSearch: true, clearCategory: true, scrollTop: true });
        showToast('تم الرجوع لبداية الكتالوج', 'filter');
    });
}

function updateWhatsAppLinks() {
    const phoneNumber = '201107292913';
    const message = buildCatalogWhatsappMessage();
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    if (navWhatsappBtn) navWhatsappBtn.href = url;
    if (heroWhatsappBtn) heroWhatsappBtn.href = url;
}

function buildCatalogWhatsappMessage() {
    if (!isCatalogPage) {
        return 'السلام عليكم، أريد الاستفسار عن طريق صورة القطعة.';
    }

    const selectedService = getSelectedService();
    const vehicleLabel = VEHICLE_LABELS[currentVehicleFilter] || '';
    const details = [];

    if (vehicleLabel && currentVehicleFilter !== 'all') details.push(`نوع المركبة: ${vehicleLabel}`);
    if (currentBrandFilter !== 'all') details.push(`الماركة: ${currentBrandFilter}`);
    if (currentModelFilter !== 'all') details.push(`الموديل: ${currentModelFilter}`);
    if (selectedService.id !== 'all') details.push(`البند: ${selectedService.label}`);

    if (details.length === 0) {
        return 'السلام عليكم، أريد الاستفسار عن طريق صورة القطعة.';
    }

    return `السلام عليكم، أريد الاستفسار عن قطع غيار. ${details.join(' - ')}`;
}

async function fetchProducts() {
    try {
        const response = await fetch('products.json');
        if (!response.ok) throw new Error('Failed to fetch products');

        const rawProducts = await response.json();
        productsData = normalizeCatalogProducts(rawProducts);

        if (loader) loader.style.display = 'none';

        if (isCatalogPage) {
            if (catalog) catalog.style.display = 'grid';
            renderServiceSelector();
            renderBrandSelector();
            renderModelSelector();
            updateSelectionPath();
            syncHiddenBrandFilter();
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
            const requestedVehicle = item.dataset.value;
            const nextVehicle = requestedVehicle !== 'all' && currentVehicleFilter === requestedVehicle ? 'all' : requestedVehicle;

            setVehicleFilter(nextVehicle);

            const selectedLabel = nextVehicle === 'all'
                ? 'كل الفئات'
                : (item.querySelector('span') ? item.querySelector('span').textContent : nextVehicle);

            showToast(`تم اختيار الفئة: ${selectedLabel}`, 'filter');
        });
    });

    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
        searchInput.addEventListener('keypress', event => {
            if (event.key === 'Enter') {
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

function setVehicleFilter(vehicleValue) {
    currentVehicleFilter = vehicleValue;
    currentBrandFilter = 'all';
    currentModelFilter = 'all';
    currentServiceFilter = 'all';

    updateVehicleSelection();
    renderServiceSelector();
    renderBrandSelector();
    renderModelSelector();
    updateSelectionPath();
    syncHiddenBrandFilter();
    applyFilters();
    updateWhatsAppLinks();
}

function updateVehicleSelection() {
    vehicleItems.forEach(vehicle => {
        vehicle.classList.toggle('selected', vehicle.dataset.value === currentVehicleFilter);
    });
}

function resetCatalogFilters({ clearSearch = false, clearCategory = false, scrollTop = false } = {}) {
    if (clearSearch && searchInput) {
        searchInput.value = '';
    }

    if (clearCategory && categoryFilter) {
        categoryFilter.value = 'all';
    }

    setVehicleFilter('all');
    syncNoResultsCopy();

    if (scrollTop) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function scrollToInventory() {
    const inventorySection = document.getElementById('inventory');
    if (inventorySection) {
        inventorySection.scrollIntoView({ behavior: 'smooth' });
    }
}

function normalizeCatalogProducts(rawProducts) {
    return rawProducts.map(product => {
        const derivedMeta = deriveVehicleMeta(product);

        return {
            ...product,
            supplier_brand: product.brand || '',
            vehicle_brand_options: derivedMeta.brandOptions,
            vehicle_model_map: derivedMeta.modelMap
        };
    });
}

function deriveVehicleMeta(product) {
    const vehicleBrands = VEHICLE_TAXONOMY[product.vehicle_type];
    const brandOptions = [];
    const modelMap = {};

    if (!vehicleBrands) {
        return { brandOptions, modelMap };
    }

    const applications = Array.isArray(product.applications) ? product.applications : [];

    applications.forEach(application => {
        const categoryText = normalizeText(application.category || '');
        const applicationModels = Array.isArray(application.models)
            ? application.models.map(model => model.name).filter(Boolean)
            : [];

        Object.entries(vehicleBrands).forEach(([brand, meta]) => {
            const matchesBrand = meta.aliases.some(alias => matchesAlias(categoryText, alias));
            if (!matchesBrand) return;

            addUnique(brandOptions, brand);
            if (!modelMap[brand]) modelMap[brand] = [];

            applicationModels.forEach(modelName => addUnique(modelMap[brand], modelName.trim()));
        });
    });

    if (brandOptions.length === 0) {
        const fallbackHaystack = normalizeText([
            product.name,
            product.description,
            product.part_number,
            ...Object.keys(product.oem_numbers || {})
        ].filter(Boolean).join(' '));

        Object.entries(vehicleBrands).forEach(([brand, meta]) => {
            if (meta.aliases.some(alias => matchesAlias(fallbackHaystack, alias))) {
                addUnique(brandOptions, brand);
            }
        });
    }

    return { brandOptions, modelMap };
}

function renderServiceSelector() {
    if (!serviceSelector || !serviceSection) return;

    const services = getServiceOptions(currentVehicleFilter);
    const shouldShow = currentVehicleFilter !== 'all' && services.length > 0;

    setPanelVisibility(serviceSection, shouldShow);
    serviceSelector.innerHTML = '';

    if (!shouldShow) {
        currentServiceFilter = 'all';
        return;
    }

    services.forEach(service => {
        serviceSelector.appendChild(createServicePill(service));
    });
}

function createServicePill(service) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `service-pill${currentServiceFilter === service.id ? ' selected' : ''}`;
    button.dataset.service = service.id;
    button.innerHTML = `
        <i class="fa-solid ${escapeHtml(service.icon || 'fa-screwdriver-wrench')}"></i>
        <span>${escapeHtml(service.label)}</span>
    `;
    button.addEventListener('click', () => handleServiceSelection(service.id, service.label));
    return button;
}

function handleServiceSelection(serviceValue, label) {
    currentServiceFilter = serviceValue;

    renderServiceSelector();
    updateSelectionPath();
    applyFilters();
    updateWhatsAppLinks();

    playFeedbackSound('click');
    showToast(`تم اختيار البند: ${label}`, 'filter');
}

function getServiceOptions(vehicleType) {
    const serviceItems = SERVICE_TAXONOMY[vehicleType] || [];
    return [DEFAULT_SERVICE_OPTION, ...serviceItems];
}

function getSelectedService() {
    return getServiceOptions(currentVehicleFilter).find(service => service.id === currentServiceFilter) || DEFAULT_SERVICE_OPTION;
}

function isCatalogService(service) {
    return service.id === 'all' || service.availability === 'catalog';
}

function renderBrandSelector() {
    if (!brandSelector || !brandSection) return;

    const vehicleBrands = VEHICLE_TAXONOMY[currentVehicleFilter] || {};
    const brands = Object.keys(vehicleBrands);
    const shouldShow = currentVehicleFilter !== 'all' && brands.length > 0;

    setPanelVisibility(brandSection, shouldShow);
    brandSelector.innerHTML = '';

    if (!shouldShow) {
        return;
    }

    brandSelector.appendChild(createBrandCard('all', 'All Brands', null));

    brands.forEach(brand => {
        brandSelector.appendChild(createBrandCard(brand, brand, vehicleBrands[brand]));
    });
}

function createBrandCard(value, label, meta) {
    const card = document.createElement('div');
    const isSelected = currentBrandFilter === value;
    const fallbackText = value === 'all' ? 'ALL' : getBrandInitials(label);
    const logoMarkup = meta && meta.logo
        ? `<img src="${meta.logo}" alt="${escapeHtml(label)} logo" loading="lazy" onload="this.parentElement.classList.add('has-image')" onerror="this.remove()">`
        : '';

    card.className = `vehicle-item${isSelected ? ' selected' : ''}`;
    card.dataset.brand = value;
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.innerHTML = `
        <div class="brand-logo-shell">
            ${logoMarkup}
            <span class="brand-logo-fallback">${escapeHtml(fallbackText)}</span>
        </div>
        <span>${escapeHtml(label)}</span>
    `;

    const activate = () => handleBrandSelection(value, label);
    card.addEventListener('click', activate);
    card.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            activate();
        }
    });

    return card;
}

function handleBrandSelection(brandValue, label) {
    currentBrandFilter = brandValue;
    currentModelFilter = 'all';

    renderBrandSelector();
    renderModelSelector();
    updateSelectionPath();
    syncHiddenBrandFilter();
    applyFilters();
    updateWhatsAppLinks();

    playFeedbackSound('click');
    showToast(`تم اختيار الماركة: ${label}`, 'filter');
}

function renderModelSelector() {
    if (!modelSelector || !modelSection) return;

    const shouldShow = currentVehicleFilter !== 'all' && currentBrandFilter !== 'all';
    setPanelVisibility(modelSection, shouldShow);
    modelSelector.innerHTML = '';

    if (!shouldShow) {
        return;
    }

    const models = getModelOptions(currentVehicleFilter, currentBrandFilter);
    modelSelector.appendChild(createModelPill('all', 'All Models'));

    models.forEach(model => {
        modelSelector.appendChild(createModelPill(model, model));
    });
}

function createModelPill(value, label) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `model-pill${currentModelFilter === value ? ' selected' : ''}`;
    button.dataset.model = value;
    button.textContent = label;
    button.addEventListener('click', () => handleModelSelection(value, label));
    return button;
}

function handleModelSelection(modelValue, label) {
    currentModelFilter = modelValue;
    renderModelSelector();
    updateSelectionPath();
    applyFilters();
    updateWhatsAppLinks();

    playFeedbackSound('click');
    showToast(`تم اختيار الموديل: ${label}`, 'filter');
}

function getModelOptions(vehicleType, brand) {
    const configuredModels = VEHICLE_TAXONOMY[vehicleType] && VEHICLE_TAXONOMY[vehicleType][brand]
        ? VEHICLE_TAXONOMY[vehicleType][brand].models
        : [];

    if (configuredModels.length > 0) {
        return mergeUniqueModels(configuredModels);
    }

    const derivedModels = productsData
        .filter(product => product.vehicle_type === vehicleType && product.vehicle_brand_options.includes(brand))
        .flatMap(product => product.vehicle_model_map[brand] || [])
        .sort((left, right) => left.localeCompare(right));

    return mergeUniqueModels(derivedModels);
}

function updateSelectionPath() {
    if (!selectionPathBar || !selectionPath) return;

    const segments = [];

    if (currentVehicleFilter !== 'all') {
        segments.push(VEHICLE_LABELS[currentVehicleFilter] || currentVehicleFilter);
    }

    if (currentBrandFilter !== 'all') {
        segments.push(currentBrandFilter);
    }

    if (currentModelFilter !== 'all') {
        segments.push(currentModelFilter);
    }

    if (currentServiceFilter !== 'all') {
        segments.push(getSelectedService().label);
    }

    selectionPathBar.hidden = segments.length === 0;
    selectionPath.innerHTML = segments
        .map(segment => `<span>${escapeHtml(segment)}</span>`)
        .join('<span class="selection-path-separator">&gt;</span>');
}

function syncHiddenBrandFilter() {
    if (!hiddenBrandFilter) return;

    const brands = Object.keys(VEHICLE_TAXONOMY[currentVehicleFilter] || {});
    hiddenBrandFilter.innerHTML = '<option value="all">All Brands</option>';

    brands.forEach(brand => {
        const option = document.createElement('option');
        option.value = brand;
        option.textContent = brand;
        hiddenBrandFilter.appendChild(option);
    });

    hiddenBrandFilter.value = brands.includes(currentBrandFilter) ? currentBrandFilter : 'all';
}

function setPanelVisibility(panel, shouldShow) {
    panel.classList.toggle('is-visible', shouldShow);
    panel.setAttribute('aria-hidden', String(!shouldShow));
}

function applyFilters() {
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const categoryTerm = categoryFilter ? categoryFilter.value : 'all';
    const selectedService = getSelectedService();
    const serviceCategories = selectedService.categories || [];
    const matchesServiceInventory = isCatalogService(selectedService);

    updateWhatsAppLinks();

    const filtered = productsData.filter(product => {
        const matchesSearch =
            product.name.toLowerCase().includes(searchTerm) ||
            (product.description && product.description.toLowerCase().includes(searchTerm)) ||
            (product.part_number && product.part_number.toLowerCase().includes(searchTerm));

        const matchesVehicle = currentVehicleFilter === 'all' || product.vehicle_type === currentVehicleFilter;
        const matchesBrand = currentBrandFilter === 'all' || product.vehicle_brand_options.includes(currentBrandFilter);
        const matchesModel = currentModelFilter === 'all' || productMatchesModel(product, currentBrandFilter, currentModelFilter);
        const matchesCategory = categoryTerm === 'all' || product.category === categoryTerm;
        const matchesService = selectedService.id === 'all' || serviceCategories.includes(product.category);

        return matchesServiceInventory && matchesSearch && matchesVehicle && matchesBrand && matchesModel && matchesCategory && matchesService;
    });

    renderProducts(filtered, selectedService);
}

function renderProducts(products, selectedService = DEFAULT_SERVICE_OPTION) {
    if (!catalog) return;

    catalog.innerHTML = '';

    if (products.length === 0) {
        catalog.style.display = 'none';
        if (noResults) noResults.style.display = 'block';
        syncEmptyState(selectedService);
        return;
    }

    catalog.style.display = 'grid';
    if (noResults) noResults.style.display = 'none';

    products.forEach(product => {
        const svgFallback = encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="#0f172a" width="100" height="100"/><text x="50" y="50" fill="#cbd5e1" font-size="12" font-family="Arial" text-anchor="middle" dominant-baseline="middle">NO IMAGE</text></svg>');
        const supplierBrand = product.supplier_brand ? product.supplier_brand.replace(/_/g, ' ') : '';

        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-image-container">
                <div class="img-box">
                    <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.onerror=null; this.src='data:image/svg+xml;utf8,${svgFallback}';">
                    <div class="img-protect"></div>
                </div>
            </div>
            <div class="product-info">
                <span class="part-number-badge"><i class="fa-solid fa-barcode"></i> ${product.part_number}</span>
                <h3 class="product-name">${product.name} ${supplierBrand ? '- ' + supplierBrand : ''}</h3>

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

function syncEmptyState(selectedService = DEFAULT_SERVICE_OPTION) {
    if (!noResults) return;

    const title = noResults.querySelector('h3');
    const description = noResults.querySelector('p');
    const isRequestOnly = !isCatalogService(selectedService);
    const vehicleLabel = VEHICLE_LABELS[currentVehicleFilter] || 'المركبة';
    const serviceLabel = selectedService.id === 'all' ? 'البنود المطلوبة' : selectedService.label;

    if (title) {
        title.innerHTML = isRequestOnly
            ? '<i class="fa-solid fa-headset" style="color: var(--accent-color); font-size: 2rem; margin-bottom: 1rem;"></i><br>البند جاهز للاستفسار'
            : '<i class="fa-solid fa-circle-exclamation" style="color: var(--badge-out-of-stock); font-size: 2rem; margin-bottom: 1rem;"></i><br>لا توجد نتائج مطابقة';
    }

    if (description) {
        description.innerHTML = isRequestOnly
            ? `اخترت ${escapeHtml(serviceLabel)} لفئة ${escapeHtml(vehicleLabel)}. ابعت الطلب على واتساب وسنساعدك في تحديد القطعة المناسبة. <a class="empty-whatsapp-link" href="${heroWhatsappBtn ? heroWhatsappBtn.href : '#'}" target="_blank">إرسال الطلب</a>`
            : 'جرّب تغيير نوع المركبة أو الماركة أو الموديل أو القسم.';
    }
}

function mergeUniqueModels(models) {
    const seen = new Set();
    const merged = [];

    models.forEach(model => {
        const cleanModel = (model || '').trim();
        const key = normalizeText(cleanModel);

        if (!cleanModel || seen.has(key)) return;

        seen.add(key);
        merged.push(cleanModel);
    });

    return merged;
}

function normalizeText(value = '') {
    return String(value)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
}

function matchesAlias(text, alias) {
    return text.includes(normalizeText(alias));
}

function productMatchesModel(product, brand, selectedModel) {
    const selectedKey = normalizeText(selectedModel);

    const derivedModelMatch = (product.vehicle_model_map[brand] || []).some(model =>
        normalizeText(model).includes(selectedKey)
    );

    if (derivedModelMatch) {
        return true;
    }

    const brandMeta = VEHICLE_TAXONOMY[product.vehicle_type] && VEHICLE_TAXONOMY[product.vehicle_type][brand]
        ? VEHICLE_TAXONOMY[product.vehicle_type][brand]
        : null;

    if (!brandMeta || !Array.isArray(product.applications)) {
        return false;
    }

    return product.applications.some(application => {
        const categoryText = normalizeText(application.category || '');
        const brandMatches = brandMeta.aliases.some(alias => matchesAlias(categoryText, alias));
        if (!brandMatches) return false;

        if (categoryText.includes(selectedKey)) {
            return true;
        }

        return Array.isArray(application.models) && application.models.some(model =>
            normalizeText(model.name || '').includes(selectedKey)
        );
    });
}

function addUnique(items, value) {
    if (!value || items.includes(value)) return;
    items.push(value);
}

function getBrandInitials(brandName) {
    return brandName
        .split(/\s+/)
        .map(part => part.charAt(0))
        .join('')
        .slice(0, 2)
        .toUpperCase();
}

function escapeHtml(value = '') {
    return String(value).replace(/[&<>"']/g, character => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[character]));
}

function initProductDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'), 10);

    if (Number.isNaN(productId)) {
        const errorMsg = document.getElementById('error-message');
        if (errorMsg) errorMsg.style.display = 'block';
        return;
    }

    const product = productsData.find(item => item.id === productId);

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

    const featSection = document.getElementById('side-features-section');
    const featList = document.getElementById('side-features-list');
    if (product.features && product.features.length > 0 && featSection && featList) {
        featSection.style.display = 'block';
        featList.innerHTML = '';
        product.features.forEach(feature => {
            featList.innerHTML += `<li><i class="fa-solid fa-check-double"></i> ${feature}</li>`;
        });
    } else if (featSection) {
        featSection.style.display = 'none';
    }

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
                            ${numbers.map(number => `<span class="oem-tag" style="background: rgba(255,255,255,0.03); color: #fff; padding: 0.6rem 1rem; border-radius: 8px; font-family: 'Inter'; font-size: 1.1rem; border: 1px solid rgba(255,255,255,0.1);">${number}</span>`).join('')}
                        </div>
                    </div>
                </div>
            `;

            const header = item.querySelector('.acc-header');
            const content = item.querySelector('.acc-content');
            const icon = item.querySelector('.fa-plus');

            header.addEventListener('click', () => {
                const isOpen = content.style.maxHeight !== '0px';
                content.style.maxHeight = isOpen ? '0' : `${content.scrollHeight}px`;
                icon.className = isOpen ? 'fa-solid fa-plus' : 'fa-solid fa-minus';
                header.style.background = isOpen ? 'transparent' : 'rgba(59, 130, 246, 0.1)';
            });

            oemContainer.appendChild(item);
        });
    } else if (oemSection) {
        oemSection.style.display = 'none';
    }

    const appSection = document.getElementById('applications-section');
    const appAccordion = document.getElementById('apps-accordion');
    const appSearch = document.getElementById('app-search');

    if (product.applications && product.applications.length > 0 && appSection && appAccordion) {
        appSection.style.display = 'block';

        const renderApps = (filter = '') => {
            appAccordion.innerHTML = '';

            product.applications.forEach((app, idx) => {
                const appModels = Array.isArray(app.models) ? app.models : [];
                const filteredModels = appModels.filter(model =>
                    model.name.toLowerCase().includes(filter.toLowerCase()) ||
                    model.engine.toLowerCase().includes(filter.toLowerCase())
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
                                        ${filteredModels.map(model => `
                                            <tr style="border-bottom: 1px solid rgba(255,255,255,0.03);">
                                                <td style="padding: 1rem; color: #fff; font-weight: 700;">${model.name}</td>
                                                <td style="padding: 1rem; color: #cbd5e1;">${model.engine}</td>
                                                <td style="padding: 1rem; color: #cbd5e1;">${model.power}</td>
                                                <td style="padding: 1rem; color: #64748b; font-size: 0.9rem;">${model.year}</td>
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
                    content.style.maxHeight = isOpen ? '0' : `${content.scrollHeight}px`;
                    icon.className = isOpen ? 'fa-solid fa-plus' : 'fa-solid fa-minus';
                    header.style.background = isOpen ? 'transparent' : 'rgba(59, 130, 246, 0.1)';
                });

                appAccordion.appendChild(item);
                if (idx === 0 && filter === '') header.click();
            });
        };

        renderApps();
        if (appSearch) appSearch.addEventListener('input', event => renderApps(event.target.value));
    } else if (appSection) {
        appSection.style.display = 'none';
    }

    const whatsappBtn = document.getElementById('whatsapp-btn');
    if (whatsappBtn) {
        const phoneNumber = '201107292913';
        const message = `السلام عليكم، أريد الاستفسار عن القطعة: ${product.name} (رقم القطعة: ${product.part_number})`;
        whatsappBtn.href = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    }
}
