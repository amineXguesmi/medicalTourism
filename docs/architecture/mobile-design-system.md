# Mobile MVP Design System

## Product Feel

The mobile app should feel trustworthy, clear and efficient. It is a patient companion for medical tourism, not a marketing landing page. The UI should help users compare care options, understand risk, manage documents and follow recovery steps without visual noise.

## Palette

Use the shared tokens from `packages/ui-tokens`.

- Deep teal: primary brand and trust.
- Clear cyan: primary actions, links and focus states.
- Coral: medical attention, errors and high-risk warnings.
- Amber: non-critical warnings and pending states.
- Green: confirmed, taken medication and completed steps.
- Warm neutral surfaces: readable backgrounds and cards.

Avoid a single-hue interface. The app should not become all-blue, all-purple, all-cream or overly dark.

## MVP Screen Priorities

1. Onboarding and consent: short steps, explicit consent cards, plain language.
2. Procedure search: large search, filter chips, country/currency controls.
3. Clinic results: scan-friendly cards with price, country, verification and next availability.
4. Clinic comparison: compact comparison table, up to four clinics.
5. Document vault: upload status, consent status, AI summary status and source visibility.
6. Quote request: clear checklist of required documents and clinic response status.
7. Medication: today-focused schedule with taken/missed/side-effect actions.
8. Post-op journal: symptom severity, photo upload entry point and escalation hints.

## Component Rules

- Use 8px radius for cards and controls unless a native platform component requires otherwise.
- Use icon buttons for repeat actions such as upload, scan, download, filter, search and close.
- Use segmented controls for compare/search modes.
- Use toggles only for binary settings.
- Use status chips for consent, verification, quote and document processing states.
- Keep medical disclaimers visible but concise.
- Do not hide medically important text behind decorative UI.

## Accessibility

- Minimum touch target: 44px.
- Text must not scale with viewport width.
- Preserve strong contrast for clinical and legal text.
- Support English first, but leave layout space for French, Arabic, Spanish, German and Italian.
- Never rely only on color for medical status; pair color with icon and text.

