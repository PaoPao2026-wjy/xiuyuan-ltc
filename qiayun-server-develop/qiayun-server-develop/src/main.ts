import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger, HttpException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter'; // 引入全局异常过滤器
import * as express from 'express';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

    // 调整 JSON/表单请求体限制
  app.use(
  express.json({ limit: '100mb' }), // JSON 请求体最大 100MB
  express.urlencoded({ limit: '100mb', extended: true }), // 表单请求体最大 100MB
  );
  
  // 全局异常过滤器（捕获所有未处理的错误）
  app.useGlobalFilters(new AllExceptionsFilter());
  
  // 全局验证管道
  app.useGlobalPipes(new ValidationPipe({ 
    transform: true,
    exceptionFactory: (errors) => {
      // 提取所有错误信息，拼接为字符串
     const firstError = errors[0];
      // 取该错误的第一个约束信息（如 @MinLength、@Matches 等的 message）
      const firstMessage = Object.values(firstError.constraints || {})[0] || '参数验证失败';
      // 返回包含单个字符串消息的 400 异常
      return new BadRequestException(firstMessage);
    },
   }));

  // CORS 配置
//  app.enableCors({
//     origin: true, // 允许所有 origin
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
//     allowedHeaders: [
//       'Origin',
//       'Content-Type',
//       'Accept',
//       'Authorization',
//       'X-Requested-With',
//       'x-access-token',
//     ],
//   });

  // CORS 配置
   // 从配置文件读取允许的域名列表
  const allowedOrigins = (configService.get<string>('ALLOWED_ORIGINS') || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  // 动态 CORS 配置
  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow: boolean) => void) => {
      // 允许“无 Origin”的请求（如 Postman 测试）
      if (!origin) {
        callback(null, true);
        return;
      }

      // 检查是否在允许列表中
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      // 其他 origin 拒绝
      callback(new HttpException('CORS 不允许该域名', 403), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token'],
  });

  // API 前缀
  app.setGlobalPrefix('api/v1');

  const port = configService.get('port') || 3000;
  await app.listen(port);
  
  logger.log(`Application is running on: http://localhost:${port}`);
}

// 捕获未处理的 Promise 拒绝
process.on('unhandledRejection', (reason: Error, promise: Promise<any>) => {
  const logger = new Logger('UnhandledRejection');
  logger.error('Unhandled Rejection at:', promise);
  logger.error('Reason:', reason);
  logger.error('Stack:', reason.stack);
  // 不退出进程，让应用继续运行
});

// 捕获未捕获的异常
process.on('uncaughtException', (error: Error) => {
  const logger = new Logger('UncaughtException');
  logger.error('Uncaught Exception:', error.message);
  logger.error('Stack:', error.stack);
  // 不退出进程，让应用继续运行
});

bootstrap();
