import argparse
import csv
import json
from datetime import datetime, timezone


def _as_str(v):
    return ('' if v is None else str(v)).strip()


def _as_float(v, default=0.0):
    s = _as_str(v)
    if s == '':
        return default
    try:
        return float(s)
    except ValueError:
        return default


def _as_int(v, default=0):
    s = _as_str(v)
    if s == '':
        return default
    try:
        return int(float(s))
    except ValueError:
        return default


def _read_csv_dicts(path: str):
    with open(path, 'r', encoding='utf-8-sig', newline='') as f:
        reader = csv.DictReader(f)
        return list(reader)


def csv_to_payload(clients_csv_path: str, entries_csv_path: str | None = None):
    clients_rows = _read_csv_dicts(clients_csv_path)

    clients = []
    for row in clients_rows:
        code = _as_str(row.get('code')).upper()
        name = _as_str(row.get('name'))
        city = _as_str(row.get('city'))
        notes = _as_str(row.get('notes'))
        if not code or not name:
            continue
        client = {
            'code': code,
            'name': name,
            'city': city,
        }
        if notes:
            client['notes'] = notes
        clients.append(client)

    ledger_entries = []
    if entries_csv_path:
        entries_rows = _read_csv_dicts(entries_csv_path)
        for row in entries_rows:
            client_code = _as_str(row.get('client_code') or row.get('code')).upper()
            date = _as_str(row.get('date'))
            if not client_code or not date:
                continue

            entry = {
                'client_code': client_code,
                'date': date,
                'folder_no': _as_str(row.get('folder_no') or row.get('folder') or row.get('folder_no.')),
                'stage': _as_str(row.get('stage') or 'S1') or 'S1',
                'tm_no': _as_str(row.get('tm_no') or row.get('tm')),
                'class_no': _as_str(row.get('class_no') or row.get('class')),
                'details': _as_str(row.get('details') or row.get('particulars') or row.get('description')),
                'due_amount': _as_float(row.get('due_amount') or row.get('due') or row.get('debit'), 0.0),
                'received_amount': _as_float(row.get('received_amount') or row.get('received') or row.get('credit'), 0.0),
                'entry_type': (_as_str(row.get('entry_type') or row.get('type') or 'NORMAL') or 'NORMAL').upper(),
            }

            # Optional: if present in CSV, pass through row_number for easier debugging in import logs
            row_number = _as_int(row.get('row_number'), 0)
            if row_number:
                entry['row_number'] = row_number

            ledger_entries.append(entry)

    return {
        'clients': clients,
        'ledger_entries': ledger_entries,
        'exported_at': datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z'),
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('clients_csv', help='Path to clients CSV file')
    parser.add_argument('--entries-csv', default='', help='Optional path to entries CSV file')
    parser.add_argument('-o', '--out', default='', help='Output JSON path (default: stdout)')
    args = parser.parse_args()

    entries_path = args.entries_csv.strip() or None
    payload = csv_to_payload(args.clients_csv, entries_path)
    data = json.dumps(payload, ensure_ascii=False, indent=2)

    if args.out:
        with open(args.out, 'w', encoding='utf-8') as f:
            f.write(data)
    else:
        print(data)


if __name__ == '__main__':
    main()
