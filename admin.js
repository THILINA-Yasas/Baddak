document.addEventListener('DOMContentLoaded', () => {
  const allowedAdmin = 'thilinayasasr@gmail.com';
  const status = document.getElementById('adminStatus');
  const loginPanel = document.getElementById('loginPanel');
  const workspace = document.getElementById('adminWorkspace');
  const signInButton = document.getElementById('signInButton');
  const signOutButton = document.getElementById('signOutButton');
  const drawer = document.getElementById('adminDrawer');
  const drawerBackdrop = document.getElementById('drawerBackdrop');
  const drawerToggle = document.getElementById('drawerToggle');
  const drawerUserEmail = document.getElementById('drawerUserEmail');
  const overviewView = document.getElementById('overviewView');
  const productsView = document.getElementById('productsView');
  const reviewsView = document.getElementById('reviewsView');
  const productDialog = document.getElementById('productDialog');
  const addProductButton = document.getElementById('addProductButton');
  const closeProductForm = document.getElementById('closeProductForm');
  const productSearch = document.getElementById('adminProductSearch');
  const totalProductStat = document.getElementById('totalProductStat');
  const visibleProductStat = document.getElementById('visibleProductStat');
  const featuredProductStat = document.getElementById('featuredProductStat');
  const storeStatusTitle = document.getElementById('storeStatusTitle');
  const storeStatusDetail = document.getElementById('storeStatusDetail');
  const recentProductList = document.getElementById('recentProductList');
  const form = document.getElementById('productForm');
  const list = document.getElementById('adminProductList');
  const count = document.getElementById('productCount');
  const seedButton = document.getElementById('seedButton');
  const cancelEditButton = document.getElementById('cancelEditButton');
  const saveButton = document.getElementById('saveProductButton');
  const fields = {
    id: document.getElementById('productId'),
    name: document.getElementById('productName'),
    category: document.getElementById('productCategory'),
    price: document.getElementById('productPrice'),
    oldPrice: document.getElementById('productOldPrice'),
    image: document.getElementById('productImage'),
    image2: document.getElementById('productImage2'),
    image3: document.getElementById('productImage3'),
    tag: document.getElementById('productTag'),
    description: document.getElementById('productDescription'),
    featured: document.getElementById('productFeatured'),
    active: document.getElementById('productActive')
  };
  const timestamp = firebase.firestore.FieldValue.serverTimestamp;
  let currentRating = 5;
  let stopProductListener;
  let stopSettingsListener;
  let stopReviewListener;
  let latestProducts = [];
  let currencyCode = 'LKR';
  let usdRate = 332;
  const currencySettingsForm = document.getElementById('currencySettingsForm');
  const currencyCodeField = document.getElementById('currencyCode');
  const currencyRateField = document.getElementById('currencyRate');
  const reviewProduct = document.getElementById('reviewProduct');
  const reviewList = document.getElementById('adminReviewList');
  currencyCodeField.value = currencyCode;
  currencyRateField.value = String(usdRate);
  const sampleProducts = [
    { id: 'clear-guard-phone-case', name: 'Clear Guard Phone Case', category: 'back-covers', price: 24, oldPrice: 30, image: 'https://images.unsplash.com/photo-1535157412991-2ef801c1748b?auto=format&fit=crop&w=900&q=80', tag: 'Best seller', description: 'A lightweight clear case with reinforced corners and a raised camera edge.', rating: 4.9, featured: true },
    { id: 'matte-impact-case', name: 'Matte Impact Case', category: 'back-covers', price: 29, oldPrice: 35, image: 'https://images.unsplash.com/photo-1604671748253-e683240e7efa?auto=format&fit=crop&w=900&q=80', tag: 'Sale', description: 'A protective matte-finish phone case for everyday use.', rating: 4.8, featured: false },
    { id: 'fast-usb-c-charger', name: 'Fast USB-C Charger', category: 'mobile-accessories', price: 19, oldPrice: 25, image: 'https://images.unsplash.com/photo-1677145503731-87bfe49e5c67?auto=format&fit=crop&w=900&q=80', tag: 'New', description: 'A compact USB-C charger for dependable everyday charging.', rating: 4.7, featured: true },
    { id: 'wireless-headphones', name: 'Wireless Headphones', category: 'mobile-accessories', price: 49, oldPrice: 59, image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=900&q=80', tag: 'Hot', description: 'Comfortable wireless headphones for work and travel.', rating: 4.9, featured: false },
    { id: 'foldable-phone-stand', name: 'Foldable Phone Stand', category: 'mobile-accessories', price: 16, oldPrice: 20, image: 'https://images.unsplash.com/photo-1515940175183-6798529cb860?auto=format&fit=crop&w=900&q=80', tag: 'Popular', description: 'A foldable stand for hands-free viewing at home or on the go.', rating: 4.8, featured: false },
    { id: 'braided-charging-cable-duo', name: 'Braided Charging Cable Duo', category: 'mobile-accessories', price: 12, oldPrice: 16, image: 'https://images.unsplash.com/photo-1677145503731-87bfe49e5c67?auto=format&fit=crop&w=900&q=80', tag: 'Sale', description: 'A durable pair of braided charging cables.', rating: 4.6, featured: false },
    { id: 'silicone-spatula-set', name: 'Silicone Spatula Set', category: 'kitchen-parts', price: 18, oldPrice: 24, image: 'https://images.unsplash.com/photo-1665768976778-22ab017f915a?auto=format&fit=crop&w=900&q=80', tag: 'New', description: 'A practical set of silicone kitchen spatulas.', rating: 4.9, featured: true },
    { id: 'compact-vegetable-chopper', name: 'Compact Vegetable Chopper', category: 'kitchen-parts', price: 28, oldPrice: 36, image: 'https://images.unsplash.com/photo-1589983006655-4ef9a756ebe3?auto=format&fit=crop&w=900&q=80', tag: 'Popular', description: 'A compact chopper for quick everyday food preparation.', rating: 4.8, featured: false }
  ];

  const setStatus = (message, isError = false) => {
    status.textContent = message;
    status.classList.toggle('is-error', isError);
    if (storeStatusTitle) {
      storeStatusTitle.textContent = isError ? 'Action needed' : 'Store connected';
      storeStatusDetail.textContent = message;
    }
  };

  const describeAuthError = (error) => {
    if (error.code === 'auth/configuration-not-found' || error.code === 'auth/operation-not-allowed') {
      return 'Google sign-in is not enabled for this Firebase project yet. Enable Google under Firebase Console → Authentication → Sign-in method, then try again.';
    }
    if (error.code === 'auth/unauthorized-domain') {
      return 'This site is not an authorized Firebase sign-in domain yet. Add baddak-store-2026.web.app under Firebase Console → Authentication → Settings → Authorized domains.';
    }
    return `Sign-in failed: ${error.message}`;
  };

  const makeElement = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };

  const formatAdminPrice = (amount) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode
  }).format(Number(amount) * usdRate);

  const resetForm = () => {
    form.reset();
    fields.id.value = '';
    currentRating = 5;
    fields.active.checked = true;
    document.getElementById('formTitle').textContent = 'Add product';
    saveButton.textContent = 'Save product';
    cancelEditButton.hidden = true;
    if (productDialog.open) productDialog.close();
  };

  const editProduct = (id, product) => {
    fields.id.value = id;
    currentRating = Number(product.rating || 0);
    fields.name.value = product.name || '';
    fields.category.value = product.category || 'back-covers';
    fields.price.value = product.price ?? '';
    fields.oldPrice.value = product.oldPrice ?? '';
    fields.image.value = product.image || '';
    fields.image2.value = product.image2 || '';
    fields.image3.value = product.image3 || '';
    fields.tag.value = product.tag || '';
    fields.description.value = product.description || '';
    fields.featured.checked = product.featured === true;
    fields.active.checked = product.active !== false;
    document.getElementById('formTitle').textContent = 'Edit product';
    saveButton.textContent = 'Update product';
    cancelEditButton.hidden = false;
    productDialog.showModal();
    fields.name.focus();
  };

  const showView = (viewName) => {
    overviewView.hidden = viewName !== 'overview';
    productsView.hidden = viewName !== 'products';
    reviewsView.hidden = viewName !== 'reviews';
    document.querySelectorAll('[data-admin-view]').forEach((button) => {
      const active = button.dataset.adminView === viewName;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-current', active ? 'page' : 'false');
    });
    closeDrawer();
  };

  const openDrawer = () => {
    drawer.classList.add('is-open');
    drawerBackdrop.hidden = false;
    drawerToggle.setAttribute('aria-expanded', 'true');
    drawer.setAttribute('aria-hidden', 'false');
  };

  const closeDrawer = () => {
    drawer.classList.remove('is-open');
    drawerBackdrop.hidden = true;
    drawerToggle.setAttribute('aria-expanded', 'false');
    drawer.setAttribute('aria-hidden', 'true');
  };

  const renderProducts = (snapshot) => {
    const products = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => a.name.localeCompare(b.name));
    latestProducts = products;
    const selectedReviewProduct = reviewProduct.value;
    reviewProduct.replaceChildren(new Option('Select a product', ''));
    products.forEach((product) => reviewProduct.add(new Option(product.name, product.id)));
    if (products.some((product) => product.id === selectedReviewProduct)) {
      reviewProduct.value = selectedReviewProduct;
    }
    count.textContent = `${products.length} ${products.length === 1 ? 'product' : 'products'}`;
    totalProductStat.textContent = String(products.length);
    visibleProductStat.textContent = String(products.filter((product) => product.active).length);
    featuredProductStat.textContent = String(products.filter((product) => product.featured).length);
    seedButton.hidden = products.length > 0;
    list.replaceChildren();

    if (!products.length) {
      list.appendChild(makeElement('p', 'admin-empty card-panel', 'No products yet. Add one or import the current sample products.'));
      recentProductList.replaceChildren(makeElement('p', 'admin-empty', 'No products yet. Add a product to get started.'));
      return;
    }

    products.forEach((product) => {
      const card = makeElement('article', 'admin-product-card card-panel');
      card.dataset.searchText = `${product.name} ${product.category}`.toLowerCase();
      const image = document.createElement('img');
      image.src = product.image;
      image.alt = '';
      image.loading = 'lazy';
      const info = makeElement('div', 'admin-product-info');
      const titleRow = makeElement('div', 'admin-product-title');
      titleRow.append(
        makeElement('h3', '', product.name),
        makeElement('span', `admin-product-state${product.active ? '' : ' is-hidden'}`, product.active ? 'Visible' : 'Hidden')
      );
      const detail = makeElement('p', 'admin-product-category', product.category.replaceAll('-', ' '));
      info.append(titleRow, detail);
      const prices = makeElement('div', 'admin-product-price');
      prices.append(
        makeElement('strong', '', formatAdminPrice(product.price)),
        makeElement('span', '', product.featured ? 'Featured' : 'Standard')
      );
      const actions = makeElement('div', 'admin-product-actions');
      const edit = makeElement('button', 'btn btn-secondary', 'Edit');
      edit.type = 'button';
      edit.addEventListener('click', () => editProduct(product.id, product));
      const remove = makeElement('button', 'btn btn-secondary admin-delete', 'Delete');
      remove.type = 'button';
      remove.addEventListener('click', async () => {
        const confirmation = makeElement('div', 'admin-delete-confirmation');
        confirmation.setAttribute('role', 'group');
        confirmation.setAttribute('aria-label', `Confirm deleting ${product.name}`);
        const prompt = makeElement('span', '', `Delete ${product.name}?`);
        const confirm = makeElement('button', 'btn btn-secondary admin-delete', 'Confirm delete');
        confirm.type = 'button';
        const cancel = makeElement('button', 'btn btn-secondary', 'Cancel');
        cancel.type = 'button';
        confirmation.append(prompt, confirm, cancel);
        remove.hidden = true;
        actions.appendChild(confirmation);
        confirm.focus();

        const closeConfirmation = () => {
          confirmation.remove();
          remove.hidden = false;
          remove.focus();
        };
        cancel.addEventListener('click', closeConfirmation);
        confirm.addEventListener('click', async () => {
          confirm.disabled = true;
          cancel.disabled = true;
          confirm.textContent = 'Deleting…';
          let productDeleted = false;
          try {
            const productRef = window.storeDb.collection('products').doc(product.id);
            await productRef.delete();
            productDeleted = true;
            setStatus(`Deleted ${product.name}.`);

            const reviews = productRef.collection('reviews');
            let reviewPage;
            do {
              reviewPage = await reviews.limit(400).get();
              if (!reviewPage.empty) {
                const batch = window.storeDb.batch();
                reviewPage.docs.forEach((review) => batch.delete(review.ref));
                await batch.commit();
              }
            } while (!reviewPage.empty);
          } catch (error) {
            if (productDeleted) {
              setStatus(`Product deleted, but its reviews could not be fully removed: ${error.message}`, true);
            } else {
              setStatus(`Product deletion did not complete: ${error.message}`, true);
            }
          } finally {
            closeConfirmation();
          }
        });
      });
      actions.append(edit, remove);
      card.append(image, info, prices, actions);
      list.appendChild(card);
    });
    recentProductList.replaceChildren();
    products.slice(0, 4).forEach((product) => {
      const item = makeElement('div', 'admin-recent-item');
      const image = document.createElement('img');
      image.src = product.image;
      image.alt = '';
      image.loading = 'lazy';
      const name = makeElement('strong', '', product.name);
      const detail = makeElement('span', '', `${product.category.replaceAll('-', ' ')} · ${product.active ? 'Visible' : 'Hidden'}`);
      item.append(image, name, detail);
      recentProductList.appendChild(item);
    });
    filterProducts();
  };

  const filterProducts = () => {
    const query = productSearch.value.trim().toLowerCase();
    let visible = 0;
    list.querySelectorAll('.admin-product-card').forEach((card) => {
      const matches = card.dataset.searchText.includes(query);
      card.hidden = !matches;
      if (matches) visible += 1;
    });
    if (query && visible === 0) {
      if (!list.querySelector('.admin-search-empty')) {
        list.appendChild(makeElement('p', 'admin-empty admin-search-empty card-panel', 'No products match your search.'));
      }
    } else {
      list.querySelector('.admin-search-empty')?.remove();
    }
  };

  const startProductListener = () => window.storeDb.collection('products').onSnapshot(
    (snapshot) => {
      if (!snapshot.metadata.fromCache) {
        renderProducts(snapshot);
        storeStatusTitle.textContent = 'Store connected';
        storeStatusDetail.textContent = 'Your live catalog is connected and ready to manage.';
      }
    },
    (error) => setStatus(`Could not load products: ${error.message}`, true)
  );

  const startSettingsListener = () => window.storeDb.collection('settings').doc('store').onSnapshot(
    (snapshot) => {
      if (snapshot.metadata.fromCache) return;
      const settings = snapshot.data();
      if (!settings) {
        window.storeDb.collection('settings').doc('store').set({
          currency: currencyCode,
          usdRate,
          updatedAt: timestamp()
        }).catch((error) => setStatus(`Could not initialize currency settings: ${error.message}`, true));
        return;
      }
      currencyCode = settings.currency;
      usdRate = settings.usdRate;
      currencyCodeField.value = currencyCode;
      currencyRateField.value = String(usdRate);
      renderProducts({ docs: latestProducts.map((product) => ({ id: product.id, data: () => product })) });
    },
    (error) => setStatus(`Could not load store currency: ${error.message}`, true)
  );

  const updateProductReviewSummary = async (productId, reviews) => {
    const product = latestProducts.find((entry) => entry.id === productId);
    if (!product) return;
    if (!reviews.length && product.reviewCount === undefined) return;
    const average = reviews.length
      ? Math.round((reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length) * 10) / 10
      : 0;
    if (product.rating === average && (product.reviewCount || 0) === reviews.length) return;
    try {
      await window.storeDb.collection('products').doc(productId).update({
        rating: average,
        reviewCount: reviews.length,
        updatedAt: timestamp()
      });
    } catch (error) {
      setStatus(`Could not update product review rating: ${error.message}`, true);
    }
  };

  const renderReviews = (productId, snapshot) => {
    const reviews = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    updateProductReviewSummary(productId, reviews);
    reviewList.replaceChildren();
    if (!reviews.length) {
      reviewList.appendChild(makeElement('p', 'admin-empty', 'No reviews for this product yet.'));
      return;
    }
    reviews.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
    reviews.forEach((review) => {
      const card = makeElement('article', 'admin-review-card');
      const heading = makeElement('div', 'admin-review-card-heading');
      heading.append(
        makeElement('strong', '', review.name),
        makeElement('span', 'admin-review-stars', `${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}`)
      );
      const remove = makeElement('button', 'btn btn-secondary admin-delete', 'Delete');
      remove.type = 'button';
      remove.addEventListener('click', async () => {
        try {
          await window.storeDb.collection('products').doc(productId)
            .collection('reviews').doc(review.id).delete();
          setStatus('Review deleted.');
        } catch (error) {
          setStatus(`Could not delete review: ${error.message}`, true);
        }
      });
      card.append(heading, makeElement('p', '', review.text), remove);
      reviewList.appendChild(card);
    });
  };

  const watchReviews = (productId) => {
    stopReviewListener?.();
    if (!productId) {
      reviewList.replaceChildren(makeElement('p', 'admin-empty', 'Select a product to manage its reviews.'));
      return;
    }
    stopReviewListener = window.storeDb.collection('products').doc(productId)
      .collection('reviews').onSnapshot(
        (snapshot) => renderReviews(productId, snapshot),
        (error) => setStatus(`Could not load product reviews: ${error.message}`, true)
      );
  };

  drawerToggle.addEventListener('click', openDrawer);
  document.getElementById('drawerClose').addEventListener('click', closeDrawer);
  drawerBackdrop.addEventListener('click', closeDrawer);
  document.querySelectorAll('[data-admin-view]').forEach((button) => {
    button.addEventListener('click', () => showView(button.dataset.adminView));
  });
  document.querySelectorAll('[data-open-admin-view]').forEach((button) => {
    button.addEventListener('click', () => showView(button.dataset.openAdminView));
  });
  addProductButton.addEventListener('click', () => {
    resetForm();
    productDialog.showModal();
    fields.name.focus();
  });
  closeProductForm.addEventListener('click', resetForm);
  reviewProduct.addEventListener('change', () => watchReviews(reviewProduct.value));
  productDialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    resetForm();
  });
  productDialog.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      resetForm();
    }
  });
  productDialog.addEventListener('click', (event) => {
    if (event.target === productDialog) resetForm();
  });
  productSearch.addEventListener('input', filterProducts);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeDrawer();
  });

  signInButton.addEventListener('click', async () => {
    signInButton.disabled = true;
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      await window.storeAuth.signInWithPopup(provider);
    } catch (error) {
      if (error.code === 'auth/popup-blocked') {
        await window.storeAuth.signInWithRedirect(new firebase.auth.GoogleAuthProvider());
        return;
      }
      setStatus(describeAuthError(error), true);
    } finally {
      signInButton.disabled = false;
    }
  });

  signOutButton.addEventListener('click', async () => {
    try {
      await window.storeAuth.signOut();
      closeDrawer();
      showView('overview');
    } catch (error) {
      setStatus(`Could not sign out: ${error.message}`, true);
    }
  });

  if (!window.storeAuth) {
    loginPanel.hidden = false;
    workspace.hidden = true;
    setStatus('Firebase Authentication is unavailable. Check the Firebase configuration.', true);
    return;
  }

  window.storeAuth.onAuthStateChanged((user) => {
    if (!user) {
      stopProductListener?.();
      stopProductListener = null;
      stopSettingsListener?.();
      stopSettingsListener = null;
      stopReviewListener?.();
      stopReviewListener = null;
      loginPanel.hidden = false;
      workspace.hidden = true;
      signOutButton.hidden = true;
      drawerToggle.hidden = true;
      closeDrawer();
      setStatus('Sign in with the authorized Google account.');
      return;
    }
    if (user.email?.toLowerCase() !== allowedAdmin) {
      stopProductListener?.();
      stopProductListener = null;
      setStatus(`Access denied for ${user.email || 'this account'}. Sign in with ${allowedAdmin}.`, true);
      window.storeAuth.signOut();
      return;
    }
    loginPanel.hidden = true;
    workspace.hidden = false;
    signOutButton.hidden = false;
    drawerToggle.hidden = false;
    drawerUserEmail.textContent = user.email || allowedAdmin;
    showView('overview');
    setStatus(`Signed in as ${user.email}.`);
    stopProductListener?.();
    stopProductListener = startProductListener();
    stopSettingsListener?.();
    stopSettingsListener = startSettingsListener();
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    saveButton.disabled = true;
    const id = fields.id.value;
    const product = {
      name: fields.name.value.trim(),
      category: fields.category.value,
      price: Number(fields.price.value),
      oldPrice: fields.oldPrice.value === '' ? null : Number(fields.oldPrice.value),
      image: fields.image.value.trim(),
      image2: fields.image2.value.trim(),
      image3: fields.image3.value.trim(),
      tag: fields.tag.value.trim(),
      description: fields.description.value.trim(),
      active: fields.active.checked,
      featured: fields.featured.checked,
      rating: currentRating,
      updatedAt: timestamp()
    };
    if (!product.name || !Number.isFinite(product.price) || product.price < 0 ||
      (product.oldPrice !== null && (!Number.isFinite(product.oldPrice) || product.oldPrice < 0)) ||
      !product.image.startsWith('https://') ||
      [product.image2, product.image3].some((image) => image && !image.startsWith('https://'))) {
      setStatus('Enter a product name, valid non-negative prices, and HTTPS URLs for all provided images.', true);
      saveButton.disabled = false;
      return;
    }

    try {
      const ref = id ? window.storeDb.collection('products').doc(id) : window.storeDb.collection('products').doc();
      const existing = id ? await ref.get() : null;
      product.createdAt = existing?.exists ? existing.data().createdAt : timestamp();
      product.reviewCount = existing?.exists ? Number(existing.data().reviewCount || 0) : 0;
      await ref.set(product);
      setStatus(id ? 'Product updated.' : 'Product added.');
      resetForm();
    } catch (error) {
      setStatus(`Could not save product: ${error.message}`, true);
    } finally {
      saveButton.disabled = false;
    }
  });

  cancelEditButton.addEventListener('click', resetForm);

  currencySettingsForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const code = currencyCodeField.value.trim().toUpperCase();
    const rate = Number(currencyRateField.value);
    try {
      new Intl.NumberFormat('en-US', { style: 'currency', currency: code });
    } catch {
      setStatus('Enter a valid three-letter ISO currency code.', true);
      return;
    }
    if (!Number.isFinite(rate) || rate <= 0) {
      setStatus('Enter an exchange rate greater than zero.', true);
      return;
    }
    const saveCurrencyButton = document.getElementById('saveCurrencyButton');
    saveCurrencyButton.disabled = true;
    try {
      await window.storeDb.collection('settings').doc('store').set({
        currency: code,
        usdRate: rate,
        updatedAt: timestamp()
      });
      currencyCode = code;
      usdRate = rate;
      setStatus(`Prices will now display in ${code}.`);
    } catch (error) {
      setStatus(`Could not save currency settings: ${error.message}`, true);
    } finally {
      saveCurrencyButton.disabled = false;
    }
  });

  document.getElementById('reviewForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const productId = reviewProduct.value;
    const name = document.getElementById('reviewerName').value.trim();
    const text = document.getElementById('reviewText').value.trim();
    const rating = Number(document.getElementById('reviewRating').value);
    if (!productId || !name || !text || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      setStatus('Select a product and enter a reviewer, rating, and review.', true);
      return;
    }
    const addReviewButton = document.getElementById('addReviewButton');
    addReviewButton.disabled = true;
    try {
      await window.storeDb.collection('products').doc(productId).collection('reviews').add({
        name,
        rating,
        text,
        active: true,
        createdAt: timestamp()
      });
      const selectedProductId = productId;
      event.currentTarget.reset();
      reviewProduct.value = selectedProductId;
      setStatus('Product review added.');
    } catch (error) {
      setStatus(`Could not add product review: ${error.message}`, true);
    } finally {
      addReviewButton.disabled = false;
    }
  });

  seedButton.addEventListener('click', async () => {
    seedButton.disabled = true;
    try {
      const collection = window.storeDb.collection('products');
      const existing = await collection.limit(1).get();
      if (!existing.empty) {
        setStatus('Import stopped because products already exist.', true);
        return;
      }
      const batch = window.storeDb.batch();
      sampleProducts.forEach(({ id, ...product }) => {
        batch.set(collection.doc(id), {
          ...product,
          oldPrice: product.oldPrice ?? null,
          active: true,
          createdAt: timestamp(),
          updatedAt: timestamp()
        });
      });
      await batch.commit();
      setStatus('Imported the current sample products.');
    } catch (error) {
      setStatus(`Could not import products: ${error.message}`, true);
    } finally {
      seedButton.disabled = false;
    }
  });
});
