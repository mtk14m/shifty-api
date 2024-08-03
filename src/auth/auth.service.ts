/* eslint-disable prettier/prettier */
import { Injectable, UnauthorizedException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
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

  // Méthode pour la connexion de l'utilisateur
  async login(authBody: LogInUserDto) {
    try {
      const { email, password } = authBody;

      // Vérifie que l'email et le mot de passe sont fournis
      if (!email || !password) {
        throw new BadRequestException('Veuillez fournir toutes les informations demandées.');
      }

      // Recherche l'utilisateur par email
      const user = await this.prisma.user.findUnique({
        where: {
          email: email,
        },
      });

      // Vérifie si l'utilisateur existe
      if (!user) {
        throw new UnauthorizedException("L'utilisateur n'existe pas.");
      }

      // Compare le mot de passe fourni avec le mot de passe stocké
      const isPasswordCorrect = await compare(password, user.passwordDigest);

      // Vérifie si le mot de passe est correct
      if (!isPasswordCorrect) {
        throw new UnauthorizedException('Le mot de passe est invalide.');
      }

      // Authentifie l'utilisateur et génère un token JWT
      return this.authenticateUser({ userId: user.id });
    } catch (error) {
      // Capture les exceptions spécifiques et les relance
      if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
        throw error;
      }
      // Pour les erreurs inconnues, renvoie une erreur serveur interne
      throw new InternalServerErrorException('Une erreur est survenue lors de la connexion.');
    }
  }

  // Méthode pour l'inscription d'un nouvel utilisateur
  async register(authBody: CreateUserDto) {
    try {
      const { email, password } = authBody;

      // Vérifie que l'email et le mot de passe sont fournis
      if (!email || !password) {
        throw new BadRequestException('Veuillez fournir toutes les informations demandées.');
      }

      // Vérifie si un utilisateur avec cet email existe déjà
      const existingUser = await this.prisma.user.findUnique({
        where: {
          email: email,
        },
      });

      if (existingUser) {
        throw new BadRequestException('Un utilisateur existe déjà avec cet email.');
      }

      // Hash le mot de passe avant de le stocker
      const hashedPassword = await this.hashPassword(password);

      // Crée une nouvelle souscription pour l'utilisateur
      const newSubscriptionId = await this.createSubscription();

      // Crée un profil pour le nouvel utilisateur
      const newProfileId = await this.createProfile(email);

      // Crée un nouvel utilisateur dans la base de données avec un profil associé
      const newUser = await this.prisma.user.create({
        data: {
          email: email,
          passwordDigest: hashedPassword,
          subscriptionId: newSubscriptionId,
          profileId: newProfileId,
        },
      });

      // Authentifie le nouvel utilisateur et génère un token JWT
      return this.authenticateUser({ userId: newUser.id });
    } catch (error) {
      // Capture les exceptions spécifiques et les relance
      if (error instanceof BadRequestException) {
        throw error;
      }
      // Pour les erreurs inconnues, renvoie une erreur serveur interne
      throw new InternalServerErrorException('Une erreur est survenue lors de l\'inscription.');
    }
  }

  // Méthode pour hasher le mot de passe
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await hash(password, saltRounds);
  }

  // Méthode pour authentifier l'utilisateur et générer un token JWT
  private authenticateUser({ userId }: UserPayload) {
    const payload = { userId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  // Méthode pour créer une souscription par défaut pour un nouvel utilisateur
  private async createSubscription() {
    const newSubscription = await this.prisma.subscription.create({
      data: {
        type: 'FREE',
      },
    });
    return newSubscription.id;
  }

  // Méthode pour créer un profil pour un nouvel utilisateur et retourner son ID
  private async createProfile(name: string) {
    const newProfile = await this.prisma.profile.create({
      data: {
        name: name,
      },
    });
    return newProfile.id;
  }
}
