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
  avatarPreview = signal<string | null>(null);

  constructor(
    private readonly fb: FormBuilder,
    private readonly profileService: ProfileService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      bio: [''],
    });

    this.profileService.getProfile().subscribe((profile) => {
      this.profile.set(profile);
      this.avatarPreview.set(profile.avatarUrl);
      this.loading.set(false);
      this.form.patchValue({
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phone: profile.phone ?? '',
        bio: profile.bio ?? '',
      });
    });
  }

  onAvatarChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => this.avatarPreview.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  onSubmit(): void {
    if (this.form.invalid || this.saving()) return;

    this.saving.set(true);
    const { firstName, lastName, email, phone, bio } = this.form.value;

    this.profileService
      .updateProfile({ firstName, lastName, email, phone: phone || null, bio: bio || null })
      .subscribe({
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
