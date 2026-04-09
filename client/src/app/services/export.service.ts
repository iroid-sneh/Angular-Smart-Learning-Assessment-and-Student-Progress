import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

@Injectable({ providedIn: 'root' })
export class ExportService {

  exportToCSV(data: any[], filename: string, headers?: { [key: string]: string }): void {
    if (!data || data.length === 0) return;
    const mapped = headers ? data.map(row => {
      const obj: any = {};
      Object.keys(headers).forEach(key => { obj[headers[key]] = row[key]; });
      return obj;
    }) : data;
    const ws = XLSX.utils.json_to_sheet(mapped);
    const csv = XLSX.utils.sheet_to_csv(ws);
    this.downloadFile(csv, `${filename}.csv`, 'text/csv');
  }

  exportToExcel(data: any[], filename: string, headers?: { [key: string]: string }): void {
    if (!data || data.length === 0) return;
    const mapped = headers ? data.map(row => {
      const obj: any = {};
      Object.keys(headers).forEach(key => { obj[headers[key]] = row[key]; });
      return obj;
    }) : data;
    const ws = XLSX.utils.json_to_sheet(mapped);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, `${filename}.xlsx`);
  }

  private downloadFile(content: string, filename: string, type: string): void {
    const blob = new Blob([content], { type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
