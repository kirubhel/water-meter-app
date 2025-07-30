import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MeterService } from '../../services/MeterService';
import Chart from 'chart.js/auto';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Location } from '@angular/common';

@Component({
  selector: 'app-meter-details',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  providers: [MeterService],
  templateUrl: './meter-details.component.html',
  styleUrl: './meter-details.component.scss',
})
export class MeterDetailsComponent implements OnInit, AfterViewInit {
  MID: string = '';
  meterData: any[] = [];
  chartInstance: Chart | null = null;
  paginatedData: any[] = [];
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  errorMessage: string = '';
  chartError: string = '';
  isChartLoading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private meterService: MeterService,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit() {
    this.MID = this.route.snapshot.paramMap.get('MID') || '';
    if (!this.MID) {
      this.errorMessage = 'No Meter ID provided.';
      console.error('No MID found in route parameters.');
      return;
    }
    this.fetchData();
  }

  ngAfterViewInit() {
    // Ensure canvas is available before rendering
    setTimeout(() => this.renderChart(), 100);
  }

  fetchData(date?: any) {
    console.log(`[${new Date().toLocaleString('en-US', { timeZone: 'Africa/Nairobi' })}] Fetching data for MID: ${this.MID}, Date: ${date?.value}`);
    this.errorMessage = '';
    this.chartError = '';
    this.isChartLoading = true;

    this.meterService.getMeterDetails(this.MID, date?.value).subscribe({
      next: (data) => {
        console.log('Raw API response:', JSON.stringify(data));
        if (!Array.isArray(data) || data.length === 0) {
          this.errorMessage = 'No data available for this meter.';
          this.meterData = [];
          this.paginatedData = [];
          this.totalPages = 1;
          this.isChartLoading = false;
          console.warn('No valid data received from API.');
          return;
        }

        // Parse and validate data
        this.meterData = data.map((row: any) => {
          const parsedRow = {
            ...row,
            WH: parseFloat(row.WH) || 0,
            battery_vol: parseFloat(row.battery_vol) || 0,
            network: parseFloat(row.network) || 0,
            timestamp: new Date(row.timestamp),
          };
          if (isNaN(parsedRow.WH) || isNaN(parsedRow.battery_vol) || isNaN(parsedRow.network) || isNaN(parsedRow.timestamp.getTime())) {
            console.warn('Invalid data in row:', row);
          }
          return parsedRow;
        }).filter(row => !isNaN(row.timestamp.getTime()));

        console.log('Processed meterData:', JSON.stringify(this.meterData));
        this.totalPages = Math.ceil(this.meterData.length / this.itemsPerPage);
        this.updatePagination();
        this.isChartLoading = false;
        setTimeout(() => this.renderChart(), 100); // Delay to ensure canvas is ready
      },
      error: (err) => {
        this.errorMessage = 'Failed to fetch meter data. Please try again later.';
        this.meterData = [];
        this.paginatedData = [];
        this.totalPages = 1;
        this.isChartLoading = false;
        if (this.chartInstance) {
          this.chartInstance.destroy();
          this.chartInstance = null;
        }
        console.error('API error:', err);
      },
    });
  }

  renderChart() {
    console.log(`[${new Date().toLocaleString('en-US', { timeZone: 'Africa/Nairobi' })}] Attempting to render chart with meterData length: ${this.meterData.length}`);
    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }

    const ctx = document.getElementById('detailsChart') as HTMLCanvasElement;
    if (!ctx) {
      this.chartError = '';
      this.isChartLoading = false;
      console.error('Canvas element with ID "detailsChart" not found.');
      return;
    }

    // Fallback data if meterData is empty or invalid
    let chartData = this.meterData.length > 0 ? this.meterData : [
      { timestamp: new Date('2025-05-29T10:00:00Z'), WH: 100 },
      { timestamp: new Date('2025-05-29T11:00:00Z'), WH: 120 },
      { timestamp: new Date('2025-05-29T12:00:00Z'), WH: 110 },
    ];
    let labels = chartData.map((row: any) =>
      new Date(row.timestamp).toLocaleString('en-US', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Africa/Nairobi',
      })
    );
    let dataValues = chartData.map((row: any) => row.WH);

    if (this.meterData.length === 0) {
      console.warn('Using fallback data for chart rendering.');
      this.chartError = 'No valid meter data available. Displaying sample chart.';
    } else if (!chartData.every((row: any) => typeof row.WH === 'number' && !isNaN(row.WH) && row.timestamp instanceof Date && !isNaN(row.timestamp.getTime()))) {
      this.chartError = 'Invalid data format for chart. Displaying sample chart.';
      console.error('Invalid data detected:', this.meterData);
      chartData = [
        { timestamp: new Date('2025-05-29T10:00:00Z'), WH: 100 },
        { timestamp: new Date('2025-05-29T11:00:00Z'), WH: 120 },
        { timestamp: new Date('2025-05-29T12:00:00Z'), WH: 110 },
      ];
      labels = chartData.map((row: any) =>
        new Date(row.timestamp).toLocaleString('en-US', {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'Africa/Nairobi',
        })
      );
      dataValues = chartData.map((row: any) => row.WH);
    }

    console.log('Chart labels:', labels);
    console.log('Chart data:', dataValues);

    try {
      this.chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Water Usage (Liters)',
              data: dataValues,
              borderColor: '#06b6d4',
              backgroundColor: 'rgba(6, 182, 212, 0.2)',
              borderWidth: 2,
              fill: true,
              pointBackgroundColor: '#ffffff',
              pointBorderColor: '#06b6d4',
              pointRadius: 5,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            duration: 1000,
            easing: 'easeInOutQuad',
          },
          plugins: {
            legend: { labels: { color: '#1e3a8a' } },
            tooltip: {
              backgroundColor: 'rgba(6, 182, 212, 0.8)',
              titleColor: '#ffffff',
              bodyColor: '#ffffff',
              callbacks: { label: (context) => `${context.parsed.y} Liters` },
            },
          },
          scales: {
            x: {
              grid: { color: 'rgba(6, 182, 212, 0.2)' },
              ticks: { color: '#1e3a8a', maxRotation: 45, autoSkip: true },
            },
            y: {
              grid: { color: 'rgba(6, 182, 212, 0.2)' },
              ticks: { color: '#1e3a8a', callback: (value) => `${value} L` },
              title: { display: true, text: 'Water Usage (Liters)', color: '#1e3a8a' },
            },
          },
        },
      });
      console.log('Chart instance created successfully.');
      this.isChartLoading = false;
    } catch (error) {
      this.chartError = 'Failed to render chart. Please check the console for details.';
      this.isChartLoading = false;
      console.error('Chart rendering error:', error);
    }
  }

  updatePagination() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedData = this.meterData.slice(start, end);
    console.log('Paginated data:', JSON.stringify(this.paginatedData));
  }

  nextPage() {
    if (this.currentPage * this.itemsPerPage < this.meterData.length) {
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

  goBack(): void {
    this.location.back();
  }
}
