
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoginService } from '../service/login.service';
import { Router, RouterLink } from '@angular/router';
import { UserStoreService } from '../service/user-store.service';


@Component({
  selector: 'app-user-login',
  templateUrl: './user-login.component.html',
  styleUrls: ['./user-login.component.css']
})
export class UserLoginComponent implements OnInit{
  loginForm!: FormGroup;
  isLoading: boolean = false;

  constructor(
    private loginService: LoginService,
    private formBuilder: FormBuilder,
    private router: Router,
    private userStore: UserStoreService
  ){
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loginService.signOut();
  }

  onSubmit(): void{
    this.ToggleLoadingSpinner();
    if(this.loginForm.valid){
      const username = this.loginForm.value.username;
      const password = this.loginForm.value.password;

      this.loginService.sendLoginData(username, password).subscribe({
        next: (data: any) => {
          this.loginService.storeToken(data.accessToken);
          this.loginService.storeRefreshToken(data.refreshToken);
          const tokenPayload = this.loginService.decodeToken();
          this.userStore.setUserInStore(tokenPayload.unique_name);
          this.userStore.setIdInStore(tokenPayload.nameid);
          this.router.navigate([`/dashboard`])
        },
        error:(error) => {
          console.error("Http Error: ",error);
          this.loginForm.get('username')?.setErrors({incorrectLogin: true});
          this.loginForm.get('password')?.setErrors({incorrectLogin: true});
          this.ToggleLoadingSpinner();
        }
      })
    }
    this.loginForm.reset();


  }


  ToggleLoadingSpinner(){
    this.isLoading = !this.isLoading;

  }

}
