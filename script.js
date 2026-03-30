const navLinks = document.querySelector('.nav-links');
const toggle = document.querySelector('.menu-toggle');
toggle?.addEventListener('click', () => {
  navLinks.classList.toggle('active');
});

// smooth scroll for internal links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId && targetId !== '#') {
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        navLinks.classList.remove('active');
      }
    }
  });
});

// Quick booking call-to-action
const bookBtns = document.querySelectorAll('.book-cta');
bookBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    const phone = '+14037270480';
    window.location.href = `tel:${phone}`;
  });
});

// Real booking form (client side, stored locally)
function initBooking() {
  const form = document.getElementById('bookingForm');
  if (!form) return;

  const bookingsPayload = localStorage.getItem('yydsBookings');
  let bookings = bookingsPayload ? JSON.parse(bookingsPayload) : [];

  const bookingMessage = document.getElementById('bookingMessage');
  const slotListEl = document.getElementById('slotList');
  const bookingsList = document.getElementById('bookingsList');
  const dateInput = document.getElementById('dateInput');

  const fullSlots = ['10:00', '11:30', '13:00', '14:30', '16:00', '18:00', '20:00'];

  function getNextDate() {
    const dt = new Date();
    dt.setDate(dt.getDate() + 1);
    return dt.toISOString().split('T')[0];
  }

  function saveBookings() {
    localStorage.setItem('yydsBookings', JSON.stringify(bookings));
  }

  function formatDate(iso) {
    return new Date(iso + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  }

  function renderAvailableSlots() {
    const selectedDate = dateInput.value;
    const occupied = new Set(bookings.filter(b => b.date === selectedDate).map(b => b.time));
    const rows = fullSlots.map(slot => {
      const taken = occupied.has(slot);
      return `<li style="color:${taken ? '#c45555' : '#3d6f48'}; font-weight:${taken ? '600' : '500'};">${slot} - ${taken ? 'Booked' : 'Open'}</li>`;
    }).join('');

    slotListEl.innerHTML = selectedDate ? rows : '<li>Select a date to view slots</li>';
  }

  function renderBookings() {
    if (!bookings.length) {
      bookingsList.innerHTML = '<li>No booked appointments yet.</li>';
      return;
    }

    const sorted = bookings.slice().sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    bookingsList.innerHTML = sorted.map((b) => `<li><strong>${formatDate(b.date)} ${b.time}</strong> | ${b.service} | ${b.name}</li>`).join('');
  }

  function showMessage(message, type = 'success') {
    if (!bookingMessage) return;
    bookingMessage.textContent = message;
    bookingMessage.style.color = type === 'success' ? '#2a6a44' : '#a12a2a';
    setTimeout(() => { bookingMessage.textContent = ''; }, 5000);
  }

  dateInput.min = getNextDate();
  dateInput.addEventListener('change', renderAvailableSlots);

  renderAvailableSlots();
  renderBookings();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('nameInput').value.trim();
    const phone = document.getElementById('phoneInput').value.trim();
    const service = document.getElementById('serviceInput').value;
    const date = dateInput.value;
    const time = document.getElementById('timeInput').value;
    const notes = document.getElementById('notesInput').value.trim();

    if (!name || !phone || !service || !date || !time) {
      showMessage('Please fill all required fields before booking.', 'error');
      return;
    }

    if (!fullSlots.includes(time)) {
      showMessage('Please choose a valid time slot.', 'error');
      return;
    }

    const isTaken = bookings.some(b => b.date === date && b.time === time);
    if (isTaken) {
      showMessage(`The slot ${time} on ${formatDate(date)} is already booked. Please choose another.`, 'error');
      return;
    }

    const newBooking = { name, phone, service, date, time, notes, createdAt: new Date().toISOString() };
    bookings.push(newBooking);
    saveBookings();

    form.reset();
    dateInput.value = '';
    renderAvailableSlots();
    renderBookings();

    showMessage(`Your appointment request for ${formatDate(date)} at ${time} is confirmed. We will call you at ${phone}.`, 'success');
  });
}

initBooking();
