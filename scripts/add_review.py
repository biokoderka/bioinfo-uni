#!/usr/bin/env python3
"""
Dodaje opinię do reviews.json (po moderacji) — albo usuwa opinię po id.

Używane przez GitHub Action "Add review" (Actions → Add review → Run workflow),
działa też lokalnie:

  python3 scripts/add_review.py --json '{"program": "upwr-bioinformatyka", "level": "I stopień", "comment": "..."}'
  python3 scripts/add_review.py --program uj-bioinformatyka --level "II stopień" --comment "..."
  python3 scripts/add_review.py --remove rev-2026-0001
  python3 scripts/add_review.py --list-programs
"""
import argparse, json, re, sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).parent.parent
UNI, REV = ROOT / "universities.json", ROOT / "reviews.json"
SOURCES = {"opinia od studentów i absolwentów", "opinia od osoby prowadzącej zajęcia", "inna perspektywa"}


def load(p):
    return json.loads(p.read_text(encoding="utf-8"))


def save_reviews(data):
    REV.write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")


def next_id(reviews, year):
    nums = [int(m.group(1)) for r in reviews if (m := re.match(rf"rev-{year}-(\d+)$", r["id"]))]
    return f"rev-{year}-{(max(nums) + 1 if nums else 1):04d}"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--json")
    ap.add_argument("--program")
    ap.add_argument("--level")
    ap.add_argument("--year")
    ap.add_argument("--source")
    ap.add_argument("--comment")
    ap.add_argument("--remove", help="id opinii do usunięcia")
    ap.add_argument("--list-programs", action="store_true")
    a = ap.parse_args()

    programs = {p["id"]: p for p in load(UNI)["programs"]}
    data = load(REV)

    if a.list_programs:
        for p in programs.values():
            print(f"{p['id']:50} {p['short']} — {p['name']} · " + ", ".join(o["level"] for o in p["offers"]))
        return

    if a.remove:
        before = len(data["reviews"])
        data["reviews"] = [r for r in data["reviews"] if r["id"] != a.remove]
        if len(data["reviews"]) == before:
            sys.exit(f"❌ Nie ma opinii o id {a.remove}")
        save_reviews(data)
        print(f"🗑 Usunięto opinię {a.remove}")
        return

    d = json.loads(a.json) if a.json else {}
    for k in ("program", "level", "year", "source", "comment"):
        if getattr(a, k):
            d[k] = getattr(a, k)

    pid = (d.get("program") or "").strip()
    if pid not in programs:
        sys.exit(f"❌ Nieznany kierunek '{pid}'. Lista: python3 scripts/add_review.py --list-programs")
    comment = (d.get("comment") or "").strip()
    if len(comment) < 3:
        sys.exit("❌ Pusta opinia")
    levels = [o["level"] for o in programs[pid]["offers"]]
    level = d.get("level") or None
    if level and level not in levels:
        sys.exit(f"❌ '{level}' nie pasuje do tego kierunku (dostępne: {', '.join(levels)})")
    if len(levels) == 1:
        level = None   # przy jednym stopniu nie ma czego rozróżniać
    source = d.get("source") if d.get("source") in SOURCES else "opinia od studentów i absolwentów"
    year = str(d.get("year") or date.today().year)

    if any(r["program"] == pid and r["comment"].strip() == comment for r in data["reviews"]):
        sys.exit("ℹ Ta opinia już jest w reviews.json")

    review = {"id": next_id(data["reviews"], year), "program": pid, "level": level,
              "year": year, "source": source, "comment": comment}
    data["reviews"].append(review)
    save_reviews(data)
    print(f"✅ Dodano {review['id']} → {programs[pid]['short']} — {programs[pid]['name']}"
          + (f" ({level})" if level else ""))


if __name__ == "__main__":
    main()
