import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './exception-filter/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './utils/transform.interceptor';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  // Tắt các LOG mặc định của NestJS, chỉ hiển thị error và warning
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'],
  });

  // Enable WebSocket adapter
  app.useWebSocketAdapter(new IoAdapter(app));

  // Enable trust proxy for production deployments (Nginx, Cloudflare, etc.)
  (app.getHttpAdapter().getInstance() as any).set('trust proxy', 1);

  // Increase body parser limits for large file uploads
  const express = require('express');
  app.use(express.json({ limit: '100mb' }));
  app.use(express.urlencoded({ limit: '100mb', extended: true }));

  app.setGlobalPrefix('api/v1');
  app.useGlobalFilters(new HttpExceptionFilter());

  // Add global response transformer
  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(new TransformInterceptor(reflector));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With, Origin, X-Api-Version',
    optionsSuccessStatus: 200,
  });

  const config = new DocumentBuilder()
    .setTitle('BadmintonHub-BE')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        in: 'header',
      },
      'access-token',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 5000;
  await app.listen(port);

  // Hiển thị thông tin quan trọng
  console.log('\n========================================');
  console.log('🚀 BadmintonHub-BE');
  console.log('========================================');
  console.log(`✅ MongoDB: Đã kết nối thành công`);
  console.log(`🌐 Server: http://localhost:${port}`);
  console.log(`📚 API Docs: http://localhost:${port}/docs`);
  console.log('========================================\n');
}
bootstrap();
