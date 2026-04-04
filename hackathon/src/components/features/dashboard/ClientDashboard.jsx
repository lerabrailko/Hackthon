import React, { useState, useEffect } from 'react';
import { useGlobalContext } from '../../../context/GlobalStore';
import { useNotify } from '../../../context/NotificationContext';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Іконка для машини
const truckIcon = new L.DivIcon({
  className: 'custom-truck-marker',
  html: `<div style="background: #2563eb; border: 2px solid #fff; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px rgba(59, 130, 246, 0.6);"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#fff" stroke-width="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

const MAIN_HUB_COORDS = [50.4501, 30.5234]; // Київ

const Icons = {
  medicine: <svg style={{ width: '16px', height: '16px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.5 20.5l-6-6a4.5 4.5 0 016.5-6.5l6 6a4.5 4.5 0 01-6.5 6.5z" /><path d="M14 6l4 4" /></svg>,
  food: <svg style={{ width: '16px', height: '16px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2" /><path d="M7 2v20" /><path d="M21 15V2v0a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" /></svg>,
  water: <svg style={{ width: '16px', height: '16px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" /></svg>,
  equipment: <svg style={{ width: '16px', height: '16px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>,
  check: <svg style={{ width: '18px', height: '18px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>,
  mapPin: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>,
  phone: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
};

const ClientDashboard = () => {
  const { requests, addRequest, inventory } = useGlobalContext();
  const { showNotification } = useNotify();

  const [activeTab, setActiveTab] = useState('NEW_ORDER');
  const [cartItem, setCartItem] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [address, setAddress] = useState('');
  const [priority, setPriority] = useState('NORMAL');
  const [searchTerm, setSearchTerm] = useState('');

  // Для мапи в модалці
  const [mapModalOrder, setMapModalOrder] = useState(null);

  const filteredCatalog = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      const diff = endOfDay - now;
      setTimeLeft(`${Math.floor(diff / 3600000)}h ${Math.floor((diff % 3600000) / 60000)}m`);
    };
    updateTimer();
    const int = setInterval(updateTimer, 60000);
    return () => clearInterval(int);
  }, []);

  const handleSubmitOrder = () => {
    if (!cartItem || !quantity || !address) return;
    addRequest({
      id: `ORD-${Math.floor(Math.random() * 10000)}`,
      location: address,
      coords: [49.0 + Math.random(), 31.0 + Math.random()], // Імітація координатів для карти
      items: cartItem.name,
      priority: priority,
      quantity: Number(quantity),
      currentStock: 0,
      status: 'PENDING', // Статус замовлення
      timestamp: new Date().toISOString(),
    });
    showNotification(`Order for ${quantity}x ${cartItem.name} placed successfully`, 'success');
    setCartItem(null); setQuantity(''); setAddress(''); setPriority('NORMAL');
    setActiveTab('MY_ORDERS');
  };

  //  Фільтруємо замовлення користувача (ті, що не доставлені)
  const myOrders = requests.filter(r => r.status !== 'DELIVERED');

  return (
    <div style={{ display: 'flex', height: '100%', backgroundColor: '#09090b', color: '#d4d4d8', fontFamily: 'system-ui, sans-serif' }}>

      {/* ЛІВА ЧАСТИНА: ТАБИ ТА КАТАЛОГ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: '1px solid #27272a', position: 'relative' }}>
        <div style={{ display: 'flex', padding: '24px 24px 0 24px', borderBottom: '1px solid #27272a' }}>
          <button onClick={() => setActiveTab('NEW_ORDER')} style={{ padding: '12px 24px', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer', background: 'transparent', border: 'none', position: 'relative', color: activeTab === 'NEW_ORDER' ? '#3b82f6' : '#a1a1aa' }}>
            Create Order
            {activeTab === 'NEW_ORDER' && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', backgroundColor: '#3b82f6' }}></div>}
          </button>
          <button onClick={() => setActiveTab('MY_ORDERS')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer', background: 'transparent', border: 'none', position: 'relative', color: activeTab === 'MY_ORDERS' ? '#3b82f6' : '#a1a1aa' }}>
            My Active Orders
            <span style={{ backgroundColor: '#27272a', color: '#f4f4f5', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem' }}>{myOrders.length}</span>
            {activeTab === 'MY_ORDERS' && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', backgroundColor: '#3b82f6' }}></div>}
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {activeTab === 'NEW_ORDER' ? (
            <div className="animate-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#f4f4f5', margin: '0 0 4px 0' }}>Live Supply Catalog</h2>
                  <p style={{ color: '#a1a1aa', fontSize: '0.85rem', margin: 0 }}>Select items to start order configuration</p>
                </div>
                <input type="text" placeholder="Search catalog..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ padding: '10px 16px', backgroundColor: '#18181b', border: '1px solid #27272a', color: '#fff', borderRadius: '8px', outline: 'none' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {filteredCatalog.map(item => {
                  const outOfStock = item.qty === 0;
                  return (
                    <div
                      key={item.sku}
                      onClick={() => !outOfStock && setCartItem(item)}
                      style={{
                        backgroundColor: cartItem?.sku === item.sku ? 'rgba(59, 130, 246, 0.05)' : '#18181b',
                        border: `1px solid ${cartItem?.sku === item.sku ? '#3b82f6' : '#27272a'}`,
                        borderRadius: '12px', padding: '20px', cursor: outOfStock ? 'not-allowed' : 'pointer', transition: '0.2s', opacity: outOfStock ? 0.5 : 1
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: '700', color: '#a1a1aa', textTransform: 'uppercase' }}>
                          {Icons[item.category.toLowerCase()] || Icons.equipment} {item.category}
                        </span>
                        {!outOfStock ? (
                          <span style={{ fontSize: '0.65rem', fontWeight: '800', padding: '4px 8px', backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', borderRadius: '4px', textTransform: 'uppercase' }}>In Stock</span>
                        ) : (
                          <span style={{ fontSize: '0.65rem', fontWeight: '800', padding: '4px 8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '4px', textTransform: 'uppercase' }}>Empty</span>
                        )}
                      </div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#f4f4f5', margin: '0 0 4px 0' }}>{item.name}</h3>
                      <div style={{ fontSize: '0.75rem', color: '#a1a1aa', marginBottom: '20px' }}>SKU: {item.sku}</div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <div>
                          <div style={{ fontSize: '0.65rem', color: '#a1a1aa', textTransform: 'uppercase', fontWeight: '700' }}>Available</div>
                          <div style={{ fontSize: '0.9rem', fontWeight: '700', color: !outOfStock ? '#e4e4e7' : '#ef4444' }}>{item.qty.toLocaleString()} units</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.65rem', color: '#a1a1aa', textTransform: 'uppercase', fontWeight: '700' }}>Hub</div>
                          <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#d4d4d8' }}>{item.warehouse.split(' ')[0]}</div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="animate-in">
              <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#f4f4f5', marginBottom: '24px' }}>Active Orders</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px' }}>

                {myOrders.map(order => {
                  const isTransit = order.status === 'IN_TRANSIT';
                  const isPending = order.status === 'PENDING' || order.status === 'DRAFT';
                  // Логіка для прогрес-бару (точечок)
                  const progressWidth = isTransit ? '50%' : (isPending ? '0%' : '100%');

                  return (
                    <div key={order.id} style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

                      {/* Хедер замовлення */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', color: '#f4f4f5' }}>{order.items} <span style={{ fontSize: '0.85rem', color: '#71717a' }}>x{order.quantity}</span></h3>
                          <p style={{ margin: 0, fontSize: '0.85rem', color: '#a1a1aa' }}>Destination: {order.location}</p>
                          <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: '#71717a' }}>ID: {order.id}</p>
                        </div>
                        <span style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', backgroundColor: isTransit ? 'rgba(59, 130, 246, 0.1)' : 'rgba(249, 115, 22, 0.1)', color: isTransit ? '#3b82f6' : '#f97316', border: `1px solid ${isTransit ? 'rgba(59, 130, 246, 0.2)' : 'rgba(249, 115, 22, 0.2)'}` }}>
                          {order.status}
                        </span>
                      </div>

                      {/* ТАЙМЛАЙН З ТОЧЕЧКАМИ ВІДНОВЛЕНО */}
                      <div style={{ position: 'relative', padding: '10px 0' }}>
                        <div style={{ position: 'absolute', top: '18px', left: '10px', right: '10px', height: '4px', backgroundColor: '#27272a', borderRadius: '2px' }}></div>
                        <div style={{ position: 'absolute', top: '18px', left: '10px', height: '4px', backgroundColor: '#3b82f6', borderRadius: '2px', transition: 'width 0.5s', width: progressWidth }}></div>

                        <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '60px' }}>
                            <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#3b82f6', border: '3px solid #18181b', zIndex: 1, marginBottom: '8px' }}></div>
                            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#d4d4d8' }}>Processing</span>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '60px' }}>
                            <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: isTransit ? '#3b82f6' : '#3f3f46', border: '3px solid #18181b', zIndex: 1, marginBottom: '8px' }}></div>
                            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: isTransit ? '#d4d4d8' : '#71717a' }}>Dispatched</span>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '60px' }}>
                            <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#3f3f46', border: '3px solid #18181b', zIndex: 1, marginBottom: '8px' }}></div>
                            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#71717a' }}>Delivered</span>
                          </div>
                        </div>
                      </div>

                      {/* КНОПКИ: ЗВ'ЯЗОК І МАПА (Доступні, якщо машина в дорозі) */}
                      {isTransit && (
                        <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid #27272a', paddingTop: '20px' }}>
                          <button onClick={() => setMapModalOrder(order)} style={{ flex: 1, padding: '12px', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', transition: '0.2s' }}>
                            {Icons.mapPin} Live Tracking
                          </button>
                          <button onClick={() => showNotification('Calling Driver (Taras - AI-1020)...', 'info')} style={{ flex: 1, padding: '12px', backgroundColor: 'transparent', color: '#a1a1aa', border: '1px solid #3f3f46', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', transition: '0.2s' }}>
                            {Icons.phone} Contact Driver
                          </button>
                        </div>
                      )}

                    </div>
                  );
                })}
                {myOrders.length === 0 && <div style={{ color: '#71717a' }}>No active orders at the moment.</div>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ПРАВА ЧАСТИНА: ПАНЕЛЬ ОФОРМЛЕННЯ ЗАМОВЛЕННЯ */}
      <div style={{ width: '420px', backgroundColor: '#09090b', borderLeft: '1px solid #27272a', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #27272a', backgroundColor: '#18181b' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '700', margin: '0 0 4px 0' }}>Order Configuration</h2>
          <p style={{ color: '#a1a1aa', fontSize: '0.85rem', margin: 0 }}>Finalize delivery details</p>
        </div>

        <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          {!cartItem ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', border: '1px dashed #3f3f46', borderRadius: '16px', backgroundColor: 'rgba(39, 39, 42, 0.3)' }}>
              <span style={{ fontSize: '2rem', marginBottom: '16px' }}>👈</span>
              <p style={{ color: '#a1a1aa', fontWeight: '600', margin: 0 }}>Please select an item</p>
              <p style={{ color: '#71717a', fontSize: '0.85rem', margin: '4px 0 0 0' }}>Click on any card in the catalog to begin</p>
            </div>
          ) : (
            <div className="animate-in" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', padding: '16px', marginBottom: '24px', display: 'flex', gap: '12px' }}>
                <div style={{ fontSize: '1.2rem' }}>⏱</div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#f87171', textTransform: 'uppercase' }}>Dispatch Cut-off</div>
                  <div style={{ fontSize: '0.85rem', color: '#d4d4d8' }}>Locks in <strong style={{ color: '#fff' }}>{timeLeft}</strong></div>
                </div>
              </div>

              <div style={{ backgroundColor: '#18181b', border: '1px solid #3b82f6', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#3b82f6', textTransform: 'uppercase', marginBottom: '8px' }}>Selected For Order</div>
                <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#f4f4f5' }}>{cartItem.name}</div>
                <div style={{ fontSize: '0.85rem', color: '#a1a1aa', marginTop: '4px' }}>Max available: {cartItem.qty.toLocaleString()} units</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#a1a1aa', textTransform: 'uppercase', marginBottom: '8px' }}>Quantity Needed</label>
                  <input type="number" min="1" max={cartItem.qty} placeholder={`Max: ${cartItem.qty}`} value={quantity} onChange={(e) => setQuantity(e.target.value)} style={{ width: '100%', backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', padding: '14px 16px', color: '#f4f4f5', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#a1a1aa', textTransform: 'uppercase', marginBottom: '8px' }}>Delivery Address</label>
                  <input type="text" placeholder="e.g. Kharkiv Central Hospital" value={address} onChange={(e) => setAddress(e.target.value)} style={{ width: '100%', backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', padding: '14px 16px', color: '#f4f4f5', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#a1a1aa', textTransform: 'uppercase', marginBottom: '8px' }}>Urgency Level</label>
                  <select value={priority} onChange={(e) => setPriority(e.target.value)} style={{ width: '100%', backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', padding: '14px 16px', color: '#f4f4f5', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' }}>
                    <option value="NORMAL">Standard Restock</option>
                    <option value="HIGH">High Priority</option>
                    <option value="CRITICAL">Critical Emergency (SOS)</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleSubmitOrder}
                disabled={!quantity || !address}
                style={{
                  marginTop: 'auto', width: '100%', padding: '16px', borderRadius: '12px', fontSize: '1rem', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: 'none',
                  backgroundColor: quantity && address ? '#2563eb' : '#27272a', color: quantity && address ? '#ffffff' : '#71717a', cursor: quantity && address ? 'pointer' : 'not-allowed',
                }}
              >
                {quantity && address ? 'CONFIRM AND SEND' : 'FILL REQUIRED FIELDS'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* МОДАЛЬНЕ ВІКНО КАРТИ ДЛЯ КЛІЄНТА */}
      {mapModalOrder && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div className="animate-in" style={{ width: '90%', maxWidth: '1000px', height: '80vh', backgroundColor: '#18181b', borderRadius: '16px', border: '1px solid #3f3f46', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.8)' }}>

            <div style={{ padding: '20px 24px', borderBottom: '1px solid #27272a', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#09090b' }}>
              <div>
                <h3 style={{ margin: '0 0 4px 0', color: '#fff', fontSize: '1.2rem' }}>Live Tracking: <span style={{ color: '#3b82f6' }}>{mapModalOrder.items}</span></h3>
                <span style={{ color: '#a1a1aa', fontSize: '0.85rem' }}>Destination: {mapModalOrder.location}</span>
              </div>
              <button onClick={() => setMapModalOrder(null)} style={{ background: 'transparent', border: '1px solid #3f3f46', color: '#a1a1aa', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Close Map</button>
            </div>

            <div style={{ flex: 1, position: 'relative' }}>
              <MapContainer center={mapModalOrder.coords || [49.0, 31.0]} zoom={6} zoomControl={false} style={{ height: '100%', width: '100%', background: '#09090b' }}>
                <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

                {/* Маркер точки призначення */}
                <Marker position={mapModalOrder.coords || [49.0, 31.0]} />

                {/* Маркер Фури (імітуємо, що вона десь посередині маршруту) */}
                <Marker
                  position={[(MAIN_HUB_COORDS[0] + (mapModalOrder.coords?.[0] || 49.0)) / 2, (MAIN_HUB_COORDS[1] + (mapModalOrder.coords?.[1] || 31.0)) / 2]}
                  icon={truckIcon}
                  zIndexOffset={1000}
                />

                {/* Лінія маршруту від Хабу до Клієнта */}
                <Polyline
                  positions={[MAIN_HUB_COORDS, mapModalOrder.coords || [49.0, 31.0]]}
                  pathOptions={{ color: '#3b82f6', weight: 4, dashArray: '10, 15', opacity: 0.6 }}
                />
              </MapContainer>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ClientDashboard;