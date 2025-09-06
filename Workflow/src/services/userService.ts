import axiosInstance from '../axios';

export interface User {
  id: string;
  email: string;
  username: string;
  password: string;
  bio?: string;
  role: string;
  createdAt: string;
}

export async function getUserById(id: string): Promise<User | null> {
  console.log('[userService] getUserById - starting API call for id:', id);
  try {
    const res = await axiosInstance.get(`/users/${id}`);
    console.log('[userService] getUserById - API call successful:', res.data);
    return res.data as User;
  } catch (error) {
    console.error('[userService] getUserById - API call failed:', error);
    return null;
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  console.log('[userService] getUserByEmail - starting API call for email:', email);
  try {
    const res = await axiosInstance.get(`/users`, { params: { email } });
    console.log('[userService] getUserByEmail - API call successful:', res.data);
    return res.data as User;
  } catch (error) {
    console.error('[userService] getUserByEmail - API call failed:', error);
    return null;
  }
}

export async function createUser(data: { email: string; username: string; password: string; bio?: string; role: string }): Promise<User> {
  console.log('[userService] createUser - starting API call with data:', { email: data.email, username: data.username, role: data.role });
  const res = await axiosInstance.post(`/users`, data);
  console.log('[userService] createUser - API call successful:', res.data);
  return res.data as User;
} 