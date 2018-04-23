import { Directive, forwardRef } from '@angular/core';
import { NG_VALIDATORS, Validator, AbstractControl, ValidatorFn, Validators, FormControl, ValidationErrors } from '@angular/forms';
import { rutValidate } from 'rut-helpers';

function isPresent(obj: any): boolean {
  return obj !== undefined && obj !== null;
}

const validateRutFactory: ValidatorFn = (control: AbstractControl): {[key: string]: boolean} => {
  if (isPresent(Validators.required(control))) return null;
  
  let v: string = control.value;
  return rutValidate(v) ? null : { validateRut: true };
}

const RUT_VALIDATOR: any = { 
  provide: NG_VALIDATORS, 
  useExisting: forwardRef(() => RutValidator), 
  multi: true 
};

@Directive({
  selector: '[validateRut][formControlName],[validateRut][formControl],[validateRut][ngModel]',  
  providers: [RUT_VALIDATOR],
})
export class RutValidator implements Validator {
  validate(c: AbstractControl): {[key: string]: any} {
  //validate(c: FormControl): ValidationErrors | null {
    return validateRutFactory(c);
  }

  static check() : ValidatorFn {
    return (c: AbstractControl): { [key: string]: boolean } | null => {
      let v: string = c.value;
      return rutValidate(v) ? null : { validateRut: true };
    };
  }
}
