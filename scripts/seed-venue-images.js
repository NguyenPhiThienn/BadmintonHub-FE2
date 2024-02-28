const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/badmintonhub';

const venueImageSchema = new mongoose.Schema({
  venueId: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue', required: true },
  imageUrl: { type: String, required: true },
  isPrimary: { type: Boolean, default: false },
}, { timestamps: { createdAt: true, updatedAt: false } });

const Venue = mongoose.model('Venue', new mongoose.Schema({
  name: String,
  address: String,
}, { timestamps: true, collection: 'venues' }));

const VenueImage = mongoose.model('VenueImage', venueImageSchema);

const courtImages = [
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1556056504-5c7696c4c28d?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=600&fit=crop',
];

async function seedImages() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Get all venues
    const venues = await Venue.find({});
    console.log(`Found ${venues.length} venues`);

    // Get existing venue images
    const existingImages = await VenueImage.find({});
    const existingVenueIds = existingImages.map(img => img.venueId.toString());
    console.log(`Found ${existingImages.length} existing images for ${existingVenueIds.length} venues`);

    // Add images for venues that don't have them
    const newImages = [];
    for (let i = 0; i < venues.length; i++) {
      const venue = venues[i];
      if (!existingVenueIds.includes(venue._id.toString())) {
        newImages.push({
          venueId: venue._id,
          imageUrl: courtImages[i % courtImages.length],
          isPrimary: true,
        });
      }
    }

    if (newImages.length > 0) {
      await VenueImage.insertMany(newImages);
      console.log(`Added ${newImages.length} images for venues without images`);
    } else {
      console.log('All venues already have images');
    }

    console.log('Done!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

seedImages();
