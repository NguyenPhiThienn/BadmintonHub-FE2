import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OwnerRequestsController } from './owner-requests.controller';
import { OwnerRequestsService } from './owner-requests.service';
import { OwnerRequest, OwnerRequestSchema } from './schemas/owner-request.schema';
import { UsersModule } from '../users/users.module';
import { VenuesModule } from '../venues/venues.module';
import { GatewayModule } from '../gateways/gateways.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: OwnerRequest.name, schema: OwnerRequestSchema }]),
    UsersModule,
    VenuesModule,
    GatewayModule,
  ],
  controllers: [OwnerRequestsController],
  providers: [OwnerRequestsService],
  exports: [OwnerRequestsService],
})
export class OwnerRequestsModule {}
