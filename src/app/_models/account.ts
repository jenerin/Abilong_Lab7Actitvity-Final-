import { Role } from './role';

export class Account {
    id?: string;
    title?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    acceptTerms?: boolean;
    role?: Role;
    verificationToken?: string;
    verified?: Date;
    resetToken?: string;
    resetTokenExpires?: Date;
    passwordReset?: Date;
    jwtToken?: string;
    isDeleting?: boolean;
    created?: Date;
    updated?: Date;
}
