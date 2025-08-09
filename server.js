const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');



// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/DLSU_PUSA_DB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));



const { engine } = require('express-handlebars');
const bodyParser = require('body-parser');
const moment = require('moment');
const path = require('path');

const app = express();
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
app.get('/admin/trainer-users', (req, res) => {
  res.render('admintraineruserlist');
});

// Admin Volunteer User List route
app.get('/admin/volunteer-users', (req, res) => {
  res.render('adminvolunteeruserlist'); // Create this file next!
});

// Admin Cats List route
app.get('/admin/cats', (req, res) => {
  res.render('admincatslist'); // Create this file next!
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
app.get('/main', (req, res) => {
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
    res.render('index', {
        weekDays,
        currentMonth: monthName,
        timeSlots,
        events: events,
        currentWeek: weekDate.format('YYYY-MM-DD'),
        user
    });
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
