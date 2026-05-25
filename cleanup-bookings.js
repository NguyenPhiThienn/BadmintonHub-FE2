// Script để xóa các đơn đặt sân có ngày đặt sau 6h ngày 26/05/2026
// Cách chạy: node cleanup-bookings.js

const { MongoClient } = require('mongodb');

const MONGO_URI = 'mongodb+srv://phithien2k2:Hnqn29312002@cluster0.xkp8js7.mongodb.net/?appName=Cluster0';
const DB_NAME = 'badminton_hub';

async function cleanupFutureBookings() {
  const client = new MongoClient(MONGO_URI, {
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
  });

  try {
    console.log('🔄 Đang kết nối MongoDB...');
    await client.connect();
    console.log('✅ Kết nối thành công!');

    const db = client.db(DB_NAME);
    const bookingsCollection = db.collection('bookings');
    const bookingDetailsCollection = db.collection('bookingdetails');

    // Cutoff date: 26/05/2026 06:00:00 (Vietnam timezone = UTC+7)
    // Tức 25/05/2026 23:00:00 UTC
    const cutoffDate = new Date('2026-05-26T06:00:00+07:00');
    console.log(`\n📅 Cutoff date (VN): 2026-05-26 06:00:00`);
    console.log(`📅 Cutoff date (UTC): ${cutoffDate.toISOString()}`);

    // Tìm tất cả booking details có bookingDate > cutoff
    console.log('\n🔍 Đang tìm kiếm các booking details sau cutoff...');
    const futureDetails = await bookingDetailsCollection
      .find({ bookingDate: { $gt: cutoffDate } })
      .toArray();

    console.log(`\n📋 Tìm thấy ${futureDetails.length} booking details có ngày đặt sau cutoff`);

    if (futureDetails.length === 0) {
      console.log('✅ Không có đơn nào cần xóa!');
      return;
    }

    // Lấy danh sách booking IDs duy nhất
    const bookingIds = [...new Set(futureDetails.map(d => d.bookingId.toString()))];
    console.log(`📋 Có ${bookingIds.length} đơn đặt sân liên quan`);

    // Xem chi tiết trước khi xóa
    console.log('\n📝 Chi tiết các đơn sẽ xóa:');
    console.log('='.repeat(80));

    for (const bookingId of bookingIds) {
      const booking = await bookingsCollection.findOne({ _id: require('mongodb').ObjectId.createFromHexString(bookingId) });
      const details = await bookingDetailsCollection.find({ bookingId: require('mongodb').ObjectId.createFromHexString(bookingId) }).toArray();
      const futureDetailCount = details.filter(d => new Date(d.bookingDate) > cutoffDate).length;
      
      console.log(`\n📌 Mã đơn: ${bookingId.slice(-6).toUpperCase()}`);
      console.log(`   Trạng thái: ${booking?.status || 'N/A'}`);
      console.log(`   Khách hàng: ${booking?.customerName || 'N/A'} (${booking?.customerPhone || 'N/A'})`);
      console.log(`   Tổng details: ${details.length} | Details sau cutoff: ${futureDetailCount}`);
      console.log(`   Ngày đặt: ${details.map(d => new Date(d.bookingDate).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })).join(', ')}`);
    }

    console.log('\n' + '='.repeat(80));

    // Hỏi xác nhận
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const answer = await new Promise((resolve) => {
      rl.question('\n❓ Bạn có chắc muốn xóa các đơn trên? (yes/no): ', resolve);
    });
    rl.close();

    if (answer.toLowerCase() !== 'yes') {
      console.log('❌ Đã hủy thao tác xóa!');
      return;
    }

    // Thực hiện xóa
    console.log('\n🗑️ Đang xóa...');
    let deletedBookings = 0;
    let deletedDetails = 0;

    for (const bookingId of bookingIds) {
      const ObjectId = require('mongodb').ObjectId;
      const bookingObjectId = ObjectId.createFromHexString(bookingId);
      const details = await bookingDetailsCollection.find({ bookingId: bookingObjectId }).toArray();
      const allInFuture = details.every(d => new Date(d.bookingDate) > cutoffDate);

      if (allInFuture) {
        // Xóa toàn bộ booking và details
        await bookingDetailsCollection.deleteMany({ bookingId: bookingObjectId });
        await bookingsCollection.deleteOne({ _id: bookingObjectId });
        deletedBookings++;
        deletedDetails += details.length;
        console.log(`   ✅ Đã xóa booking ${bookingId.slice(-6).toUpperCase()} và ${details.length} details`);
      } else {
        // Chỉ xóa details có ngày sau cutoff
        const futureDetailIds = details
          .filter(d => new Date(d.bookingDate) > cutoffDate)
          .map(d => d._id);
        await bookingDetailsCollection.deleteMany({ _id: { $in: futureDetailIds } });
        deletedDetails += futureDetailIds.length;
        console.log(`   ⚠️ Đã xóa ${futureDetailIds.length} details từ booking ${bookingId.slice(-6).toUpperCase()} (giữ lại booking)`);
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ XÓA THÀNH CÔNG!');
    console.log(`   - Số booking đã xóa: ${deletedBookings}`);
    console.log(`   - Số booking details đã xóa: ${deletedDetails}`);
    console.log('='.repeat(80));

  } catch (error) {
    console.error('\n❌ Lỗi:', error.message);
    if (error.message.includes('ECONNREFUSED') || error.message.includes('whitelist')) {
      console.log('\n💡 Gợi ý: Kiểm tra IP whitelist trên MongoDB Atlas!');
    }
  } finally {
    await client.close();
    console.log('\n🔌 Đã ngắt kết nối MongoDB');
  }
}

cleanupFutureBookings();
