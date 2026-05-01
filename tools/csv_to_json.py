import argparse
import csv
import json
from datetime import datetime, timezone


def csv_to_payload(csv_path: str):
    with open(csv_path, 'r', encoding='utf-8-sig', newline='') as f:
        reader = csv.DictReader(f)
        clients = []
        for row in reader:
            code = (row.get('code') or '').strip().upper()
            name = (row.get('name') or '').strip()
            city = (row.get('city') or '').strip()
            notes = (row.get('notes') or '').strip()
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

    return {
        'clients': clients,
        'ledger_entries': [],
        'exported_at': datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z'),
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('csv', help='Path to CSV file')
    parser.add_argument('-o', '--out', default='', help='Output JSON path (default: stdout)')
    args = parser.parse_args()

    payload = csv_to_payload(args.csv)
    data = json.dumps(payload, ensure_ascii=False, indent=2)

    if args.out:
        with open(args.out, 'w', encoding='utf-8') as f:
            f.write(data)
    else:
        print(data)


if __name__ == '__main__':
    main()
