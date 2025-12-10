import '@testing-library/jest-dom';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
  }),
  useParams: () => ({
    id: 'test-exam-id',
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => '/exam/test-exam-id',
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock window.fetch
global.fetch = jest.fn();

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

// Mock console methods to reduce noise in tests
const originalError = console.error;
console.error = (...args) => {
  // Suppress specific React warnings in tests
  if (
    args[0]?.includes?.('Warning:') ||
    args[0]?.includes?.('ReactDOM.render')
  ) {
    return;
  }
  originalError.apply(console, args);
};
