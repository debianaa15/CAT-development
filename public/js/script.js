// Enhanced dropdown menu logic with better responsiveness
document.addEventListener('DOMContentLoaded', function() {
  const menuBtn = document.getElementById('menuBtn');
  const menuDropdown = document.getElementById('menuDropdown');

  if (menuBtn && menuDropdown) {
    // Toggle dropdown
    menuBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      const isVisible = menuDropdown.style.display === 'block';
      menuDropdown.style.display = isVisible ? 'none' : 'block';
      
      // Add accessibility attributes
      menuBtn.setAttribute('aria-expanded', !isVisible);
      menuDropdown.setAttribute('aria-hidden', isVisible);
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
      if (!menuDropdown.contains(e.target) && e.target !== menuBtn) {
        menuDropdown.style.display = 'none';
        menuBtn.setAttribute('aria-expanded', 'false');
        menuDropdown.setAttribute('aria-hidden', 'true');
      }
    });

    // Close dropdown on escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && menuDropdown.style.display === 'block') {
        menuDropdown.style.display = 'none';
        menuBtn.setAttribute('aria-expanded', 'false');
        menuDropdown.setAttribute('aria-hidden', 'true');
        menuBtn.focus();
      }
    });

    // Initialize accessibility attributes
    menuBtn.setAttribute('aria-expanded', 'false');
    menuDropdown.setAttribute('aria-hidden', 'true');
  }

  // Dashboard button navigation
  const dashboardBtn = document.getElementById('dashboardBtn');
  if (dashboardBtn) {
    dashboardBtn.addEventListener('click', function() {
      window.location.href = '/main';
    });
  }

  // Fur Adoption button(s) click event
  const furAdoptionBtns = document.querySelectorAll('#furAdoptionBtn');
  furAdoptionBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      window.location.href = '/furadoption';
    });
  });
});
// Sign out logic
document.addEventListener('DOMContentLoaded', function() {
  const signOut = document.getElementById('signOut');
  if (signOut) {
    signOut.addEventListener('click', function() {
      window.location.href = '/';
    });
  }
});

// Modern Scheduler JavaScript
class ModernScheduler {
    constructor() {
        this.currentEventId = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.initializeCalendar();
        this.addCurrentTimeLine();
        this.handleResize();
        this.addTouchSupport();
        this.addSwipeSupport();
        setInterval(() => {
            this.addCurrentTimeLine();
        }, 60000);
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    bindEvents() {
        const modal = document.getElementById('eventModal');
        const closeModal = document.getElementById('closeModal');
        const cancelBtn = document.getElementById('cancelBtn');
        const eventForm = document.getElementById('eventForm');
        const todayBtn = document.getElementById('todayBtn');
        const prevWeek = document.getElementById('prevWeek');
        const nextWeek = document.getElementById('nextWeek');
        const homeBtn = document.getElementById('homeBtn');
        const furAdoptionBtn = document.getElementById('furAdoptionBtn');
        const skillsAssessmentBtn = document.getElementById('skillsAssessmentBtn');
        const dashboardIcon = document.getElementById('dashboardIcon');
        const menuIcon = document.getElementById('menuIcon');

        if (homeBtn) {
            homeBtn.addEventListener('click', () => {
                this.openModal();
            });
        }
        if (furAdoptionBtn) {
            furAdoptionBtn.addEventListener('click', () => {
                this.openModal();
            });
        }
        if (skillsAssessmentBtn) {
            skillsAssessmentBtn.addEventListener('click', () => {
                this.openModal();
            });
        }
        if (dashboardIcon) {
            dashboardIcon.addEventListener('click', () => {
                this.showDashboard();
            });
        }
        if (menuIcon) {
            menuIcon.addEventListener('click', () => {
                this.toggleMenu();
            });
        }
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                this.closeModal();
            });
        }
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.closeModal();
            });
        }
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }
        if (eventForm) {
            eventForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveEvent();
            });
        }
        if (todayBtn) {
            todayBtn.addEventListener('click', () => {
                this.goToToday();
            });
        }
        if (prevWeek) {
            prevWeek.addEventListener('click', () => {
                this.navigateWeek(-1);
            });
        }
        if (nextWeek) {
            nextWeek.addEventListener('click', () => {
                this.navigateWeek(1);
            });
        }
        document.addEventListener('click', (e) => {
            const eventCard = e.target.closest('.event-card');
            if (eventCard && eventCard.dataset.id) {
                this.editEvent(parseInt(eventCard.dataset.id));
            }
        });
        document.addEventListener('click', (e) => {
            const timeCell = e.target.closest('.time-cell');
            if (timeCell) {
                const dayColumn = timeCell.closest('.day-column');
                if (dayColumn) {
                    const date = dayColumn.dataset.date;
                    const time = timeCell.dataset.time;
                    this.openModal(date, time);
                }
            }
        });
    }

    initializeCalendar() {
        const eventTimeInput = document.getElementById('eventTime');
        if (eventTimeInput && !eventTimeInput.value) {
            eventTimeInput.value = '14:00';
        }
    }

    openModal(date = null, time = null) {
        const modal = document.getElementById('eventModal');
        const modalTitle = document.getElementById('modalTitle');
        const eventForm = document.getElementById('eventForm');
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
            modal.style.padding = '10px';
            const modalContent = modal.querySelector('.modal-content');
            modalContent.style.maxHeight = '90vh';
            modalContent.style.overflowY = 'auto';
        }
        if (this.currentEventId) {
            modalTitle.textContent = 'Edit Event';
        } else {
            modalTitle.textContent = 'Add New Event';
        }
        if (date) {
            document.getElementById('eventDate').value = date;
        }
        if (time) {
            const timeMap = {
                '2 PM': '14:00',
                '3 PM': '15:00',
                '4 PM': '16:00',
                '5 PM': '17:00',
                '6 PM': '18:00'
            };
            document.getElementById('eventTime').value = timeMap[time] || '14:00';
        }
        modal.classList.add('active');
        document.getElementById('eventTitle').focus();
    }

    closeModal() {
        const modal = document.getElementById('eventModal');
        const eventForm = document.getElementById('eventForm');
        modal.classList.remove('active');
        eventForm.reset();
        this.currentEventId = null;
    }

    async saveEvent() {
        const form = document.getElementById('eventForm');
        const formData = new FormData(form);
        const eventData = {
            title: formData.get('title'),
            date: formData.get('date'),
            time: formData.get('time'),
            description: formData.get('description')
        };
        try {
            let response;
            if (this.currentEventId) {
                response = await fetch(`/events/${this.currentEventId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(eventData)
                });
            } else {
                response = await fetch('/events', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(eventData)
                });
            }
            if (response.ok) {
                this.closeModal();
                location.reload();
            } else {
                alert('Error saving event');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error saving event');
        }
    }

    async editEvent(eventId) {
        try {
            const response = await fetch('/events');
            const events = await response.json();
            const event = events.find(e => e.id === eventId);
            if (event) {
                this.currentEventId = eventId;
                document.getElementById('eventTitle').value = event.title;
                document.getElementById('eventDate').value = event.date;
                document.getElementById('eventTime').value = event.startTime || event.time;
                document.getElementById('eventDescription').value = event.description || '';
                this.openModal();
            }
        } catch (error) {
            console.error('Error loading event:', error);
        }
    }

    async deleteEvent(eventId) {
        if (confirm('Are you sure you want to delete this event?')) {
            try {
                const response = await fetch(`/events/${eventId}`, {
                    method: 'DELETE'
                });
                if (response.ok) {
                    location.reload();
                } else {
                    alert('Error deleting event');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error deleting event');
            }
        }
    }

    addCurrentTimeLine() {
        const existingLine = document.querySelector('.current-time-line');
        if (existingLine) {
            existingLine.remove();
        }
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        if (hours >= 14 && hours <= 18) {
            const totalMinutes = (hours - 14) * 60 + minutes;
            const position = (totalMinutes / 60) * 80;
            const timeLine = document.createElement('div');
            timeLine.className = 'current-time-line';
            timeLine.style.cssText = `
                position: absolute;
                top: ${position}px;
                left: 0;
                right: 0;
                height: 2px;
                background: #FF5722;
                z-index: 100;
                pointer-events: none;
            `;
            const weekGrid = document.querySelector('.week-grid');
            if (weekGrid) {
                weekGrid.appendChild(timeLine);
            }
        }
    }

    goToToday() {
        const today = new Date();
        const currentWeek = this.getWeekStart(today);
        const weekParam = currentWeek.toISOString().split('T')[0];
        window.location.href = `/main?week=${weekParam}`;
    }

    navigateWeek(direction) {
        const currentWeekParam = new URLSearchParams(window.location.search).get('week');
        const currentWeek = currentWeekParam ? new Date(currentWeekParam) : new Date();
        const newWeek = new Date(currentWeek);
        newWeek.setDate(currentWeek.getDate() + (direction * 7));
        const weekParam = newWeek.toISOString().split('T')[0];
        window.location.href = `/main?week=${weekParam}`;
    }

    getWeekStart(date) {
        const result = new Date(date);
        const day = result.getDay();
        const diff = result.getDate() - day;
        result.setDate(diff);
        return result;
    }

    toggleMenu() {
        alert('Menu functionality can be implemented here!');
    }

    showDashboard() {
        alert('Dashboard functionality can be implemented here!');
    }

    handleResize() {
        const isMobile = window.innerWidth <= 768;
        const isTablet = window.innerWidth <= 992 && window.innerWidth > 768;
        if (isMobile) {
            this.adjustMobileLayout();
        } else if (isTablet) {
            this.adjustTabletLayout();
        } else {
            this.adjustDesktopLayout();
        }
    }

    adjustMobileLayout() {
        const weekCalendar = document.querySelector('.week-calendar');
        const timeGrid = document.querySelector('.time-grid');
        if (weekCalendar) {
            weekCalendar.style.overflowX = 'auto';
            weekCalendar.style.overflowY = 'hidden';
        }
        if (timeGrid) {
            timeGrid.style.minWidth = '700px';
        }
        const eventCards = document.querySelectorAll('.event-card');
        eventCards.forEach(card => {
            card.style.minWidth = '100px';
        });
    }

    adjustTabletLayout() {
        const weekCalendar = document.querySelector('.week-calendar');
        const timeGrid = document.querySelector('.time-grid');
        if (weekCalendar) {
            weekCalendar.style.overflowX = 'auto';
            weekCalendar.style.overflowY = 'hidden';
        }
        if (timeGrid) {
            timeGrid.style.minWidth = '800px';
        }
    }

    adjustDesktopLayout() {
        const weekCalendar = document.querySelector('.week-calendar');
        const timeGrid = document.querySelector('.time-grid');
        if (weekCalendar) {
            weekCalendar.style.overflowX = 'visible';
            weekCalendar.style.overflowY = 'visible';
        }
        if (timeGrid) {
            timeGrid.style.minWidth = 'auto';
        }
    }

    addTouchSupport() {
        const eventCards = document.querySelectorAll('.event-card');
        const buttons = document.querySelectorAll('.btn, .nav-btn, .icon-circle');
        eventCards.forEach(card => {
            card.addEventListener('touchstart', (e) => {
                card.style.transform = 'scale(0.98)';
            });
            card.addEventListener('touchend', (e) => {
                card.style.transform = 'scale(1)';
            });
        });
        buttons.forEach(button => {
            button.addEventListener('touchstart', (e) => {
                button.style.transform = 'scale(0.95)';
            });
            button.addEventListener('touchend', (e) => {
                button.style.transform = 'scale(1)';
            });
        });
        buttons.forEach(button => {
            button.addEventListener('touchend', (e) => {
                e.preventDefault();
            });
        });
    }

    addSwipeSupport() {
        const weekCalendar = document.querySelector('.week-calendar');
        if (!weekCalendar) return;
        let startX = 0;
        let startY = 0;
        let isScrolling = false;
        weekCalendar.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            isScrolling = false;
        });
        weekCalendar.addEventListener('touchmove', (e) => {
            if (!startX || !startY) return;
            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;
            const diffX = Math.abs(currentX - startX);
            const diffY = Math.abs(currentY - startY);
            if (diffY > diffX) {
                isScrolling = true;
            }
        });
        weekCalendar.addEventListener('touchend', (e) => {
            if (!startX || !startY || isScrolling) return;
            const endX = e.changedTouches[0].clientX;
            const diffX = startX - endX;
            if (Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    this.navigateWeek(1);
                } else {
                    this.navigateWeek(-1);
                }
            }
            startX = 0;
            startY = 0;
            isScrolling = false;
        });
    }
}

// Instantiate ModernScheduler when DOM is ready (after class definition)
document.addEventListener('DOMContentLoaded', function() {
  new ModernScheduler();
});