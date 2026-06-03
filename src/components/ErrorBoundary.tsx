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

  static getDerivedStateFromError(error: Error): State {
    const isExtensionError =
      error.stack?.includes("chrome-extension://") ?? false;

    return { hasError: true, isExtensionError };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (this.state.isExtensionError) {
      // Silently ignore browser extension errors
      return;
    }
    // Log real app errors
    console.error("Application error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.state.isExtensionError) {
        // Return null to suppress the error overlay for extension errors
        return null;
      }
      // Still let Next.js handle real errors
      throw new Error("Unhandled application error");
    }

    return this.props.children;
  }
}