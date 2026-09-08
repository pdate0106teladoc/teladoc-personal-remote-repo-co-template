import { vi, describe, it, expect, beforeEach } from 'vitest';
import * as ReactDOM from 'react-dom/client';
import { StrictMode } from 'react';
import App from './App';

// Create a mock root element
const mockRoot = document.createElement('div');
mockRoot.id = 'root';
document.body.appendChild(mockRoot);

// Mock createRoot and render
const renderMock = vi.fn();
const createRootMock = vi.fn(() => ({
  render: renderMock,
}));

vi.mock('react-dom/client', async () => {
  const actual = await vi.importActual<typeof ReactDOM>('react-dom/client');
  return {
    ...actual,
    createRoot: createRootMock,
  };
});

describe('main.tsx', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render <App /> inside StrictMode into the #root element', async () => {
    await import('./main.tsx');

    expect(createRootMock).toHaveBeenCalledTimes(1);
    expect(createRootMock).toHaveBeenCalledWith(mockRoot);

    expect(renderMock).toHaveBeenCalledTimes(1);

    const renderedElement = renderMock.mock.calls[0][0];

    expect(renderedElement.type).toBe(StrictMode);
    expect(renderedElement.props.children.type).toBe(App);
  });
});
