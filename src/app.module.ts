import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthCodeEntity } from 'src/entities/authCode.entity';
import { UserEntity } from 'src/entities/user.entity';
import { ApplyEntity } from 'src/entities/apply.entity';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';
import { ApplyModule } from './apply/apply.module';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot(),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_NAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      },
      defaults: {
        from: '"No Reply" <noreply@joobok-kenosis.com',
      },
      template: {
        dir: join(__dirname, '..', 'src', 'auth', 'email'),
        adapter: new PugAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [AuthCodeEntity, UserEntity, ApplyEntity],
      synchronize: true,
    }),
    ApplyModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
