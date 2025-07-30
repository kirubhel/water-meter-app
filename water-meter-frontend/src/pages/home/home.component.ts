import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MeterService } from '../../services/MeterService';
import { CommonModule } from '@angular/common';

// Define an interface for your meter data for better type safety
export interface Meter {
  MID: string;
  // Add other properties that your meter objects are expected to have,
  // from your backend's DataEntity:
  id?: number; // Optional, as it's a primary key and might not always be needed in the frontend view
  timestamp: Date;
  status_code: string;
  battery_vol: string; // Matches DataEntity, consider changing to number if appropriate
  network: string;
  WH: string; // Matches DataEntity, consider changing to number if appropriate
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule], 
  // providers: [MeterService], // Removed: Assuming MeterService is providedIn: 'root' for singleton behavior
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  meters: Meter[] = [];
  filterMeters: Meter[] = [];

  paginatedData: Meter[] = [];
  currentPage = 1;
  itemsPerPage = 5;
  totalPages = 1;

  constructor(private meterService: MeterService, private router: Router) {}

  ngOnInit(): void {
    this.meterService.getMeters().subscribe({ // getMeters() calls the /data endpoint
      next: (data: Meter[]) => {
        console.log('HomeComponent: API response data received:', JSON.stringify(data)); // Log the raw data
        this.meters = data;
        this.filterMeters = data; // Initially, filterMeters is a copy of all meters
        console.log('HomeComponent: this.filterMeters after assignment (length):', this.filterMeters.length);
        console.log('HomeComponent: this.filterMeters content:', JSON.stringify(this.filterMeters));

        this.totalPages = Math.ceil(this.filterMeters.length / this.itemsPerPage);
        console.log('HomeComponent: Total pages calculated:', this.totalPages);
        console.log('HomeComponent: Items per page:', this.itemsPerPage);
        this.updatePagination();
      },
      error: (err) => {
        console.error('HomeComponent: Error fetching meters:', err);
        this.meters = [];
        this.filterMeters = [];
        this.updatePagination();
      }
    });
  }

  viewDetails(MID: string) {
    this.router.navigate(['/meter-details', MID]);
  }
  
  updatePagination() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    console.log(`HomeComponent: Paginating. CurrentPage: ${this.currentPage}, StartIndex: ${start}, EndIndex: ${end}`);
    console.log('HomeComponent: Slicing filterMeters (length before slice):', this.filterMeters.length);

    this.paginatedData = this.filterMeters.slice(start, end);
    console.log('HomeComponent: this.paginatedData after slice (length):', this.paginatedData.length);
    console.log('HomeComponent: this.paginatedData content:', JSON.stringify(this.paginatedData));
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }
  
  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }
  
  filterTable(event: any) { // Assuming the input event has a 'value' property
    const filterValue = (event.target as HTMLInputElement)?.value || ''; // Get value safely
    console.log('HomeComponent: filterTable called with value:', filterValue);
  
    this.filterMeters = this.meters.filter((item) =>
      item.MID && typeof item.MID === 'string' && item.MID.includes(filterValue)
    );
    console.log('HomeComponent: this.filterMeters after filtering (length):', this.filterMeters.length);
    console.log('HomeComponent: this.filterMeters content after filtering:', JSON.stringify(this.filterMeters));
  
    this.currentPage = 1; // Reset to first page after filtering
    this.totalPages = Math.ceil(this.filterMeters.length / this.itemsPerPage);
    if (this.totalPages === 0) this.totalPages = 1; // Ensure totalPages is at least 1
    this.updatePagination();
  }
}
