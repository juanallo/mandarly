import nextConfig from 'eslint-config-next';

const eslintConfig = [
  ...nextConfig,
  {
    ignores: [
      // Dependencies
      'node_modules/',
      // Build outputs
      '.next/',
      'out/',
      'dist/',
      'build/',
      // Database files
      '.data/',
      '**/*.db',
      '**/*.db-journal',
      // Testing coverage
      'coverage/',
      // Generated files
      '**/*.tsbuildinfo',
      'next-env.d.ts',
      // IDE
      '.vscode/',
      '.idea/',
    ],
  },
];

export default eslintConfig;
