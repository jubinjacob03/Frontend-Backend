import { Component, Inject, Optional } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css']
})
export class UserFormComponent {
  userForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email])
  });

  isEditMode = false;
  currentUserId?: string;

  constructor(
    private userService: UserService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<UserFormComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: { user: User }
  ) {
    if (data?.user) {
      this.isEditMode = true;
      this.currentUserId = data.user._id;
      this.userForm.patchValue({
        name: data.user.name,
        email: data.user.email
      });
    }
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      const userData = this.userForm.value;
      const operation$ = this.isEditMode 
        ? this.userService.updateUser(this.currentUserId!, userData)
        : this.userService.createUser(userData);

      operation$.subscribe({
        next: () => {
          const message = this.isEditMode 
            ? 'User updated successfully' 
            : 'User created successfully';
          this.snackBar.open(message, 'Close', { 
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.snackBar.open(err.error.message || 'Operation failed', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }
}