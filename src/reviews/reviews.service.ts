import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review, ReviewDocument } from './schemas/review.schema';
import { Venue, VenueDocument } from '../venues/schemas/venue.schema';
import { ApiResponseType, createApiResponse } from '../utils/response.util';
import { CreateReviewDto } from './dto/review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    @InjectModel(Venue.name) private venueModel: Model<VenueDocument>,
  ) { }

  async create(playerId: string, dto: CreateReviewDto): Promise<ApiResponseType> {
    const { venueId, rating, comment } = dto;

    if (!Types.ObjectId.isValid(venueId)) {
      throw new HttpException('ID cơ sở không hợp lệ', HttpStatus.BAD_REQUEST);
    }

    const venue = await this.venueModel.findById(venueId).exec();
    if (!venue) {
      throw new HttpException('Không tìm thấy cơ sở', HttpStatus.NOT_FOUND);
    }

    const newReview = await this.reviewModel.create({
      venueId: new Types.ObjectId(venueId),
      playerId: new Types.ObjectId(playerId),
      rating,
      comment,
    });

    // Update venue's average rating
    const allReviews = await this.reviewModel.find({ venueId: new Types.ObjectId(venueId) }).exec();
    const avgRating = allReviews.length > 0 
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length 
      : 0;

    await this.venueModel.findByIdAndUpdate(venueId, { averageRating: avgRating });

    return createApiResponse(newReview, 'Gửi đánh giá thành công', HttpStatus.CREATED);
  }

  async findByVenue(venueId: string): Promise<ApiResponseType> {
    if (!Types.ObjectId.isValid(venueId)) {
      throw new HttpException('ID cơ sở không hợp lệ', HttpStatus.BAD_REQUEST);
    }

    const reviews = await this.reviewModel.find({ venueId: new Types.ObjectId(venueId) })
      .populate('playerId', 'fullName avatarUrl')
      .sort({ createdAt: -1 })
      .exec();

    return createApiResponse(reviews, 'Lấy danh sách đánh giá thành công', HttpStatus.OK);
  }

  async toggleLike(playerId: string, reviewId: string): Promise<ApiResponseType> {
    if (!Types.ObjectId.isValid(reviewId)) {
      throw new HttpException('ID đánh giá không hợp lệ', HttpStatus.BAD_REQUEST);
    }

    const review = await this.reviewModel.findById(reviewId).exec();
    if (!review) {
      throw new HttpException('Không tìm thấy đánh giá', HttpStatus.NOT_FOUND);
    }

    const playerObjectId = new Types.ObjectId(playerId);
    const hasLiked = review.likes && review.likes.some(id => id.toString() === playerId);

    if (hasLiked) {
      review.likes = review.likes.filter(id => id.toString() !== playerId);
    } else {
      if (!review.likes) {
        review.likes = [];
      }
      review.likes.push(playerObjectId);
    }

    await review.save();
    return createApiResponse(review, hasLiked ? 'Bỏ thích thành công' : 'Thích thành công', HttpStatus.OK);
  }

  async reply(ownerId: string, reviewId: string, replyText: string): Promise<ApiResponseType> {
    if (!Types.ObjectId.isValid(reviewId)) {
      throw new HttpException('ID đánh giá không hợp lệ', HttpStatus.BAD_REQUEST);
    }

    const review = await this.reviewModel.findById(reviewId).exec();
    if (!review) {
      throw new HttpException('Không tìm thấy đánh giá', HttpStatus.NOT_FOUND);
    }

    const venue = await this.venueModel.findById(review.venueId).exec();
    if (!venue) {
      throw new HttpException('Không tìm thấy cơ sở', HttpStatus.NOT_FOUND);
    }

    if (venue.ownerId.toString() !== ownerId) {
      throw new HttpException('Bạn không có quyền phản hồi đánh giá này', HttpStatus.FORBIDDEN);
    }

    review.reply = replyText;
    review.repliedAt = new Date();
    await review.save();

    return createApiResponse(review, 'Phản hồi thành công', HttpStatus.OK);
  }
}
