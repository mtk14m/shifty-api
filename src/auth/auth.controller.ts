/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Post, UseGuards, Request} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth-guard';
import { RequestWithUser } from './jwt.strategy';
import { UserService } from 'src/user/user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LogInUserDto } from './dto/login-user.dto';


@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService, 
                private readonly userService: UserService
    ){}
    //user login 
    @Post('login')
    async login(@Body() authBody: LogInUserDto){
        return this.authService.login(authBody)
    } 

    @Post('register')
    async register(@Body() authBody: CreateUserDto){
        return this.authService.register(authBody)
    } 

    //on veutt utiliser la strategy-jwt
    @UseGuards(JwtAuthGuard)
    @Get()
    async authentificateUser(@Request() request: RequestWithUser){
        return await this.userService.getUser(request.user);
    }


}
