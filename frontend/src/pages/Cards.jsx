import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCard,
  Plus,
  Shield,
  Lock,
  Unlock,
  Sliders,
  Wifi,
  Copy,
  Check,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Trash2,
  X,
  Smartphone,
  Globe,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { formatINR } from '../utils/helpers';

const INITIAL_CARDS = [
  {
    id: 'card-1',
    name: 'Student Campus Platinum',
    holder: 'Aarav Sharma',
    last4: '4829',
    expiry: '08/29',
    type: 'Debit',
    brand: 'Visa',
    gradient: 'linear-gradient(135deg, #0f4c3a 0%, #1a8a68 50%, #0d3829 100%)',
    accentColor: '#00e599',
    isPrimary: true,
    isFrozen: false,
    onlineActive: true,
    contactlessActive: true,
    internationalActive: false,
    dailyLimit: 25000,
    currentSpent: 8450,
  },
  {
    id: 'card-2',
    name: 'Online Subscriptions & Tech',
    holder: 'Aarav Sharma',
    last4: '8192',
    expiry: '11/28',
    type: 'Virtual',
    brand: 'Mastercard',
    gradient: 'linear-gradient(135deg, #2b1b54 0%, #4a2896 50%, #1e133d 100%)',
    accentColor: '#8b5cf6',
    isPrimary: false,
    isFrozen: false,
    onlineActive: true,
    contactlessActive: false,
    internationalActive: true,
    dailyLimit: 15000,
    currentSpent: 3200,
  },
  {
    id: 'card-3',
    name: 'Campus Cafeteria & Books',
    holder: 'Aarav Sharma',
    last4: '1045',
    expiry: '05/27',
    type: 'Prepaid Wallet',
    brand: 'RuPay',
    gradient: 'linear-gradient(135deg, #103b57 0%, #196f9e 50%, #0c273a 100%)',
    accentColor: '#38bdf8',
    isPrimary: false,
    isFrozen: false,
    onlineActive: false,
    contactlessActive: true,
    internationalActive: false,
    dailyLimit: 5000,
    currentSpent: 1850,
  },
];

export default function Cards() {
  const { summary, transactions } = useApp();
  const { user } = useAuth();

  // Load cards from localStorage or default
  const [cards, setCards] = useState(() => {
    try {
      const saved = localStorage.getItem('user_payment_cards');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_CARDS;
  });

  const [selectedCardId, setSelectedCardId] = useState(() => cards[0]?.id || 'card-1');
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New card form state
  const [newCard, setNewCard] = useState({
    name: '',
    holder: user?.name || 'Aarav Sharma',
    last4: '',
    expiry: '12/28',
    type: 'Debit',
    brand: 'Visa',
    gradient: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
    dailyLimit: 10000,
  });

  // Save cards to localStorage
  useEffect(() => {
    localStorage.setItem('user_payment_cards', JSON.stringify(cards));
  }, [cards]);

  const selectedCard = cards.find((c) => c.id === selectedCardId) || cards[0];

  const handleToggleFreeze = (cardId) => {
    setCards((prev) =>
      prev.map((c) => {
        if (c.id === cardId) {
          const nextState = !c.isFrozen;
          toast(nextState ? 'Card has been locked' : 'Card has been unlocked', {
            icon: nextState ? '🔒' : '🔓',
          });
          return { ...c, isFrozen: nextState };
        }
        return c;
      })
    );
  };

  const handleToggleSetting = (cardId, settingKey) => {
    setCards((prev) =>
      prev.map((c) => {
        if (c.id === cardId) {
          const next = !c[settingKey];
          toast.success(`Updated ${settingKey.replace('Active', '')} preference`);
          return { ...c, [settingKey]: next };
        }
        return c;
      })
    );
  };

  const handleLimitChange = (cardId, limit) => {
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, dailyLimit: limit } : c))
    );
  };

  const handleCopyNumber = (card) => {
    const fullNum = `4532 •••• •••• ${card.last4}`;
    navigator.clipboard?.writeText(fullNum);
    setCopiedId(card.id);
    toast.success('Card number copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddCard = (e) => {
    e.preventDefault();
    if (!newCard.name.trim() || !newCard.last4.trim()) {
      toast.error('Please enter a card name and last 4 digits');
      return;
    }
    const cleanLast4 = newCard.last4.replace(/\D/g, '').slice(-4);
    if (cleanLast4.length < 4) {
      toast.error('Please enter 4 digits for the card number');
      return;
    }

    const created = {
      id: `card-${Date.now()}`,
      name: newCard.name.trim(),
      holder: newCard.holder.trim() || user?.name || 'Aarav Sharma',
      last4: cleanLast4,
      expiry: newCard.expiry || '12/28',
      type: newCard.type,
      brand: newCard.brand,
      gradient: newCard.gradient,
      accentColor: '#38bdf8',
      isPrimary: false,
      isFrozen: false,
      onlineActive: true,
      contactlessActive: true,
      internationalActive: false,
      dailyLimit: Number(newCard.dailyLimit) || 10000,
      currentSpent: 0,
    };

    setCards((prev) => [...prev, created]);
    setSelectedCardId(created.id);
    setShowAddModal(false);
    toast.success('New card added successfully!');
    setNewCard({
      name: '',
      holder: user?.name || 'Aarav Sharma',
      last4: '',
      expiry: '12/28',
      type: 'Debit',
      brand: 'Visa',
      gradient: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
      dailyLimit: 10000,
    });
  };

  const handleDeleteCard = (cardId) => {
    if (cards.length <= 1) {
      toast.error('You must keep at least one active card.');
      return;
    }
    const filtered = cards.filter((c) => c.id !== cardId);
    setCards(filtered);
    setSelectedCardId(filtered[0]?.id || '');
    toast.success('Card removed');
  };

  return (
    <main className="page" id="cards-page">
      {/* ── Page Header ── */}
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">My Cards & Wallets</h1>
          <p className="page-subtitle">
            Manage your student debit cards, virtual payment tokens, and daily spending limits
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={16} />
            <span>Add New Card</span>
          </button>
        </div>
      </div>

      {/* ── Cards Display Row ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 20,
          marginBottom: 30,
        }}
      >
        {cards.map((card) => {
          const isSelected = card.id === selectedCardId;
          return (
            <div
              key={card.id}
              onClick={() => setSelectedCardId(card.id)}
              style={{
                position: 'relative',
                borderRadius: 20,
                padding: '24px',
                background: card.gradient,
                boxShadow: isSelected
                  ? '0 12px 30px rgba(0, 229, 153, 0.25), 0 0 0 2px #00e599'
                  : '0 8px 24px rgba(0, 0, 0, 0.3)',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                color: '#fff',
                minHeight: 200,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                opacity: card.isFrozen ? 0.75 : 1,
                filter: card.isFrozen ? 'grayscale(0.5)' : 'none',
              }}
            >
              {/* Card Top Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', opacity: 0.85 }}>
                    {card.name}
                  </div>
                  <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>
                    {card.type} • {card.brand}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Wifi size={18} style={{ opacity: card.contactlessActive ? 0.9 : 0.3 }} />
                  {card.isPrimary && (
                    <span
                      style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(4px)',
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 20,
                        letterSpacing: '0.05em',
                      }}
                    >
                      PRIMARY
                    </span>
                  )}
                  {card.isFrozen && (
                    <span
                      style={{
                        background: '#dc2626',
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 20,
                      }}
                    >
                      LOCKED
                    </span>
                  )}
                </div>
              </div>

              {/* EMV Chip & Number */}
              <div style={{ margin: '18px 0' }}>
                <div
                  style={{
                    width: 36,
                    height: 26,
                    borderRadius: 6,
                    background: 'linear-gradient(135deg, #ffd700 0%, #b8860b 100%)',
                    marginBottom: 12,
                    border: '1px solid rgba(255, 215, 0, 0.5)',
                  }}
                />
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    letterSpacing: '0.18em',
                    fontFamily: 'monospace',
                    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                  }}
                >
                  {showCardNumber ? `4532 8920 1148 ${card.last4}` : `•••• •••• •••• ${card.last4}`}
                </div>
              </div>

              {/* Card Bottom Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <div style={{ fontSize: 9, textTransform: 'uppercase', opacity: 0.7, letterSpacing: '0.08em' }}>
                    Card Holder
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {card.holder}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 9, textTransform: 'uppercase', opacity: 0.7, letterSpacing: '0.08em' }}>
                    Expires
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{card.expiry}</div>
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, fontStyle: 'italic' }}>
                  {card.brand}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Selected Card Details & Management Center ── */}
      {selectedCard && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
          {/* Card Controls Panel */}
          <div className="card">
            <div className="card__header flex-between">
              <div>
                <h2 className="card__title">{selectedCard.name} Settings</h2>
                <span className="text-muted text-sm">Security, permissions, and spending limits</span>
              </div>
              <button
                type="button"
                className={`btn btn-sm ${selectedCard.isFrozen ? 'btn-danger' : 'btn-secondary'}`}
                onClick={() => handleToggleFreeze(selectedCard.id)}
              >
                {selectedCard.isFrozen ? <Unlock size={14} /> : <Lock size={14} />}
                <span>{selectedCard.isFrozen ? 'Unlock Card' : 'Freeze Card'}</span>
              </button>
            </div>

            <div className="card__body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Daily Limit Slider */}
              <div
                style={{
                  background: 'var(--color-surface-2)',
                  padding: 16,
                  borderRadius: 12,
                  border: '1px solid var(--color-border)',
                }}
              >
                <div className="flex-between" style={{ marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Daily Spending Limit</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-accent)' }}>
                    ₹{selectedCard.dailyLimit.toLocaleString('en-IN')}
                  </span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="50000"
                  step="1000"
                  value={selectedCard.dailyLimit}
                  onChange={(e) => handleLimitChange(selectedCard.id, Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--color-accent)', cursor: 'pointer' }}
                />
                <div className="flex-between text-muted text-xs" style={{ marginTop: 6 }}>
                  <span>Min: ₹2,000</span>
                  <span>Spent today: ₹{selectedCard.currentSpent.toLocaleString('en-IN')}</span>
                  <span>Max: ₹50,000</span>
                </div>
              </div>

              {/* Toggles List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div
                  className="flex-between"
                  style={{
                    padding: '12px 14px',
                    borderRadius: 10,
                    background: 'var(--color-surface-2)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Globe size={18} className="text-muted" />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>Online E-Commerce Payments</div>
                      <div className="text-muted text-xs">Allow transactions on Amazon, Swiggy, Uber, etc.</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedCard.onlineActive}
                    onChange={() => handleToggleSetting(selectedCard.id, 'onlineActive')}
                    style={{ transform: 'scale(1.2)', cursor: 'pointer', accentColor: 'var(--color-accent)' }}
                  />
                </div>

                <div
                  className="flex-between"
                  style={{
                    padding: '12px 14px',
                    borderRadius: 10,
                    background: 'var(--color-surface-2)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Wifi size={18} className="text-muted" />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>Contactless Tap & Pay</div>
                      <div className="text-muted text-xs">NFC POS machine tap payments up to ₹5,000</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedCard.contactlessActive}
                    onChange={() => handleToggleSetting(selectedCard.id, 'contactlessActive')}
                    style={{ transform: 'scale(1.2)', cursor: 'pointer', accentColor: 'var(--color-accent)' }}
                  />
                </div>

                <div
                  className="flex-between"
                  style={{
                    padding: '12px 14px',
                    borderRadius: 10,
                    background: 'var(--color-surface-2)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Smartphone size={18} className="text-muted" />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>International Transactions</div>
                      <div className="text-muted text-xs">Foreign payments (GitHub, Coursera, Figma)</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedCard.internationalActive}
                    onChange={() => handleToggleSetting(selectedCard.id, 'internationalActive')}
                    style={{ transform: 'scale(1.2)', cursor: 'pointer', accentColor: 'var(--color-accent)' }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowCardNumber(!showCardNumber)}
                >
                  {showCardNumber ? <EyeOff size={14} /> : <Eye size={14} />}
                  <span>{showCardNumber ? 'Hide Full Number' : 'Show Full Number'}</span>
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleCopyNumber(selectedCard)}
                >
                  {copiedId === selectedCard.id ? <Check size={14} /> : <Copy size={14} />}
                  <span>Copy Number</span>
                </button>
                {!selectedCard.isPrimary && (
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    style={{ marginLeft: 'auto' }}
                    onClick={() => handleDeleteCard(selectedCard.id)}
                  >
                    <Trash2 size={14} />
                    <span>Remove Card</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Card Spending Summary & Quick Action */}
          <div className="card">
            <div className="card__header">
              <h2 className="card__title">Card Activity & Quick Spends</h2>
              <span className="text-muted text-sm">Real-time ledger overview</span>
            </div>

            <div className="card__body" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Primary Balance sync */}
              <div
                style={{
                  padding: 16,
                  borderRadius: 12,
                  background: 'rgba(0, 229, 153, 0.08)',
                  border: '1px solid rgba(0, 229, 153, 0.2)',
                }}
              >
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Available Student Balance</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-income)', marginTop: 4 }}>
                  ₹{summary?.netSavings || '0.00'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>
                  Synced live from your persistent expense ledger
                </div>
              </div>

              {/* Quick Record Transaction Button */}
              <div
                style={{
                  padding: 16,
                  borderRadius: 12,
                  background: 'var(--color-surface-2)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 600 }}>Make a Payment or Record Expense</div>
                <p className="text-muted text-xs" style={{ margin: '6px 0 14px' }}>
                  Need to record a coffee, cafeteria meal, or textbook purchase made with this card?
                </p>
                <Link to="/add" className="btn btn-primary w-full">
                  <span>Go to Add Transaction</span>
                  <ArrowRight size={15} />
                </Link>
              </div>

              {/* Security info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--color-text-muted)' }}>
                <Shield size={16} color="var(--color-accent)" />
                <span>256-bit bank-grade tokenization active on all student cards.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Card Modal ── */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20,
          }}
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="card"
            style={{ width: '100%', maxWidth: 480, margin: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card__header flex-between">
              <h2 className="card__title">Link New Card or Wallet</h2>
              <button
                type="button"
                className="btn btn-icon btn-secondary"
                onClick={() => setShowAddModal(false)}
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleAddCard} className="card__body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Card Label / Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. HDFC Student Debit or Campus Canteen"
                  value={newCard.name}
                  onChange={(e) => setNewCard({ ...newCard, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Cardholder Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={newCard.holder}
                  onChange={(e) => setNewCard({ ...newCard, holder: e.target.value })}
                  placeholder="Student Full Name"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Last 4 Digits *</label>
                  <input
                    type="text"
                    maxLength={4}
                    className="form-input"
                    placeholder="9924"
                    value={newCard.last4}
                    onChange={(e) => setNewCard({ ...newCard, last4: e.target.value.replace(/\D/g, '') })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Expiry (MM/YY)</label>
                  <input
                    type="text"
                    maxLength={5}
                    className="form-input"
                    placeholder="12/28"
                    value={newCard.expiry}
                    onChange={(e) => setNewCard({ ...newCard, expiry: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Card Type</label>
                  <select
                    className="form-select"
                    value={newCard.type}
                    onChange={(e) => setNewCard({ ...newCard, type: e.target.value })}
                  >
                    <option value="Debit">Debit Card</option>
                    <option value="Credit">Credit Card</option>
                    <option value="Virtual">Virtual Card</option>
                    <option value="Campus Wallet">Campus Wallet</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Network</label>
                  <select
                    className="form-select"
                    value={newCard.brand}
                    onChange={(e) => setNewCard({ ...newCard, brand: e.target.value })}
                  >
                    <option value="Visa">Visa</option>
                    <option value="Mastercard">Mastercard</option>
                    <option value="RuPay">RuPay</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Card Color Theme</label>
                <select
                  className="form-select"
                  value={newCard.gradient}
                  onChange={(e) => setNewCard({ ...newCard, gradient: e.target.value })}
                >
                  <option value="linear-gradient(135deg, #0f4c3a 0%, #1a8a68 50%, #0d3829 100%)">Emerald Mint</option>
                  <option value="linear-gradient(135deg, #2b1b54 0%, #4a2896 50%, #1e133d 100%)">Midnight Purple</option>
                  <option value="linear-gradient(135deg, #103b57 0%, #196f9e 50%, #0c273a 100%)">Ocean Cyan</option>
                  <option value="linear-gradient(135deg, #4a1525 0%, #832238 50%, #300c17 100%)">Crimson Ruby</option>
                  <option value="linear-gradient(135deg, #1e293b 0%, #334155 100%)">Obsidian Slate</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

