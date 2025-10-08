import { addMinutes, isBefore, isEqual } from 'date-fns'

let _id = 1000
const uid = () => String(_id++)

// Default mock data
const defaultDb = {
  users: [
    { id: '1', collegeId: 'ADMIN001', name: 'Admin User', firstName: 'Admin', lastName: 'User', email: 'admin@hub.com', password: 'admin123', role: 'admin' },
    { id: '3', collegeId: 'STU001', name: 'Student User', firstName: 'Student', lastName: 'User', email: 'student@hub.com', password: 'student123', role: 'student' },
  ],
  clubs: [
    { id: 'c1', name: 'Robotics Club', category: 'STEM', faculty: 'Dr. Lee', description: 'Build and program robots.' },
    { id: 'c2', name: 'Drama Society', category: 'Arts', faculty: 'Ms. Patel', description: 'Theater and performance.' },
    { id: 'c3', name: 'Eco Warriors', category: 'Community', faculty: 'Mr. Gomez', description: 'Sustainability initiatives.' },
  ],
  events: [
    { id: 'e1', title: 'Robotics Workshop', clubId: 'c1', venue: 'Lab A', start: new Date().toISOString(), end: addMinutes(new Date(), 90).toISOString(), category: 'Workshop', capacity: 30, attendees: [] },
    { id: 'e2', title: 'Auditions', clubId: 'c2', venue: 'Auditorium', start: addMinutes(new Date(), 240).toISOString(), end: addMinutes(new Date(), 300).toISOString(), category: 'Audition', capacity: 50, attendees: [] },
  ],
  registrations: [],
  pendingRegistrations: [],
  notifications: [],
  feedback: [],
  achievements: [
    { id: 'a1', studentId: '3', title: 'Hackathon Winner', issueDate: new Date().toISOString() },
  ],
}

// Load data from localStorage or use default
function loadDb() {
  try {
    const saved = localStorage.getItem('campus-connect-mock-db')
    if (saved) {
      const parsed = JSON.parse(saved)
      console.log('Loaded mock database from localStorage')
      return parsed
    }
  } catch (error) {
    console.warn('Failed to load mock database from localStorage:', error)
  }
  console.log('Using default mock database')
  return JSON.parse(JSON.stringify(defaultDb)) // Deep copy
}

// Save data to localStorage
function saveDb() {
  try {
    localStorage.setItem('campus-connect-mock-db', JSON.stringify(db))
    console.log('Saved mock database to localStorage')
  } catch (error) {
    console.warn('Failed to save mock database to localStorage:', error)
  }
}

// Mock data stores with persistence
export const db = loadDb()

export function listClubs() { return Promise.resolve([...db.clubs]) }
export function listEvents() { return Promise.resolve([...db.events]) }
export function createEvent(e) {
  console.log('Creating event with data:', e)
  
  try {
    // Convert datetime-local format to ISO string if needed
    const eventData = {
      ...e,
      start: e.start.includes('T') ? new Date(e.start).toISOString() : e.start,
      end: e.end.includes('T') ? new Date(e.end).toISOString() : e.end
    }
    
    console.log('Processed event data:', eventData)
    
    const conflict = checkConflict(eventData)
    if (conflict) {
      console.log('Conflict detected:', conflict)
      return Promise.reject(new Error(`Time/venue conflict with ${conflict.title} at ${conflict.venue}`))
    }
    
    const newE = { ...eventData, id: uid(), attendees: [] }
    db.events.push(newE)
    console.log('Event created successfully:', newE)
    
    // Create notifications for all students when a new event is created
    const students = db.users.filter(user => user.role === 'student')
    students.forEach(student => {
      const notification = {
        id: uid(),
        userId: student.id,
        message: `New event created: ${newE.title} at ${newE.venue} on ${new Date(newE.start).toLocaleDateString()}`,
        read: false,
        createdAt: new Date().toISOString()
      }
      db.notifications.push(notification)
    })
    
    // Save to localStorage
    saveDb()
    
    console.log(`Created ${students.length} notifications for new event: ${newE.title}`)
    return Promise.resolve(newE)
  } catch (error) {
    console.error('Error creating event:', error)
    return Promise.reject(new Error(`Failed to create event: ${error.message}`))
  }
}
export function updateEvent(eid, patch) {
  const idx = db.events.findIndex(e => e.id === eid)
  if (idx === -1) return Promise.reject(new Error('Event not found'))
  const updated = { ...db.events[idx], ...patch }
  if (patch.start || patch.end || patch.venue) {
    const conflict = checkConflict(updated, eid)
    if (conflict) return Promise.reject(new Error(`Time/venue conflict with ${conflict.title} at ${conflict.venue}`))
  }
  db.events[idx] = updated
  saveDb()
  return Promise.resolve(updated)
}
export function deleteEvent(eid) {
  const idx = db.events.findIndex(e => e.id === eid)
  if (idx !== -1) {
    db.events.splice(idx,1)
    saveDb()
  }
  return Promise.resolve()
}

export function checkConflict(event, ignoreId) {
  const s = new Date(event.start)
  const e = new Date(event.end)
  return db.events.find(ev => ev.venue === event.venue && ev.id !== ignoreId && overlaps(s, e, new Date(ev.start), new Date(ev.end)))
}

function overlaps(s1, e1, s2, e2) {
  return isBefore(s1, e2) && isBefore(s2, e1) || isEqual(s1, s2)
}

export function registerForEvent(eventId, studentId) {
  const ev = db.events.find(e => e.id === eventId)
  if (!ev) return Promise.reject(new Error('Event not found'))
  if (ev.attendees.includes(studentId)) return Promise.reject(new Error('Already registered'))
  if (db.pendingRegistrations.find(r => r.eventId === eventId && r.studentId === studentId)) return Promise.reject(new Error('Registration pending approval'))
  if (ev.attendees.length >= (ev.capacity || 9999)) return Promise.reject(new Error('Event full'))
  
  // Create pending registration
  const pendingReg = { id: uid(), eventId, studentId, timestamp: new Date().toISOString(), status: 'pending' }
  db.pendingRegistrations.push(pendingReg)
  
  // Notify admin
  pushNotification('1', `New registration request from Student ${studentId} for ${ev.title}`)
  // Notify student
  pushNotification(studentId, `Registration request submitted for ${ev.title}. Waiting for admin approval.`)
  
  // Save to localStorage
  saveDb()
  
  return Promise.resolve({ ok: true, pending: true })
}

export function listRegistrations() { return Promise.resolve([...db.registrations]) }
export function listPendingRegistrations() { return Promise.resolve([...db.pendingRegistrations]) }

export function approveRegistration(regId) {
  const idx = db.pendingRegistrations.findIndex(r => r.id === regId)
  if (idx === -1) return Promise.reject(new Error('Registration not found'))
  const reg = db.pendingRegistrations[idx]
  const ev = db.events.find(e => e.id === reg.eventId)
  if (!ev) return Promise.reject(new Error('Event not found'))
  
  // Move to approved registrations
  ev.attendees.push(reg.studentId)
  db.registrations.push({ ...reg, status: 'approved' })
  db.pendingRegistrations.splice(idx, 1)
  
  // Notify student
  pushNotification(reg.studentId, `Your registration for ${ev.title} has been approved!`)
  
  // Save to localStorage
  saveDb()
  
  return Promise.resolve({ ok: true })
}

export function rejectRegistration(regId) {
  const idx = db.pendingRegistrations.findIndex(r => r.id === regId)
  if (idx === -1) return Promise.reject(new Error('Registration not found'))
  const reg = db.pendingRegistrations[idx]
  const ev = db.events.find(e => e.id === reg.eventId)
  
  // Remove from pending
  db.pendingRegistrations.splice(idx, 1)
  
  // Notify student
  if (ev) pushNotification(reg.studentId, `Your registration for ${ev.title} has been rejected.`)
  
  // Save to localStorage
  saveDb()
  
  return Promise.resolve({ ok: true })
}
export function listAchievements(studentId) { return Promise.resolve(db.achievements.filter(a => a.studentId === studentId)) }

// Get events that a student is registered for
export function getMyRegisteredEvents(studentId) {
  const registeredEvents = db.events.filter(event => event.attendees.includes(studentId))
  return Promise.resolve(registeredEvents)
}

// Check if student is registered for a specific event
export function isRegisteredForEvent(eventId, studentId) {
  const event = db.events.find(e => e.id === eventId)
  return event ? event.attendees.includes(studentId) : false
}
export function submitFeedback({ studentId, message }) {
  db.feedback.push({ id: uid(), studentId, message, createdAt: new Date().toISOString() })
  return Promise.resolve({ ok: true })
}

export function pushNotification(userIdOrAll, message) {
  db.notifications.push({ id: uid(), to: userIdOrAll, message, createdAt: new Date().toISOString(), read: false })
  // Save to localStorage when notifications are added
  saveDb()
}
export function listNotifications(userId) {
  return Promise.resolve(db.notifications.filter(n => n.to === 'all' || n.to === userId).sort((a,b)=> new Date(b.createdAt)-new Date(a.createdAt)))
}

export function getUnreadNotificationCount(userId) {
  return Promise.resolve(db.notifications.filter(n => (n.to === 'all' || n.to === userId) && !n.read).length)
}

// User Registration
export function registerUser({ collegeId, email, firstName, lastName, password, role }) {
  // Check if email already exists
  if (db.users.find(u => u.email === email)) {
    return Promise.reject(new Error('Email already registered'))
  }
  
  // Check if college ID already exists
  if (db.users.find(u => u.collegeId === collegeId)) {
    return Promise.reject(new Error('College ID already registered'))
  }
  
  // Create new user
  const newUser = {
    id: uid(),
    collegeId,
    email,
    firstName,
    lastName,
    name: `${firstName} ${lastName}`,
    password,
    role
  }
  
  db.users.push(newUser)
  return Promise.resolve({ ok: true, user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role } })
}

export function listUsers() {
  return Promise.resolve([...db.users])
}
export function markNotificationRead(id) {
  const n = db.notifications.find(n => n.id === id)
  if (n) {
    n.read = true
    // Save to localStorage when notifications are marked as read
    saveDb()
  }
  return Promise.resolve()
}

export function exportCSV(rows, filename = 'export.csv') {
  const csv = rows.map(r => Object.values(r).map(v => '"'+String(v).replaceAll('"','""')+'"').join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
