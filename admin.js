const form = document.getElementById('product-form');
const formTitle = document.getElementById('form-title');
const formMessage = document.getElementById('form-message');
const submitButton = document.getElementById('submit-button');
const resetButton = document.getElementById('reset-form');
const addAnotherButton = document.getElementById('add-another');
const editingPartNumber = document.getElementById('editing-part-number');
const editingProductId = document.getElementById('editing-product-id');
const searchInput = document.getElementById('search');
const tableBody = document.getElementById('products-table');
const productCount = document.getElementById('product-count');
const emptyState = document.getElementById('empty-state');
const dimensionsList = document.getElementById('dimensions-list');
const oemList = document.getElementById('oem-list');
const featuresList = document.getElementById('features-list');
const applicationsList = document.getElementById('applications-list');
const toastStack = document.getElementById('toast-stack');
const confirmModal = document.getElementById('confirm-modal');
const confirmMessage = document.getElementById('confirm-message');
const confirmCancel = document.getElementById('confirm-cancel');
const confirmOk = document.getElementById('confirm-ok');
const saveSpinner = document.getElementById('save-spinner');
const importFile = document.getElementById('import-file');
const importMessage = document.getElementById('import-message');

let products = [];
let currentImageUrl = '';
let activeConfirmResolver = null;

function getField(id) {
  return document.getElementById(id);
}

function normalizePartNumber(value) {
  return String(value || '').trim();
}

function normalizeLookup(value) {
  return normalizePartNumber(value).toLowerCase();
}

function splitValues(value) {
  return String(value || '')
    .split(/\r?\n|,/)
    .map(item => item.trim())
    .filter(Boolean);
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

function setMessage(message, type = '') {
  formMessage.textContent = message;
  formMessage.className = type;
}

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toastStack.appendChild(toast);
  setTimeout(() => toast.remove(), 3600);
}

function setLoading(isLoading) {
  submitButton.disabled = isLoading;
  saveSpinner.hidden = !isLoading;
}

function showConfirm(message, confirmText = 'Confirm') {
  return new Promise(resolve => {
    activeConfirmResolver = resolve;
    confirmMessage.textContent = message;
    confirmOk.textContent = confirmText;
    confirmModal.hidden = false;

    const cleanup = answer => {
      confirmModal.hidden = true;
      activeConfirmResolver = null;
      confirmCancel.removeEventListener('click', cancelHandler);
      confirmOk.removeEventListener('click', okHandler);
      resolve(answer);
    };

    const cancelHandler = () => cleanup(false);
    const okHandler = () => cleanup(true);
    confirmCancel.addEventListener('click', cancelHandler);
    confirmOk.addEventListener('click', okHandler);
  });
}

confirmCancel.addEventListener('click', () => {
  if (!activeConfirmResolver) confirmModal.hidden = true;
});

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    const error = new Error(payload && payload.message ? payload.message : 'Request failed');
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

async function loadProducts() {
  products = await requestJson('/api/products');
  renderProducts();
  updateStats();
  updateSuggestions();
  updateLinkedProducts();
}

function oemText(product) {
  return Object.entries(product.oem_numbers || {})
    .flatMap(([company, numbers]) => [company, ...(Array.isArray(numbers) ? numbers : [])])
    .join(' ');
}

function renderProducts() {
  const query = normalizeLookup(searchInput.value);
  const filteredProducts = products.filter(product => {
    const haystack = [
      product.part_number,
      product.brand,
      product.model,
      product.name,
      oemText(product),
      ...(product.tags || [])
    ].join(' ').toLowerCase();

    return !query || haystack.includes(query);
  });

  productCount.textContent = `${filteredProducts.length} product${filteredProducts.length === 1 ? '' : 's'}`;
  emptyState.style.display = filteredProducts.length === 0 ? 'block' : 'none';

  tableBody.innerHTML = filteredProducts.map(product => `
    <tr>
      <td>${escapeHtml(product.part_number)}</td>
      <td>${escapeHtml(product.brand || '')}</td>
      <td>${escapeHtml(product.model || '')}</td>
      <td>${escapeHtml(product.origin || '')}</td>
      <td>${Array.isArray(product.related_products) ? product.related_products.length : 0}</td>
      <td>
        <div class="actions">
          <button class="secondary-button edit-button" type="button" data-action="edit" data-id="${escapeHtml(product.id)}" data-part="${escapeHtml(product.part_number)}">Edit</button>
          <button class="danger-button" type="button" data-action="delete" data-id="${escapeHtml(product.id)}" data-part="${escapeHtml(product.part_number)}">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function updateStats() {
  const brands = new Set(products.map(product => product.brand).filter(Boolean));
  const categoryCounts = products.reduce((counts, product) => {
    if (product.category) counts[product.category] = (counts[product.category] || 0) + 1;
    return counts;
  }, {});
  const mostUsedCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];

  document.getElementById('stat-products').textContent = products.length;
  document.getElementById('stat-brands').textContent = brands.size;
  document.getElementById('stat-category').textContent = mostUsedCategory ? mostUsedCategory[0] : '-';
}

function uniqueValues(values) {
  return [...new Set(values.map(value => String(value || '').trim()).filter(Boolean))].sort();
}

function updateDatalist(id, values) {
  document.getElementById(id).innerHTML = uniqueValues(values)
    .map(value => `<option value="${escapeHtml(value)}"></option>`)
    .join('');
}

function updateSuggestions() {
  const savedProfiles = JSON.parse(localStorage.getItem('autoPartsAdminFrequentValues') || '{}');
  updateDatalist('brand-suggestions', [...products.map(product => product.brand), ...Object.keys(savedProfiles)]);
  updateDatalist('model-suggestions', products.map(product => product.model));
  updateDatalist('origin-suggestions', [
    'Turkey',
    'China',
    'Germany',
    ...products.map(product => product.origin),
    ...Object.values(savedProfiles).map(profile => profile.origin)
  ]);
}

function commonValue(items, selector) {
  const counts = {};
  items.forEach(item => {
    const value = selector(item);
    if (value) counts[value] = (counts[value] || 0) + 1;
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
}

function smartFillFromBrand() {
  const brand = normalizeLookup(getField('brand').value);
  if (!brand) return;

  const savedProfiles = JSON.parse(localStorage.getItem('autoPartsAdminFrequentValues') || '{}');
  const savedProfile = Object.entries(savedProfiles).find(([savedBrand]) => normalizeLookup(savedBrand) === brand)?.[1];
  const matches = products.filter(product => normalizeLookup(product.brand) === brand);
  if (!matches.length && !savedProfile) return;

  if (!getField('origin').value) getField('origin').value = savedProfile?.origin || commonValue(matches, product => product.origin);
  getField('category').value = savedProfile?.category || commonValue(matches, product => product.category) || getField('category').value;

  const currentFeatures = collectFeatures();
  if (currentFeatures.length === 0) {
    clearList(featuresList);
    uniqueValues([...(savedProfile?.features || []), ...matches.flatMap(product => product.features || [])])
      .slice(0, 5)
      .forEach(feature => addFeature(feature));
    if (!featuresList.children.length) addFeature();
  }

  updateLivePreview();
  showToast('Smart auto-fill applied from brand history.');
}

function createInput(name, value = '', placeholder = '') {
  const input = document.createElement('input');
  input.type = 'text';
  input.dataset.name = name;
  input.value = value;
  input.placeholder = placeholder;
  input.addEventListener('input', updateLivePreview);
  return input;
}

function createTextarea(name, value = '', placeholder = '') {
  const textarea = document.createElement('textarea');
  textarea.dataset.name = name;
  textarea.rows = 2;
  textarea.value = value;
  textarea.placeholder = placeholder;
  textarea.addEventListener('input', updateLivePreview);
  return textarea;
}

function createRemoveButton(label = 'Remove') {
  const button = document.createElement('button');
  button.className = 'secondary-button remove-button';
  button.type = 'button';
  button.textContent = label;
  button.addEventListener('click', () => {
    button.closest('.repeat-row, .application-card, .model-row').remove();
    updateLivePreview();
    updateLinkedProducts();
    updateModelSummary();
  });
  return button;
}

function fieldLabel(text, help) {
  const label = document.createElement('label');
  const span = document.createElement('span');
  span.textContent = text;

  const helpButton = document.createElement('button');
  helpButton.className = 'help-star';
  helpButton.type = 'button';
  helpButton.title = help;
  helpButton.textContent = '*';
  span.appendChild(helpButton);
  label.appendChild(span);
  return label;
}

function addDimension(key = '', value = '') {
  const row = document.createElement('div');
  row.className = 'repeat-row dimension-row';
  const keyLabel = fieldLabel('Name', 'Dimension label, for example A, B, C, H.');
  keyLabel.appendChild(createInput('key', key, 'A'));
  const valueLabel = fieldLabel('Value', 'Dimension value, for example 90 mm.');
  valueLabel.appendChild(createInput('value', value, '90 mm'));
  row.append(keyLabel, valueLabel, createRemoveButton());
  dimensionsList.appendChild(row);
}

function addOem(company = '', numbers = []) {
  const row = document.createElement('div');
  row.className = 'repeat-row oem-row';
  const companyLabel = fieldLabel('Company', 'OEM manufacturer name.');
  companyLabel.appendChild(createInput('company', company, 'SCANIA'));
  const numbersLabel = fieldLabel('Numbers', 'OEM numbers separated by commas or new lines.');
  numbersLabel.appendChild(createTextarea('numbers', numbers.join('\n'), '174 2032\n174 2037'));
  row.append(companyLabel, numbersLabel, createRemoveButton());
  oemList.appendChild(row);
}

function addFeature(value = '') {
  const row = document.createElement('div');
  row.className = 'repeat-row feature-row';
  const featureLabel = fieldLabel('Feature', 'One product feature bullet.');
  featureLabel.appendChild(createInput('value', value, 'High filtration efficiency'));
  row.append(featureLabel, createRemoveButton());
  featuresList.appendChild(row);
}

function addModel(modelsList, model = {}) {
  const row = document.createElement('div');
  row.className = 'model-row';
  const nameLabel = fieldLabel('Model name', 'Model name inside this application.');
  nameLabel.appendChild(createInput('name', model.name || '', 'G230'));
  const engineLabel = fieldLabel('Engine', 'Engine code or type.');
  engineLabel.appendChild(createInput('engine', model.engine || '', 'DC9.30'));
  const powerLabel = fieldLabel('Power', 'Engine power.');
  powerLabel.appendChild(createInput('power', model.power || '', '169 kW / 230 HP'));
  const yearLabel = fieldLabel('Year', 'Compatibility year range.');
  yearLabel.appendChild(createInput('year', model.year || '', '2007 ->'));
  row.append(nameLabel, engineLabel, powerLabel, yearLabel, createRemoveButton());
  modelsList.appendChild(row);
  updateModelSummary();
}

function addApplication(application = {}) {
  const card = document.createElement('div');
  card.className = 'application-card';
  const grid = document.createElement('div');
  grid.className = 'application-grid';
  const categoryLabel = fieldLabel('Application category', 'Vehicle brand, family, or series.');
  categoryLabel.appendChild(createInput('category', application.category || '', 'SCANIA G Series'));
  const subCategoryLabel = fieldLabel('Sub category', 'Optional sub category.');
  subCategoryLabel.appendChild(createInput('sub_category', application.sub_category || '', 'Enviro / Enviro Dart'));
  grid.append(categoryLabel, subCategoryLabel, createRemoveButton('Remove application'));

  const modelHeader = document.createElement('div');
  modelHeader.className = 'section-title';
  modelHeader.innerHTML = '<h3>Models</h3>';
  const addModelButton = document.createElement('button');
  addModelButton.className = 'secondary-button';
  addModelButton.type = 'button';
  addModelButton.textContent = 'Add model';
  const modelsList = document.createElement('div');
  modelsList.className = 'models-list';
  addModelButton.addEventListener('click', () => addModel(modelsList));
  modelHeader.appendChild(addModelButton);
  card.append(grid, modelHeader, modelsList);

  const models = Array.isArray(application.models) ? application.models : [];
  if (models.length) models.forEach(model => addModel(modelsList, model));
  else addModel(modelsList);

  applicationsList.appendChild(card);
}

function clearList(list) {
  list.innerHTML = '';
}

function clearRepeatLists() {
  [dimensionsList, oemList, featuresList, applicationsList].forEach(clearList);
}

function fillRepeatLists(product = {}) {
  clearRepeatLists();
  Object.entries(product.dimensions || {}).forEach(([key, value]) => addDimension(key, value));
  Object.entries(product.oem_numbers || {}).forEach(([company, numbers]) => addOem(company, Array.isArray(numbers) ? numbers : []));
  (Array.isArray(product.features) ? product.features : []).forEach(feature => addFeature(feature));
  (Array.isArray(product.applications) ? product.applications : []).forEach(application => addApplication(application));
  if (!dimensionsList.children.length) addDimension();
  if (!oemList.children.length) addOem();
  if (!featuresList.children.length) addFeature();
  if (!applicationsList.children.length) addApplication();
  updateModelSummary();
}

function fillForm(product) {
  editingPartNumber.value = product.part_number;
  editingProductId.value = product.id || '';
  getField('part-number').value = product.part_number || '';
  getField('name').value = product.name || '';
  getField('vehicle-type').value = product.vehicle_type || 'Passenger';
  getField('brand').value = product.brand || '';
  getField('model').value = product.model || '';
  getField('origin').value = product.origin || '';
  getField('category').value = product.category || 'Oil Filter';
  getField('tags').value = (product.tags || []).join(', ');
  getField('available').value = product.available === false ? 'false' : 'true';
  getField('filter-type').value = product.filter_type || '';
  getField('description').value = product.description || '';
  getField('full-description').value = product.full_description || '';
  getField('image').value = '';
  currentImageUrl = product.image || '';
  fillRepeatLists(product);
  formTitle.textContent = 'Edit Product';
  submitButton.textContent = 'Save product';
  setMessage(`Editing ${product.part_number}`);
  updateLivePreview();
  updateLinkedProducts(product);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetForm(keepWorkflow = false) {
  const keep = {
    vehicleType: getField('vehicle-type').value,
    brand: getField('brand').value,
    category: getField('category').value
  };
  form.reset();
  editingPartNumber.value = '';
  editingProductId.value = '';
  currentImageUrl = '';
  if (keepWorkflow) {
    getField('vehicle-type').value = keep.vehicleType;
    getField('brand').value = keep.brand;
    getField('category').value = keep.category;
  }
  formTitle.textContent = 'Add Product';
  submitButton.textContent = 'Add product';
  setMessage('');
  fillRepeatLists();
  updateLivePreview();
  updateLinkedProducts();
}

function collectDimensions() {
  const dimensions = {};
  dimensionsList.querySelectorAll('.dimension-row').forEach(row => {
    const key = row.querySelector('[data-name="key"]').value.trim();
    const value = row.querySelector('[data-name="value"]').value.trim();
    if (key && value) dimensions[key] = value;
  });
  return dimensions;
}

function collectOemNumbers() {
  const oemNumbers = {};
  oemList.querySelectorAll('.oem-row').forEach(row => {
    const company = row.querySelector('[data-name="company"]').value.trim();
    const numbers = splitValues(row.querySelector('[data-name="numbers"]').value);
    if (company && numbers.length) oemNumbers[company] = numbers;
  });
  return oemNumbers;
}

function collectFeatures() {
  return Array.from(featuresList.querySelectorAll('.feature-row [data-name="value"]'))
    .map(input => input.value.trim())
    .filter(Boolean);
}

function collectApplications() {
  return Array.from(applicationsList.querySelectorAll('.application-card'))
    .map(card => {
      const category = card.querySelector('[data-name="category"]').value.trim();
      const subCategory = card.querySelector('[data-name="sub_category"]').value.trim();
      const models = Array.from(card.querySelectorAll('.model-row')).map(row => ({
        name: row.querySelector('[data-name="name"]').value.trim(),
        engine: row.querySelector('[data-name="engine"]').value.trim(),
        power: row.querySelector('[data-name="power"]').value.trim(),
        year: row.querySelector('[data-name="year"]').value.trim()
      })).filter(model => model.name || model.engine || model.power || model.year);

      const application = { category, models };
      if (subCategory) application.sub_category = subCategory;
      return application;
    })
    .filter(application => application.category || application.models.length);
}

function buildFormData(allowDuplicate = false) {
  const data = new FormData();
  data.append('partNumber', getField('part-number').value);
  data.append('name', getField('name').value);
  data.append('vehicleType', getField('vehicle-type').value);
  data.append('brand', getField('brand').value);
  data.append('model', getField('model').value);
  data.append('origin', getField('origin').value);
  data.append('category', getField('category').value);
  data.append('tags', JSON.stringify(splitValues(getField('tags').value)));
  data.append('available', getField('available').value);
  data.append('filterType', getField('filter-type').value);
  data.append('description', getField('description').value);
  data.append('fullDescription', getField('full-description').value);
  data.append('dimensions', JSON.stringify(collectDimensions()));
  data.append('oemNumbers', JSON.stringify(collectOemNumbers()));
  data.append('features', JSON.stringify(collectFeatures()));
  data.append('applications', JSON.stringify(collectApplications()));
  data.append('allowDuplicate', allowDuplicate ? 'true' : 'false');

  const image = getField('image').files[0];
  if (image) data.append('image', image);
  return data;
}

async function saveProduct(allowDuplicate = false) {
  const currentProductId = editingProductId.value;
  const url = currentProductId ? `/api/products/id/${encodeURIComponent(currentProductId)}` : '/api/products';
  const method = currentProductId ? 'PUT' : 'POST';
  return requestJson(url, { method, body: buildFormData(allowDuplicate) });
}

async function handleSave(event) {
  event.preventDefault();
  setMessage('Saving...');
  setLoading(true);

  try {
    await saveProduct(false);
    rememberFrequentValues();
    await loadProducts();
    resetForm();
    setMessage('Product saved successfully.', 'success');
    showToast('Product saved successfully.');
  } catch (error) {
    if (error.status === 409 && error.payload && error.payload.code === 'DUPLICATE_PART_NUMBER') {
      const confirmed = await showConfirm(`A product with part number ${error.payload.partNumber} already exists. Add it anyway?`, 'Add anyway');
      if (confirmed) {
        try {
          await saveProduct(true);
          rememberFrequentValues();
          await loadProducts();
          resetForm();
          showToast('Product saved after duplicate confirmation.');
        } catch (confirmError) {
          setMessage(confirmError.message, 'error');
          showToast(confirmError.message, 'error');
        }
      } else {
        setMessage('Save cancelled. Duplicate part number was not added.', 'error');
        showToast('Duplicate save cancelled.', 'error');
      }
    } else {
      setMessage(error.message, 'error');
      showToast(error.message, 'error');
    }
  } finally {
    setLoading(false);
  }
}

function rememberFrequentValues() {
  const key = 'autoPartsAdminFrequentValues';
  const current = JSON.parse(localStorage.getItem(key) || '{}');
  const brand = getField('brand').value.trim();
  if (!brand) return;

  current[brand] = {
    origin: getField('origin').value.trim(),
    category: getField('category').value,
    features: collectFeatures().slice(0, 5)
  };
  localStorage.setItem(key, JSON.stringify(current));
}

function updateLivePreview() {
  const part = getField('part-number').value || 'Part number';
  const name = getField('name').value || 'Product name';
  const brand = getField('brand').value || '-';
  const model = getField('model').value || '-';
  const origin = getField('origin').value || '-';
  const category = getField('category').value || '-';
  const tags = splitValues(getField('tags').value);

  document.getElementById('breadcrumb-path').textContent = `${getField('vehicle-type').value || 'Vehicle'} > ${brand} > ${model}`;
  document.getElementById('preview-part').textContent = part;
  document.getElementById('preview-name').textContent = name;
  document.getElementById('preview-brand').textContent = brand;
  document.getElementById('preview-model').textContent = model;
  document.getElementById('preview-origin').textContent = origin;
  document.getElementById('preview-category').textContent = category;
  document.getElementById('preview-tags').innerHTML = tags.map(tag => `<span class="tag-pill">${escapeHtml(tag)}</span>`).join('');

  const imagePreview = document.getElementById('image-preview');
  if (currentImageUrl) imagePreview.innerHTML = `<img src="${escapeHtml(currentImageUrl)}" alt="">`;
  else imagePreview.textContent = 'No image';

  updateModelSummary();
}

function currentOems() {
  return Object.values(collectOemNumbers()).flat().map(normalizeLookup).filter(Boolean);
}

function updateLinkedProducts(productOverride) {
  const ownId = editingProductId.value;
  const oems = productOverride ? Object.values(productOverride.oem_numbers || {}).flat().map(normalizeLookup) : currentOems();
  const linked = products.filter(product =>
    String(product.id) !== String(ownId) &&
    Object.values(product.oem_numbers || {}).flat().some(oem => oems.includes(normalizeLookup(oem)))
  );

  document.getElementById('linked-products').innerHTML = linked.length
    ? linked.map(product => `<span class="tag-pill">${escapeHtml(product.part_number)}</span>`).join(' ')
    : 'No linked products yet.';
}

function updateModelSummary() {
  const models = collectApplications().flatMap(application => application.models.map(model => model.name).filter(Boolean));
  document.getElementById('model-summary').innerHTML = models.length
    ? uniqueValues(models).map(model => `<span class="tag-pill">${escapeHtml(model)}</span>`).join(' ')
    : 'No models added yet.';
}

async function handleImport(dryRun) {
  if (!importFile.files[0]) {
    showToast('Choose a JSON or Excel file first.', 'error');
    return;
  }

  const data = new FormData();
  data.append('file', importFile.files[0]);
  importMessage.textContent = dryRun ? 'Validating import...' : 'Importing products...';

  try {
    const result = await requestJson(`/api/import?dryRun=${dryRun ? 'true' : 'false'}`, {
      method: 'POST',
      body: data
    });
    importMessage.textContent = dryRun
      ? `Import is valid. ${result.count} products ready.`
      : `Imported ${result.imported} products.`;
    showToast(importMessage.textContent);
    if (!dryRun) await loadProducts();
  } catch (error) {
    const errors = error.payload && error.payload.errors ? error.payload.errors : [];
    importMessage.textContent = errors.length
      ? errors.map(item => `Row ${item.row}: ${item.message}`).join(' | ')
      : error.message;
    showToast('Import validation failed.', 'error');
  }
}

async function backupProducts() {
  try {
    const result = await requestJson('/api/backup', { method: 'POST' });
    showToast(`Backup created: ${result.path}`);
  } catch (error) {
    showToast(error.message, 'error');
  }
}

function switchTab(tabName) {
  document.querySelectorAll('.tab-button').forEach(button => {
    button.classList.toggle('active', button.dataset.tab === tabName);
  });
  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.toggle('active', panel.dataset.panel === tabName);
  });
}

form.addEventListener('submit', handleSave);
resetButton.addEventListener('click', () => resetForm());
addAnotherButton.addEventListener('click', () => resetForm(true));
searchInput.addEventListener('input', renderProducts);
document.getElementById('add-dimension').addEventListener('click', () => addDimension());
document.getElementById('add-oem').addEventListener('click', () => addOem());
document.getElementById('add-feature').addEventListener('click', () => addFeature());
document.getElementById('add-application').addEventListener('click', () => addApplication());
document.getElementById('validate-import').addEventListener('click', () => handleImport(true));
document.getElementById('commit-import').addEventListener('click', () => handleImport(false));
document.getElementById('backup-products').addEventListener('click', backupProducts);

document.querySelectorAll('.tab-button').forEach(button => {
  button.addEventListener('click', () => switchTab(button.dataset.tab));
});

['part-number', 'name', 'vehicle-type', 'brand', 'model', 'origin', 'category', 'tags', 'available', 'filter-type', 'description', 'full-description'].forEach(id => {
  getField(id).addEventListener('input', updateLivePreview);
  getField(id).addEventListener('change', updateLivePreview);
});

getField('brand').addEventListener('change', smartFillFromBrand);
getField('image').addEventListener('change', event => {
  const file = event.target.files[0];
  currentImageUrl = file ? URL.createObjectURL(file) : '';
  updateLivePreview();
});

oemList.addEventListener('input', updateLinkedProducts);
applicationsList.addEventListener('input', updateModelSummary);

tableBody.addEventListener('click', async event => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;

  const partNumber = button.dataset.part;
  const productId = button.dataset.id;
  const product = products.find(item => String(item.id) === String(productId));

  if (button.dataset.action === 'edit' && product) {
    fillForm(product);
    return;
  }

  if (button.dataset.action === 'delete') {
    const confirmed = await showConfirm(`Delete product ${partNumber}?`, 'Delete');
    if (!confirmed) return;

    button.disabled = true;
    try {
      await fetch(`/api/products/id/${encodeURIComponent(productId)}`, { method: 'DELETE' }).then(response => {
        if (!response.ok) throw new Error('Delete failed');
      });
      await loadProducts();
      if (editingProductId.value === productId) resetForm();
      showToast('Product deleted.');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      button.disabled = false;
    }
  }
});

fillRepeatLists();
updateLivePreview();
loadProducts().catch(error => {
  setMessage(error.message, 'error');
  showToast(error.message, 'error');
});
