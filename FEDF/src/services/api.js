import { addMinutes, isBefore, isEqual } from 'date-fns'

let _id = 1000
const uid = () => String(_id++)

// Mock data stores
export const db = {
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

export function listClubs() { return Promise.resolve([...db.clubs]) }
export function listEvents() { return Promise.resolve([...db.events]) }
export function createEvent(e) {
  const conflict = checkConflict(e)
  if (conflict) return Promise.reject(new Error(`Time/venue conflict with ${conflict.title} at ${conflict.venue}`))
  const newE = { ...e, id: uid(), attendees: [] }
  db.events.push(newE)
  return Promise.resolve(newE)
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
  return Promise.resolve(updated)
}
export function deleteEvent(eid) {
  const idx = db.events.findIndex(e => e.id === eid)
  if (idx !== -1) db.events.splice(idx,1)
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
  return Promise.resolve({ ok: true })
}
export function listAchievements(studentId) { return Promise.resolve(db.achievements.filter(a => a.studentId === studentId)) }
export function submitFeedback({ studentId, message }) {
  db.feedback.push({ id: uid(), studentId, message, createdAt: new Date().toISOString() })
  return Promise.resolve({ ok: true })
}

export function pushNotification(userIdOrAll, message) {
  db.notifications.push({ id: uid(), to: userIdOrAll, message, createdAt: new Date().toISOString(), read: false })
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
  if (n) n.read = true
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
