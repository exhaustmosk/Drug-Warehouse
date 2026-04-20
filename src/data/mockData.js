export const dashboardStats = [
  { title: 'Total Inventory', value: '3,247', subtitle: '+12% from last month' },
  { title: 'Storage Capacity', value: '78%', subtitle: 'Capacity used' },
  { title: 'Active Alerts', value: '3', subtitle: '2 temperature, 1 security' },
  { title: 'Compliance Score', value: '92%', subtitle: 'Excellent' },
]

export const monthlyOperations = [
  { month: 'Jan', movements: 1200 },
  { month: 'Feb', movements: 1450 },
  { month: 'Mar', movements: 1100 },
  { month: 'Apr', movements: 1600 },
  { month: 'May', movements: 1300 },
  { month: 'Jun', movements: 1500 },
]

export const complianceData = [
  { name: 'Compliant', value: 92, color: '#10B981' },
  { name: 'Minor Issues', value: 6, color: '#F59E0B' },
  { name: 'Critical', value: 2, color: '#DC2626' },
]

export const temperatureZones = [
  { zone: 'Cold', temp: '4°C', status: 'Normal' },
  { zone: 'Frozen', temp: '-18°C', status: 'Normal' },
  { zone: 'Ambient', temp: '22°C', status: 'Normal' },
  { zone: 'Controlled', temp: '8°C', status: 'Warning' },
]

export const inventorySummary = [
  { title: 'Total Items', value: '5', subtitle: 'Active drug items' },
  { title: 'In Stock', value: '3', subtitle: 'Available items' },
  { title: 'Low Stock', value: '1', subtitle: 'Need restocking' },
  { title: 'Expired', value: '1', subtitle: 'Require disposal' },
]

export const inventoryRows = [
  {
    drugName: 'Amoxicillin 500mg',
    genericName: 'Amoxicillin',
    batch: 'AMX2024001',
    quantity: '5000 tablets',
    expiryDate: '2025-12-15',
    storage: 'Ambient',
    location: 'A-1-001',
    status: 'In Stock',
  },
  {
    drugName: 'Insulin Glargine 100U/ml',
    genericName: 'Insulin Glargine',
    batch: 'INS2024045',
    quantity: '120 vials',
    expiryDate: '2024-08-30',
    storage: 'Cold Storage',
    location: 'B-2-015',
    status: 'Low Stock',
  },
  {
    drugName: 'Paracetamol 500mg',
    genericName: 'Acetaminophen',
    batch: 'PAR2024022',
    quantity: '25000 tablets',
    expiryDate: '2026-03-20',
    storage: 'Ambient',
    location: 'A-3-045',
    status: 'In Stock',
  },
  {
    drugName: 'Morphine Sulfate 10mg/ml',
    genericName: 'Morphine Sulfate',
    batch: 'MOR2024008',
    quantity: '50 ampoules',
    expiryDate: '2025-01-10',
    storage: 'Controlled',
    location: 'C-1-003',
    status: 'In Stock',
  },
  {
    drugName: 'Azithromycin 250mg',
    genericName: 'Azithromycin',
    batch: 'AZI2023156',
    quantity: '0 tablets',
    expiryDate: '2024-06-15',
    storage: 'Ambient',
    location: 'A-2-012',
    status: 'Expired',
  },
]

export const operationsSummary = [
  { title: 'Total Operations', value: '5', subtitle: 'All time' },
  { title: 'Pending', value: '1', subtitle: 'Awaiting start' },
  { title: 'In Progress', value: '1', subtitle: 'Active operations' },
  { title: 'Completed', value: '2', subtitle: 'Finished' },
  { title: 'Delayed', value: '1', subtitle: 'Need attention' },
]

export const operationRows = [
  {
    id: 'OP-2024-001',
    type: 'Receiving',
    description: 'Insulin shipment from BioMed Solutions (Qty: 500)',
    priority: 'High',
    status: 'In Progress',
    assignedTo: 'John Smith',
    scheduled: '2024-08-27',
  },
  {
    id: 'OP-2024-002',
    type: 'Dispatching',
    description: 'Hospital order: General medications (Qty: 2500)',
    priority: 'Medium',
    status: 'Pending',
    assignedTo: 'Sarah Johnson',
    scheduled: '2024-08-28',
  },
  {
    id: 'OP-2024-003',
    type: 'Inspection',
    description: 'Monthly quality inspection - Zone A (Qty: 1250)',
    priority: 'Medium',
    status: 'Completed',
    assignedTo: 'Mike Chen',
    scheduled: '2024-08-25',
  },
  {
    id: 'OP-2024-004',
    type: 'Transfer',
    description: 'Internal transfer - Zone B to Zone C (Qty: 150)',
    priority: 'Urgent',
    status: 'Delayed',
    assignedTo: 'Emma Davis',
    scheduled: '2024-08-26',
  },
  {
    id: 'OP-2024-005',
    type: 'Receiving',
    description: 'Generic medications bulk order (Qty: 10000)',
    priority: 'Low',
    status: 'Completed',
    assignedTo: 'John Smith',
    scheduled: '2024-08-24',
  },
]

export const buildingMetrics = [
  { title: 'Total Area', value: '15,000 m²', subtitle: 'Warehouse facility' },
  { title: 'Occupancy Rate', value: '85%', subtitle: 'Space utilization' },
  { title: 'Energy Rating', value: 'A+', subtitle: 'Excellent' },
  { title: 'Security Level', value: 'High', subtitle: 'Secure' },
]

export const buildingAlerts = [
  'Power Management System: Backup generator maintenance required in Zone C',
  'Controlled Substances Zone C: Access card reader needs calibration',
]

export const zones = [
  {
    name: 'Zone A',
    type: 'Ambient Storage Zone A',
    status: 'Optimal',
    area: '4,000 m²',
    items: '1250',
    capacity: 85,
    temperature: '22°C',
    humidity: '45%',
    maintenance: '2024-07-20',
  },
  {
    name: 'Zone B',
    type: 'Cold Storage Zone B',
    status: 'Optimal',
    area: '2,000 m²',
    items: '320',
    capacity: 78,
    temperature: '4°C',
    humidity: '65%',
    maintenance: '2024-07-18',
  },
  {
    name: 'Zone C',
    type: 'Controlled Substances Zone C',
    status: 'Warning',
    area: '1,500 m²',
    items: '200',
    capacity: 91,
    temperature: '8°C',
    humidity: '52%',
    maintenance: '2024-07-10',
  },
  {
    name: 'Zone D',
    type: 'Frozen Storage Zone D',
    status: 'Optimal',
    area: '1,000 m²',
    items: '180',
    capacity: 73,
    temperature: '-18°C',
    humidity: '58%',
    maintenance: '2024-07-15',
  },
]
