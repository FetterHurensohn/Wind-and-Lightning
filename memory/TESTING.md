# 🧪 Testing Guide

> Anleitung für Testing in diesem Projekt.

---

## Test-Methoden

### 1. Screenshot-Tool (Schnell)
Für visuelle Überprüfung einzelner Komponenten.

```python
# In mcp_screenshot_tool:
await page.set_viewport_size({"width": 1920, "height": 800})
await page.wait_for_timeout(2000)
await page.screenshot(path="/tmp/screenshot.png", quality=20, full_page=False)
```

### 2. Testing Agent (Umfassend)
Für mehrere Features oder komplexe Flows.

```json
{
  "original_problem_statement_and_user_choices_inputs": "Beschreibung...",
  "features_or_bugs_to_test": ["Feature 1", "Feature 2"],
  "files_of_reference": ["Datei 1", "Datei 2"],
  "testing_type": "frontend only(skip backend)",
  "mocked_api": { "value": { "has_mocked_apis": false } }
}
```

### 3. Manuelle Browser-Tests
Für interaktive Tests im Preview.

---

## Wann welche Methode?

| Situation | Methode |
|-----------|---------|
| Einzelne UI-Änderung | Screenshot |
| Neues Feature | Testing Agent |
| Bug-Fix | Screenshot + manuell |
| Mehrere Komponenten | Testing Agent |
| Styling-Änderung | Screenshot |

---

## Test-IDs Konvention

### Format
```
[komponente]-[element]-[aktion/typ]
```

### Beispiele
```jsx
// Panels
data-testid="ai-chat-panel"
data-testid="settings-modal"
data-testid="export-dialog"

// Buttons
data-testid="submit-button"
data-testid="close-panel"
data-testid="generate-btn"
data-testid="save-settings"

// Inputs
data-testid="search-input"
data-testid="title-input"
data-testid="api-key-input"

// Tabs
data-testid="tab-script"
data-testid="tab-titles"

// Tiles/Cards
data-testid="tile-ki-model"
data-testid="project-card-123"

// Dropdowns
data-testid="model-selector-button"
data-testid="model-option-gpt-5.2"
```

---

## Vorhandene Test-IDs

### Dashboard
```
tile-ki-model
tile-ausschneiden
tile-sprachausgabe
tile-qualitaet
tile-dialog
settings-gear-button
feature-tiles
```

### AI Features Panel
```
ai-features-panel
tab-script
tab-titles
tab-translate
tab-ideas
generate-btn
copy-result
apply-result
close-ai-features
script-topic-input
title-topic-input
translate-text-input
idea-niche-input
```

### AI Chat
```
ai-chat-panel
model-selector-button
model-selector-dropdown
model-option-[model-id]
chat-input
send-button
clear-chat-button
ai-settings-button
message-user
message-assistant
suggestion-0, suggestion-1, suggestion-2
```

### Auto Caption Panel
```
close-caption-panel
language-select
style-[style-id]
generate-captions-btn
regenerate-btn
caption-[index]
caption-input-[index]
apply-captions-btn
```

### Settings
```
close-ai-settings
api-key-input
save-ai-settings
```

---

## Test-Reports

### Speicherort
```
/app/test_reports/iteration_[n].json
```

### Format
```json
{
  "summary": "Kurze Zusammenfassung",
  "backend_issues": { "critical": [], "minor": [] },
  "frontend_issues": { "ui_bugs": [], "integration_issues": [] },
  "passed_tests": ["Test 1", "Test 2"],
  "action_items": ["Todo 1"],
  "success_rate": { "frontend": "95%" },
  "retest_needed": false
}
```

---

## Häufige Test-Szenarien

### 1. Modal öffnet sich
```python
# Klick auf Trigger
await page.locator('[data-testid="trigger-button"]').click()
await page.wait_for_timeout(1000)

# Prüfe ob Modal sichtbar
modal = page.locator('[data-testid="modal-name"]')
assert await modal.is_visible()
```

### 2. Dropdown funktioniert
```python
# Öffne Dropdown
await page.locator('[data-testid="dropdown-trigger"]').click()
await page.wait_for_timeout(500)

# Wähle Option
await page.locator('[data-testid="option-value"]').click()
```

### 3. Tab-Wechsel
```python
# Klicke auf Tab
await page.locator('[data-testid="tab-name"]').click()
await page.wait_for_timeout(500)

# Screenshot zur Verifizierung
await page.screenshot(path="/tmp/tab-test.png", quality=20)
```

### 4. Input-Eingabe
```python
# Fülle Input
await page.locator('[data-testid="input-name"]').fill("Test-Wert")

# Prüfe Wert
value = await page.locator('[data-testid="input-name"]').input_value()
assert value == "Test-Wert"
```

---

## Bekannte Test-Einschränkungen

1. **KI-API-Aufrufe schlagen fehl** - Das ist OK, UI sollte trotzdem funktionieren
2. **Electron-APIs nicht verfügbar** - Im Browser-Test fehlen `window.electronAPI`
3. **localStorage** - Kann zwischen Tests persistieren

---

## Test-Checkliste für neue Features

- [ ] Test-IDs zu allen interaktiven Elementen hinzugefügt
- [ ] Screenshot nach Implementierung gemacht
- [ ] Haupt-Flows manuell getestet
- [ ] Error-States getestet
- [ ] Loading-States getestet
- [ ] Responsive Verhalten geprüft (wenn relevant)
