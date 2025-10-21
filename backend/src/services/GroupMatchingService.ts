import { AppDataSource } from '../config/database';
import { Booking } from '../models/Booking';
import { TravelPackage } from '../models/TravelPackage';

export interface MatchResult {
  travelPackageId: string;
  travelDate: string;
  bookingIds: string[];
  seatsTotal: number;
  maxCapacity: number;
}

// Greedy bin-packing style matcher by package+date, O(n log n)
export class GroupMatchingService {
  static async findMatches(
    travelPackageId: string,
    travelDate: string,
    maxCapacityOverride?: number
  ): Promise<MatchResult | null> {
    const bookingRepository = AppDataSource.getRepository(Booking);
    const packageRepository = AppDataSource.getRepository(TravelPackage);

    const travelPackage = await packageRepository.findOne({ where: { id: travelPackageId } });
    if (!travelPackage) return null;

    const maxCapacity = maxCapacityOverride ?? travelPackage.maxTravelers;

    const candidates = await bookingRepository.find({
      where: {
        travelPackage: { id: travelPackageId },
        travelDate: new Date(travelDate) as any,
        status: 'pending',
      },
    });

    if (!candidates.length) return null;

    // Sort by ascending seats to pack smaller bookings first
    const sorted = candidates
      .map((b) => ({ id: b.id, seats: b.numberOfTravelers }))
      .sort((a, b) => a.seats - b.seats);

    const chosen: string[] = [];
    let used = 0;
    for (const c of sorted) {
      if (used + c.seats <= maxCapacity) {
        chosen.push(c.id);
        used += c.seats;
      }
      if (used === maxCapacity) break;
    }

    if (chosen.length === 0) return null;

    return {
      travelPackageId,
      travelDate,
      bookingIds: chosen,
      seatsTotal: used,
      maxCapacity,
    };
  }
}
