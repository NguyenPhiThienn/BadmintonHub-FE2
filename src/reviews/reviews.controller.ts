import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto, ReplyReviewDto } from './dto/review.dto';
import { ApiResponseType } from '../utils/response.util';
import { JwtGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/decorators/auth.decorators';

@ApiTags('Review Module (Đánh giá sân)')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @ApiOperation({ summary: 'Người chơi gửi đánh giá, chấm điểm sau khi thuê sân' })
  @ApiResponse({ status: 201, description: 'Gửi đánh giá thành công' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtGuard)
  @Post()
  async create(@Req() req: any, @Body() dto: CreateReviewDto): Promise<ApiResponseType> {
    return await this.reviewsService.create(req.user.id, dto);
  }

  @ApiOperation({ summary: 'Lấy danh sách đánh giá của cơ sở' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  @Public()
  @Get('venue/:venueId')
  async findByVenue(@Param('venueId') venueId: string): Promise<ApiResponseType> {
    return await this.reviewsService.findByVenue(venueId);
  }

  @ApiOperation({ summary: 'Thích / Bỏ thích đánh giá' })
  @ApiResponse({ status: 200, description: 'Cập nhật lượt thích thành công' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtGuard)
  @Post(':id/like')
  async toggleLike(@Req() req: any, @Param('id') id: string): Promise<ApiResponseType> {
    return await this.reviewsService.toggleLike(req.user.id, id);
  }

  @ApiOperation({ summary: 'Chủ sân phản hồi đánh giá' })
  @ApiResponse({ status: 200, description: 'Phản hồi thành công' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtGuard)
  @Post(':id/reply')
  async reply(@Req() req: any, @Param('id') id: string, @Body() dto: ReplyReviewDto): Promise<ApiResponseType> {
    return await this.reviewsService.reply(req.user.id, id, dto.reply);
  }
}
