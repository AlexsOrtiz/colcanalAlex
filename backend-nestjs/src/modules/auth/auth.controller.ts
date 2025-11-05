import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../database/entities/user.entity';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User login',
    description: `
    Login with corporate email and password.

    **Default credentials for testing:**
    - Email: admin@canalco.com
    - Password: admin123

    **Steps to use the API:**
    1. Call this endpoint to get your accessToken
    2. Copy the accessToken from the response
    3. Click the "Authorize" button at the top of this page
    4. Paste the token in the "Value" field (just the token, no "Bearer" prefix needed)
    5. Click "Authorize" and then "Close"
    6. Now you can test all protected endpoints like /auth/profile
    `,
  })
  @ApiResponse({
    status: 200,
    description:
      'Login successful. Use the accessToken to authorize other requests.',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid email domain or bad request',
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt-refresh'))
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Get a new access token using a valid refresh token',
  })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(
    @CurrentUser() user: User,
    @Body() refreshTokenDto: RefreshTokenDto,
  ) {
    return this.authService.refreshToken(user);
  }

  @Get('profile')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get current user profile',
    description: `
    Get the profile of the authenticated user.

    **How to test this endpoint:**
    1. First, call POST /auth/login to get your accessToken
    2. Click the "Authorize" button at the top right
    3. Paste your accessToken (without "Bearer" prefix)
    4. Click "Authorize" then "Close"
    5. Now click "Try it out" and "Execute" on this endpoint
    `,
  })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Token missing, invalid or expired',
  })
  async getProfile(@CurrentUser() user: User) {
    return this.authService.getProfile(user.userId);
  }
}
