'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.getPaginationOptions = void 0;
const getPaginationOptions = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.max(1, Math.min(1000, parseInt(query.limit) || 10));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};
exports.getPaginationOptions = getPaginationOptions;
//# sourceMappingURL=pagination.js.map
