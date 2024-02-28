import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/badminton_hub';

const venueSchema = new mongoose.Schema({}, { strict: false });
const courtSchema = new mongoose.Schema({}, { strict: false });
const bookingSchema = new mongoose.Schema({}, { strict: false });
const bookingDetailSchema = new mongoose.Schema({}, { strict: false });
const paymentSchema = new mongoose.Schema({}, { strict: false });

const Venue = mongoose.model('Venue', venueSchema);
const Court = mongoose.model('Court', courtSchema);
const Booking = mongoose.model('Booking', bookingSchema);
const BookingDetail = mongoose.model('BookingDetail', bookingDetailSchema);
const Payment = mongoose.model('Payment', paymentSchema);

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generatePhone() {
  return '0' + randomInt(900000000, 999999999);
}

const customerNames = [
  'Nguyễn Văn A', 'Trần Thị B', 'Lê Minh C', 'Phạm Hoàng D', 'Hoàng Thu E',
  'Vũ Đức F', 'Đặng Mai G', 'Bùi Hải H', 'Cao Sơn I', 'Đỗ Lan J',
  'Ngô Quang K', 'Trịnh Thu L', 'Phan Tiến M', 'Lý Thanh N', 'Trương Minh O',
  'Hồng Ngọc P', 'Đinh Văn Q', 'Bạch Thị R', 'Cốc Quang S', 'Nguyễn Đức T',
];

const timeSlots = [
  { start: '06:00', end: '07:00', price: 60000 },
  { start: '07:00', end: '08:00', price: 60000 },
  { start: '08:00', end: '09:00', price: 70000 },
  { start: '09:00', end: '10:00', price: 70000 },
  { start: '10:00', end: '11:00', price: 80000 },
  { start: '14:00', end: '15:00', price: 80000 },
  { start: '15:00', end: '16:00', price: 80000 },
  { start: '16:00', end: '17:00', price: 90000 },
  { start: '17:00', end: '18:00', price: 90000 },
  { start: '18:00', end: '19:00', price: 100000 },
  { start: '19:00', end: '20:00', price: 100000 },
  { start: '20:00', end: '21:00', price: 100000 },
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Get all venues
  const venues = await Venue.find({});
  if (venues.length === 0) {
    console.log('❌ No venues found. Please create venues first.');
    process.exit(1);
  }
  console.log(`📍 Found ${venues.length} venues`);

  // Get courts for each venue
  const venueCourts: Record<string, any[]> = {};
  for (const venue of venues) {
    const courts = await Court.find({ venueId: venue._id });
    venueCourts[venue._id.toString()] = courts;
  }

  // Generate bookings for March, April, May 2026
  const months = [3, 4, 5];
  const year = 2026;

  let totalBookings = 0;
  let totalRevenue = 0;

  for (const month of months) {
    // Days in month
    const daysInMonth = new Date(year, month, 0).getDate();

    // Random number of bookings per day (more on weekends)
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dayOfWeek = date.getDay(); // 0 = Sun, 6 = Sat
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      // 3-8 bookings on weekdays, 8-20 on weekends
      const bookingsPerDay = isWeekend
        ? randomInt(8, 20)
        : randomInt(3, 8);

      for (let b = 0; b < bookingsPerDay; b++) {
        const venue = randomElement(venues);
        const courts = venueCourts[venue._id.toString()];
        if (!courts || courts.length === 0) continue;

        const court = randomElement(courts);
        const slot = randomElement(timeSlots);

        // Random hour for createdAt (spread through the day)
        const createdHour = randomInt(6, 22);
        const createdAt = new Date(year, month - 1, day, createdHour, randomInt(0, 59));

        const price = slot.price;
        const finalPrice = price;

        // Create booking
        const booking = await Booking.create({
          playerId: null,
          isGuest: true,
          venueId: venue._id,
          promotionId: null,
          totalPrice: price,
          finalPrice: finalPrice,
          status: 'COMPLETED',
          note: '',
          isWeekly: false,
          customerName: randomElement(customerNames),
          customerPhone: generatePhone(),
          customerEmail: '',
          createdAt: createdAt,
          updatedAt: createdAt,
        });

        // Create booking detail
        const bookingDate = new Date(year, month - 1, day);
        await BookingDetail.create({
          bookingId: booking._id,
          courtId: court._id,
          bookingDate: bookingDate,
          startTime: slot.start,
          endTime: slot.end,
          price: price,
          createdAt: createdAt,
        });

        // Create payment
        const paymentMethods = ['VNPAY', 'MOMO', 'CASH'];
        await Payment.create({
          bookingId: booking._id,
          amount: finalPrice,
          method: randomElement(paymentMethods),
          status: 'SUCCESS',
          transaction_id: `TXN${Date.now()}${randomInt(1000, 9999)}`,
          createdAt: createdAt,
        });

        totalBookings++;
        totalRevenue += finalPrice;
      }
    }

    console.log(`✅ Month ${month}/2026: generated bookings`);
  }

  console.log(`\n🎉 Seed complete!`);
  console.log(`   Total bookings: ${totalBookings}`);
  console.log(`   Total revenue: ${totalRevenue.toLocaleString()} VND`);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
