import { Module, Global } from '@nestjs/common';
import { AppGateway } from './app.gateway';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/schemas/user.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [AppGateway],
  exports: [AppGateway],
})
export class GatewayModule {}
