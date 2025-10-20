import dotenv from 'dotenv'
dotenv.config()

import mongoose from 'mongoose'
import { userModel } from '../../api/resources/User/User.Schema.js'
import { propertyModel } from '../../api/resources/Property/Property.Schema.js'
import { roomModel } from '../../api/resources/Room/Room.Schema.js'
import { ownerModel } from '../../api/resources/Owner/Owner.Schema.js'
import { requestModel } from '../../api/resources/Request/Request.Schema.js'
import { rentalAgreementModel } from '../../api/resources/RentalAgreement/RentalAgreement.Schema.js'
import { rentPaymentModel } from '../../api/resources/RentPayment/RentPayment.Schema.js'
import { addressModel } from '../../api/resources/Address/Address.Schema.js'
import { documentModel } from '../../api/resources/Document/Document.Schema.js'
import {
  sampleImages,
  locations,
  propertyFeatures,
  propertyHighlights,
  ownerData,
  tenantData,
  agreementTemplates,
  paymentData
} from './sampleData.js'
import crypto from 'crypto'
import { format, addMonths } from 'date-fns'

class DatabaseSeeder {
  constructor() {
    this.owner = null
    this.ownerAddress = null
    this.ownerDocuments = null
    this.property = null
    this.rooms = []
    this.tenant = null
    this.tenantAddress = null
    this.tenantDocuments = null
    this.request = null
    this.agreement = null
    this.payments = []
    this.owners = []
    this.tenants = []
    this.properties = []
    this.requests = []
    this.agreements = []
  }

  async connect() {
    try {
      await mongoose.connect(process.env.MONGO_URI)
      console.log('Connected to MongoDB')
    } catch (error) {
      console.error('MongoDB connection error:', error)
      process.exit(1)
    }
  }

  async cleanup() {
    // Clean existing data
    await Promise.all([
      userModel.deleteMany({}),
      propertyModel.deleteMany({}),
      roomModel.deleteMany({}),
      ownerModel.deleteMany({}),
      requestModel.deleteMany({}),
      rentalAgreementModel.deleteMany({}),
      rentPaymentModel.deleteMany({}),
      addressModel.deleteMany({}),
      documentModel.deleteMany({})
    ])
    console.log('Cleaned up existing data')
  }

  async createOwnerFlow() {
    // 1. Create owner user
    console.log('Creating owner user...')
    this.owner = await userModel.create({
      name: 'Rajesh Kumar',
      email: 'rajesh.kumar@example.com',
      phone: '9876543210',
      password: 'Password@123',
      role: 'GUEST', // Start as guest user
      profileImage: sampleImages.profileImages[0]
    })

    // 2. Create owner's address
    console.log('Creating owner address...')
    this.ownerAddress = await addressModel.create({
      userId: this.owner._id,
      state: 'Maharashtra',
      city: 'Mumbai',
      locality: 'Andheri West',
      pincode: '400053',
      fullAddress: '123, Sea View Apartments, Andheri West, Mumbai',
      geoLocation: {
        type: 'Point',
        coordinates: [72.8324, 19.1281] // Mumbai coordinates
      }
    })

    // 3. Upload owner's documents
    console.log('Creating owner documents...')
    this.ownerDocuments = await Promise.all([
      documentModel.create({
        userId: this.owner._id,
        docType: 'aadhaar',
        uniqueNumber: `1234 5678 ${Math.floor(1000 + Math.random() * 9000)}`,
        url: sampleImages.documentImages.aadhar,
        isVerified: true,
        uploadedAt: new Date()
      }),
      documentModel.create({
        userId: this.owner._id,
        docType: 'pan',
        uniqueNumber: `ABCDE${Math.floor(1000 + Math.random() * 9000)}F`,
        url: sampleImages.documentImages.pan,
        isVerified: true,
        uploadedAt: new Date()
      })
    ])

    // 4. Upgrade user to owner after document verification
    console.log('Upgrading user to owner...')
    await userModel.findByIdAndUpdate(this.owner._id, { role: 'OWNER' })
    
    const ownerProfile = await ownerModel.create({
      userId: this.owner._id,
      verificationStatus: 'verified',
      documents: this.ownerDocuments.map(doc => ({
        docType: doc.docType,
        documentId: doc._id,
        isVerified: doc.isVerified
      }))
    })

    console.log('Owner flow completed')
    return ownerProfile
  }

  async createTenantFlow() {
    // 1. Create tenant user
    console.log('Creating tenant user...')
    this.tenant = await userModel.create({
      name: 'Amit Sharma',
      email: 'amit.sharma@example.com',
      phone: '9876543211',
      password: 'Password@123',
      role: 'GUEST',
      profileImage: sampleImages.profileImages[1]
    })

    // 2. Create tenant's address
    console.log('Creating tenant address...')
    this.tenantAddress = await addressModel.create({
      userId: this.tenant._id,
      state: 'Maharashtra',
      city: 'Mumbai',
      locality: 'Goregaon',
      pincode: '400063',
      fullAddress: '789, Blue Heights, Goregaon East, Mumbai',
      geoLocation: {
        type: 'Point',
        coordinates: [72.8724, 19.1663]
      }
    })

    // 3. Upload tenant's documents
    console.log('Creating tenant documents...')
    this.tenantDocuments = await Promise.all([
      documentModel.create({
        userId: this.tenant._id,
        docType: 'aadhaar',
        uniqueNumber: `9876 5432 ${Math.floor(1000 + Math.random() * 9000)}`,
        url: sampleImages.documentImages.aadhar,
        isVerified: false,
        uploadedAt: new Date()
      }),
      documentModel.create({
        userId: this.tenant._id,
        docType: 'pan',
        uniqueNumber: `XYZWP${Math.floor(1000 + Math.random() * 9000)}B`,
        url: sampleImages.documentImages.pan,
        isVerified: false,
        uploadedAt: new Date()
      })
    ])

    console.log('Tenant flow completed')
    return this.tenant
  }

  async createRentalFlow() {
    if (!this.tenant || !this.property || !this.rooms.length) {
      throw new Error('Tenant and property must be created first')
    }

    // 1. Create tenant request
    console.log('Creating tenant request...')
    this.request = await requestModel.create({
      propertyId: this.property._id,
      roomId: this.rooms[0]._id,
      raisedBy: this.tenant._id,
      ownerId: this.owner._id,
      status: 'pending',
      description: 'I am interested in renting this room. I am a working professional looking for a long-term stay.',
      documents: [
        {
          documentId: this.tenantDocuments[0]._id,
          isVerified: false
        },
        {
          documentId: this.tenantDocuments[1]._id,
          isVerified: false
        }
      ]
    })

    // 2. Owner verifies tenant documents
    console.log('Owner verifying documents...')
    await Promise.all([
      documentModel.findByIdAndUpdate(this.tenantDocuments[0]._id, {
        verificationStatus: 'verified',
        verifiedAt: new Date()
      }),
      documentModel.findByIdAndUpdate(this.tenantDocuments[1]._id, {
        verificationStatus: 'verified',
        verifiedAt: new Date()
      })
    ])

    // 3. Update request status and document verification
    await requestModel.findByIdAndUpdate(this.request._id, {
      status: 'accepted',
      'documents.$[].isVerified': true
    })

    // 4. Create rental agreement
    console.log('Creating rental agreement...')
    const startDate = new Date()
    const endDate = addMonths(startDate, 11) // 11 months agreement

    this.agreement = await rentalAgreementModel.create({
      propertyId: this.property._id,
      roomId: this.rooms[0]._id,
      tenantId: this.tenant._id,
      ownerId: this.owner._id,
      requestId: this.request._id,
      terms: agreementTemplates[0].terms,
      startDate,
      endDate,
      monthlyRent: 15000,
      securityDeposit: 45000,
      status: 'active',
      signedByTenant: true,
      signedByOwner: true,
      documentUrl: 'https://example.com/agreement.pdf'
    })

    // 5. Create first month's rent payment
    console.log('Creating initial rent payment...')
    const payment = await rentPaymentModel.create({
      agreementId: this.agreement._id,
      propertyId: this.property._id,
      roomId: this.rooms[0]._id,
      tenantId: this.tenant._id,
      ownerId: this.owner._id,
      amount: 15000,
      paymentDate: new Date(),
      paymentMethod: 'razorpay',
      status: 'completed',
      transactionId: `txn_${crypto.randomBytes(8).toString('hex')}`,
      receiptUrl: 'https://example.com/receipt.pdf'
    })
    this.payments.push(payment)

    // 6. Update room availability
    await roomModel.findByIdAndUpdate(this.rooms[0]._id, { isAvailable: false })

    // 7. Upgrade user to tenant role
    await userModel.findByIdAndUpdate(this.tenant._id, { role: 'TENANT' })

    console.log('Rental flow completed')
    return this.agreement
  }

  async createUsers() {
    // Create owners
    for (const data of ownerData) {
      const owner = await userModel.create({
        ...data,
        password: 'Password@123',
        role: 'OWNER',
        profileImage: sampleImages.profileImages[Math.floor(Math.random() * sampleImages.profileImages.length)]
      })
      this.owners.push(owner)
    }

    // Create tenants
    for (const data of tenantData) {
      const tenant = await userModel.create({
        ...data,
        password: 'Password@123',
        role: 'TENANT',
        profileImage: sampleImages.profileImages[Math.floor(Math.random() * sampleImages.profileImages.length)]
      })
      this.tenants.push(tenant)
    }

    console.log('Created users')
  }

  generateUniqueCode(location, index) {
    const state = location.state.slice(0, 2).toUpperCase()
    const city = location.city.slice(0, 3).toUpperCase()
    const num = String(index + 1).padStart(3, '0')
    const rand = crypto.randomBytes(2).toString('hex').toUpperCase()
    return `${state}-${city}-${num}-${rand}`
  }

  async createProperty() {
    if (!this.owner) {
      throw new Error('Owner must be created first')
    }

    // Create property address
    console.log('Creating property address...')
    const propertyAddress = await addressModel.create({
      userId: this.owner._id,
      state: 'Maharashtra',
      city: 'Mumbai',
      locality: 'Andheri West',
      pincode: '400053',
      fullAddress: '456, Green Valley, Andheri West, Mumbai',
      geoLocation: {
        type: 'Point',
        coordinates: [72.8324, 19.1281]
      }
    })

    // Create property
    console.log('Creating property...')
    this.property = await propertyModel.create({
      ownerId: this.owner._id,
      addressId: propertyAddress._id,
      propertyName: 'Green Valley Apartments',
      description: 'Luxurious 3BHK apartment with modern amenities',
      propertyType: 'flat',
      bhkType: '3BHK',
      size: 1200,
      floor: 5,
      totalFloors: 15,
      availableFrom: new Date(),
      preferredTenant: 'Family',
      parking: true,
      features: propertyFeatures.slice(0, 5),
      images: sampleImages.propertyImages.flat,
      highlights: propertyHighlights.slice(0, 3),
      uniquePropertyCode: `MH-MUM-001-${crypto.randomBytes(2).toString('hex').toUpperCase()}`,
      furnishing: 'fully-furnished',
      minAmount: 35000,
      maxAmount: 40000
    })

    // Create rooms
    console.log('Creating rooms...')
    const rooms = []
    for (let i = 0; i < 3; i++) {
      // Create room address
      const roomAddress = await addressModel.create({
        userId: this.owner._id,
        state: 'Maharashtra',
        city: 'Mumbai',
        locality: 'Andheri West',
        pincode: '400053',
        fullAddress: `${456 + i}, Green Valley, Room ${i + 1}, Andheri West, Mumbai`,
        geoLocation: {
          type: 'Point',
          coordinates: [72.8324, 19.1281]
        }
      })

      const room = await roomModel.create({
        propertyId: this.property._id,
        roomNumber: `${i + 1}`,
        roomType: ['Single', 'Double', 'Suite'][Math.floor(Math.random() * 3)],
        description: 'Spacious room with attached bathroom',
        roomSize: `${Math.floor(Math.random() * 200) + 100} sq ft`,
        floorNumber: Math.floor(Math.random() * 5) + 1,
        rent: Math.floor(Math.random() * 10000) + 15000,
        rentDueDay: 5, // rent due on 5th of every month
        maintenanceCharge: {
          amount: 1000,
          frequency: 'monthly'
        },
        securityDeposit: {
          amount: Math.floor(Math.random() * 20000) + 30000,
          frequency: 'monthly'
        },
        otherCharges: 500,
        images: sampleImages.roomImages,
        amenities: propertyFeatures.slice(0, 3),
        isAvailable: true,
        addressId: roomAddress._id,
        rating: 0
      })
      rooms.push(room)
    }
    this.rooms = rooms
    console.log('Created property and rooms')
  }

  async createRequests() {
    for (const property of this.properties.slice(0, 5)) {
      const tenant = this.tenants[Math.floor(Math.random() * this.tenants.length)]
      
      const request = await requestModel.create({
        propertyId: property._id,
        raisedBy: tenant._id,
        ownerId: property.ownerId,
        status: 'pending',
        description: 'I am interested in renting this property. Please consider my request.',
        documents: [
          {
            docType: 'aadhaar',
            isVerified: true,
            url: sampleImages.documentImages.aadhar,
            uploadedAt: new Date()
          },
          {
            docType: 'pan',
            isVerified: true,
            url: sampleImages.documentImages.pan,
            uploadedAt: new Date()
          }
        ]
      })
      this.requests.push(request)
    }
    console.log('Created requests')
  }

  async createAgreements() {
    for (const request of this.requests.slice(0, 3)) {
      const template = agreementTemplates[Math.floor(Math.random() * agreementTemplates.length)]
      const startDate = new Date()
      const endDate = addMonths(startDate, template.duration)
      
      const agreement = await rentalAgreementModel.create({
        propertyId: request.propertyId,
        tenantId: request.tenantId,
        ownerId: request.ownerId,
        requestId: request._id,
        terms: template.terms,
        startDate,
        endDate,
        monthlyRent: Math.floor(Math.random() * 20000) + 15000,
        securityDeposit: Math.floor(Math.random() * 50000) + 30000,
        status: 'active',
        signedByTenant: true,
        signedByOwner: true,
        documentUrl: 'https://example.com/agreement.pdf'
      })
      this.agreements.push(agreement)

      // Update request status
      await requestModel.findByIdAndUpdate(request._id, { status: 'approved' })
    }
    console.log('Created agreements')
  }

  async createPayments() {
    for (const agreement of this.agreements) {
      // Create 3 months of payments for each agreement
      for (let i = 0; i < 3; i++) {
        const paymentDate = addMonths(agreement.startDate, i)
        await rentPaymentModel.create({
          agreementId: agreement._id,
          propertyId: agreement.propertyId,
          tenantId: agreement.tenantId,
          ownerId: agreement.ownerId,
          amount: agreement.monthlyRent,
          paymentDate,
          paymentMethod: 'razorpay',
          status: 'completed',
          transactionId: `txn_${crypto.randomBytes(8).toString('hex')}`,
          receiptUrl: 'https://example.com/receipt.pdf'
        })
      }
    }
    console.log('Created payments')
  }

  async seed() {
    try {
      await this.connect()
      await this.cleanup()
      
      // Step 1: Create owner and verify documents
      await this.createOwnerFlow()
      
      // Step 2: Owner creates property and rooms
      await this.createProperty()
      
      // Step 3: Create potential tenant
      await this.createTenantFlow()
      
      // Step 4: Complete rental process
      await this.createRentalFlow()
      
      console.log('Database seeded successfully!')
      process.exit(0)
    } catch (error) {
      console.error('Error seeding database:', error)
      process.exit(1)
    }
  }
}

// Run seeder
const seeder = new DatabaseSeeder()
seeder.seed()