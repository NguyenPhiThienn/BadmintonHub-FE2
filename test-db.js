const { MongoClient } = require('mongodb');

async function main() {
  const uri = 'mongodb+srv://phithien2k2:Hnqn29312002@cluster0.xkp8js7.mongodb.net/?appName=Cluster0';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('test'); // NestJS default DB name is usually determined by URI or is 'test' if none. Let's check db list first.
    
    const dbs = await client.db().admin().listDatabases();
    console.log("Databases:", dbs.databases.map(d => d.name));

    // Let's connect to the active one (likely "test")
    const activeDb = client.db('test');
    
    const bookingsCount = await activeDb.collection('bookings').countDocuments();
    const bookingDetailsCount = await activeDb.collection('bookingdetails').countDocuments();
    const venuesCount = await activeDb.collection('venues').countDocuments();
    const courtsCount = await activeDb.collection('courts').countDocuments();
    const usersCount = await activeDb.collection('users').countDocuments();

    console.log("Counts in 'test' database:");
    console.log("- Bookings:", bookingsCount);
    console.log("- Booking Details:", bookingDetailsCount);
    console.log("- Venues:", venuesCount);
    console.log("- Courts:", courtsCount);
    console.log("- Users:", usersCount);

    const activeBookings = await activeDb.collection('bookings').find({ status: { $in: ['CONFIRMED', 'COMPLETED'] } }).toArray();
    console.log("Active Bookings count:", activeBookings.length);

    const activeBookingIds = activeBookings.map(b => b._id);
    const matchedDetails = await activeDb.collection('bookingdetails').countDocuments({ bookingId: { $in: activeBookingIds } });
    console.log("Booking Details matching active bookings:", matchedDetails);

    // Let's check if the collection name is different
    const collections = await activeDb.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));

  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

main();
