import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface TinyUrl {
  code: string;
  shortURL: string;
  originalURL: string;
  totalClicks: number;
  isPrivate: boolean;
}

export interface TinyUrlAddDto {
  originalURL: string;
  isPrivate: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class TinyUrlService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getPublicUrls(): Observable<TinyUrl[]> {
    return this.http.get<TinyUrl[]>(`${this.apiUrl}/public`);
  }

  addUrl(dto: TinyUrlAddDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/add`, dto);
  }

  deleteUrl(code: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${code}`);
  }

  updateUrl(code: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/update/${code}`, {});
  }
}
