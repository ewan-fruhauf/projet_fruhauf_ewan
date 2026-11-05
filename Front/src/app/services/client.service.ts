import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { UserService } from './user.service';
import { ClientSignUp, ClientResponse } from '../models/client.model';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private userService = inject(UserService);

  /**
   * Délègue l'inscription au UserService (POST /api/users)
   */
  signUp(client: ClientSignUp): Observable<ClientResponse> {
    return this.userService.createUser(client);
  }
}

// Alias pour compatibilité
export { ClientService as AuthService };
