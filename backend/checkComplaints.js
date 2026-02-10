require("dotenv").config();
const mongoose = require("mongoose");
const Complaint = require("./models/complaint");
const User = require("./models/user");

async function checkComplaints() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    const complaints = await Complaint.find().populate('citizen', 'Name Email');
    console.log(`📋 Total Complaints in Database: ${complaints.length}\n`);
    
    if (complaints.length > 0) {
      console.log("📝 All Complaints:");
      complaints.forEach((c, i) => {
        console.log(`\n${i + 1}. ${c.title}`);
        console.log(`   - ID: ${c._id}`);
        console.log(`   - Category: ${c.category}`);
        console.log(`   - Status: ${c.status}`);
        console.log(`   - Priority: ${c.priority}`);
        console.log(`   - Citizen: ${c.citizen?.Name} (${c.citizen?.Email})`);
        console.log(`   - Created: ${c.createdAt}`);
      });
    } else {
      console.log("⚠️  No complaints found in database");
    }

    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

checkComplaints();
