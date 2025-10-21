// src/pages/CartPage.js
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { useCart } from "../contexts/CartContext";
import "./cart-page.css";

function CartPage() {
  const navigate = useNavigate();

  // Cart context (keep your API)
  const {
    cart = [],
    removeFromCart,
    clearCart,
    totalPrice,       // whole cart total (we'll also compute selected total)
    incrementQty,     // optional
    decrementQty,     // optional
  } = useCart();

  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [voucher, setVoucher] = useState("");

  // ---------- Selection state ----------
  const allKeys = useMemo(
    () => cart.map((it) => it.key || `${it.type}:${it.id}`),
    [cart]
  );
  const [selected, setSelected] = useState(() => new Set(allKeys));
  useEffect(() => {
    // keep selections valid when cart changes; default select all
    setSelected((prev) => {
      const valid = new Set(allKeys);
      const next = new Set();
      if (prev.size === 0 && allKeys.length) {
        allKeys.forEach((k) => next.add(k));
        return next;
      }
      prev.forEach((k) => valid.has(k) && next.add(k));
      if (next.size === 0 && allKeys.length) allKeys.forEach((k) => next.add(k));
      return next;
    });
  }, [allKeys]);

  const isAllSelected = selected.size === allKeys.length && allKeys.length > 0;
  const toggleAll = () =>
    setSelected((prev) => {
      if (prev.size === allKeys.length) return new Set();
      const n = new Set();
      allKeys.forEach((k) => n.add(k));
      return n;
    });
  const toggleOne = (key) =>
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(key) ? n.delete(key) : n.add(key);
      return n;
    });

  const deleteSelected = () => {
    cart.forEach((i) => {
      const key = i.key || `${i.type}:${i.id}`;
      if (selected.has(key)) removeFromCart(key);
    });
    setSelected(new Set());
  };

  // ---------- Selected subsets & totals ----------
  const selectedItems = useMemo(
    () => cart.filter((i) => selected.has(i.key || `${i.type}:${i.id}`)),
    [cart, selected]
  );
  const serviceItems = selectedItems.filter((it) => it.type === "service");
  const productItems = selectedItems.filter((it) => it.type === "product");
  const selectedCount = selectedItems.reduce(
    (n, it) => n + (Number(it.quantity) || 0),
    0
  );
  const selectedSubtotal = selectedItems.reduce(
    (sum, it) => sum + Number(it.price || 0) * Number(it.quantity || 0),
    0
  );

  // ---------- Fetch logged-in user ----------
  useEffect(() => {
    api
      .get("/auth/me/")
      .then((res) => setCurrentUser(res.data))
      .catch(() => setCurrentUser(null));
  }, []);

  const ensureLoggedIn = () => {
    if (!currentUser) {
      navigate("/login", { replace: true, state: { from: "/cart" } });
      return false;
    }
    return true;
  };

  // ---------- Proceed handlers ----------
  // Services → booking (first selected service)
  const proceedServices = () => {
    if (serviceItems.length === 0) return;
    if (!ensureLoggedIn()) return;
    const s = serviceItems[0];
    navigate(`/service/${s.id}`, {
      state: { fromCart: true, quantity: s.quantity },
    });
  };

  // Products → checkout (create order with only selected products)
  const proceedProducts = async () => {
    if (productItems.length === 0) return;
    if (!ensureLoggedIn()) return;

    setLoading(true);
    try {
      const items = productItems.map((p) => ({
        product_id: p.id,
        quantity: p.quantity,
      }));

      const payload = {
        customer_id: currentUser?.customer?.id,
        items,
        voucher: voucher || undefined,
      };

      await api.post("/orders/", payload);
      alert("Order placed successfully!");

      // Remove only the selected product items
      productItems.forEach((p) => {
        const key = p.key || `${p.type}:${p.id}`;
        removeFromCart(key);
      });

      navigate("/customerdashboard");
    } catch (err) {
      console.error(err);
      alert("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Single CTA when only one type is selected
  const proceedSmart = () => {
    if (serviceItems.length > 0 && productItems.length === 0) {
      proceedServices();
    } else if (productItems.length > 0 && serviceItems.length === 0) {
      proceedProducts();
    }
  };

  // ---------- Empty state ----------
  if (cart.length === 0) {
    return (
      <div className="cart-empty-wrap">
        <div className="cart-empty-card">
          <img
            src="https://cdn-icons-png.flaticon.com/512/11329/11329060.png"
            alt=""
            className="empty-img"
          />
        <p className="empty-text">There are no items in this cart</p>
          <div className="empty-actions">
            <Link to="/services" className="empty-btn outline">
              Browse Services
            </Link>
            <Link to="/products" className="empty-btn solid">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ---------- Cart with items ----------
  return (
    <div className="cart-page">
      {/* LEFT: items */}
      <div className="cart-left">
        <div className="cart-toolbar">
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <label className="chk">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={toggleAll}
              />
              <span>Select All</span>
            </label>
            <strong style={{ color: "#111827" }}>
              Cart Items ({cart.length})
            </strong>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <Link to="/products" className="toolbar-link">
              Shop More
            </Link>
            <button className="toolbar-delete" onClick={deleteSelected}>
              Delete Selected
            </button>
            <span className="toolbar-sep" />
            <button className="toolbar-delete" onClick={clearCart}>
              Delete All
            </button>
          </div>
        </div>

        <div className="cart-list">
          {cart.map((item) => {
            const idKey = item.key || `${item.type}:${item.id}`;
            const image =
              item.image ||
              item.thumbnail ||
              "https://via.placeholder.com/120x120.png?text=No+Image";
            const canDec = typeof decrementQty === "function";
            const canInc = typeof incrementQty === "function";
            const isChecked = selected.has(idKey);

            return (
              <div key={idKey} className="cart-row">
                <label className="chk">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleOne(idKey)}
                  />
                </label>

                <div className="row-left">
                  <img src={image} alt={item.name} />
                  <div className="row-info">
                    <div className="title">{item.name}</div>
                    <div className="meta">
                      {item.type === "service" ? (
                        <span className="badge badge-green">service</span>
                      ) : (
                        <span className="badge">product</span>
                      )}
                      {item.brand && <span className="muted">• {item.brand}</span>}
                      {item.vendorName && (
                        <span className="muted">• {item.vendorName}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="row-right">
                  <div className="price">
                    <span className="currency">৳</span>
                    {Number(item.price) || 0}
                  </div>

                  <div className="qty">
                    <button
                      className="qty-btn"
                      onClick={() => canDec && decrementQty(idKey)}
                      aria-label="decrease"
                      disabled={!canDec || (item.quantity || 0) <= 1}
                      title={canDec ? "Decrease" : "Qty change not available"}
                    >
                      −
                    </button>
                    <input className="qty-input" value={item.quantity || 0} readOnly />
                    <button
                      className="qty-btn"
                      onClick={() => canInc && incrementQty(idKey)}
                      aria-label="increase"
                      disabled={!canInc}
                      title={canInc ? "Increase" : "Qty change not available"}
                    >
                      +
                    </button>
                  </div>

                  <button className="remove" onClick={() => removeFromCart(idKey)}>
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT: summary */}
      <aside className="cart-summary">
        <h3>Order Summary</h3>

        <div className="sum-row">
          <span>
            Subtotal ({selectedCount} item{selectedCount !== 1 ? "s" : ""})
          </span>
          <span className="taka">৳ {selectedSubtotal}</span>
        </div>
        <div className="sum-row">
          <span>Delivery Fee</span>
          <span className="taka">৳ 0</span>
        </div>

        <div className="voucher">
          <input
            placeholder="Enter Voucher Code"
            value={voucher}
            onChange={(e) => setVoucher(e.target.value)}
          />
          <button className="apply" type="button">
            APPLY
          </button>
        </div>

        <div className="sum-total">
          <span>Total</span>
          <span className="taka big">৳ {selectedSubtotal}</span>
        </div>

        {/* Proceed logic */}
        {serviceItems.length > 0 && productItems.length > 0 ? (
          <div style={{ display: "grid", gap: 10 }}>
            <button className="checkout" onClick={proceedServices}>
              PROCEED TO BOOKING
            </button>
            <button
              className="checkout alt"
              onClick={proceedProducts}
              disabled={loading}
            >
              {loading ? "PROCESSING…" : "PROCEED TO CHECKOUT"}
            </button>
          </div>
        ) : (
          <button
            className="checkout"
            onClick={proceedSmart}
            disabled={loading || selectedCount === 0}
          >
            {serviceItems.length > 0
              ? "PROCEED TO BOOKING"
              : loading
              ? "PLACING…"
              : `PROCEED TO CHECKOUT (${selectedCount})`}
          </button>
        )}

        <div className="helper-links">
          <Link to="/services" className="link">
            Book Services
          </Link>
          <Link to="/products" className="link">
            Shop More Products
          </Link>
        </div>

        {/* (Optional) Whole-cart reference */}
        <div className="muted" style={{ marginTop: 8, fontSize: 12 }}>
          Cart total (all items): ৳ {Number(totalPrice) || 0}
        </div>
      </aside>
    </div>
  );
}

export default CartPage;
