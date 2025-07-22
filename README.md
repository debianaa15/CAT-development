# CAT - Cat Adoption and Training System

A comprehensive platform for DLSU PUSA (Professors for the Upliftment of Society's Animals) to manage cat adoption, volunteer scheduling, and training programs.

## Features

- **User Authentication**: Sign up and login system for volunteers, trainers, and admins
- **Cat Adoption Management**: Browse available cats and book adoption interviews
- **Volunteer Scheduling**: Interactive calendar for feeding and nook duties
- **Profile Management**: Track volunteer quotas and upcoming duties
- **Modern UI Design**: Clean, responsive interface with DLSU PUSA branding
- **Role-based Access**: Different interfaces for Volunteers, Trainers, and Admins

## Pages

- **Welcome Page**: Landing page with navigation to all features
- **Login/Signup**: Authentication system
- **Profile**: User information and quota tracking
- **Fur Adoption**: Cat profiles and adoption interview booking
- **About PUSA**: Organization information and donation channels
- **Scheduler**: Weekly calendar for volunteer duties (original functionality)

## Technologies Used

- **Backend**: Node.js with Express.js
- **Template Engine**: Handlebars.js
- **Styling**: Modern CSS with CSS Grid and Flexbox
- **Database**: MySQL (schema defined, integration pending)
- **Typography**: Poppins and Inter font families
- **Date Handling**: Moment.js

## Installation

1. Clone or download the project
2. Navigate to the project directory
3. Install dependencies:
   ```bash
   npm install
   ```

## Usage

1. Start the server:
   ```bash
   npm start
   ```
   
   For development with auto-restart:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to `http://localhost:3000`

3. Available routes:
   - `/` - Welcome page
   - `/login` - User login
   - `/signup` - User registration
   - `/profile` - User profile and quota tracking
   - `/fur-adoption` - Cat adoption page
   - `/about` - About PUSA organization
   - `/scheduler` - Weekly volunteer scheduler

## Database Schema

The application includes a comprehensive MySQL schema (`database/schema.sql`) with tables for:

- **Users**: Volunteer, trainer, and admin accounts
- **Cats**: Cat profiles with adoption status
- **Feeding Slots**: Volunteer feeding schedules
- **Nook Slots**: Shelter area volunteer schedules
- **Signups**: Volunteer activity tracking
- **Adoption Applications**: Cat adoption management

## Development Status

- ✅ UI Templates and styling complete
- ✅ Basic routing and navigation
- ✅ Responsive design for mobile/desktop
- ⏳ Database integration (pending)
- ⏳ Authentication system (pending)
- ⏳ Cat profile management (pending)
- ⏳ Volunteer scheduling logic (pending)

## Contributing

This is an academic project for ITISDEV course. Future improvements can include:
- Database connectivity with MySQL
- User authentication and session management
- Cat photo upload functionality
- Email notifications for adoptions
- Advanced volunteer scheduling algorithms
- Admin dashboard for managing cats and users

## License

MIT License
