import { getRepository } from 'typeorm';
import { hash } from 'bcryptjs';
import { User } from '../models/User';

export async function seedUsers() {
  const userRepository = getRepository(User);
  
  // Check if admin already exists
  const existingAdmin = await userRepository.findOne({ where: { email: 'admin@packyourbags.com' } });
  if (!existingAdmin) {
    const admin = new User();
    admin.firstName = 'Admin';
    admin.lastName = 'User';
    admin.email = 'admin@packyourbags.com';
    admin.password = await hash('Admin@123', 10);
    admin.role = 'admin';
    await userRepository.save(admin);
  }

  // Check if regular user already exists
  const existingUser = await userRepository.findOne({ where: { email: 'user@example.com' } });
  if (!existingUser) {
    const user = new User();
    user.firstName = 'John';
    user.lastName = 'Doe';
    user.email = 'user@example.com';
    user.password = await hash('User@123', 10);
    user.role = 'user';
    await userRepository.save(user);
  }
}