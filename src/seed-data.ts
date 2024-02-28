import mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/badminton-hub';

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    const db = mongoose.connection;

    if (db.readyState !== 1) {
      await new Promise((resolve) => db.once('open', resolve));
    }

    console.log('Connected! Clearing existing data...');
    const collections = await db.db.listCollections().toArray();
    for (const collection of collections) {
      try {
        await db.db.dropCollection(collection.name);
        console.log(`Dropped collection: ${collection.name}`);
      } catch (e) { }
    }

    const defaultPasswordHash = await bcrypt.hash('password123', 10);

    // 1. Users (only allowed accounts)
    const userData = [
      { fullName: 'Phạm Văn Minh Thịnh', email: 'pvmthinh2002@gmail.com', phone: '0999999999', role: 'ADMIN' },
      { fullName: 'Phi Thiên', email: 'phithien1007@gmail.com', phone: '0987654321', role: 'ADMIN' },
    ];

    const users = userData.map(u => {
      const { customPassword, ...rest } = u as any;
      return {
        ...rest,
        passwordHash: customPassword || defaultPasswordHash,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(u.fullName)}&background=random`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });

    const insertedUsers = await db.collection('users').insertMany(users);
    const userIds = Object.values(insertedUsers.insertedIds);
    const ownerIds = userIds;
    const playerIds = userIds;
    console.log('Seeded 2 Admin Users');

    // 2. Venues (15 real items in Gò Vấp)
    const venueData = [
      { name: 'Sân cầu lông Đại Phát', address: '313/17 Phan Huy Ích, Phường 14, Gò Vấp', lat: 10.8425, lng: 106.6345, price: 60000 },
      { name: 'Sân cầu lông Khang An', address: '18A Phan Văn Trị, Phường 10, Gò Vấp', lat: 10.8267, lng: 106.6789, price: 70000 },
      { name: 'Sân cầu lông Gia Bảo', address: '426/47/2 Đường Cây Trâm, Phường 9, Gò Vấp', lat: 10.8412, lng: 106.6567, price: 55000 },
      { name: 'Sân cầu lông Đức Lợi', address: '611 Lê Văn Thọ, Phường 14, Gò Vấp', lat: 10.8523, lng: 106.6545, price: 65000 },
      { name: 'Sân cầu lông Bảo Hà', address: '161 Nguyễn Văn Nghi, Phường 7, Gò Vấp', lat: 10.8212, lng: 106.6878, price: 60000 },
      { name: 'Sân cầu lông Enjoy Sport', address: '108/20 Nguyễn Thượng Hiền, Phường 1, Gò Vấp', lat: 10.8123, lng: 106.6845, price: 75000 },
      { name: 'Sân cầu lông 717 Tân Sơn', address: '717 Tân Sơn, Phường 12, Gò Vấp', lat: 10.8145, lng: 106.6434, price: 60000 },
      { name: 'Sân cầu lông Châu Dương', address: '16 Đường số 53, Phường 14, Gò Vấp', lat: 10.8489, lng: 106.6456, price: 55000 },
      { name: 'Sân cầu lông Sơn Tạ', address: '313/7 Phan Huy Ích, Phường 14, Gò Vấp', lat: 10.8423, lng: 106.6341, price: 55000 },
      { name: 'Sân cầu lông Kat Badminton', address: '1180/6 Quang Trung, Phường 8, Gò Vấp', lat: 10.8356, lng: 106.6456, price: 80000 },
      { name: 'Sân cầu lông Đạt Đức', address: '202 Đường số 11, Phường 11, Gò Vấp', lat: 10.8312, lng: 106.6678, price: 50000 },
      { name: 'Sân cầu lông Phường 15', address: '122 Đường số 8, Phường 15, Gò Vấp', lat: 10.8545, lng: 106.6712, price: 45000 },
      { name: 'Sân cầu lông Nguyễn Oanh', address: '235 Nguyễn Oanh, Phường 17, Gò Vấp', lat: 10.8412, lng: 106.6789, price: 65000 },
      { name: 'Sân cầu lông Bến Cát', address: 'Hẻm 173 Dương Quảng Hàm, Phường 6, Gò Vấp', lat: 10.8289, lng: 106.6912, price: 55000 },
      { name: 'Sân cầu lông Thống Nhất', address: '15 Thống Nhất, Phường 11, Gò Vấp', lat: 10.8345, lng: 106.6623, price: 60000 },
    ];

    const venues = venueData.map((v, i) => ({
      ownerId: ownerIds[i % ownerIds.length],
      name: v.name,
      address: v.address,
      coordinates: { type: 'Point', coordinates: [v.lng, v.lat] },
      description: `Sân chơi chuyên nghiệp, ánh sáng tốt, thảm tiêu chuẩn cho mọi trình độ tại ${v.name}.`,
      openTime: '06:00',
      closeTime: '22:00',
      averageRating: 4.0 + Math.random(),
      pricePerHour: v.price,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const insertedVenues = await db.collection('venues').insertMany(venues);
    const venueIds = Object.values(insertedVenues.insertedIds);
    console.log('Seeded 15 Realistic Venues');

    // 2b. Add default images for all venues
    const courtImages = [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1556056504-5c7696c4c28d?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=600&fit=crop',
    ];
    
    const newVenueImages = venueIds.map((venueId, i) => ({
      venueId,
      imageUrl: courtImages[i % courtImages.length],
      isPrimary: true,
      createdAt: new Date(),
    }));
    await db.collection('venueImages').insertMany(newVenueImages);
    console.log('Seeded default images for all venues');

    // 3. Courts (15 items)
    const courts = [];
    for (let i = 0; i < 15; i++) {
      courts.push({
        venueId: venueIds[i % venueIds.length],
        name: `Sân số ${(i % 3) + 1}`,
        type: i % 2 === 0 ? 'Thảm PVC' : 'Sàn gỗ',
        status: 'AVAILABLE',
        createdAt: new Date(),
      });
    }
    const insertedCourts = await db.collection('courts').insertMany(courts);
    const courtIds = Object.values(insertedCourts.insertedIds);
    console.log('Seeded 15 Courts');

    // 4. Pricings (Realistic distribution)
    const pricings = [];
    for (let i = 0; i < venueIds.length; i++) {
      const venueId = venueIds[i];
      const basePrice = venueData[i].price;
      
      // Weekdays (0-4: Mon-Fri)
      for (let day = 0; day < 5; day++) {
        // Morning/Afternoon (Off-peak)
        pricings.push({
          venueId,
          dayOfWeek: day,
          startTime: '06:00',
          endTime: '17:00',
          pricePerHour: basePrice,
          createdAt: new Date(),
        });
        // Evening (Peak)
        pricings.push({
          venueId,
          dayOfWeek: day,
          startTime: '17:00',
          endTime: '22:00',
          pricePerHour: basePrice + 20000,
          createdAt: new Date(),
        });
      }
      
      // Weekends (5-6: Sat-Sun)
      for (let day = 5; day < 7; day++) {
        pricings.push({
          venueId,
          dayOfWeek: day,
          startTime: '06:00',
          endTime: '22:00',
          pricePerHour: basePrice + 15000,
          createdAt: new Date(),
        });
      }
    }
    await db.collection('pricings').insertMany(pricings);
    console.log('Seeded Realistic Pricings (Morning, Peak, Weekend)');

    // 5. Promotions (15 items)
    const promotions = [];
    const promoCodes = ['SUMMER2024', 'HELLOMAY', 'BADMINTON50', 'NEWUSER', 'WEEKEND', 'VIP10', 'SALE20', 'FLASH', 'MORNING', 'STUDENT', 'PRO1', 'PRO2', 'PRO3', 'PRO4', 'PRO5'];
    for (let i = 0; i < 15; i++) {
      promotions.push({
        venueId: i % 5 === 0 ? null : venueIds[i % venueIds.length],
        code: promoCodes[i],
        discountPercentage: 5 + (i % 15),
        maxDiscountAmount: 30000,
        startDate: new Date(),
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        isActive: true,
        createdAt: new Date(),
      });
    }
    const insertedPromotions = await db.collection('promotions').insertMany(promotions);
    const promotionIds = Object.values(insertedPromotions.insertedIds);
    console.log('Seeded 15 Promotions');

    // 6. Bookings (15 items)
    const bookings = [];
    const statuses = ['COMPLETED', 'CONFIRMED', 'PENDING', 'CANCELLED'];
    for (let i = 0; i < 15; i++) {
      const price = venueData[i % venueIds.length].price * 2;
      bookings.push({
        playerId: playerIds[i % playerIds.length],
        venueId: venueIds[i % venueIds.length],
        promotionId: i % 3 === 0 ? promotionIds[i % promotionIds.length] : null,
        totalPrice: price,
        finalPrice: price * 0.9,
        status: statuses[i % statuses.length],
        createdAt: new Date(Date.now() - i * 3600000),
        updatedAt: new Date(),
      });
    }
    const insertedBookings = await db.collection('bookings').insertMany(bookings);
    const bookingIds = Object.values(insertedBookings.insertedIds);
    console.log('Seeded 15 Bookings');

    // 7. BookingDetails (15 items)
    const bookingDetails = [];
    for (let i = 0; i < 15; i++) {
      bookingDetails.push({
        bookingId: bookingIds[i % bookingIds.length],
        courtId: courtIds[i % courtIds.length],
        bookingDate: new Date(),
        startTime: `${17 + (i % 4)}:00`,
        endTime: `${19 + (i % 4)}:00`,
        price: venueData[i % venueIds.length].price,
        createdAt: new Date(),
      });
    }
    await db.collection('bookingdetails').insertMany(bookingDetails);
    console.log('Seeded 15 BookingDetails');

    // 8. Reviews (15 items)
    const comments = [
      'Sân đẹp, giá cả hợp lý.', 'Ánh sáng hơi lóa nhưng mặt sân tốt.', 'Phục vụ nhiệt tình.', 'Rất đáng tiền!', 'Sẽ quay lại lần sau.',
      'Sân hơi nóng vào mùa hè.', 'Vị trí dễ tìm.', 'Thảm mới, êm chân.', 'Chỗ gửi xe rộng rãi.', 'Giá hơi cao so với khu vực.',
      'Tuyệt vời!', 'Sân đông nên đặt trước.', 'Có bán nước và phụ kiện.', 'Phòng thay đồ sạch sẽ.', 'Tốt cho tập luyện.'
    ];
    const reviews = [];
    for (let i = 0; i < 15; i++) {
      reviews.push({
        venueId: venueIds[i % venueIds.length],
        playerId: playerIds[i % playerIds.length],
        rating: 4 + (i % 2),
        comment: comments[i],
        createdAt: new Date(),
      });
    }
    await db.collection('reviews').insertMany(reviews);
    console.log('Seeded 15 Reviews');

    // 9. Notifications (15 items)
    const notifications = [];
    for (let i = 0; i < 15; i++) {
      notifications.push({
        userId: userIds[i % userIds.length],
        title: i % 2 === 0 ? 'Đặt sân thành công' : 'Khuyến mãi mới',
        message: i % 2 === 0 ? `Bạn đã đặt thành công sân tại ${venueData[i % venueIds.length].name}` : `Mã giảm giá ${promoCodes[i % 15]} đang chờ bạn!`,
        isRead: i % 3 === 0,
        type: i % 2 === 0 ? 'BOOKING_SUCCESS' : 'PROMOTION',
        createdAt: new Date(),
      });
    }
    await db.collection('notifications').insertMany(notifications);
    console.log('Seeded 15 Notifications');

    // 11. CourtUnavailableTimes (15 items)
    const unavailableTimes = [];
    for (let i = 0; i < 15; i++) {
      unavailableTimes.push({
        courtId: courtIds[i % courtIds.length],
        date: new Date(Date.now() + 86400000),
        startTime: '12:00',
        endTime: '14:00',
        reason: 'Bảo trì định kỳ',
        createdAt: new Date(),
      });
    }
    await db.collection('courtunavailabletimes').insertMany(unavailableTimes);
    console.log('Seeded 15 CourtUnavailableTimes');

    // 12. Payments (15 items)
    const payments = [];
    for (let i = 0; i < 15; i++) {
      payments.push({
        bookingId: bookingIds[i % bookingIds.length],
        amount: bookings[i % bookingIds.length].finalPrice,
        method: i % 2 === 0 ? 'VNPAY' : 'MOMO',
        status: 'PAID',
        transactionId: `PAY-${Date.now()}-${i}`,
        createdAt: new Date(),
      });
    }
    await db.collection('payments').insertMany(payments);
    console.log('Seeded 15 Payments');

    // 13. AiAnalysisMetadata (15 items)
    const aiMetadata = [];
    for (let i = 0; i < 15; i++) {
      aiMetadata.push({
        userId: userIds[i % userIds.length],
        analysisType: 'USER_PREFERENCE',
        metadata: { preferredTime: 'Evening', preferredDistrict: 'District 10' },
        createdAt: new Date(),
      });
    }
    await db.collection('aianalysismetadatas').insertMany(aiMetadata);
    console.log('Seeded 15 AiAnalysisMetadata');

    // 14. PlayerSearchHistory (15 items)
    const keywords = ['Sân Quận 10', 'Cầu lông gần đây', 'Sân Quận 1', 'Giá rẻ', 'Sân đẹp', 'Gò Vấp', 'Bình Thạnh', 'Quận 7'];
    const searchHistory = [];
    for (let i = 0; i < 15; i++) {
      searchHistory.push({
        playerId: playerIds[i % playerIds.length],
        keyword: keywords[i % keywords.length],
        filters: { district: i % 10 === 0 ? 'District 1' : 'District 10' },
        createdAt: new Date(),
      });
    }
    await db.collection('playersearchhistories').insertMany(searchHistory);
    console.log('Seeded 15 PlayerSearchHistory');

    console.log('All data seeded successfully!');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

seed();
