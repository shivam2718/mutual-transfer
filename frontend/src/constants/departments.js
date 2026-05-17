export const DEPARTMENTS_WITH_BRANCHES = {
  'Operating (Traffic)': [
    'Train Operations',
    'Station Master cadre',
    'Goods/Freight Operations',
    'Coaching Operations',
    'Control Office',
    'Transportation Planning'
  ],
  'Engineering (Civil)': [
    'Permanent Way (Track)',
    'Bridge',
    'Works (Buildings & Construction)',
    'Drawing & Design',
    'Land & Survey',
    'Workshop (Civil)'
  ],
  'Mechanical': [
    'Traction Rolling Stock (Loco)',
    'Carriage & Wagon (C&W)',
    'Workshop (Mechanical)',
    'Power (Diesel/Electric)',
    'Crane & Machinery'
  ],
  'Electrical': [
    'General Services (EG)',
    'Traction (ET)',
    'Construction (EC)',
    'Train Lighting & AC',
    'Power House'
  ],
  'Signal & Telecommunication (S&T)': [
    'Signal',
    'Telecommunication',
    'Train Protection (TPWS/ATP)',
    'OFC & Data Network',
    'Construction (S&T)'
  ],
  'Accounts': [
    'Traffic Accounts',
    'General Accounts',
    'Establishment Accounts',
    'Provident Fund (PF)',
    'Bills & Audit'
  ],
  'Personnel': [
    'Establishment',
    'Welfare',
    'Labour Relations',
    'Recruitment',
    'Service Records',
    'Sports & Cultural'
  ],
  'Medical': [
    'Curative (OPD/IPD)',
    'Public Health & Sanitation',
    'Occupational Health',
    'Medical Inspection',
    'Pharmacy'
  ],
  'Commercial': [
    'Passenger Marketing',
    'Freight Marketing',
    'Claims & Refunds',
    'Parcel & Luggage',
    'Catering (IRCTC coordination)',
    'Ticketing & Reservations'
  ],
  'Security (RPF)': [
    'Law & Order',
    'Anti-Touting',
    'Crime Prevention',
    'Intelligence',
    'Escorting & Patrolling',
    'Women Safety (Meri Saheli)'
  ],
  'Stores': [
    'Purchase',
    'Depot / Warehouse',
    'Inspection',
    'Disposal (Scrap)',
    'Inventory & Accounts'
  ],
  'Information Technology': [
    'Network & Infrastructure',
    'Application Support (CRIS systems)',
    'Cybersecurity',
    'Data Management',
    'Helpdesk & AMC'
  ]
}

export const DEPARTMENTS = Object.keys(DEPARTMENTS_WITH_BRANCHES)

export const DEPARTMENTS_WITH_BRANCHES_AND_DESIGNATIONS = {
  'Operating (Traffic)': {
    'Train Operations': [
      'Divisional Railway Manager (DRM)',
      'Senior Divisional Operations Manager (Sr. DOM)',
      'Divisional Operations Manager (DOM)',
      'Assistant Divisional Operations Manager (ADOM)',
      'Section Controller',
      'Assistant Section Controller',
      'Train Controller'
    ],
    'Station Master cadre': [
      'Station Superintendent',
      'Station Master (SM)',
      'Assistant Station Master (ASM)',
      'Cabin Master',
      'Pointsman / Gateman'
    ],
    'Goods/Freight Operations': [
      'Goods Guard',
      'Senior Goods Guard',
      'Brake Van Guard'
    ],
    'Coaching Operations': [
      'Senior Passenger Guard',
      'Passenger Guard',
      'Assistant Guard'
    ],
    'Control Office': [
      'Chief Controller',
      'Senior Controller',
      'Controller',
      'Assistant Controller'
    ],
    'Transportation Planning': [
      'Planning Inspector',
      'Statistical Inspector'
    ]
  },
  'Engineering (Civil)': {
    'Permanent Way (Track)': [
      'Senior Divisional Engineer (Sr. DEN)',
      'Divisional Engineer (DEN)',
      'Assistant Divisional Engineer (ADEN)',
      'Junior Engineer (JE) - Track',
      'Section Engineer (SE)',
      'Gangman / Trackman',
      'Keyman',
      'Mate'
    ],
    'Bridge': [
      'Divisional Engineer (Bridge)',
      'Assistant Divisional Engineer (Bridge)',
      'Junior Engineer (Bridge)',
      'Bridge Inspector',
      'Bridge Mistri',
      'Khalasi'
    ],
    'Works (Buildings & Construction)': [
      'Divisional Engineer (Works)',
      'Assistant Divisional Engineer (Works)',
      'Junior Engineer (Works)',
      'Works Inspector',
      'Carpenter / Mason / Plumber'
    ],
    'Drawing & Design': [
      'Assistant Divisional Engineer (Drawing)',
      'Junior Engineer (Drawing)',
      'Draughtsman (Grade I, II, III)',
      'Tracer'
    ],
    'Land & Survey': [
      'Assistant Divisional Engineer (Land)',
      'Junior Engineer (Survey)',
      'Survey Inspector',
      'Chainman'
    ],
    'Workshop (Civil)': [
      'Junior Engineer (Workshop)',
      'Technician',
      'Helper'
    ]
  },
  Mechanical: {
    'Traction Rolling Stock (Loco)': [
      'Senior Divisional Mechanical Engineer (Sr. DME)',
      'Divisional Mechanical Engineer (DME)',
      'Assistant Divisional Mechanical Engineer (ADME)',
      'Junior Engineer (Loco)',
      'Loco Pilot (LP) - Goods/Mail/Passenger',
      'Assistant Loco Pilot (ALP)',
      'Technician Grade I / II / III',
      'Helper'
    ],
    'Carriage & Wagon (C&W)': [
      'Divisional Mechanical Engineer (C&W)',
      'Assistant Divisional Mechanical Engineer (C&W)',
      'Junior Engineer (C&W)',
      'Carriage & Wagon Inspector (CWI)',
      'Technician Grade I / II / III',
      'Helper / Khalasi'
    ],
    'Workshop (Mechanical)': [
      'Workshop Engineer',
      'Junior Engineer (Workshop)',
      'Technician (Fitter / Welder / Turner / Machinist)',
      'Helper'
    ],
    'Power (Diesel/Electric)': [
      'Junior Engineer (Power)',
      'Technician (Power)',
      'Helper'
    ],
    'Crane & Machinery': [
      'Junior Engineer (Crane)',
      'Crane Operator',
      'Technician',
      'Helper'
    ]
  },
  Electrical: {
    'General Services (EG)': [
      'Senior Divisional Electrical Engineer (Sr. DEE)',
      'Divisional Electrical Engineer (DEE)',
      'Assistant Divisional Electrical Engineer (ADEE)',
      'Junior Engineer (General)',
      'Electrical Inspector',
      'Technician Grade I / II / III',
      'Helper'
    ],
    'Traction (ET)': [
      'Divisional Electrical Engineer (TRD)',
      'Assistant Divisional Electrical Engineer (TRD)',
      'Junior Engineer (TRD)',
      'Section Engineer (TRD)',
      'Technician (TRD)',
      'Helper'
    ],
    'Construction (EC)': [
      'Divisional Electrical Engineer (Construction)',
      'Junior Engineer (Construction)',
      'Technician',
      'Helper'
    ],
    'Train Lighting & AC': [
      'Junior Engineer (Train Lighting)',
      'Electrical Technician (Train Lighting)',
      'AC Mechanic',
      'Helper'
    ],
    'Power House': [
      'Junior Engineer (Power House)',
      'Operator (Power House)',
      'Technician',
      'Helper'
    ]
  },
  'Signal & Telecommunication (S&T)': {
    Signal: [
      'Senior Divisional Signal & Telecom Engineer (Sr. DSTE)',
      'Divisional Signal & Telecom Engineer (DSTE)',
      'Assistant Divisional Signal & Telecom Engineer (ADSTE)',
      'Junior Engineer (Signal)',
      'Section Engineer (Signal)',
      'Signal Inspector',
      'Technician (Signal) Grade I / II / III',
      'Helper / Khalasi'
    ],
    Telecommunication: [
      'Junior Engineer (Telecom)',
      'Section Engineer (Telecom)',
      'Technician (Telecom) Grade I / II / III',
      'Helper'
    ],
    'Train Protection (TPWS/ATP)': [
      'Junior Engineer (Train Protection)',
      'Technician (Train Protection)',
      'Helper'
    ],
    'OFC & Data Network': [
      'Junior Engineer (OFC)',
      'Technician (OFC)',
      'Helper'
    ],
    'Construction (S&T)': [
      'Junior Engineer (Construction)',
      'Technician',
      'Helper'
    ]
  },
  Accounts: {
    'Traffic Accounts': [
      'Senior Divisional Finance Manager (Sr. DFM)',
      'Divisional Finance Manager (DFM)',
      'Assistant Divisional Finance Manager (ADFM)',
      'Senior Accounts Assistant',
      'Accounts Assistant',
      'Junior Accounts Assistant'
    ],
    'General Accounts': [
      'Senior Accounts Assistant',
      'Accounts Assistant',
      'Junior Accounts Assistant'
    ],
    'Establishment Accounts': [
      'Senior Accounts Assistant',
      'Accounts Assistant',
      'Junior Accounts Assistant'
    ],
    'Provident Fund (PF)': [
      'PF Inspector',
      'Senior Accounts Assistant',
      'Accounts Assistant'
    ],
    'Bills & Audit': [
      'Senior Accounts Assistant',
      'Accounts Assistant',
      'Junior Accounts Assistant'
    ]
  },
  Personnel: {
    Establishment: [
      'Senior Divisional Personnel Officer (Sr. DPO)',
      'Divisional Personnel Officer (DPO)',
      'Assistant Divisional Personnel Officer (ADPO)',
      'Senior Personnel Inspector',
      'Personnel Inspector',
      'Head Clerk',
      'Senior Clerk',
      'Junior Clerk'
    ],
    Welfare: [
      'Welfare Inspector',
      'Senior Clerk',
      'Junior Clerk'
    ],
    'Labour Relations': [
      'Labour Relations Inspector',
      'Senior Clerk'
    ],
    Recruitment: [
      'Personnel Inspector (Recruitment)',
      'Senior Clerk',
      'Junior Clerk'
    ],
    'Service Records': [
      'Head Clerk',
      'Senior Clerk',
      'Junior Clerk'
    ],
    'Sports & Cultural': [
      'Sports Inspector',
      'Cultural Supervisor'
    ]
  },
  Medical: {
    'Curative (OPD/IPD)': [
      'Chief Medical Superintendent (CMS)',
      'Senior Divisional Medical Officer (Sr. DMO)',
      'Divisional Medical Officer (DMO)',
      'Assistant Divisional Medical Officer (ADMO)',
      'Medical Officer (MO)',
      'Staff Nurse',
      'Pharmacist',
      'Lab Technician',
      'Hospital Attendant'
    ],
    'Public Health & Sanitation': [
      'Public Health Inspector',
      'Sanitary Inspector',
      'Safaiwala'
    ],
    'Occupational Health': [
      'Occupational Health Medical Officer',
      'Health Inspector'
    ],
    'Medical Inspection': [
      'Medical Inspector',
      'Health & Malaria Inspector'
    ],
    Pharmacy: [
      'Chief Pharmacist',
      'Pharmacist Grade I / II',
      'Pharmacy Assistant'
    ]
  },
  Commercial: {
    'Passenger Marketing': [
      'Senior Divisional Commercial Manager (Sr. DCM)',
      'Divisional Commercial Manager (DCM)',
      'Assistant Divisional Commercial Manager (ADCM)',
      'Commercial Inspector',
      'Travelling Ticket Examiner (TTE)',
      'Ticket Collector (TC)'
    ],
    'Freight Marketing': [
      'Commercial Inspector (Goods)',
      'Goods Supervisor',
      'Goods Clerk'
    ],
    'Claims & Refunds': [
      'Claims Inspector',
      'Commercial Clerk',
      'Junior Clerk'
    ],
    'Parcel & Luggage': [
      'Parcel Supervisor',
      'Parcel Porter',
      'Porter / Hamal'
    ],
    'Catering (IRCTC coordination)': [
      'Commercial Inspector (Catering)',
      'Catering Supervisor'
    ],
    'Ticketing & Reservations': [
      'Reservation Supervisor',
      'Booking Clerk',
      'Reservation Clerk',
      'Senior Clerk'
    ]
  },
  'Security (RPF)': {
    'Law & Order': [
      'Divisional Security Commissioner (DSC)',
      'Assistant Security Commissioner (ASC)',
      'Inspector (RPF)',
      'Sub-Inspector (RPF)',
      'Assistant Sub-Inspector (ASI)',
      'Head Constable',
      'Constable'
    ],
    'Anti-Touting': [
      'Inspector (RPF)',
      'Sub-Inspector (RPF)',
      'Head Constable',
      'Constable'
    ],
    'Crime Prevention': [
      'Inspector (RPF)',
      'Sub-Inspector (RPF)',
      'Head Constable',
      'Constable'
    ],
    Intelligence: [
      'Inspector (Intelligence)',
      'Sub-Inspector (Intelligence)',
      'Head Constable'
    ],
    'Escorting & Patrolling': [
      'Sub-Inspector (RPF)',
      'ASI',
      'Head Constable',
      'Constable'
    ],
    'Women Safety (Meri Saheli)': [
      'Sub-Inspector (RPF) - Women',
      'ASI - Women',
      'Head Constable - Women',
      'Constable - Women'
    ]
  },
  Stores: {
    Purchase: [
      'Divisional Material Manager (DMM)',
      'Assistant Material Manager (AMM)',
      'Junior Material Manager (JMM)',
      'Purchase Inspector',
      'Senior Clerk',
      'Junior Clerk'
    ],
    'Depot / Warehouse': [
      'Depot Officer',
      'Store Keeper Grade I / II',
      'Porter / Labour'
    ],
    Inspection: [
      'Inspecting Officer (Stores)',
      'Stores Inspector'
    ],
    'Disposal (Scrap)': [
      'Disposal Inspector',
      'Store Keeper',
      'Labour'
    ],
    'Inventory & Accounts': [
      'Stores Accounts Assistant',
      'Junior Clerk'
    ]
  },
  'Information Technology': {
    'Network & Infrastructure': [
      'Divisional IT Manager',
      'Assistant IT Manager',
      'Junior Engineer (IT)',
      'Network Technician',
      'System Administrator'
    ],
    'Application Support (CRIS systems)': [
      'Junior Engineer (IT)',
      'Application Support Engineer',
      'Data Entry Operator'
    ],
    Cybersecurity: [
      'IT Security Officer',
      'Junior Engineer (Cybersecurity)'
    ],
    'Data Management': [
      'Data Manager',
      'Data Entry Operator',
      'Junior Clerk'
    ],
    'Helpdesk & AMC': [
      'Helpdesk Supervisor',
      'Helpdesk Technician',
      'AMC Technician'
    ]
  }
}
