# Admin User Setup ha

## Create Admin User

To create the admin user with the following credentials:
- **Email:** admin@gmail.com
- **Password:** admin123

### Method 1: Using API Endpoint (Recommended)

1. Make sure your MongoDB is running and `.env.local` is configured
2. Start your development server:
   ```bash
   npm run dev
   ```
3. Open your browser and go to:
   ```
   http://localhost:3000/api/admin/create-admin
   ```
   Or use a tool like Postman/curl to make a POST request:
   ```bash
   curl -X POST http://localhost:3000/api/admin/create-admin
   ```

### Method 2: Using Browser Console

1. Open your browser's developer console (F12)
2. Go to your website (http://localhost:3000)
3. Run this in the console:
   ```javascript
   fetch('/api/admin/create-admin', { method: 'POST' })
     .then(res => res.json())
     .then(data => console.log(data));
   ```

## Login as Admin

After creating the admin user:
1. Go to `/login` page
2. Enter:
   - Email: `admin@gmail.com`
   - Password: `admin123@`
3. You will be redirected to `/admin` panel

## Admin Panel Access

- Only users with `role: 'admin'` can access `/admin`
- Regular users will be redirected to home page if they try to access admin panel

