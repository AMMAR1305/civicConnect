require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/user");

async function testRegistration() {
  try {
    console.log("🔗 Connecting to MongoDB...");
    console.log("Using URI:", process.env.MONGO_URI.replace(/:[^:@]+@/, ':****@'));
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    // List existing users
    const existingUsers = await User.find();
    console.log(`📊 Current users in database: ${existingUsers.length}`);
    existingUsers.forEach(user => {
      console.log(`   - ${user.Name} (${user.Email}) - ${user.Role}`);
    });

    // Try to create a test user
    const testEmail = `test${Date.now()}@example.com`;
    console.log(`\n🧪 Creating test user: ${testEmail}`);
    
    const hashedPassword = await bcrypt.hash("password123", 10);
    const newUser = await User.create({
      Name: "Test User",
      Email: testEmail,
      Password: hashedPassword,
      Role: "Citizen"
    });

    console.log(`✅ Test user created successfully!`);
    console.log(`   - ID: ${newUser._id}`);
    console.log(`   - Name: ${newUser.Name}`);
    console.log(`   - Email: ${newUser.Email}`);
    console.log(`   - Role: ${newUser.Role}`);

    // Verify user was saved
    const savedUser = await User.findById(newUser._id);
    if (savedUser) {
      console.log(`\n✅ VERIFICATION: User was successfully saved to database!`);
    } else {
      console.log(`\n❌ ERROR: User was not found in database after creation!`);
    }

    // Show updated count
    const updatedUsers = await User.find();
    console.log(`\n📊 Updated user count: ${updatedUsers.length}`);

    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error("Full error:", error);
    process.exit(1);
  }
}

testRegistration();
