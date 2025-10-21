import { AppDataSource } from '../config/database';
import { TravelPackage } from '../models/TravelPackage';

export const createSamplePackages = async () => {
  const packageRepository = AppDataSource.getRepository(TravelPackage);

  // Check if we already have packages
  const existingPackages = await packageRepository.find();
  if (existingPackages.length > 0) {
    console.log('Sample packages already exist, skipping seed...');
    return;
  }

  const samplePackages = [
    {
      name: 'Taj Mahal Heritage Tour',
      destination: 'Agra',
      description: 'Experience the majestic Taj Mahal in this 3-day tour. Witness the stunning architecture, learn about its rich history, and capture memories at one of the seven wonders of the world.',
      price: 599,
      duration: 3,
      maxTravelers: 15,
      inclusions: [
        'Luxury hotel accommodation',
        'Professional guide',
        'Sunrise Taj Mahal visit',
        'Agra Fort tour',
        'All transfers',
        'Breakfast and dinner'
      ],
      isAvailable: true
    },
    {
      name: 'Rome Historical Tour',
      destination: 'Rome',
      description: 'Discover the eternal city of Rome in this 5-day tour. Walk through ancient ruins, visit the magnificent Colosseum, and experience the rich culture of Italy\'s capital.',
      price: 1299,
      duration: 5,
      maxTravelers: 12,
      inclusions: [
        '4-star hotel accommodation',
        'Skip-the-line Vatican entry',
        'Colosseum guided tour',
        'Roman Forum visit',
        'Traditional Italian dinners',
        'Airport transfers'
      ],
      isAvailable: true
    },
    {
      name: 'Ancient Temple Expedition',
      destination: 'Temple',
      description: 'Explore ancient temples and their mystical history in this 4-day spiritual journey. Discover architectural marvels and learn about ancient customs and traditions.',
      price: 799,
      duration: 4,
      maxTravelers: 10,
      inclusions: [
        'Boutique hotel stays',
        'Temple guided tours',
        'Morning meditation sessions',
        'Traditional ceremonies',
        'All meals included',
        'Expert guide',
        'Local transport'
      ],
      isAvailable: true
    },
    {
      name: 'Head Sculptures Discovery',
      destination: 'Heads',
      description: 'Visit the fascinating head sculptures in this unique 3-day tour. Learn about the history and artistry behind these remarkable monuments.',
      price: 499,
      duration: 3,
      maxTravelers: 8,
      inclusions: [
        'Hotel accommodation',
        'Guided sculpture tours',
        'Photography sessions',
        'Historical lectures',
        'All meals included',
        'Transport',
        'Expert art historian guide'
      ],
      isAvailable: true
    }
  ];

  try {
    for (const packageData of samplePackages) {
      const travelPackage = packageRepository.create(packageData);
      await packageRepository.save(travelPackage);
    }
    console.log('Sample packages created successfully!');
  } catch (error) {
    console.error('Error creating sample packages:', error);
  }
};