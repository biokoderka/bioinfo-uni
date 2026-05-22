# Bioinformatyka w Polsce 🧬

Statyczna strona GitHub Pages z wyszukiwarką kierunków bioinformatycznych w Polsce oraz opiniami studentów i absolwentów.

👉 **[biokoderka.github.io/bioinfo-uni](https://biokoderka.github.io/bioinfo-uni)**

---

## Co znajdziesz na stronie

- podstawowe dane rekrutacyjne dla każdego kierunku (typ studiów, czas trwania, tytuł, wymagania)
- informacje czy uczelnia oferuje również II stopień
- linki do oferty, spisu przedmiotów i planu zajęć
- opinie studentów i absolwentów
- wyszukiwarka i filtry (typ studiów, II stopień, miasto)

## Struktura plików

```
index.html        # strona główna
submit.html       # formularz dodawania opinii
style.css         # style
app.js            # logika strony głównej
submit.js         # logika formularza
universities.json # dane uczelni
reviews.json      # opinie
```

## Dane

**Uczelnie** (`universities.json`) — dane pochodzą z publicznie dostępnych informacji od uczelni (strony rekrutacyjne, informatory ECTS, plany zajęć). Aktualizowane ręcznie.

**Opinie** (`reviews.json`) — zbierane przez GitHub Issues i dodawane po moderacji. Są anonimowe i subiektywne — nie są oficjalnym stanowiskiem uczelni.

## Jak dodać opinię

Przez stronę: kliknij „Dodaj opinię" — formularz tworzy GitHub Issue, które po moderacji trafia do `reviews.json`.

Możesz też napisać bezpośrednio: **biokoderka@gmail.com**

## Jak zgłosić błąd w danych

Otwórz Issue albo napisz na maila powyżej.

## Licencja

Kod: MIT. Treść opinii należy do ich autorów.
