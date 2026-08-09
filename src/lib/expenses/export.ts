import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { format } from "date-fns";
import type { Expense } from "./types";

function rows(expenses: Expense[]) {
  return expenses.map((e) => [
    e.date,
    e.time,
    e.title,
    e.category,
    e.amount.toFixed(2),
    e.notes ?? "",
  ]);
}

const HEAD = ["Date", "Time", "Title", "Category", "Amount", "Notes"];

export function exportPdf(expenses: Expense[], currency = "₹") {
  const doc = new jsPDF();
  const total = expenses.reduce((t, e) => t + e.amount, 0);
  doc.setFontSize(18);
  doc.text("Student Expense Report", 14, 18);
  doc.setFontSize(10);
  doc.text(`Generated ${format(new Date(), "dd MMM yyyy, HH:mm")}`, 14, 25);
  doc.text(`Transactions: ${expenses.length}   Total: ${currency}${total.toFixed(2)}`, 14, 31);
  autoTable(doc, {
    head: [HEAD],
    body: rows(expenses),
    startY: 37,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [22, 160, 145] },
  });
  doc.save(`expenses-${format(new Date(), "yyyy-MM-dd")}.pdf`);
}

export function exportExcel(expenses: Expense[]) {
  const ws = XLSX.utils.aoa_to_sheet([HEAD, ...rows(expenses)]);
  ws["!cols"] = [{ wch: 12 }, { wch: 8 }, { wch: 28 }, { wch: 16 }, { wch: 12 }, { wch: 34 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Expenses");
  XLSX.writeFile(wb, `expenses-${format(new Date(), "yyyy-MM-dd")}.xlsx`);
}