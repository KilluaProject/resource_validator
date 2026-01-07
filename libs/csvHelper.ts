import { ScanResult } from "../types";

export const downloadCSV = (data: ScanResult[]) => {
  // HEADER LENGKAP
  const headers = [
    "Target CIDR",
    "Parent Netname",
    "Parent Inetnum",
    "Parent Description",
    "Sub-Allocations (Children)",
    "RPKI Status",
    "RPKI Detail",
    "IRR Objects",
    "Global Visibility",
    "Reverse DNS (PTR)"
  ];

  // DATA MAPPING
  const rows = data.map((item) => [
    item.cidr,
    item.parent_name,
    item.parent_net,
    item.parent_desc,
    item.children,
    item.rpki_status,
    item.rpki_detail,
    item.irr_objects,
    item.visibility,
    item.ptr_record,
  ]);

  const csvContent =
    "data:text/csv;charset=utf-8," +
    headers.join(",") + "\n" +
    rows.map((e) => 
      // Kita bungkus pake tanda kutip biar kalau ada koma di dalem teks gak hancur kolomnya
      e.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    ).join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `Full_Audit_Report_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};