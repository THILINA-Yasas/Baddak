document.addEventListener('DOMContentLoaded', () => {
  const yearNode = document.getElementById('year');
  if (yearNode) {
    yearNode.textContent = new Date().getFullYear();
  }

  const menuBtn = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  const actions = document.querySelector('.header-actions');

  if (menuBtn && nav && actions) {
    menuBtn.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      actions.classList.toggle('is-open', isOpen);
      menuBtn.setAttribute('aria-expanded', String(isOpen));
      menuBtn.textContent = isOpen ? '×' : '☰';
    });
  }

  const showToast = (message) => {
    let toast = document.querySelector('.site-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'site-toast';
      toast.setAttribute('role', 'status');
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('visible');
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove('visible'), 2600);
  };

  let currencyCode = 'LKR';
  let usdRate = 332;
  let lastCatalogSnapshot;
  let stopProductReviewListener;
  const formatPrice = (amount) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode
  }).format(amount * usdRate);
  const refreshCurrencyLabels = () => {
    document.querySelectorAll('[data-static-price-usd]').forEach((price) => {
      price.textContent = formatPrice(Number(price.dataset.staticPriceUsd));
    });
    document.querySelectorAll('[data-price-band]').forEach((label) => {
      const [min, max] = label.dataset.priceBand.split('-').map(Number);
      label.textContent = min ? `${formatPrice(min)} - ${formatPrice(max)}` : `Under ${formatPrice(max)}`;
    });
  };
  refreshCurrencyLabels();

  let popupLastFocus;
  const closePopup = () => {
    const popup = document.querySelector('.ios-popup');
    if (!popup) return;
    popup.classList.remove('visible');
    window.setTimeout(() => popup.remove(), 180);
    popupLastFocus?.focus();
  };

  const showPopup = ({ title, message, actions = [{ label: 'OK' }] }) => {
    closePopup();
    popupLastFocus = document.activeElement;

    const popup = document.createElement('div');
    popup.className = 'ios-popup';
    popup.innerHTML = `
      <div class="ios-popup-backdrop"></div>
      <section class="ios-popup-sheet" role="dialog" aria-modal="true" aria-labelledby="iosPopupTitle" aria-describedby="iosPopupMessage">
        <span class="ios-popup-handle" aria-hidden="true"></span>
        <div class="ios-popup-copy">
          <h2 id="iosPopupTitle"></h2>
          <p id="iosPopupMessage"></p>
        </div>
        <div class="ios-popup-actions"></div>
      </section>
    `;

    popup.querySelector('#iosPopupTitle').textContent = title;
    popup.querySelector('#iosPopupMessage').textContent = message;
    const actionsNode = popup.querySelector('.ios-popup-actions');
    actions.forEach((action) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `ios-popup-action ${action.style || ''}`;
      button.textContent = action.label;
      button.addEventListener('click', () => {
        closePopup();
        action.onSelect?.();
      });
      actionsNode.appendChild(button);
    });

    popup.querySelector('.ios-popup-backdrop').addEventListener('click', closePopup);
    document.body.appendChild(popup);
    window.requestAnimationFrame(() => popup.classList.add('visible'));
    actionsNode.querySelector('button')?.focus();
  };

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closePopup();
  });

  document.querySelectorAll('[data-custom-select]').forEach((select) => {
    const trigger = select.querySelector('.custom-select-trigger');
    const valueInput = select.querySelector('input[type="hidden"]');
    const options = Array.from(select.querySelectorAll('[role="option"]'));

    const closeSelect = () => {
      select.classList.remove('open');
      trigger.setAttribute('aria-expanded', 'false');
    };

    trigger.addEventListener('click', () => {
      const isOpen = select.classList.toggle('open');
      trigger.setAttribute('aria-expanded', String(isOpen));
    });

    options.forEach((option) => {
      option.addEventListener('click', () => {
        valueInput.value = option.dataset.value;
        trigger.querySelector('span').textContent = option.textContent;
        options.forEach((item) => item.setAttribute('aria-selected', String(item === option)));
        closeSelect();
      });
    });

    document.addEventListener('click', (event) => {
      if (!select.contains(event.target)) closeSelect();
    });

    trigger.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeSelect();
    });
  });

  const slides = Array.from(document.querySelectorAll('.slide'));
  const prevBtn = document.querySelector('.slider-btn.prev');
  const nextBtn = document.querySelector('.slider-btn.next');

  let activeIndex = 0;

  const showSlide = (index) => {
    if (!slides.length) return;
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, idx) => {
      slide.classList.toggle('active', idx === activeIndex);
    });
  };

  if (prevBtn && nextBtn && slides.length) {
    prevBtn.addEventListener('click', () => showSlide(activeIndex - 1));
    nextBtn.addEventListener('click', () => showSlide(activeIndex + 1));
    setInterval(() => showSlide(activeIndex + 1), 4000);
  }

  const filterButtons = document.querySelectorAll('.filter-btn');
  const productSearch = document.getElementById('productSearch');
  const resultCount = document.getElementById('resultCount');
  const clearLink = document.querySelector('.clear-link');
  const requestedFilter = new URLSearchParams(window.location.search).get('category');
  let currentFilter = Array.from(filterButtons).some((button) => button.dataset.filter === requestedFilter)
    ? requestedFilter
    : 'all';

  filterButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.filter === currentFilter);
  });

  const applyFilters = () => {
    const query = (productSearch?.value || '').trim().toLowerCase();
    let visibleCount = 0;

    document.querySelectorAll('.product-card').forEach((card) => {
      const categoryMatches = currentFilter === 'all' || card.dataset.category === currentFilter;
      const cardText = (card.dataset.name || card.textContent || '').toLowerCase();
      const searchMatches = !query || cardText.includes(query);
      const shouldShow = categoryMatches && searchMatches;
      card.style.display = shouldShow ? '' : 'none';
      if (shouldShow) visibleCount += 1;
    });

    if (resultCount) {
      resultCount.textContent = visibleCount === 1 ? '1 product' : `${visibleCount} products`;
    }
  };

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      currentFilter = button.dataset.filter;
      filterButtons.forEach((btn) => btn.classList.toggle('active', btn === button));
      applyFilters();
    });
  });

  productSearch?.addEventListener('input', applyFilters);

  clearLink?.addEventListener('click', () => {
    currentFilter = 'all';
    productSearch.value = '';
    filterButtons.forEach((btn) => btn.classList.toggle('active', btn.dataset.filter === 'all'));
    applyFilters();
  });

  applyFilters();

  document.querySelectorAll('.qty-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const qtyNode = button.closest('.quantity-picker')?.querySelector('.qty-value');
      if (!qtyNode) return;
      let value = Number(qtyNode.textContent.trim());
      if (button.dataset.action === 'increase') value += 1;
      if (button.dataset.action === 'decrease' && value > 1) value -= 1;
      qtyNode.textContent = String(value);
    });
  });

  document.querySelector('.newsletter-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const button = event.currentTarget.querySelector('button');
    if (button) {
      button.textContent = 'Subscribed';
      button.disabled = true;
    }
  });

  const orderOnWhatsApp = (button) => {
    const card = button.closest('.product-card');
    const detail = button.closest('.detail-info');
    const name = card?.querySelector('h3')?.textContent.trim() || detail?.querySelector('h1')?.textContent.trim();
    const priceText = card?.querySelector('.price-stack strong, .product-footer strong')?.textContent || detail?.querySelector('.price-row strong')?.textContent;
    const category = card?.querySelector('.product-meta span')?.textContent.trim() || detail?.querySelector('.eyebrow')?.textContent.trim() || 'Home';
    const priceNode = card?.querySelector('.price-stack strong, .product-footer strong') || detail?.querySelector('.price-row strong');
    const price = Number(priceNode?.dataset.priceUsd ?? priceText?.replace(/[^0-9.]/g, ''));
    const quantity = Number(detail?.querySelector('.purchase-box .qty-value')?.textContent || 1);
    if (!name || !Number.isFinite(price) || !Number.isFinite(quantity) || quantity < 1) {
      showToast('Sorry, this product cannot be ordered right now.');
      return;
    }

    const message = [
      'Hi! I would like to order:',
      `Product: ${name}`,
      `Category: ${category}`,
      `Price: ${formatPrice(price)}`,
      `Quantity: ${quantity}`,
      `Total: ${formatPrice(price * quantity)}`
    ].join('\n');
    const whatsappUrl = `https://wa.me/94779958402?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  document.addEventListener('click', (event) => {
    const buyButton = event.target.closest('.buy-now-btn, .buy-now');
    if (buyButton) {
      orderOnWhatsApp(buyButton);
      return;
    }

    const wishlistButton = event.target.closest('.wishlist-btn');
    if (!wishlistButton) return;
    const isSaved = wishlistButton.classList.toggle('saved');
    wishlistButton.textContent = isSaved ? '♥' : '♡';
    wishlistButton.setAttribute('aria-pressed', String(isSaved));
    showToast(isSaved ? 'Saved to your wishlist.' : 'Removed from your wishlist.');
  });

  const categoryLabels = {
    'back-covers': 'Back Covers',
    'mobile-accessories': 'Mobile Accessories',
    'kitchen-parts': 'Kitchen Parts'
  };
  const createStoreProductCard = (product, id, compact = false) => {
    const card = document.createElement('article');
    card.className = `product-card${compact ? '' : ' product-card-shop'}`;
    card.dataset.category = product.category;
    card.dataset.name = product.name.toLowerCase();
    card.dataset.productId = id;

    const imageWrap = document.createElement('div');
    imageWrap.className = 'product-image-wrap';
    const image = document.createElement('img');
    image.src = product.image;
    image.alt = product.name;
    image.loading = 'lazy';
    imageWrap.appendChild(image);
    if (product.tag) {
      const tag = document.createElement('span');
      tag.className = `product-tag${/sale|off/i.test(product.tag) ? ' sale' : /new/i.test(product.tag) ? ' new' : ''}`;
      tag.textContent = product.tag;
      imageWrap.appendChild(tag);
    }
    if (!compact) {
      const wishlist = document.createElement('button');
      wishlist.className = 'wishlist-btn';
      wishlist.type = 'button';
      wishlist.setAttribute('aria-label', `Save ${product.name}`);
      wishlist.setAttribute('aria-pressed', 'false');
      wishlist.textContent = '♡';
      imageWrap.appendChild(wishlist);
    }

    const body = document.createElement('div');
    body.className = 'product-body';
    const meta = document.createElement('div');
    meta.className = 'product-meta';
    const category = document.createElement('span');
    category.textContent = categoryLabels[product.category] || 'Products';
    const rating = document.createElement('span');
    rating.textContent = product.reviewCount === undefined
      ? `★ ${Number(product.rating || 0).toFixed(1)}`
      : product.reviewCount
        ? `★ ${Number(product.rating || 0).toFixed(1)} · ${product.reviewCount} reviews`
        : 'No reviews';
    meta.append(category, rating);
    const heading = document.createElement('h3');
    heading.textContent = product.name;

    const footer = document.createElement('div');
    footer.className = compact ? 'product-footer' : 'product-bottom';
    const price = document.createElement('div');
    price.className = compact ? '' : 'price-stack';
    const currentPrice = document.createElement('strong');
    currentPrice.textContent = formatPrice(Number(product.price));
    currentPrice.dataset.priceUsd = String(product.price);
    price.appendChild(currentPrice);
    if (product.oldPrice !== null && product.oldPrice !== undefined && Number(product.oldPrice) > Number(product.price)) {
      const oldPrice = document.createElement('span');
      oldPrice.textContent = formatPrice(Number(product.oldPrice));
      price.appendChild(oldPrice);
    }
    footer.appendChild(price);

    if (compact) {
      const viewLink = document.createElement('a');
      viewLink.className = 'small-btn';
      viewLink.href = `product-detail.html?id=${encodeURIComponent(id)}`;
      viewLink.textContent = 'View';
      footer.appendChild(viewLink);
    } else {
      const buyButton = document.createElement('button');
      buyButton.className = 'buy-now-btn';
      buyButton.type = 'button';
      buyButton.textContent = 'Buy now';
      footer.appendChild(buyButton);
    }

    body.append(meta, heading, footer);
    card.append(imageWrap, body);
    return card;
  };

  const renderLiveProducts = (snapshot) => {
    if (snapshot.metadata?.fromCache) return;
    lastCatalogSnapshot = snapshot;
    const products = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((product) => product.active === true)
      .sort((a, b) => a.name.localeCompare(b.name));
    const shopGrid = document.querySelector('.product-grid-shop');
    const homeGrid = document.querySelector('.featured-products .product-grid');

    if (shopGrid) {
      const cards = products.map((product) => createStoreProductCard(product, product.id));
      if (!cards.length) {
        const emptyState = document.createElement('p');
        emptyState.className = 'catalog-empty';
        emptyState.textContent = 'No products are available right now.';
        cards.push(emptyState);
      }
      shopGrid.replaceChildren(...cards);
      applyFilters();
    }
    if (homeGrid) {
      const featured = products.filter((product) => product.featured).slice(0, 4);
      const homeProducts = featured.length ? featured : products.slice(0, 4);
      homeGrid.replaceChildren(...homeProducts.map((product) => createStoreProductCard(product, product.id, true)));
    }

    const detailId = new URLSearchParams(window.location.search).get('id');
    const relatedGrid = document.querySelector('.related-products .product-grid');
    if (detailId && relatedGrid) {
      relatedGrid.replaceChildren(...products
        .filter((product) => product.id !== detailId)
        .slice(0, 3)
        .map((product) => createStoreProductCard(product, product.id, true)));
    }
    if (detailId) {
      stopProductReviewListener?.();
      stopProductReviewListener = null;
      const product = products.find((entry) => entry.id === detailId);
      if (!product) {
        const heading = document.querySelector('.detail-info h1');
        const description = document.querySelector('.detail-info .description');
        const buyButton = document.querySelector('.detail-info .buy-now');
        if (heading) heading.textContent = 'Product unavailable';
        if (description) description.textContent = 'This product is no longer available.';
        if (buyButton) buyButton.disabled = true;
        return;
      }
      document.title = `${product.name} | Baddak Store`;
      const image = document.querySelector('.main-product-image img');
      const heading = document.querySelector('.detail-info h1');
      const category = document.querySelector('.detail-info .eyebrow');
      const description = document.querySelector('.detail-info .description');
      const price = document.querySelector('.detail-info .price-row strong');
      const oldPrice = document.querySelector('.detail-info .old-price');
      const reviewHeading = document.getElementById('productReviewsHeading');
      if (image) {
        image.src = product.image;
        image.alt = product.name;
      }
      const gallery = document.querySelector('.gallery-miniatures');
      if (gallery) {
        const imageUrls = [product.image, product.image2, product.image3].filter(Boolean);
        gallery.replaceChildren(...imageUrls.map((url, index) => {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = `gallery-thumbnail${index === 0 ? ' is-active' : ''}`;
          button.setAttribute('aria-label', `Show product image ${index + 1}`);
          const thumbnail = document.createElement('img');
          thumbnail.src = url;
          thumbnail.alt = `${product.name} image ${index + 1}`;
          button.appendChild(thumbnail);
          button.addEventListener('click', () => {
            image.src = url;
            image.alt = thumbnail.alt;
            gallery.querySelectorAll('.gallery-thumbnail').forEach((item) => item.classList.toggle('is-active', item === button));
          });
          return button;
        }));
      }
      if (heading) heading.textContent = product.name;
      if (reviewHeading) reviewHeading.textContent = `${product.name} reviews`;
      if (category) category.textContent = categoryLabels[product.category] || 'Products';
      if (description) description.textContent = product.description || '';
      if (price) {
        price.textContent = formatPrice(Number(product.price));
        price.dataset.priceUsd = String(product.price);
      }
      if (oldPrice) {
        oldPrice.textContent = product.oldPrice > product.price ? formatPrice(Number(product.oldPrice)) : '';
        oldPrice.hidden = !(product.oldPrice > product.price);
      }
      const reviewList = document.getElementById('productReviewList');
      if (reviewList) {
        stopProductReviewListener = window.storeDb.collection('products').doc(detailId).collection('reviews')
          .where('active', '==', true).onSnapshot((reviewSnapshot) => {
            if (reviewSnapshot.metadata?.fromCache) return;
            const reviews = reviewSnapshot.docs.map((doc) => doc.data());
            const average = reviews.length
              ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length
              : 0;
            const summary = document.getElementById('productReviewSummary');
            const stars = document.getElementById('productRatingStars');
            if (summary) summary.textContent = reviews.length ? `${average.toFixed(1)} (${reviews.length} reviews)` : 'No reviews yet';
            if (stars) stars.textContent = reviews.length ? `${'★'.repeat(Math.round(average))}${'☆'.repeat(5 - Math.round(average))}` : '☆☆☆☆☆';
            reviewList.replaceChildren();
            if (!reviews.length) {
              const empty = document.createElement('p');
              empty.className = 'catalog-empty';
              empty.textContent = 'No reviews yet.';
              reviewList.appendChild(empty);
              return;
            }
            reviews.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
            reviews.forEach((review) => {
              const item = document.createElement('article');
              item.className = 'review-item';
              const head = document.createElement('div');
              head.className = 'review-head';
              const name = document.createElement('strong');
              name.textContent = review.name;
              const rating = document.createElement('span');
              rating.textContent = `${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}`;
              head.append(name, rating);
              const text = document.createElement('p');
              text.textContent = review.text;
              item.append(head, text);
              reviewList.appendChild(item);
            });
          }, (error) => {
            console.error('Could not load product reviews:', error);
            showToast('Could not load reviews right now.');
          });
      }
    }
  };

  if (window.storeDb) {
    window.storeDb.collection('products').where('active', '==', true).onSnapshot(
      renderLiveProducts,
      (error) => {
        console.error('Could not load live products from Firebase:', error);
        showToast('Could not connect to the live catalog. Showing sample products.');
      }
    );
    window.storeDb.collection('settings').doc('store').onSnapshot(
      (snapshot) => {
        if (snapshot.metadata?.fromCache || !snapshot.exists) return;
        const settings = snapshot.data();
        currencyCode = settings.currency;
        usdRate = settings.usdRate;
        refreshCurrencyLabels();
        if (lastCatalogSnapshot) renderLiveProducts(lastCatalogSnapshot);
      },
      (error) => {
        console.error('Could not load store currency settings:', error);
        showToast('Could not load the store currency settings.');
      }
    );
  }

  document.querySelector('.contact-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const button = event.currentTarget.querySelector('button[type="submit"]');
    if (button) {
      button.textContent = 'Message sent';
      button.disabled = true;
    }
    showToast('Thanks — we’ll get back to you shortly.');
  });

  const orders = [
    {
      id: '#1024',
      title: 'Clear Guard Phone Case',
      total: '$48',
      status: 'Delivered',
      stage: 5,
      eta: 'Delivered on Apr 18',
      updates: [
        'Order placed on Apr 10',
        'Packed and ready for dispatch',
        'Shipped via courier on Apr 14',
        'Out for delivery on Apr 17',
        'Delivered to your address on Apr 18'
      ]
    },
    {
      id: '#1011',
      title: 'Fast USB-C Charger',
      total: '$38',
      status: 'Shipped',
      stage: 3,
      eta: 'Arrives by Apr 22',
      updates: [
        'Order placed on Apr 08',
        'Packed and ready for dispatch',
        'Shipped via courier on Apr 12',
        'In transit to your city',
        'Estimated delivery Apr 22'
      ]
    },
    {
      id: '#999',
      title: 'Silicone Spatula Set',
      total: '$18',
      status: 'Processing',
      stage: 2,
      eta: 'Preparing to ship',
      updates: [
        'Order placed on Apr 01',
        'Confirmed and under preparation',
        'Materials checked and packed',
        'Awaiting dispatch',
        'Expected shipping soon'
      ]
    }
  ];

  const prepareStatus = (status) => {
    if (status === 'Delivered') return 'delivered';
    if (status === 'Shipped') return 'shipped';
    if (status === 'Processing') return 'processing';
    return 'processing';
  };

  const renderRecentOrders = () => {
    const recentOrdersList = document.getElementById('recentOrdersList');
    if (!recentOrdersList) return;

    recentOrdersList.innerHTML = orders
      .slice(0, 3)
      .map((order) => `
        <div class="order-row">
          <span>${order.id}</span>
          <span>${order.title}</span>
          <span class="order-status ${prepareStatus(order.status)}">${order.status}</span>
        </div>
      `)
      .join('');
  };

  const renderOrders = () => {
    const ordersList = document.getElementById('ordersList');
    if (!ordersList) return;

    ordersList.innerHTML = orders
      .map((order) => `
        <div class="order-card">
          <div class="order-card-head">
            <div>
              <span class="order-id">${order.id}</span>
              <h4>${order.title}</h4>
            </div>
            <span class="order-status ${prepareStatus(order.status)}">${order.status}</span>
          </div>

          <div class="order-meta">
            <span>${order.eta}</span>
            <span>${order.total}</span>
          </div>

          <button type="button" class="btn btn-secondary track-button" data-order-id="${order.id}">Track order</button>
        </div>
      `)
      .join('');

    ordersList.querySelectorAll('.track-button').forEach((button) => {
      button.addEventListener('click', () => {
        const selectedOrder = orders.find((order) => order.id === button.dataset.orderId);
        if (selectedOrder) showTracking(selectedOrder);
      });
    });
  };

  const renderTrackingSteps = (stage) => {
    const trackingSteps = document.getElementById('trackingSteps');
    if (!trackingSteps) return;

    const steps = ['Ordered', 'Packed', 'Shipped', 'Out for delivery', 'Delivered'];
    trackingSteps.innerHTML = steps
      .map((step, index) => {
        const isDone = index <= stage - 1;
        return `
          <div class="tracking-step ${isDone ? 'complete' : ''}">
            <span class="step-dot"></span>
            <span>${step}</span>
          </div>
        `;
      })
      .join('');
  };

  const showTracking = (order) => {
    const trackingTitle = document.getElementById('trackingTitle');
    const trackingStatus = document.getElementById('trackingStatus');
    const trackingUpdates = document.getElementById('trackingUpdates');

    if (!trackingTitle || !trackingStatus || !trackingUpdates) return;

    trackingTitle.textContent = `${order.id} · ${order.title}`;
    trackingStatus.textContent = order.status;
    trackingStatus.className = `order-status ${prepareStatus(order.status)}`;
    renderTrackingSteps(order.stage);

    trackingUpdates.innerHTML = order.updates
      .map((update, index) => `
        <div class="update-item ${index === order.updates.length - 1 ? 'latest' : ''}">
          <span class="update-dot"></span>
          <span>${update}</span>
        </div>
      `)
      .join('');

    document.getElementById('orders-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const trackOrderForm = document.getElementById('trackOrderForm');
  if (trackOrderForm) {
    trackOrderForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const trackingInput = document.getElementById('trackingInput');
      const value = trackingInput?.value.trim().toLowerCase();

      if (!value) {
        showPopup({
          title: 'Order number needed',
          message: 'Enter your order number, such as #1024, to see delivery updates.'
        });
        return;
      }

      const foundOrder = orders.find((order) => order.id.toLowerCase() === value || order.title.toLowerCase().includes(value.replace('#', '')));

      if (foundOrder) {
        showTracking(foundOrder);
      } else {
        showPopup({
          title: 'Order not found',
          message: 'Check the order number and try again. You can use #1024 to preview tracking.'
        });
      }
    });
  }

  document.querySelector('[data-popup="profile"]')?.addEventListener('click', () => {
    showPopup({
      title: 'Manage profile',
      message: 'Choose what you would like to update.',
      actions: [
        { label: 'Edit personal details', onSelect: () => showToast('Profile editing will be available soon.') },
        { label: 'Cancel', style: 'cancel' }
      ]
    });
  });

  document.querySelector('[data-popup="settings"]')?.addEventListener('click', () => {
    showPopup({
      title: 'Account settings',
      message: 'Manage your communication preferences or account security.',
      actions: [
        { label: 'Notification preferences', onSelect: () => showToast('Notification preferences will be available soon.') },
        { label: 'Cancel', style: 'cancel' }
      ]
    });
  });

  const navLinks = document.querySelectorAll('.account-nav a[data-tab]');
  const accountSections = document.querySelectorAll('.account-section');

  const showTab = (tabName) => {
    navLinks.forEach((link) => {
      const isActive = link.dataset.tab === tabName;
      link.classList.toggle('active', isActive);
    });

    accountSections.forEach((section) => {
      const isVisible = section.id === `${tabName}-panel`;
      section.classList.toggle('active', isVisible);
    });
  };

  navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      showTab(link.dataset.tab);
    });
  });

  document.querySelectorAll('[data-tab="orders"]').forEach((element) => {
    element.addEventListener('click', (event) => {
      event.preventDefault();
      showTab('orders');
    });
  });

  renderRecentOrders();
  renderOrders();
  showTracking(orders[0]);
});
