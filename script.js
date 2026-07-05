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

  document.querySelectorAll('[data-action="wishlist"], [data-action="cart"]').forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.getAttribute('data-action') === 'wishlist' ? 'Added to wishlist' : 'Added to cart';
      showToast(action);
    });
  });

  setTimeout(() => loadingScreen?.classList.add('hidden'), 900);
  setTimeout(() => loadingScreen?.remove(), 1300);

  // --- AUTHENTICATION SIMULATION ---

  // The login logic is now handled by the GSI library in login.html

  // 1. Protect authenticated pages
  if (pathname.includes('shop.html') || pathname.includes('account.html')) {
    const isLoggedIn = localStorage.getItem('isLoggedIn');

    // If not logged in, redirect to the login page
    if (isLoggedIn !== 'true') {
      console.log('User not authenticated. Redirecting to login.');
      window.location.href = 'login.html';
      return;
    }
  }

  // 2. Populate account page and handle logout
  if (pathname.includes('account.html')) {
    // Populate user details
    document.getElementById('user-name').textContent = localStorage.getItem('userName') || 'User';
    document.getElementById('user-email').textContent = localStorage.getItem('userEmail') || 'No email found';
    document.getElementById('user-picture').src = localStorage.getItem('userPicture') || '';

    // Handle logout
    const logoutButton = document.querySelector('#logout-btn');
    if (logoutButton) {
      logoutButton.addEventListener('click', (e) => {
        e.preventDefault();
        // Clear all user data
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userPicture');
        showToast('You have been logged out.');
        setTimeout(() => (window.location.href = 'login.html'), 1500);
      });
    }
  }
});
