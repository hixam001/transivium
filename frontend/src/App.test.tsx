import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import App from './App'

test('the application entry is accessible', () => {
  render(<App />)
  expect(screen.getByRole('heading', { name: 'Transivium' })).toBeInTheDocument()
})
