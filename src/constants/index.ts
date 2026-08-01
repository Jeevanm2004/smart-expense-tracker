import path from 'path';

export enum NodeEnv {
  TEST = 'test',
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
}

export enum CorsMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  OPTIONS = 'OPTIONS',
}

export enum HeaderKey {
  CONTENT_TYPE = 'Content-Type',
  CONTENT_DISPOSITION = 'Content-Disposition',
  AUTHORIZATION = 'Authorization',
}

export enum HeaderValue {
  TEXT_CSV = 'text/csv',
  CSV_ATTACHMENT = 'attachment; filename=expenses-export.csv',
}

export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}

export enum ErrorResponse {
  BAD_REQUEST = 'Bad Request',
  NOT_FOUND = 'Not Found',
  VALIDATION_FAILED = 'Validation Failed',
  INTERNAL_SERVER_ERROR = 'Internal Server Error',
}

export const APP_CONFIG = {
  DEFAULT_PORT: 5001,
  REQUEST_SIZE_LIMIT: '10kb',
  CORS: {
    METHODS: [CorsMethod.GET, CorsMethod.POST, CorsMethod.PUT, CorsMethod.DELETE, CorsMethod.OPTIONS],
    HEADERS: [HeaderKey.CONTENT_TYPE, HeaderKey.AUTHORIZATION],
    DEFAULT_ORIGINS: [
      'http://localhost:3000',
      'http://localhost:5001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5001',
    ],
  },
  ENCODING_UTF8: 'utf8' as const,
};

export const ROUTES = {
  HEALTH: '/health',
  EXPENSES: '/expenses',
  API_DOCS: '/api-docs',
  SUB_ROUTES: {
    TOTAL: '/total',
    MONTHLY_SUMMARY: '/monthly-summary',
    EXPORT_CSV: '/export/csv',
    ROOT: '/',
    ID: '/:id',
  },
};

export const STORAGE = {
  DATA_FILE: path.join(process.cwd(), 'src/data/expenses.json'),
  TEMP_FILE: path.join(process.cwd(), 'src/data/expenses.json.tmp'),
  DEFAULT_CATEGORY: 'Other',
  ALL_CATEGORIES: 'All',
  CSV_HEADERS: ['ID', 'Title', 'Amount', 'Category', 'Date'],
  PAGINATION: {
    MIN_PAGE: 1,
    MIN_LIMIT: 1,
    MAX_LIMIT: 100,
    DEFAULT_LIMIT: 50,
  },
};

export const VALIDATION = {
  TITLE: {
    MAX_LENGTH: 150,
    REQUIRED_MSG: 'title is required and must be a non-empty string.',
    TOO_LONG_MSG: 'title cannot exceed 150 characters.',
    MUST_BE_STRING_MSG: 'title must be a non-empty string.',
  },
  AMOUNT: {
    REQUIRED_MSG: 'amount is required.',
    TYPE_MSG: 'amount must be a JSON number, not a string. Send: {"amount": 45.50} not {"amount": "45.50"}.',
    POSITIVE_MSG: 'amount must be a positive number greater than 0.',
  },
  CATEGORY: {
    MAX_LENGTH: 50,
    REQUIRED_MSG: 'category is required and must be a non-empty string.',
    TOO_LONG_MSG: 'category cannot exceed 50 characters.',
    MUST_BE_STRING_MSG: 'category must be a non-empty string.',
  },
  DATE: {
    REQUIRED_MSG: 'date is required and must be a valid date in YYYY-MM-DD format.',
    INVALID_MSG: 'date must be a valid date in YYYY-MM-DD format.',
    START_DATE_INVALID: 'startDate must be a valid date in YYYY-MM-DD format.',
    END_DATE_INVALID: 'endDate must be a valid date in YYYY-MM-DD format.',
  },
  ID: {
    REQUIRED_MSG: 'Expense ID parameter is required.',
  },
  JSON_SYNTAX: {
    INVALID_PAYLOAD: 'Invalid JSON payload syntax in request body.',
  },
};

export const COMMON_STRINGS = {
  STATUS_OK: 'OK',
  EMPTY_STRING: '',
  COMMA: ',',
  NEWLINE: '\n',
  DOUBLE_QUOTE: '"',
  EMPTY_QUOTE: '""',
  SINGLE_QUOTE: "'",
  DATE_SEPARATOR: '-',
  HTML_TYPE: 'html',
  INDEX_HTML: 'index.html',
  NONE: 'None',
  UNEXPECTED_ERROR: 'An unexpected error occurred.',
  LOGS: {
    UNHANDLED_SERVER_ERROR: 'Unhandled Server Error:',
    API_RUNNING: '🚀 Smart Expense Tracker API server running on http://localhost:',
    SWAGGER_DOCS: '📚 Swagger API Docs available at http://localhost:',
  },
};
