// Seed real government scheme data for testing
import mongoose from 'mongoose';
import Scheme from '../models/Scheme.js';
import dotenv from 'dotenv';

dotenv.config();

const sampleSchemes = [
  {
    name: "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
    state: "All India",
    type: "Central",
    category: ["Agriculture", "Financial Assistance"],
    tags: ["Farmer", "Income Support", "DBT"],
    shortDescription: "Financial assistance of Rs. 6,000 per year to all landholding farmers in three equal installments directly into their bank accounts.",
    schemeUrl: "https://www.myscheme.gov.in/schemes/pm-kisan",
    scrapingStatus: "success",
    details: {
      benefits: "Rs. 6,000 per year in three installments of Rs. 2,000 each",
      eligibility: "All landholding farmers' families",
      applicationProcess: "Apply through Common Service Centres or online portal",
      documentsRequired: "Aadhaar, Bank Account, Land Records"
    }
  },
  {
    name: "Kisan Credit Card (KCC) Scheme",
    state: "All India",
    type: "Central",
    category: ["Agriculture", "Credit"],
    tags: ["Farmer", "Credit Card", "Loan"],
    shortDescription: "Provides farmers with timely access to credit for agricultural needs including cultivation, post-harvest expenses, and allied activities.",
    schemeUrl: "https://www.myscheme.gov.in/schemes/kcc",
    scrapingStatus: "success",
    details: {
      benefits: "Credit facility for crop cultivation and allied activities",
      eligibility: "Farmers, tenant farmers, sharecroppers, and SHGs",
      applicationProcess: "Apply at any bank branch",
      documentsRequired: "Identity Proof, Address Proof, Land Documents"
    }
  },
  {
    name: "Soil Health Card Scheme",
    state: "All India",
    type: "Central",
    category: ["Agriculture", "Soil Health"],
    tags: ["Farmer", "Soil Testing", "Crop Productivity"],
    shortDescription: "Provides soil health cards to farmers indicating the nutrient status of their soil along with recommendations on appropriate dosage of nutrients.",
    schemeUrl: "https://www.myscheme.gov.in/schemes/shc",
    scrapingStatus: "success",
    details: {
      benefits: "Free soil testing and recommendations for nutrient management",
      eligibility: "All farmers",
      applicationProcess: "Contact local agriculture department",
      documentsRequired: "None"
    }
  },
  {
    name: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
    state: "All India",
    type: "Central",
    category: ["Agriculture", "Insurance"],
    tags: ["Farmer", "Crop Insurance", "Risk Coverage"],
    shortDescription: "Comprehensive crop insurance scheme covering all stages of the crop cycle including post-harvest losses for all food and oilseed crops.",
    schemeUrl: "https://www.myscheme.gov.in/schemes/pmfby",
    scrapingStatus: "success",
    details: {
      benefits: "Comprehensive risk insurance for crop loss",
      eligibility: "All farmers including sharecroppers and tenant farmers",
      applicationProcess: "Apply through banks, CSCs, or online portal",
      documentsRequired: "Aadhaar, Bank Account, Land Records"
    }
  },
  {
    name: "National Agriculture Market (e-NAM)",
    state: "All India",
    type: "Central",
    category: ["Agriculture", "Marketing"],
    tags: ["Farmer", "Online Trading", "Better Prices"],
    shortDescription: "Pan-India electronic trading portal for agricultural commodities enabling farmers to sell their produce online to buyers across India.",
    schemeUrl: "https://www.myscheme.gov.in/schemes/enam",
    scrapingStatus: "success",
    details: {
      benefits: "Better price discovery and transparent auction process",
      eligibility: "All farmers",
      applicationProcess: "Register on e-NAM portal",
      documentsRequired: "Aadhaar, Bank Account"
    }
  },
  {
    name: "Paramparagat Krishi Vikas Yojana (PKVY)",
    state: "All India",
    type: "Central",
    category: ["Agriculture", "Organic Farming"],
    tags: ["Farmer", "Organic", "Sustainable"],
    shortDescription: "Promotes organic farming and helps groups of farmers to adopt organic farming through cluster approach.",
    schemeUrl: "https://www.myscheme.gov.in/schemes/pkvy",
    scrapingStatus: "success",
    details: {
      benefits: "Financial assistance of Rs. 50,000 per hectare for 3 years",
      eligibility: "Groups of farmers organized into clusters",
      applicationProcess: "Through state agriculture departments",
      documentsRequired: "Group formation documents, Land Records"
    }
  },
  {
    name: "Sub-Mission on Agricultural Mechanization (SMAM)",
    state: "All India",
    type: "Central",
    category: ["Agriculture", "Mechanization"],
    tags: ["Farmer", "Machinery", "Subsidy"],
    shortDescription: "Promotes agricultural mechanization among small and marginal farmers through subsidy on farm equipment and machinery.",
    schemeUrl: "https://www.myscheme.gov.in/schemes/smam",
    scrapingStatus: "success",
    details: {
      benefits: "40-50% subsidy on agricultural machinery",
      eligibility: "Small and marginal farmers, CHCs, FPOs",
      applicationProcess: "Apply through state agriculture departments or DBT portal",
      documentsRequired: "Aadhaar, Bank Account, Land Records"
    }
  }
];

async function seedSchemes() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    console.log('🗑️  Clearing existing government schemes...');
    await Scheme.deleteMany({});
    console.log('✅ Cleared existing schemes');

    console.log('🌱 Seeding sample schemes...');
    const inserted = await Scheme.insertMany(sampleSchemes);
    console.log(`✅ Inserted ${inserted.length} schemes`);

    console.log('\n📊 Sample schemes:');
    inserted.forEach(scheme => {
      console.log(`  ✓ ${scheme.name}`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    console.log('🎉 Seeding completed successfully!');
    console.log('\n💡 Now refresh your browser at http://localhost:5173/gov-schemes');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedSchemes();
