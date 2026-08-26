export class TableSorter {
  sortKeys = $state({});
  constructor() {}
  sort(data, key) {
    if (this.sortKeys[key]) this.sortKeys[key] = this.sortKeys[key] * -1;
    else this.sortKeys[key] = 1;
    data.sort((a, b) => {
      return this.sortKeys[key] * ((a[key] || 0) > (b[key] || 0) ? 1 : -1);
    });
  }
  sortDirection(key) {
    if (this.sortKeys[key] === 1) return "asc";
    else if (this.sortKeys[key] === -1) return "desc";
    else return null;
  }
  clearKeys() {
    this.sortKeys = {};
  }
}
