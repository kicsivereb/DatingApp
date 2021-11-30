import {
  HttpClient,
  HttpHeaders,
  HttpParams,
  HttpResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, pipe } from 'rxjs';
import { find, map, reduce, take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Member } from '../_models/member';
import { PaginatedResult } from '../_models/pagination';
import { User } from '../_models/user';
import { UserParams } from '../_models/userParams';
import { AccountService } from './account.service';

@Injectable({
  providedIn: 'root',
})
export class MembersService {
  baseUrl = environment.apiUrl;
  members: Member[] = [];
  memberCache = new Map();
  user?: User;
  userParams?: UserParams;

  constructor(
    private http: HttpClient,
    private accountService: AccountService
  ) {
    this.accountService.currentUser$.pipe(take(1)).subscribe((user) => {
      this.user = user;
      if (user) {
        this.userParams = new UserParams(user);
      }
    });
  }

  getUserParams(): UserParams | undefined {
    return this.userParams;
  }

  setUserParams(params: UserParams | undefined) {
    this.userParams = params;
  }

  resetUserParams(): UserParams | undefined{
    if (this.user) {
      this.userParams = new UserParams(this.user);
    }
    return this.userParams;
  }

  getMembers(userParams: UserParams): Observable<PaginatedResult<Member[]>> {
    var response = this.memberCache.get(Object.values(userParams).join('-'));
    if (response) {
      return of(response);
    }

    let params: HttpParams = this.getPaginationQueryParams(
      userParams.pageNumber,
      userParams.pageSize
    );

    params = params.append('minAge', userParams.minAge.toString());
    params = params.append('maxAge', userParams.maxAge.toString());
    params = params.append('gender', userParams.gender);
    params = params.append('orderBy', userParams.orderBy);

    return this.getPaginatedResult<Member[]>(
      this.baseUrl + 'users',
      params
    ).pipe(
      map((response) => {
        this.memberCache.set(Object.values(userParams).join('-'), response);
        return response;
      })
    );
  }

  private getPaginatedResult<T>(
    url: string,
    queryParams: HttpParams
  ): Observable<PaginatedResult<T>> {
    const requestObservable: Observable<HttpResponse<T>> = this.http.get<T>(
      url,
      { observe: 'response', params: queryParams }
    );

    return requestObservable.pipe(
      map((response: HttpResponse<T>): PaginatedResult<T> => {
        const paginatedResult: PaginatedResult<T> = new PaginatedResult<T>();

        paginatedResult.result = response.body;

        const pagination = response.headers.get('pagination');

        if (pagination) {
          paginatedResult.pagination = JSON.parse(pagination);
        }
        return paginatedResult;
      })
    );
  }

  getMember(username: string): Observable<Member> {
    // const values: any[] = [...this.memberCache.values()];

    // const arr: any[] = [];
    // for (let i = 0; i < values.length; i++) {
    //   const elem: any = values[i];
    //   const anotherArr: any[] = elem.result;
    //   arr.concat(anotherArr);
    // }

    // const member = arr;

    const member = [...this.memberCache.values()]
      .reduce((arr, elem) => arr.concat(elem.result), [])
      .find((member: Member) => member.username === username);

    if (member) {
      return of(member);
    }

    return this.http.get<Member>(this.baseUrl + 'users/' + username);
  }

  updateMember(member: Member) {
    return this.http.put(this.baseUrl + 'users', member).pipe(
      map(() => {
        const index = this.members.indexOf(member);
        this.members[index] = member;
      })
    );
  }

  setMainPhoto(photoId: number): Observable<void> {
    // "PUT https://localhost:5001/api/users/set-main-photo/21"
    // [HttpPut("set-main-photo/{photoId}")]
    const requestObs$ = this.http.put<void>(
      this.baseUrl + 'users/set-main-photo/' + photoId,
      {}
    );
    return requestObs$;
  }

  deletePhoto(photoId: number) {
    return this.http.delete(this.baseUrl + 'users/delete-photo/' + photoId);
  }

  private getPaginationQueryParams(
    pageNumber: number,
    pageSize: number
  ): HttpParams {
    let params: HttpParams = new HttpParams();

    params = params.append('pageNumber', pageNumber.toString());
    params = params.append('pageSize', pageSize.toString());

    return params;
  }
}
