export const MOCK_REQUESTS = [
  {
    id: 'req-1',
    location: 'Lviv West Hub',
    coords: [49.8397, 24.0297],
    // Маршрут: Київ -> Житомир -> Рівне -> Львів (Траса Е40)
    routePath: [
      [50.4501, 30.5234], [50.4200, 29.8000], [50.2547, 28.6586], [50.5833, 27.6333], [50.6199, 26.2516], [50.1500, 25.1000], [49.8397, 24.0297]
    ],
    priority: 'HIGH',
    items: 'Medicine',
    quantity: 1250,
    currentStock: 15,
    status: 'PENDING',
    timestamp: new Date().toISOString(),
  },
  {
    id: 'req-2',
    location: 'Kharkiv Military Hospital',
    coords: [49.9935, 36.2304],
    // Маршрут: Київ -> Бориспіль -> Полтава -> Харків (Траса М03)
    routePath: [
      [50.4501, 30.5234], [50.3500, 30.9500], [50.2500, 31.7800], [49.9500, 33.1500], [49.5883, 34.5514], [49.7500, 35.3000], [49.9935, 36.2304]
    ],
    priority: 'CRITICAL',
    items: 'Surgical Supplies',
    quantity: 300,
    currentStock: 5,
    status: 'IN_TRANSIT',
    timestamp: new Date().toISOString(),
  },
  {
    id: 'req-3',
    location: 'Odesa Port Hub',
    coords: [46.4825, 30.7233],
    // Маршрут: Київ -> Біла Церква -> Умань -> Одеса (Траса Е95)
    routePath: [
      [50.4501, 30.5234], [49.8000, 30.1167], [48.7485, 30.2215], [47.8500, 30.2600], [46.4825, 30.7233]
    ],
    priority: 'NORMAL',
    items: 'Power Generators',
    quantity: 45,
    currentStock: 40,
    status: 'PENDING',
    timestamp: new Date().toISOString(),
  },
  {
    id: 'req-4',
    location: 'Dnipro Central Clinic',
    coords: [48.4647, 35.0462],
    // Маршрут: Київ -> Черкаси -> Кременчук -> Дніпро
    routePath: [
      [50.4501, 30.5234], [49.4444, 32.0598], [49.0625, 33.4048], [48.4647, 35.0462]
    ],
    priority: 'HIGH',
    items: 'Clean Water',
    quantity: 5000,
    currentStock: 25,
    status: 'IN_TRANSIT',
    timestamp: new Date().toISOString(),
  },
  {
    id: 'req-5',
    location: 'Zaporizhzhia Shelter',
    coords: [47.8388, 35.1396],
    routePath: [
      [50.4501, 30.5234], [49.4444, 32.0598], [49.0625, 33.4048], [48.4647, 35.0462], [47.8388, 35.1396]
    ],
    priority: 'CRITICAL',
    items: 'Food Rations',
    quantity: 8000,
    currentStock: 10,
    status: 'DELAYED', // Симулюємо проблему на маршруті
    timestamp: new Date().toISOString(),
  },
  {
    id: 'req-6',
    location: 'Ivano-Frankivsk Depot',
    coords: [48.9226, 24.7111],
    routePath: [
      [50.4501, 30.5234], [50.2547, 28.6586], [49.5535, 25.5948], [48.9226, 24.7111]
    ],
    priority: 'NORMAL',
    items: 'Thermal Blankets',
    quantity: 1500,
    currentStock: 65,
    status: 'PENDING',
    timestamp: new Date().toISOString(),
  }
];