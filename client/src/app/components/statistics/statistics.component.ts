import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { StatisticsService } from '../../services/statistics.service';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatNativeDateModule,
    MatTableModule,
  ],
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.scss',
})
export class StatisticsComponent implements OnInit {
  statisticForm = new FormGroup({
    betriebId: new FormControl(201216, { nonNullable: true }),
    startDate: new FormControl(new Date('2023-10-01')),
    endDate: new FormControl(new Date('2023-12-31')),
  });

  private chartInstance: Chart | null = null;

  constructor(private statisticsService: StatisticsService) {}

  ngOnInit(): void {}

  fetchStatistics() {
    const { betriebId, startDate, endDate } = this.statisticForm.value;
    // Ensure betriebId is a number (fallback to undefined if null/NaN)
    const validBetriebId = betriebId != null ? Number(betriebId) : undefined;

    if (!validBetriebId) {
      console.error('Invalid betriebId:', betriebId);
      return; // Avoid calling API with invalid data
    }

    const formattedStartDate = startDate
      ? (startDate as Date).toISOString().split('T')[0]
      : undefined;
    const formattedEndDate = endDate
      ? (endDate as Date).toISOString().split('T')[0]
      : undefined;

    this.statisticsService
      .getStatistics(validBetriebId, formattedStartDate, formattedEndDate)
      .subscribe((data) => {
        console.log(`Fetched Data`, data);
        this.renderChart(data);
      });
  }

  renderChart(data: any[]) {
    const canvas = document.getElementById(
      'reservationChart'
    ) as HTMLCanvasElement;

    if (Chart.getChart(canvas)) {
      Chart.getChart(canvas)?.destroy();
    }

    if (!data || data.length === 0) {
      console.error(`No data available for chart rendering`);
      return;
    }

    const label = data.map(
      (day) =>
        [
          'Sunday',
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
        ][Number(day.weekday)]
    );

    const reservations = data.map((d) => d.reservation_count);

    this.chartInstance = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: label,
        datasets: [
          {
            label: 'Reservations',
            data: reservations,
            backgroundColor: 'rgba(75,192,192,0.2)',
            borderColor: 'rgba(75,192,192,1)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true },
        },
      },
    });
  }

  ngOnDestry() {
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
  }
}
