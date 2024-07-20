/* eslint-disable prettier/prettier */
import { IsEmail, IsNotEmpty} from 'class-validator';

export class LogInUserDto {
  @IsEmail({}, {
    message: "Vous devez fournir une adresse email valide."
  })
  email: string;

  @IsNotEmpty({
    message: "Le mot de passe ne peut pas être vide."
  })
  password: string;
}