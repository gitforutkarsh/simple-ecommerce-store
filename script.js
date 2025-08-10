(function() {
  const productsContainer = document.getElementById('products');
  const cartItemsContainer = document.getElementById('cart-items');
  const cartTotalElem = document.getElementById('cart-total');
  const searchInput = document.getElementById('search-input');
  const searchBtn = document.getElementById('search-btn');
  const clearBtn = document.getElementById('clear-btn');

  let products = [];
  let filteredProducts = [];
  let cart = [];

  // Load cart from localStorage
  function loadCart() {
    const savedCart = localStorage.getItem('cart');
    cart = savedCart ? JSON.parse(savedCart) : [];
    renderCart();
  }

  // Save cart to localStorage
  function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  // Fetch products from fakestoreapi.com
  async function fetchProducts() {
    productsContainer.innerHTML = '<p>Loading...</p>';
    try {
      const res = await fetch('https://fakestoreapi.com/products');
      if (!res.ok) {
        throw new Error('Failed to fetch products');
      }
      products = await res.json();
      filteredProducts = products; // Initially all products
      renderProducts();
    } catch (error) {
      productsContainer.innerHTML = `<p>Error: ${error.message}</p>`;
      console.error(error);
    }
  }

  // Render products on page
  function renderProducts() {
    productsContainer.innerHTML = '';
    if (filteredProducts.length === 0) {
      productsContainer.innerHTML = '<p>No products found.</p>';
      return;
    }
    filteredProducts.forEach(product => {
      const prodDiv = document.createElement('div');
      prodDiv.className = 'product';
      prodDiv.innerHTML = `
        <img src="${product.image}" alt="${product.title}" loading="lazy" />
        <h3>${truncate(product.title, 40)}</h3>
        <p>$${product.price.toFixed(2)}</p>
        <button data-id="${product.id}">Add to Cart</button>
      `;
      productsContainer.appendChild(prodDiv);
    });
  }

  // Truncate long product titles
  function truncate(text, maxLength) {
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  }

  // Add product to cart or update quantity
  function addToCart(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    const cartItem = cart.find(item => item.id === id);

    if (cartItem) {
      cartItem.quantity++;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    saveCart();
    renderCart();
  }

  // Remove product from cart
  function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    renderCart();
  }

  // Render cart items and total price
  function renderCart() {
    cartItemsContainer.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
    } else {
      cart.forEach(item => {
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
          <span>${truncate(item.title, 25)} x ${item.quantity}</span>
          <span>
            $${(item.price * item.quantity).toFixed(2)}
            <button data-id="${item.id}">x</button>
          </span>
        `;
        cartItemsContainer.appendChild(div);
        total += item.price * item.quantity;
      });
    }

    cartTotalElem.textContent = `Total: $${total.toFixed(2)}`;
  }

  // Search products by title
  function searchProducts() {
    const term = searchInput.value.trim().toLowerCase();
    filteredProducts = term
      ? products.filter(product => product.title.toLowerCase().includes(term))
      : products;
    renderProducts();
  }

  // Debounce function
  function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  }

  // Event listeners
  searchBtn.addEventListener('click', searchProducts);
  searchInput.addEventListener('keyup', debounce(searchProducts, 300));
  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchProducts();
  });

  // Event delegation for add to cart
  productsContainer.addEventListener('click', (event) => {
    if (event.target.tagName === 'BUTTON' && event.target.dataset.id) {
      const productId = parseInt(event.target.dataset.id);
      addToCart(productId);
    }
  });

  // Event delegation for remove from cart
  cartItemsContainer.addEventListener('click', (event) => {
    if (event.target.tagName === 'BUTTON' && event.target.dataset.id) {
      const productId = parseInt(event.target.dataset.id);
      removeFromCart(productId);
    }
  });

  // Initialize
  loadCart();
  fetchProducts();
})();