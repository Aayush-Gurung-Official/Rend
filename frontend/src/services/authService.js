// Simple local storage based auth for development without backend
const generateId = () => Math.random().toString(36).substr(2, 9);

const getUsers = () => {
  const users = localStorage.getItem('rendUsers');
  return users ? JSON.parse(users) : [];
};

const saveUsers = (users) => {
  localStorage.setItem('rendUsers', JSON.stringify(users));
};

export const signup = async ({ username, password }) => {
  const users = getUsers();
  
  // Check if user already exists
  if (users.find(u => u.username === username)) {
    throw new Error('Username already exists');
  }
  
  const newUser = {
    id: generateId(),
    username,
    password, // In production, this should be hashed
    profileImage: null,
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  saveUsers(users);
  
  // Return user without password
  const { password: _, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

export const login = async ({ username, password }) => {
  const users = getUsers();
  const user = users.find(u => u.username === username && u.password === password);
  
  if (!user) {
    throw new Error('Invalid username or password');
  }
  
  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const updateProfile = async ({ id, username, profileImage, fullName, email, bio }) => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === id);
  
  if (userIndex === -1) {
    throw new Error('User not found');
  }
  
  // Check if username is being changed and if it already exists
  if (username !== users[userIndex].username) {
    const existingUser = users.find(u => u.username === username && u.id !== id);
    if (existingUser) {
      throw new Error('Username already exists');
    }
  }
  
  users[userIndex] = { 
    ...users[userIndex], 
    username, 
    profileImage, 
    fullName, 
    email, 
    bio,
    updatedAt: new Date().toISOString()
  };
  saveUsers(users);
  
  // Return user without password
  const { password: _, ...userWithoutPassword } = users[userIndex];
  return userWithoutPassword;
};

