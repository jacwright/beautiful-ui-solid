import type { Page } from "@playwright/test";

// Shared by the specs of Tooltip and the controls that show one, such as Icon button.

/** The element's name and description, as Chromium's accessibility tree has them. */
export async function accessible(page: Page, selector: string) {
  const cdp = await page.context().newCDPSession(page);
  const { root } = await cdp.send("DOM.getDocument");
  const { nodeId } = await cdp.send("DOM.querySelector", { nodeId: root.nodeId, selector });
  const { nodes } = await cdp.send("Accessibility.getPartialAXTree", { nodeId, fetchRelatives: false });
  await cdp.detach();
  return { name: nodes[0]?.name?.value, description: nodes[0]?.description?.value };
}

/**
 * Where the browser lacks interest invokers, as Safari and Firefox do in 2026: no
 * interestForElement, and the attribute does nothing. Only Chromium is installed, and no Blink flag
 * turns them off.
 */
export async function withoutInterestInvokers(page: Page) {
  await page.addInitScript(() => {
    delete (HTMLButtonElement.prototype as { interestForElement?: unknown }).interestForElement;
    delete (HTMLAnchorElement.prototype as { interestForElement?: unknown }).interestForElement;
    // Chromium acts on the attribute itself, so it comes off as soon as the component sets it.
    new MutationObserver((records) => {
      for (const record of records) {
        const el = record.target as Element;
        if (record.type === "attributes" && el.hasAttribute("interestfor")) el.removeAttribute("interestfor");
      }
    }).observe(document, { subtree: true, attributes: true, attributeFilter: ["interestfor"] });
  });
}
