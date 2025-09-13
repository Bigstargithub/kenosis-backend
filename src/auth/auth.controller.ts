import { Body, Controller, Patch, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/code')
  postAuthCode(@Body() body) {
    const email = body.email;
    return this.authService.postAuthCode(email);
  }

  @Patch('/code')
  patchAuthCode(@Body() body) {
    const authCode = body.auth_code;
    const email = body.email;
    return this.authService.patchAuthCode(email, authCode);
  }

  @Post('/login')
  async postAuthLogin(@Body() body, @Res({ passthrough: true }) res: Response) {
    const email = body.email;
    const password = body.password;
    const response: { status: number; message: string; token?: string; refreshToken?: string } = await this.authService.postAuthLogin(email, password);
    if (!response.token || !response.refreshToken) {
      return response;
    }
    res.cookie('refreshToken', response.refreshToken, { 
      httpOnly: true, 
      maxAge: 1000 * 60 * 60 * 24 * 31, 
      sameSite: 'lax',
      path: '/',
      domain: 'localhost', // 명시적으로 도메인 설정
    });
    return { status: response.status, message: response.message, accessToken: response.token };
  }

  @Post('/signup')
  postAuthSignup(@Body() body) {
    const email = body.email;
    const password = body.password;
    const name = body.name;
    const phone = body.phone;
    return this.authService.postAuthSignup({ email, password, name, phone });
  }

  @Post('/refreshToken')
  postAuthRefreshToken(@Req() req: Request) {
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      return { status: 401, message: 'Refresh token not found' };
    }
    
    return this.authService.postAuthRefreshToken(refreshToken);
  }
}
