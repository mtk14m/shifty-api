/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
    
    getUsers(){
        return [
            {
                id:1, 
                username: 'Minou'
            },
        ]
    }
};
