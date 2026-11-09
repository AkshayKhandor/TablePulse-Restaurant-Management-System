import React, { useEffect, useMemo, useRef, useState } from 'react';
import api from '../services/api';
import { getMenuImage } from '../utils/localMenuImage';
import { Search, ShoppingCart, Plus, Minus, Trash2, UtensilsCrossed, CheckCircle2, ReceiptText, X } from 'lucide-react';

const PAYMENT_METHODS = [
  { key: 'cash', label: 'Cash' },
  { key: 'upi', label: 'UPI' },
  { key: 'card', label: 'Card' },
];

const money = (value) => `₹${Number(value || 0).toFixed(2)}`;
const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char]));

function broadcast(type) {
  try {
    const channel = new BroadcastChannel('tablepulse');
    channel.postMessage({ type });
    channel.close();
  } catch (_) { /* Broadcasting is optional. */ }
}

function FoodImage({ item, className = '' }) {
  return (
    <img
      src={getMenuImage(item)}
      alt={item.name}
      className={className}
      loading="lazy"
      onError={(event) => {
        if (!event.currentTarget.src.endsWith('/images/food.png')) {
          event.currentTarget.src = '/images/food.png';
        }
      }}
    />
  );
}

export default function POS() {
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [tableNumber, setTableNumber] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [checkoutDone, setCheckoutDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const successTimer = useRef(null);

  useEffect(() => {
    let active = true;
    api.get('/menu')
      .then(({ data }) => { if (active) setMenuItems(Array.isArray(data) ? data : []); })
      .catch(() => { if (active) setError('Could not load menu items. Check that the backend is running.'); });
    return () => { active = false; clearTimeout(successTimer.current); };
  }, []);

  const addToCart = (item) => {
    setCart((previous) => {
      const existing = previous.find((entry) => entry.menuItem._id === item._id);
      return existing
        ? previous.map((entry) => entry.menuItem._id === item._id ? { ...entry, quantity: entry.quantity + 1 } : entry)
        : [...previous, { menuItem: item, quantity: 1, price: Number(item.price) }];
    });
  };

  const updateQuantity = (id, delta) => setCart((previous) => previous.map((entry) =>
    entry.menuItem._id === id ? { ...entry, quantity: Math.max(1, entry.quantity + delta) } : entry
  ));
  const removeFromCart = (id) => setCart((previous) => previous.filter((entry) => entry.menuItem._id !== id));

  const subTotal = cart.reduce((sum, entry) => sum + entry.price * entry.quantity, 0);
  const taxAmount = subTotal * 0.05;
  const totalAmount = subTotal + taxAmount;
  const cartCount = cart.reduce((sum, entry) => sum + entry.quantity, 0);

  const categories = useMemo(() => ['All', ...new Set(menuItems.map((item) => item.category).filter(Boolean))], [menuItems]);
  const filteredItems = useMemo(() => menuItems.filter((item) => {
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    const matchesSearch = `${item.name} ${item.category || ''}`.toLowerCase().includes(search.trim().toLowerCase());
    return matchesCategory && matchesSearch;
  }), [menuItems, categoryFilter, search]);

  const handleCheckout = async () => {
    if (!cart.length || loading) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/orders', {
        items: cart.map((entry) => ({ menuItem: entry.menuItem._id, quantity: entry.quantity, price: entry.price })),
        tableNumber, subTotal, taxAmount, totalAmount, paymentMethod,
      });
      broadcast('order_created');

      const receiptItems = cart.map((entry) => `
        <div class="line"><span>${escapeHtml(entry.menuItem.name)} × ${entry.quantity}</span>
        <span>${money(entry.price * entry.quantity)}</span></div>`).join('');
      const receipt = `<!doctype html><html><head><meta charset="utf-8" />
        <title>TablePulse - Receipt</title><style>
        body{font:13px Arial,sans-serif;color:#111;max-width:360px;margin:25px auto;padding:12px}
        h1{margin:0;color:#2563eb}p{color:#666}.line{display:flex;justify-content:space-between;gap:15px;margin:10px 0}
        hr{border:0;border-top:1px dashed #aaa;margin:15px 0}.total{font-size:18px;font-weight:bold}
        </style></head><body><h1>TablePulse</h1><p>Smart Restaurant Management</p>
        <div>Bill #${escapeHtml(data?.billId || '')}</div>
        <div>Table: ${escapeHtml(tableNumber || 'Takeaway')}</div>
        <div>Payment: ${escapeHtml(paymentMethod.toUpperCase())}</div>
        <div>Date: ${escapeHtml(new Date().toLocaleString('en-IN'))}</div>
        <hr>${receiptItems}<hr>
        <div class="line"><span>Subtotal</span><span>${money(subTotal)}</span></div>
        <div class="line"><span>GST (5%)</span><span>${money(taxAmount)}</span></div><hr>
        <div class="line total"><span>Total</span><span>${money(totalAmount)}</span></div>
        <p style="text-align:center">Thank you for dining with us!</p></body></html>`;
      const printWindow = window.open('', '_blank', 'width=480,height=650');
      if (printWindow) {
        printWindow.document.write(receipt);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
      } else {
        setError('Order saved, but the receipt popup was blocked. Allow popups to print receipts.');
      }
      setCart([]);
      setTableNumber('');
      setCheckoutDone(true);
      clearTimeout(successTimer.current);
      successTimer.current = setTimeout(() => setCheckoutDone(false), 3000);
    } catch (err) {
      console.error('Checkout failed', err);
      setError('Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-500">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">Cashier workspace</p>
          <h1 className="text-2xl font-extrabold text-white mt-1">POS & Billing</h1>
          <p className="text-sm text-zinc-400 mt-1">Select dishes, manage the order and generate a bill.</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-300">
          <ReceiptText size={17} className="text-blue-400" /> {cartCount} items selected
        </div>
      </div>

      {error && <div role="alert" className="flex items-center justify-between gap-3 rounded-xl border border-amber-700 bg-amber-950/40 px-4 py-3 text-sm text-amber-200">
        <span>{error}</span><button onClick={() => setError('')} aria-label="Dismiss error"><X size={16} /></button>
      </div>}

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_380px] gap-5 items-start">
        <section className="min-w-0 rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4 md:p-5">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-4">
            <h2 className="font-bold text-white">Food catalog <span className="text-xs font-normal text-zinc-500">({filteredItems.length})</span></h2>
            <div className="relative sm:w-72">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search food or category..."
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 py-2.5 pl-9 pr-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500" />
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-3 mb-3">
            {categories.map((category) => <button key={category} onClick={() => setCategoryFilter(category)}
              className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${categoryFilter === category ? 'bg-blue-600 text-white' : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white'}`}>
              {category}
            </button>)}
          </div>
          {filteredItems.length === 0 ? (
            <div className="py-20 text-center text-zinc-500"><UtensilsCrossed className="mx-auto mb-3" size={32} />No matching dishes found</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-3">
              {filteredItems.map((item) => {
                const quantity = cart.find((entry) => entry.menuItem._id === item._id)?.quantity || 0;
                return <button key={item._id} type="button" onClick={() => addToCart(item)}
                  className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/80 p-2.5 text-left hover:border-blue-500 hover:bg-zinc-800/80 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <FoodImage item={item} className="h-20 w-20 rounded-lg object-cover shrink-0 bg-zinc-800" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-white leading-snug line-clamp-2">{item.name}</span>
                    <span className="block text-xs text-zinc-500 mt-1 truncate">{item.category}</span>
                    <span className="flex items-center justify-between gap-1 mt-2">
                      <span className="text-sm font-bold text-blue-400">{money(item.price)}</span>
                      <span className="rounded-md bg-blue-600/20 px-2 py-1 text-xs font-bold text-blue-300">{quantity ? `In cart: ${quantity}` : '+ Add'}</span>
                    </span>
                  </span>
                </button>;
              })}
            </div>
          )}
        </section>

        <aside className="rounded-2xl border border-zinc-700 bg-zinc-900 overflow-hidden xl:sticky xl:top-4">
          <div className="flex items-center justify-between bg-zinc-800/70 px-5 py-4 border-b border-zinc-700">
            <h2 className="flex items-center gap-2 text-white font-bold"><ShoppingCart size={19} className="text-blue-400" /> Current order</h2>
            <span className="rounded-full bg-blue-600 px-2.5 py-0.5 text-xs font-bold text-white">{cartCount}</span>
          </div>
          <div className="p-4 border-b border-zinc-800 space-y-3">
            <label className="block text-xs font-semibold text-zinc-400">Table / section (optional)</label>
            <input value={tableNumber} onChange={(event) => setTableNumber(event.target.value)} placeholder="Leave blank for takeaway"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500" />
            <p className="text-xs font-semibold text-zinc-400">Payment method</p>
            <div className="grid grid-cols-3 gap-2">
              {PAYMENT_METHODS.map((method) => <button key={method.key} type="button" onClick={() => setPaymentMethod(method.key)}
                className={`rounded-lg border py-2.5 text-xs font-semibold ${paymentMethod === method.key ? 'bg-blue-600 border-blue-600 text-white' : 'bg-zinc-800 border-zinc-700 text-zinc-400'}`}>
                {method.label}
              </button>)}
            </div>
          </div>
          <div className="max-h-[360px] min-h-[160px] overflow-y-auto p-4 space-y-2">
            {cart.length === 0 ? <div className="py-9 text-center text-zinc-500"><ShoppingCart size={30} className="mx-auto mb-2 opacity-60" /><p className="text-sm">Your order is empty</p><p className="text-xs mt-1">Select a dish to add it</p></div>
              : cart.map((entry) => <div key={entry.menuItem._id} className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-800/50 p-2">
                <FoodImage item={entry.menuItem} className="h-12 w-12 shrink-0 rounded-lg object-cover" />
                <div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-white">{entry.menuItem.name}</p><p className="text-xs font-semibold text-blue-400 mt-1">{money(entry.price * entry.quantity)}</p></div>
                <div className="flex items-center gap-1">
                  <button onClick={() => updateQuantity(entry.menuItem._id, -1)} aria-label={`Decrease ${entry.menuItem.name}`} className="rounded-md bg-zinc-700 p-1 text-white"><Minus size={13} /></button>
                  <span className="w-5 text-center text-xs font-bold text-white">{entry.quantity}</span>
                  <button onClick={() => updateQuantity(entry.menuItem._id, 1)} aria-label={`Increase ${entry.menuItem.name}`} className="rounded-md bg-zinc-700 p-1 text-white"><Plus size={13} /></button>
                  <button onClick={() => removeFromCart(entry.menuItem._id)} aria-label={`Remove ${entry.menuItem.name}`} className="ml-1 rounded-md bg-zinc-700 p-1 text-red-400"><Trash2 size={13} /></button>
                </div>
              </div>)}
          </div>
          <div className="space-y-3 border-t border-zinc-700 bg-zinc-950/40 p-4">
            <div className="flex justify-between text-sm text-zinc-400"><span>Subtotal</span><span className="text-zinc-200">{money(subTotal)}</span></div>
            <div className="flex justify-between text-sm text-zinc-400"><span>GST (5%)</span><span className="text-zinc-200">{money(taxAmount)}</span></div>
            <div className="flex justify-between border-t border-zinc-700 pt-3 text-lg font-extrabold text-white"><span>Total</span><span className="text-blue-400">{money(totalAmount)}</span></div>
            <button onClick={handleCheckout} disabled={!cart.length || loading} className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500">
              {checkoutDone ? <><CheckCircle2 size={17} /> Bill Generated!</> : loading ? 'Processing...' : <><ReceiptText size={17} /> Print Bill & Checkout</>}
            </button>
            <p className="text-center text-[11px] text-zinc-500">Orders are saved to your existing backend.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
