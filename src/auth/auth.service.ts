import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthCodeEntity } from 'src/entities/authCode.entity';
import { Repository } from 'typeorm';
import { MailerService } from '@nestjs-modules/mailer';
import { UserEntity } from 'src/entities/user.entity';
import { comparePassword, CryptoService, hashPassword } from 'src/utils/auth';
import { TokenService } from 'src/utils/auth';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AuthCodeEntity)
    private authCodeEntity: Repository<AuthCodeEntity>,
    @InjectRepository(UserEntity)
    private readonly userEntity: Repository<UserEntity>,
    private readonly mailerService: MailerService,
    private readonly jwtService: JwtService,
  ) {}

  private readonly COOLDOWN_TIME_MS = 5 * 60 * 1000;

  async postAuthCode(email: string) {
    try {
      const recentAuthCode = await this.authCodeEntity.findOne({
        where: { email },
        order: { created_at: 'DESC' },
      });

      if (
        recentAuthCode &&
        Date.now() - recentAuthCode.created_at.getTime() < this.COOLDOWN_TIME_MS
      ) {
        const remainSecond = Math.ceil(
          this.COOLDOWN_TIME_MS -
            (Date.now() - recentAuthCode.created_at.getTime()),
        );
        return {
          status: 400,
          message: `이메일을 ${remainSecond} 후에 다시 전송하시기 바랍니다.`,
        };
      }

      const authCode = (Math.floor(Math.random() * 900000) + 100000).toString();
      const expiredAtDate = new Date();
      expiredAtDate.setDate(expiredAtDate.getDate() + 3);
      expiredAtDate.setHours(0, 0, 0, 0);

      await this.authCodeEntity.insert({
        email,
        auth_code: authCode,
        is_verify: 0,
        expired_at: expiredAtDate,
      });

      await this.mailerService.sendMail({
        to: email,
        from: 'kenosis.abbey@gmail.com',
        subject: `kenosis 수도원 인증 code입니다.`,
        template: './template',
        context: {
          verifyCode: authCode,
        },
      });
    } catch (error) {
      console.error(error);
      return { status: 500, message: '인증코드 이메일에 실패하였습니다.' };
    }

    return { status: 200, message: '인증코드 이메일에 성공하였습니다.' };
  }

  async patchAuthCode(email: string, auth_code: string) {
    const recentAuthCode = await this.authCodeEntity.findOne({
      where: { email },
      order: { created_at: 'DESC' },
    });

    if (!recentAuthCode)
      return {
        status: 400,
        message: '인증코드가 없습니다. 다시 시도 바랍니다.',
      };
    if (recentAuthCode.auth_code !== auth_code)
      return { status: 400, message: '인증코드가 다릅니다.' };

    await this.authCodeEntity.update(
      {
        id: recentAuthCode.id,
      },
      {
        is_verify: 1,
      },
    );

    return { status: 200, message: '인증에 성공하였습니다.' };
  }

  async postAuthLogin(email: string, password: string) {
    const user = await this.userEntity.findOne({ where: { email } });
    if (!user) return { status: 400, message: '사용자가 없습니다.' };

    const encryptedPassword = await comparePassword(password, user.password);
    if (!encryptedPassword)
      return { status: 400, message: '비밀번호가 다릅니다.' };

    const tokenService = new TokenService(this.jwtService);
    const token = tokenService.generateToken({
      id: user.id,
      email: user.email,
    });
    const refreshToken = tokenService.refreshToken({
      token,
    });

    return {
      status: 200,
      message: '로그인에 성공하였습니다.',
      token,
      refreshToken,
    };
  }

  async postAuthSignup({
    email,
    password,
    name,
    phone,
  }: {
    email: string;
    password: string;
    name: string;
    phone: string;
  }) {
    const user = await this.userEntity.findOne({ where: { email } });
    if (user) return { status: 400, message: '이미 존재하는 이메일입니다.' };

    const authCode = await this.authCodeEntity.findOne({
      where: { email, is_verify: 1 },
    });
    if (!authCode)
      return {
        status: 400,
        message: '인증코드가 없습니다. 다시 시도 바랍니다.',
      };

    const cryptoService = new CryptoService();
    const encryptedPassword = await hashPassword(password);
    const encryptedPhone = cryptoService.encrypt(phone);
    await this.userEntity.insert({
      email,
      password: encryptedPassword,
      name,
      phone: encryptedPhone,
    });

    return { status: 200, message: '회원가입에 성공하였습니다.' };
  }

  async postAuthRefreshToken(refreshToken: string) {
    try {
      const tokenService = new TokenService(this.jwtService);
      const token = tokenService.verifyToken(refreshToken);
      return { status: 200, message: '토큰 갱신에 성공하였습니다.', token };
    } catch (error) {
      console.error(error);
      return { status: 400, message: '토큰 갱신에 실패하였습니다.' };
    }
  }
}
