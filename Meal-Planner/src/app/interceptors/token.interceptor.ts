import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, catchError, switchMap, throwError } from 'rxjs';
import { LoginService } from '../service/login.service';
import { Router } from '@angular/router';
import { TokenModel } from '../models/token.model';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(private auth: LoginService, private router: Router) {}

  // send token with every request
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const myToken = this.auth.getToken();

    if(myToken){
      request = request.clone({
        setHeaders: {Authorization:`Bearer ${myToken}`}
      })
    }
    return next.handle(request).pipe(
      catchError((err: any) => {
        if(err instanceof HttpErrorResponse){

          //this gets error status 0 instate of 401 or other status code for some reason
          console.log(err.status + " something went wrong ");
          if(err.status === 401){
            console.log("401 error");
            // this.auth.signOut();
            // this.router.navigate(['login']);
            return this.handleUnAuthError(request, next);
            
          }
        }
        return throwError(() => new Error("Something went wrong new error"));
      })
    );
  }

  handleUnAuthError(req: HttpRequest<any>, next: HttpHandler){
    let tokenModel = new TokenModel();
    tokenModel.accessToken = this.auth.getToken()!;
    tokenModel.refreshToken = this.auth.getRefreshToken()!;

    return this.auth.renewToken(tokenModel)
    .pipe(
      switchMap((data: TokenModel) =>{
      this.auth.storeRefreshToken(data.refreshToken);
      this.auth.storeToken(data.accessToken);
      req = req.clone({
        setHeaders: {Authorization:`Bearer ${data.accessToken}`}
      })
      return next.handle(req);
    }),
    catchError((err) =>{
      return throwError(() => {
         this.auth.signOut();
         this.router.navigate(['login']);
        });
      })
    )
  }
}
