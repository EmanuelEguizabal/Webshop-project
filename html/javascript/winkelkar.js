function addToCart(name, description, price) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  let product = cart.find(item => item.name === name);

  if (product) {
    product.quantity += 1;
  } else {
    cart.push({ name, description, price: parseFloat(price), quantity: 1 });
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  showNotification(`${name} is toegevoegd aan de winkelwagen!`);
}

function showNotification(message) {
  const notification = document.getElementById('notification');
  notification.innerText = message;
  notification.classList.add('show');

  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}

function updateQuantity(name, change) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  let product = cart.find(item => item.name === name);

  if (product) {
    product.quantity += change;
    if (product.quantity <= 0) {
      cart = cart.filter(item => item.name !== name);
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCart();
  }
}

function displayCart() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const container = document.getElementById('cart-container');
  container.innerHTML = '';

  if (cart.length === 0) {
    container.innerHTML = '<p class="leeg">Je winkelwagen is leeg.</p>';
    document.querySelector('.totaalprijs').innerText = '€0.00';
    return;
  }

  const table = document.createElement('table');
  table.className = 'cart-table';
  table.innerHTML = `
    <tr>
      <th>Product</th>
      <th>Prijs</th>
      <th>Aantal</th>
    </tr>
  `;

  cart.forEach(item => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.name}</td>
      <td>€${parseFloat(item.price).toFixed(2)}</td>
      <td>
        <button class="quantity-button" onclick="updateQuantity('${item.name}', -1)">-</button>
        ${item.quantity}
        <button class="quantity-button" onclick="updateQuantity('${item.name}', 1)">+</button>
      </td>
    `;
    table.appendChild(row);
  });

  container.appendChild(table);
  displayTotalPrice();
}

function displayTotalPrice() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  document.querySelector('.totaalprijs').innerText = `€${total.toFixed(2)}`;
}

function handleCheckout() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  if (cart.length === 0) return;

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const order = {
    totalPrice: total.toFixed(2),
    date: new Date().toLocaleString(),
    products: [...cart]
  };

  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  orders.push(order);

  localStorage.setItem('orders', JSON.stringify(orders));
  localStorage.removeItem('cart');

  showNotification('Je bestelling is geplaatst!');
  displayCart();

  window.location.href = 'afreken.html';
}

document.querySelectorAll('.add-to-cart-button').forEach(button => {
  button.addEventListener('click', event => {
    event.preventDefault();
    const name = button.getAttribute('data-name');
    const description = button.getAttribute('data-description');
    const price = button.getAttribute('data-price');
    addToCart(name, description, price);
  });
});

document.getElementById('afrekenen').addEventListener('click', handleCheckout);

window.onload = displayCart;

window.addToCart = addToCart;
window.updateQuantity = updateQuantity;