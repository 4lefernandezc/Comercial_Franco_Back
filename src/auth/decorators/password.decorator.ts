import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { ChangePasswordDto } from '../dto/change-password.dto';

@ValidatorConstraint({ name: 'PasswordsNotEqual', async: false })
export class PasswordsNotEqualConstraint implements ValidatorConstraintInterface {
  validate(newPassword: string, args: ValidationArguments) {
    const { oldPassword } = args.object as ChangePasswordDto;
    return newPassword !== oldPassword;
  }

  defaultMessage(args: ValidationArguments) {
    return 'La nueva contraseña no puede ser igual a la contraseña actual.';
  }
}