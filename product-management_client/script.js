const API_URL = "http://localhost:5000/api/products";

// DOM Elements
const productGrid = document.getElementById("productGrid");
const productModal = document.getElementById("productModal");
const productForm = document.getElementById("productForm");
const openAddModalBtn = document.getElementById("openAddModalBtn");
const closeModalBtn = document.getElementById("closeModalBtn");

let products = [];

// Fetch products from Server
async function fetchProducts() {
  try {
    const res = await fetch(API_URL);
    products = await res.json();
    renderProducts();
    updateStats();
  } catch (err) {
    console.error("Error fetching data:", err);
  }
}

// Render dynamic HTML cards
function renderProducts() {
  if (!productGrid) return;
  productGrid.innerHTML = "";
  if (products.length === 0) {
    productGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #64748b;">No products found.</p>`;
    return;
  }

  products.forEach((prod) => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <div>
        <div class="card-header">
          <h4>${prod.title}</h4>
          <span class="badge">${prod.category}</span>
        </div>
        <div class="price-status">
          <span class="price">$${Number(prod.price).toFixed(2)}</span>
          <span class="status-tag ${prod.status === "In Stock" ? "in-stock" : "out-of-stock"}">• ${prod.status}</span>
        </div>
        <p class="desc">${prod.description || ""}</p>
      </div>
      <div class="card-actions">
        <button class="btn btn-outline" onclick="openEditModal('${prod._id}')">✏️ Edit</button>
        <button class="btn btn-danger" onclick="deleteProduct('${prod._id}')">🗑️ Delete</button>
      </div>
    `;
    productGrid.appendChild(card);
  });
}

// Dynamic Stats calculation
function updateStats() {
  const total = products.length;
  const inStock = products.filter((p) => p.status === "In Stock").length;
  const outOfStock = products.filter((p) => p.status === "Out of Stock").length;
  const totalVal = products.reduce((acc, curr) => acc + Number(curr.price), 0);

  const totalEl = document.getElementById("statTotal");
  const inStockEl = document.getElementById("statInStock");
  const outOfStockEl = document.getElementById("statOutOfStock");
  const valEl = document.getElementById("statValue");

  if (totalEl) totalEl.innerText = total.toString();
  if (inStockEl) inStockEl.innerText = inStock.toString();
  if (outOfStockEl) outOfStockEl.innerText = outOfStock.toString();
  if (valEl) valEl.innerText = `$${totalVal.toFixed(2)}`;
}

// Handle Form Submit (CREATE & UPDATE)
if (productForm) {
  productForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const idInput = document.getElementById("productId");
    const titleInput = document.getElementById("title");
    const categoryInput = document.getElementById("category");
    const statusInput = document.getElementById("status");
    const priceInput = document.getElementById("price");
    const descInput = document.getElementById("description");

    const id = idInput ? idInput.value : "";
    const payload = {
      title: titleInput ? titleInput.value : "",
      category: categoryInput ? categoryInput.value : "",
      status: statusInput ? statusInput.value : "",
      price: priceInput ? priceInput.value : "",
      description: descInput ? descInput.value : "",
    };

    if (id) {
      await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    closeModal();
    fetchProducts();
  });
}

// DELETE Operation
async function deleteProduct(id) {
  if (confirm("Are you sure you want to delete this product?")) {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    fetchProducts();
  }
}

// Modal Handlers
if (openAddModalBtn) {
  openAddModalBtn.addEventListener("click", () => {
    if (productForm) productForm.reset();
    const idInput = document.getElementById("productId");
    const titleEl = document.getElementById("modalTitle");
    if (idInput) idInput.value = "";
    if (titleEl) titleEl.innerText = "Add New Product";
    if (productModal) productModal.classList.add("active");
  });
}

if (closeModalBtn) {
  closeModalBtn.addEventListener("click", closeModal);
}

function closeModal() {
  if (productModal) productModal.classList.remove("active");
}

function openEditModal(id) {
  const prod = products.find((p) => p._id === id);
  if (!prod) return;

  const idInput = document.getElementById("productId");
  const titleInput = document.getElementById("title");
  const categoryInput = document.getElementById("category");
  const statusInput = document.getElementById("status");
  const priceInput = document.getElementById("price");
  const descInput = document.getElementById("description");
  const modalTitle = document.getElementById("modalTitle");

  if (idInput) idInput.value = prod._id;
  if (titleInput) titleInput.value = prod.title;
  if (categoryInput) categoryInput.value = prod.category;
  if (statusInput) statusInput.value = prod.status;
  if (priceInput) priceInput.value = prod.price;
  if (descInput) descInput.value = prod.description || "";
  if (modalTitle) modalTitle.innerText = "Edit Product";

  if (productModal) productModal.classList.add("active");
}

// Initial Load
fetchProducts();
