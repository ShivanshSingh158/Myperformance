// Weekly Planner Application
class WeeklyPlanner {
    constructor(data) {
        this.data = data;
        this.currentDay = 0; // Monday = 0, Sunday = 6
        this.dayNames = data.days;
        this.timeSlots = data.timeSlots;
        this.taskData = new Map(); // Store task data for each day and time slot
        this.completionStatus = new Map(); // Store completion status
        
        this.init();
    }

    init() {
        this.renderSlides();
        this.attachEventListeners();
        this.showDay(0);
        this.updateProgress();
    }

    generateTaskKey(dayIndex, slotIndex) {
        return `day-${dayIndex}-slot-${slotIndex}`;
    }

    renderSlides() {
        const slidesContainer = document.getElementById('slides-container');
        slidesContainer.innerHTML = '';

        this.dayNames.forEach((dayName, dayIndex) => {
            const slide = this.createDaySlide(dayName, dayIndex);
            slidesContainer.appendChild(slide);
        });
    }

    createDaySlide(dayName, dayIndex) {
        const slide = document.createElement('div');
        slide.className = 'day-slide';
        slide.setAttribute('data-day', dayIndex);

        const timeSlotsContainer = document.createElement('div');
        timeSlotsContainer.className = 'time-slots';

        this.timeSlots.forEach((slot, slotIndex) => {
            const timeSlot = this.createTimeSlot(slot, dayIndex, slotIndex);
            timeSlotsContainer.appendChild(timeSlot);
        });

        slide.appendChild(timeSlotsContainer);
        return slide;
    }

    createTimeSlot(slot, dayIndex, slotIndex) {
        const timeSlotDiv = document.createElement('div');
        timeSlotDiv.className = `time-slot ${slot.period}`;
        timeSlotDiv.setAttribute('data-day', dayIndex);
        timeSlotDiv.setAttribute('data-slot', slotIndex);

        const timeInfo = document.createElement('div');
        timeInfo.className = 'time-info';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'time-checkbox';
        checkbox.id = `checkbox-${dayIndex}-${slotIndex}`;
        checkbox.setAttribute('data-day', dayIndex);
        checkbox.setAttribute('data-slot', slotIndex);

        const timeLabel = document.createElement('label');
        timeLabel.className = 'time-label';
        timeLabel.textContent = slot.time;
        timeLabel.setAttribute('for', checkbox.id);

        const taskInput = document.createElement('input');
        taskInput.type = 'text';
        taskInput.className = 'task-input';
        taskInput.placeholder = 'Add your task...';
        taskInput.setAttribute('data-day', dayIndex);
        taskInput.setAttribute('data-slot', slotIndex);

        timeInfo.appendChild(checkbox);
        timeInfo.appendChild(timeLabel);
        timeSlotDiv.appendChild(timeInfo);
        timeSlotDiv.appendChild(taskInput);

        return timeSlotDiv;
    }

    attachEventListeners() {
        // Navigation buttons
        document.getElementById('prev-day').addEventListener('click', (e) => {
            e.preventDefault();
            this.previousDay();
        });

        document.getElementById('next-day').addEventListener('click', (e) => {
            e.preventDefault();
            this.nextDay();
        });

        // Day tabs
        const dayTabs = document.querySelectorAll('.day-tab');
        dayTabs.forEach((tab, index) => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                this.showDay(index);
            });
        });

        // Week input editing
        const weekInput = document.getElementById('week-input');
        weekInput.addEventListener('click', () => {
            weekInput.select();
        });

        // Clear day button
        document.getElementById('clear-day-btn').addEventListener('click', (e) => {
            e.preventDefault();
            this.clearCurrentDay();
        });

        // Use event delegation for dynamically created elements
        document.addEventListener('change', (e) => {
            if (e.target && e.target.classList.contains('time-checkbox')) {
                this.handleCheckboxChange(e.target);
            }
        });

        // Task input changes with event delegation
        document.addEventListener('input', (e) => {
            if (e.target && e.target.classList.contains('task-input')) {
                this.handleTaskInput(e.target);
            }
        });

        // Also handle blur events to save task data
        document.addEventListener('blur', (e) => {
            if (e.target && e.target.classList.contains('task-input')) {
                this.handleTaskInput(e.target);
            }
        }, true);

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            // Only handle arrow keys when not focused on an input
            if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    this.previousDay();
                } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    this.nextDay();
                }
            }
        });

        // Enter key to move to next task input
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.classList.contains('task-input')) {
                const currentDay = parseInt(e.target.getAttribute('data-day'));
                const currentSlot = parseInt(e.target.getAttribute('data-slot'));
                
                if (currentSlot < this.timeSlots.length - 1) {
                    const nextInput = document.querySelector(`input[data-day="${currentDay}"][data-slot="${currentSlot + 1}"].task-input`);
                    if (nextInput) {
                        nextInput.focus();
                    }
                }
            }
        });
    }

    showDay(dayIndex) {
        // Validate dayIndex
        if (dayIndex < 0 || dayIndex >= this.dayNames.length) {
            return;
        }

        // Save current state before switching
        this.saveCurrentState();

        // Update current day
        this.currentDay = dayIndex;

        // Hide all slides
        const slides = document.querySelectorAll('.day-slide');
        slides.forEach(slide => {
            slide.classList.remove('active');
        });

        // Show current slide
        const currentSlide = document.querySelector(`.day-slide[data-day="${dayIndex}"]`);
        if (currentSlide) {
            currentSlide.classList.add('active');
        }

        // Update day tabs
        const dayTabs = document.querySelectorAll('.day-tab');
        dayTabs.forEach((tab, index) => {
            if (index === dayIndex) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        // Update current day name
        const currentDayElement = document.querySelector('.current-day');
        if (currentDayElement) {
            currentDayElement.textContent = this.dayNames[dayIndex];
        }

        // Restore state for new day
        this.restoreCurrentDayState();

        // Update progress for current day
        this.updateProgress();
    }

    previousDay() {
        const newDay = this.currentDay === 0 ? 6 : this.currentDay - 1;
        this.showDay(newDay);
    }

    nextDay() {
        const newDay = this.currentDay === 6 ? 0 : this.currentDay + 1;
        this.showDay(newDay);
    }

    handleCheckboxChange(checkbox) {
        const dayIndex = parseInt(checkbox.getAttribute('data-day'));
        const slotIndex = parseInt(checkbox.getAttribute('data-slot'));
        const key = this.generateTaskKey(dayIndex, slotIndex);
        
        // Update completion status
        this.completionStatus.set(key, checkbox.checked);

        // Update visual state of the time slot
        const timeSlot = checkbox.closest('.time-slot');
        const taskInput = timeSlot.querySelector('.task-input');
        
        if (checkbox.checked) {
            timeSlot.classList.add('completed');
            if (taskInput) {
                taskInput.classList.add('completed');
            }
        } else {
            timeSlot.classList.remove('completed');
            if (taskInput) {
                taskInput.classList.remove('completed');
            }
        }

        // Update progress
        this.updateProgress();
    }

    handleTaskInput(input) {
        const dayIndex = parseInt(input.getAttribute('data-day'));
        const slotIndex = parseInt(input.getAttribute('data-slot'));
        const key = this.generateTaskKey(dayIndex, slotIndex);
        
        // Store task data
        this.taskData.set(key, input.value);
    }

    saveCurrentState() {
        // Save all input values and checkbox states for current day
        const currentSlide = document.querySelector(`.day-slide[data-day="${this.currentDay}"]`);
        if (!currentSlide) return;

        const checkboxes = currentSlide.querySelectorAll('.time-checkbox');
        const inputs = currentSlide.querySelectorAll('.task-input');

        checkboxes.forEach(checkbox => {
            const dayIndex = parseInt(checkbox.getAttribute('data-day'));
            const slotIndex = parseInt(checkbox.getAttribute('data-slot'));
            const key = this.generateTaskKey(dayIndex, slotIndex);
            this.completionStatus.set(key, checkbox.checked);
        });

        inputs.forEach(input => {
            const dayIndex = parseInt(input.getAttribute('data-day'));
            const slotIndex = parseInt(input.getAttribute('data-slot'));
            const key = this.generateTaskKey(dayIndex, slotIndex);
            this.taskData.set(key, input.value);
        });
    }

    restoreCurrentDayState() {
        // Restore input values and checkbox states for current day
        const currentSlide = document.querySelector(`.day-slide[data-day="${this.currentDay}"]`);
        if (!currentSlide) return;

        const checkboxes = currentSlide.querySelectorAll('.time-checkbox');
        const inputs = currentSlide.querySelectorAll('.task-input');

        checkboxes.forEach(checkbox => {
            const dayIndex = parseInt(checkbox.getAttribute('data-day'));
            const slotIndex = parseInt(checkbox.getAttribute('data-slot'));
            const key = this.generateTaskKey(dayIndex, slotIndex);
            const isChecked = this.completionStatus.get(key) || false;
            
            checkbox.checked = isChecked;
            
            const timeSlot = checkbox.closest('.time-slot');
            const taskInput = timeSlot.querySelector('.task-input');
            
            if (isChecked) {
                timeSlot.classList.add('completed');
                if (taskInput) {
                    taskInput.classList.add('completed');
                }
            } else {
                timeSlot.classList.remove('completed');
                if (taskInput) {
                    taskInput.classList.remove('completed');
                }
            }
        });

        inputs.forEach(input => {
            const dayIndex = parseInt(input.getAttribute('data-day'));
            const slotIndex = parseInt(input.getAttribute('data-slot'));
            const key = this.generateTaskKey(dayIndex, slotIndex);
            const taskText = this.taskData.get(key) || '';
            input.value = taskText;
        });
    }

    updateProgress() {
        const totalSlots = this.timeSlots.length;
        let completedSlots = 0;

        // Count completed tasks for current day
        for (let slotIndex = 0; slotIndex < totalSlots; slotIndex++) {
            const key = this.generateTaskKey(this.currentDay, slotIndex);
            if (this.completionStatus.get(key)) {
                completedSlots++;
            }
        }

        // Update progress bar
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        
        if (progressFill && progressText) {
            const percentage = totalSlots > 0 ? (completedSlots / totalSlots) * 100 : 0;
            progressFill.style.width = `${percentage}%`;
            progressText.textContent = `${completedSlots}/${totalSlots}`;
        }
    }

    clearCurrentDay() {
        // Clear all checkboxes and task inputs for current day
        for (let slotIndex = 0; slotIndex < this.timeSlots.length; slotIndex++) {
            const key = this.generateTaskKey(this.currentDay, slotIndex);
            
            // Clear from data stores
            this.completionStatus.delete(key);
            this.taskData.delete(key);
        }
        
        // Update UI for current day
        this.restoreCurrentDayState();
        this.updateProgress();
    }

    // Method to get all data (for potential export/save functionality)
    getAllData() {
        this.saveCurrentState();
        return {
            tasks: Object.fromEntries(this.taskData),
            completions: Object.fromEntries(this.completionStatus),
            currentDay: this.currentDay
        };
    }

    // Method to load data (for potential import functionality)
    loadData(data) {
        if (data.tasks) {
            this.taskData = new Map(Object.entries(data.tasks));
        }
        if (data.completions) {
            this.completionStatus = new Map(Object.entries(data.completions));
        }
        if (typeof data.currentDay === 'number') {
            this.currentDay = data.currentDay;
        }

        // Restore UI state
        this.showDay(this.currentDay);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Use the provided time slots data
    const plannerData = {
        "timeSlots": [
            {"time":"5:00-5:30 AM","period":"morning"},
            {"time":"5:30-6:00 AM","period":"morning"},
            {"time":"6:00-6:30 AM","period":"morning"},
            {"time":"6:30-7:00 AM","period":"morning"},
            {"time":"7:00-7:30 AM","period":"morning"},
            {"time":"7:30-8:00 AM","period":"morning"},
            {"time":"8:00-8:30 AM","period":"morning"},
            {"time":"8:30-9:00 AM","period":"morning"},
            {"time":"9:00-9:30 AM","period":"morning"},
            {"time":"9:30-10:00 AM","period":"morning"},
            {"time":"10:00-10:30 AM","period":"morning"},
            {"time":"10:30-11:00 AM","period":"morning"},
            {"time":"11:00-11:30 AM","period":"morning"},
            {"time":"11:30-12:00 PM","period":"morning"},
            {"time":"12:00-12:30 PM","period":"afternoon"},
            {"time":"12:30-1:00 PM","period":"afternoon"},
            {"time":"1:00-1:30 PM","period":"afternoon"},
            {"time":"1:30-2:00 PM","period":"afternoon"},
            {"time":"2:00-2:30 PM","period":"afternoon"},
            {"time":"2:30-3:00 PM","period":"afternoon"},
            {"time":"3:00-3:30 PM","period":"afternoon"},
            {"time":"3:30-4:00 PM","period":"afternoon"},
            {"time":"4:00-4:30 PM","period":"afternoon"},
            {"time":"4:30-5:00 PM","period":"afternoon"},
            {"time":"5:00-5:30 PM","period":"afternoon"},
            {"time":"5:30-6:00 PM","period":"afternoon"},
            {"time":"6:00-6:30 PM","period":"evening"},
            {"time":"6:30-7:00 PM","period":"evening"},
            {"time":"7:00-7:30 PM","period":"evening"},
            {"time":"7:30-8:00 PM","period":"evening"},
            {"time":"8:00-8:30 PM","period":"evening"},
            {"time":"8:30-9:00 PM","period":"evening"},
            {"time":"9:00-9:30 PM","period":"evening"},
            {"time":"9:30-10:00 PM","period":"evening"},
            {"time":"10:00-10:30 PM","period":"evening"}
        ],
        "days": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]
    };

    // Initialize the weekly planner
    new WeeklyPlanner(plannerData);
});