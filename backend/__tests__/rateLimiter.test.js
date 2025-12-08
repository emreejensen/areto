import { describe, it, expect, beforeEach, vi } from 'vitest';
import rateLimiter from '../src/middleware/rateLimiter.js';

// Mock the upstash config
vi.mock('../src/config/upstash.js', () => ({
  default: {
    limit: vi.fn(),
  },
}));

import ratelimit from '../src/config/upstash.js';

describe('Rate Limiter Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
    vi.clearAllMocks();
  });

  it('should call next() when rate limit is not exceeded', async () => {
    ratelimit.limit.mockResolvedValue({ success: true });

    await rateLimiter(req, res, next);

    expect(ratelimit.limit).toHaveBeenCalledWith('my-rate-limit');
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('should return 429 when rate limit is exceeded', async () => {
    ratelimit.limit.mockResolvedValue({ success: false });

    await rateLimiter(req, res, next);

    expect(ratelimit.limit).toHaveBeenCalledWith('my-rate-limit');
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Too many requests, please try again later.',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next with error when rate limit check fails', async () => {
    const error = new Error('Rate limit service error');
    ratelimit.limit.mockRejectedValue(error);

    await rateLimiter(req, res, next);

    expect(ratelimit.limit).toHaveBeenCalledWith('my-rate-limit');
    expect(next).toHaveBeenCalledWith(error);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('should handle multiple requests correctly', async () => {
    // First request succeeds
    ratelimit.limit.mockResolvedValueOnce({ success: true });
    await rateLimiter(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);

    // Reset mocks
    vi.clearAllMocks();

    // Second request exceeds limit
    ratelimit.limit.mockResolvedValueOnce({ success: false });
    await rateLimiter(req, res, next);
    expect(res.status).toHaveBeenCalledWith(429);
    expect(next).not.toHaveBeenCalled();
  });
});