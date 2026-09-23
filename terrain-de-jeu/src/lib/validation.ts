import type { Locale, Mission } from "./missions";
import { localize } from "./missions";

export type ValidationResult = {
  ok: boolean;
  messages: string[];
};

const normalizeOutput = (value: string) =>
  value.replace(/\r\n/g, "\n").trim();

export function validatePythonMission(
  mission: Mission,
  code: string,
  output: string,
  locale: Locale,
): ValidationResult {
  if (mission.validation.kind !== "python") {
    return { ok: false, messages: ["Invalid mission validator."] };
  }

  const messages: string[] = [];
  const expected = normalizeOutput(mission.validation.expectedOutput);
  const actual = normalizeOutput(output);

  if (actual !== expected) {
    messages.push(
      locale === "fr"
        ? `Sortie attendue : ${JSON.stringify(expected)}. Sortie actuelle : ${JSON.stringify(actual)}.`
        : `Expected output: ${JSON.stringify(expected)}. Current output: ${JSON.stringify(actual)}.`,
    );
  }

  for (const rule of mission.validation.codeRules ?? []) {
    const regex = new RegExp(rule.pattern, "m");
    if (!regex.test(code)) {
      messages.push(localize(rule.message, locale));
    }
  }

  return { ok: messages.length === 0, messages };
}

export function validateWebMission(
  mission: Mission,
  code: string,
  locale: Locale,
): ValidationResult {
  if (mission.validation.kind !== "web") {
    return { ok: false, messages: ["Invalid mission validator."] };
  }

  const messages: string[] = [];
  const document = new DOMParser().parseFromString(code, "text/html");
  const css = Array.from(document.querySelectorAll("style"))
    .map((style) => style.textContent ?? "")
    .join("\n");

  for (const rule of mission.validation.rules) {
    if (rule.kind === "selectorExists") {
      if (!document.querySelector(rule.selector)) {
        messages.push(localize(rule.message, locale));
      }
      continue;
    }

    if (rule.kind === "selectorText") {
      const element = document.querySelector(rule.selector);
      if (element?.textContent?.trim() !== rule.expected) {
        messages.push(localize(rule.message, locale));
      }
      continue;
    }

    if (rule.kind === "cssPattern") {
      const regex = new RegExp(rule.pattern, "i");
      if (!regex.test(css)) {
        messages.push(localize(rule.message, locale));
      }
    }
  }

  return { ok: messages.length === 0, messages };
}
