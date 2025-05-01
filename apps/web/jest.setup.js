// jest.setup.js
// Optional: configure or set up a testing framework before each test
// Used for things like setting up DOM environment, extending expect, etc.

// Learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

// If you need to mock global objects or functions, you can do it here
// Example: Mocking matchMedia for components that use it
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver, often needed for UI component libraries
global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}));

