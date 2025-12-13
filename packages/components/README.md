# @holmdigital/components

> Prescriptive, accessible React components for regulatory compliance.

These components are built to automatically solve common accessibility challenges found in regulatory audits. Using them ensures compliance "by default" for many WCAG criteria.

## Installation

```bash
# First, configure npm to use GitHub Package Registry:
npm config set @holmdigital:registry https://npm.pkg.github.com

# Then install:
npm install @holmdigital/components
```

## Usage

```tsx
import { Button, FormField, Heading } from '@holmdigital/components';

function App() {
  return (
    <form>
      <Heading level={1}>Contact Us</Heading>
      <FormField 
        label="Email Address" 
        type="email" 
        required 
        autoComplete="email" 
        helpText="We'll never share your email."
      />
      
      <Button variant="primary" type="submit">
        Submit
      </Button>
    </form>
  );
}
```

## Compliance Features

- **High Contrast**: Default styles meet WCAG AA requirements.
- **Keyboard Navigation**: Full focus management and visible focus indicators.
- **Screen Reader Support**: Correct ARIA attributes and labels built-in.

## License

MIT © Holm Digital AB
