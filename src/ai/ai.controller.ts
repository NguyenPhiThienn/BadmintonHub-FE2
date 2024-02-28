import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { ApiResponseType } from '../utils/response.util';
import { JwtGuard } from '../auth/jwt-auth.guard';

@ApiTags('AI Integration Module (Tích hợp AI)')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @ApiOperation({ summary: 'AI gợi ý sân phù hợp' })
  @ApiResponse({ status: 200, description: 'Lấy gợi ý thành công' })
  @Post('recommendations')
  async getRecommendations(@Body() data: any): Promise<ApiResponseType> {
    return await this.aiService.getRecommendations(data);
  }

  @ApiOperation({ summary: 'Phân tích và dự đoán khung giờ cao điểm' })
  @ApiResponse({ status: 200, description: 'Lấy phân tích thành công' })
  @Get('analytics/demand')
  async getDemandAnalytics(@Query('venueId') venueId: string): Promise<ApiResponseType> {
    return await this.aiService.getDemandAnalytics(venueId);
  }

  @ApiOperation({ summary: 'Gợi ý ngày và giờ đặt sân tối ưu' })
  @ApiResponse({ status: 200, description: 'Lấy gợi ý thành công' })
  @Get('booking-recommendation')
  async getBookingRecommendation(@Query('venueId') venueId: string): Promise<ApiResponseType> {
    return await this.aiService.getBookingRecommendation(venueId);
  }

  @ApiOperation({ summary: 'Chatbot hỗ trợ trả lời câu hỏi tự động' })
  @ApiResponse({ status: 200, description: 'Phản hồi thành công' })
  @Post('chatbot')
  async chatbot(@Body('message') message: string): Promise<ApiResponseType> {
    return await this.aiService.chatbot(message);
  }

  @ApiOperation({ summary: 'AI Chatbot hỗ trợ hội thoại thời gian thực' })
  @ApiResponse({ status: 200, description: 'Phản hồi thành công' })
  @Post('chat')
  async chat(
    @Body('message') message: string,
    @Body('history') history?: { role: 'user' | 'assistant'; content: string }[],
  ): Promise<ApiResponseType> {
    return await this.aiService.chat(message, history);
  }
}
