import { Injectable, Scope } from '@nestjs/common';
import { user } from '@generated/index'

@Injectable({ scope: Scope.REQUEST })
export class UserContextService {
  private _userData: user | null = null;

  public set user(userData: user) {
    this._userData = userData;
  }

  public get user(): user {
    return this._userData!;
  }
};

