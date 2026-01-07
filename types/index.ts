export interface ScanResult {
  cidr: string;
  parent_net: string;
  parent_name: string;
  parent_desc: string;
  children: string;
  rpki_status: string;
  rpki_detail: string;
  visibility: string;
  irr_objects: string;
  ptr_record: string;
}