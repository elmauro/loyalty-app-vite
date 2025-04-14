import '@testing-library/jest-dom';

import { TextEncoder } from 'util';

(globalThis as any).TextEncoder = TextEncoder;