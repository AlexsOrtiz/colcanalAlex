import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: 1 })
  userId: number;

  @ApiProperty({ example: 'admin@canalco.com' })
  email: string;

  @ApiProperty({ example: 'Administrador General' })
  nombre: string;

  @ApiProperty({ example: 'Administrador del Sistema' })
  cargo: string;

  @ApiProperty({ example: 1 })
  rolId: number;

  @ApiProperty({ example: 'Administrador' })
  nombreRol: string;
}

export class LoginResponseDto {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoiYWRtaW5AY2FuYWxjby5jb20iLCJpYXQiOjE3NjIzMTEwMjAsImV4cCI6MTc2MjMxNDYyMH0.7FQLE4qVQoAGgmsiW0kzzbG3P6LVT5Zd9iJrehi1ohc',
    description: 'JWT access token (expires in 1 hour)',
  })
  accessToken: string;

  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoiYWRtaW5AY2FuYWxjby5jb20iLCJpYXQiOjE3NjIzMTEwMjAsImV4cCI6MTc2MjkxNTgyMH0.iW4VdqdCqO6Wccp4esSDtimQNyGHSOAG7BOYy5aWEQQ',
    description: 'JWT refresh token (expires in 7 days)',
  })
  refreshToken: string;

  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;
}
