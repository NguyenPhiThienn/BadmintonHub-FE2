import mongoose from 'mongoose';

// MongoDB Atlas connection string (standard format)
const MONGO_URI = 'mongodb://phithien2k2:Hnqn29312002@cluster0.xkp8js7.mongodb.net:27017/?appName=Cluster0';

const BookingDetailSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  courtId: { type: mongoose.Schema.Types.ObjectId, ref: 'Court', required: true },
  bookingDate: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  price: { type: Number, required: true },
}, { timestamps: true });

const BookingSchema = new mongoose.Schema({
  playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isGuest: { type: Boolean, default: false },
  venueId: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue', required: true },
  promotionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Promotion' },
  totalPrice: { type: Number, required: true },
  finalPrice: { type: Number, required: true },
  status: { type: String, enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'], required: true },
  note: { type: String },
  isWeekly: { type: Boolean, default: false },
  customerName: { type: String },
  customerPhone: { type: String },
  customerEmail: { type: String },
}, { timestamps: true });

const BookingDetail = mongoose.model('BookingDetail', BookingDetailSchema);
const Booking = mongoose.model('Booking', BookingSchema);

async function cleanupFutureBookings() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Cutoff date: 26/05/2026 06:00:00 (Vietnam timezone = UTC+7)
    // Convert to UTC: subtract 7 hours
    // 26/05/2026 06:00:00 +07:00 = 25/05/2026 23:00:00 UTC
    const cutoffDate = new Date('2026-05-26T06:00:00+07:00');
    console.log(`🗑️ Cutoff date (Vietnam): 2026-05-26 06:00:00`);
    console.log(`🗑️ Cutoff date (UTC): ${cutoffDate.toISOString()}`);

    // Find all booking details with bookingDate > cutoff
    const futureDetails = await BookingDetail.find({
      bookingDate: { $gt: cutoffDate }
    }).lean();

    console.log(`\n📋 Found ${futureDetails.length} booking details with bookingDate > cutoff`);

    if (futureDetails.length === 0) {
      console.log('✅ No bookings to delete');
      return;
    }

    // Get unique booking IDs
    const bookingIds = [...new Set(futureDetails.map((d: any) => d.bookingId.toString()))];
    console.log(`📋 Found ${bookingIds.length} unique bookings to check`);

    // For each booking, check if ALL details are in the future
    const bookingsToDelete: string[] = [];
    
    for (const bookingId of bookingIds) {
      const details = await BookingDetail.find({ bookingId: new mongoose.Types.ObjectId(bookingId) }).lean();
      const allInFuture = details.every((d: any) => new Date(d.bookingDate) > cutoffDate);
      
      if (allInFuture) {
        bookingsToDelete.push(bookingId);
      } else {
        // Delete only the future details, keep the booking
        const futureDetailIds = details
          .filter((d: any) => new Date(d.bookingDate) > cutoffDate)
          .map((d: any) => d._id);
        
        await BookingDetail.deleteMany({ _id: { $in: futureDetailIds } });
        console.log(`📝 Partial delete: Removed ${futureDetailIds.length} future details from booking ${bookingId}`);
      }
    }

    console.log(`\n🗑️ Bookings to fully delete: ${bookingsToDelete.length}`);

    if (bookingsToDelete.length > 0) {
      // Show booking details before deletion
      console.log('\n📋 Bookings to be deleted:');
      for (const bookingId of bookingsToDelete) {
        const booking = await Booking.findById(bookingId).lean();
        const details = await BookingDetail.find({ bookingId: new mongoose.Types.ObjectId(bookingId) }).lean();
        console.log(`  - Booking ID: ${bookingId}`);
        console.log(`    Status: ${booking?.status}`);
        console.log(`    Customer: ${booking?.customerName || 'N/A'} (${booking?.customerPhone || 'N/A'})`);
        console.log(`    Booking Dates: ${details.map((d: any) => new Date(d.bookingDate).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })).join(', ')}`);
        console.log('');
      }

      // Delete booking details first
      await BookingDetail.deleteMany({ bookingId: { $in: bookingsToDelete.map(id => new mongoose.Types.ObjectId(id)) } });
      console.log('✅ Deleted booking details');

      // Delete bookings
      const result = await Booking.deleteMany({ _id: { $in: bookingsToDelete.map(id => new mongoose.Types.ObjectId(id)) } });
      console.log(`✅ Deleted ${result.deletedCount} bookings`);
    }

    console.log('\n✅ Cleanup completed successfully!');
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

cleanupFutureBookings();
