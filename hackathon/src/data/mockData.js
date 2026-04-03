export const MOCK_REQUESTS = [
  {
    id: 'req-1',
    location: 'Lviv Hub',
    coords: [49.8397, 24.0297],
    priority: 'HIGH',
    items: 'Medicine',
    quantity: 1000,
    currentStock: 15,
    status: 'PENDING',
    timestamp: new Date().toISOString(),
  },
  {
    id: 'req-2',
    location: 'Kyiv Central',
    coords: [50.4501, 30.5234],
    priority: 'CRITICAL',
    items: 'Food',
    quantity: 5000,
    currentStock: 60,
    status: 'IN_TRANSIT',
    timestamp: new Date().toISOString(),
  }
];