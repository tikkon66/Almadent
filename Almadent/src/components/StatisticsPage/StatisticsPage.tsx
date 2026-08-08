import React, { useState, useEffect, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';

import {
  getFilterOptions,
  getStatistics,
} from '../../service/statistic';
import type {
  Branch,
  Employee,
  Service,
  StatisticsSummary,
} from '../../service/statistic';
import './StatisticsPage.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const StatisticsPage: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [filters, setFilters] = useState({
    dateRecordFrom: '',
    dateRecordTo: '',
    clientName: '',
    email: '',
    phone: '',
    branch: 'all',
    employee: 'all',
    service: 'all',
    displayMode: 'days' as 'days' | 'weeks' | 'months',
    chartType: 'line' as 'line' | 'bar',
  });

  const [summary, setSummary] = useState<StatisticsSummary>({
    totalCount: 0,
    totalPrice: 0,
    totalDuration: 0,
    chartData: [],
  });

  // Загрузка списков для селектов при монтировании
  useEffect(() => {
    getFilterOptions().then((opts) => {
      setBranches(opts.branches);
      setEmployees(opts.employees);
      setServices(opts.services);
    });
  }, []);

  // Фильтрация сотрудников по выбранному филиалу
  const filteredEmployees = employees.filter((emp) =>
    filters.branch === 'all' ? true : emp.branch_id === Number(filters.branch)
  );

  const handleChange = (field: string, value: string) => {
    setFilters((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'branch') {
        updated.employee = 'all'; // сброс сотрудника при смене филиала
      }
      return updated;
    });
  };

  const handleFetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getStatistics(filters);
      setSummary(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    handleFetchData();
  }, [handleFetchData]);

  const handleFilterClick = (e: React.FormEvent) => {
    e.preventDefault();
    handleFetchData();
  };

  // Настройка данных для Chart.js
  const chartLabels = summary.chartData.map((item) => item.label);
  const chartDataConfig = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Записей',
        data: summary.chartData.map((item) => item.count),
        borderColor: '#a855f7',
        backgroundColor: 'rgba(168, 85, 247, 0.5)',
        yAxisID: 'y1',
      },
      {
        label: 'Стоимость услуг (₸)',
        data: summary.chartData.map((item) => item.totalPrice),
        borderColor: '#06b6d4',
        backgroundColor: 'rgba(6, 182, 212, 0.5)',
        yAxisID: 'y',
      },
      {
        label: 'Длительность (мин)',
        data: summary.chartData.map((item) => item.totalDuration),
        borderColor: '#ec4899',
        backgroundColor: 'rgba(236, 72, 153, 0.5)',
        yAxisID: 'y1',
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: { display: true, text: 'Сумма (₸)' },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: { drawOnChartArea: false },
        title: { display: true, text: 'Кол-во / Мин' },
      },
    },
  };

  return (
    <div className="stats-page">
      <div className="stats-header">
        <h1 className="stats-header__title">Статистика</h1>
      </div>

      <form className="stats-filters" onSubmit={handleFilterClick}>
        <div className="stats-filters__grid">
          <div className="filter-group">
            <label>Дата записи, от</label>
            <input
              type="date"
              value={filters.dateRecordFrom}
              onChange={(e) => handleChange('dateRecordFrom', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Дата записи, до</label>
            <input
              type="date"
              value={filters.dateRecordTo}
              onChange={(e) => handleChange('dateRecordTo', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>ФИО клиента</label>
            <input
              type="text"
              placeholder="ФИО клиента"
              value={filters.clientName}
              onChange={(e) => handleChange('clientName', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Email</label>
            <input
              type="text"
              placeholder="Email"
              value={filters.email}
              onChange={(e) => handleChange('email', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Телефон</label>
            <input
              type="text"
              placeholder="Телефон"
              value={filters.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label className="label-highlight">Филиал</label>
            <select
              value={filters.branch}
              onChange={(e) => handleChange('branch', e.target.value)}
            >
              <option value="all">Все</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="label-highlight">Сотрудник</label>
            <select
              value={filters.employee}
              onChange={(e) => handleChange('employee', e.target.value)}
            >
              <option value="all">Все</option>
              {filteredEmployees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.full_name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="label-highlight">Услуга</label>
            <select
              value={filters.service}
              onChange={(e) => handleChange('service', e.target.value)}
            >
              <option value="all">Все</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Режим отображения</label>
            <select
              value={filters.displayMode}
              onChange={(e) => handleChange('displayMode', e.target.value)}
            >
              <option value="days">По дням</option>
              <option value="weeks">По неделям</option>
              <option value="months">По месяцам</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Тип графика</label>
            <select
              value={filters.chartType}
              onChange={(e) => handleChange('chartType', e.target.value)}
            >
              <option value="line">Линейный</option>
              <option value="bar">Столбчатый</option>
            </select>
          </div>

          <div className="filter-group filter-group--btn">
            <button type="submit" className="btn btn--filter" disabled={loading}>
              {loading ? '⏳ Загрузка...' : '🔍 Фильтровать'}
            </button>
          </div>
        </div>
      </form>
      <div className="stats-chart-card">
        <div className="chart-container">
          {summary.chartData.length > 0 ? (
            <Chart
              type={filters.chartType}
              data={chartDataConfig}
              options={chartOptions}
            />
          ) : (
            <div className="no-data-placeholder">
              Нет данных для отображения за выбранный период
            </div>
          )}
        </div>
      </div>    </div>
  );
};

export default StatisticsPage;