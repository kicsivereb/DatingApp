import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AccountService } from '../_services/account.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  @Output() cancelRegister = new EventEmitter<boolean>();
  registerForm?: FormGroup;
  maxDate?: Date;
  validationErrors: string[] = [];

  constructor(
    private accountService: AccountService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.maxDate = new Date();
    this.maxDate.setFullYear(this.maxDate.getFullYear() - 18);
  }

  isUsernameInvalid(): boolean {
    if (this.registerForm) {
      const usernameControl = this.registerForm.get('username');
      if (usernameControl) {
        return usernameControl.invalid && usernameControl.touched;
      }
    }

    return false;
  }

  isPasswordInvalid(): boolean {
    if (this.registerForm) {
      const control = this.registerForm.get('password');
      if (control) {
        return control.invalid && control.touched;
      }
    }

    return false;
  }

  isConfirmPasswordInvalid(): boolean {
    if (this.registerForm) {
      const control = this.registerForm.get('confirmPassword');
      if (control) {
        return control.invalid && control.touched;
      }
    }

    return false;
  }

  isPasswordRequiredError(): boolean {
    if (this.registerForm) {
      const control = this.registerForm.get('password');
      if (control) {
        return control.hasError('required');
      }
    }

    return false;
  }
  isConfirmPasswordRequiredError(): boolean {
    if (this.registerForm) {
      const control = this.registerForm.get('confirmPassword');
      if (control) {
        return control.hasError('required');
      }
    }

    return false;
  }

  isConfirmPasswordMatchValueError(): boolean {
    if (this.registerForm) {
      const control = this.registerForm.get('confirmPassword');
      if (control) {
        return control.hasError('isNotMatching');
      }
    }

    return false;
  }

  isPasswordMinLengthError(): boolean {
    if (this.registerForm) {
      const control = this.registerForm.get('password');
      if (control) {
        return control.hasError('minlength');
      }
    }

    return false;
  }

  isPasswordMaxLengthError(): boolean {
    if (this.registerForm) {
      const control = this.registerForm.get('password');
      if (control) {
        return control.hasError('maxlength');
      }
    }

    return false;
  }

  initializeForm() {
    this.registerForm = this.fb.group({
      gender: ['male'],
      username: ['', Validators.required],
      knownAs: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      password: [
        '',
        [Validators.required, Validators.minLength(4), Validators.maxLength(8)],
      ],
      confirmPassword: [
        '',
        [Validators.required, this.matchValues('password')],
      ],
    });
    this.registerForm.controls.password.valueChanges.subscribe(() => {
      this.registerForm?.controls.confirmPassword.updateValueAndValidity();
    });
  }
  matchValues(matchTo: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const matchToControl = control.parent?.get(matchTo);
      return control.value === matchToControl?.value
        ? null
        : { isNotMatching: true };
    };
  }

  register() {
    if (this.registerForm) {
      this.accountService.register(this.registerForm.value).subscribe(
        () => {
          this.router.navigateByUrl('/members');
        },
        (errors: string[]) => {
          this.validationErrors = errors;
        }
      );
    }
  }

  cancel() {
    this.cancelRegister.emit(false);
  }

  getFormControl(formControlName: string): FormControl {
    return this.registerForm?.get(formControlName) as FormControl;
  }
}
