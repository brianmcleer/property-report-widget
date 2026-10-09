// EB 1.21's widget bootstrap uses --ignore-workspace. pnpm 11 also ignores
// package.json#pnpm overrides, so enforce jsPDF's patched optional dependency
// here, where both isolated and workspace installs read it.
module.exports = {
  hooks: {
    readPackage (pkg) {
      if (pkg.name === 'jspdf') {
        pkg.optionalDependencies = {
          ...pkg.optionalDependencies,
          dompurify: '^3.4.16'
        }
      }
      return pkg
    }
  }
}
