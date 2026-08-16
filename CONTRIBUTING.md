# Contributing Guidelines

Thank you for contributing to the Predictive Maintenance & Machine Health Monitoring Platform.

## Workflow
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/my-feature`).
3. Ensure backend unit tests pass: `python -m pytest backend/tests/`.
4. Ensure frontend builds cleanly: `npm run build` in `frontend/`.
5. Commit with descriptive messages.
6. Open a Pull Request.

## Code Standards
- Adhere to PEP 8 style guidelines for Python code.
- Use TypeScript strict mode and Tailwind utility classes for UI components.
- Do not commit secrets, environment variables, or temporary binaries.
