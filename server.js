const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');



// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/DLSU_PUSA_DB')
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));



const { engine } = require('express-handlebars');
const bodyParser = require('body-parser');
const moment = require('moment');
const path = require('path');
const fs = require('fs');

const app = express();

// MongoDB slot management functions
async function getSlotSignups(slotType) {
  try {
    const Model = slotType === 'feeding' ? FeedingSignup : NookSignup;
    const signups = await Model.find().lean();
    return signups;
  } catch (err) {
    console.error('Error getting signups:', err);
    return [];
  }
}

async function addSlotSignup(slotType, signup) {
  try {
    const Model = slotType === 'feeding' ? FeedingSignup : NookSignup;
    const newSignup = new Model(signup);
    await newSignup.save();
    return true;
  } catch (err) {
    console.error('Error adding signup:', err);
    return false;
  }
}

async function removeSlotSignup(slotType, userId, date) {
  try {
    const Model = slotType === 'feeding' ? FeedingSignup : NookSignup;
    
    // Check if the user being removed is a trainer
    const userSignup = await Model.findOne({
      volunteer_id: userId,
      slot_date: date
    });
    
    const wasTrainer = userSignup && userSignup.is_trainer;
    
    // Remove the user's signup
    const result = await Model.deleteOne({
      volunteer_id: userId,
      slot_date: date
    });
    
    // If a trainer was removed and there are still volunteers, promote the first one to trainer
    if (wasTrainer && result.deletedCount > 0) {
      const remainingSignups = await Model.find({ slot_date: date });
      if (remainingSignups.length > 0) {
        // Promote the first remaining volunteer to trainer
        await Model.updateOne(
          { _id: remainingSignups[0]._id },
          { is_trainer: true }
        );
      }
    }
    
    return result.deletedCount > 0;
  } catch (err) {
    console.error('Error removing signup:', err);
    return false;
  }
}
const PORT = process.env.PORT || 3000;

app.use(session({
  secret: 'supersecretkey', // replace with env var in production
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // secure:true only if HTTPS
}));

// Middleware: body-parser must be before any routes
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// Import User model for MongoDB authentication
const User = require('./models/user');
// Adoption applications model (MongoDB)
const AdoptionApplication = require('./models/adoptionApplication');
// Slot signup models (MongoDB)
const FeedingSignup = require('./models/feedingSignup');
const NookSignup = require('./models/nookSignup');


// --- LOGIN ROUTE FOR AJAX LOGIN ---
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user in MongoDB
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(401).json({ message: 'Account not found.' });
    }
    
    // Use bcrypt to compare password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Incorrect password.' });
    }
    req.session.user = {
      id: user._id,
      name: user.user_name,
      role: user.user_role,
      email: user.email
    };
    
    // Success: return user_role for differentiation
    if (user.user_role === 'Trainer') {
      return res.json({ role: user.user_role, redirect: '/trainer' });
    } else if (user.user_role === 'Volunteer') {
      return res.json({ role: user.user_role, redirect: '/main' });
    }else if (user.user_role === 'Admin') {
      return res.json({ role: user.user_role, redirect: '/adminadoptionrequests' });
    }
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// Trainer dashboard route

app.get('/trainer', (req, res) => {
  const currentDate = moment();
  const weekDate = req.query.week ? moment(req.query.week) : currentDate;
  const weekDays = generateWeekData(weekDate);
  const monthName = weekDate.format('MMMM YYYY');
  const timeSlots = [
    '2 PM',
    '3 PM',
    '4 PM',
    '5 PM',
    '6 PM'
  ];
  const user = req.session && req.session.user
        ? req.session.user
        : { user_name: 'Guest' };
  res.render('trainer', {
    weekDays,
    currentMonth: monthName,
    timeSlots,
    events: events,
    currentWeek: weekDate.format('YYYY-MM-DD'),
    user
  });
});
// Global events array to fix 'events is not defined' error
let events = [];

// Handlebars configuration
app.engine('handlebars', engine({
    defaultLayout: 'main',
    helpers: {
        eq: function(a, b) { return a === b; },
        add: function(a, b) { return a + b; },
        and: function() {
            // Returns true if all arguments are truthy
            var args = Array.prototype.slice.call(arguments, 0, -1); // last arg is options
            return args.every(Boolean);
        },
        formatDate: function(date) {
            return moment(date).format('YYYY-MM-DD');
        },
        formatTime: function(date) {
            return moment(date).format('HH:mm');
        },
        calculateEventPosition: function(timeStr) {
            const [hours, minutes] = timeStr.split(':').map(Number);
            const totalMinutes = (hours - 14) * 60 + minutes; // 2 PM (14:00) is the start
            return (totalMinutes / 60) * 80; // 80px per hour
        },
        calculateEventHeight: function(startTime, endTime) {
            if (!endTime) return 80; // Default 1 hour
            const [startHours, startMinutes] = startTime.split(':').map(Number);
            const [endHours, endMinutes] = endTime.split(':').map(Number);
            const startTotal = startHours * 60 + startMinutes;
            const endTotal = endHours * 60 + endMinutes;
            const durationMinutes = endTotal - startTotal;
            return (durationMinutes / 60) * 80; // 80px per hour
        }
    }
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// Fur Adoption route
app.get('/furadoption', (req, res) => {

    const user = req.session && req.session.user
        ? req.session.user
        : { user_name: 'Guest' };  
    res.render('furadaption', {
      user
    });
});

// Admin Adoption Requests routes (singular and plural)
app.get(['/adminadoptionrequest', '/adminadoptionrequests'], async (req, res) => {
  try {
    const user = req.session && req.session.user ? req.session.user : null;
    if (!user || user.role !== 'Admin') {
      return res.status(403).send('Forbidden');
    }
    const applications = await AdoptionApplication.find().sort({ application_date: -1 }).lean();
    return res.render('adminadoptionrequest', { user, applications });
  } catch (err) {
    console.error('Load admin adoption requests error:', err);
    return res.status(500).send('Server error');
  }
});

// Admin Trainer User List route
app.get('/admin/trainer-users', async (req, res) => {
  try {
    const user = req.session && req.session.user ? req.session.user : null;
    if (!user || user.role !== 'Admin') {
      return res.status(403).send('Forbidden');
    }
    const trainers = await User.find({ user_role: 'Trainer' }).lean();
    return res.render('admintraineruserlist', { user, trainers });
  } catch (err) {
    console.error('Load trainers error:', err);
    return res.status(500).send('Server error');
  }
});

// Admin: change a user's role
app.put('/admin/users/:id/role', async (req, res) => {
  try {
    const currentUser = req.session && req.session.user ? req.session.user : null;
    if (!currentUser || currentUser.role !== 'Admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const { id } = req.params;
    const { role } = req.body || {};
    const allowed = ['Admin', 'Volunteer', 'Trainer'];
    if (!allowed.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const updated = await User.findByIdAndUpdate(id, { user_role: role }, { new: true }).lean();
    if (!updated) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json({ message: 'Role updated', user: updated });
  } catch (err) {
    console.error('Update role error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Admin: remove a user
app.delete('/admin/users/:id', async (req, res) => {
  try {
    const currentUser = req.session && req.session.user ? req.session.user : null;
    if (!currentUser || currentUser.role !== 'Admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const { id } = req.params;
    const result = await User.findByIdAndDelete(id).lean();
    if (!result) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json({ message: 'User removed' });
  } catch (err) {
    console.error('Remove user error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Admin Volunteer User List route
app.get('/admin/volunteer-users', async (req, res) => {
  try {
    const user = req.session && req.session.user ? req.session.user : null;
    if (!user || user.role !== 'Admin') {
      return res.status(403).send('Forbidden');
    }
    const volunteers = await User.find({ user_role: 'Volunteer' }).lean();
    return res.render('adminvolunteeruserlist', { user, volunteers });
  } catch (err) {
    console.error('Load volunteers error:', err);
    return res.status(500).send('Server error');
  }
});

// Admin Cats List route
const Cat = require('./models/cat');
app.get('/admin/cats', async (req, res) => {
  try {
    const user = req.session && req.session.user ? req.session.user : null;
    if (!user || user.role !== 'Admin') {
      return res.status(403).send('Forbidden');
    }
    const cats = await Cat.find().lean();
    return res.render('admincatslist', { user, cats });
  } catch (err) {
    console.error('Load cats error:', err);
    return res.status(500).send('Server error');
  }
});

// Admin: add a new cat
app.post('/admin/cats', async (req, res) => {
  try {
    const user = req.session && req.session.user ? req.session.user : null;
    if (!user || user.role !== 'Admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const { cat_name, adoption_status, cat_description } = req.body || {};
    if (!cat_name) return res.status(400).json({ message: 'cat_name is required' });
    const cat = new Cat({ cat_name, adoption_status, cat_description });
    await cat.save();
    res.status(201).json({ message: 'Cat added', cat });
  } catch (err) {
    console.error('Add cat error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: delete a cat
app.delete('/admin/cats/:id', async (req, res) => {
  try {
    const user = req.session && req.session.user ? req.session.user : null;
    if (!user || user.role !== 'Admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const { id } = req.params;
    const result = await Cat.findByIdAndDelete(id).lean();
    if (!result) return res.status(404).json({ message: 'Cat not found' });
    res.json({ message: 'Cat removed' });
  } catch (err) {
    console.error('Delete cat error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: update a cat
app.put('/admin/cats/:id', async (req, res) => {
  try {
    const user = req.session && req.session.user ? req.session.user : null;
    if (!user || user.role !== 'Admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const { id } = req.params;
    const { cat_name, adoption_status, cat_description } = req.body || {};
    const updated = await Cat.findByIdAndUpdate(
      id,
      { cat_name, adoption_status, cat_description },
      { new: true }
    ).lean();
    if (!updated) return res.status(404).json({ message: 'Cat not found' });
    res.json({ message: 'Cat updated', cat: updated });
  } catch (err) {
    console.error('Update cat error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to generate week data
function generateWeekData(date) {
    const startOfWeek = moment(date).startOf('week');
    const weekDays = [];
    
    for (let i = 0; i < 7; i++) {
        const currentDay = startOfWeek.clone().add(i, 'day');
        const dayEvents = events.filter(event => 
            moment(event.date).isSame(currentDay, 'day')
        );
        
        weekDays.push({
            dayName: currentDay.format('ddd').toUpperCase(),
            day: currentDay.date(),
            dateString: currentDay.format('YYYY-MM-DD'),
            isToday: currentDay.isSame(moment(), 'day'),
            events: dayEvents
        });
    }
    
    return weekDays;
}


// Route for sign-in page
app.get('/', (req, res) => {
    res.render('signin');
});

// Route for signup page
app.get('/signup', (req, res) => {
    res.render('signup');
});

// Handle signup form submission
app.post('/signup', async (req, res) => {
    const { firstName, lastName, email, idNumber, role, password } = req.body;

    if (!firstName || !lastName || !email || !idNumber || !role || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            return res.status(409).json({ message: 'Email already registered' });
        }

        // Capitalize role to match enum in model (trainer -> Trainer, volunteer -> Volunteer)
        const formattedRole = role.charAt(0).toUpperCase() + role.slice(1);

        const newUser = new User({
            user_name: `${firstName} ${lastName}`,  // Combine first + last
            email: email,
            user_password: password,               // Will be hashed by pre-save middleware
            user_role: formattedRole
        });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });

    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ message: 'Server error. Please try again.' });
    }
});

// Handle sign-in form submission
app.post('/signin', (req, res) => {
    // Add authentication logic here if needed
    res.redirect('/main');
});

// Route for about page
app.get('/about', (req, res) => {
    const user = req.session && req.session.user
        ? req.session.user
        : { user_name: 'Guest' };
    res.render('about', {
      user
    });
});

app.get('/myprofile', (req, res) => {
    const user = req.session && req.session.user
        ? req.session.user
        : { name: 'Guest', email: '', role: '' };
    res.render('myprofile', {
      user
    });
});

// Main page route
app.get('/main', async (req, res) => {
  try {
    const currentDate = moment();
    const weekDate = req.query.week ? moment(req.query.week) : currentDate;
    const weekDays = generateWeekData(weekDate);
    const monthName = weekDate.format('MMMM YYYY');
    const timeSlots = [
        '2 PM',
        '3 PM', 
        '4 PM',
        '5 PM',
        '6 PM'
    ];
    const user = req.session && req.session.user
        ? req.session.user
        : { user_name: 'Guest' };

    // Load current slot signups
    const feedingSignups = await getSlotSignups('feeding');
    const nookSignups = await getSlotSignups('nook');

    // Compute trainer display based on Trainer users who reserved
    const allVolunteerIds = [
      ...new Set([
        ...feedingSignups.map(s => s.volunteer_id),
        ...nookSignups.map(s => s.volunteer_id)
      ])
    ].filter(Boolean);

    let idToUser = {};
    if (allVolunteerIds.length > 0) {
      try {
        const objectIds = allVolunteerIds
          .filter(id => typeof id === 'string' && id.length >= 12)
          .map(id => {
            try { return new mongoose.Types.ObjectId(id); } catch (_) { return null; }
          })
          .filter(Boolean);
        if (objectIds.length > 0) {
          const users = await User.find({ _id: { $in: objectIds } }).lean();
          users.forEach(u => { idToUser[String(u._id)] = u; });
        }
      } catch (e) {
        console.warn('Could not map signup volunteer_ids to users', e);
      }
    }

    const feedingTrainerByDay = {};
    const nookTrainerByDay = {};

    // Determine trainer by day: prefer explicit is_trainer flag, otherwise a user with Trainer role
    feedingSignups.forEach(s => {
      if (!s || !s.slot_day) return;
      const userForSignup = idToUser[s.volunteer_id];
      const isTrainerSignup = Boolean(s.is_trainer) || (userForSignup && userForSignup.user_role === 'Trainer');
      if (isTrainerSignup && !feedingTrainerByDay[s.slot_day]) {
        feedingTrainerByDay[s.slot_day] = userForSignup ? userForSignup.user_name : s.volunteer_name;
      }
    });
    nookSignups.forEach(s => {
      if (!s || !s.slot_day) return;
      const userForSignup = idToUser[s.volunteer_id];
      const isTrainerSignup = Boolean(s.is_trainer) || (userForSignup && userForSignup.user_role === 'Trainer');
      if (isTrainerSignup && !nookTrainerByDay[s.slot_day]) {
        nookTrainerByDay[s.slot_day] = userForSignup ? userForSignup.user_name : s.volunteer_name;
      }
    });

    // Handle slot reservation requests
    if (req.query.action && user && user.id) {
        const { action, type, day, date } = req.query;
        
        if (action === 'reserve' && type && day && date) {
            const slotType = type === 'feeding' ? 'feeding' : 'nook';
            const maxVolunteers = slotType === 'feeding' ? 5 : 3;
            
            // Check if already signed up
            const existingSignup = (slotType === 'feeding' ? feedingSignups : nookSignups)
                .find(signup => signup.volunteer_id === String(user.id) && signup.slot_date === date);
            
            if (existingSignup) {
                return res.redirect(`/main?week=${weekDate.format('YYYY-MM-DD')}&error=already_signed`);
            }
            
            // Check if slot is full
            const daySignups = (slotType === 'feeding' ? feedingSignups : nookSignups)
                .filter(signup => signup.slot_date === date);
            
            if (daySignups.length >= maxVolunteers) {
                return res.redirect(`/main?week=${weekDate.format('YYYY-MM-DD')}&error=slot_full`);
            }
            
            // Check if there's already a trainer for this slot
            const hasTrainer = daySignups.some(signup => signup.is_trainer);
            
            // Add new signup - first person becomes trainer
            const newSignup = {
                slot_id: 1,
                volunteer_id: String(user.id),
                volunteer_name: user.name,
                slot_date: date,
                slot_day: day,
                // Only mark as trainer when an authenticated Trainer reserves and there is no trainer yet
                is_trainer: user.role === 'Trainer' && !hasTrainer
            };
            
            if (await addSlotSignup(slotType, newSignup)) {
                const message = newSignup.is_trainer ? 'reserved_as_trainer' : 'reserved';
                return res.redirect(`/main?week=${weekDate.format('YYYY-MM-DD')}&success=${message}`);
            } else {
                return res.redirect(`/main?week=${weekDate.format('YYYY-MM-DD')}&error=server_error`);
            }
        }
        
        if (action === 'cancel' && type && day && date) {
            const slotType = type === 'feeding' ? 'feeding' : 'nook';
            
            if (await removeSlotSignup(slotType, String(user.id), date)) {
                return res.redirect(`/main?week=${weekDate.format('YYYY-MM-DD')}&success=cancelled`);
            } else {
                return res.redirect(`/main?week=${weekDate.format('YYYY-MM-DD')}&error=not_found`);
            }
        }
    }

    res.render('index', {
        weekDays,
        currentMonth: monthName,
        timeSlots,
        events: events,
        currentWeek: weekDate.format('YYYY-MM-DD'),
        user,
        feedingSignups: JSON.stringify(feedingSignups),
        nookSignups: JSON.stringify(nookSignups),
        feedingTrainers: JSON.stringify(feedingTrainerByDay),
        nookTrainers: JSON.stringify(nookTrainerByDay),
        message: req.query.success || req.query.error
    });
  } catch (err) {
    console.error('Main route error:', err);
    res.status(500).send('Server error');
  }
});

app.get('/events', (req, res) => {
    res.json(events);
});

app.post('/events', (req, res) => {
    const newEvent = {
        id: events.length + 1,
        title: req.body.title,
        date: req.body.date,
        startTime: req.body.time,
        endTime: req.body.endTime || moment(req.body.time, 'HH:mm').add(1, 'hour').format('HH:mm'),
        description: req.body.description || '',
        attendees: [],
        attendeeCount: 0,
        maxAttendees: 5
    };
    
    events.push(newEvent);
    res.json(newEvent);
});

app.put('/events/:id', (req, res) => {
    const eventId = parseInt(req.params.id);
    const eventIndex = events.findIndex(event => event.id === eventId);
    
    if (eventIndex !== -1) {
        events[eventIndex] = {
            ...events[eventIndex],
            title: req.body.title,
            date: req.body.date,
            startTime: req.body.time,
            endTime: req.body.endTime || moment(req.body.time, 'HH:mm').add(1, 'hour').format('HH:mm'),
            description: req.body.description || ''
        };
        res.json(events[eventIndex]);
    } else {
        res.status(404).json({ error: 'Event not found' });
    }
});

app.delete('/events/:id', (req, res) => {
    const eventId = parseInt(req.params.id);
    const eventIndex = events.findIndex(event => event.id === eventId);
    
    if (eventIndex !== -1) {
        events.splice(eventIndex, 1);
        res.json({ message: 'Event deleted' });
    } else {
        res.status(404).json({ error: 'Event not found' });
    }
});

// Admin: update adoption application status (Accept/Deny)
app.put('/adoption/applications/:id/status', async (req, res) => {
  try {
    const user = req.session && req.session.user ? req.session.user : null;
    if (!user || user.role !== 'Admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const { id } = req.params;
    const { status } = req.body || {};
    if (!['Accepted', 'Denied', 'Pending', 'Scheduled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const updated = await AdoptionApplication.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: 'Application not found' });
    }
    return res.json({ message: 'Status updated', application: updated });
  } catch (err) {
    console.error('Update application status error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create adoption application (Book Adoption Interview) - MongoDB
app.post('/adoption/applications', async (req, res) => {
  try {
    console.log("📩 Adoption application POST hit!");
    console.log("📦 Request body:", req.body);
    console.log("👤 Session user:", req.session.user);

    const user = req.session && req.session.user;
    if (!user) {
      console.warn("❌ Unauthorized request - no session");
      return res.status(401).json({ message: 'Unauthorized. Please sign in.' });
    }

    const { catName, catId } = req.body || {};
    if (!catName && !catId) {
      console.warn("⚠️ Missing cat information");
      return res.status(400).json({ message: 'Missing cat information.' });
    }

    const application = new AdoptionApplication({
      user_id: String(user.id),
      user_name: user.name,
      cat_id: catId ? String(catId) : null,
      cat_name: catName || null,
      status: 'Pending'
    });

    await application.save();
    console.log("✅ Application saved:", application);
    return res.status(201).json({ message: 'Application submitted.', application });
  } catch (err) {
    console.error('💥 Create application error:', err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
