import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AccountService } from '../_services/account.service';
import { TestUser, User } from '../_models/user';
import { take } from 'rxjs/operators';


@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private accountService: AccountService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    let currentUser: User | undefined;

    this.accountService.currentUser$
      .pipe(take(1))
      .subscribe((user) => (currentUser = user));

    if (currentUser) {
      const jsonWebToken: string = currentUser.token;

      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${jsonWebToken}`,
        },
      });
    }

    return next.handle(request);
  }
}
