const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import Models
const User = require('../models/User');
const Report = require('../models/Report');
const Hospital = require('../models/Hospital');
const Laboratory = require('../models/Laboratory');
const Airport = require('../models/Airport');
const Outbreak = require('../models/Outbreak');
const Alert = require('../models/Alert');
const Resource = require('../models/Resource');
const Incident = require('../models/Incident');

const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://localhost:27017/globalmedx';
    await mongoose.connect(connStr);
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
    
    // Seed database if empty
    await seedDatabase();
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    // 1. Seed Users
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Seeding Users...');
      const adminPassword = await bcrypt.hash('admin123', 10);
      const officerPassword = await bcrypt.hash('officer123', 10);
      
      await User.insertMany([
        { name: 'Admin Administrator', email: 'admin@globalmedx.gov', password: adminPassword, role: 'admin' },
        { name: 'Surveillance Officer', email: 'officer@globalmedx.gov', password: officerPassword, role: 'officer' }
      ]);
    }

    // 2. Seed Reports
    const reportCount = await Report.countDocuments();
    if (reportCount === 0) {
      console.log('Seeding Reports...');
      await Report.insertMany([
        { country: 'United States', disease: 'COVID-19', cases: 12500, deaths: 150, recoveries: 11000 },
        { country: 'India', disease: 'COVID-19', cases: 18400, deaths: 220, recoveries: 17200 },
        { country: 'Brazil', disease: 'Dengue Fever', cases: 8500, deaths: 45, recoveries: 7900 },
        { country: 'Democratic Republic of Congo', disease: 'Ebola', cases: 350, deaths: 180, recoveries: 120 },
        { country: 'United Kingdom', disease: 'Influenza', cases: 9200, deaths: 60, recoveries: 8900 },
        { country: 'South Africa', disease: 'Tuberculosis', cases: 4200, deaths: 110, recoveries: 3500 },
        { country: 'Australia', disease: 'Influenza', cases: 2500, deaths: 12, recoveries: 2400 },
        { country: 'Nigeria', disease: 'Lassa Fever', cases: 880, deaths: 95, recoveries: 700 }
      ]);
    }

    // 3. Seed Hospitals
    const hospitalCount = await Hospital.countDocuments();
    if (hospitalCount === 0) {
      console.log('Seeding Hospitals...');
      await Hospital.insertMany([
        { name: 'Metro General Hospital', country: 'United States', city: 'New York', totalBeds: 500, availableBeds: 120, activeCases: 45, contactNumber: '+1-555-0199' },
        { name: 'AIIMS New Delhi', country: 'India', city: 'New Delhi', totalBeds: 2200, availableBeds: 150, activeCases: 380, contactNumber: '+91-11-26588500' },
        { name: 'St Thomas Hospital', country: 'United Kingdom', city: 'London', totalBeds: 800, availableBeds: 240, activeCases: 65, contactNumber: '+44-20-71887188' },
        { name: 'Albert Einstein Hospital', country: 'Brazil', city: 'Sao Paulo', totalBeds: 600, availableBeds: 180, activeCases: 30, contactNumber: '+55-11-21511233' }
      ]);
    }

    // 4. Seed Laboratories
    const labCount = await Laboratory.countDocuments();
    if (labCount === 0) {
      console.log('Seeding Laboratories...');
      await Laboratory.insertMany([
        { name: 'CDC Global Diagnostics', country: 'United States', city: 'Atlanta', testsConducted: 45000, positiveResults: 1200, negativeResults: 43800, primaryFocus: 'Virology' },
        { name: 'National Institute of Virology', country: 'India', city: 'Pune', testsConducted: 32000, positiveResults: 1500, negativeResults: 30500, primaryFocus: 'Vector-borne Pathogens' },
        { name: 'Porton Down Lab', country: 'United Kingdom', city: 'Salisbury', testsConducted: 21000, positiveResults: 600, negativeResults: 20400, primaryFocus: 'Bio-surveillance' }
      ]);
    }

    // 5. Seed Airports
    const airportCount = await Airport.countDocuments();
    if (airportCount === 0) {
      console.log('Seeding Airports...');
      await Airport.insertMany([
        { name: 'JFK International Airport', city: 'New York', country: 'United States', passengersScreened: 120000, highRiskFlagged: 45, quarantined: 12 },
        { name: 'Indira Gandhi International Airport', city: 'New Delhi', country: 'India', passengersScreened: 150000, highRiskFlagged: 90, quarantined: 32 },
        { name: 'London Heathrow Airport', city: 'London', country: 'United Kingdom', passengersScreened: 110000, highRiskFlagged: 25, quarantined: 8 }
      ]);
    }

    // 6. Seed Outbreaks
    const outbreakCount = await Outbreak.countDocuments();
    if (outbreakCount === 0) {
      console.log('Seeding Outbreaks...');
      await Outbreak.insertMany([
        { disease: 'Ebola', region: 'Central Africa', severity: 'Critical', status: 'Active', caseCount: 350 },
        { disease: 'Dengue Fever', region: 'South America', severity: 'High', status: 'Active', caseCount: 8500 },
        { disease: 'Influenza A', region: 'Western Europe', severity: 'Medium', status: 'Monitoring', caseCount: 9200 }
      ]);
    }

    // 7. Seed Alerts
    const alertCount = await Alert.countDocuments();
    if (alertCount === 0) {
      console.log('Seeding Alerts...');
      await Alert.insertMany([
        { title: 'Ebola Outbreak Surge', description: 'Immediate containment protocols active in Central Africa.', level: 'Danger', status: 'Active' },
        { title: 'Flu Season Warning', description: 'Increased influenza cases noted across UK and France.', level: 'Warning', status: 'Active' },
        { title: 'Routine COVID Screening', description: 'Screening levels normalized at European borders.', level: 'Info', status: 'Resolved' }
      ]);
    }

    // 8. Seed Resources
    const resourceCount = await Resource.countDocuments();
    if (resourceCount === 0) {
      console.log('Seeding Resources...');
      await Resource.insertMany([
        { item: 'Vaccines', totalQuantity: 100000, allocatedQuantity: 45000, region: 'Asia-Pacific' },
        { item: 'Ventilators', totalQuantity: 1200, allocatedQuantity: 950, region: 'North America' },
        { item: 'PPE Kits', totalQuantity: 500000, allocatedQuantity: 320000, region: 'South America' },
        { item: 'ICU Beds', totalQuantity: 5000, allocatedQuantity: 4100, region: 'Europe' }
      ]);
    }

    // 9. Seed Incidents
    const incidentCount = await Incident.countDocuments();
    if (incidentCount === 0) {
      console.log('Seeding Incidents...');
      await Incident.insertMany([
        { title: 'Vaccine Transport Delays', description: 'Cold-chain shipping issues at border checkpoints in Europe.', region: 'Europe', status: 'Open', reportedBy: 'Logistics Officer' },
        { title: 'ICU Bed Shortage', description: 'Hospital bed limits reached in Delhi Metropolitan Area.', region: 'Asia-Pacific', status: 'Investigating', reportedBy: 'Hospital Liaison' }
      ]);
    }

    console.log('Database Seeding Completed Successfully.');
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
  }
};

module.exports = connectDB;
