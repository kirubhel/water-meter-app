import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

// It's best to move this interface to a shared models file (e.g., src/app/models/meter.model.ts)
// and import it here and in home.component.ts.
// For now, defining it here for clarity if it hasn't been moved yet.
export interface Meter {
  MID: string;
  id?: number;
  timestamp: Date;
  status_code: string;
  battery_vol: string;
  network: string;
  WH: string;
}
@Injectable({
  providedIn: 'root', // This makes Angular automatically provide this service
})
export class MeterService {
  private apiUrl = 'http://196.190.251.194:7075'; // Production API URL

  constructor(private http: HttpClient) {}

  getMeters(): Observable<Meter[]> {
    return this.http.get<Meter[]>(`${this.apiUrl}/data`);
  }

  getMeterDetails(MID: string, date?: string): Observable<Meter[]> {
    let url = `${this.apiUrl}/data/dataByMeterId?MID=${MID}`;
    if (date) url += `&date=${date}`;
    return this.http.get<Meter[]>(url);
  }
}
