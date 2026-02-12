# Auto Complaint Assignment Feature

## Overview
The CIVICAI platform now includes an intelligent auto-assignment system that automatically assigns incoming complaints to the most suitable officer based on multiple criteria.

## How It Works

### 1. **Category-Based Assignment**
Officers can be assigned specific specializations (complaint categories they handle):
- Water
- Electricity
- Road
- Sanitation
- Public Works
- Traffic

**Scoring:** Officers with matching specializations receive **100 points**. Officers without specific specializations (can handle all) receive **50 points**.

### 2. **Zone-Based Routing**
Officers can be assigned to specific zones/districts where they operate:
- Officers can handle multiple zones
- If no zones are assigned, the officer can handle any zone

**Scoring:** Officers with matching zone receive **50 points**. Officers without specific zones (can handle all) receive **25 points**.

### 3. **Least Workload Selection**
The system considers the current workload of each officer:
- Counts active complaints (not Resolved or Closed)
- Balances work distribution across all officers

**Scoring:** Officers receive up to **30 points** based on workload:
- 0 complaints = 30 points
- Each complaint reduces score by 3 points
- Maximum consideration: 10 active complaints

### Final Assignment
The system calculates a total score for each officer:
```
Total Score = Category Match Score + Zone Match Score + Workload Score
```

The officer with the **highest total score** is assigned the complaint.

## Benefits

### For Citizens
- ✅ **Faster Response**: Complaints go to the most qualified officer immediately
- ✅ **Better Quality**: Officers handle complaints in their area of expertise
- ✅ **Fair Distribution**: No officer gets overloaded with work

### For Officers
- ✅ **Relevant Work**: Receive complaints matching their specializations
- ✅ **Local Focus**: Handle complaints in assigned zones
- ✅ **Balanced Workload**: Fair distribution prevents burnout

### For Administrators
- ✅ **Automated Process**: No manual assignment needed
- ✅ **Optimized Performance**: Right person for the right job
- ✅ **Configurable**: Easy to set officer specializations and zones

## Configuration

### Adding an Officer with Auto-Assignment Settings

1. **Navigate to Admin Dashboard** → Officers Tab
2. **Click "Add Officer"**
3. **Fill in basic details**:
   - Full Name
   - Email Address
   - Password

4. **Configure Specializations**:
   - Select one or more categories the officer can handle
   - Leave empty for "all categories"

5. **Configure Assigned Zones**:
   - Type zone/district names and press Enter
   - Add multiple zones as needed
   - Leave empty for "all zones"

6. **Create Officer Account**

### Viewing Officer Assignment Configuration

1. **Navigate to Officers Tab**
2. **Click "View Details" on any officer card**
3. **View "Assignment Configuration" section** showing:
   - Specializations (categories)
   - Assigned Zones/Districts
   - Availability status

## Technical Implementation

### Backend Changes

#### User Model (`backend/models/user.js`)
```javascript
{
  assignedZones: [String],      // Array of zone/district names
  specializations: [String],    // Array of category names
  isAvailable: Boolean          // Availability status
}
```

#### Auto-Assignment Function (`backend/controller/complaintController.js`)
- Receives category and zone from complaint
- Queries available officers
- Scores each officer based on 3 criteria
- Returns officer with highest score

### Frontend Changes

#### Admin Dashboard (`frontend/src/Pages/AdminDashboard.jsx`)
- Add Officer form with specializations selector
- Zone input with tag management
- Officer detail view showing configuration
- Officer cards showing specializations preview

#### Create Complaint (`frontend/src/Pages/CreateComplaint.jsx`)
- Information banner about auto-assignment
- Enhanced success message explaining the process

## Example Scenarios

### Scenario 1: Perfect Match
**Complaint:**
- Category: Water
- Zone: Chennai

**Officer A:**
- Specializations: [Water, Sanitation]
- Zones: [Chennai, Coimbatore]
- Workload: 2 complaints

**Officer B:**
- Specializations: [Road, Traffic]
- Zones: [Chennai]
- Workload: 1 complaint

**Result:** Officer A is assigned (100 + 50 + 24 = 174 points vs Officer B's 50 + 50 + 27 = 127 points)

### Scenario 2: Workload Matters
**Complaint:**
- Category: Water
- Zone: Salem

**Officer A:**
- Specializations: [Water]
- Zones: [Salem]
- Workload: 8 complaints

**Officer B:**
- Specializations: [Water]
- Zones: [Salem]
- Workload: 2 complaints

**Result:** Officer B is assigned (both match on category and zone, but B has lower workload: 174 points vs 150 points)

### Scenario 3: Generalist Assignment
**Complaint:**
- Category: Public Works
- Zone: Madurai

**Officer A:**
- Specializations: [] (empty = all)
- Zones: [] (empty = all)
- Workload: 3 complaints

**Result:** Officer A is assigned as a generalist (50 + 25 + 21 = 96 points)

## Monitoring and Analytics

### Admin Dashboard Metrics
- View officer workloads in real-time
- Track assignment performance
- Monitor SLA compliance by officer

### Future Enhancements
- [ ] Machine learning-based assignment optimization
- [ ] Time-based availability scheduling
- [ ] Skills rating and performance feedback
- [ ] Automatic re-assignment for long-pending complaints
- [ ] Officer preference settings
- [ ] Multi-officer assignment for complex issues

## API Documentation

### Register Officer with Assignment Config
```http
POST /auth/register
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "Name": "John Doe",
  "Email": "john@example.com",
  "Password": "securepassword",
  "Role": "Officer",
  "assignedZones": ["Chennai", "Coimbatore"],
  "specializations": ["Water", "Sanitation"],
  "isAvailable": true
}
```

### Response
```json
{
  "message": "User registered successfully",
  "userId": "60f7b3b3b3b3b3b3b3b3b3b3",
  "email": "john@example.com",
  "role": "Officer"
}
```

## Troubleshooting

### No Officer Assigned
**Possible Causes:**
- No officers in the system
- All officers marked as unavailable
- System error

**Solution:** Check officer availability status in Admin Dashboard

### Unbalanced Workload
**Possible Causes:**
- Too few officers with specific specializations
- Zone coverage gaps

**Solution:** Add more officers or adjust specializations to cover all categories

### Wrong Officer Assigned
**Possible Causes:**
- Officer configuration needs updating
- Zone names not matching complaint location

**Solution:** Review and update officer zones and specializations

## Support
For issues or questions about the auto-assignment feature:
- Check console logs for assignment details
- Review officer configurations in Admin Dashboard
- Contact system administrator

---

**Last Updated:** February 12, 2026  
**Version:** 1.0  
**Feature Status:** ✅ Active
