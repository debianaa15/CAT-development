# Modern Scheduler

A beautiful, modern scheduler application with calendar UI built using Node.js, Express, Handlebars, and CSS.

## Features

- **Modern UI Design**: Clean, responsive interface with modern design principles
- **Calendar View**: Monthly calendar with intuitive navigation
- **Event Management**: Create, edit, and delete events with ease
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Interactive Elements**: Hover effects, smooth animations, and transitions
- **Keyboard Shortcuts**: Quick access with keyboard shortcuts (Ctrl/Cmd + N for new event, Escape to close modals)
- **Real-time Updates**: Automatic page refresh after event operations

## Technologies Used

- **Backend**: Node.js with Express.js
- **Template Engine**: Handlebars.js
- **Styling**: Modern CSS with CSS Grid and Flexbox
- **Icons**: Font Awesome 6
- **Typography**: Inter font family
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

3. Use the scheduler:
   - Click "Add Event" to create new events
   - Click on calendar days to add events for specific dates
   - Click on existing events to edit them
   - Use the edit/delete buttons in the events sidebar
   - Navigate between months using the arrow buttons
   - Click "Today" to jump to the current month

## Features Overview

### Calendar Interface
- Monthly view with clear day separation
- Today's date is highlighted
- Events are displayed as colored blocks on calendar days
- Smooth hover effects and transitions

### Event Management
- Create events with title, date, time, and description
- Edit existing events by clicking on them
- Delete events with confirmation
- Events are displayed in a sidebar with full details

### Responsive Design
- Mobile-first approach
- Adapts to different screen sizes
- Touch-friendly interface on mobile devices

### Modern UI Elements
- Clean, professional design
- Subtle shadows and animations
- Consistent color scheme
- Accessible design patterns

## API Endpoints

- `GET /` - Main calendar view
- `GET /events` - Get all events (JSON)
- `POST /events` - Create new event
- `PUT /events/:id` - Update event
- `DELETE /events/:id` - Delete event

## Customization

The application is highly customizable:

- **Colors**: Edit CSS variables in `public/css/style.css`
- **Fonts**: Change font families in the CSS
- **Layout**: Modify grid layouts for different arrangements
- **Features**: Add new functionality by extending the JavaScript classes

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

## Development

The project structure:
```
├── server.js              # Main server file
├── package.json           # Dependencies
├── views/
│   ├── layouts/
│   │   └── main.handlebars # Main layout template
│   └── index.handlebars    # Calendar view template
└── public/
    ├── css/
    │   └── style.css       # Main stylesheet
    └── js/
        └── script.js       # Client-side JavaScript
```

## Contributing

Feel free to contribute to this project by:
- Reporting bugs
- Suggesting new features
- Improving the UI/UX
- Adding new functionality

## License

MIT License
