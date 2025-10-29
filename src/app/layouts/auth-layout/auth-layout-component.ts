import { Component } from '@angular/core';
import { LoginComponent } from "../../features/auth/login/login-component";

@Component({
  selector: 'app-auth-layout-component',
  imports: [LoginComponent],
  templateUrl: './auth-layout-component.html',
  styleUrl: './auth-layout-component.css'
})
export class AuthLayoutComponent {

}
