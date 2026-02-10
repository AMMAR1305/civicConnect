require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/user");
const Complaint = require("./models/complaint");

async function checkData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    // Check users
    const users = await User.find();
    console.log(`👥 Total Users: ${users.length}`);
    
    const adminUsers = users.filter(u => u.Role === "Admin");
    const officerUsers = users.filter(u => u.Role === "Officer");
    const citizenUsers = users.filter(u => u.Role === "Citizen");
    
    console.log(`   - Admins: ${adminUsers.length}`);
    console.log(`   - Officers: ${officerUsers.length}`);
    console.log(`   - Citizens: ${citizenUsers.length}\n`);
    
    if (adminUsers.length > 0) {
      console.log("🔑 Admin Users:");
      adminUsers.forEach(admin => {
        console.log(`   - ${admin.Name} (${admin.Email})`);
      });
      console.log("");
    } else {
      console.log("⚠️  WARNING: No Admin users found in database!\n");
    }

    // Check complaints
    const complaints = await Complaint.find();
    console.log(`📋 Total Complaints: ${complaints.length}`);
    
    if (complaints.length > 0) {
      const statusCounts = {};
      complaints.forEach(c => {
        statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;
      });
      
      console.log("\n📊 Complaints by Status:");
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`   - ${status}: ${count}`);
      });
      
      console.log("\n📝 First 3 complaints:");
      complaints.slice(0, 3).forEach((c, i) => {
        console.log(`   ${i + 1}. ${c.title} (${c.status}) - ${c.category}`);
      });
    } else {
      console.log("   ⚠️  No complaints found in database");
    }

    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

checkData();
