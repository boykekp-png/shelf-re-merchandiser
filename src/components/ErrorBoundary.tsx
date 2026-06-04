/**
 * EN: ErrorBoundary — React error boundary component.
 *     Catches JavaScript errors in the component tree.
 *     Silently suppresses errors from browser extensions (e.g. Grammarly)
 *     while re-throwing genuine application errors for Next.js to handle.
 *
 * ID: ErrorBoundary — Komponen error boundary React.
 *     Menangkap error JavaScript di pohon komponen.
 *     Diam-diam menekan error dari ekstensi browser (mis. Grammarly)
 *     sambil melempar ulang error aplikasi yang asli untuk ditangani Next.js.
 */

"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  isExtensionError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, isExtensionError: false };
  }

  // EN: Determine if error came from a browser extension / ID: Tentukan apakah error berasal dari ekstensi browser
  static getDerivedStateFromError(error: Error): State {
    const isExtensionError =
      error.stack?.includes("chrome-extension://") ?? false;

    return { hasError: true, isExtensionError };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (this.state.isExtensionError) {
      // EN: Silently ignore browser extension errors / ID: Diam-diam abaikan error ekstensi browser
      return;
    }
    // EN: Log real app errors / ID: Catat error aplikasi yang asli
    console.error("Application error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.state.isExtensionError) {
        // EN: Return null to suppress the error overlay for extension errors / ID: Kembalikan null untuk menekan overlay error dari ekstensi
        return null;
      }
      // EN: Let Next.js handle real errors / ID: Biarkan Next.js menangani error asli
      throw new Error("Unhandled application error");
    }

    return this.props.children;
  }
}