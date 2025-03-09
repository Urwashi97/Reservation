import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
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
        this.renderChart(data);
      });
  }

  renderChart(data: any[]) {
    const canvas = document.getElementById(
      'reservationChart'
    ) as HTMLCanvasElement;
    if (!canvas) return;
    console.log(69);
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
    console.log(this.chartInstance, data);
    this.chartInstance = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: data.map(
          (day) =>
            [
              'Sunday',
              'Monday',
              'Tuesday',
              'Wednesday',
              'Thursday',
              'Friday',
              'Saturday',
            ][day.weekday]
        ),
        datasets: [
          {
            label: 'Reservations',
            data: data.map((d) => d.reservation_count),
            backgroundColor: 'rgba(75,192,192,0.2)',
            borderColor: 'rgba(75,192,192,1)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
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
