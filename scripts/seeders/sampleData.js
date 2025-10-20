export const sampleImages = {
  propertyImages: {
    flat: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2'
    ],
    villa: [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c'
    ],
    independent_house: [
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994',
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be',
      'https://images.unsplash.com/photo-1576941089067-2de3c901e126'
    ]
  },
  roomImages: [
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af',
    'https://images.unsplash.com/photo-1598928506311-c55ded91a20c',
    'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf'
  ],
  profileImages: [
    'https://images.unsplash.com/photo-1633332755192-727a05c4013d',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330'
  ],
  documentImages: {
    aadhar: 'https://example.com/sample-aadhar.jpg',
    pan: 'https://example.com/sample-pan.jpg'
  }
}

export const locations = [
  {
    city: 'Mumbai',
    state: 'Maharashtra',
    localities: ['Bandra', 'Andheri', 'Juhu', 'Powai', 'Worli'],
    coordinates: { lat: 19.0760, lng: 72.8777 }
  },
  {
    city: 'Delhi',
    state: 'Delhi',
    localities: ['Vasant Kunj', 'Dwarka', 'Rohini', 'Saket', 'Hauz Khas'],
    coordinates: { lat: 28.6139, lng: 77.2090 }
  },
  {
    city: 'Bangalore',
    state: 'Karnataka',
    localities: ['Indiranagar', 'Koramangala', 'HSR Layout', 'Whitefield', 'JP Nagar'],
    coordinates: { lat: 12.9716, lng: 77.5946 }
  }
]

export const propertyFeatures = [
  'AC',
  'Lift',
  '24x7 Security',
  'Power Backup',
  'Parking',
  'Swimming Pool',
  'Gym',
  'Garden',
  'Club House',
  'Gated Community',
  'CCTV',
  'Children\'s Play Area',
  'WiFi'
]

export const propertyHighlights = [
  'Premium Location',
  'Spacious Rooms',
  'Modern Amenities',
  'Well Ventilated',
  'Peaceful Neighborhood',
  'Close to Market',
  'Metro Connectivity',
  'Schools Nearby',
  'Hospital Nearby',
  'Shopping Mall Nearby'
]

export const ownerData = [
  {
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@example.com',
    phone: '9876543210',
    occupation: 'Business Owner'
  },
  {
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    phone: '9876543211',
    occupation: 'Real Estate Agent'
  },
  {
    name: 'Amit Patel',
    email: 'amit.patel@example.com',
    phone: '9876543212',
    occupation: 'Property Investor'
  }
]

export const tenantData = [
  {
    name: 'Rahul Singh',
    email: 'rahul.singh@example.com',
    phone: '9876543213',
    occupation: 'Software Engineer'
  },
  {
    name: 'Neha Gupta',
    email: 'neha.gupta@example.com',
    phone: '9876543214',
    occupation: 'Marketing Manager'
  },
  {
    name: 'Arun Verma',
    email: 'arun.verma@example.com',
    phone: '9876543215',
    occupation: 'Bank Manager'
  }
]

export const agreementTemplates = [
  {
    name: '11 Month Rental Agreement',
    duration: 11,
    terms: [
      'Monthly rent payment by 5th of every month',
      'Security deposit equal to 3 months rent',
      'Notice period of 2 months',
      'Electricity and water charges as per actual consumption',
      'No structural changes without owner\'s permission'
    ]
  },
  {
    name: 'Long Term Lease Agreement',
    duration: 24,
    terms: [
      'Monthly rent payment by 7th of every month',
      'Security deposit equal to 6 months rent',
      'Notice period of 3 months',
      'Annual rent increment of 5%',
      'Maintenance charges included in rent'
    ]
  }
]

export const paymentData = {
  securityDeposit: {
    min: 25000,
    max: 100000
  },
  monthlyRent: {
    flat: { min: 15000, max: 50000 },
    villa: { min: 40000, max: 150000 },
    independent_house: { min: 25000, max: 80000 }
  },
  maintenanceCharges: {
    min: 1000,
    max: 5000
  }
}