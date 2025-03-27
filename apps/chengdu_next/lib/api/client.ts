// import { ApiResponse } from '@/types/api';
import createClient from 'openapi-fetch'
import type { paths } from './schema'

const client = createClient<paths>({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
});

export default client;
