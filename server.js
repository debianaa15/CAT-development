const express = require('express');
const { engine } = require('express-handlebars');
const bodyParser = require('body-parser');
const moment = require('moment');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

<<<<<<< Updated upstream
=======
// Global events array to avoid ReferenceError
global.events = [];

>>>>>>> Stashed changes
// Handlebars configuration
app.engine('handlebars', engine({
    defaultLayout: 'main',
    helpers: {
        eq: function(a, b) { return a === b; },
        add: function(a, b) { return a + b; },
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

// Helper function to generate week data
function generateWeekData(date) {
    const startOfWeek = moment(date).startOf('week');
    const weekDays = [];
    
    for (let i = 0; i < 7; i++) {
        const currentDay = startOfWeek.clone().add(i, 'day');
        const dayEvents = global.events.filter(event => 
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

// Redirect root URL to login page
app.get('/', (req, res) => {
<<<<<<< Updated upstream
=======
    res.redirect('/login');
});

// Fur Adoption route
app.get('/furadoption', (req, res) => {
  res.render('furadoption');
});

// Dashboard button route
app.get('/dashboard', (req, res) => {
  res.redirect('/index');
});

// Profile Settings route
app.get('/profile-settings', (req, res) => {
  res.redirect('/profile');
});

// About PUSA route
app.get('/about-pusa', (req, res) => {
  res.redirect('/about');
});

// Sign Out route
app.get('/signout', (req, res) => {
  // If you add session logic, clear it here
  res.redirect('/login');
});


// Route for sign-in page
app.get('/login', (req, res) => {
    res.render('login');
});

// Route for signup page
app.get('/signup', (req, res) => {
    res.render('signup');
});

// Handle sign-in form submission
app.post('/loginForm', (req, res) => {
    // Add authentication logic here 
    res.redirect('/index');
});

// Route for about page
app.get('/about', (req, res) => {
    res.render('about');
});

app.get('/myprofile', (req, res) => {
    res.render('myprofile');
});

app.get('/profile', (req, res) => {
    res.render('profile'); // Render the profile page, not the layout
});

// Main page route
app.get('/index', (req, res) => {
>>>>>>> Stashed changes
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
        events: global.events,
        currentWeek: weekDate.format('YYYY-MM-DD')
    });
});

// Handle POST /signin for login form
app.post('/signin', (req, res) => {
    // Add authentication logic here if needed
    // Render the main index page after successful sign in
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
        events: global.events,
        currentWeek: weekDate.format('YYYY-MM-DD')
    });
});

app.get('/events', (req, res) => {
    res.json(global.events);
});

app.post('/events', (req, res) => {
    const newEvent = {
        id: global.events.length + 1,
        title: req.body.title,
        date: req.body.date,
        startTime: req.body.time,
        endTime: req.body.endTime || moment(req.body.time, 'HH:mm').add(1, 'hour').format('HH:mm'),
        description: req.body.description || '',
        attendees: [],
        attendeeCount: 0,
        maxAttendees: 5
    };
    
    global.events.push(newEvent);
    res.json(newEvent);
});

app.put('/events/:id', (req, res) => {
    const eventId = parseInt(req.params.id);
    const eventIndex = global.events.findIndex(event => event.id === eventId);
    
    if (eventIndex !== -1) {
        global.events[eventIndex] = {
            ...global.events[eventIndex],
            title: req.body.title,
            date: req.body.date,
            startTime: req.body.time,
            endTime: req.body.endTime || moment(req.body.time, 'HH:mm').add(1, 'hour').format('HH:mm'),
            description: req.body.description || ''
        };
        res.json(global.events[eventIndex]);
    } else {
        res.status(404).json({ error: 'Event not found' });
    }
});

app.delete('/events/:id', (req, res) => {
    const eventId = parseInt(req.params.id);
    const eventIndex = global.events.findIndex(event => event.id === eventId);
    
    if (eventIndex !== -1) {
        global.events.splice(eventIndex, 1);
        res.json({ message: 'Event deleted' });
    } else {
        res.status(404).json({ error: 'Event not found' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});