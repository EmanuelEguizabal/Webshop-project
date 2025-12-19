function fetchProducts() {
    const localProducts = JSON.parse(localStorage.getItem('productsData'));
    if (localProducts && Array.isArray(localProducts) && localProducts.length > 0) {
        renderProducts(localProducts);
    } else {
        fetch('./products.JSON')
            .then(response => response.json())
            .then(data => {
                if (Array.isArray(data.products)) {
                    localStorage.setItem('productsData', JSON.stringify(data.products));
                    renderProducts(data.products);
                } else {
                    console.error('Invalid products format in JSON file');
                }
            })
            .catch(error => {
                console.error('Error fetching the products:', error);
            });
    }
}

function renderProducts(products) {
    const container = document.getElementById('product-container');
    container.innerHTML = '';

    products.forEach((product) => {
        const productElement = document.createElement('div');
        productElement.className =
            'flex flex-col justify-between pb-8 bg-white rounded-lg shadow-xl';

        productElement.innerHTML = `
            <img 
                src="${product.image}" 
                alt="${product.name}" 
                class="object-cover rounded-t-lg aspect-video"
            />
            <h2 class="flex justify-start mt-4 ml-4 text-2xl font-medium">
                ${product.name}
            </h2>
            <p class="flex justify-start my-4 ml-4 text-2xl font-medium">
                ${product.price},-
            </p>
            <p class="flex justify-start mb-6 ml-4 mr-3 font-normal">
                ${product.description}
            </p>
            <button 
                type="button" 
                onclick="addToCart('${product.name}', '${product.description}', '${product.price}')" 
                class="flex justify-start p-2 ml-4 my-auto text-lg text-white rounded-md w-60 bg-[#2563EB]"
            >
                Voeg toe aan winkelwagen
            </button>
        `;

        container.appendChild(productElement);
    });
}

window.addEventListener('productsUpdated', (event) => {
    renderProducts(event.detail);
});

window.addEventListener('productAdded', (event) => {
    const newProduct = event.detail;
    const productsData = JSON.parse(localStorage.getItem('productsData')) || [];
    productsData.push(newProduct);
    localStorage.setItem('productsData', JSON.stringify(productsData));
    renderProducts(productsData);
});

document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
});

window.addEventListener('storage', (event) => {
    if (event.key === 'productsData') {
        const updatedProducts = JSON.parse(event.newValue);
        renderProducts(updatedProducts);
    }
});
