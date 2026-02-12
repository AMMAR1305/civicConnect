/**
 * Script to update existing officers with zones and specializations
 * Run this once to enable auto-assignment for existing officers
 */

const mongoose = require('mongoose');
const User = require('./models/user');

// Your MongoDB connection string (update if different)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/civicai';

const updateOfficers = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Find all officers
    const officers = await User.find({ Role: 'Officer' });
    
    if (officers.length === 0) {
      console.log('⚠️ No officers found in database');
      console.log('💡 Use Admin Dashboard to register new officers with zones and specializations');
      await mongoose.connection.close();
      return;
    }
    
    console.log(`📊 Found ${officers.length} officer(s) in database\n`);
    
    // Available categories (match complaint categories)
    const categories = [
      'Infrastructure',
      'Water Supply', 
      'Electricity',
      'Sanitation',
      'Traffic',
      'Environment',
      'Safety',
      'Other'
    ];
    
    // Available zones (Tamil Nadu districts)
    const zones = [
      'Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Tiruchirappalli',
      'Tirupur', 'Vellore', 'Erode', 'Tirunelveli', 'Thanjavur',
      'Dindigul', 'Kanyakumari', 'Thoothukudi', 'Karur', 'Pudukkottai',
      'Cuddalore', 'Nagapattinam', 'Namakkal', 'Villupuram', 'Virudhunagar'
    ];
    
    let updated = 0;
    
    for (const officer of officers) {
      // Check if officer already has zones and specializations
      const hasZones = officer.assignedZones && officer.assignedZones.length > 0;
      const hasSpecs = officer.specializations && officer.specializations.length > 0;
      
      if (hasZones && hasSpecs) {
        console.log(`✓ ${officer.Name} (${officer.Email}) - Already configured`);
        console.log(`  Zones: ${officer.assignedZones.join(', ')}`);
        console.log(`  Specializations: ${officer.specializations.join(', ')}\n`);
        continue;
      }
      
      // Update officer with default values if not set
      const updateData = {};
      
      if (!hasZones) {
        // Assign 3 random zones or all zones
        updateData.assignedZones = zones.slice(0, 5); // First 5 zones
      }
      
      if (!hasSpecs) {
        // Assign 3 common specializations
        updateData.specializations = ['Infrastructure', 'Water Supply', 'Sanitation'];
      }
      
      if (officer.isAvailable === undefined) {
        updateData.isAvailable = true;
      }
      
      await User.findByIdAndUpdate(officer._id, updateData);
      updated++;
      
      console.log(`✅ Updated: ${officer.Name} (${officer.Email})`);
      console.log(`  ➕ Added Zones: ${updateData.assignedZones?.join(', ') || 'Already set'}`);
      console.log(`  ➕ Added Specializations: ${updateData.specializations?.join(', ') || 'Already set'}`);
      console.log(`  ➕ Available: ${updateData.isAvailable !== undefined ? 'Set to true' : 'Already set'}\n`);
    }
    
    if (updated > 0) {
      console.log(`\n🎉 Successfully updated ${updated} officer(s)!`);
      console.log('✅ Auto-assignment is now active for these officers');
    } else {
      console.log('\n✅ All officers already have zones and specializations configured');
    }
    
    console.log('\n📝 Next Steps:');
    console.log('   1. Create a new complaint to test auto-assignment');
    console.log('   2. Check complaint details to see assigned officer');
    console.log('   3. Use Admin Dashboard to customize officer zones/specializations\n');
    
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    
  } catch (error) {
    console.error('❌ Error updating officers:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run the update
updateOfficers();
