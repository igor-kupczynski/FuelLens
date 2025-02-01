import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders the header', () => {
    render(<App />)
    // Using the role selector for better accessibility testing
    const header = screen.getByRole('heading', { name: /fuellens/i })
    expect(header).toBeInTheDocument()
  })

  it('renders the welcome message', () => {
    render(<App />)
    const welcomeMessage = screen.getByText(/fuellens/i)
    expect(welcomeMessage).toBeInTheDocument()
  })
})
