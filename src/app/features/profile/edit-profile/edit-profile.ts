import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProfileService } from '../services/profile.service';
import type { UserProfile } from '../models/profile.models';

@Component({
  selector: 'app-edit-profile',
  imports: [ReactiveFormsModule],
  templateUrl: './edit-profile.html',
  styleUrl: './edit-profile.css',
})
export class EditProfile implements OnInit {
  form!: FormGroup;
  profile = signal<UserProfile | null>(null);
  loading = signal(true);
  saving = signal(false);

  constructor(
    private readonly fb: FormBuilder,
    private readonly profileService: ProfileService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(100)]],
      email: [{ value: '', disabled: true }],
    });

    this.profileService.getProfile().subscribe((profile) => {
      this.profile.set(profile);
      this.loading.set(false);
      this.form.patchValue({
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
      });
    });
  }

  onSubmit(): void {
    if (this.form.invalid || this.saving()) return;

    this.saving.set(true);
    const { firstName, lastName } = this.form.value;
    const email = this.profile()?.email ?? '';

    this.profileService.updateProfile({ firstName, lastName, email }).subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/profile']);
      },
      error: () => {
        this.saving.set(false);
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/profile']);
  }

  hasError(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }
}
