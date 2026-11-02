export const isAuthRoute = (path) => {
    return ["/", "/forgot-password", "/maintenance"].includes(path);
  };