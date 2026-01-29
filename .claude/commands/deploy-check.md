# Deploy Check

Check if the project is ready for deployment to production or App Store.

## Usage

When asked to perform a deploy check:
1. Verify all dependencies are installed
2. Check for TypeScript errors
3. Ensure build completes successfully
4. Verify iOS build works
5. Check for any TODO comments or incomplete features
6. Verify environment variables are set
7. Check database migrations if needed

## Checklist

- [ ] `npm install` completes without errors
- [ ] `npm run build` succeeds
- [ ] No TypeScript errors
- [ ] iOS sync works: `npm run ios:sync`
- [ ] App Store assets are ready
- [ ] Environment variables configured
- [ ] Database schema is up to date
