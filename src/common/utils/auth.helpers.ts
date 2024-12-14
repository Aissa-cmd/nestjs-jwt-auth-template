import * as argon from 'argon2';
import * as ms from 'ms';

export class AuthHelpers {
  static async hashUserPassword(plainTextPassword: string) {
    return await argon.hash(plainTextPassword, {
      // secret: '', // NOTE: we can also add a secret here and a salt
    });
  }

  static async verifyUserPasswordHash(
    hashedPassword: string,
    plainTextPassword: string,
  ) {
    return await argon.verify(hashedPassword, plainTextPassword);
  }

  static getExpDate(msDuration: string) {
    const milliseconds = ms(msDuration);
    return new Date(Date.now() + milliseconds);
  }
}
