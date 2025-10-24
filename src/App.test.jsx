import { test, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

test('renders and increments counter', () => {
  render(<App />);
  const btn = screen.getByRole('button');
  expect(btn).toHaveTextContent('Count is 0');
  fireEvent.click(btn);
  expect(btn).toHaveTextContent('Count is 1');
  expect(screen.getByTestId('health')).toHaveTextContent('UP');
});
