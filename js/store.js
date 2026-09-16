// =========================================================================
// BAGS WORLD MLS COLOMBIA - GESTOR DE ESTADO, AUTH & CATÁLOGO MAESTRO (Bastion AI)
// =========================================================================

const DB_KEYS = {
  MASTER_PRODUCTS: "bagsworld_master_products_v11",
  STORES: "bagsworld_stores_v11",
  CURRENT_STORE_ID: "bagsworld_current_store_id_v11",
  ORDERS: "bagsworld_orders_v11",
  CART_ITEMS: "bagsworld_cart_items_v11",
  AUTH_SESSION: "bagsworld_auth_session_v11",
  STOCK: "bagsworld_inventory_stock_v11"
};

class BagsWorldStoreManager {
  constructor() {
    this.init();
  }

  init() {
    if (!localStorage.getItem(DB_KEYS.MASTER_PRODUCTS)) {
      localStorage.setItem(DB_KEYS.MASTER_PRODUCTS, JSON.stringify(INITIAL_MASTER_PRODUCTS));
    }
    if (!localStorage.getItem(DB_KEYS.STORES)) {
      localStorage.setItem(DB_KEYS.STORES, JSON.stringify(INITIAL_STORES));
    }
    if (!localStorage.getItem(DB_KEYS.ORDERS)) {
      localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
    }
    if (!localStorage.getItem(DB_KEYS.CURRENT_STORE_ID)) {
      localStorage.setItem(DB_KEYS.CURRENT_STORE_ID, "store-bolsoscol");
    }
  }

  resetDemo() {
    localStorage.setItem(DB_KEYS.MASTER_PRODUCTS, JSON.stringify(INITIAL_MASTER_PRODUCTS));
    localStorage.setItem(DB_KEYS.STORES, JSON.stringify(INITIAL_STORES));
    localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
    localStorage.setItem(DB_KEYS.CURRENT_STORE_ID, "store-bolsoscol");
    localStorage.removeItem(DB_KEYS.CART_ITEMS);
    localStorage.removeItem(DB_KEYS.AUTH_SESSION);
  }

  // =========================================================================
  // SISTEMA DE AUTENTICACIÓN (CRM BASTION / CRM GHOST STYLE)
  // =========================================================================
  
  loginWithCredentials(emailOrUsername, password) {
    const cleanLogin = (emailOrUsername || "").trim().toLowerCase();
    const cleanPass = (password || "").trim();

    // 1. PANEL 1: ADMIN SUPREMO (CONTROL ABSOLUTO MULTI-TENANT)
    if (cleanLogin === "admin@bastion.ai" || cleanLogin === "admin@bagsworld.co" || cleanLogin === "ghost" || cleanLogin === "super_admin" || cleanLogin === "admin") {
      if (cleanPass === "BASTION-GHOST-2026" || cleanPass === "BagsMaster2026*" || cleanPass === "2026" || cleanPass === "admin") {
        this.setCurrentStoreId("store-bagsworld-admin");
        const session = {
          storeId: "store-bagsworld-admin",
          name: "BAGS WORLD MLS (Admin Supremo)",
          email: "admin@bagsworld.co",
          role: "super_admin",
          authenticated: true,
          loginTime: new Date().toISOString()
        };
        localStorage.setItem(DB_KEYS.AUTH_SESSION, JSON.stringify(session));
        return { success: true, isSuperAdmin: true, role: "super_admin", session };
      }
    }

    // 2. PANEL 2: BODEGA MATRIZ PROVEEDOR (MAYORISTA)
    if (cleanLogin === "bodega@bagsworld.co" || cleanLogin === "admin@bagsworld.com" || cleanLogin === "bodega" || cleanLogin === "proveedor") {
      if (cleanPass === "Bodega2026*" || cleanPass === "BastionSaaS2026*" || cleanPass === "7777" || cleanPass === "BagsMaster2026*") {
        this.setCurrentStoreId("store-bagsworld-admin");
        const session = {
          storeId: "store-bagsworld-admin",
          name: "BAGS WORLD Colombia (Bodega Matriz Proveedor)",
          email: "bodega@bagsworld.co",
          role: "supplier",
          authenticated: true,
          loginTime: new Date().toISOString()
        };
        localStorage.setItem(DB_KEYS.AUTH_SESSION, JSON.stringify(session));
        return { success: true, isSuperAdmin: false, role: "supplier", session };
      }
    }

    // 3. PANEL 3: BAG PARTNER REVENDEDOR (BOUTIQUE)
    const stores = this.getStores();
    const store = stores.find(s => 
      ((s.email || "").toLowerCase() === cleanLogin || (s.name || "").toLowerCase() === cleanLogin || (s.id || "").toLowerCase() === cleanLogin) &&
      (s.password === cleanPass || cleanPass === "BolsosCOL2026*" || cleanPass === "1234" || cleanPass === "Cali2026*" || cleanPass === "Calibolsos2026*")
    );

    if (store) {
      this.setCurrentStoreId(store.id);
      const isSupplier = Boolean(store.isSupplierStore);
      const assignedRole = isSupplier ? "supplier" : "store_owner";
      const session = {
        storeId: store.id,
        name: store.name,
        email: store.email,
        role: assignedRole,
        authenticated: true,
        loginTime: new Date().toISOString()
      };
      localStorage.setItem(DB_KEYS.AUTH_SESSION, JSON.stringify(session));
      return { success: true, isSuperAdmin: false, role: assignedRole, session };
    }

    return { success: false, message: "Credenciales incorrectas. Verifica tu correo y contraseña o usa los 3 accesos oficiales." };
  }

  superAdminResetPassword(target, newPass = "BolsosCOL2026*") {
    const stores = this.getStores();
    const store = stores.find(s => s.id === target || s.name.toLowerCase().includes(target.toLowerCase()));
    if (store) {
      store.password = newPass;
      this.saveStores(stores);
      return { success: true, store };
    }
    return { success: false };
  }

  login(email, password) {
    return this.loginWithCredentials(email, password);
  }

  quickLogin(storeId, forcedRole) {
    const stores = this.getStores();
    const store = stores.find(s => s.id === storeId);
    if (!store) return false;

    this.setCurrentStoreId(store.id);
    let role = forcedRole;
    if (!role) {
      role = store.isSupplierStore ? "supplier" : "store_owner";
    }

    const sessionData = {
      storeId: store.id,
      name: store.name,
      email: store.email,
      role: role,
      authenticated: true,
      loginTime: new Date().toISOString()
    };
    localStorage.setItem(DB_KEYS.AUTH_SESSION, JSON.stringify(sessionData));
    return store;
  }

  loginSuperAdmin() {
    this.setCurrentStoreId("store-bagsworld-admin");
    const sessionData = {
      storeId: "store-bagsworld-admin",
      name: "BAGS WORLD MLS (Admin Supremo)",
      email: "admin@bagsworld.co",
      role: "super_admin",
      authenticated: true,
      loginTime: new Date().toISOString()
    };
    localStorage.setItem(DB_KEYS.AUTH_SESSION, JSON.stringify(sessionData));
    return sessionData;
  }

  loginSupplier() {
    this.setCurrentStoreId("store-bagsworld-admin");
    const sessionData = {
      storeId: "store-bagsworld-admin",
      name: "BAGS WORLD Colombia (Bodega Matriz Proveedor)",
      email: "bodega@bagsworld.co",
      role: "supplier",
      authenticated: true,
      loginTime: new Date().toISOString()
    };
    localStorage.setItem(DB_KEYS.AUTH_SESSION, JSON.stringify(sessionData));
    return sessionData;
  }

  loginPartner(storeId = "store-bolsoscol") {
    return this.quickLogin(storeId, "store_owner");
  }

  getAuthSession() {
    try {
      const raw = localStorage.getItem(DB_KEYS.AUTH_SESSION);
      if (raw) {
        const parsed = JSON.parse(raw);
        return { ...parsed, authenticated: true };
      }
    } catch (e) {}
    return { authenticated: false, role: 'public' };
  }

  getCurrentSession() {
    try {
      const raw = localStorage.getItem(DB_KEYS.AUTH_SESSION);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    const store = this.getCurrentStore();
    return {
      storeId: store.id,
      name: store.name,
      email: store.email,
      role: store.isSupplierStore ? "supplier" : "store_owner"
    };
  }

  logout() {
    localStorage.removeItem(DB_KEYS.AUTH_SESSION);
    this.setCurrentStoreId("store-bolsoscol");
  }

  getMasterProductById(id) {
    const products = this.getMasterProducts();
    const p = products.find(prod => prod.id === id);
    if (!p) return null;
    return {
      ...p,
      storeRetailPrice: p.suggestedRetailPrice
    };
  }

  // =========================================================================
  // PRIVACIDAD & GESTIÓN DE SEGURIDAD
  // =========================================================================
  updateStoreSecurity(storeId, { email, currentPassword, newPassword }) {
    const stores = this.getStores();
    const store = stores.find(s => s.id === storeId);
    if (!store) return { success: false, message: "Tienda no encontrada." };

    if (currentPassword && store.password !== currentPassword.trim()) {
      return { success: false, message: "La contraseña actual no coincide." };
    }

    if (email && email.trim() !== "") {
      store.email = email.trim().toLowerCase();
    }

    if (newPassword && newPassword.trim().length >= 4) {
      store.password = newPassword.trim();
    }

    this.saveStores(stores);
    return { success: true, store, message: "Credenciales y privacidad actualizadas correctamente." };
  }

  // Respaldo Maestro / Recuperación de Contraseña por el Dueño del SaaS
  resetStorePasswordByAdmin(storeId, newPassword) {
    const stores = this.getStores();
    const store = stores.find(s => s.id === storeId);
    if (!store) return { success: false, message: "Tienda no encontrada." };

    store.password = (newPassword || "Bolsos2026*").trim();
    this.saveStores(stores);
    return { success: true, store, newPassword: store.password };
  }

  // =========================================================================
  // GESTIÓN DE BACKUPS & SEGURIDAD DE DATOS (NO DATA LOSS)
  // =========================================================================
  exportStoreBackup(storeId) {
    const store = this.getStores().find(s => s.id === storeId);
    const master = this.getMasterProducts();
    const orders = this.getOrders().filter(o => o.storeName === (store ? store.name : ""));

    return {
      timestamp: new Date().toISOString(),
      saas: "BAGS WORLD MLS (Bastion AI)",
      store,
      customCatalog: this.getStorefrontProducts(store),
      orders
    };
  }

  exportSaaSFullBackup() {
    return {
      timestamp: new Date().toISOString(),
      saas: "BAGS WORLD MLS (Bastion AI)",
      masterProducts: this.getMasterProducts(),
      stores: this.getStores(),
      orders: this.getOrders()
    };
  }

  // =========================================================================
  // CATÁLOGO & PRODUCTOS
  // =========================================================================
  getMasterProducts() {
    try {
      const raw = localStorage.getItem(DB_KEYS.MASTER_PRODUCTS);
      const parsed = raw ? JSON.parse(raw) : INITIAL_MASTER_PRODUCTS;
      if (!Array.isArray(parsed) || parsed.length < 8 || !parsed[0].sku.startsWith("BW-")) {
        localStorage.setItem(DB_KEYS.MASTER_PRODUCTS, JSON.stringify(INITIAL_MASTER_PRODUCTS));
        return INITIAL_MASTER_PRODUCTS;
      }
      return parsed;
    } catch (e) {
      return INITIAL_MASTER_PRODUCTS;
    }
  }

  saveMasterProducts(products) {
    localStorage.setItem(DB_KEYS.MASTER_PRODUCTS, JSON.stringify(products));
  }

  getStores() {
    try {
      const raw = localStorage.getItem(DB_KEYS.STORES);
      const parsed = raw ? JSON.parse(raw) : INITIAL_STORES;
      if (!Array.isArray(parsed) || parsed.length === 0 || !parsed.some(s => s.id === "store-bolsoscol")) {
        localStorage.setItem(DB_KEYS.STORES, JSON.stringify(INITIAL_STORES));
        return INITIAL_STORES;
      }
      return parsed;
    } catch (e) {
      return INITIAL_STORES;
    }
  }

  saveStores(stores) {
    localStorage.setItem(DB_KEYS.STORES, JSON.stringify(stores));
  }

  getCurrentStoreId() {
    return localStorage.getItem(DB_KEYS.CURRENT_STORE_ID) || "store-bolsoscol";
  }

  setCurrentStoreId(storeId) {
    localStorage.setItem(DB_KEYS.CURRENT_STORE_ID, storeId);
  }

  getCurrentStore() {
    const stores = this.getStores();
    const currentId = this.getCurrentStoreId();
    return stores.find(s => s.id === currentId) || stores[0];
  }

  getOrders() {
    try {
      const raw = localStorage.getItem(DB_KEYS.ORDERS);
      return raw ? JSON.parse(raw) : INITIAL_ORDERS;
    } catch (e) {
      return INITIAL_ORDERS;
    }
  }

  saveOrders(orders) {
    localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify(orders));
  }

  getStorefrontProducts(store) {
    const activeStore = store || this.getCurrentStore();
    const master = this.getMasterProducts();
    const storeProducts = activeStore && Array.isArray(activeStore.products) ? activeStore.products : [];

    return master.filter(mp => mp.active !== false).map(mp => {
      const sp = storeProducts.find(p => p.productId === mp.id);
      const isActive = sp ? sp.active !== false : true;
      const customPrice = (activeStore && activeStore.isSupplierStore)
        ? mp.suggestedRetailPrice
        : ((sp && sp.customPrice) ? sp.customPrice : mp.suggestedRetailPrice);

      return {
        ...mp,
        storeRetailPrice: customPrice,
        isActiveInStore: isActive
      };
    }).filter(p => p.isActiveInStore !== false);
  }

  updateStorePrice(storeId, productId, newPrice) {
    const stores = this.getStores();
    const store = stores.find(s => s.id === storeId);
    if (!store) return false;

    if (!store.products) store.products = [];
    const prodConfig = store.products.find(p => p.productId === productId);

    if (prodConfig) {
      prodConfig.customPrice = parseInt(newPrice, 10);
    } else {
      store.products.push({
        productId,
        customPrice: parseInt(newPrice, 10),
        active: true
      });
    }

    this.saveStores(stores);
    return true;
  }

  toggleProductActive(storeId, productId) {
    const stores = this.getStores();
    const store = stores.find(s => s.id === storeId);
    if (!store) return false;

    if (!store.products) store.products = [];
    const prodConfig = store.products.find(p => p.productId === productId);

    if (prodConfig) {
      prodConfig.active = !prodConfig.active;
    } else {
      store.products.push({
        productId,
        customPrice: 120000,
        active: false
      });
    }

    this.saveStores(stores);
    return prodConfig ? prodConfig.active : false;
  }

  updateStoreProfile(storeId, { name, tagline, phone, neighborhood }) {
    const stores = this.getStores();
    const store = stores.find(s => s.id === storeId);
    if (!store) return false;

    if (name) store.name = name;
    if (tagline) store.tagline = tagline;
    if (phone) store.phone = phone.replace(/[^0-9]/g, "");
    if (neighborhood) store.neighborhood = neighborhood;

    this.saveStores(stores);
    return true;
  }

  addMasterProduct(newProduct) {
    const master = this.getMasterProducts();
    const product = {
      id: "prod-lux-" + Date.now().toString(36),
      sku: newProduct.sku || `BW-${Math.floor(1000 + Math.random() * 9000)}`,
      name: newProduct.name || "Nuevo Bolso Importado",
      category: newProduct.category || "Totes & Handbags",
      tagline: newProduct.tagline || "Bolso importado calidad superior.",
      description: newProduct.description || "Confección de alta calidad con herrajes metálicos reforzados.",
      image: newProduct.image || "assets/images/bags/tote_horse_charm_cream.jpg",
      dimensions: newProduct.dimensions || "18 cm (Alto) x 22 cm (Ancho) x 8 cm (Prof.)",
      sizeCategory: newProduct.sizeCategory || "Mediano (20-28cm)",
      colorways: newProduct.colorways || [
        { name: "Negro Ónix", image: newProduct.image || "assets/images/bags/tote_horse_charm_cream.jpg", sku: "BW-BLK" }
      ],
      active: newProduct.active !== undefined ? Boolean(newProduct.active) : true,
      wholesalePrice: parseInt(newProduct.wholesalePrice || "68000", 10),
      suggestedRetailPrice: parseInt(newProduct.suggestedRetailPrice || "125000", 10),
      supplierId: "sup-001",
      supplierName: "BAGS WORLD Colombia (Bodega Matriz)",
      createdAt: new Date().toISOString().slice(0, 10)
    };

    master.unshift(product);
    this.saveMasterProducts(master);
    return product;
  }

  parseWhatsAppWholesaleText(rawText) {
    if (!rawText || rawText.trim() === "") return null;

    const priceMatch = rawText.match(/\$?([0-9]{2,3})[.,]([0-9]{3})/);
    let wholesalePrice = 68000;
    if (priceMatch) {
      wholesalePrice = parseInt(priceMatch[1] + priceMatch[2], 10);
    }

    const marginPVP = Math.round(wholesalePrice * 1.8 / 1000) * 1000;

    let dimensions = "18 cm (Alto) x 22 cm (Ancho) x 8 cm (Profundidad)";
    const dimMatch = rawText.match(/medidas?:?\s*([0-9xX\s\w]+)/i);
    if (dimMatch) {
      dimensions = dimMatch[1].trim();
    }

    const lines = rawText.split("\n").map(l => l.trim()).filter(l => l.length > 0);
    const titleLine = lines.find(l => l.toUpperCase().includes("BOLSO") || l.toUpperCase().includes("COLECCIÓN") || l.toUpperCase().includes("TOTE")) || lines[0] || "Nuevo Bolso Importado BAGS WORLD";

    let colorCount = 1;
    const colorMatch = rawText.match(/([0-9]+)\s*colores/i);
    if (colorMatch) {
      colorCount = parseInt(colorMatch[1], 10);
    }

    return {
      name: titleLine.replace(/[$0-9.,]/g, "").replace(/[🔝🤯🖤✨]/g, "").trim(),
      sku: `BW-${Math.floor(1000 + Math.random() * 9000)}`,
      category: "Totes & Handbags",
      tagline: "Importado calidad superior detectado desde WhatsApp.",
      description: rawText.substring(0, 220),
      image: "assets/images/bags/tote_horse_charm_cream.jpg",
      dimensions,
      wholesalePrice,
      suggestedRetailPrice: marginPVP,
      colorways: Array.from({ length: Math.min(colorCount, 6) }).map((_, i) => ({
        name: `Tono #${i + 1}`,
        image: "assets/images/bags/tote_horse_charm_cream.jpg",
        sku: `BW-TONO-${i + 1}`
      }))
    };
  }

  createB2BOrder({ storeName, productName, colorway, units, totalWholesale, supplierName }) {
    const orders = this.getOrders();
    const newOrder = {
      id: "ord-" + Math.floor(1000 + Math.random() * 9000),
      date: new Date().toISOString().replace("T", " ").substring(0, 16),
      storeName,
      productName,
      colorway,
      type: "B2B Restock (Reposición)",
      units,
      totalWholesale,
      status: "En Alistamiento",
      supplierName
    };
    orders.unshift(newOrder);
    this.saveOrders(orders);
    return newOrder;
  }

  buildSingleProductWhatsAppUrl(store, product, selectedColorway) {
    const cleanPhone = (store.phone || "573165558899").replace(/[^0-9]/g, "");
    const colorName = selectedColorway ? selectedColorway.name : "Color Original";
    const formattedPrice = this.formatCOP(product.storeRetailPrice);

    const message = `✨ *SOLICITUD DE PEDIDO - BAGS WORLD COLOMBIA* ✨
------------------------------------------
🏪 *Boutique:* ${store.name}
📍 *Ubicación:* ${store.neighborhood}

👜 *Bolso:* ${product.name}
🎨 *Colorway:* ${colorName}
🏷️ *SKU:* ${product.sku}
📐 *Medidas:* ${product.dimensions || 'Estándar'}
💰 *Valor Unitario:* ${formattedPrice} COP

🛵 *Modalidad:* Despacho Contraentrega Nacional
------------------------------------------
👋 ¡Hola! Quiero pedir este bolso en color *${colorName}*. ¿Tienen disponibilidad para despacho hoy?`;

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  }

  buildConsolidatedCartWhatsAppUrl(store, cartItems, customerData, selectedZone, dispatchMode) {
    const cleanPhone = (store.phone || "573165558899").replace(/[^0-9]/g, "");
    const totalBags = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const shippingFee = selectedZone ? selectedZone.fee : 12000;
    const grandTotal = totalBags + shippingFee;

    const itemsSummary = cartItems.map((item, idx) => {
      return `${idx + 1}. 👜 *${item.name}* (${item.quantity} und)
   • Color: ${item.colorway}
   • Subtotal: ${this.formatCOP(item.price * item.quantity)}`;
    }).join("\n\n");

    const modeText = dispatchMode === "secured"
      ? `🛡️ *Despacho Asegurado:* Abono flete (${this.formatCOP(shippingFee)}) por Nequi/Daviplata y bolsos contraentrega.`
      : `🛵 *100% Contraentrega:* Pago totalidad al recibir en puerta.`;

    const message = `✨ *PEDIDO CONSOLIDADO DE BOLSOS - BAGS WORLD* ✨
==========================================
🏪 *Boutique:* ${store.name}

👤 *Cliente:* ${customerData.name || 'Cliente Directo'}
📱 *WhatsApp:* ${customerData.phone || 'No especificado'}
📍 *Dirección:* ${customerData.address || 'No especificada'}
🏙️ *Destino:* ${selectedZone ? selectedZone.name : 'Colombia'}

🛍️ *BOLSOS SOLICITADOS:*
------------------------------------------
${itemsSummary}

------------------------------------------
💰 *Subtotal Bolsos:* ${this.formatCOP(totalBags)}
🛵 *Flete Estimado:* ${this.formatCOP(shippingFee)} (${selectedZone ? selectedZone.time : 'Hoy'})
💳 *GRAN TOTAL A PAGAR:* ${this.formatCOP(grandTotal)} COP

📦 *MODALIDAD DE DESPACHO:*
${modeText}
==========================================
⚡ *Reserva de Bodega Activa:* Solicitud enviada para confirmación de inventario y despacho inmediato.`;

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  }

  
  
  toggleMasterProductActive(productId) {
    const products = this.getMasterProducts();
    const prod = products.find(p => p.id === productId);
    if (!prod) return null;

    prod.active = prod.active === false ? true : false;
    prod.updatedAt = new Date().toISOString().split("T")[0];
    this.saveMasterProducts(products);

    // Sincronizar estado activo en todas las tiendas asociadas de la red
    const stores = this.getStores();
    stores.forEach(st => {
      let sp = (st.products || []).find(item => item.productId === productId);
      if (sp) {
        sp.active = prod.active;
      } else {
        if (!st.products) st.products = [];
        st.products.push({
          productId,
          customPrice: prod.suggestedRetailPrice,
          active: prod.active
        });
      }
    });
    this.saveStores(stores);

    return prod.active;
  }

  deleteMasterProduct(productId) {
    let products = this.getMasterProducts();
    products = products.filter(p => p.id !== productId);
    this.saveMasterProducts(products);

    // Limpiar de las configuraciones de tiendas boutique
    const stores = this.getStores();
    stores.forEach(s => {
      if (Array.isArray(s.products)) {
        s.products = s.products.filter(p => p.productId !== productId);
      }
    });
    this.saveStores(stores);
    return true;
  }

  updateMasterProduct(productId, updates) {
    const master = this.getMasterProducts();
    const prod = master.find(p => p.id === productId);
    if (!prod) return false;

    if (updates.name) prod.name = updates.name;
    if (updates.category) prod.category = updates.category;
    if (updates.wholesalePrice !== undefined) prod.wholesalePrice = parseInt(updates.wholesalePrice, 10);
    if (updates.suggestedRetailPrice !== undefined) prod.suggestedRetailPrice = parseInt(updates.suggestedRetailPrice, 10);
    if (updates.campaignBadge !== undefined) prod.campaignBadge = updates.campaignBadge;
    if (updates.dimensions) prod.dimensions = updates.dimensions;
    if (updates.description) prod.description = updates.description;
    if (updates.active !== undefined) prod.active = Boolean(updates.active);
    if (updates.image) prod.image = updates.image;
    if (updates.tagline) prod.tagline = updates.tagline;

    this.saveMasterProducts(master);
    return prod;
  }

  updateOrderStatus(orderId, newStatus) {
    const orders = this.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (order) {
      order.status = newStatus;
      if (newStatus === "Entregado y Cobrado") {
        order.isPaid = true;
      }
      this.saveOrders(orders);
      return order;
    }
    return null;
  }

  getFinancialSummary(period = "month", storeNameFilter = null) {
    const allOrders = this.getOrders();
    const now = new Date();
    
    let filtered = allOrders;
    if (storeNameFilter) {
      filtered = filtered.filter(o => o.storeName && o.storeName.toLowerCase().includes(storeNameFilter.toLowerCase()));
    }

    filtered = filtered.filter(o => {
      if (!o.date) return true;
      const orderDate = new Date(o.date.replace(" ", "T"));
      if (isNaN(orderDate.getTime())) return true;

      const diffMs = now - orderDate;
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      if (period === "day") {
        return orderDate.toDateString() === now.toDateString() || diffDays <= 1;
      } else if (period === "week") {
        return diffDays <= 7;
      } else if (period === "month") {
        return diffDays <= 31;
      } else if (period === "year") {
        return diffDays <= 365;
      }
      return true;
    });

    let totalGross = 0;
    let totalWholesale = 0;
    let totalBags = 0;
    let paidOrdersCount = 0;

    filtered.forEach(o => {
      const units = Number(o.units) || 1;
      const wholesale = Number(o.totalWholesale) || (units * 68000);
      const retail = Number(o.totalRetail) || (wholesale * 1.8);
      
      totalGross += retail;
      totalWholesale += wholesale;
      totalBags += units;

      if (o.status === "Entregado y Cobrado" || o.isPaid) {
        paidOrdersCount++;
      }
    });

    const netProfit = totalGross - totalWholesale;

    return {
      period,
      orders: filtered,
      totalOrders: filtered.length,
      totalBags,
      totalGross,
      totalWholesale,
      netProfit,
      paidOrdersCount,
      collectionRate: filtered.length > 0 ? Math.round((paidOrdersCount / filtered.length) * 100) : 100
    };
  }

  // =========================================================================
  // CONTROL DE STOCK EN TIEMPO REAL (POR COLORWAY / VARIANTE)
  // =========================================================================
  getStockData() {
    const raw = localStorage.getItem(DB_KEYS.STOCK);
    return raw ? JSON.parse(raw) : {};
  }

  saveStockData(stockData) {
    localStorage.setItem(DB_KEYS.STOCK, JSON.stringify(stockData));
  }

  getProductStockMatrix(productId) {
    const stockData = this.getStockData();
    const master = this.getMasterProducts();
    const prod = master.find(p => p.id === productId);
    if (!prod) return {};

    if (!stockData[productId]) {
      stockData[productId] = {};
      const colorways = prod.colorways && prod.colorways.length > 0 ? prod.colorways : [{ name: "Color Único" }];

      colorways.forEach((cw, idx) => {
        stockData[productId][cw.name] = Math.floor(6 + ((idx * 3) % 9));
      });

      this.saveStockData(stockData);
    }

    return stockData[productId];
  }

  getProductStock(productId, colorwayName) {
    const matrix = this.getProductStockMatrix(productId);
    const key = colorwayName || Object.keys(matrix)[0] || "Color Único";
    if (matrix[key] !== undefined) {
      return Number(matrix[key]);
    }
    return 6;
  }

  getProductTotalStock(productId) {
    const matrix = this.getProductStockMatrix(productId);
    return Object.values(matrix).reduce((acc, qty) => acc + (Number(qty) || 0), 0);
  }

  saveProductStockMatrix(productId, newMatrix) {
    const stockData = this.getStockData();
    stockData[productId] = newMatrix;
    this.saveStockData(stockData);
  }

  decrementStock(productId, colorwayName, count = 1) {
    const stockData = this.getStockData();
    const matrix = this.getProductStockMatrix(productId);
    const key = colorwayName || Object.keys(matrix)[0] || "Color Único";
    const current = matrix[key] !== undefined ? Number(matrix[key]) : 6;
    const remaining = Math.max(0, current - Number(count));
    matrix[key] = remaining;
    stockData[productId] = matrix;
    this.saveStockData(stockData);
    return {
      productId,
      colorway: key,
      remaining,
      isSoldOut: remaining <= 0
    };
  }

  incrementStock(productId, colorwayName, count = 1) {
    const stockData = this.getStockData();
    const matrix = this.getProductStockMatrix(productId);
    const key = colorwayName || Object.keys(matrix)[0] || "Color Único";
    const current = matrix[key] !== undefined ? Number(matrix[key]) : 6;
    const remaining = current + Number(count);
    matrix[key] = remaining;
    stockData[productId] = matrix;
    this.saveStockData(stockData);
    return {
      productId,
      colorway: key,
      remaining
    };
  }

  processReturnOrExchange(orderId, data) {
    const orders = this.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return { success: false, message: "Orden no encontrada" };

    const products = this.getMasterProducts();
    const product = products.find(p => p.id === order.productId || p.name === order.productName) || products[0];
    const prodId = product ? product.id : (order.productId || "prod-lux-001");

    const actionType = data.actionType;
    const units = Number(data.units) || 1;
    const returnColor = data.returnColor || order.colorway || "Color Original";
    const newColor = data.newColor || order.colorway || "Color Nuevo";
    const shippingCost = Number(data.shippingCost) || 0;
    const shippingPayer = data.shippingPayer || "Cliente";
    const notes = data.notes || "";

    if (actionType === "color_exchange") {
      this.incrementStock(prodId, returnColor, units);
      this.decrementStock(prodId, newColor, units);
      order.status = "🔄 Cambio Color (" + returnColor + " ➔ " + newColor + ")";
      order.exchangeInfo = { actionType, returnColor, newColor, units, date: new Date().toISOString().replace("T", " ").substring(0, 16), shippingCost, shippingPayer, notes };
    } else if (actionType === "warranty") {
      this.decrementStock(prodId, newColor, units);
      order.status = "🛡️ Garantía de Fábrica (Herrajes/Cierre)";
      order.exchangeInfo = { actionType, defectReason: data.defectReason || "Defecto en herrajes o costura", newColor, units, date: new Date().toISOString().replace("T", " ").substring(0, 16), notes };
    } else if (actionType === "stock_rotation") {
      this.incrementStock(prodId, returnColor, units);
      this.decrementStock(prodId, newColor, units);
      order.status = "📦 Rotación Mayorista (" + returnColor + " ➔ " + newColor + ")";
      order.exchangeInfo = { actionType, returnColor, newColor, units, date: new Date().toISOString().replace("T", " ").substring(0, 16), notes };
    } else if (actionType === "refund_return") {
      this.incrementStock(prodId, returnColor, units);
      order.status = "❌ Devolución a Bodega (+" + units + " Stock)";
      order.isRefunded = true;
      order.exchangeInfo = { actionType, returnColor, units, date: new Date().toISOString().replace("T", " ").substring(0, 16), notes };
    }

    this.saveOrders(orders);

    let waText = "";
    if (actionType === "color_exchange") {
      waText = "🛵 *GUÍA DE SERVICIO: CAMBIO DE COLOR/REFERENCIA - BAGS WORLD*\n" +
        "📦 *Orden:* #" + order.id + "\n" +
        "🏪 *Boutique:* " + order.storeName + "\n" +
        "👜 *Bolso:* " + order.productName + "\n" +
        "🔄 *ENTREGAR AL CLIENTE:* Color " + newColor + "\n" +
        "📥 *RECOGER DEL CLIENTE:* Color " + returnColor + " (con herrajes, guardapolvo y empaque)\n" +
        "🛵 *Flete Mensajería:* " + (shippingCost > 0 ? this.formatCOP(shippingCost) + " (Cobra a: " + shippingPayer + ")" : "CORTESÍA GARANTÍA") + "\n" +
        "📍 *Dirección:* " + (data.clientAddress || "Confirmar con cliente en WhatsApp") + "\n" +
        "✨ *Despacho Central:* BAGS WORLD Colombia";
    } else if (actionType === "warranty") {
      waText = "🛡️ *GUÍA DE SERVICIO: GARANTÍA DE FÁBRICA / HERRAJES*\n" +
        "📦 *Orden:* #" + order.id + "\n" +
        "👜 *Bolso:* " + order.productName + " (" + newColor + ")\n" +
        "⚠️ *Motivo:* " + (data.defectReason || "Cremallera / Herraje / Costura") + "\n" +
        "🛵 *Flete:* $0 COP (Asumido 100% por Bodega Matriz BAGS WORLD)\n" +
        "✨ *Reposición Inmediata Garantizada.*";
    } else {
      waText = "📦 *REPORTE DE BODEGA: RETORNO DE STOCK*\n" +
        "Orden #" + order.id + " procesada con reingreso de " + units + " bolso(s) " + returnColor + " al inventario central.";
    }

    return {
      success: true,
      order,
      whatsappText: waText
    };
  }

  formatCOP(value) {
    return "$" + parseInt(value || 0, 10).toLocaleString("es-CO");
  }
}

const db = new BagsWorldStoreManager();

if (typeof module !== "undefined" && module.exports) {
  module.exports = { BagsWorldStoreManager, db };
}

if (typeof window !== "undefined") {
  window.db = db;
}
