const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/DLSU_PUSA_DB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));


const express = require('express');
const { engine } = require('express-handlebars');
const bodyParser = require('body-parser');
const moment = require('moment');
const path = require('path');


const app = express();
const PORT = process.env.PORT || 3000;

// Middleware: body-parser must be before any routes
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// Import User model for MongoDB authentication
const User = require('./models/user');


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
    
    // Success: return user_role for differentiation
    if (user.user_role === 'Trainer') {
      return res.json({ role: user.user_role, redirect: '/trainer' });
    } else {
      return res.json({ role: user.user_role });
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
  res.render('trainer', {
    weekDays,
    currentMonth: monthName,
    timeSlots,
    events: events,
    currentWeek: weekDate.format('YYYY-MM-DD')
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
  res.render('furadaption');
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
    res.render('about');
});

app.get('/myprofile', (req, res) => {
    res.render('myprofile');
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
    res.render('index', {
        weekDays,
        currentMonth: monthName,
        timeSlots,
        events: events,
        currentWeek: weekDate.format('YYYY-MM-DD')
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

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
