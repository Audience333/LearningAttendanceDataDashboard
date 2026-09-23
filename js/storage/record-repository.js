(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.LearningDashboard = root.LearningDashboard || {};
  root.LearningDashboard.RecordRepository = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  class StorageWriteError extends Error {
    constructor(cause) {
      super("无法保存学习记录，请检查浏览器存储空间");
      this.name = "StorageWriteError";
      this.cause = cause;
    }
  }

  class RecordNotFoundError extends Error {
    constructor(id) {
      super(`未找到记录：${id}`);
      this.name = "RecordNotFoundError";
    }
  }

  class StorageCorruptError extends Error {
    constructor() {
      super("本地数据结构异常，请先恢复或清空数据");
      this.name = "StorageCorruptError";
    }
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function createRecordRepository(storage, config) {
    function emptyState(initializedWithDemoData = false) {
      return {
        version: config.storageVersion,
        initializedWithDemoData,
        records: []
      };
    }

    function load() {
      const raw = storage.getItem(config.storageKey);
      if (raw === null) return { status: "empty", ...emptyState(false) };

      try {
        const value = JSON.parse(raw);
        const valid = value
          && value.version === config.storageVersion
          && Array.isArray(value.records);
        if (!valid) throw new TypeError("invalid storage schema");
        return {
          status: "ok",
          version: value.version,
          initializedWithDemoData: Boolean(value.initializedWithDemoData),
          records: clone(value.records)
        };
      } catch (error) {
        return {
          status: "corrupt",
          ...emptyState(false),
          rawBackup: raw
        };
      }
    }

    function save(state) {
      const payload = {
        version: config.storageVersion,
        initializedWithDemoData: Boolean(state.initializedWithDemoData),
        records: clone(state.records)
      };
      try {
        storage.setItem(config.storageKey, JSON.stringify(payload));
      } catch (error) {
        throw new StorageWriteError(error);
      }
      return clone(payload);
    }

    function editableState() {
      const state = load();
      if (state.status === "corrupt") throw new StorageCorruptError();
      return {
        version: config.storageVersion,
        initializedWithDemoData: state.initializedWithDemoData,
        records: state.records
      };
    }

    function list() {
      return load().records;
    }

    function add(record) {
      const state = editableState();
      state.records.push(clone(record));
      save(state);
      return clone(record);
    }

    function update(id, changes) {
      const state = editableState();
      const index = state.records.findIndex(record => record.id === id);
      if (index < 0) throw new RecordNotFoundError(id);
      state.records[index] = { ...state.records[index], ...clone(changes), id };
      save(state);
      return clone(state.records[index]);
    }

    function remove(id) {
      const state = editableState();
      const nextRecords = state.records.filter(record => record.id !== id);
      if (nextRecords.length === state.records.length) return false;
      state.records = nextRecords;
      save(state);
      return true;
    }

    function clear() {
      save(emptyState(false));
    }

    function seed(records) {
      return save({
        version: config.storageVersion,
        initializedWithDemoData: true,
        records
      });
    }

    return { load, save, list, add, update, remove, clear, seed };
  }

  return {
    createRecordRepository,
    StorageWriteError,
    RecordNotFoundError,
    StorageCorruptError
  };
});
