import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Patch DOM methods to prevent Google Translate from crashing React.
// Google Translate wraps text nodes in <font> elements, which breaks
// React's DOM reconciliation (removeChild / insertBefore errors).
if (typeof Node === "function" && Node.prototype) {
  const origRemoveChild = Node.prototype.removeChild;
  // @ts-ignore – intentional override
  Node.prototype.removeChild = function <T extends Node>(child: T): T {
    if (child.parentNode !== this) {
      // Google Translate moved this node; skip React's stale removal
      return child;
    }
    return origRemoveChild.call(this, child) as T;
  };

  const origInsertBefore = Node.prototype.insertBefore;
  // @ts-ignore – intentional override
  Node.prototype.insertBefore = function <T extends Node>(newNode: T, refNode: Node | null): T {
    if (refNode && refNode.parentNode !== this) {
      // Reference node was moved by Google Translate; append instead
      return origInsertBefore.call(this, newNode, null) as T;
    }
    return origInsertBefore.call(this, newNode, refNode) as T;
  };
}

createRoot(document.getElementById("root")!).render(<App />);
