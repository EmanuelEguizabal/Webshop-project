async function fetchBaseProducts() {
    try {
        const response = await fetch('./products.json');
        const data = await response.json();
        return data.products;
    } catch (error) {
        console.error('Error fetching base products:', error);
        return [];
    }
}

let productsData = JSON.parse(localStorage.getItem('productsData')) || [];

async function initializeProducts() {
    if (!localStorage.getItem('productsData')) {
        const baseProducts = await fetchBaseProducts();
        productsData = [...baseProducts];
        localStorage.setItem('productsData', JSON.stringify(productsData));
    } else {
        productsData = JSON.parse(localStorage.getItem('productsData'));
    }
    renderTable(productsData);
}

function renderTable(products) {
    const tableBody = document.getElementById('productTableBody');
    tableBody.innerHTML = '';

    products.forEach((product, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-4 py-2">${index + 1}</td>
            <td class="px-4 py-2"><img src="${product.image}" alt="${product.name}" class="h-16"></td>
            <td class="px-4 py-2">${product.name}</td>
            <td class="px-4 py-2">${product.price}</td>
            <td class="px-4 py-2">
                <button 
                    data-modal-target="default-modal" 
                    data-modal-toggle="default-modal" 
                    data-index="${index}" 
                    class="px-2 py-1 text-white bg-blue-500 rounded hover:bg-blue-700 modal-toggle-button" 
                    type="button"
                >
                    Edit
                </button>
                <button 
                    class="px-2 py-1 text-white bg-red-500 rounded hover:bg-red-700" 
                    onclick="deleteProduct(${index})"
                >
                    Delete
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    document.querySelectorAll('.modal-toggle-button').forEach(button => {
        button.addEventListener('click', (event) => {
            const index = event.target.getAttribute('data-index');
            const product = products[index];
            populateEditForm(product, index);
            const modalId = button.getAttribute('data-modal-target');
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.remove('hidden');
                modal.classList.add('flex');
            }
        });
    });
}

function populateEditForm(product, index) {
    document.getElementById('editProductId').value = index;
    document.getElementById('editProductName').value = product.name;
    document.getElementById('editProductPrice').value = product.price;
    document.getElementById('editProductDescription').value = product.description;
    document.getElementById('editProductPicture').value = '';
    const existingError = document.getElementById('editError');
    if (existingError) existingError.remove();
}

function saveChanges() {
    const index = document.getElementById('editProductId').value;
    const name = document.getElementById('editProductName').value.trim();
    const price = document.getElementById('editProductPrice').value.trim();
    const description = document.getElementById('editProductDescription').value.trim();

    if (!name || !price || !description) {
        showEditError('fill it all in -');
        return;
    }

    if (isNaN(price)) {
        showEditError('Price must be a number');
        return;
    }

    const imageInput = document.getElementById('editProductPicture');
    const imageFile = imageInput.files[0];
    const updatedProduct = productsData[index];
    updatedProduct.name = name;
    updatedProduct.price = price;
    updatedProduct.description = description;

    if (imageFile) updatedProduct.image = URL.createObjectURL(imageFile);

    localStorage.setItem('productsData', JSON.stringify(productsData));
    renderTable(productsData);
    closeModal();
    updateCartProduct(updatedProduct);
}

function showEditError(message) {
    const existingError = document.getElementById('editError');
    if (existingError) existingError.remove();

    const errorElement = document.createElement('div');
    errorElement.id = 'editError';
    errorElement.className = 'text-red-500 mb-4 font-medium';
    errorElement.textContent = message;

    const modalFooter = document.querySelector('#default-modal [class*="p-4 border-t"]');
    if (modalFooter) modalFooter.insertBefore(errorElement, modalFooter.firstChild);
}

function updateCartProduct(updatedProduct) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.map(item => item.name === updatedProduct.name ? { ...item, ...updatedProduct } : item);
    localStorage.setItem('cart', JSON.stringify(cart));
}

function deleteProduct(index) {
    productsData.splice(index, 1);
    localStorage.setItem('productsData', JSON.stringify(productsData));
    renderTable(productsData);
}

function addProduct(event) {
    event.preventDefault();

    const name = document.getElementById('productName').value.trim();
    const price = document.getElementById('productPrice').value.trim();
    const description = document.getElementById('productDescription').value.trim();
    const imageInput = document.getElementById('productPicture');
    const imageFile = imageInput.files[0];

    if (!name || !price || !description || !imageFile) {
        alert('All fields are required');
        return;
    }

    if (isNaN(price)) {
        alert('Price must be a number');
        return;
    }

    const reader = new FileReader();
    reader.onloadend = function() {
        const newProduct = {
            name,
            price,
            description,
            image: reader.result
        };
        productsData.push(newProduct);
        localStorage.setItem('productsData', JSON.stringify(productsData));
        renderTable(productsData);
        document.getElementById('productForm').reset();
        updateIndexProducts();
        updateIndexPageProducts(newProduct);
    };
    reader.readAsDataURL(imageFile);
}

function updateIndexPageProducts(newProduct) {
    const event = new CustomEvent('productAdded', { detail: newProduct });
    window.dispatchEvent(event);
}

function updateIndexProducts() {
    const event = new CustomEvent('productsUpdated', { detail: productsData });
    window.dispatchEvent(event);
}

function closeModal() {
    const existingError = document.getElementById('editError');
    if (existingError) existingError.remove();
    const modal = document.getElementById('default-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function resetProducts() {
    fetchBaseProducts().then(baseProducts => {
        productsData = [...baseProducts];
        localStorage.setItem('productsData', JSON.stringify(productsData));
        renderTable(productsData);
    });
}

function displayOrders() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const besteloverzicht = document.getElementById('besteloverzicht');
    besteloverzicht.innerHTML = '';

    if (orders.length === 0) {
        besteloverzicht.innerHTML = '<p class="leeg">Geen bestellingen gevonden.</p>';
        return;
    }

    const table = document.createElement('table');
    table.className = 'min-w-full bg-white';
    table.innerHTML = `
        <thead>
            <tr class="bg-gray-200">
                <th class="px-4 py-2 text-left">Datum en Tijd</th>
                <th class="px-4 py-2 text-left">Producten</th>
                <th class="px-4 py-2 text-left">Totaal Prijs</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;

    orders.forEach(order => {
        const row = document.createElement('tr');
        const productNames = order.products ? order.products.map(p => `${p.name} (${p.quantity}x)`).join(', ') : 'No products';
        row.innerHTML = `
            <td class="px-4 py-2 border text-left">${order.date}</td>
            <td class="px-4 py-2 border text-left">${productNames}</td>
            <td class="px-4 py-2 border text-left">€${order.totalPrice}</td>
        `;
        table.querySelector('tbody').appendChild(row);
    });

    besteloverzicht.appendChild(table);
}

document.addEventListener('DOMContentLoaded', initializeProducts);
window.onload = () => {
    renderTable(productsData);
    displayOrders();
};
document.getElementById('productForm').addEventListener('submit', addProduct);
document.getElementById('resetProducts').addEventListener('click', resetProducts);
document.getElementById('closeModalButton').addEventListener('click', closeModal);
document.getElementById('cancelButton').addEventListener('click', closeModal);
document.getElementById('saveChangesButton').addEventListener('click', saveChanges);