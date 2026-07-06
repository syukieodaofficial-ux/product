document.addEventListener('DOMContentLoaded', () => {
  const pathname = window.location.pathname;
  feather.replace();

  const html = document.documentElement;
  const themeToggle = document.getElementById('theme-toggle');
  const mobileToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  const faqItems = document.querySelectorAll('.faq-item');
  const loadingScreen = document.querySelector('.loading-screen');
  const toast = document.querySelector('.toast');
  const searchInput = document.querySelector('[data-search]');
  const categoryFilter = document.querySelector('[data-category]');
  const sortFilter = document.querySelector('[data-sort]');
  const shopCards = document.querySelectorAll('[data-filterable]');

  const storedTheme = localStorage.getItem('theme');
  if (storedTheme) html.classList.toggle('dark', storedTheme === 'dark');

  themeToggle?.addEventListener('click', () => {
    const dark = html.classList.toggle('dark');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  });

  mobileToggle?.addEventListener('click', () => {
    navLinks.classList.toggle('mobile-open');
  });

  faqItems.forEach((item) => {
    const button = item.querySelector('.faq-question');
    button?.addEventListener('click', () => {
      faqItems.forEach((other) => {
        if (other !== item) other.classList.remove('active');
      });
      item.classList.toggle('active');
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('in-view');
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

  const showToast = (message) => {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(showToast.timeout);
    showToast.timeout = setTimeout(() => toast.classList.remove('show'), 1800);
  };

  const applyShopFilters = () => {
    if (!shopCards.length) return;
    const query = searchInput?.value.toLowerCase() || '';
    const category = categoryFilter?.value || 'all';
    const sort = sortFilter?.value || 'featured';

    const visibleCards = Array.from(shopCards).filter((card) => {
      const text = card.textContent.toLowerCase();
      const cardCategory = card.getAttribute('data-category') || '';
      const matchesQuery = text.includes(query);
      const matchesCategory = category === 'all' || cardCategory === category;
      return matchesQuery && matchesCategory;
    });

    shopCards.forEach((card) => card.style.display = 'none');
    visibleCards.forEach((card) => { card.style.display = 'block'; });

    if (sort === 'price') {
      const sorted = visibleCards.sort((a, b) => Number(a.getAttribute('data-price')) - Number(b.getAttribute('data-price')));
      const container = document.querySelector('[data-shop-grid]');
      sorted.forEach((card) => container.appendChild(card));
    }
  };

  [searchInput, categoryFilter, sortFilter].forEach((control) => control?.addEventListener('input', applyShopFilters));
  [searchInput, categoryFilter, sortFilter].forEach((control) => control?.addEventListener('change', applyShopFilters));

  document.querySelectorAll('[data-action]').forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.getAttribute('data-action');
      if (action === 'wishlist') {
        showToast('Added to wishlist');
      } else if (action === 'cart') {
        showToast('Added to cart');
      } else if (action === 'buy') {
        const productName = button.getAttribute('data-product-name') || 'template';        
        showPaymentModal(productName);
      }
    });
  });

  const injectModalStyles = () => {
    if (document.getElementById('payment-modal-styles')) return;

    const style = document.createElement('style');
    style.id = 'payment-modal-styles';
    style.innerHTML = `
      .payment-modal {
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.6);
        display: flex; align-items: center; justify-content: center;
        z-index: 1000; opacity: 0; animation: fadeIn 0.3s forwards;
      }
      .payment-modal .payment-card {
        background: var(--card-bg); border-radius: 12px;
        padding: 2rem; width: 90%; max-width: 420px;
        transform: scale(0.95); animation: scaleUp 0.3s 0.1s forwards;
        border: 1px solid var(--border-color);
      }
      .payment-modal .modal-header {
        display: flex; justify-content: space-between; align-items: center;
        margin-bottom: 0.5rem;
      }
      .payment-modal .modal-header h3 { margin: 0; }
      .payment-modal .close-btn { background: none; border: none; cursor: pointer; color: var(--text-color); padding: 4px; }
      .payment-modal .close-btn:hover { color: var(--primary); }
      .payment-modal .product-info {
        font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1.5rem;
      }
      .payment-modal .payment-options { display: flex; flex-direction: column; gap: 0.75rem; }
      .payment-modal .payment-option {
        display: flex; align-items: center; justify-content: center; gap: 0.75rem;
        padding: 0.8rem; text-align: center;
      }
      .payment-modal .payment-option svg { width: 24px; height: 24px; }
      @keyframes fadeIn { to { opacity: 1; } }
      @keyframes scaleUp { to { transform: scale(1); } }
    `;
    document.head.appendChild(style);
  };

  const showPaymentModal = (productName) => {
    injectModalStyles();

    const modalHTML = `
      <div id="payment-modal" class="payment-modal">
        <div class="payment-card">
          <div class="modal-header">
            <h3>Complete Purchase</h3>
            <button class="close-btn" aria-label="Close payment modal">&times;</button>
          </div>
          <p class="product-info">You are purchasing: <strong>${productName.replace(/-/g, ' ')}</strong></p>
          <div class="payment-options">
            <button class="btn btn-primary payment-option" data-method="GCash">
              <svg fill="currentColor" viewBox="0 0 24 24"><path d="M21.38 10.26a7.47 7.47 0 0 0-5.22-5.22C13.8.8 9.26-.43 5.22.41A7.47 7.47 0 0 0 .41 5.22C-.43 9.26.8 13.8 4.14 16.18l-2.4 2.4a.75.75 0 0 0 1.06 1.06l2.4-2.4c2.38 3.34 6.92 4.57 10.96 3.73a7.47 7.47 0 0 0 5.22-5.22c1.24-4.04-.01-8.58-3.35-10.97zM12 18a6 6 0 1 1 0-12 6 6 0 0 1 0 12zm-3.1-7.46a.75.75 0 0 1 .6-1.04h5a.75.75 0 0 1 .6 1.04l-2.5 6a.75.75 0 0 1-1.2 0l-2.5-6z"/></svg>
              Pay with GCash
            </button>
            <button class="btn btn-primary payment-option" data-method="PayPal">
              <svg fill="currentColor" viewBox="0 0 24 24"><path d="M3.3.21a.9.9 0 0 0-1 .9L0 19.81a.9.9 0 0 0 .9.9h6.3a.9.9 0 0 0 .9-.9v-1.33a.9.9 0 0 0-.9-.9H4.2l.7-4.2h3.3a.9.9 0 0 0 .9-.9V9.88a.9.9 0 0 0-.9-.9H5.6l.5-3a.9.9 0 0 0-.9-.9H3.3zm10.2 0a.9.9 0 0 0-1 .9L10.2 17.4a.9.9 0 0 0 .9.9h3.6l-.5 3a.9.9 0 0 0 .9.9h2.1a.9.9 0 0 0 .9-.9l2.4-15.6a.9.9 0 0 0-.9-.9h-6.3zm-1.2 4.2h2.4l.7-4.2h-2.4l-.7 4.2z"/></svg>
              Pay with PayPal
            </button>
            <button class="btn btn-primary payment-option" data-method="Debit Card">
              <svg fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM4 8h16v2H4V8zm16 10H4v-4h16v4z"/></svg>
              Pay with Debit Card
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    feather.replace(); // To render the close icon if you use it

    const modal = document.getElementById('payment-modal');
    const closeButton = modal.querySelector('.close-btn');

    const closeModal = () => modal.remove();

    modal.querySelectorAll('.payment-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const method = btn.getAttribute('data-method');
        showToast(`Processing payment with ${method}...`);
        closeModal();

        setTimeout(() => {
          if (productName.includes('Subscription')) {
            // Handle subscription success
            localStorage.setItem('isSubscribed', 'true');
            showToast('Subscription successful! Welcome aboard.');
            setTimeout(() => {
              window.location.href = 'account.html';
            }, 1500);
          } else {
            // Handle single purchase success (download)
            showToast('Payment successful! Your download will begin.');
            const fileContent = `Thank you for purchasing the ${productName.replace(/-/g, ' ')}!\n\nYour template link is inside this file.`;
            const blob = new Blob([fileContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${productName.replace(/-/g, ' ')}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }
        }, 2000);
      });
    });

    closeButton.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  };

  setTimeout(() => loadingScreen?.classList.add('hidden'), 900);
  setTimeout(() => loadingScreen?.remove(), 1300);

  const downloadProduct = (productName) => {
    showToast('Preparing your download...');
    const fileContent = `Thank you for being a subscriber!\n\nHere is your file for ${productName.replace(/-/g, ' ')}.`;
    const blob = new Blob([fileContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${productName.replace(/-/g, ' ')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // --- PRODUCT DETAIL PAGE LOGIC ---
  if (pathname.includes('product.html')) {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');
    const productName = params.get('name') || productId.replace(/-/g, ' ') || 'Selected Template';
    const productDesc = params.get('desc') || 'No description available.';
    const productImg = params.get('img') || 'https://placehold.co/600x400';
    const productPrice = params.get('price') || 'N/A';

    const isSubscribed = localStorage.getItem('isSubscribed') === 'true';

    const contentArea = document.getElementById('product-detail-content');
    if (contentArea) {
      document.title = `${productName} | Digital Flow`;
      let productHTML;

      if (isSubscribed) {
        productHTML = `
          <div class="product-detail-image reveal">
            <img src="${productImg}" alt="${productName}">
          </div>
          <div class="product-detail-info reveal">
            <h1>${productName}</h1>
            <p class="price">Included with your subscription</p>
            <p class="description">${productDesc}</p>
            <p>You have All-Access. You can download this template for free.</p>
            <div style="margin-top: 1.5rem;">
              <button id="download-btn" class="btn btn-primary" style="width: 100%;">Download Now</button>
            </div>
          </div>
        `;
      } else {
        productHTML = `
          <div class="product-detail-image reveal">
            <img src="${productImg}" alt="${productName}">
          </div>
          <div class="product-detail-info reveal">
            <h1>${productName}</h1>
            <p class="price">₱${productPrice}</p>
            <p class="description">${productDesc}</p>
            <p>Subscribe to get full access and start editing this template. Cancel anytime.</p>
            <div style="margin-top: 1.5rem;">
              <button id="subscribe-btn" class="btn btn-primary" style="width: 100%;">Subscribe Now</button>
            </div>
          </div>
        `;
      }
      contentArea.innerHTML = productHTML;
      document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

      document.getElementById('subscribe-btn')?.addEventListener('click', () => {
        // When user wants to subscribe from a product page, redirect them to the main subscription page
        window.location.href = 'subscribe.html';
      });
      document.getElementById('download-btn')?.addEventListener('click', () => downloadProduct(productName));
    }
  }

  // Store product data in localStorage when a card is clicked
  if (pathname.includes('shop.html')) {
    const isSubscribed = localStorage.getItem('isSubscribed') === 'true';

    if (isSubscribed) {
      // For subscribed users, show "Included" and hide "Buy Now" button
      document.querySelectorAll('.shop-card').forEach(card => {
        card.querySelector('.price').textContent = 'Included';
        card.querySelector('.buy-now-btn').style.display = 'none';
      });
    } else {
      // For logged-in (but not subscribed) users, add functionality to "Buy Now" buttons
      document.querySelectorAll('.buy-now-btn').forEach(button => {
        button.addEventListener('click', (e) => {
          e.preventDefault(); // Stop the link navigation
          e.stopPropagation(); // Stop the event from bubbling up to the card link
          const productName = button.getAttribute('data-product-name');
          showPaymentModal(productName);
        });
      });
    }

    document.querySelectorAll('a.card-link').forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault(); // Prevent immediate navigation
        const data = {
          id: this.href.split('?id=')[1],
          name: this.dataset.name,
          desc: this.dataset.desc,
          img: this.dataset.img,
          price: this.dataset.price,
        };
        localStorage.setItem('productData', JSON.stringify(data));
        window.location.href = this.href;
      });
    });
  }

  // --- SUBSCRIBE PAGE LOGIC ---
  if (pathname.includes('subscribe.html')) {
    const isSubscribed = localStorage.getItem('isSubscribed') === 'true';
    const contentArea = document.getElementById('subscribe-content');

    if (isSubscribed) {
      contentArea.innerHTML = `
        <h2>You're an All-Access Subscriber!</h2>
        <p class="card-meta" style="font-size: 1.1rem; margin-bottom: 2rem;">You already have unlimited access to our entire library.</p>
        <a href="shop.html" class="btn btn-primary">Browse Templates</a>
      `;
    } else {
      const confirmBtn = document.getElementById('confirm-subscription-btn');
      confirmBtn?.addEventListener('click', () => {
        showPaymentModal('Ultimate All-Access Subscription');
      });
    }
  }

  // --- AUTHENTICATION SIMULATION ---

  // Note: Registration and database logic have been removed as requested.

  // Handle login form submission
  if (pathname.includes('login.html')) {
    const loginForm = document.querySelector('form');
    loginForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      // Clear any previous subscription status to ensure a clean slate for the new user
      localStorage.removeItem('isSubscribed');

      // Simulate a successful login without checking credentials
      localStorage.setItem('isLoggedIn', 'true');
      showToast('Login successful! Redirecting...');

      const params = new URLSearchParams(window.location.search);
      let redirectUrl = params.get('redirect') || 'shop.html';
      if (redirectUrl.startsWith('/')) redirectUrl = redirectUrl.substring(1);

      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 1500);
    });
  }

  // 1. Protect authenticated pages
  if (pathname.includes('shop.html') || pathname.includes('account.html') || pathname.includes('product.html') || pathname.includes('subscribe.html')) {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn !== 'true') {
      // Redirect to login, but remember where the user was going
      window.location.href = `login.html?redirect=${window.location.pathname}`;
      return;
    }
  }

  // 2. Populate account page and handle logout
  if (pathname.includes('account.html')) {
    const isSubscribed = localStorage.getItem('isSubscribed');
    if (isSubscribed === 'true') {
      const accountCard = document.querySelector('.account-card');
      const subscriptionInfoHTML = `
        <div class="card reveal" style="margin-top: 1.5rem; background: var(--surface);">
          <div class="card-head" style="margin-bottom: 0;">
            <div>
              <h3>All-Access Subscriber</h3>
              <p class="card-meta">Your subscription is active. You can now download any template from the shop.</p>
            </div>
          </div>
        </div>
      `;
      accountCard.insertAdjacentHTML('afterend', subscriptionInfoHTML);
    }
    // Handle logout
    const logoutButton = document.querySelector('#logout-btn');
    if (logoutButton) {
      logoutButton.addEventListener('click', (e) => {
        e.preventDefault();
        // Clear all user data
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userName');
        localStorage.removeItem('isSubscribed');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userPicture');
        showToast('You have been logged out.');
        setTimeout(() => (window.location.href = 'login.html'), 1500);
      });
    }
  }
});
