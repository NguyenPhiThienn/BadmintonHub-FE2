import { Controller, Get, Post, Body, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { ApiResponseType } from '../utils/response.util';
import { OptionalJwtGuard } from '../auth/optional-jwt.guard';
import { JwtGuard } from '../auth/jwt-auth.guard';

@ApiTags('AI Integration Module (Tích hợp AI & Chatbot)')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  /**
   * MAIN CHAT ENDPOINT - Hỗ trợ lưu lịch sử chat vào MongoDB
   * Khách vãng lai: Không cần token, truyền sessionId từ LocalStorage
   * Đã đăng nhập: Kèm JWT token, lịch sử được gắn với userId
   */
  @ApiOperation({
    summary: '💬 Chat AI có lưu lịch sử (Hỗ trợ cả vãng lai & đã đăng nhập)',
    description: `
Đây là endpoint CHÍNH cho chatbot.

**Demo cho Thầy (Postman):**
- Body: { "message": "Sân nào gần quận 1 giá rẻ?", "sessionId": "test-session-001" }
- Response sẽ trả về: reply của AI + sessionId + _debug_context (dữ liệu thực từ DB đã nhét vào cho AI)

**Luồng hoạt động:**
1. FE gửi message + sessionId (lấy từ localStorage hoặc tạo mới)
2. BE tìm/tạo session trong MongoDB
3. BE query DB lấy dữ liệu thực (sân đang hoạt động, lịch đặt của user)  
4. BE nhét dữ liệu thực vào System Prompt -> gửi lên Groq AI
5. Groq trả về câu trả lời thông minh dựa trên dữ liệu thực
6. BE lưu cả user message + AI reply vào MongoDB
7. Trả về FE
    `
  })
  @ApiResponse({ status: 200, description: 'AI phản hồi thành công' })
  @UseGuards(OptionalJwtGuard)
  @ApiBearerAuth('access-token')
  @Post('chat')
  async chatWithHistory(
    @Body('message') message: string,
    @Body('sessionId') sessionId?: string,
    @Req() req?: any,
  ): Promise<ApiResponseType> {
    // req.user được populate nếu gửi Bearer token hợp lệ, undefined nếu không
    const userId = req?.user?.id || undefined;
    return await this.aiService.chatWithHistory(message, sessionId, userId);
  }

  // Đặt TRƯỚC /chat/history để tránh conflict routing
  @ApiOperation({ summary: '📂 Lấy danh sách phiên chat của user (đã đăng nhập)' })
  @ApiResponse({ status: 200 })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtGuard)
  @Get('chat/sessions')
  async getSessions(
    @Req() req: any,
    @Query('limit') limit = 20,
    @Query('page') page = 1,
  ): Promise<ApiResponseType> {
    return await this.aiService.getSessions(req.user.id, +limit, +page);
  }

  @ApiOperation({ summary: '📋 Lấy lịch sử một phiên chat' })
  @ApiResponse({ status: 200 })
  @Get('chat/history')
  async getHistory(@Query('sessionId') sessionId: string): Promise<ApiResponseType> {
    return await this.aiService.getHistory(sessionId);
  }

  @ApiOperation({ summary: '🔚 Kết thúc phiên chat' })
  @ApiResponse({ status: 200 })
  @Post('chat/end')
  async endSession(@Body('sessionId') sessionId: string): Promise<ApiResponseType> {
    return await this.aiService.endSession(sessionId);
  }

  @ApiOperation({ summary: 'AI gợi ý sân phù hợp theo vị trí & sở thích' })
  @Post('recommendations')
  async getRecommendations(@Body() data: any): Promise<ApiResponseType> {
    return await this.aiService.getRecommendations(data);
  }

  @ApiOperation({ summary: 'Phân tích và dự đoán khung giờ cao điểm' })
  @Get('analytics/demand')
  async getDemandAnalytics(@Query('venueId') venueId: string): Promise<ApiResponseType> {
    return await this.aiService.getDemandAnalytics(venueId);
  }

  @ApiOperation({ summary: 'Gợi ý ngày và giờ đặt sân tối ưu' })
  @Get('booking-recommendation')
  async getBookingRecommendation(@Query('venueId') venueId: string): Promise<ApiResponseType> {
    return await this.aiService.getBookingRecommendation(venueId);
  }
}
