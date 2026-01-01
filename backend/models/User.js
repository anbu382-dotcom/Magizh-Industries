const UserSchema = {
  firstName: '',
  lastName: '',
  fatherName: '',
  dob: '', // Format: YYYY-MM-DD
  email: '',
  userId: '', // Custom generated ID (e.g., "johnd")
  role: 'employee', // 'admin' or 'employee'
  createdAt: new Date().toISOString(),
  approvedAt: null,
  isActive: true
};

module.exports = UserSchema;
