export const dashboardData = {
  dashboardStats: [
    { title: 'Total Inventory', value: '45,230', subtitle: 'Active drug items' },
    { title: 'Storage Capacity', value: '78%', subtitle: 'Capacity used' },
    { title: 'Active Alerts', value: '12', subtitle: '5 low stock, 7 expired' },
    { title: 'Compliance Score', value: '92%', subtitle: 'Excellent' },
  ],
  monthlyOperations: [
    { month: 'Jan', movements: 1200 },
    { month: 'Feb', movements: 1450 },
    { month: 'Mar', movements: 1100 },
    { month: 'Apr', movements: 1600 },
    { month: 'May', movements: 1300 },
    { month: 'Jun', movements: 1500 },
  ],
  complianceData: [
    { name: 'Compliant', value: 92, color: '#00BFA6' },
    { name: 'Minor Issues', value: 6, color: '#F59E0B' },
    { name: 'Critical', value: 2, color: '#DC2626' },
  ],
  temperatureZones: [
    { zone: 'Cold Storage', temp: '4.2°C', status: 'Normal' },
    { zone: 'Frozen Storage', temp: '-18.5°C', status: 'Normal' },
    { zone: 'Ambient Storage', temp: '22.1°C', status: 'Normal' },
    { zone: 'Controlled', temp: '8.4°C', status: 'Warning' },
  ],
}

export const inventoryData = {
  summary: [
    { title: 'Total Items', value: '542', subtitle: 'Active drug items' },
    { title: 'In Stock', value: '480', subtitle: 'Available items' },
    { title: 'Low Stock', value: '45', subtitle: 'Need restocking' },
    { title: 'Expired', value: '17', subtitle: 'Require disposal' },
  ],
  items: [
    { id: 1, drugName: 'Amoxicillin 500mg', genericName: 'Amoxicillin', batch: 'AMX2024001', quantity: '5,000 tabs', expiryDate: '2025-12-15', storage: 'Ambient', location: 'A-1-001', status: 'In Stock' },
    { id: 2, drugName: 'Insulin Glargine', genericName: 'Insulin', batch: 'INS2024045', quantity: '120 vials', expiryDate: '2024-08-30', storage: 'Cold Storage', location: 'B-2-015', status: 'Low Stock' },
    { id: 3, drugName: 'Paracetamol 500mg', genericName: 'Acetaminophen', batch: 'PAR2024022', quantity: '25,000 tabs', expiryDate: '2026-03-20', storage: 'Ambient', location: 'A-3-045', status: 'In Stock' },
    { id: 4, drugName: 'Morphine Sulfate', genericName: 'Morphine', batch: 'MOR2024008', quantity: '50 amps', expiryDate: '2025-01-10', storage: 'Controlled', location: 'C-1-003', status: 'In Stock' },
    { id: 5, drugName: 'Azithromycin 250mg', genericName: 'Azithromycin', batch: 'AZI2023156', quantity: '0 tabs', expiryDate: '2024-06-15', storage: 'Ambient', location: 'A-2-012', status: 'Expired' },
    { id: 6, drugName: 'Lisinopril 10mg', genericName: 'Lisinopril', batch: 'LIS2024099', quantity: '3,200 tabs', expiryDate: '2025-11-05', storage: 'Ambient', location: 'A-1-042', status: 'In Stock' },
    { id: 7, drugName: 'Atorvastatin 20mg', genericName: 'Atorvastatin', batch: 'ATO2024112', quantity: '1,500 tabs', expiryDate: '2025-09-12', storage: 'Ambient', location: 'A-1-088', status: 'In Stock' },
  ],
}

export const operationsData = {
  summary: [
    { title: 'Total Operations', value: '1,240', subtitle: 'All time' },
    { title: 'Pending', value: '14', subtitle: 'Awaiting start' },
    { title: 'In Progress', value: '8', subtitle: 'Active operations' },
    { title: 'Completed', value: '1,210', subtitle: 'Finished' },
    { title: 'Delayed', value: '3', subtitle: 'Need attention' },
  ],
  operations: [
    { id: 'OP-2024-001', type: 'Receiving', description: 'Insulin shipment from BioMed Solutions (Qty: 500)', priority: 'High', status: 'In Progress', assignedTo: 'John Smith', scheduled: '2024-08-27' },
    { id: 'OP-2024-002', type: 'Dispatching', description: 'Hospital order: General medications (Qty: 2500)', priority: 'Medium', status: 'Pending', assignedTo: 'Sarah Johnson', scheduled: '2024-08-28' },
    { id: 'OP-2024-003', type: 'Inspection', description: 'Monthly quality inspection - Zone A (Qty: 1250)', priority: 'Medium', status: 'Completed', assignedTo: 'Mike Chen', scheduled: '2024-08-25' },
    { id: 'OP-2024-004', type: 'Transfer', description: 'Internal transfer - Zone B to Zone C (Qty: 150)', priority: 'Urgent', status: 'Delayed', assignedTo: 'Emma Davis', scheduled: '2024-08-26' },
    { id: 'OP-2024-005', type: 'Receiving', description: 'Generic medications bulk order (Qty: 10000)', priority: 'Low', status: 'Completed', assignedTo: 'John Smith', scheduled: '2024-08-24' },
  ],
}

export const buildingData = {
  metrics: [
    { title: 'Total Area', value: '15,000 m²', subtitle: 'Warehouse facility' },
    { title: 'Occupancy Rate', value: '85%', subtitle: 'Space utilization' },
    { title: 'Energy Rating', value: 'A+', subtitle: 'Excellent' },
    { title: 'Security Level', value: 'High', subtitle: 'Secure' },
  ],
  alerts: [
    'Power Management System: Backup generator maintenance required in Zone C',
    'Controlled Substances Zone C: Access card reader needs calibration',
  ],
  zones: [
    { name: 'Zone A', type: 'Ambient Storage Zone A', status: 'Optimal', area: '4,000 m²', items: '1250', capacity: 85, temperature: '22°C', humidity: '45%', maintenance: '2024-07-20' },
    { name: 'Zone B', type: 'Cold Storage Zone B', status: 'Optimal', area: '2,000 m²', items: '320', capacity: 78, temperature: '4°C', humidity: '65%', maintenance: '2024-07-18' },
    { name: 'Zone C', type: 'Controlled Substances Zone C', status: 'Warning', area: '1,500 m²', items: '200', capacity: 91, temperature: '8°C', humidity: '52%', maintenance: '2024-07-10' },
    { name: 'Zone D', type: 'Frozen Storage Zone D', status: 'Optimal', area: '1,000 m²', items: '180', capacity: 73, temperature: '-18°C', humidity: '58%', maintenance: '2024-07-15' },
  ],
}
