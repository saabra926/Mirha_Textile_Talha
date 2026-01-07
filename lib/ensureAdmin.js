import connectDB from './mongodb';
import User from '../models/User';
import bcrypt from 'bcryptjs';

const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = 'admin123@';

let adminChecked = false;
let adminCheckPromise = null;

/**
 * Ensures admin user exists in database
 * This function is idempotent and safe to call multiple times
 */
export async function ensureAdminExists() {
  // Return cached promise if already checking
  if (adminCheckPromise) {
    return adminCheckPromise;
  }

  // If already checked and exists, return immediately
  if (adminChecked) {
    return { exists: true, created: false };
  }

  adminCheckPromise = (async () => {
    try {
      await connectDB();

      // Check if admin user exists
      const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });

      if (existingAdmin) {
        // Admin exists, ensure role is 'admin' and password is correct
        const needsUpdate = existingAdmin.role !== 'admin';
        let passwordNeedsUpdate = false;

        // Check if password is correct
        try {
          const isPasswordValid = await existingAdmin.comparePassword(ADMIN_PASSWORD);
          passwordNeedsUpdate = !isPasswordValid;
        } catch (error) {
          console.log('Password check error, will reset password:', error.message);
          passwordNeedsUpdate = true;
        }

        if (needsUpdate || passwordNeedsUpdate) {
          // Update role
          existingAdmin.role = 'admin';
          
          // Set plain password - pre-save hook will hash it automatically
          if (passwordNeedsUpdate) {
            existingAdmin.password = ADMIN_PASSWORD; // Plain password - hook will hash
            console.log('🔄 Resetting admin password...');
          }
          
          await existingAdmin.save();
          console.log('✅ Admin user updated: role and password reset');
          
          // Clear cache to allow fresh check on next attempt
          adminChecked = false;
        } else {
          adminChecked = true;
        }
        
        return { exists: true, created: false, updated: needsUpdate || passwordNeedsUpdate };
      }

      // Admin doesn't exist, create it
      // Set plain password - User model's pre-save hook will hash it automatically
      const admin = await User.create({
        firstName: 'Admin',
        lastName: 'User',
        name: 'Admin User',
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD, // Plain password - pre-save hook will hash it
        role: 'admin',
      });

      console.log('✅ Admin user created successfully');
      console.log('📧 Email:', ADMIN_EMAIL);
      console.log('🔐 Password:', ADMIN_PASSWORD);

      adminChecked = true;
      return { exists: false, created: true, user: admin };
    } catch (error) {
      console.error('❌ Error ensuring admin exists:', error);
      adminCheckPromise = null; // Reset on error
      throw error;
    } finally {
      // Reset promise after 5 seconds to allow re-check if needed
      setTimeout(() => {
        adminCheckPromise = null;
      }, 5000);
    }
  })();

  return adminCheckPromise;
}

