// =========================================================================
// BAGS WORLD MLS COLOMBIA - APLICACIÓN PRINCIPAL & CONTROLADOR (Bastion AI)
// =========================================================================

document.addEventListener("DOMContentLoaded", () => {
  let currentView = "storefront"; // storefront | store-admin | supplier | directory
  let selectedCategory = "all";
  let selectedSize = "all";
  let selectedColor = "all";
  let searchQuery = "";
  let currentSort = "default";
  let directoryRoleFilter = "all";
  let directorySearchQuery = "";

  // Estado del modal de producto activo
  let activeModalProduct = null;
  let activeModalColorway = null;
  let activeModalQuantity = 1;

  // Estado del Checkout Consolidado
  let cartItems = [];
  let cartSelectedZone = COLOMBIAN_SHIPPING_ZONES[0];
  let cartDispatchMode = "secured"; // secured | cod

  // Inicializar todo el sistema
  initApp();

  function initApp() {
    loadCartFromStorage();
    setupRoleSwitcher();
    setupFilters();
    setupProductModal();
    setupCartDrawer();
    setupAdminStoreActions();
    setupSupplierFastImporter();
    setupROISimulator();
    setupAuthSystem();
    setupPrivacyAndBackups();
    startReservationTimer();
    initBlackHoleCanvas();

    // Nuevos módulos avanzados (BASTION AI SAAS v11)
    setupHeadersAndRoleIsolation();
    setupDirectoryFilters();
    setupQuoteGenerator();
    setupInventoryStockMatrix();
    setupAccountingReports();
    setupReturnExchangeModal();

    // Sistema de 3 Temas Visuales
    initThemeSystem();

    // Empleado Digital 24/7 y Creador de Enlaces
    setupEmpleadoDigital();
    setupLinkCreatorModal();

    // Renderizar vista inicial
    renderCurrentView();
    updateFloatingCartBar();
    updateAuthHUD();

    // Auto-abrir bolso si viene en el enlace por sticker de Instagram o chat
    const paramProd = urlParams.get("prod");
    if (paramProd) {
      setTimeout(() => openProductModal(paramProd), 400);
    }
  }

  // =========================================================================
  // CANVAS BACKGROUND INTERACTIVO (MODO OSCURO COSMIC LUXURY)
  // =========================================================================
  function initBlackHoleCanvas() {
    const canvas = document.getElementById("black-hole-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener("resize", () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const count = 50;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5 + 0.4,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        color: Math.random() > 0.5 ? "rgba(227, 194, 116, 0.45)" : "rgba(230, 25, 46, 0.35)"
      });
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });

      requestAnimationFrame(animate);
    }
    animate();
  }

  // =========================================================================
  // NAVEGACIÓN ENTRE ROLES (HUD TABS)
  // =========================================================================
  
  // =========================================================================
  // AISLAMIENTO DE ROLES & SEGURIDAD MULTI-TENANT (BASTION AI SAAS)
  // =========================================================================
  function setupHeadersAndRoleIsolation() {
    const urlParams = new URLSearchParams(window.location.search);
    const paramDemo = urlParams.get("demo");
    const paramRole = urlParams.get("role");
    const paramView = urlParams.get("view");
    const paramStore = urlParams.get("store");

    // =========================================================================
    // ENTRADA DIRECTA A LOS 3 PANELES OFICIALES (BASTION AI MLS)
    // 1. Admin Supremo con Control Absoluto (?demo=admin | ?demo=bagsworld | ?role=super_admin)
    // 2. Bodega Matriz Proveedor (?demo=bodega | ?demo=proveedor | ?role=supplier)
    // 3. Bag Partner Revendedor (?demo=bolsoscol | ?demo=partner | ?role=store_owner)
    // =========================================================================
    if (paramDemo === "admin" || paramDemo === "super_admin" || paramDemo === "bagsworld" || paramDemo === "ghost" || paramRole === "super_admin" || paramView === "directory") {
      db.loginSuperAdmin();
    } else if (paramDemo === "bodega" || paramDemo === "proveedor" || paramRole === "supplier" || paramView === "supplier") {
      db.loginSupplier();
    } else if (paramDemo === "bolsoscol" || paramDemo === "partner" || paramDemo === "revendedor" || paramRole === "store_owner" || paramView === "store-admin") {
      db.loginPartner("store-bolsoscol");
    } else if (paramDemo === "calibolsos") {
      db.loginPartner("store-calibolsos");
    }

    if (paramStore) {
      db.setCurrentStoreId(paramStore);
    }

    const session = db.getAuthSession();
    const currentStore = db.getCurrentStore();
    const masterHud = document.getElementById("master-admin-hud");
    const clientHud = document.getElementById("client-auth-hud");

    if (masterHud) masterHud.style.display = "none";
    if (clientHud) clientHud.style.display = "none";

    // Si es vitrina pública sin sesión activa: 100% limpia para cliente final (cero barras admin)
    if (currentView === "storefront" && !session.authenticated) {
      return;
    }

    // PANEL 1: ADMIN SUPREMO (CONTROL ABSOLUTO)
    if (session.authenticated && session.role === "super_admin") {
      if (masterHud) masterHud.style.display = "block";
      if (paramView) {
        switchRoleTab(paramView);
      }
      return;
    }

    // PANEL 2 (Bodega Proveedor) y PANEL 3 (Bag Partner Revendedor)
    if (session.authenticated && (session.role === "supplier" || session.role === "store_owner")) {
      if (clientHud) {
        clientHud.style.display = "block";
        const titleEl = document.getElementById("client-hud-title");
        const subtitleEl = document.getElementById("client-hud-subtitle");
        const iconEl = document.getElementById("client-role-icon");
        const toggleBtn = document.getElementById("btn-client-toggle-view");
        const accountBtn = document.getElementById("btn-client-open-account");

        if (session.role === "supplier") {
          // PANEL 2: BODEGA MATRIZ PROVEEDOR
          if (iconEl) iconEl.textContent = "📦";
          if (titleEl) titleEl.textContent = "BAGS WORLD Colombia (Bodega Matriz Proveedor)";
          if (subtitleEl) subtitleEl.textContent = "🟢 Panel Mayorista • Inventario Maestro, Despachos & Garantías";
          if (toggleBtn) toggleBtn.textContent = currentView === "storefront" ? "📦 Volver al Panel Bodega" : "🛒 Ver Mi Vitrina Mayorista";
          if (accountBtn) accountBtn.textContent = "⚙️ Mi Perfil Bodega";

          if (toggleBtn) {
            toggleBtn.onclick = () => {
              if (currentView === "storefront") {
                switchRoleTab("supplier");
              } else {
                switchRoleTab("storefront");
              }
            };
          }
        } else {
          // PANEL 3: BAG PARTNER REVENDEDOR
          if (iconEl) iconEl.textContent = "👜";
          if (titleEl) titleEl.textContent = currentStore.name + " (Bag Partner Revendedor)";
          if (subtitleEl) subtitleEl.textContent = "🟢 Margen Propio PVP • Catálogo Sincronizado en Vivo";
          if (toggleBtn) toggleBtn.textContent = currentView === "storefront" ? "🏪 Volver a Mi Panel Tienda" : "🛒 Ver Mi Vitrina con Margen";
          if (accountBtn) accountBtn.textContent = "⚙️ Mi Perfil Boutique";

          if (toggleBtn) {
            toggleBtn.onclick = () => {
              if (currentView === "storefront") {
                switchRoleTab("store-admin");
              } else {
                switchRoleTab("storefront");
              }
            };
          }
        }

        if (accountBtn) {
          accountBtn.onclick = () => {
            openStoreProfileModal();
          };
        }

        const clientLogoutBtn = document.getElementById("btn-client-logout");
        if (clientLogoutBtn) {
          clientLogoutBtn.onclick = () => {
            if (confirm("¿Deseas cerrar tu sesión segura?")) {
              db.logout();
              window.location.href = "index.html?view=storefront";
            }
          };
        }
      }

      if (paramView === "storefront") {
        switchRoleTab("storefront");
      } else {
        switchRoleTab(session.role === "supplier" ? "supplier" : "store-admin");
      }
      return;
    }

    // Copiar link de partner en bodega
    const btnCopyPartner = document.getElementById("btn-copy-partner-link");
    if (btnCopyPartner) {
      btnCopyPartner.onclick = () => {
        const link = window.location.origin + window.location.pathname.replace('index.html', '') + "admin.html?partner=bagsworld";
        navigator.clipboard?.writeText(link).then(() => {
          showToast("🔗 Enlace de invitación copiado: " + link);
        }).catch(() => {
          prompt("Copia este enlace de invitación para tu nueva Boutique Partner:", link);
        });
      };
    }

    // Logout en Master HUD
    const btnLogoutHud = document.getElementById("btn-logout-hud");
    if (btnLogoutHud) {
      btnLogoutHud.onclick = () => {
        if (confirm("¿Cerrar sesión de SuperAdmin?")) {
          db.logout();
          window.location.href = "index.html?view=storefront";
        }
      };
    }

    if (paramView) {
      switchRoleTab(paramView);
    }
  }

  function setupRoleSwitcher() {
    const tabs = document.querySelectorAll(".role-tab-btn");
    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        tabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        currentView = tab.dataset.view;
        renderCurrentView();
      });
    });

    // Selector de Tienda en el HUD
    const hudSelect = document.getElementById("hud-store-select");
    if (hudSelect) {
      hudSelect.addEventListener("change", (e) => {
        db.setCurrentStoreId(e.target.value);
        updateAuthHUD();
        renderCurrentView();
        showToast("Cambiado a: " + db.getCurrentStore().name);
      });
    }

    // Botón de Reset Demo
    const btnReset = document.getElementById("btn-reset-demo");
    if (btnReset) {
      btnReset.addEventListener("click", () => {
        if (confirm("¿Deseas restaurar los datos de demostración de BAGS WORLD MLS?")) {
          db.resetDemo();
          cartItems = [];
          saveCartToStorage();
          updateFloatingCartBar();
          updateAuthHUD();
          renderCurrentView();
          showToast("Datos restaurados correctamente.");
        }
      });
    }
  }

  function renderCurrentView() {
    const session = db.getAuthSession();

    if (session.authenticated) {
      if (session.role === "supplier" && currentView !== "storefront") {
        currentView = "supplier";
      } else if (session.role === "store_owner" && currentView !== "storefront") {
        currentView = "store-admin";
      }
    }

    document.querySelectorAll(".view-panel").forEach(p => p.style.display = "none");

    renderHudStoreSelect();

    if (currentView === "storefront") {
      document.getElementById("view-storefront").style.display = "block";
      renderStorefront();
    } else if (currentView === "store-admin") {
      document.getElementById("view-store-admin").style.display = "block";
      renderStoreAdmin();
    } else if (currentView === "supplier") {
      document.getElementById("view-supplier").style.display = "block";
      renderSupplierAdmin();
    } else if (currentView === "directory") {
      document.getElementById("view-directory").style.display = "block";
      renderDirectory();
    }
  }

  function renderHudStoreSelect() {
    const hudSelect = document.getElementById("hud-store-select");
    if (!hudSelect) return;
    const stores = db.getStores();
    const currentId = db.getCurrentStoreId();

    hudSelect.innerHTML = stores.map(s => {
      return `<option value="${s.id}" ${s.id === currentId ? 'selected' : ''}>
        ${s.name} ${s.isSupplierStore ? '(Matriz)' : ''}
      </option>`;
    }).join("");
  }

  // =========================================================================
  // SISTEMA DE AUTH & LOGIN (CRM BASTION / CRM GHOST STYLE)
  // =========================================================================
  function setupAuthSystem() {
    const btnOpenAuth = document.getElementById("btn-open-auth-modal");
    if (btnOpenAuth) {
      btnOpenAuth.addEventListener("click", () => {
        openModal("modal-auth-login");
      });
    }

    // Accesos Rápidos Demo de 1 Clic
    const quickAuthBtns = document.querySelectorAll(".quick-auth-btn");
    quickAuthBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const storeId = btn.dataset.authId;
        const loggedStore = db.quickLogin(storeId);
        if (loggedStore) {
          closeModal("modal-auth-login");
          updateAuthHUD();
          
          if (loggedStore.isSupplierStore) {
            switchRoleTab("supplier");
          } else {
            switchRoleTab("store-admin");
          }
          showToast(`✅ Sesión iniciada como: ${loggedStore.name}`);
        }
      });
    });

    // Formulario Clásico de Login
    const formLogin = document.getElementById("form-auth-login");
    if (formLogin) {
      formLogin.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("auth-input-email").value;
        const pass = document.getElementById("auth-input-password").value;

        const res = db.login(email, pass);
        if (res.success) {
          closeModal("modal-auth-login");
          updateAuthHUD();
          if (res.store.isSupplierStore) {
            switchRoleTab("supplier");
          } else {
            switchRoleTab("store-admin");
          }
          showToast(`✅ Bienvenido, ${res.store.name}`);
        } else {
          alert(res.message);
        }
      });
    }
  }

  function updateAuthHUD() {
    const currentStore = db.getCurrentStore();
    const hudName = document.getElementById("hud-user-name");
    const hudRole = document.getElementById("hud-user-role");

    if (hudName) hudName.textContent = currentStore.name;
    if (hudRole) {
      if (currentStore.isSupplierStore) {
        hudRole.textContent = "SuperAdmin";
        hudRole.style.background = "rgba(227, 194, 116, 0.2)";
        hudRole.style.color = "var(--primary-gold)";
      } else {
        hudRole.textContent = currentStore.verifiedBadge || "Boutique";
        hudRole.style.background = "rgba(230, 25, 46, 0.2)";
        hudRole.style.color = "var(--primary-red)";
      }
    }
  }

  function switchRoleTab(roleView) {
    const session = db.getAuthSession();

    // Aislamiento estricto de vistas según rol:
    if (session.authenticated && session.role === "supplier") {
      if (roleView !== "supplier" && roleView !== "storefront") {
        roleView = "supplier";
      }
    } else if (session.authenticated && session.role === "store_owner") {
      if (roleView !== "store-admin" && roleView !== "storefront") {
        roleView = "store-admin";
      }
    }

    const tabs = document.querySelectorAll(".role-tab-btn");
    tabs.forEach(t => {
      if (t.dataset.view === roleView) {
        t.classList.add("active");
      } else {
        t.classList.remove("active");
      }
    });
    currentView = roleView;
    renderCurrentView();
  }

  // =========================================================================
  // PRIVACIDAD, SEGURIDAD & GESTIÓN DE BACKUPS
  // =========================================================================
  function setupPrivacyAndBackups() {
    const btnOpenPrivacy = document.getElementById("btn-open-privacy-modal");
    if (btnOpenPrivacy) {
      btnOpenPrivacy.addEventListener("click", () => {
        const store = db.getCurrentStore();
        document.getElementById("privacy-email").value = store.email || "";
        document.getElementById("privacy-current-pass").value = "";
        document.getElementById("privacy-new-pass").value = "";
        openModal("modal-privacy-settings");
      });
    }

    const formPrivacy = document.getElementById("form-privacy-settings");
    if (formPrivacy) {
      formPrivacy.addEventListener("submit", (e) => {
        e.preventDefault();
        const store = db.getCurrentStore();
        const email = document.getElementById("privacy-email").value;
        const currentPass = document.getElementById("privacy-current-pass").value;
        const newPass = document.getElementById("privacy-new-pass").value;

        const res = db.updateStoreSecurity(store.id, {
          email,
          currentPassword: currentPass,
          newPassword: newPass
        });

        if (res.success) {
          closeModal("modal-privacy-settings");
          showToast("🔒 Privacidad y credenciales actualizadas.");
          renderCurrentView();
        } else {
          alert(res.message);
        }
      });
    }

    // Exportar Respaldo Privado de la Tienda
    const btnExportStore = document.getElementById("btn-export-store-backup");
    if (btnExportStore) {
      btnExportStore.addEventListener("click", () => {
        const store = db.getCurrentStore();
        const backup = db.exportStoreBackup(store.id);
        downloadJSON(backup, `${store.name.toLowerCase().replace(/\s+/g, '_')}_backup.json`);
        showToast("💾 Copia de respaldo descargada en tu equipo.");
      });
    }

    // Exportar Master Backup SaaS (SuperAdmin)
    const btnExportSaaS = document.getElementById("btn-export-full-saas-backup");
    if (btnExportSaaS) {
      btnExportSaaS.addEventListener("click", () => {
        const fullBackup = db.exportSaaSFullBackup();
        downloadJSON(fullBackup, `bagsworld_mls_master_backup_${new Date().toISOString().slice(0, 10)}.json`);
        showToast("📦 Master Backup del SaaS exportado exitosamente.");
      });
    }
  }

  function downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // =========================================================================
  // VISTA 1: VITRINA PÚBLICA (STOREFRONT)
  // =========================================================================
  function renderStorefront() {
    const store = db.getCurrentStore();
    
    // Encabezado de tienda
    document.getElementById("storefront-name").innerHTML = `
      ${store.name} <span class="badge-verified">${store.verifiedBadge || 'CLIENTE VIP'}</span>
    `;
    document.getElementById("storefront-tagline").textContent = store.tagline || "";
    document.getElementById("storefront-location").textContent = store.neighborhood || "";

    const waBtn = document.getElementById("storefront-wa-direct");
    if (waBtn) {
      const cleanPhone = (store.phone || "573165558899").replace(/[^0-9]/g, "");
      waBtn.href = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`👋 ¡Hola ${store.name}! Quiero información sobre los bolsos disponibles para despacho inmediato.`)}`;
    }

    // Filtrar y ordenar productos
    const allProducts = db.getStorefrontProducts(store);
    let filtered = allProducts.filter(p => {
      // Filtro de marca/colección
      if (selectedCategory === "amor" && !p.name.toLowerCase().includes("amor y amistad")) return false;
      if (selectedCategory === "totes" && !p.category.includes("Totes")) return false;
      if (selectedCategory === "crossbody" && !p.category.includes("Crossbody")) return false;
      if (selectedCategory === "satchel" && !p.category.includes("Satchel")) return false;
      if (selectedCategory === "morrales" && !p.category.includes("Morrales")) return false;
      if (selectedCategory === "billeteras" && !p.category.includes("Billeteras")) return false;

      // Filtro de tamaño
      if (selectedSize === "compacto" && !p.sizeCategory.includes("Compacto")) return false;
      if (selectedSize === "mediano" && !p.sizeCategory.includes("Mediano")) return false;
      if (selectedSize === "maxi" && !p.sizeCategory.includes("Maxi")) return false;

      // Filtro de colorway
      if (selectedColor !== "all") {
        const hasColor = p.colorways && p.colorways.some(c => c.name.toLowerCase().includes(selectedColor));
        if (!hasColor) return false;
      }

      // Buscador
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchCat = p.category.toLowerCase().includes(q);
        const matchSku = p.sku.toLowerCase().includes(q);
        const matchDesc = p.description.toLowerCase().includes(q);
        const matchColor = p.colorways && p.colorways.some(c => c.name.toLowerCase().includes(q));
        if (!matchName && !matchCat && !matchSku && !matchDesc && !matchColor) return false;
      }

      return true;
    });

    // Ordenamiento
    if (currentSort === "price-asc") {
      filtered.sort((a, b) => a.storeRetailPrice - b.storeRetailPrice);
    } else if (currentSort === "price-desc") {
      filtered.sort((a, b) => b.storeRetailPrice - a.storeRetailPrice);
    } else if (currentSort === "name-asc") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Actualizar badge de contador
    const countBadge = document.getElementById("storefront-count-badge");
    if (countBadge) {
      countBadge.textContent = `${filtered.length} modelo(s) disponible(s)`;
    }

    // Renderizar tarjetas
    const grid = document.getElementById("storefront-products-grid");
    if (!grid) return;

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: var(--bg-surface); border-radius: var(--radius-lg); border: 1px dashed var(--border-subtle);">
          <div style="font-size: 38px; margin-bottom: 10px;">👜</div>
          <h3 style="font-size: 18px; color: #fff; font-weight: 800;">No se encontraron bolsos con estos filtros</h3>
          <p style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">Prueba limpiando la búsqueda o seleccionando otra categoría.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(prod => {
      const formattedPrice = db.formatCOP(prod.storeRetailPrice);
      const colorwaysCount = prod.colorways ? prod.colorways.length : 1;

      return `
        <article class="product-card" data-id="${prod.id}">
          <div class="product-image-box">
            <img src="${prod.image}" alt="${prod.name}" class="product-image" loading="lazy">
            ${(() => {
              const totalStock = db.getProductTotalStock(prod.id);
              const stockBadge = totalStock === 0
                ? '<span class="category-tag" style="background: rgba(239, 68, 68, 0.2); color: #f87171; border-color: rgba(239, 68, 68, 0.4);">🔴 Agotado</span>'
                : (totalStock <= 4
                    ? '<span class="category-tag" style="background: rgba(227, 194, 116, 0.2); color: var(--primary-gold); border-color: rgba(227, 194, 116, 0.4);">⚡ ¡Últimos ' + totalStock + '!</span>'
                    : '<span class="category-tag" style="background: rgba(16, 185, 129, 0.2); color: var(--accent-emerald); border-color: rgba(16, 185, 129, 0.4);">🟢 ' + totalStock + ' en stock</span>');
              const campaignPill = prod.campaignBadge ? '<span class="campaign-badge-pill" style="margin-left: 4px;">' + prod.campaignBadge + '</span>' : '';
              return '<div class="product-badges"><span class="category-tag">' + prod.category + '</span><span class="category-tag" style="background: rgba(230, 25, 46, 0.85); color: #fff; border-color: var(--primary-red);">🎨 ' + colorwaysCount + ' Colores</span>' + stockBadge + campaignPill + '</div>';
            })()}
          </div>
          <div class="product-body">
            <h3 class="product-name">${prod.name}</h3>
            <p class="product-desc">${prod.tagline || prod.description}</p>
            <div style="font-size: 11px; color: var(--primary-gold); margin-bottom: 12px; font-weight: 700;">
              📐 ${prod.dimensions || '18 x 22 x 8 cm'}
            </div>
            <div class="product-footer">
              <div class="price-box">
                <span class="price-label">Precio al Público</span>
                <span class="price-val">${formattedPrice}</span>
              </div>
              <button class="btn-card-wa btn-open-modal" data-id="${prod.id}">
                <span>Ver & Pedir</span> ➔
              </button>
            </div>
          </div>
        </article>
      `;
    }).join("");

    // Listeners para abrir modal
    grid.querySelectorAll(".btn-open-modal").forEach(btn => {
      btn.addEventListener("click", () => {
        const prodId = btn.dataset.id;
        openProductModal(prodId);
      });
    });
  }

  // =========================================================================
  // VISTA 2: PANEL DE CONTROL DE LA TIENDA / BOUTIQUE (STORE ADMIN)
  // =========================================================================
  function renderStoreAdmin() {
    const store = db.getCurrentStore();
    const adminTitle = document.getElementById("admin-store-title");
    if (adminTitle) adminTitle.textContent = `Panel de Control: ${store.name}`;

    const masterProducts = db.getMasterProducts();
    const storeProducts = store.products || [];

    let activeCount = 0;
    let totalMargin = 0;

    const tbody = document.getElementById("store-admin-products-table");
    if (!tbody) return;

    tbody.innerHTML = masterProducts.map(mp => {
      const sp = storeProducts.find(p => p.productId === mp.id);
      const isActive = sp ? sp.active : true;
      const customPrice = sp && sp.customPrice ? sp.customPrice : mp.suggestedRetailPrice;
      const margin = customPrice - mp.wholesalePrice;
      
      if (isActive) {
        activeCount++;
        totalMargin += margin;
      }

      return `
        <tr>
          <td>
            <div class="td-product-cell">
              <img src="${mp.image}" alt="${mp.name}" class="td-product-thumb">
              <div>
                <div class="td-product-name">${mp.name}</div>
                <div class="td-product-sku">SKU: ${mp.sku} · ${mp.category}</div>
              </div>
            </div>
          </td>
          <td style="font-weight: 700; color: var(--primary-gold);">${db.formatCOP(mp.wholesalePrice)}</td>
          <td>
            <input type="number" class="table-input-price store-price-input" data-id="${mp.id}" value="${customPrice}" step="1000">
          </td>
          <td>
            <span class="margin-badge ${margin >= 45000 ? 'margin-high' : 'margin-normal'}">
              +${db.formatCOP(margin)}
            </span>
          </td>
          <td>
            <button type="button" class="btn-action-sm btn-open-stock-modal" data-prod-id="${mp.id}" style="font-size: 11px; padding: 4px 8px; font-weight: 800; color: #15803d; background: #f0fdf4; border-color: #86efac; border-radius: 6px; white-space: nowrap; cursor: pointer;">
              📊 ${db.getProductTotalStock(mp.id)} bolsos
            </button>
          </td>
          <td style="font-size: 11px; color: var(--text-muted);">${mp.dimensions || 'Estándar'}</td>
          <td>
            <label class="switch-toggle">
              <input type="checkbox" class="store-toggle-active" data-id="${mp.id}" ${isActive ? 'checked' : ''}>
              <span class="slider-round"></span>
            </label>
          </td>
          <td>
            <button class="btn-action-sm btn-open-restock" data-id="${mp.id}">
              📦 Pedir Reposición
            </button>
          </td>
        </tr>
      `;
    }).join("");

    // Actualizar métricas
    document.getElementById("stat-active-prods").textContent = activeCount;
    const avgMargin = activeCount > 0 ? Math.round(totalMargin / activeCount) : 0;
    document.getElementById("stat-avg-margin").textContent = db.formatCOP(avgMargin);
    document.getElementById("stat-phone-preview").textContent = store.phone ? `+${store.phone}` : "No configurado";

    // Botón Guardar Todos los Precios de Boutique
    const btnSaveStorePrices = document.getElementById("btn-save-store-prices");
    if (btnSaveStorePrices) {
      btnSaveStorePrices.onclick = () => {
        tbody.querySelectorAll(".store-price-input").forEach(input => {
          const prodId = input.dataset.id;
          const newPrice = parseInt(input.value, 10);
          db.updateStorePrice(store.id, prodId, newPrice);
        });
        showToast("✅ Precios de venta guardados correctamente para tu boutique.");
        renderStoreAdmin();
      };
    }

    // Listeners de cambio de precio
    tbody.querySelectorAll(".store-price-input").forEach(input => {
      input.addEventListener("change", (e) => {
        const prodId = e.target.dataset.id;
        const newPrice = parseInt(e.target.value, 10);
        db.updateStorePrice(store.id, prodId, newPrice);
        showToast("Precio de venta actualizado");
        renderStoreAdmin();
      });
    });

    // Listeners de toggle activo
    tbody.querySelectorAll(".store-toggle-active").forEach(toggle => {
      toggle.addEventListener("change", (e) => {
        const prodId = e.target.dataset.id;
        db.toggleProductActive(store.id, prodId);
        showToast("Estado en vitrina actualizado");
        renderStoreAdmin();
      });
    });

    // Listeners para reposición
    tbody.querySelectorAll(".btn-open-restock").forEach(btn => {
      btn.addEventListener("click", () => {
        const prodId = btn.dataset.id;
        openRestockModal(prodId);
      });
    });
  }

  // =========================================================================
  // VISTA 3: PANEL DEL PROVEEDOR / SUPERADMIN BODEGA (BAGS WORLD MATRIZ)
  // =========================================================================
  function renderSupplierAdmin() {
    const session = db.getAuthSession();
    const crmCard = document.getElementById("saas-admin-crm-card");
    if (crmCard) {
      crmCard.style.display = session.role === "super_admin" ? "block" : "none";
    }

    const masterProducts = db.getMasterProducts();
    const stores = db.getStores();

    document.getElementById("supplier-stat-refs").textContent = masterProducts.length;
    document.getElementById("supplier-stat-stores").textContent = stores.filter(s => !s.isSupplierStore).length;

    // Renderizar tabla de clientes (BolsosCOL & Calibolsos 2026) con soporte y recuperación de contraseña
    renderSaasAdminClientsTable();

    const tbody = document.getElementById("supplier-products-table");
    if (!tbody) return;

    tbody.innerHTML = masterProducts.map(mp => {
      const campaign = mp.campaignBadge || "";
      const isActive = mp.active !== false;
      return `
        <tr>
          <td>
            <div class="td-product-cell">
              <img src="${mp.image}" alt="${mp.name}" class="td-product-thumb">
              <div>
                <div class="td-product-name" style="font-weight: 800;">${mp.name}</div>
                <div class="td-product-sku" style="font-size: 10px; color: var(--text-muted); font-family: monospace;">SKU: ${mp.sku}</div>
              </div>
            </div>
          </td>
          <td><span class="category-tag">${mp.category}</span></td>
          <td>
            <div style="display: flex; align-items: center; gap: 4px;">
              <span style="font-size: 11px; color: var(--text-muted);">$</span>
              <input type="number" class="form-input supplier-wholesale-input" data-prod-id="${mp.id}" value="${mp.wholesalePrice}" style="width: 100px; padding: 4px 6px; font-weight: 700; font-size: 12px;" step="1000">
            </div>
          </td>
          <td>
            <div style="display: flex; align-items: center; gap: 4px;">
              <span style="font-size: 11px; color: var(--text-muted);">$</span>
              <input type="number" class="form-input supplier-retail-input" data-prod-id="${mp.id}" value="${mp.suggestedRetailPrice}" style="width: 100px; padding: 4px 6px; font-weight: 800; color: var(--primary-gold); font-size: 12px;" step="1000">
            </div>
          </td>
          <td>
            <select class="form-select supplier-campaign-select" data-prod-id="${mp.id}" style="font-size: 11px; padding: 4px 8px; font-weight: 700; max-width: 140px;">
              <option value="" ${campaign === "" ? "selected" : ""}>Precio Regular</option>
              <option value="🔥 Promo Amor y Amistad" ${campaign.includes("Amor") || campaign.includes("Promo") ? "selected" : ""}>🔥 Promo Amor y Amistad</option>
              <option value="⚡ Liquidación Lotes" ${campaign.includes("Liquidación") ? "selected" : ""}>⚡ Liquidación Lotes</option>
              <option value="🌟 Nuevo Drop 2026" ${campaign.includes("Drop") ? "selected" : ""}>🌟 Nuevo Drop 2026</option>
              <option value="👑 Más Vendido" ${campaign.includes("Vendido") ? "selected" : ""}>👑 Más Vendido</option>
            </select>
          </td>
          <td>
            <button type="button" class="btn-action-sm btn-open-stock-modal" data-prod-id="${mp.id}" style="font-size: 11px; padding: 4px 8px; font-weight: 800; color: #15803d; background: #f0fdf4; border-color: #86efac; border-radius: 6px; white-space: nowrap; cursor: pointer;" title="Ver y Editar Stock por Colorway">
              📊 ${db.getProductTotalStock(mp.id)} bolsos
            </button>
          </td>
          <td>
            <span class="category-tag" style="background: rgba(56, 189, 248, 0.15); color: var(--accent-blue); border-color: rgba(56, 189, 248, 0.3);">
              🎨 ${(mp.colorways || []).length} Colores
            </span>
          </td>
          <td>
            <button type="button" class="btn-action-sm btn-toggle-master-active" data-prod-id="${mp.id}" data-prod-name="${mp.name}" style="font-size: 11px; padding: 5px 9px; font-weight: 800; border-radius: 6px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; ${isActive ? 'color: #15803d; background: #f0fdf4; border: 1px solid #86efac;' : 'color: #b45309; background: #fffbeb; border: 1px solid #fcd34d;'}" title="${isActive ? 'Referencia Habilitada. Clic para Pausar' : 'Referencia Inactiva. Clic para Habilitar'}">
              <span>${isActive ? '🟢 Habilitada' : '⏸️ Inactiva'}</span>
            </button>
          </td>
          <td>
            <div style="display: flex; gap: 6px;">
              <button type="button" class="btn-action-sm btn-save-single-master" data-prod-id="${mp.id}" style="font-size: 11px; padding: 5px 8px; font-weight: 700; color: #16a34a; border-color: #86efac; background: #f0fdf4;" title="Guardar Cambios Rápidos">
                💾 Guardar
              </button>
              <button type="button" class="btn-action-sm btn-edit-master-modal" data-prod-id="${mp.id}" style="font-size: 11px; padding: 5px 8px; font-weight: 700;" title="Editar Ficha Completa">
                ✏️
              </button>
              <button type="button" class="btn-action-sm btn-delete-master-prod" data-prod-id="${mp.id}" data-prod-name="${mp.name}" style="font-size: 11px; padding: 5px 8px; font-weight: 700; color: #f87171; border-color: rgba(239,68,68,0.3); background: rgba(239,68,68,0.1); cursor: pointer;" title="Eliminar Referencia">
                🗑️
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join("");

    // Guardar Individual
    tbody.querySelectorAll(".btn-save-single-master").forEach(btn => {
      btn.onclick = () => {
        const prodId = btn.dataset.prodId;
        const wholesale = Number(tbody.querySelector(`.supplier-wholesale-input[data-prod-id="${prodId}"]`)?.value) || 68000;
        const retail = Number(tbody.querySelector(`.supplier-retail-input[data-prod-id="${prodId}"]`)?.value) || 125000;
        const campaign = tbody.querySelector(`.supplier-campaign-select[data-prod-id="${prodId}"]`)?.value || "";

        db.updateMasterProduct(prodId, {
          wholesalePrice: wholesale,
          suggestedRetailPrice: retail,
          campaignBadge: campaign
        });

        showToast("✅ Referencia actualizada en tiempo real.");
      };
    });

    // Botón Guardar Todos los Precios en Lote
    const btnSaveAll = document.getElementById("btn-save-all-supplier-prices");
    if (btnSaveAll) {
      btnSaveAll.onclick = () => {
        const rows = tbody.querySelectorAll("tr");
        rows.forEach(tr => {
          const wholesaleInput = tr.querySelector(".supplier-wholesale-input");
          const retailInput = tr.querySelector(".supplier-retail-input");
          const campaignSelect = tr.querySelector(".supplier-campaign-select");

          if (wholesaleInput && retailInput) {
            const prodId = wholesaleInput.dataset.prodId;
            db.updateMasterProduct(prodId, {
              wholesalePrice: Number(wholesaleInput.value),
              suggestedRetailPrice: Number(retailInput.value),
              campaignBadge: campaignSelect?.value || ""
            });
          }
        });
        showToast("✅ Todos los precios y campañas guardados para la red BAGS WORLD.");
      };
    }

    // Toggle Habilitada / Inactiva
    tbody.querySelectorAll(".btn-toggle-master-active").forEach(btn => {
      btn.onclick = () => {
        const prodId = btn.dataset.prodId;
        const prodName = btn.dataset.prodName || "esta referencia";
        const newActiveState = db.toggleMasterProductActive(prodId);
        renderSupplierAdmin();
        if (newActiveState) {
          showToast(`🟢 Referencia "${prodName}" habilitada. Visible nuevamente en vitrinas.`);
        } else {
          showToast(`⏸️ Referencia "${prodName}" inhabilitada. Pausada en vitrinas por stock agotado.`);
        }
      };
    });

    // Eliminar Referencia de Bodega
    tbody.querySelectorAll(".btn-delete-master-prod").forEach(btn => {
      btn.onclick = () => {
        const prodId = btn.dataset.prodId;
        const prodName = btn.dataset.prodName || "esta referencia";
        if (confirm(`¿Estás seguro de eliminar permanentemente la referencia "${prodName}" de la bodega central?`)) {
          db.deleteMasterProduct(prodId);
          renderSupplierAdmin();
          showToast(`🗑️ Referencia "${prodName}" eliminada de bodega.`);
        }
      };
    });

    // Editar Ficha Completa en Modal
    tbody.querySelectorAll(".btn-edit-master-modal").forEach(btn => {
      btn.onclick = () => {
        const prodId = btn.dataset.prodId;
        const prod = db.getMasterProducts().find(p => p.id === prodId);
        if (!prod) return;

        document.getElementById("new-prod-id").value = prod.id;
        document.getElementById("new-prod-name").value = prod.name;
        document.getElementById("new-prod-sku").value = prod.sku;
        document.getElementById("new-prod-category").value = prod.category;
        document.getElementById("new-prod-image").value = prod.image;
        document.getElementById("new-prod-wholesale").value = prod.wholesalePrice;
        document.getElementById("new-prod-suggested").value = prod.suggestedRetailPrice;
        document.getElementById("new-prod-dim").value = prod.dimensions || "";
        document.getElementById("new-prod-desc").value = prod.description || "";
        
        const statusSelect = document.getElementById("new-prod-status");
        if (statusSelect) statusSelect.value = prod.active === false ? "inactive" : "active";
        
        const campaignSelect = document.getElementById("new-prod-campaign");
        if (campaignSelect) campaignSelect.value = prod.campaignBadge || "";

        const deleteBtnModal = document.getElementById("btn-delete-from-modal");
        if (deleteBtnModal) {
          deleteBtnModal.style.display = "inline-flex";
          deleteBtnModal.onclick = () => {
            if (confirm(`¿Eliminar permanentemente "${prod.name}"?`)) {
              db.deleteMasterProduct(prod.id);
              closeModal("modal-new-product");
              renderSupplierAdmin();
              showToast(`🗑️ Referencia "${prod.name}" eliminada.`);
            }
          };
        }

        const submitBtn = document.getElementById("btn-submit-master-form");
        if (submitBtn) submitBtn.textContent = "💾 Guardar Cambios de la Referencia";

        openModal("modal-new-product");
      };
    });

    // Renderizar Tabla de Pedidos B2B Entrantes
    renderSupplierOrdersTable();
  }

  
  function renderSupplierOrdersTable() {
    const ordersTbody = document.getElementById("supplier-orders-table");
    if (!ordersTbody) return;
    const orders = db.getOrders();

    ordersTbody.innerHTML = orders.map(ord => {
      return `
        <tr>
          <td style="font-family: monospace; font-weight: 700; color: var(--primary-gold);">#${ord.id}</td>
          <td>${ord.date}</td>
          <td style="font-weight: 700; color: #fff;">${ord.storeName}</td>
          <td>
            <div style="font-weight: 700; font-size: 12px; color: #fff;">${ord.productName}</div>
            <div style="font-size: 10px; color: var(--text-muted);">${ord.colorway || 'Estándar'}</div>
          </td>
          <td style="font-weight: 800; text-align: center;">${ord.units} bolsos</td>
          <td style="font-weight: 800; color: var(--primary-gold);">${db.formatCOP(ord.totalWholesale)}</td>
          <td>
            <select class="form-select order-status-select" data-order-id="${ord.id}" style="font-size: 11px; padding: 4px 6px; font-weight: 700; border-radius: 6px; ${ord.status === 'Entregado y Cobrado' ? 'background: rgba(16, 185, 129, 0.15); color: #4ade80; border-color: rgba(16, 185, 129, 0.4);' : ''}">
              <option value="En Alistamiento" ${ord.status === 'En Alistamiento' ? 'selected' : ''}>📦 En Alistamiento</option>
              <option value="Despachado en Coordinadora" ${ord.status.includes('Despachado') ? 'selected' : ''}>🛵 Despachado en Coordinadora/Moto</option>
              <option value="Entregado y Cobrado" ${ord.status === 'Entregado y Cobrado' ? 'selected' : ''}>✅ Entregado y Cobrado</option>
              <option value="Cancelado" ${ord.status === 'Cancelado' ? 'selected' : ''}>❌ Cancelado</option>
            </select>
          </td>
          <td>
            <button type="button" class="btn-action-sm btn-open-exchange-modal" data-order-id="${ord.id}" style="font-size: 11px; padding: 4px 8px; font-weight: 700; color: #f59e0b; background: rgba(245, 158, 11, 0.1); border-color: rgba(245, 158, 11, 0.3); border-radius: 6px; cursor: pointer; white-space: nowrap;" title="Gestionar Cambio de Color, Garantía o Retorno">
              🔄 Cambio / Retorno
            </button>
          </td>
        </tr>
      `;
    }).join("");

    ordersTbody.querySelectorAll(".order-status-select").forEach(sel => {
      sel.addEventListener("change", () => {
        const ordId = sel.dataset.orderId;
        const newStatus = sel.value;
        db.updateOrderStatus(ordId, newStatus);
        showToast(`⚡ Pedido #${ordId} actualizado a: ${newStatus}`);
        renderSupplierAdmin();
      });
    });

    const btnQuickExport = document.querySelector(".btn-quick-export-orders");
    if (btnQuickExport) {
      btnQuickExport.onclick = () => {
        exportOrdersToCSV(db.getOrders(), "Historico_Completo");
      };
    }
  }

  function renderSaasAdminClientsTable() {
    const tbody = document.getElementById("saas-admin-clients-table");
    if (!tbody) return;

    const clientStores = db.getStores().filter(s => !s.isSupplierStore);

    tbody.innerHTML = clientStores.map(store => {
      return `
        <tr>
          <td>
            <div style="font-weight: 800; color: #fff; font-size: 14px;">${store.name}</div>
            <div style="font-size: 10px; color: var(--primary-gold);">${store.verifiedBadge || 'CLIENTE VIP'}</div>
          </td>
          <td style="font-family: monospace; color: var(--accent-blue); font-size: 12px;">${store.email || 'No registrado'}</td>
          <td>
            <div style="display: flex; align-items: center; gap: 6px;">
              <code style="background: rgba(0,0,0,0.5); padding: 2px 8px; border-radius: 4px; color: #fff; font-size: 11px;">${store.password || 'Bolsos2026*'}</code>
            </div>
          </td>
          <td style="color: #25d366; font-size: 12px; font-weight: 700;">+${store.phone}</td>
          <td style="font-size: 11px; color: var(--text-muted);">${store.neighborhood}</td>
          <td>
            <div style="display: flex; gap: 6px; flex-wrap: wrap;">
              <button class="btn-action-sm btn-admin-impersonate" data-store-id="${store.id}" style="background: rgba(230, 25, 46, 0.15); color: var(--primary-red); border-color: var(--primary-red);">
                🚀 Entrar a su Panel
              </button>
              <button class="btn-action-sm btn-admin-reset-pass" data-store-id="${store.id}">
                🔑 Resetear Clave
              </button>
              <button class="btn-action-sm btn-admin-backup-store" data-store-id="${store.id}">
                💾 Backup
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join("");

    // Impersonar tienda
    tbody.querySelectorAll(".btn-admin-impersonate").forEach(btn => {
      btn.addEventListener("click", () => {
        const sId = btn.dataset.storeId;
        db.quickLogin(sId);
        updateAuthHUD();
        switchRoleTab("store-admin");
        showToast(`🚀 Sesión cambiada a panel de: ${db.getCurrentStore().name}`);
      });
    });

    // Resetear contraseña por el Admin SaaS
    tbody.querySelectorAll(".btn-admin-reset-pass").forEach(btn => {
      btn.addEventListener("click", () => {
        const sId = btn.dataset.storeId;
        const newPass = prompt("Ingresa la nueva contraseña para este cliente:", "Bolsos2026*");
        if (newPass) {
          db.resetStorePasswordByAdmin(sId, newPass);
          showToast(`🔑 Contraseña actualizada para el cliente.`);
          renderSaasAdminClientsTable();
        }
      });
    });

    // Exportar backup de tienda individual
    tbody.querySelectorAll(".btn-admin-backup-store").forEach(btn => {
      btn.addEventListener("click", () => {
        const sId = btn.dataset.storeId;
        const backup = db.exportStoreBackup(sId);
        downloadJSON(backup, `tienda_${sId}_backup.json`);
        showToast("💾 Respaldo de tienda descargado.");
      });
    });
  }

  // =========================================================================
  // VISTA 4: DIRECTORIO DE TIENDAS & CALCULADORA ROI
  // =========================================================================
  function renderDirectory() {
    let stores = db.getStores();
    const grid = document.getElementById("directory-stores-grid");
    if (!grid) return;

    // Filtro por Rol
    if (directoryRoleFilter === "supplier") {
      stores = stores.filter(s => s.isSupplierStore);
    } else if (directoryRoleFilter === "partner") {
      stores = stores.filter(s => !s.isSupplierStore);
    }

    // Filtro por Búsqueda
    if (directorySearchQuery && directorySearchQuery.trim() !== "") {
      const q = directorySearchQuery.toLowerCase();
      stores = stores.filter(s => 
        s.name.toLowerCase().includes(q) || 
        (s.neighborhood && s.neighborhood.toLowerCase().includes(q)) ||
        (s.tagline && s.tagline.toLowerCase().includes(q))
      );
    }

    if (stores.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; background: var(--bg-surface); border-radius: var(--radius-md); border: 1px dashed var(--border-subtle);">
          <div style="font-size: 28px; margin-bottom: 6px;">📍</div>
          <div style="color: var(--text-secondary); font-size: 13px;">No se encontraron entidades que coincidan con la búsqueda.</div>
        </div>
      `;
      return;
    }

    grid.innerHTML = stores.map(s => {
      return `
        <div class="store-directory-card" style="position: relative;">
          <div class="corner-tag ${s.isSupplierStore ? 'corner-tag-supplier' : 'corner-tag-partner'}">
            ${s.isSupplierStore ? '🏢 BODEGA MATRIZ' : '🏪 BOUTIQUE PARTNER'}
          </div>
          <div class="store-card-header">
            <div class="store-card-avatar">${s.isSupplierStore ? '👑' : '👜'}</div>
            <div>
              <div class="store-card-title">${s.name}</div>
              <div class="store-card-location">📍 ${s.neighborhood}</div>
            </div>
          </div>
          <p class="store-card-body">${s.tagline}</p>
          <div style="display: flex; gap: 8px; margin-top: auto;">
            <button class="btn-action-sm btn-view-directory-store" data-id="${s.id}" style="flex: 1; text-align: center;">
              Ver Vitrina →
            </button>
          </div>
        </div>
      `;
    }).join("");

    grid.querySelectorAll(".btn-view-directory-store").forEach(btn => {
      btn.addEventListener("click", () => {
        db.setCurrentStoreId(btn.dataset.id);
        updateAuthHUD();
        setupHeadersAndRoleIsolation();
        switchRoleTab("storefront");
      });
    });
  }

  function setupDirectoryFilters() {
    const filterButtons = document.querySelectorAll(".btn-filter-role");
    filterButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        filterButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        directoryRoleFilter = btn.dataset.filter;
        renderDirectory();
      });
    });

    const searchInput = document.getElementById("dir-search-input");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        directorySearchQuery = e.target.value.trim();
        renderDirectory();
      });
    }
  }

  function setupROISimulator() {
    const resellersSlider = document.getElementById("roi-resellers-slider");
    const pairsSlider = document.getElementById("roi-pairs-slider");
    const resellersVal = document.getElementById("roi-resellers-val");
    const pairsVal = document.getElementById("roi-pairs-val");
    const profitDisplay = document.getElementById("roi-profit-display");

    function calculateRoi() {
      if (!resellersSlider || !pairsSlider) return;
      const resellers = parseInt(resellersSlider.value, 10) || 25;
      const pairs = parseInt(pairsSlider.value, 10) || 120;
      if (resellersVal) resellersVal.textContent = `${resellers} tiendas`;
      if (pairsVal) pairsVal.textContent = `${pairs} bolsos`;

      // Ganancia Bodega: $25.000 COP margen mayorista por bolso + $150.000 COP mensualidad SaaS
      const pairProfits = resellers * pairs * 25000;
      const saasProfits = resellers * 150000;
      const totalMonthly = pairProfits + saasProfits;

      if (profitDisplay) {
        profitDisplay.textContent = db.formatCOP(totalMonthly) + " COP";
      }
    }

    if (resellersSlider && pairsSlider) {
      resellersSlider.addEventListener("input", calculateRoi);
      pairsSlider.addEventListener("input", calculateRoi);
      calculateRoi();
    }
  }

  // =========================================================================
  // MODAL DE DETALLE DE PRODUCTO & COLORWAY SELECTOR
  // =========================================================================
  function setupProductModal() {
    // Cerrar modales con botones .btn-close-modal
    document.querySelectorAll(".btn-close-modal").forEach(btn => {
      btn.addEventListener("click", () => {
        const modalId = btn.dataset.close;
        if (modalId) closeModal(modalId);
      });
    });

    // Cerrar al hacer clic en el backdrop
    document.querySelectorAll(".modal-backdrop").forEach(backdrop => {
      backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop) {
          backdrop.classList.remove("open");
        }
      });
    });

    // Control de cantidad en modal
    const qtyMinus = document.getElementById("modal-qty-minus");
    const qtyPlus = document.getElementById("modal-qty-plus");
    const qtyVal = document.getElementById("modal-qty-val");

    if (qtyMinus && qtyPlus && qtyVal) {
      qtyMinus.addEventListener("click", () => {
        if (activeModalQuantity > 1) {
          activeModalQuantity--;
          qtyVal.textContent = activeModalQuantity;
        }
      });
      qtyPlus.addEventListener("click", () => {
        activeModalQuantity++;
        qtyVal.textContent = activeModalQuantity;
      });
    }

    // Botón Agregar al Carrito
    const btnAddCart = document.getElementById("modal-btn-add-cart");
    if (btnAddCart) {
      btnAddCart.addEventListener("click", () => {
        if (!activeModalProduct) return;
        addToCart(activeModalProduct, activeModalColorway, activeModalQuantity);
        closeModal("modal-product-detail");
        openCartDrawer();
      });
    }
  }

  function openProductModal(prodId) {
    const store = db.getCurrentStore();
    const products = db.getStorefrontProducts(store);
    const prod = products.find(p => p.id === prodId) || db.getMasterProductById(prodId);
    if (!prod) return;

    activeModalProduct = prod;
    activeModalQuantity = 1;
    document.getElementById("modal-qty-val").textContent = "1";

    activeModalColorway = (prod.colorways && prod.colorways.length > 0) ? prod.colorways[0] : { name: "Color Original", image: prod.image };

    document.getElementById("modal-prod-title").textContent = prod.name;
    document.getElementById("modal-prod-name").textContent = prod.name;
    document.getElementById("modal-prod-sku").textContent = `SKU: ${prod.sku}`;
    document.getElementById("modal-prod-cat").textContent = prod.category;
    document.getElementById("modal-prod-desc").textContent = prod.description || prod.tagline;
    document.getElementById("modal-prod-dim").textContent = prod.dimensions || "18 cm (Alto) x 22 cm (Ancho) x 8 cm (Prof.)";
    document.getElementById("modal-prod-price").textContent = `${db.formatCOP(prod.storeRetailPrice)} COP`;
    document.getElementById("modal-prod-img").src = activeModalColorway.image || prod.image;

    // Renderizar chips de colorways
    const colorContainer = document.getElementById("modal-colorway-selector");
    if (colorContainer) {
      const colorways = prod.colorways || [{ name: "Tono Original", image: prod.image }];
      colorContainer.innerHTML = colorways.map((cw, idx) => {
        return `
          <button type="button" class="colorway-badge-chip ${idx === 0 ? 'active' : ''}" data-index="${idx}">
            <span class="colorway-dot"></span>
            <span>${cw.name}</span>
          </button>
        `;
      }).join("");

      colorContainer.querySelectorAll(".colorway-badge-chip").forEach(chip => {
        chip.addEventListener("click", () => {
          colorContainer.querySelectorAll(".colorway-badge-chip").forEach(c => c.classList.remove("active"));
          chip.classList.add("active");
          const idx = parseInt(chip.dataset.index, 10);
          activeModalColorway = colorways[idx];
          if (activeModalColorway.image) {
            document.getElementById("modal-prod-img").src = activeModalColorway.image;
          }
          updateSingleWhatsAppButton();
        });
      });
    }

    updateSingleWhatsAppButton();
    openModal("modal-product-detail");
  }

  function updateSingleWhatsAppButton() {
    const waBtn = document.getElementById("modal-btn-wa-order");
    const btnAddCart = document.getElementById("modal-btn-add-cart");
    if (!activeModalProduct || !activeModalColorway) return;

    const stock = db.getProductStock(activeModalProduct.id, activeModalColorway.name);
    const store = db.getCurrentStore();

    if (stock <= 0) {
      if (waBtn) {
        waBtn.style.opacity = "0.5";
        waBtn.style.pointerEvents = "none";
        waBtn.innerHTML = "<span>🔴 Tono Agotado en Bodega</span>";
      }
      if (btnAddCart) {
        btnAddCart.disabled = true;
        btnAddCart.textContent = "Agotado";
        btnAddCart.style.opacity = "0.5";
      }
    } else {
      if (waBtn) {
        waBtn.style.opacity = "1";
        waBtn.style.pointerEvents = "auto";
        waBtn.innerHTML = "<span>Pedir " + activeModalColorway.name + " por WhatsApp</span> ➔";
        waBtn.href = db.buildSingleProductWhatsAppUrl(store, activeModalProduct, activeModalColorway);
        waBtn.onclick = () => {
          db.decrementStock(activeModalProduct.id, activeModalColorway.name, activeModalQuantity || 1);
          renderStorefront();
        };
      }
      if (btnAddCart) {
        btnAddCart.disabled = false;
        btnAddCart.textContent = "Agregar al Pedido";
        btnAddCart.style.opacity = "1";
      }
    }
  }

  // =========================================================================
  // CARRITO MULTI-ITEM & CHECKOUT CONSOLIDADO
  // =========================================================================
  function setupCartDrawer() {
    const floatingBar = document.getElementById("floating-cart-bar");
    if (floatingBar) {
      floatingBar.addEventListener("click", openCartDrawer);
    }

    // Selector de Zonas de Envío
    const zoneSelect = document.getElementById("cart-neighborhood-select");
    if (zoneSelect) {
      zoneSelect.innerHTML = COLOMBIAN_SHIPPING_ZONES.map((z, idx) => {
        return `<option value="${idx}">${z.name} - ${db.formatCOP(z.fee)} (${z.time})</option>`;
      }).join("");

      zoneSelect.addEventListener("change", (e) => {
        cartSelectedZone = COLOMBIAN_SHIPPING_ZONES[parseInt(e.target.value, 10)];
        renderCartDrawer();
      });
    }

    // Modalidad de despacho
    const radioSecured = document.querySelector('input[name="cart-dispatch-mode"][value="secured"]');
    const radioCOD = document.querySelector('input[name="cart-dispatch-mode"][value="cod"]');
    const labelSecured = document.getElementById("label-dispatch-secured");
    const labelCOD = document.getElementById("label-dispatch-cod");

    if (radioSecured && radioCOD) {
      radioSecured.addEventListener("change", () => {
        cartDispatchMode = "secured";
        labelSecured.classList.add("selected");
        labelCOD.classList.remove("selected");
      });
      radioCOD.addEventListener("change", () => {
        cartDispatchMode = "cod";
        labelCOD.classList.add("selected");
        labelSecured.classList.remove("selected");
      });
    }

    // Botón Enviar Pedido por WhatsApp
    const btnSendWhatsApp = document.getElementById("cart-btn-send-whatsapp");
    if (btnSendWhatsApp) {
      btnSendWhatsApp.addEventListener("click", () => {
        if (cartItems.length === 0) {
          alert("Tu pedido está vacío. Agrega al menos un bolso.");
          return;
        }

        const name = document.getElementById("cart-client-name").value.trim();
        const phone = document.getElementById("cart-client-phone").value.trim();
        const address = document.getElementById("cart-client-address").value.trim();

        if (!name || !phone || !address) {
          alert("Por favor completa tu Nombre, WhatsApp y Dirección para liquidar el envío.");
          return;
        }

        const store = db.getCurrentStore();
        const customerData = { name, phone, address };
        const waUrl = db.buildConsolidatedCartWhatsAppUrl(store, cartItems, customerData, cartSelectedZone, cartDispatchMode);

        cartItems.forEach(item => {
          db.decrementStock(item.productId, item.colorway, item.quantity);
        });
        renderStorefront();
        window.open(waUrl, "_blank");
        showToast("Pedido consolidado enviado a WhatsApp.");
      });
    }
  }

  function addToCart(product, colorway, quantity) {
    const colorName = colorway ? colorway.name : "Color Original";
    const existingIndex = cartItems.findIndex(i => i.productId === product.id && i.colorway === colorName);

    if (existingIndex > -1) {
      cartItems[existingIndex].quantity += quantity;
    } else {
      cartItems.push({
        productId: product.id,
        name: product.name,
        colorway: colorName,
        image: colorway && colorway.image ? colorway.image : product.image,
        price: product.storeRetailPrice,
        quantity: quantity
      });
    }

    saveCartToStorage();
    updateFloatingCartBar();
    showToast(`🛍️ ${quantity} bolso(s) agregado(s) a tu pedido.`);
  }

  function removeFromCart(index) {
    cartItems.splice(index, 1);
    saveCartToStorage();
    updateFloatingCartBar();
    renderCartDrawer();
  }

  function openCartDrawer() {
    renderCartDrawer();
    openModal("modal-cart-drawer");
  }

  function renderCartDrawer() {
    const container = document.getElementById("cart-drawer-items");
    const countLabel = document.getElementById("cart-drawer-count");
    if (!container) return;

    const totalCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);
    if (countLabel) countLabel.textContent = totalCount;

    if (cartItems.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 30px; color: var(--text-muted);">
          <div style="font-size: 32px; margin-bottom: 6px;">🛍️</div>
          <div>No tienes bolsos en tu pedido todavía.</div>
        </div>
      `;
    } else {
      container.innerHTML = cartItems.map((item, idx) => {
        return `
          <div class="cart-item-row">
            <img src="${item.image}" alt="${item.name}" class="cart-item-thumb">
            <div class="cart-item-info">
              <div class="cart-item-title">${item.name}</div>
              <div class="cart-item-meta">Color: ${item.colorway} · Cant: ${item.quantity} und</div>
              <div class="cart-item-price">${db.formatCOP(item.price * item.quantity)}</div>
            </div>
            <button type="button" class="cart-item-remove btn-remove-item" data-index="${idx}" title="Eliminar">&times;</button>
          </div>
        `;
      }).join("");

      container.querySelectorAll(".btn-remove-item").forEach(btn => {
        btn.addEventListener("click", () => {
          removeFromCart(parseInt(btn.dataset.index, 10));
        });
      });
    }

    // Liquidación
    const subtotal = cartItems.reduce((acc, i) => acc + (i.price * i.quantity), 0);
    const shipping = cartSelectedZone ? cartSelectedZone.fee : 12000;
    const total = subtotal + shipping;

    document.getElementById("cart-summary-qty").textContent = totalCount;
    document.getElementById("cart-summary-bags").textContent = `${db.formatCOP(subtotal)} COP`;
    document.getElementById("cart-summary-shipping").textContent = `${db.formatCOP(shipping)} COP`;
    document.getElementById("cart-summary-total").textContent = `${db.formatCOP(total)} COP`;
    const fletePreview = document.getElementById("cart-flete-preview");
    if (fletePreview) fletePreview.textContent = `${db.formatCOP(shipping)} COP`;
  }

  function updateFloatingCartBar() {
    const floatingBar = document.getElementById("floating-cart-bar");
    if (!floatingBar) return;

    const totalCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);
    const subtotal = cartItems.reduce((acc, i) => acc + (i.price * i.quantity), 0);

    if (totalCount > 0) {
      floatingBar.classList.add("visible");
      document.getElementById("floating-cart-count").textContent = totalCount;
      document.getElementById("floating-cart-total").textContent = db.formatCOP(subtotal);
    } else {
      floatingBar.classList.remove("visible");
    }
  }

  function saveCartToStorage() {
    localStorage.setItem(DB_KEYS.CART_ITEMS, JSON.stringify(cartItems));
  }

  function loadCartFromStorage() {
    try {
      const raw = localStorage.getItem(DB_KEYS.CART_ITEMS);
      cartItems = raw ? JSON.parse(raw) : [];
    } catch (e) {
      cartItems = [];
    }
  }

  function startReservationTimer() {
    let timeLeft = 20 * 60; // 20 minutos
    const countdownEl = document.getElementById("cart-timer-countdown");

    setInterval(() => {
      if (timeLeft > 0) {
        timeLeft--;
        const mins = Math.floor(timeLeft / 60);
        const secs = timeLeft % 60;
        if (countdownEl) {
          countdownEl.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
      }
    }, 1000);
  }

  // =========================================================================
  // GESTIÓN DE MODALES DE CONFIGURACIÓN & REPOSICIÓN
  // =========================================================================
  function openStoreProfileModal() {
    const store = db.getCurrentStore();
    const session = db.getAuthSession();

    const titleEl = document.querySelector("#modal-store-settings .modal-header h3");
    if (titleEl) {
      if (session.role === "supplier") {
        titleEl.textContent = "⚙️ Perfil de Bodega Matriz Proveedor";
      } else if (session.role === "store_owner") {
        titleEl.textContent = "⚙️ Perfil de Boutique Partner (" + store.name + ")";
      } else {
        titleEl.textContent = "⚙️ Perfil de Tienda: " + store.name;
      }
    }

    document.getElementById("setting-store-name").value = store.name;
    document.getElementById("setting-store-tagline").value = store.tagline || "";
    document.getElementById("setting-store-phone").value = store.phone || "";
    document.getElementById("setting-store-location").value = store.neighborhood || "";
    openModal("modal-store-settings");
  }

  function setupAdminStoreActions() {
    const btnOpenSettings = document.getElementById("btn-open-store-settings");
    if (btnOpenSettings) {
      btnOpenSettings.addEventListener("click", () => {
        openStoreProfileModal();
      });
    }

    
    // Botón directo para Ver Vitrina Digital en Bodega
    const btnSupplierStorefront = document.getElementById("btn-supplier-view-storefront");
    if (btnSupplierStorefront) {
      btnSupplierStorefront.onclick = () => {
        const supStore = db.getStores().find(s => s.isSupplierStore) || db.getCurrentStore();
        window.open(`?store=${encodeURIComponent(supStore?.id || "store-bagsworld-admin")}&view=storefront`, "_blank");
      };
    }
  
    const btnSupplierProfile = document.getElementById("btn-supplier-open-profile");
    if (btnSupplierProfile) {
      btnSupplierProfile.addEventListener("click", () => {
        openStoreProfileModal();
      });
    }

    const formSettings = document.getElementById("form-store-settings");
    if (formSettings) {
      formSettings.addEventListener("submit", (e) => {
        e.preventDefault();
        const store = db.getCurrentStore();
        db.updateStoreProfile(store.id, {
          name: document.getElementById("setting-store-name").value,
          tagline: document.getElementById("setting-store-tagline").value,
          phone: document.getElementById("setting-store-phone").value,
          neighborhood: document.getElementById("setting-store-location").value
        });
        closeModal("modal-store-settings");
        updateAuthHUD();
        renderCurrentView();
        showToast("✅ Configuración y perfil guardados exitosamente.");
      });
    }

    // Resetear modal de nuevo producto al abrir
    const btnOpenNewProd = document.getElementById("btn-open-new-product-modal");
    if (btnOpenNewProd) {
      btnOpenNewProd.addEventListener("click", () => {
        const form = document.getElementById("form-new-master-product");
        if (form) form.reset();
        document.getElementById("new-prod-id").value = "";
        const statusSelect = document.getElementById("new-prod-status");
        if (statusSelect) statusSelect.value = "active";
        const campaignSelect = document.getElementById("new-prod-campaign");
        if (campaignSelect) campaignSelect.value = "";
        const deleteBtnModal = document.getElementById("btn-delete-from-modal");
        if (deleteBtnModal) deleteBtnModal.style.display = "none";
        const submitBtn = document.getElementById("btn-submit-master-form");
        if (submitBtn) submitBtn.textContent = "Publicar al Catálogo Maestro BAGS WORLD";
        openModal("modal-new-product");
      });
    }

    const formNewProd = document.getElementById("form-new-master-product");
    if (formNewProd) {
      formNewProd.addEventListener("submit", (e) => {
        e.preventDefault();
        const prodId = document.getElementById("new-prod-id").value;
        const name = document.getElementById("new-prod-name").value;
        const sku = document.getElementById("new-prod-sku").value;
        const category = document.getElementById("new-prod-category").value;
        const image = document.getElementById("new-prod-image").value;
        const wholesale = document.getElementById("new-prod-wholesale").value;
        const suggested = document.getElementById("new-prod-suggested").value;
        const dimensions = document.getElementById("new-prod-dim").value;
        const desc = document.getElementById("new-prod-desc").value;
        const statusVal = document.getElementById("new-prod-status")?.value;
        const campaign = document.getElementById("new-prod-campaign")?.value || "";
        const isActive = statusVal !== "inactive";

        if (prodId) {
          // Edición
          db.updateMasterProduct(prodId, {
            name,
            sku,
            category,
            image,
            wholesalePrice: wholesale,
            suggestedRetailPrice: suggested,
            dimensions,
            description: desc,
            active: isActive,
            campaignBadge: campaign
          });
          showToast(`✅ Referencia ${name} actualizada con éxito (${isActive ? 'Habilitada' : 'Pausada'}).`);
        } else {
          // Creación
          db.addMasterProduct({
            name,
            sku,
            category,
            image,
            wholesalePrice: wholesale,
            suggestedRetailPrice: suggested,
            dimensions,
            description: desc,
            active: isActive,
            campaignBadge: campaign
          });
          showToast(`✨ Nueva referencia ${name} publicada al catálogo maestro.`);
        }

        closeModal("modal-new-product");
        formNewProd.reset();
        renderSupplierAdmin();
      });
    }

    // Modal Reposición B2B
    const formRestock = document.getElementById("form-restock-order");
    if (formRestock) {
      formRestock.addEventListener("submit", (e) => {
        e.preventDefault();
        const store = db.getCurrentStore();
        const prodId = document.getElementById("restock-prod-id").value;
        const masterProducts = db.getMasterProducts();
        const prod = masterProducts.find(p => p.id === prodId);
        if (!prod) return;

        const sizeSelect = document.getElementById("restock-size-select");
        const selectedColorway = sizeSelect.value;
        const units = parseInt(document.getElementById("restock-units-input").value, 10);
        const total = units * prod.wholesalePrice;

        db.createB2BOrder({
          storeName: store.name,
          productName: prod.name,
          colorway: selectedColorway,
          units: units,
          totalWholesale: total,
          supplierName: prod.supplierName
        });

        closeModal("modal-restock");
        showToast(`📦 Pedido B2B de ${units} bolsos enviado a Bodega Matriz.`);
      });
    }
  }

  function openRestockModal(prodId) {
    const master = db.getMasterProducts();
    const prod = master.find(p => p.id === prodId);
    if (!prod) return;

    document.getElementById("restock-prod-id").value = prod.id;
    document.getElementById("restock-prod-title").textContent = prod.name;
    document.getElementById("restock-supplier-name").textContent = prod.supplierName;
    document.getElementById("restock-wholesale-price").textContent = `Costo Mayorista: ${db.formatCOP(prod.wholesalePrice)} COP`;

    const sizeSelect = document.getElementById("restock-size-select");
    const colorways = prod.colorways || [{ name: "Tono Estándar" }];
    sizeSelect.innerHTML = colorways.map(cw => `<option value="${cw.name}">${cw.name}</option>`).join("");

    const unitsInput = document.getElementById("restock-units-input");
    const totalCalc = document.getElementById("restock-total-calc");

    function calcRestock() {
      const units = parseInt(unitsInput.value || 1, 10);
      totalCalc.textContent = `${db.formatCOP(units * prod.wholesalePrice)} COP`;
    }

    unitsInput.oninput = calcRestock;
    calcRestock();

    openModal("modal-restock");
  }

  // =========================================================================
  // IMPORTADOR RÁPIDO DESDE WHATSAPP (BODEGA)
  // =========================================================================
  function setupSupplierFastImporter() {
    const btnParse = document.getElementById("btn-parse-wa-text");
    const textarea = document.getElementById("wa-import-textarea");

    if (btnParse && textarea) {
      btnParse.addEventListener("click", () => {
        const text = textarea.value;
        if (!text || text.trim() === "") {
          alert("Pega primero el texto del grupo de WhatsApp con la descripción y precio del bolso.");
          return;
        }

        const parsed = db.parseWhatsAppWholesaleText(text);
        if (parsed) {
          db.addMasterProduct(parsed);
          textarea.value = "";
          renderSupplierAdmin();
          showToast(`✨ Referencia detectada y publicada: ${parsed.name} (${db.formatCOP(parsed.wholesalePrice)})`);
        } else {
          alert("No se pudo interpretar el texto. Asegúrate de incluir el precio (ej: $68.000).");
        }
      });
    }
  }

  // =========================================================================
  // FILTROS & BÚSQUEDA EN STOREFRONT
  // =========================================================================
  function setupFilters() {
    // Chips de Categoría
    const brandChips = document.querySelectorAll(".brand-chip-btn");
    brandChips.forEach(chip => {
      chip.addEventListener("click", () => {
        brandChips.forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        selectedCategory = chip.dataset.brand;
        renderStorefront();
      });
    });

    // Pills de Tamaño
    const sizePills = document.querySelectorAll("#storefront-size-pills .size-pill-btn");
    sizePills.forEach(pill => {
      pill.addEventListener("click", () => {
        sizePills.forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        selectedSize = pill.dataset.size;
        renderStorefront();
      });
    });

    // Pills de Color
    const colorPills = document.querySelectorAll("#storefront-color-pills .size-pill-btn");
    colorPills.forEach(pill => {
      pill.addEventListener("click", () => {
        colorPills.forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        selectedColor = pill.dataset.color;
        renderStorefront();
      });
    });

    // Input de Búsqueda
    const searchInput = document.getElementById("storefront-search-input");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        searchQuery = e.target.value;
        renderStorefront();
      });
    }

    // Select de Categoría
    const catSelect = document.getElementById("storefront-category-select");
    if (catSelect) {
      catSelect.addEventListener("change", (e) => {
        const val = e.target.value;
        if (val === "all") selectedCategory = "all";
        else if (val.includes("Totes")) selectedCategory = "totes";
        else if (val.includes("Crossbody")) selectedCategory = "crossbody";
        else if (val.includes("Satchel")) selectedCategory = "satchel";
        else if (val.includes("Morrales")) selectedCategory = "morrales";
        else if (val.includes("Billeteras")) selectedCategory = "billeteras";
        renderStorefront();
      });
    }

    // Select de Ordenamiento
    const sortSelect = document.getElementById("storefront-sort-select");
    if (sortSelect) {
      sortSelect.addEventListener("change", (e) => {
        currentSort = e.target.value;
        renderStorefront();
      });
    }
  }

  // =========================================================================
  // UTILIDADES GLOBALES (MODALES & TOASTS)
  // =========================================================================
  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add("open");
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove("open");
  }

  function showToast(message) {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `<span>⚡</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(100%)";
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }
});


  // =========================================================================
  // MODAL 6 & 7: COTIZADOR PERSONALIZADO VIP (DIGITAL & IMPRIMIBLE)
  // =========================================================================
  function setupQuoteGenerator() {
    const modal = document.getElementById("modal-quote-generator");
    const previewModal = document.getElementById("modal-quote-preview");
    const btnOpenSupplier = document.getElementById("btn-open-quote-modal");
    const btnOpenPartner = document.getElementById("btn-open-quote-modal-partner");
    const btnClose = document.getElementById("btn-close-quote-modal");
    const btnClosePreview = document.getElementById("btn-close-preview-modal");
    const btnClosePreviewBtn = document.getElementById("btn-close-preview-btn");

    if (!modal) return;

    let quoteItems = [];

    const openModal = () => {
      populateProductSelect();
      if (quoteItems.length === 0) {
        const prods = db.getMasterProducts();
        if (prods.length >= 2) {
          const cw0 = (prods[0].colorways && prods[0].colorways[0]) ? prods[0].colorways[0].name : "Color Original";
          const cw1 = (prods[1].colorways && prods[1].colorways[0]) ? prods[1].colorways[0].name : "Color Original";
          quoteItems = [
            { id: prods[0].id, name: prods[0].name, sku: prods[0].sku, colorway: cw0, price: prods[0].suggestedRetailPrice, qty: 1, image: prods[0].image },
            { id: prods[1].id, name: prods[1].name, sku: prods[1].sku, colorway: cw1, price: prods[1].suggestedRetailPrice, qty: 1, image: prods[1].image }
          ];
        }
      }
      renderQuoteItems();
      modal.classList.add("open");
    };

    if (btnOpenSupplier) btnOpenSupplier.onclick = openModal;
    if (btnOpenPartner) btnOpenPartner.onclick = openModal;
    if (btnClose) btnClose.onclick = () => modal.classList.remove("open");
    if (btnClosePreview) btnClosePreview.onclick = () => previewModal.classList.remove("open");
    if (btnClosePreviewBtn) btnClosePreviewBtn.onclick = () => previewModal.classList.remove("open");

    function populateProductSelect() {
      const select = document.getElementById("quote-prod-select");
      if (!select) return;
      const prods = db.getMasterProducts();
      select.innerHTML = prods.map(p => `
        <option value="${p.id}" data-price="${p.suggestedRetailPrice}">
          ${p.name} — ${db.formatCOP(p.suggestedRetailPrice)}
        </option>
      `).join("");

      updateColorwaySelect();
      select.onchange = updateColorwaySelect;
    }

    function updateColorwaySelect() {
      const prodSelect = document.getElementById("quote-prod-select");
      const sizeSelect = document.getElementById("quote-size-select");
      if (!prodSelect || !sizeSelect) return;

      const prods = db.getMasterProducts();
      const prod = prods.find(p => p.id === prodSelect.value);
      if (!prod) return;

      const colorways = prod.colorways || [{ name: "Color Original" }];
      sizeSelect.innerHTML = colorways.map(cw => `<option value="${cw.name}">${cw.name}</option>`).join("");
    }

    function renderQuoteItems() {
      const container = document.getElementById("quote-items-list");
      if (!container) return;

      if (quoteItems.length === 0) {
        container.innerHTML = `<div style="text-align: center; color: var(--text-muted); font-size: 11px; padding: 14px;">No hay bolsos agregados aún. Selecciona arriba y pulsa "Agregar".</div>`;
      } else {
        container.innerHTML = quoteItems.map((item, idx) => `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px dashed var(--border-subtle); font-size: 12px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-weight: 800; color: var(--primary-gold);">${item.qty}x</span>
              <div>
                <strong style="color: var(--text-primary); font-size: 12px;">${item.name}</strong>
                <span style="font-size: 11px; color: var(--text-muted); margin-left: 4px;">(${item.colorway})</span>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-weight: 700; color: var(--text-primary);">${db.formatCOP(item.price * item.qty)}</span>
              <button type="button" class="btn-remove-quote-item" data-idx="${idx}" style="background: none; border: none; color: #ef4444; font-size: 13px; cursor: pointer; padding: 0 4px;" title="Quitar">✕</button>
            </div>
          </div>
        `).join("");

        container.querySelectorAll(".btn-remove-quote-item").forEach(btn => {
          btn.onclick = () => {
            const idx = parseInt(btn.dataset.idx, 10);
            quoteItems.splice(idx, 1);
            renderQuoteItems();
          };
        });
      }

      recalculateTotals();
    }

    const btnAdd = document.getElementById("btn-add-quote-item");
    if (btnAdd) {
      btnAdd.onclick = () => {
        const prodSelect = document.getElementById("quote-prod-select");
        const sizeSelect = document.getElementById("quote-size-select");
        const qtyInput = document.getElementById("quote-qty-input");

        const prods = db.getMasterProducts();
        const prod = prods.find(p => p.id === prodSelect.value);
        if (!prod) return;

        const colorway = sizeSelect.value;
        const qty = parseInt(qtyInput.value, 10) || 1;

        quoteItems.push({
          id: prod.id,
          name: prod.name,
          sku: prod.sku,
          colorway,
          price: prod.suggestedRetailPrice,
          qty,
          image: prod.image
        });

        renderQuoteItems();
        showToast(`Agregado: ${qty}x ${prod.name} (${colorway})`);
      };
    }

    function recalculateTotals() {
      const subtotal = quoteItems.reduce((acc, it) => acc + (it.price * it.qty), 0);
      const discount = Number(document.getElementById("quote-discount-amount")?.value) || 0;
      const shipping = Number(document.getElementById("quote-shipping-select")?.value) || 0;
      const reason = document.getElementById("quote-discount-reason")?.value.trim() || "Descuento Especial";

      const total = Math.max(0, subtotal - discount + shipping);

      const subtotalEl = document.getElementById("quote-subtotal-display");
      const discountEl = document.getElementById("quote-discount-display");
      const discountLabelEl = document.getElementById("quote-discount-label");
      const shippingEl = document.getElementById("quote-shipping-display");
      const totalEl = document.getElementById("quote-total-display");

      if (subtotalEl) subtotalEl.textContent = db.formatCOP(subtotal) + " COP";
      if (discountEl) discountEl.textContent = `-${db.formatCOP(discount)} COP`;
      if (discountLabelEl) discountLabelEl.textContent = `Descuento Especial (${reason}):`;
      if (shippingEl) shippingEl.textContent = shipping === 0 ? "¡GRATIS! (Cortesía)" : db.formatCOP(shipping) + " COP";
      if (totalEl) totalEl.textContent = db.formatCOP(total) + " COP";

      return { subtotal, discount, shipping, total, reason };
    }

    ["quote-discount-amount", "quote-discount-reason", "quote-shipping-select"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("input", recalculateTotals);
      if (el) el.addEventListener("change", recalculateTotals);
    });

    function generateWhatsAppMessage() {
      const clientName = document.getElementById("quote-client-name")?.value.trim() || "Cliente VIP";
      const store = db.getCurrentStore();
      const { subtotal, discount, shipping, total, reason } = recalculateTotals();
      const validity = document.getElementById("quote-validity-select")?.value || "48 Horas";
      const quoteNum = Math.floor(1000 + Math.random() * 9000);

      const itemsText = quoteItems.map(it => 
        `• *${it.qty}x ${it.name}*\n  - Color/Tono: ${it.colorway} | Ref: ${it.sku}\n  - Precio Regular: ${db.formatCOP(it.price * it.qty)} COP`
      ).join("\n\n");

      return `📋 *COTIZACIÓN ESPECIAL PERSONALIZADA*
🏢 *${store.name}*
📍 *Ubicación:* ${store.neighborhood}
📅 *Fecha:* ${new Date().toLocaleDateString('es-CO')} | *Cotización #COT-${quoteNum}*
👤 *Cliente VIP:* ${clientName}

👜 *BOLSOS SELECCIONADOS EN ESTA PROPUESTA:*
${itemsText}

-------------------------------------------
💵 *Subtotal Regular:* ${db.formatCOP(subtotal)} COP
🎁 *${reason}:* -${db.formatCOP(discount)} COP
🛵 *Flete Despacho:* ${shipping === 0 ? 'GRATIS (Cortesía Bodega)' : db.formatCOP(shipping) + ' COP'}
-------------------------------------------
⭐ *TOTAL FINAL A PAGAR: ${db.formatCOP(total)} COP*
-------------------------------------------
⏱️ *Vigencia:* Propuesta reservada ${validity}.
📦 *Despacho:* Entrega hoy mismo con motorizado o despacho nacional con transportadora asegurada.

💬 *Para confirmar tu pedido con este precio especial, por favor respóndeme con un "CONFIRMO PEDIDO" y tu dirección exacta de despacho.*
✨ *Engineered by BASTION AI*`;
    }

    const btnSendWA = document.getElementById("btn-send-quote-wa");
    if (btnSendWA) {
      btnSendWA.onclick = () => {
        if (quoteItems.length === 0) {
          alert("Agrega al menos un bolso a la cotización.");
          return;
        }
        const msg = generateWhatsAppMessage();
        const clientPhone = (document.getElementById("quote-client-phone")?.value || "").replace(/\D/g, "");
        const store = db.getCurrentStore();
        const cleanPhone = clientPhone.length >= 10 ? (clientPhone.startsWith("57") ? clientPhone : "57" + clientPhone) : (store.phone || "573165558899");
        const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
        window.open(url, "_blank");
        showToast("📲 Abriendo WhatsApp con la cotización formateada...");
      };
    }

    const btnCopy = document.getElementById("btn-copy-quote-text");
    if (btnCopy) {
      btnCopy.onclick = () => {
        if (quoteItems.length === 0) {
          alert("Agrega al menos un bolso a la cotización.");
          return;
        }
        const msg = generateWhatsAppMessage();
        navigator.clipboard?.writeText(msg).then(() => {
          showToast("📋 ¡Cotización formal copiada al portapapeles!");
        }).catch(() => {
          prompt("Copia el texto de la cotización:", msg);
        });
      };
    }

    const btnPreview = document.getElementById("btn-preview-quote-card");
    if (btnPreview) {
      btnPreview.onclick = () => {
        if (quoteItems.length === 0) {
          alert("Agrega al menos un bolso a la cotización.");
          return;
        }
        const clientName = document.getElementById("quote-client-name")?.value.trim() || "Cliente VIP";
        const store = db.getCurrentStore();
        const { subtotal, discount, shipping, total, reason } = recalculateTotals();
        const validity = document.getElementById("quote-validity-select")?.value || "48 Horas";
        const quoteNum = Math.floor(1000 + Math.random() * 9000);

        const rowsHtml = quoteItems.map(it => `
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 8px 6px;">
              <strong style="color: #0f172a; font-size: 12px;">${it.name}</strong><br>
              <span style="color: #64748b; font-size: 10px;">SKU: ${it.sku}</span>
            </td>
            <td style="padding: 8px 6px; text-align: center;"><span style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-weight: 800; font-size: 11px;">${it.colorway}</span></td>
            <td style="padding: 8px 6px; text-align: center; font-weight: 700;">${it.qty}</td>
            <td style="padding: 8px 6px; text-align: right; font-weight: 700;">${db.formatCOP(it.price)}</td>
            <td style="padding: 8px 6px; text-align: right; font-weight: 800; color: #0f172a;">${db.formatCOP(it.price * it.qty)}</td>
          </tr>
        `).join("");

        const previewContainer = document.getElementById("printable-quote-content");
        if (previewContainer) {
          previewContainer.innerHTML = `
            <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; background: #ffffff; color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              <!-- Header Membretado -->
              <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e6192e; padding-bottom: 14px; margin-bottom: 16px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <img src="assets/images/bags_world_logo_transparent.png" alt="Logo" style="width: 44px; height: 44px; border-radius: 50%; border: 2px solid #e6192e;">
                  <div>
                    <h2 style="margin: 0; font-size: 16px; font-weight: 900; color: #0f172a;">${store.name}</h2>
                    <div style="font-size: 11px; color: #64748b;">${store.neighborhood}</div>
                    <div style="font-size: 11px; color: #64748b;">WhatsApp Oficial: +${store.phone}</div>
                  </div>
                </div>
                <div style="text-align: right;">
                  <span style="font-size: 10px; font-weight: 800; background: #fff0f1; color: #e6192e; padding: 3px 8px; border-radius: 999px; border: 1px solid rgba(230,25,46,0.2);">PROPUESTA COMERCIAL VIP</span>
                  <div style="font-size: 15px; font-weight: 900; color: #0f172a; margin-top: 4px;">#COT-${quoteNum}</div>
                  <div style="font-size: 10px; color: #64748b;">${new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                </div>
              </div>

              <!-- Info Cliente VIP -->
              <div style="background: #f8fafc; border-radius: 8px; padding: 10px 14px; margin-bottom: 16px; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
                <div>
                  <span style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Dirigido A:</span>
                  <div style="font-size: 13px; font-weight: 800; color: #0f172a;">${clientName}</div>
                </div>
                <div>
                  <span style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Validez de la Oferta:</span>
                  <div style="font-size: 12px; font-weight: 800; color: #e6192e;">⏱️ ${validity}</div>
                </div>
              </div>

              <!-- Tabla de Productos -->
              <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 16px;">
                <thead>
                  <tr style="background: #f1f5f9; color: #475569; text-transform: uppercase; font-size: 10px;">
                    <th style="padding: 6px; text-align: left;">Bolso / Referencia</th>
                    <th style="padding: 6px; text-align: center;">Colorway</th>
                    <th style="padding: 6px; text-align: center;">Cant.</th>
                    <th style="padding: 6px; text-align: right;">Unitario</th>
                    <th style="padding: 6px; text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${rowsHtml}
                </tbody>
              </table>

              <!-- Resumen Financiero -->
              <div style="margin-left: auto; width: 260px; font-size: 12px; line-height: 1.6;">
                <div style="display: flex; justify-content: space-between; color: #64748b;">
                  <span>Subtotal Regular:</span>
                  <strong style="color: #0f172a;">${db.formatCOP(subtotal)}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; color: #16a34a; font-weight: 700;">
                  <span>${reason}:</span>
                  <span>-${db.formatCOP(discount)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; color: #64748b;">
                  <span>Flete Despacho:</span>
                  <strong style="color: #0f172a;">${shipping === 0 ? 'GRATIS' : db.formatCOP(shipping)}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 15px; font-weight: 900; color: #e6192e; border-top: 2px solid #0f172a; padding-top: 6px; margin-top: 4px;">
                  <span>TOTAL A PAGAR:</span>
                  <span>${db.formatCOP(total)}</span>
                </div>
              </div>

              <!-- Pie de Cotización y Watermark -->
              <div style="margin-top: 20px; padding-top: 12px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #64748b;">
                <div>✨ Despachos asegurados a nivel nacional por contraentrega con transportadora aliada.</div>
                <div style="font-weight: 800; color: #0f172a;">Engineered by <strong>BASTION AI</strong></div>
              </div>
            </div>
          `;
        }

        previewModal.classList.add("open");
      };
    }
  }

  // =========================================================================
  // MODAL 8: MATRIZ DE INVENTARIO POR COLORWAY & VARIANTE
  // =========================================================================
  function setupInventoryStockMatrix() {
    const modal = document.getElementById("modal-inventory-matrix");
    const btnClose = document.getElementById("btn-close-stock-modal");
    const btnCancel = document.getElementById("btn-cancel-stock-modal");
    const btnSave = document.getElementById("btn-save-stock-matrix");
    const btnQuickAdd = document.getElementById("btn-stock-quick-add-all");
    const btnQuickClear = document.getElementById("btn-stock-quick-clear-all");

    if (!modal) return;

    let currentProdId = null;

    document.addEventListener("click", (e) => {
      const btn = e.target.closest(".btn-open-stock-modal");
      if (!btn) return;

      const prodId = btn.dataset.prodId;
      openStockMatrixModal(prodId);
    });

    if (btnClose) btnClose.onclick = () => modal.classList.remove("open");
    if (btnCancel) btnCancel.onclick = () => modal.classList.remove("open");

    function openStockMatrixModal(productId) {
      currentProdId = productId;
      const products = db.getMasterProducts();
      const prod = products.find(p => p.id === productId);
      if (!prod) return;

      document.getElementById("matrix-prod-img").src = prod.image;
      document.getElementById("matrix-prod-name").textContent = prod.name;
      document.getElementById("matrix-prod-sku").textContent = `SKU: ${prod.sku} • ${prod.category}`;

      renderMatrixTable(prod);
      modal.classList.add("open");
    }

    function renderMatrixTable(prod) {
      const table = document.getElementById("matrix-stock-table");
      const matrix = db.getProductStockMatrix(prod.id);
      const colorways = prod.colorways && prod.colorways.length > 0 ? prod.colorways : [{ name: "Color Único", image: prod.image }];

      const rowsHtml = colorways.map(cw => {
        const val = matrix[cw.name] !== undefined ? matrix[cw.name] : 6;
        const statusBadge = val === 0 
          ? `<span style="background: rgba(239,68,68,0.15); color: #f87171; padding: 2px 8px; border-radius: 999px; font-size: 10px; font-weight: 800;">🔴 Agotado</span>`
          : (val <= 4 
              ? `<span style="background: rgba(227,194,116,0.15); color: var(--primary-gold); padding: 2px 8px; border-radius: 999px; font-size: 10px; font-weight: 800;">⚡ Últimas unds</span>`
              : `<span style="background: rgba(16,185,129,0.15); color: var(--accent-emerald); padding: 2px 8px; border-radius: 999px; font-size: 10px; font-weight: 800;">🟢 En Stock</span>`);

        return `
          <tr>
            <td style="padding: 10px 12px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <img src="${cw.image || prod.image}" alt="${cw.name}" style="width: 38px; height: 38px; object-fit: cover; border-radius: 6px; border: 1px solid var(--border-subtle);">
                <div>
                  <strong style="font-size: 13px; color: #fff;">${cw.name}</strong>
                  <div style="font-size: 10px; color: var(--text-muted); font-family: monospace;">${cw.sku || prod.sku}</div>
                </div>
              </div>
            </td>
            <td style="padding: 10px 12px; font-size: 12px; color: var(--text-secondary);">${prod.dimensions || 'Estándar'}</td>
            <td style="padding: 10px 12px; text-align: center;">
              <input type="number" min="0" max="999" class="form-input matrix-cell-input" 
                     data-color="${cw.name}" value="${val}" 
                     style="width: 70px; text-align: center; padding: 6px; font-weight: 800; font-size: 14px; margin: 0 auto;">
            </td>
            <td style="padding: 10px 12px; text-align: center;">
              ${statusBadge}
            </td>
          </tr>
        `;
      }).join("");

      table.innerHTML = `
        <thead>
          <tr style="background: var(--bg-surface-elevated);">
            <th style="padding: 10px 12px; text-align: left;">Colorway / Variante</th>
            <th style="padding: 10px 12px; text-align: left;">Dimensiones</th>
            <th style="text-align: center; padding: 10px 12px;">Stock Bodega (Unidades)</th>
            <th style="text-align: center; padding: 10px 12px;">Disponibilidad</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      `;

      updateGrandTotalBadge();

      table.querySelectorAll(".matrix-cell-input").forEach(input => {
        input.addEventListener("input", updateGrandTotalBadge);
      });
    }

    function updateGrandTotalBadge() {
      const inputs = document.querySelectorAll("#matrix-stock-table .matrix-cell-input");
      let grandTotal = 0;
      inputs.forEach(inp => {
        grandTotal += (parseInt(inp.value, 10) || 0);
      });
      const badge = document.getElementById("matrix-grand-total-badge");
      if (badge) badge.textContent = `${grandTotal} bolsos`;
    }

    if (btnQuickAdd) {
      btnQuickAdd.onclick = () => {
        document.querySelectorAll("#matrix-stock-table .matrix-cell-input").forEach(inp => {
          inp.value = (parseInt(inp.value, 10) || 0) + 5;
        });
        updateGrandTotalBadge();
        showToast("➕ Se sumaron +5 bolsos a todos los tonos.");
      };
    }

    if (btnQuickClear) {
      btnQuickClear.onclick = () => {
        if (confirm("¿Establecer inventario en 0 para todos los tonos de este bolso?")) {
          document.querySelectorAll("#matrix-stock-table .matrix-cell-input").forEach(inp => {
            inp.value = 0;
          });
          updateGrandTotalBadge();
        }
      };
    }

    if (btnSave) {
      btnSave.onclick = () => {
        if (!currentProdId) return;
        const newMatrix = {};
        document.querySelectorAll("#matrix-stock-table .matrix-cell-input").forEach(inp => {
          newMatrix[inp.dataset.color] = Math.max(0, parseInt(inp.value, 10) || 0);
        });

        db.saveProductStockMatrix(currentProdId, newMatrix);
        modal.classList.remove("open");
        showToast("💾 Inventario por colorway guardado correctamente.");

        renderCurrentView();
      };
    }
  }

  // =========================================================================
  // MODAL 9: CENTRO CONTABLE & REPORTES FINANCIEROS (EXCEL / PDF)
  // =========================================================================
  function setupAccountingReports() {
    const modal = document.getElementById("modal-accounting-reports");
    const btnOpenSupplier = document.getElementById("btn-open-supplier-reports");
    const btnOpenStore = document.getElementById("btn-open-store-reports");
    const btnClose = document.getElementById("btn-close-reports-modal");
    const periodButtons = document.querySelectorAll(".btn-report-period");
    const btnExportExcel = document.getElementById("btn-export-reports-excel");
    const btnExportPdf = document.getElementById("btn-export-reports-pdf");

    if (!modal) return;

    let activePeriod = "month";
    let activeStoreFilter = null;

    function openReports(storeFilter = null) {
      activeStoreFilter = storeFilter;
      const headerTitle = document.getElementById("reports-modal-header-title");
      if (headerTitle) {
        headerTitle.textContent = storeFilter 
          ? `Reporte Contable — ${storeFilter}` 
          : `Centro Contable & Liquidación Financiera (Red BAGS WORLD)`;
      }
      renderReportData();
      modal.classList.add("open");
    }

    if (btnOpenSupplier) btnOpenSupplier.onclick = () => openReports(null);
    if (btnOpenStore) {
      btnOpenStore.onclick = () => {
        const store = db.getCurrentStore();
        openReports(store.isSupplierStore ? null : store.name);
      };
    }
    if (btnClose) btnClose.onclick = () => modal.classList.remove("open");

    periodButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        periodButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        activePeriod = btn.dataset.period;
        renderReportData();
      });
    });

    function renderReportData() {
      const summary = db.getFinancialSummary(activePeriod, activeStoreFilter);
      
      const periodLabels = {
        day: "Hoy (24 Horas)",
        week: "Últimos 7 Días",
        month: "Mes en Curso (30 Días)",
        year: "Acumulado Anual / Histórico"
      };
      const labelEl = document.getElementById("reports-date-range-label");
      if (labelEl) {
        labelEl.innerHTML = `Periodo Seleccionado: <strong>${periodLabels[activePeriod] || activePeriod}</strong>`;
      }

      document.getElementById("report-kpi-gross-sales").textContent = db.formatCOP(summary.totalGross);
      document.getElementById("report-kpi-wholesale-cost").textContent = db.formatCOP(summary.totalWholesale);
      document.getElementById("report-kpi-net-profit").textContent = db.formatCOP(summary.netProfit);
      document.getElementById("report-kpi-pairs-count").textContent = `${summary.totalBags} bolsos (${summary.totalOrders} pedidos)`;

      const tbody = document.getElementById("report-orders-tbody");
      if (tbody) {
        if (summary.orders.length === 0) {
          tbody.innerHTML = `
            <tr>
              <td colspan="9" style="text-align: center; padding: 24px; color: var(--text-muted);">
                No hay pedidos registrados en este período.
              </td>
            </tr>
          `;
          return;
        }

        tbody.innerHTML = summary.orders.map(o => {
          const wholesale = Number(o.totalWholesale) || (o.units * 68000);
          const retail = Number(o.totalRetail) || (wholesale * 1.8);
          const margin = retail - wholesale;
          return `
            <tr>
              <td style="font-family: monospace; font-weight: 700; color: var(--primary-gold);">#${o.id}</td>
              <td style="color: var(--text-muted);">${o.date}</td>
              <td style="font-weight: 700;">${o.storeName}</td>
              <td>${o.productName} <span style="font-size: 10px; color: var(--text-muted);">(${o.colorway || 'Estándar'})</span></td>
              <td style="text-align: center; font-weight: 800;">${o.units}</td>
              <td style="font-weight: 700;">${db.formatCOP(retail)}</td>
              <td style="font-weight: 700; color: var(--primary-gold);">${db.formatCOP(wholesale)}</td>
              <td style="font-weight: 800; color: var(--accent-emerald);">+${db.formatCOP(margin)}</td>
              <td>
                <span class="category-tag" style="${o.status === 'Entregado y Cobrado' ? 'background: rgba(16,185,129,0.15); color: var(--accent-emerald); border-color: rgba(16,185,129,0.3);' : ''} font-size: 10px;">
                  ${o.status || 'En Alistamiento'}
                </span>
              </td>
            </tr>
          `;
        }).join("");
      }
    }

    if (btnExportExcel) {
      btnExportExcel.onclick = () => {
        const summary = db.getFinancialSummary(activePeriod, activeStoreFilter);
        exportOrdersToCSV(summary.orders, activePeriod);
      };
    }

    if (btnExportPdf) {
      btnExportPdf.onclick = () => {
        const summary = db.getFinancialSummary(activePeriod, activeStoreFilter);
        generatePDFReport(summary, activePeriod, activeStoreFilter);
      };
    }
  }

  function exportOrdersToCSV(orders, periodName = "periodo") {
    if (!orders || orders.length === 0) {
      alert("No hay órdenes disponibles para exportar.");
      return;
    }

    const bom = "\uFEFF";
    const headers = [
      "ID Pedido",
      "Fecha",
      "Boutique / Partner",
      "Bolso / Referencia",
      "Colorway / Tono",
      "Unidades",
      "Costo Mayorista COP",
      "Precio Venta Sugerido COP",
      "Utilidad Neta COP",
      "Estado Logístico",
      "Bodega Matriz"
    ];

    const rows = orders.map(o => {
      const wholesale = Number(o.totalWholesale) || (o.units * 68000);
      const retail = Number(o.totalRetail) || (wholesale * 1.8);
      const margin = retail - wholesale;

      return [
        `"${o.id}"`,
        `"${o.date}"`,
        `"${o.storeName}"`,
        `"${(o.productName || '').replace(/"/g, '""')}"`,
        `"${o.colorway || 'Estándar'}"`,
        o.units,
        wholesale,
        retail,
        margin,
        `"${o.status || 'En Alistamiento'}"`,
        `"${o.supplierName || 'BAGS WORLD Colombia'}"`
      ].join(";");
    });

    const csvContent = bom + [headers.join(";"), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStamp = new Date().toISOString().slice(0, 10);
    link.setAttribute("href", url);
    link.setAttribute("download", `Reporte_Contable_BagsWorld_${periodName}_${dateStamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("📥 ¡Archivo Excel (.CSV) descargado con éxito!");
  }

  function generatePDFReport(summary, periodName, storeFilter) {
    const periodTitles = {
      day: "INFORME DIARIO DE VENTAS Y DESPACHOS DE BOLSOS",
      week: "INFORME SEMANAL DE LIQUIDACIÓN COMERCIAL",
      month: "INFORME MENSUAL DE RESULTADOS & UTILIDADES",
      year: "INFORME CONSOLIDADO HISTÓRICO Y ANUAL"
    };

    const title = periodTitles[periodName] || "INFORME CONTABLE";
    const now = new Date();
    const formattedDate = now.toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });

    const rowsHtml = summary.orders.map(o => {
      const wholesale = Number(o.totalWholesale) || (o.units * 68000);
      const retail = Number(o.totalRetail) || (wholesale * 1.8);
      const margin = retail - wholesale;
      return `
        <tr style="border-bottom: 1px solid #e2e8f0; font-size: 11px;">
          <td style="padding: 6px 8px; font-weight: bold; color: #b45309;">#${o.id}</td>
          <td style="padding: 6px 8px; color: #64748b;">${o.date}</td>
          <td style="padding: 6px 8px; font-weight: 600;">${o.storeName}</td>
          <td style="padding: 6px 8px;">${o.productName} (${o.colorway || 'Estándar'})</td>
          <td style="padding: 6px 8px; text-align: center; font-weight: bold;">${o.units}</td>
          <td style="padding: 6px 8px; text-align: right;">${db.formatCOP(retail)}</td>
          <td style="padding: 6px 8px; text-align: right; color: #b45309;">${db.formatCOP(wholesale)}</td>
          <td style="padding: 6px 8px; text-align: right; font-weight: bold; color: #15803d;">+${db.formatCOP(margin)}</td>
          <td style="padding: 6px 8px; text-align: center;">${o.status || 'En Alistamiento'}</td>
        </tr>
      `;
    }).join("");

    const printWindow = window.open("", "_blank", "width=900,height=800");
    if (!printWindow) {
      alert("Por favor permite las ventanas emergentes para generar el informe PDF.");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Reporte Contable - BAGS WORLD MLS</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; margin: 30px; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 20px; }
          .title { font-size: 20px; font-weight: 900; color: #0f172a; margin: 0; }
          .subtitle { font-size: 12px; color: #64748b; margin-top: 4px; }
          .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
          .kpi-card { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; }
          .kpi-label { font-size: 10px; color: #64748b; font-weight: bold; text-transform: uppercase; }
          .kpi-val { font-size: 16px; font-weight: 900; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th { background: #0f172a; color: #ffffff; font-size: 10px; text-align: left; padding: 8px; text-transform: uppercase; }
          .footer { margin-top: 30px; border-top: 1px solid #cbd5e1; padding-top: 12px; display: flex; justify-content: space-between; font-size: 10px; color: #64748b; }
          @media print {
            .no-print { display: none !important; }
            body { margin: 10mm; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 16px; display: flex; justify-content: flex-end; gap: 10px;">
          <button onclick="window.print()" style="padding: 8px 16px; background: #0f172a; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">
            🖨️ Imprimir / Guardar como PDF
          </button>
          <button onclick="window.close()" style="padding: 8px 16px; background: #e2e8f0; border: none; border-radius: 6px; cursor: pointer;">
            Cerrar
          </button>
        </div>

        <div class="header">
          <div>
            <div style="font-size: 11px; font-weight: 900; color: #e6192e; letter-spacing: 1px;">BAGS WORLD MLS • BASTION AI</div>
            <h1 class="title">${title}</h1>
            <div class="subtitle">${storeFilter ? 'Entidad: <strong>' + storeFilter + '</strong>' : 'Consolidado Red Nacional (Bodega Matriz & Boutiques Partners)'}</div>
          </div>
          <div style="text-align: right; font-size: 11px;">
            <div>Fecha de Emisión: <strong>${formattedDate}</strong></div>
            <div style="color: #16a34a; font-weight: bold; margin-top: 2px;">🟢 Estado: Contabilidad Auditada</div>
          </div>
        </div>

        <div class="kpi-grid">
          <div class="kpi-card" style="border-left: 4px solid #2563eb;">
            <div class="kpi-label">Facturación Bruta</div>
            <div class="kpi-val" style="color: #1e3a8a;">${db.formatCOP(summary.totalGross)}</div>
          </div>
          <div class="kpi-card" style="border-left: 4px solid #f59e0b;">
            <div class="kpi-label">Costo Bodega Mayorista</div>
            <div class="kpi-val" style="color: #b45309;">${db.formatCOP(summary.totalWholesale)}</div>
          </div>
          <div class="kpi-card" style="border-left: 4px solid #16a34a;">
            <div class="kpi-label">Utilidad Neta Red</div>
            <div class="kpi-val" style="color: #15803d;">${db.formatCOP(summary.netProfit)}</div>
          </div>
          <div class="kpi-card" style="border-left: 4px solid #e6192e;">
            <div class="kpi-label">Bolsos Despachados</div>
            <div class="kpi-val" style="color: #e6192e;">${summary.totalBags} bolsos</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha</th>
              <th>Boutique / Partner</th>
              <th>Referencia & Colorway</th>
              <th style="text-align: center;">Bolsos</th>
              <th style="text-align: right;">Venta</th>
              <th style="text-align: right;">Costo Bodega</th>
              <th style="text-align: right;">Utilidad</th>
              <th style="text-align: center;">Estado</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div class="footer">
          <div>Documento auditado por el motor contable de <strong>BASTION AI</strong> — BAGS WORLD Colombia.</div>
          <div>Página 1 de 1</div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
  }

  // =========================================================================
  // MODAL 10: GESTIÓN DE CAMBIOS DE COLOR, GARANTÍAS Y DEVOLUCIONES
  // =========================================================================
  function setupReturnExchangeModal() {
    const modal = document.getElementById("modal-return-exchange");
    const btnClose = document.getElementById("btn-close-exchange-modal");
    const btnCancel = document.getElementById("btn-cancel-exchange-modal");
    const form = document.getElementById("form-return-exchange");
    const actionSelect = document.getElementById("exchange-action-type");
    const returnSizeSelect = document.getElementById("exchange-return-size");
    const newSizeSelect = document.getElementById("exchange-new-size");
    const unitsInput = document.getElementById("exchange-units");
    const impactText = document.getElementById("exchange-stock-impact-text");
    const sizesRow = document.getElementById("exchange-sizes-row");

    if (!modal || !form) return;

    let currentOrderId = null;
    let currentOrder = null;

    document.addEventListener("click", (e) => {
      const btn = e.target.closest(".btn-open-exchange-modal");
      if (!btn) return;

      currentOrderId = btn.dataset.orderId;
      const orders = db.getOrders();
      currentOrder = orders.find(o => o.id === currentOrderId);
      if (!currentOrder) return;

      openExchangeModal(currentOrder);
    });

    if (btnClose) btnClose.onclick = () => modal.classList.remove("open");
    if (btnCancel) btnCancel.onclick = () => modal.classList.remove("open");

    function openExchangeModal(ord) {
      document.getElementById("exchange-order-product-name").textContent = ord.productName;
      document.getElementById("exchange-order-id").textContent = `#${ord.id}`;
      document.getElementById("exchange-order-store").textContent = ord.storeName;
      document.getElementById("exchange-order-colorway").textContent = ord.colorway || "Estándar";

      // Llenar selects de colores basados en el bolso
      const products = db.getMasterProducts();
      const prod = products.find(p => p.name === ord.productName || p.id === ord.productId) || products[0];
      const colorways = prod.colorways || [{ name: "Color Original" }];

      const colorOptions = colorways.map(cw => `<option value="${cw.name}">${cw.name}</option>`).join("");
      if (returnSizeSelect) returnSizeSelect.innerHTML = colorOptions;
      if (newSizeSelect) newSizeSelect.innerHTML = colorOptions;

      if (returnSizeSelect && ord.colorway) returnSizeSelect.value = ord.colorway;
      if (newSizeSelect && colorways.length > 1) {
        newSizeSelect.value = colorways[1].name;
      }

      if (unitsInput) unitsInput.value = "1";

      updateImpactText();
      modal.classList.add("open");
    }

    function updateImpactText() {
      const action = actionSelect.value;
      const retColor = returnSizeSelect.value;
      const newColor = newSizeSelect.value;
      const units = Number(unitsInput.value) || 1;

      if (action === "color_exchange") {
        sizesRow.style.display = "grid";
        impactText.innerHTML = `Bodega sumará <strong>+${units} bolso(s) ${retColor}</strong> (reingreso) y restará <strong>-${units} bolso(s) ${newColor}</strong> (salida). No descuadra la caja.`;
      } else if (action === "warranty") {
        sizesRow.style.display = "grid";
        impactText.innerHTML = `Bodega despachará <strong>-${units} bolso(s) nuevo(s) ${newColor}</strong> por garantía de herrajes/cremallera.`;
      } else if (action === "stock_rotation") {
        sizesRow.style.display = "grid";
        impactText.innerHTML = `Rotación Mayorista: Reingresan <strong>+${units} bolsos ${retColor}</strong> y salen <strong>-${units} bolsos comerciales ${newColor}</strong>.`;
      } else if (action === "refund_return") {
        sizesRow.style.display = "none";
        impactText.innerHTML = `Retorno a Stock: <strong>+${units} bolso(s) ${retColor}</strong> se reintegran al inventario disponible de bodega.`;
      }
    }

    actionSelect.addEventListener("change", updateImpactText);
    returnSizeSelect.addEventListener("change", updateImpactText);
    newSizeSelect.addEventListener("change", updateImpactText);
    unitsInput.addEventListener("input", updateImpactText);

    form.onsubmit = (e) => {
      e.preventDefault();
      if (!currentOrderId || !currentOrder) return;

      const channel = form.querySelector("input[name='exchange-channel']:checked")?.value || "retail";
      const actionType = actionSelect.value;
      const returnColor = returnSizeSelect.value;
      const newColor = newSizeSelect.value;
      const units = parseInt(unitsInput.value, 10) || 1;
      const shippingVal = document.getElementById("exchange-shipping-mode").value;
      const [shippingCostStr, shippingPayer] = shippingVal.split("_");
      const shippingCost = parseInt(shippingCostStr, 10) || 0;
      const clientAddress = document.getElementById("exchange-address").value.trim();

      const result = db.processReturnOrExchange(currentOrderId, {
        channel,
        actionType,
        returnColor,
        newColor,
        units,
        shippingCost,
        shippingPayer: shippingPayer === "cliente" ? "Cliente" : (shippingPayer === "tienda" ? "Boutique" : "Bodega Matriz"),
        clientAddress
      });

      modal.classList.remove("open");
      showToast("✅ Incidencia procesada e inventario actualizado en tiempo real.");

      renderSupplierAdmin();
      renderStoreAdmin();

      if (result.whatsappText) {
        const encoded = encodeURIComponent(result.whatsappText);
        const store = db.getCurrentStore();
        const cleanPhone = (store.phone || "573165558899").replace(/\D/g, "");
        const waUrl = `https://wa.me/${cleanPhone}?text=${encoded}`;
        
        setTimeout(() => {
          if (confirm("¿Deseas enviar la Guía de Cambio/Recogida a la línea de mensajería en WhatsApp ahora mismo?")) {
            window.open(waUrl, "_blank");
          }
        }, 300);
      }
    };
  }


  // =========================================================================
  // SISTEMA DE 3 TEMAS INTERNOS - CONTROLADO DESDE UN ÚNICO BOTÓN MAESTRO
  // =========================================================================
  const THEMES_CONFIG = {
    "obsidian-gold": { name: "Obsidian Gold", icon: "👑" },
    "cyber-velvet": { name: "Cyber Velvet", icon: "⚡" },
    "emerald-mirage": { name: "Emerald Mirage", icon: "🌿" }
  };

  function initThemeSystem() {
    const savedTheme = localStorage.getItem("bagsworld_theme") || "obsidian-gold";
    applyTheme(savedTheme, false);

    // Único botón maestro flotante para alternar entre los 3 temas visuales
    const btnTheme = document.getElementById("btn-floating-theme");
    if (btnTheme) {
      btnTheme.addEventListener("click", () => {
        const current = document.documentElement.getAttribute("data-theme") || "obsidian-gold";
        const keys = Object.keys(THEMES_CONFIG);
        const nextIdx = (keys.indexOf(current) + 1) % keys.length;
        const nextTheme = keys[nextIdx];
        applyTheme(nextTheme, true);
      });
    }
  }

  function applyTheme(themeId, notify = false) {
    if (!THEMES_CONFIG[themeId]) themeId = "obsidian-gold";
    document.documentElement.setAttribute("data-theme", themeId);
    document.body.setAttribute("data-theme", themeId);
    localStorage.setItem("bagsworld_theme", themeId);

    const iconEl = document.getElementById("floating-theme-icon");
    const labelEl = document.getElementById("floating-theme-label");
    if (iconEl) iconEl.textContent = THEMES_CONFIG[themeId].icon;
    if (labelEl) labelEl.textContent = THEMES_CONFIG[themeId].name;

    if (notify) {
      showToast(`🎨 Tema visual activado: ${THEMES_CONFIG[themeId].icon} ${THEMES_CONFIG[themeId].name}`);
    }
  }

  // =========================================================================
  // EMPLEADO DIGITAL 24/7 (SISTEMA IA DE BOLSOS & MARROQUINERÍA)
  // =========================================================================
  function setupEmpleadoDigital() {
    const btnFloating = document.getElementById("btn-floating-empleado");
    const modalChat = document.getElementById("modal-empleado-chat");
    const btnCloseChat = document.getElementById("btn-close-empleado-chat");
    const chatForm = document.getElementById("form-empleado-chat");
    const chatInput = document.getElementById("empleado-chat-input");
    const chatMessages = document.getElementById("empleado-chat-messages");

    const modalCopier = document.getElementById("modal-empleado-copier");
    const btnCloseCopier = document.getElementById("btn-close-empleado-copier");
    const btnOpenCopier = document.getElementById("btn-open-empleado-copier");
    const btnOpenCopierPartner = document.getElementById("btn-open-empleado-copier-partner");
    const btnOpenChatPreview = document.getElementById("btn-open-empleado-chat-preview");
    const btnPartnerChatPreview = document.getElementById("btn-partner-chat-preview");

    const tabSupplier = document.getElementById("tab-copier-supplier");
    const tabPartner = document.getElementById("tab-copier-partner");
    const contentSupplier = document.getElementById("copier-content-supplier");
    const contentPartner = document.getElementById("copier-content-partner");

    function selectCopierTab(tab) {
      if (tab === "supplier") {
        if (contentSupplier) contentSupplier.style.display = "grid";
        if (contentPartner) contentPartner.style.display = "none";
        if (tabSupplier) {
          tabSupplier.style.background = "var(--primary-gold)";
          tabSupplier.style.color = "#000";
          tabSupplier.style.borderColor = "var(--primary-gold)";
        }
        if (tabPartner) {
          tabPartner.style.background = "var(--bg-surface-elevated)";
          tabPartner.style.color = "#cbd5e1";
          tabPartner.style.borderColor = "var(--border-subtle)";
        }
      } else {
        if (contentSupplier) contentSupplier.style.display = "none";
        if (contentPartner) contentPartner.style.display = "grid";
        if (tabPartner) {
          tabPartner.style.background = "var(--primary-gold)";
          tabPartner.style.color = "#000";
          tabPartner.style.borderColor = "var(--primary-gold)";
        }
        if (tabSupplier) {
          tabSupplier.style.background = "var(--bg-surface-elevated)";
          tabSupplier.style.color = "#cbd5e1";
          tabSupplier.style.borderColor = "var(--border-subtle)";
        }
      }
    }

    if (tabSupplier) tabSupplier.onclick = () => selectCopierTab("supplier");
    if (tabPartner) tabPartner.onclick = () => selectCopierTab("partner");

    if (btnFloating) btnFloating.onclick = () => modalChat?.classList.add("open");
    if (btnOpenChatPreview) btnOpenChatPreview.onclick = () => modalChat?.classList.add("open");
    if (btnPartnerChatPreview) btnPartnerChatPreview.onclick = () => modalChat?.classList.add("open");
    if (btnCloseChat) btnCloseChat.onclick = () => modalChat?.classList.remove("open");

    if (btnOpenCopier) {
      btnOpenCopier.onclick = () => {
        selectCopierTab("supplier");
        modalCopier?.classList.add("open");
      };
    }
    if (btnOpenCopierPartner) {
      btnOpenCopierPartner.onclick = () => {
        selectCopierTab("partner");
        modalCopier?.classList.add("open");
      };
    }
    if (btnCloseCopier) btnCloseCopier.onclick = () => modalCopier?.classList.remove("open");

    // Copiador en 1 clic
    document.querySelectorAll(".btn-copy-template").forEach(btn => {
      btn.addEventListener("click", () => {
        const card = btn.closest(".copier-card");
        const textEl = card ? card.querySelector("p") : null;
        if (textEl) {
          const text = textEl.innerText.trim();
          navigator.clipboard.writeText(text).then(() => {
            const originalText = btn.textContent;
            btn.textContent = "✅ ¡Copiado!";
            btn.style.background = "rgba(74,222,128,0.15)";
            btn.style.color = "#4ade80";
            showToast("📋 Mensaje copiado listo para enviar por WhatsApp.");
            setTimeout(() => {
              btn.textContent = originalText;
              btn.style.background = "";
              btn.style.color = "";
            }, 2500);
          });
        }
      });
    });

    function appendChatMessage(sender, html) {
      if (!chatMessages) return;
      const msg = document.createElement("div");
      msg.className = `chat-msg ${sender}`;
      msg.innerHTML = `
        <div class="chat-msg-avatar">${sender === 'bot' ? '🤖' : '👤'}</div>
        <div class="chat-msg-bubble">${html}</div>
      `;
      chatMessages.appendChild(msg);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function processEmpleadoQuery(query) {
      const q = query.toLowerCase().trim();
      if (!q) return;

      const userTextEscaped = document.createElement("div");
      userTextEscaped.textContent = query;
      appendChatMessage("user", userTextEscaped.innerHTML);

      setTimeout(() => {
        if (q.includes("medid") || q.includes("alto") || q.includes("ancho") || q.includes("cabe") || q.includes("laptop") || q.includes("celular") || q.includes("pro max") || q.includes("tamano") || q.includes("tamaño")) {
          appendChatMessage("bot", `
            📐 <strong>Guía de Medidas y Capacidad en Centímetros:</strong><br><br>
            • <strong>Tote Bags & Handbags:</strong> 30 a 34 cm (Alto) x 38 a 42 cm (Ancho) x 14 cm (Profundidad). <em>¡Cabe perfectamente laptop de 13" o 14", termo y cosmetiquera!</em><br>
            • <strong>Satchel & Estructurados:</strong> 20 a 24 cm (Alto) x 26 a 30 cm (Ancho) x 10 cm (Profundidad). <em>Ideal para billetera larga, celular Pro Max y llaves.</em><br>
            • <strong>Crossbody / Bandoleras:</strong> 16 a 18 cm (Alto) x 22 a 24 cm (Ancho) x 8 cm (Profundidad). <em>Compacto y cómodo para celular, labiales y tarjetas.</em><br>
            • <strong>Billeteras & Clutches:</strong> 10 cm (Alto) x 19 cm (Ancho) x 3 cm (Profundidad). <em>Con 12 tarjeteros y bolsillo monedero con cierre.</em><br><br>
            💡 Todos los modelos tienen sus medidas exactas detalladas en cada ficha.
          `);
        } else if (q.includes("envio") || q.includes("entrega") || q.includes("flete") || q.includes("domicilio") || q.includes("contraentrega") || q.includes("bogota") || q.includes("cali") || q.includes("medellin")) {
          appendChatMessage("bot", `
            🚚 <strong>Cobertura & Envíos Contraentrega a Toda Colombia:</strong><br><br>
            • <strong>En Bogotá & Cali:</strong> Envíos express el mismo día con motorizado propio y opción contraentrega.<br>
            • <strong>Resto del País (Medellín, Barranquilla, Bucaramanga, Eje Cafetero, etc.):</strong> Despachos por <strong>Coordinadora, Envía o Interrapidísimo</strong> asegurados.<br>
            • <strong>Tiempos:</strong> 24 a 48 horas hábiles a ciudades principales; 48 a 72 horas a municipios nacionales.<br><br>
            📦 Cada bolso se despacha en bolsa cubrepolvo con protección de herrajes dorados.
          `);
        } else if (q.includes("ganar") || q.includes("revend") || q.includes("socio") || q.includes("partner") || q.includes("mayor") || q.includes("dropshipping") || q.includes("precio") || q.includes("iniciar")) {
          appendChatMessage("bot", `
            💰 <strong>¿Cómo ganar dinero revendiendo carteras y bolsos?</strong><br><br>
            1. <strong>Cero inversión en inventario:</strong> No necesitas comprar lotes por adelantado.<br>
            2. <strong>Catálogo en la nube:</strong> Compartes las fotos en HD de BAGS WORLD en tus estados de WhatsApp o historias de Instagram.<br>
            3. <strong>Tu margen limpio:</strong> Compras a costo de Bodega Matriz ($65.000 - $85.000 COP) y vendes al detal ($125.000 - $165.000 COP).<br>
            👉 <strong>Te ganas entre $45.000 y $75.000 COP netos por cada bolso vendido</strong>.<br><br>
            Tú solo nos pasas los datos del cliente y nosotros despachamos por ti con tu marca.
          `);
        } else if (q.includes("material") || q.includes("cuero") || q.includes("herraje") || q.includes("calidad") || q.includes("costura") || q.includes("cremallera") || q.includes("cierre")) {
          appendChatMessage("bot", `
            👜 <strong>Materiales y Confección Premium:</strong><br><br>
            • <strong>Cuerpo Exterior:</strong> Cuero sintético importado PU de alta densidad (ecocuero texturizado impermeable, resistente al desgaste y arañazos).<br>
            • <strong>Herrajes:</strong> Aleación de zinc con baño dorado electrolítico de alto brillo y capa protectora antioxidable.<br>
            • <strong>Interior:</strong> Forro textil satinado de alta durabilidad con bolsillos organizadores internos y cremallera reforzada.<br>
            • <strong>Correas:</strong> Doble costura con remaches de acero para soportar peso continuo sin deformarse.
          `);
        } else if (q.includes("garantia") || q.includes("cambio") || q.includes("color") || q.includes("defect") || q.includes("devolucion")) {
          appendChatMessage("bot", `
            🛡️ <strong>Garantía Oficial & Cambio Ágil de Tono:</strong><br><br>
            • <strong>Garantía directa de 30 días:</strong> Cubre cualquier defecto de fábrica en cremalleras, herrajes o costuras.<br>
            • <strong>Cambio de color ágil:</strong> Si a tu clienta le gustó otro colorway (por ejemplo pidió Crema y prefiere Negro), coordinamos el cambio de tono de inmediato en bodega.<br><br>
            ¡Tus compras y las de tus clientas están 100% blindadas! ✨
          `);
        } else if (q.includes("whatsapp") || q.includes("asesor") || q.includes("humano") || q.includes("telefono") || q.includes("celular") || q.includes("hablar")) {
          const store = db.getCurrentStore();
          appendChatMessage("bot", `
            📲 <strong>Contacto Directo con Asesor Humano:</strong><br><br>
            Puedes comunicarte de inmediato con nuestra línea oficial de atención:<br>
            • <strong>WhatsApp:</strong> <a href="https://wa.me/${store.phone || '573165558899'}" target="_blank" style="color: var(--primary-gold); font-weight: 800; text-decoration: underline;">+${store.phone || '57 316 555 8899'}</a><br>
            • <strong>Atención:</strong> Lunes a Sábado de 8:00 AM a 7:00 PM.<br><br>
            ¡Te responderán en pocos minutos! 👜✨
          `);
        } else {
          appendChatMessage("bot", `
            👜 <strong>Información sobre BAGS WORLD MLS:</strong><br><br>
            Disponemos de 8 colecciones exclusivas de bolsos importados con stock centralizado en bodega.<br><br>
            Puedes preguntarme por:<br>
            • <strong>"Medidas"</strong> para saber las dimensiones y capacidad.<br>
            • <strong>"Envíos"</strong> para cobertura y contraentrega nacional.<br>
            • <strong>"Ganancias"</strong> para saber cuánto ganas revendiendo sin stock.<br>
            • <strong>"Materiales"</strong> para detalles de herrajes y cuero.<br>
            • O toca en <em>"Hablar con un Asesor"</em> para atención en WhatsApp. 👇
          `);
        }
      }, 250);
    }

    if (chatForm) {
      chatForm.onsubmit = (e) => {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (text) {
          processEmpleadoQuery(text);
          chatInput.value = "";
        }
      };
    }

    document.querySelectorAll(".quick-action-chip").forEach(chip => {
      chip.onclick = () => {
        const ask = chip.dataset.ask;
        if (ask === "medidas") processEmpleadoQuery("¿Cuáles son las medidas y qué cabe en los bolsos?");
        else if (ask === "envios") processEmpleadoQuery("¿Cuáles son los tiempos de envío y fletes contraentrega?");
        else if (ask === "ganancias") processEmpleadoQuery("¿Cómo ganar dinero revendiendo bolsos como socio?");
        else if (ask === "materiales") processEmpleadoQuery("¿De qué material están hechos los bolsos y herrajes?");
        else if (ask === "whatsapp") processEmpleadoQuery("Quiero hablar con un asesor por WhatsApp");
      };
    });
  }

  // =========================================================================
  // CREADOR DE ENLACES VIRALES PARA HISTORIAS & REDES (LINK CREATOR)
  // =========================================================================
  function setupLinkCreatorModal() {
    const modal = document.getElementById("modal-link-creator");
    const btnClose = document.getElementById("btn-close-link-creator");
    const btnBodega = document.getElementById("btn-supplier-open-link-creator");
    const btnSupplierBanner = document.getElementById("btn-supplier-banner-link-creator");
    const btnPartnerTop = document.getElementById("btn-partner-open-link-creator");
    const btnPartnerBanner = document.getElementById("btn-partner-banner-link-creator");

    const storeAvatar = document.getElementById("link-active-store-avatar");
    const storeName = document.getElementById("link-active-store-name");
    const storeTypeBadge = document.getElementById("link-active-store-type-badge");
    const storeTag = document.getElementById("link-active-store-tag");
    const storeExplainer = document.getElementById("link-active-store-explainer");

    const btnTypeStore = document.getElementById("btn-link-type-store");
    const btnTypeProduct = document.getElementById("btn-link-type-product");
    const prodSelectContainer = document.getElementById("link-product-select-container");
    const productSelect = document.getElementById("link-product-select");

    const btnFmtStory = document.getElementById("btn-link-fmt-story");
    const btnFmtChat = document.getElementById("btn-link-fmt-chat");
    const btnFmtBio = document.getElementById("btn-link-fmt-bio");

    const urlInput = document.getElementById("link-generated-url");
    const btnCopyLink = document.getElementById("btn-copy-generated-link");
    const btnCopyText = document.getElementById("btn-copy-story-text");
    const copyLabel = document.getElementById("link-copy-label");
    const suggestedCopy = document.getElementById("link-suggested-copy");
    const waShareBtn = document.getElementById("link-wa-share-btn");
    const btnPreview = document.getElementById("btn-open-generated-link-preview");

    let targetStoreId = "store-bolsoscol"; // Por defecto BolsosCOL o según el panel activo
    let currentType = "store"; // "store" | "product"
    let currentFormat = "story"; // "story" | "chat" | "bio"
    let selectedProductId = null;

    function updateActiveStoreInfo() {
      const session = db.getAuthSession();
      const allStores = db.getStores();
      let activeStore = null;

      // =========================================================================
      // AISLAMIENTO ESTRICTO: NI BODEGA PUEDE ENVIAR DE PARTNER NI AL REVÉS
      // =========================================================================
      if (session.role === "store_owner" || currentView === "store-admin") {
        activeStore = allStores.find(s => !s.isSupplierStore) || allStores[1] || allStores[0];
        targetStoreId = activeStore ? activeStore.id : "store-bolsoscol";
      } else if (session.role === "supplier" || currentView === "supplier") {
        activeStore = allStores.find(s => s.isSupplierStore) || allStores[0];
        targetStoreId = activeStore ? activeStore.id : "store-bagsworld-admin";
      } else {
        // SuperAdmin: usa la tienda actualmente seleccionada
        activeStore = db.getCurrentStore();
        targetStoreId = activeStore ? activeStore.id : "store-bagsworld-admin";
      }

      if (storeAvatar && activeStore) {
        if (activeStore.logo) {
          storeAvatar.innerHTML = `<img src="${activeStore.logo}" alt="${activeStore.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: inherit;">`;
        } else {
          const initials = (activeStore.name || "BW").split(" ").filter(Boolean).map(w => w[0]).slice(0, 2).join("").toUpperCase();
          storeAvatar.textContent = initials;
        }
        storeAvatar.style.background = activeStore.isSupplierStore ? "rgba(227, 194, 116, 0.15)" : "rgba(56, 189, 248, 0.15)";
        storeAvatar.style.color = activeStore.isSupplierStore ? "var(--primary-gold)" : "var(--accent-blue)";
        storeAvatar.style.borderColor = activeStore.isSupplierStore ? "rgba(227, 194, 116, 0.35)" : "rgba(56, 189, 248, 0.35)";
      }

      if (storeName && activeStore) {
        storeName.textContent = activeStore.name;
      }

      if (storeTypeBadge && activeStore) {
        storeTypeBadge.textContent = activeStore.isSupplierStore ? "🏢 Catálogo Oficial de Bodega" : "🟢 Vitrina Activa para tus Clientes";
        storeTypeBadge.style.color = activeStore.isSupplierStore ? "var(--primary-gold)" : "var(--accent-emerald)";
      }

      if (storeTag && activeStore) {
        storeTag.textContent = activeStore.isSupplierStore ? "Bodega Matriz" : "Tu Tienda Online";
        storeTag.style.color = activeStore.isSupplierStore ? "var(--primary-gold)" : "var(--accent-blue)";
        storeTag.style.background = activeStore.isSupplierStore ? "rgba(227, 194, 116, 0.12)" : "rgba(56, 189, 248, 0.12)";
        storeTag.style.borderColor = activeStore.isSupplierStore ? "rgba(227, 194, 116, 0.3)" : "rgba(56, 189, 248, 0.3)";
      }

      if (storeExplainer && activeStore) {
        storeExplainer.innerHTML = activeStore.isSupplierStore
          ? `👉 Enlace directo a la vitrina oficial de <strong>${activeStore.name}</strong> para que tus clientes y revendedores consulten stock y pidan a tu WhatsApp.`
          : `👉 Enlace directo a tu vitrina oficial de <strong>${activeStore.name}</strong> con tus precios al detal y tu WhatsApp para cerrar ventas directas.`;
      }
    }

    function populateProductSelect() {
      if (!productSelect) return;
      const allStores = db.getStores();
      const currentStore = allStores.find(s => s.id === targetStoreId) || db.getCurrentStore();
      const prods = db.getStorefrontProducts(currentStore);
      productSelect.innerHTML = prods.map(p => `
        <option value="${p.id}" ${p.id === selectedProductId ? 'selected' : ''}>
          ${p.name} — $${db.formatCOP(p.storeRetailPrice || p.suggestedRetailPrice)} COP
        </option>
      `).join("");
      if (!selectedProductId && prods.length > 0) {
        selectedProductId = prods[0].id;
      }
    }

    function generateLinkAndCopy() {
      if (!urlInput || !suggestedCopy) return;

      const origin = window.location.origin;
      const pathname = window.location.pathname;
      const isLocal = origin.includes("localhost") || origin.includes("127.0.0.1") || origin.startsWith("file:");
      const baseUrl = isLocal ? "https://bagsworld.vercel.app" : `${origin}${pathname}`;

      // Enlace 100% seguro a la vitrina de cara al cliente final (sin credenciales admin)
      let finalUrl = `${baseUrl}?store=${encodeURIComponent(targetStoreId)}&view=storefront`;
      let prodObj = null;

      const allStores = db.getStores();
      const currentStore = allStores.find(s => s.id === targetStoreId) || db.getCurrentStore();
      const storeProducts = db.getStorefrontProducts(currentStore);

      if (currentType === "product") {
        if (!selectedProductId && productSelect) {
          selectedProductId = productSelect.value;
        }
        prodObj = storeProducts.find(p => p.id === selectedProductId) || db.getMasterProductById(selectedProductId) || storeProducts[0];
        if (prodObj) {
          finalUrl += `&prod=${encodeURIComponent(prodObj.id)}`;
        }
      }

      urlInput.value = finalUrl;

      // Generar copy persuasivo según la tienda activa y el formato
      let copyText = "";
      const priceFmt = prodObj ? `$${db.formatCOP(prodObj.storeRetailPrice || prodObj.suggestedRetailPrice)} COP` : "";
      const sName = currentStore ? currentStore.name : "nuestra tienda";
      const isBodega = currentStore ? currentStore.isSupplierStore : false;

      if (currentFormat === "story") {
        if (copyLabel) copyLabel.textContent = "📸 Texto gancho sugerido para tu Historia / Sticker:";
        if (currentType === "product" && prodObj) {
          copyText = isBodega
            ? `👜 ${prodObj.name} disponible en bodega central con despacho inmediato. Toca el sticker para ver fotos HD y pedir contraentrega 👇`
            : `👜 ${prodObj.name} disponible en ${sName} (${priceFmt}). Toca el sticker para ver fotos en HD, colores y pedir contraentrega 👇`;
        } else {
          copyText = isBodega
            ? `👜 Catálogo oficial de marroquinería abierto para pedidos. Toca el sticker para ver modelos y stock en tiempo real 👇`
            : `👜 ¡Nueva colección de carteras y bolsos disponible en ${sName}! Toca el sticker para ver fotos HD y pedir contraentrega a tu casa 👇`;
        }
      } else if (currentFormat === "chat") {
        if (copyLabel) copyLabel.textContent = "💬 Mensaje listo para enviar por WhatsApp al cliente:";
        if (currentType === "product" && prodObj) {
          copyText = isBodega
            ? `¡Hola! 👋 Te comparto las fotos oficiales y disponibilidad del ${prodObj.name} en Bodega Matriz. Puedes pedir directamente aquí: ${finalUrl}`
            : `¡Hola hermosa! 👋 Te comparto las fotos oficiales y detalles del ${prodObj.name} (${priceFmt}) en ${sName}. Puedes ver todos los colores y pedir aquí: ${finalUrl}`;
        } else {
          copyText = isBodega
            ? `¡Hola! 👋 Te comparto nuestra vitrina oficial en vivo de BAGS WORLD Colombia. Puedes revisar stock disponible y fotos HD aquí: ${finalUrl}`
            : `¡Hola! 👋 Mira todo nuestro catálogo de bolsos y carteras en ${sName} con fotos reales y consulta de colores en tiempo real aquí: ${finalUrl}`;
        }
      } else if (currentFormat === "bio") {
        if (copyLabel) copyLabel.textContent = "🌐 Texto recomendado para tu Biografía de Instagram / TikTok:";
        copyText = isBodega
          ? `👜 Bodega Mayorista de Bolsos & Marroquinería | Catálogo en Vivo & Despachos Nacionales 👇\n${finalUrl}`
          : `👜 Carteras & Bolsos de Lujo en ${sName} ✨ Pago Contraentrega en Colombia. Mira el Catálogo Oficial aquí 👇\n${finalUrl}`;
      }

      suggestedCopy.textContent = copyText;

      if (waShareBtn) {
        const waMsg = encodeURIComponent(copyText + "\n\n" + finalUrl);
        waShareBtn.href = "https://wa.me/?text=" + waMsg;
      }

      if (btnPreview) {
        btnPreview.onclick = () => window.open(finalUrl, "_blank");
      }
    }

    function selectType(type) {
      currentType = type;
      if (btnTypeStore) {
        btnTypeStore.classList.toggle("active", type === "store");
        btnTypeStore.style.background = type === "store" ? "var(--primary-gold)" : "";
        btnTypeStore.style.color = type === "store" ? "#000" : "";
        btnTypeStore.style.borderColor = type === "store" ? "var(--primary-gold)" : "";
      }
      if (btnTypeProduct) {
        btnTypeProduct.classList.toggle("active", type === "product");
        btnTypeProduct.style.background = type === "product" ? "var(--primary-gold)" : "";
        btnTypeProduct.style.color = type === "product" ? "#000" : "";
        btnTypeProduct.style.borderColor = type === "product" ? "var(--primary-gold)" : "";
      }
      if (prodSelectContainer) {
        prodSelectContainer.style.display = type === "product" ? "block" : "none";
      }
      generateLinkAndCopy();
    }

    if (btnTypeStore) btnTypeStore.onclick = () => selectType("store");
    if (btnTypeProduct) btnTypeProduct.onclick = () => selectType("product");

    if (productSelect) {
      productSelect.onchange = (e) => {
        selectedProductId = e.target.value;
        generateLinkAndCopy();
      };
    }

    function selectFormat(fmt) {
      currentFormat = fmt;
      [btnFmtStory, btnFmtChat, btnFmtBio].forEach(b => {
        if (b) {
          const isSelected = b.dataset.format === fmt;
          b.classList.toggle("active", isSelected);
          if (isSelected) {
            b.style.background = fmt === "story" ? "rgba(230, 25, 46, 0.25)" : (fmt === "chat" ? "rgba(16, 185, 129, 0.25)" : "rgba(56, 189, 248, 0.25)");
            b.style.borderColor = fmt === "story" ? "var(--primary-red)" : (fmt === "chat" ? "var(--accent-emerald)" : "var(--accent-blue)");
            b.style.color = "#ffffff";
          } else {
            b.style.background = "";
            b.style.borderColor = "";
            b.style.color = "";
          }
        }
      });
      generateLinkAndCopy();
    }

    if (btnFmtStory) btnFmtStory.onclick = () => selectFormat("story");
    if (btnFmtChat) btnFmtChat.onclick = () => selectFormat("chat");
    if (btnFmtBio) btnFmtBio.onclick = () => selectFormat("bio");

    if (btnCopyLink) {
      btnCopyLink.onclick = () => {
        if (urlInput) {
          navigator.clipboard.writeText(urlInput.value).then(() => {
            btnCopyLink.textContent = "✅ ¡Enlace Copiado!";
            showToast("📋 Enlace de vitrina pública copiado al portapapeles.");
            setTimeout(() => { btnCopyLink.textContent = "📋 Copiar Enlace"; }, 2500);
          });
        }
      };
    }

    if (btnCopyText) {
      btnCopyText.onclick = () => {
        if (suggestedCopy) {
          navigator.clipboard.writeText(suggestedCopy.textContent.trim()).then(() => {
            btnCopyText.textContent = "✅ ¡Copiado!";
            showToast("📋 Texto persuasivo copiado al portapapeles.");
            setTimeout(() => { btnCopyText.textContent = "📋 Copiar Texto"; }, 2500);
          });
        }
      };
    }

    // Exponer función global para abrir desde catálogo o tabla
    window.openBagsLinkCreator = (prodId) => {
      updateActiveStoreInfo();
      populateProductSelect();

      if (prodId) {
        currentType = "product";
        selectedProductId = prodId;
        if (productSelect) productSelect.value = prodId;
        selectType("product");
      } else {
        currentType = "store";
        selectType("store");
      }

      selectFormat("story");
      generateLinkAndCopy();
      modal?.classList.add("open");
    };

    // Disparadores en panel de administración (Partner y Bodega)
    [btnBodega, btnSupplierBanner, btnPartnerTop, btnPartnerBanner].forEach(btn => {
      if (btn) {
        btn.onclick = () => {
          updateActiveStoreInfo();
          populateProductSelect();
          generateLinkAndCopy();
          modal?.classList.add("open");
        };
      }
    });

    if (btnClose) btnClose.onclick = () => modal?.classList.remove("open");

    if (modal) {
      modal.onclick = (e) => {
        if (e.target === modal) modal.classList.remove("open");
      };
    }
  }
