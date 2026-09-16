## 2023-10-27 - [Export Data Leak]
**Vulnerability:** Secrets were scrubbed from local save but leaked into the downloaded `.harbor.json` project file because `exportProject` serialized the raw in-memory project directly.
**Learning:** Always deep clone and strip sensitive state before serializing and downloading user project data, similar to how persistence to disk is handled.
**Prevention:** Follow a pattern of explicit stripping, like iterating over variables checking `variable.secret` and assigning an empty string before generating the blob.
