import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import { AuthLoginDto } from './dto/auth-login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  private tokenBlacklist: Set<string> = new Set();
  
  constructor(
    private usuarioService: UsuariosService,
    private jwtService: JwtService,
  ) {}

  async login(authLoginDto: AuthLoginDto): Promise<any> {
    const { usuario, clave } = authLoginDto;
    const usuarioOk = await this.usuarioService.validate(usuario, clave);

    if (!usuarioOk) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { sub: usuarioOk.id };
    const access_token = await this.getAccessToken(payload);

    return { ...usuarioOk, access_token };
  }

  async getAccessToken(payload) {
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_TOKEN,
      expiresIn: process.env.JWT_TOKEN_EXPIRATION,
    });
  }

  async verifyPayload(payload: JwtPayload): Promise<Usuario> {
    const usuario = await this.usuarioService.findOne(payload.sub);
    if (!usuario) {
      throw new UnauthorizedException(`Usuario inválido: ${payload.sub}`);
    }
    return usuario;
  }

  async logout(token: string): Promise<void> {
    if (token) {
      this.tokenBlacklist.add(token);
    }
  }

  isTokenBlacklisted(token: string): boolean {
    return this.tokenBlacklist.has(token);
  }

  async changePassword(userId: number, { oldPassword, newPassword }: ChangePasswordDto) {
    const user = await this.usuarioService.findOne(userId);
    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.clave);
    if (!isPasswordValid) {
      throw new BadRequestException('La contraseña actual no es válida');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await this.usuarioService.updatePassword(userId, hashedNewPassword);

    return { message: 'Contraseña actualizada exitosamente' };
  }
}
