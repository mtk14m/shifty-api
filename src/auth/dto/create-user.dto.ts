/* eslint-disable prettier/prettier */
import { IsEmail, IsNotEmpty, MinLength, Matches } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, {
    message: "Vous devez fournir une adresse email valide."
  })
  email: string;

  @IsNotEmpty({
    message: "Le mot de passe ne peut pas être vide."
  })
  @MinLength(8, {
    message: "Le mot de passe doit contenir au moins 8 caractères."
  })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!+/%*?&])[A-Za-z\d@$!+/%*?&]{8,}$/, {
    message: "Le mot de passe doit contenir au moins une lettre majuscule, une lettre minuscule, un chiffre et un caractère spécial."
  })
  password: string;
}