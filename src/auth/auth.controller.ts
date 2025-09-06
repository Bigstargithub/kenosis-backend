import { Body, Controller, Patch, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

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
  postAuthLogin(@Body() body) {
    const email = body.email;
    const password = body.password;
    return this.authService.postAuthLogin(email, password);
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
  postAuthRefreshToken(@Body() body) {
    const refreshToken = body.refresh_token;
    return this.authService.postAuthRefreshToken(refreshToken);
  }
}
