/* eslint-disable prettier/prettier */
import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { hash, compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserPayload } from './jwt.strategy';
import { LogInUserDto } from './dto/login-user.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(authBody: LogInUserDto) {
    const { email, password } = authBody;

    if (!email || !password) {
      throw new BadRequestException("Veuillez à bien fournir toutes les informations demandées");
    }

    const user = await this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      throw new UnauthorizedException("L'utilisateur n'existe pas.");
    }

    const isPasswordCorrect = await compare(password, user.passwordDigest);

    if (!isPasswordCorrect) {
      throw new UnauthorizedException('Le mot de passe est invalide.');
    }
    console.log(user)
    return this.authenticateUser({ userId: user.id });
  }


  async register(authBody: CreateUserDto) {
    const { email, password } = authBody;

    if (!email || !password) {
      throw new BadRequestException("Veuillez à bien fournir toutes les informations demandées");
    }

    const existingUser = await this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (existingUser) {
      throw new UnauthorizedException("Un utilisateur existe déjà avec cet email");
    }

    const hashedPassword = await this.hashPassword(password);

    //On va creer une subscription pour notre user
    const newSubscriptionId = await this.createSubscription()
    const newUser = await this.prisma.user.create({
      data: {
        email: email,
        passwordDigest: hashedPassword,
        subscriptionId: newSubscriptionId
      },
    });

    return this.authenticateUser({ userId: newUser.id });
  }



  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    const hashedPassword = await hash(password, saltRounds);
    return hashedPassword;
  }

  private authenticateUser({ userId }: UserPayload) {
    const payload = { userId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  private async createSubscription(){
        const newSubscription = await this.prisma.subscription.create({
          data:{
            type: 'FREE'
          }
        })
        return newSubscription.id;
  }
}
