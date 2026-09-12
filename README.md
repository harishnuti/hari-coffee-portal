# Coffee Portfolio

This portfolio is arranged by the role each item plays rather than by the tool
used to create it.

| Folder | Contents |
| --- | --- |
| `01-Data` | Current coffee-audit data and dated source archives. |
| `02-Research` | Café research and broader Singapore specialty-coffee research. |
| `03-Projects` | Working applications and interactive tools, including Gatekeeper. |
| `04-Publications` | Finished reports, journals, web publications, and site archives. |
| `05-Events` | Material from named events and competitions. |
| `90-Archive` | Superseded root-level exports retained for reference. |

## Working conventions

- Treat `01-Data/Audit-Data/current` as the source of truth for the current audit.
- Work on the newest app release in `03-Projects/Web-App-Gatekeeper/Newrelease`;
  earlier releases remain in that project's archive/history folders.
- Use ISO dates in all new filenames: `YYYY-MM-DD_description_version.ext`.
- Keep generated dependencies out of version control. Each JavaScript project has
  its lockfile, so dependencies can be restored with `npm ci`.
