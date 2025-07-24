const express = require('express');
const mongoose = require('mongoose');

const { engine } = require('express-handlebars');
const bodyParser = require('body-parser');
const moment = require('moment');
const path = require('path');


const app = express();

mongoose.connect('mongodb://localhost:27017/DLSU_PUSA_DB')

const PORT = process.env.PORT || 27017;

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

// In-memory storage for demo purposes
let events = [
    {
        id: 1,
        title: "Team Meeting",
        date: "2025-01-06",
        startTime: "14:00",
        endTime: "15:00",
        description: "Weekly team sync meeting",
        attendees: [
            { initial: "A", name: "Alice" },
            { initial: "B", name: "Bob" },
            { initial: "C", name: "Charlie" }
        ],
        attendeeCount: 3,
        maxAttendees: 5
    },
    {
        id: 2,
        title: "Project Review",
        date: "2025-01-08",
        startTime: "15:30",
        endTime: "17:00",
        description: "Quarterly project review",
        attendees: [
            { initial: "D", name: "David" },
            { initial: "E", name: "Emma" }
        ],
        attendeeCount: 2,
        maxAttendees: 4
    },
    {
        id: 3,
        title: "Client Call",
        date: "2025-01-10",
        startTime: "16:00",
        endTime: "17:30",
        description: "Call with new client",
        attendees: [
            { initial: "F", name: "Frank" },
            { initial: "G", name: "Grace" },
            { initial: "H", name: "Henry" },
            { initial: "I", name: "Ivy" }
        ],
        attendeeCount: 4,
        maxAttendees: 6
    }
];

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

// Routes
app.get('/', (req, res) => {
    res.render('welcome', {
        layout: 'main'
    });
});

app.get('/scheduler', (req, res) => {
    const currentDate = moment();
    const weekDate = req.query.week ? moment(req.query.week) : currentDate;
    
    const weekDays = generateWeekData(weekDate);
    const monthName = weekDate.format('MMMM YYYY');
    
    // Time slots for 2 PM to 6 PM
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

// Sample data for demo purposes
const sampleUser = {
    fullName: "John Doe",
    email: "johndoe@dlsu.edu.ph",
    idNumber: "12345678",
    role: "Volunteer"
};

const sampleCats = [
    {
        id: 1,
        name: "Nightowl",
        description: "A cuddly tabby with a heart of gold. Nightowl loves basking in sunlight and purring contentedly when he's being petted. Will you be bringing him to his new home?",
        image: null,
        status: "Available"
    },
    {
        id: 2,
        name: "Dweeby",
        description: "Sleepy and lovingly chubby, this orange tabby has big eyes that are sure to melt your heart. He is a quiet type but still has his playful moments!",
        image: null,
        status: "Available"
    },
    {
        id: 3,
        name: "Jackpot",
        description: "Friendly and outgoing, Jackpot is the perfect companion. This sweet cat loves children and would make a wonderful addition to any family seeking a pet to love and cherish.",
        image: null,
        status: "Available"
    }
];

// New page routes
app.get('/login', (req, res) => {
    res.render('login', {
        layout: 'main'
    });
});

app.get('/signup', (req, res) => {
    res.render('signup', {
        layout: 'main'
    });
});

app.get('/about', (req, res) => {
    res.render('about', {
        layout: 'main'
    });
});

app.get('/profile', (req, res) => {
    // Sample data for demo
    const userData = {
        ...sampleUser,
        feedingCount: 3,
        feedingProgress: 60,
        nookCount: 2,
        nookProgress: 40,
        upcomingDuties: [
            { date: "July 18, 2PM", type: "feeding" },
            { date: "July 18, 2PM", type: "nook" }
        ],
        upcomingShifts: [
            { date: "July 18, 2PM", type: "feeding" },
            { date: "July 18, 2PM", type: "nook" }
        ]
    };
    
    res.render('profile', {
        layout: 'main',
        user: userData
    });
});

app.get('/fur-adoption', (req, res) => {
    res.render('fur-adoption', {
        layout: 'main',
        cats: sampleCats
    });
});

// Authentication routes (placeholder)
app.post('/login', (req, res) => {
    // Handle login logic here
    res.json({ message: 'Login endpoint - to be implemented' });
});

app.post('/signup', (req, res) => {
    // Handle signup logic here
    res.json({ message: 'Signup endpoint - to be implemented' });
});

app.post('/adoption-interview', (req, res) => {
    // Handle adoption interview booking
    res.json({ message: 'Interview booked successfully - to be implemented' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
