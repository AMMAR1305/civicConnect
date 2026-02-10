const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

require('dotenv').config();

// Get all officers (Admin only)
exports.getAllOfficers = async (req, res) => {
    try {
        console.log('📋 Get All Officers request from:', req.user?.Email, req.user?.Role);
        
        if (!req.user || req.user.Role !== 'Admin') {
            console.log('❌ Unauthorized: Only admins can view officers');
            return res.status(403).json({ message: 'Only admins can view all officers' });
        }
        
        const officers = await User.find({ Role: 'Officer' })
            .select('-Password')
            .sort({ createdAt: -1 });
        
        console.log(`✅ Found ${officers.length} officers`);
        res.json(officers);
    } catch (error) {
        console.error('Get officers error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Get all citizens (Admin only)
exports.getAllCitizens = async (req, res) => {
    try {
        console.log('📋 Get All Citizens request from:', req.user?.Email, req.user?.Role);
        
        if (!req.user || req.user.Role !== 'Admin') {
            console.log('❌ Unauthorized: Only admins can view citizens');
            return res.status(403).json({ message: 'Only admins can view all citizens' });
        }
        
        const citizens = await User.find({ Role: 'Citizen' })
            .select('-Password')
            .sort({ createdAt: -1 });
        
        console.log(`✅ Found ${citizens.length} citizens`);
        res.json(citizens);
    } catch (error) {
        console.error('Get citizens error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};


exports.register = async (req, res) => {
    try {
        console.log('\n🔵 === REGISTRATION REQUEST ===');
        console.log('📥 Request body:', JSON.stringify(req.body, null, 2));
        
        const { Name, Email, Password, Role } = req.body;
        
        // Validate required fields
        if (!Name || !Email || !Password) {
            console.log('❌ Validation failed - missing fields:', { 
                Name: !!Name, 
                Email: !!Email, 
                Password: !!Password 
            });
            return res.status(400).json({ message: 'Name, Email, and Password are required' });
        }
        
        console.log('✓ All required fields present');
        console.log(`📧 Checking if user exists: ${Email}`);
        
        const existingUser = await User.findOne({ Email });
        if (existingUser) {
            console.log(`❌ User already exists: ${Email} (ID: ${existingUser._id})`);
            return res.status(400).json({ message: 'User already exists' });
        }
        
        console.log('✓ Email is unique, proceeding with registration');
        console.log('🔐 Hashing password...');
        
        const hashedPassword = await bcrypt.hash(Password, 10);
        
        console.log('💾 Creating user in database...');
        const user = await User.create({
            Name,
            Email,
            Password: hashedPassword,
            Role: Role || 'Citizen'
        });

        console.log(`✅ USER CREATED SUCCESSFULLY!`);
        console.log(`   - ID: ${user._id}`);
        console.log(`   - Name: ${user.Name}`);
        console.log(`   - Email: ${user.Email}`);
        console.log(`   - Role: ${user.Role}`);
        console.log('=========================\n');
        
        res.status(201).json({ 
            message: 'User registered successfully',
            userId: user._id,
            email: user.Email,
            role: user.Role
        });
    } catch (error) {
        console.error('\n❌ === REGISTRATION ERROR ===');
        console.error('Error type:', error.name);
        console.error('Error message:', error.message);
        console.error('Full error:', error);
        console.error('==========================\n');
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        console.log('Login attempt:', { Email: req.body.Email });
        
        const { Email, Password } = req.body;
        
        // Validate input
        if (!Email || !Password) {
            console.log('Missing credentials:', { Email: !!Email, Password: !!Password });
            return res.status(400).json({ message: 'Email and Password are required' });
        }
        
        const existingUser = await User.findOne({ Email });

        if (!existingUser) {
            console.log('User not found:', Email);
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const isMatching = await bcrypt.compare(Password, existingUser.Password);

        if (!isMatching) {
            console.log('Password mismatch for user:', Email);
            return res.status(400).json({ message: 'Invalid Credentials' });
        }
        
        console.log('Login successful for:', Email, 'Role:', existingUser.Role);
        
        const token = jwt.sign({ 
            id: existingUser._id, 
            Role: existingUser.Role,
            Name: existingUser.Name,
            Email: existingUser.Email
        }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({token, message: 'Login Successful' });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { name, email } = req.body;
        const userId = req.user.id;

        // Check if email is being changed and already exists
        if (email) {
            const existingUser = await User.findOne({ Email: email, _id: { $ne: userId } });
            if (existingUser) {
                return res.status(400).json({ message: 'Email already in use' });
            }
        }

        const updateData = {};
        if (name) updateData.Name = name;
        if (email) updateData.Email = email;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true }
        ).select('-Password');

        // Generate new token with updated info
        const token = jwt.sign({ 
            id: updatedUser._id, 
            Role: updatedUser.Role,
            Name: updatedUser.Name,
            Email: updatedUser.Email
        }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ 
            message: 'Profile updated successfully',
            token,
            user: updatedUser
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        console.log("Change password request for user:", userId);
        console.log("Request body:", { currentPassword: currentPassword ? "provided" : "missing", newPassword: newPassword ? "provided" : "missing" });

        // Find user
        const user = await User.findById(userId);
        if (!user) {
            console.log("User not found:", userId);
            return res.status(404).json({ message: 'User not found' });
        }

        console.log("User found:", user.Email);

        // Verify current password
        const isMatching = await bcrypt.compare(currentPassword, user.Password);
        console.log("Current password match:", isMatching);
        
        if (!isMatching) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        user.Password = hashedPassword;
        await user.save();

        console.log("Password updated successfully for user:", user.Email);
        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.getCurrentUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select('-Password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
