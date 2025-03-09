import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StatisticsService {
  private apiURl = `http://localhost:3000/api`;

  constructor(private http: HttpClient) {}

  getStatistics(betriebId?: number, startDate?: string, endDate?: string):Observable<any> {
    return this.http.get<any[]>(
      `${this.apiURl}/statistics?betriebId=${betriebId}&startDate=${startDate}&endDate=${endDate}`
    );
  }
}
