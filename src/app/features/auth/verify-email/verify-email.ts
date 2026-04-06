import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  OnDestroy,
  QueryList,
  ViewChildren,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import {
  verifyEmailBodySchema,
  verifyEmailResponseDataSchema,
  resendVerificationBodySchema,
  resendVerificationResponseDataSchema,
} from '../../../core/validation/auth.schemas';
import {
  parseHttpAuthError,
  mapZodIssuesToMessage,
} from '../../../core/validation/auth-error.utils';
import { appIcons } from '../../../shared/icons/font-awesome-icons';
import { Role } from '../../../core/models/user.model';

const DIGIT_COUNT = 6;
const RESEND_SECONDS = 60;

@Component({
  selector: 'app-verify-email',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, FontAwesomeModule],
  templateUrl: './verify-email.html',
  styleUrl: './verify-email.scss',
})
export class VerifyEmail implements AfterViewInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  @ViewChildren('digitInput') private readonly digitInputs!: QueryList<
    ElementRef<HTMLInputElement>
  >;

  readonly form = this.fb.nonNullable.group({
    digits: this.fb.array(
      Array.from({ length: DIGIT_COUNT }, () =>
        this.fb.control('', {
          validators: [Validators.maxLength(1), Validators.pattern(/^\d*$/)],
        }),
      ),
    ),
  });

  /** Email passed from the post-registration redirect as a query param. */
  readonly email: string | null = this.route.snapshot.queryParamMap.get('email');
  readonly accountType: string | null = this.route.snapshot.queryParamMap.get('accountType');
  readonly isSellerSignup = this.accountType === Role.SELLER;

  resendSecondsRemaining = RESEND_SECONDS;
  isSubmitting = false;
  isResending = false;
  errorMessage = '';
  infoMessage = '';
  readonly storefrontIcon = appIcons['storefront'];
  readonly errorIcon = appIcons['error'];
  readonly checkCircleIcon = appIcons['checkCircle'];
  readonly arrowRightIcon = appIcons['arrowRight'];
  readonly scheduleIcon = appIcons['schedule'];
  readonly refreshIcon = appIcons['refresh'];
  readonly verifiedUserIcon = appIcons['verifiedUser'];
  readonly lockIcon = appIcons['lock'];
  readonly shieldIcon = appIcons['shield'];

  private resendTimerId: ReturnType<typeof setInterval> | null = null;

  ngAfterViewInit(): void {
    this.startResendCountdown();
    if (!this.email) {
      this.setDigitsDisabled(true);
    }
    queueMicrotask(() => this.focusDigit(0));
  }

  ngOnDestroy(): void {
    this.clearResendTimer();
  }

  get digits(): FormArray {
    return this.form.controls.digits;
  }

  get canResend(): boolean {
    return this.resendSecondsRemaining <= 0;
  }

  get resendLabel(): string {
    const s = this.resendSecondsRemaining;
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${r.toString().padStart(2, '0')}`;
  }

  onDigitInput(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const raw = input.value.replace(/\D/g, '');
    const digit = raw.slice(-1);
    this.digits.at(index).setValue(digit);
    input.value = digit;
    if (digit && index < DIGIT_COUNT - 1) {
      this.focusDigit(index + 1);
    }

    const allFilled = this.digits.controls.every((c) => !!c.value);
    if (allFilled && !this.isSubmitting) {
      this.submit();
    }
  }

  onDigitKeydown(index: number, event: KeyboardEvent): void {
    if (event.key === 'Backspace') {
      const current = this.digits.at(index).value;
      if (!current && index > 0) {
        event.preventDefault();
        this.focusDigit(index - 1);
        this.digits.at(index - 1).setValue('');
        const prev = this.digitInputs.get(index - 1);
        if (prev) {
          prev.nativeElement.value = '';
        }
      }
    }
    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      this.focusDigit(index - 1);
    }
    if (event.key === 'ArrowRight' && index < DIGIT_COUNT - 1) {
      event.preventDefault();
      this.focusDigit(index + 1);
    }
  }

  onPaste(index: number, event: ClipboardEvent): void {
    if (index !== 0) {
      return;
    }
    event.preventDefault();
    const text = event.clipboardData?.getData('text')?.replace(/\D/g, '') ?? '';
    const chars = text.slice(0, DIGIT_COUNT).split('');
    for (let i = 0; i < DIGIT_COUNT; i++) {
      const ch = chars[i] ?? '';
      this.digits.at(i).setValue(ch);
      const el = this.digitInputs.get(i);
      if (el) {
        el.nativeElement.value = ch;
      }
    }
    this.focusDigit(Math.min(chars.length, DIGIT_COUNT - 1));

    const allFilled = this.digits.controls.every((c) => !!c.value);
    if (allFilled && !this.isSubmitting) {
      this.submit();
    }
  }

  submit(): void {
    if (this.isSubmitting) {
      return;
    }
    this.clearMessages();

    const code = this.digits.controls.map((c) => c.value).join('');
    const bodyResult = verifyEmailBodySchema.safeParse({ email: this.email, code });
    if (!bodyResult.success) {
      this.errorMessage = mapZodIssuesToMessage(bodyResult.error);
      return;
    }

    this.isSubmitting = true;
    this.setDigitsDisabled(true);
    this.api
      .post<unknown>('/auth/verify-email', bodyResult.data)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.isSubmitting = false;
          this.setDigitsDisabled(false);
        }),
      )
      .subscribe({
        next: (raw) => {
          const dataResult = verifyEmailResponseDataSchema.safeParse(raw);
          if (!dataResult.success) {
            this.errorMessage = 'Unexpected response from server. Please try again.';
            this.isSubmitting = false;
            return;
          }
          void this.router.navigateByUrl('/home');
        },
        error: (err: unknown) => {
          this.errorMessage = parseHttpAuthError(err);
          this.isSubmitting = false;
        },
      });
  }

  resendCode(): void {
    if (!this.canResend) {
      return;
    }
    this.clearMessages();

    const bodyResult = resendVerificationBodySchema.safeParse({ email: this.email });
    if (!bodyResult.success) {
      this.errorMessage = mapZodIssuesToMessage(bodyResult.error);
      return;
    }

    this.isResending = true;
    this.api
      .post<unknown>('/auth/resend-verification', bodyResult.data)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.isResending = false;
        }),
      )
      .subscribe({
        next: (raw) => {
          const dataResult = resendVerificationResponseDataSchema.safeParse(raw);
          if (!dataResult.success) {
            this.errorMessage = 'Unexpected response from server. Please try again.';
            this.isResending = false;
            return;
          }
          this.infoMessage = dataResult.data.message;
          this.resendSecondsRemaining = RESEND_SECONDS;
          this.startResendCountdown();
        },
        error: (err: unknown) => {
          this.errorMessage = parseHttpAuthError(err);
          this.isResending = false;
        },
      });
  }

  private clearMessages(): void {
    this.errorMessage = '';
    this.infoMessage = '';
  }

  private focusDigit(index: number): void {
    const el = this.digitInputs.get(index);
    if (el) {
      el.nativeElement.focus();
      el.nativeElement.select();
    }
  }

  private startResendCountdown(): void {
    this.clearResendTimer();
    this.resendTimerId = setInterval(() => {
      this.resendSecondsRemaining -= 1;
      if (this.resendSecondsRemaining <= 0) {
        this.resendSecondsRemaining = 0;
        this.clearResendTimer();
      }
      // This app runs in zoneless change detection mode, so timer updates won't
      // automatically trigger a re-render.
      this.changeDetectorRef.detectChanges();
    }, 1000);
  }

  private setDigitsDisabled(disabled: boolean): void {
    const method = disabled ? 'disable' : 'enable';
    this.digits.controls.forEach((c) => c[method]({ emitEvent: false }));
  }

  private clearResendTimer(): void {
    if (this.resendTimerId !== null) {
      clearInterval(this.resendTimerId);
      this.resendTimerId = null;
    }
  }
}
