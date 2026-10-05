# BioInfoUni 🎓

Wyszukiwarka studiów bioinformatycznych w Polsce — I i II stopień oraz studia podyplomowe — z danymi rekrutacyjnymi, linkami do programów i planów zajęć oraz anonimowymi opiniami studentów i absolwentów.

👉 **[biokoderka.github.io/bioinfo-uni](https://biokoderka.github.io/bioinfo-uni)** · część [BioinfoSites](https://biokoderka.github.io/bioinfosites/)

## Pliki

```
index.html          wyszukiwarka
submit.html         formularz opinii (Formspree)
app.js / submit.js  logika stron
style.css           style
universities.json   kierunki i ich stopnie
reviews.json        opinie (po moderacji)
scripts/add_review.py           dodawanie / usuwanie opinii
.github/workflows/add-review.yml  to samo z poziomu GitHuba
```

## Model danych

Jedna karta na stronie = **jeden kierunek na jednej uczelni**. Stopnie (I, II, podyplomowe) są w środku jako `offers`, więc opinie wyświetlają się raz — nie dublują się na kartach I i II stopnia.

```jsonc
// universities.json → programs[]
{
  "id": "upwr-bioinformatyka",          // stały identyfikator — nie zmieniaj, opinie się do niego odwołują
  "university": "Uniwersytet Przyrodniczy we Wrocławiu",
  "short": "UPWr",
  "faculty": "…",                        // opcjonalnie
  "name": "Bioinformatyka",
  "city": "Wrocław",
  "note": "…",                           // opcjonalnie, widoczne na karcie
  "offers": [
    { "level": "I stopień",              // I stopień | II stopień | II stopień – specjalność | studia podyplomowe
      "duration": "3,5 roku", "degree": "inżynier", "admission": "…", "year": "2026/2027",
      "url": "…", "curriculum_url": "…", "schedule_url": "…", "note": null }
  ]
}

// reviews.json → reviews[]
{ "id": "rev-2026-0001", "program": "upwr-bioinformatyka", "level": "I stopień" /* albo null */,
  "year": "2026", "source": "opinia od studentów i absolwentów", "comment": "…" }
```

Link do konkretnej karty: `…/bioinfo-uni/#upwr-bioinformatyka` — otwiera kartę ze szczegółami (przydatne w postach i DM-ach).

## Jak dodać opinię (moderacja)

Opinie z formularza przychodzą mailem przez Formspree. W mailu jest pole **`admin_json`**.

1. Przeczytaj opinię; jeśli trzeba, popraw literówki albo usuń dane osobowe bezpośrednio w `admin_json`.
2. GitHub → **Actions → Add review → Run workflow** → wklej `admin_json` w pole **review_json**.
3. Po ok. minucie opinia jest na stronie. Usunięcie: to samo, pole **remove_id**.

Lokalnie: `python3 scripts/add_review.py --help` (lista kierunków: `--list-programs`).

## Jak dodać kierunek

Dopisz obiekt do `programs` w `universities.json` (wzór wyżej). Kolejny stopień tego samego kierunku → nowy element w `offers` istniejącej karty, nie nowa karta.

## Dane

Dane o kierunkach pochodzą z publicznych stron uczelni i są aktualizowane ręcznie. Opinie są anonimowe i subiektywne — nie są stanowiskiem uczelni. Błąd w danych? Issue albo **biokoderka@gmail.com**.

## Licencja

Kod: MIT. Treść opinii należy do ich autorów.
